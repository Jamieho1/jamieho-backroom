-- TKT-52: profiles with a database-decided role, a sign-in log, and RLS on every table.
-- Supabase gives anon/authenticated broad table grants by default; RLS (plus explicit revokes) is the guard.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- Settings that must not live in git (e.g. owner_email) are seeded with SQL, outside migrations.
create table private.settings (
  key text primary key,
  value text not null
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  role text not null default 'member' check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  last_seen_at timestamptz
);
alter table public.profiles enable row level security;

create table public.signins (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  at timestamptz not null default now()
);
create index signins_user_at on public.signins (user_id, at desc);
alter table public.signins enable row level security;

-- Clients never write these tables directly; only the functions below do.
revoke insert, update, delete, truncate on public.profiles, public.signins from anon, authenticated;

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner');
$$;

-- A new auth user gets a profile. Owner only when the email matches private.settings.owner_email
-- and the provider confirmed it (Google does). Everyone else is a member.
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (
    new.id,
    coalesce(new.email, ''),
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url',
    case
      when new.email_confirmed_at is not null
       and lower(new.email) = lower((select s.value from private.settings s where s.key = 'owner_email'))
      then 'owner' else 'member'
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- Called by the app right after sign-in.
create or replace function public.record_signin()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not signed in' using errcode = '42501';
  end if;
  insert into public.signins (user_id) values (auth.uid());
  update public.profiles set last_seen_at = now() where id = auth.uid();
end;
$$;

revoke execute on function public.record_signin() from public, anon;
grant execute on function public.record_signin() to authenticated;
revoke execute on function public.is_owner() from public, anon;
grant execute on function public.is_owner() to authenticated;

create policy "profiles: read own, owner reads all"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.is_owner()));

create policy "signins: owner only"
  on public.signins for select to authenticated
  using ((select public.is_owner()));

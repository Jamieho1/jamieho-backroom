-- TKT-53: the app registry (drives desktop icons and the Projects page), per-app visibility, and the invite list.

create table public.apps (
  id text primary key check (id ~ '^[a-z0-9][a-z0-9-]{0,39}$'),
  name text not null check (length(name) between 1 and 60),
  icon text not null default '',
  kind text not null default 'internal' check (kind in ('internal', 'external')),
  url text not null,
  visibility text not null default 'signed_in' check (visibility in ('public', 'signed_in', 'invite_only', 'owner_only')),
  screenshots text[] not null default '{}',
  tags text[] not null default '{}',
  description text not null default '',
  sort int not null default 100,
  -- System apps (Settings) keep their visibility fixed.
  locked boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.apps enable row level security;

create table public.invites (
  email text primary key check (email = lower(email) and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  note text not null default '',
  created_at timestamptz not null default now()
);
alter table public.invites enable row level security;

revoke insert, update, delete, truncate on public.apps, public.invites from anon;
revoke all on public.invites from anon;

-- Is the caller on the invite list? (matched on the email of their own profile)
create or replace function public.is_invited()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p join public.invites i on i.email = lower(p.email)
    where p.id = auth.uid()
  );
$$;

-- The one rule every app's data follows. Data tables call this in their RLS policies.
create or replace function public.can_view_app(p_app text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((
    select case a.visibility
      when 'public' then true
      when 'signed_in' then auth.uid() is not null
      when 'invite_only' then public.is_owner() or public.is_invited()
      else public.is_owner()
    end
    from public.apps a where a.id = p_app
  ), false) or public.is_owner();
$$;

grant execute on function public.can_view_app(text) to anon, authenticated;
revoke execute on function public.is_invited() from public, anon;
grant execute on function public.is_invited() to authenticated;

-- The registry itself is public: the Projects page shows every card (opening one is what's gated).
create policy "apps: anyone reads" on public.apps for select to anon, authenticated using (true);
create policy "apps: owner inserts" on public.apps for insert to authenticated with check ((select public.is_owner()));
create policy "apps: owner updates" on public.apps for update to authenticated
  using ((select public.is_owner())) with check ((select public.is_owner()));
create policy "apps: owner deletes" on public.apps for delete to authenticated using ((select public.is_owner()) and not locked);

create policy "invites: owner reads" on public.invites for select to authenticated using ((select public.is_owner()));
create policy "invites: owner adds" on public.invites for insert to authenticated with check ((select public.is_owner()));
create policy "invites: owner removes" on public.invites for delete to authenticated using ((select public.is_owner()));

-- Locked apps can't change visibility, even by the owner.
create or replace function private.keep_locked_visibility()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.locked and new.visibility is distinct from old.visibility then
    raise exception 'visibility of % is fixed', old.id using errcode = '42501';
  end if;
  new.updated_at := now();
  return new;
end;
$$;
create trigger apps_keep_locked before update on public.apps for each row execute function private.keep_locked_visibility();

insert into public.apps (id, name, icon, kind, url, visibility, tags, description, sort, locked) values
  ('notes', 'Notes', 'notes', 'internal', '/desktop?app=notes', 'signed_in', '{Next.js,Supabase,Markdown}',
   'Coding-interview notes: concept cards, step-by-step visuals and the problems for each pattern.', 10, false),
  ('practice', 'Practice', 'code', 'internal', '/desktop?app=practice', 'signed_in', '{Pyodide,CodeMirror,TypeScript}',
   'A LeetCode-style practice arena that runs Python in your browser, with solutions and visuals.', 20, false),
  ('behavioral', 'Behavioral', 'chat', 'internal', '/desktop?app=behavioral', 'invite_only', '{STAR,Interview prep}',
   'Experience mapped to STAR stories and a behavioural question bank.', 30, false),
  ('settings', 'Settings', 'gear', 'internal', '/settings', 'owner_only', '{}',
   'Site settings: app visibility, invites, inbox and visitors.', 90, true)
on conflict (id) do nothing;

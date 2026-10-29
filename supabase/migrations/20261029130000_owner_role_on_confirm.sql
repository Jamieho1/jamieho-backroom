-- TKT-52 fix: Supabase Auth inserts an OAuth user first and sets email_confirmed_at in a later UPDATE,
-- so deciding the role only on INSERT made the owner a member. Decide it on insert AND whenever the
-- email or its confirmation changes, and fix existing rows.

create or replace function private.role_for(p_email text, p_confirmed timestamptz)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when p_confirmed is not null
     and lower(p_email) = lower((select s.value from private.settings s where s.key = 'owner_email'))
    then 'owner' else 'member'
  end;
$$;

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
    private.role_for(new.email, new.email_confirmed_at)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace function private.handle_user_updated()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
     set email = coalesce(new.email, ''),
         role = private.role_for(new.email, new.email_confirmed_at)
   where id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_updated
  after update of email, email_confirmed_at on auth.users
  for each row execute function private.handle_user_updated();

-- Existing users (e.g. the owner who signed in before this fix).
update public.profiles p
   set role = private.role_for(u.email, u.email_confirmed_at)
  from auth.users u
 where u.id = p.id;

-- TKT-57: contact-form messages. Anyone can send one; only the owner reads, marks or deletes them.
-- Spam limits live in the database so the API can't skip them: 5 per hour per sender (a one-way hash of their IP,
-- set by the site's server and wiped after an hour) and 30 per hour in total.

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(btrim(name)) between 1 and 100),
  email text not null check (length(email) <= 200 and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  need text not null check (length(btrim(need)) between 1 and 4000),
  budget text not null default '' check (length(budget) <= 60),
  ip_hash text check (ip_hash is null or ip_hash ~ '^[0-9a-f]{64}$'),
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index messages_created_at on public.messages (created_at desc);
create index messages_ip_recent on public.messages (ip_hash, created_at) where ip_hash is not null;
alter table public.messages enable row level security;

revoke all on public.messages from anon, authenticated;
grant insert (name, email, need, budget, ip_hash) on public.messages to anon, authenticated;
grant select, delete on public.messages to authenticated;
grant update (read) on public.messages to authenticated;

create policy "messages: anyone sends" on public.messages for insert to anon, authenticated with check (true);
create policy "messages: owner reads" on public.messages for select to authenticated using ((select rls.is_owner()));
create policy "messages: owner marks read" on public.messages for update to authenticated
  using ((select rls.is_owner())) with check ((select rls.is_owner()));
create policy "messages: owner deletes" on public.messages for delete to authenticated using ((select rls.is_owner()));

create or replace function private.guard_message()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  new.created_at := now();
  new.read := false;
  -- Hashes are only for the hourly limit: forget them once they're an hour old.
  update public.messages set ip_hash = null where ip_hash is not null and created_at < now() - interval '1 hour';
  if new.ip_hash is not null and (
    select count(*) from public.messages where ip_hash = new.ip_hash and created_at > now() - interval '1 hour'
  ) >= 5 then
    raise exception 'rate_limited' using errcode = 'P0001', hint = 'Too many messages from this sender in the last hour.';
  end if;
  if (select count(*) from public.messages where created_at > now() - interval '1 hour') >= 30 then
    raise exception 'busy' using errcode = 'P0001', hint = 'Too many messages in the last hour.';
  end if;
  return new;
end;
$$;
revoke execute on function private.guard_message() from public, anon, authenticated;
create trigger messages_guard before insert on public.messages for each row execute function private.guard_message();

-- TKT-59: ops. A GitHub Action (with a service key Jamie stores as a GitHub secret) pings daily and exports weekly,
-- and writes each run's result here so Settings can show it. Only the owner reads; only the service role writes.

create table public.ops_status (
  job text primary key check (job in ('ping', 'export')),
  ran_at timestamptz not null default now(),
  ok boolean not null,
  detail jsonb not null default '{}'::jsonb check (pg_column_size(detail) < 16384)
);
alter table public.ops_status enable row level security;
revoke all on public.ops_status from anon, authenticated;
grant select on public.ops_status to authenticated;
create policy "ops_status: owner reads" on public.ops_status for select to authenticated using ((select rls.is_owner()));

-- Usage numbers for the free-tier banner. Callable by the service role only (not by visitors or signed-in users).
create or replace function public.ops_usage()
returns jsonb language sql stable security invoker set search_path = '' as $$
  select jsonb_build_object(
    'db_bytes', pg_database_size(current_database()),
    'users', (select count(*) from public.profiles),
    'messages', (select count(*) from public.messages),
    'messages_today', (select count(*) from public.messages where created_at > date_trunc('day', now())),
    'messages_month', (select count(*) from public.messages where created_at > date_trunc('month', now()))
  );
$$;
revoke execute on function public.ops_usage() from public, anon, authenticated;
grant execute on function public.ops_usage() to service_role;

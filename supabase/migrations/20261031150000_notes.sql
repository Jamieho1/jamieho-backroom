-- TKT-61: read view for coding notes. Personal content is loaded separately by TKT-63.
create table public.notes (
  id text primary key check (id ~ '^[a-z0-9][a-z0-9-]{0,79}$'),
  title text not null check (length(title) between 1 and 160),
  body text not null default '' check (length(body) <= 200000),
  -- Same array/grid/graph JSON as the artifact; one object or an array of objects.
  visual jsonb not null default '[]'::jsonb check (jsonb_typeof(visual) in ('array', 'object')),
  sort integer not null default 100,
  updated_at timestamptz not null default now()
);
alter table public.notes enable row level security;
revoke all on public.notes from anon, authenticated;
grant select on public.notes to anon, authenticated;
grant insert, update, delete on public.notes to authenticated;

create policy "notes: allowed app viewers read" on public.notes for select to anon, authenticated
  using ((select rls.can_view_app('notes')));
create policy "notes: owner inserts" on public.notes for insert to authenticated
  with check ((select rls.is_owner()));
create policy "notes: owner updates" on public.notes for update to authenticated
  using ((select rls.is_owner())) with check ((select rls.is_owner()));
create policy "notes: owner deletes" on public.notes for delete to authenticated
  using ((select rls.is_owner()));

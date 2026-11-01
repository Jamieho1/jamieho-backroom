-- Owner's private review list. Does not change shared problem/notes access.
create table public.practice_stars (
  problem integer primary key check (problem between 1 and 10000),
  created_at timestamptz not null default now()
);
alter table public.practice_stars enable row level security;
revoke all on public.practice_stars from anon, authenticated;
grant select on public.practice_stars to anon, authenticated;
grant insert, update, delete on public.practice_stars to authenticated;
create policy "stars: owner reads" on public.practice_stars for select to anon, authenticated using ((select rls.can_view_app('practice')) and (select rls.is_owner()));
create policy "stars: owner inserts" on public.practice_stars for insert to authenticated with check ((select rls.is_owner()));
create policy "stars: owner updates" on public.practice_stars for update to authenticated using ((select rls.is_owner())) with check ((select rls.is_owner()));
create policy "stars: owner deletes" on public.practice_stars for delete to authenticated using ((select rls.is_owner()));

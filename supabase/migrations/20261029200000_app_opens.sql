-- TKT-58: which apps each signed-in visitor opened, one row per person, app and day (London time).
-- The desktop (TKT-60) writes these; only the owner reads them, on Settings > Visitors.

create table public.app_opens (
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  app_id text not null references public.apps (id) on delete cascade,
  day date not null default ((now() at time zone 'Europe/London')::date),
  primary key (user_id, app_id, day)
);
create index app_opens_app on public.app_opens (app_id);
alter table public.app_opens enable row level security;

revoke all on public.app_opens from anon, authenticated;
grant insert (app_id) on public.app_opens to authenticated; -- who and when come from the defaults, not the client
grant select on public.app_opens to authenticated;

create policy "app_opens: record your own, for apps you can open" on public.app_opens for insert to authenticated
  with check (user_id = (select auth.uid()) and rls.can_view_app(app_id));
create policy "app_opens: owner reads" on public.app_opens for select to authenticated using ((select rls.is_owner()));

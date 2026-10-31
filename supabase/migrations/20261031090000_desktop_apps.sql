-- TKT-60: caller-scoped launcher rows without exposing invite lists or policy helpers.
create view public.desktop_apps with (security_invoker = true) as
  select a.* from public.apps a
  where auth.uid() is not null and rls.can_view_app(a.id);
revoke all on public.desktop_apps from public, anon, authenticated;
grant select on public.desktop_apps to authenticated;

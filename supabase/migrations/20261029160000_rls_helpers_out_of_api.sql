-- Jamie 2026-10-29: "people shouldn't call through the API themselves". Policy helpers move from the
-- API-exposed `public` schema into `rls`, which PostgREST does not expose. Policies can still use them.
-- Only public.record_signin() stays callable: the app calls it after sign-in.

create schema if not exists rls;
revoke all on schema rls from public;
grant usage on schema rls to anon, authenticated;

create or replace function rls.is_owner()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner');
$$;

create or replace function rls.is_invited()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles p join public.invites i on i.email = lower(p.email)
    where p.id = auth.uid()
  );
$$;

create or replace function rls.can_view_app(p_app text)
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce((
    select case a.visibility
      when 'public' then true
      when 'signed_in' then auth.uid() is not null
      when 'invite_only' then rls.is_owner() or rls.is_invited()
      else rls.is_owner()
    end
    from public.apps a where a.id = p_app
  ), false) or rls.is_owner();
$$;

revoke all on function rls.is_owner(), rls.is_invited(), rls.can_view_app(text) from public;
grant execute on function rls.is_owner(), rls.is_invited(), rls.can_view_app(text) to anon, authenticated;

-- Re-point every policy at the rls.* helpers (ALTER POLICY: no drop, no gap in protection).
alter policy "profiles: read own, owner reads all" on public.profiles
  using (id = (select auth.uid()) or (select rls.is_owner()));
alter policy "signins: owner only" on public.signins using ((select rls.is_owner()));
alter policy "apps: owner inserts" on public.apps with check ((select rls.is_owner()));
alter policy "apps: owner updates" on public.apps using ((select rls.is_owner())) with check ((select rls.is_owner()));
alter policy "apps: owner deletes" on public.apps using ((select rls.is_owner()) and not locked);
alter policy "invites: owner reads" on public.invites using ((select rls.is_owner()));
alter policy "invites: owner adds" on public.invites with check ((select rls.is_owner()));
alter policy "invites: owner removes" on public.invites using ((select rls.is_owner()));

-- The old public copies are no longer used by any policy: make them uncallable over the API.
revoke execute on function public.can_view_app(text), public.is_invited(), public.is_owner() from public, anon, authenticated;

-- Supabase creates public.rls_auto_enable() for its "enable RLS on new tables" event trigger. It sits in the
-- exposed schema, so the API lets anyone call it. Only the event trigger needs it: block API callers.
do $$
begin
  if exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
             where n.nspname = 'public' and p.proname = 'rls_auto_enable') then
    execute 'revoke execute on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end;
$$;

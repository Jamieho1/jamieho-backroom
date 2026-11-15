-- TKT-124: open Interview entry points without publishing private legacy content.
-- Apply the policy protections and registry change atomically.
begin;

alter policy "notes: allowed app viewers read" on public.notes
  to authenticated using ((select auth.uid()) is not null and (select rls.can_view_app('notes')));

alter policy "stories: app readers" on public.behavioral_stories
  using ((select rls.is_owner()));
alter policy "answers: app readers" on public.behavioral_answers
  using ((select rls.is_owner()));
alter policy "experience_items: public or behavioral" on public.experience_items
  using (public or (select rls.is_owner()));
alter policy "experience_bullets: public or behavioral" on public.experience_bullets
  using ((public and exists (select 1 from public.experience_items i where i.id = item_id and i.public))
    or (select rls.is_owner()));

update public.apps set visibility='public' where id in ('notes','practice','behavioral');

-- Own-row practice, resume and Interview Behavioral policies are unchanged.
commit;

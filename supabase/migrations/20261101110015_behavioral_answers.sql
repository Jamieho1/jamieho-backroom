-- TKT-68: generic questions stay in code; personal answer preparation stays here.
create table public.behavioral_answers (
  question_id text primary key check (question_id ~ '^[a-z0-9-]{1,80}$'),
  primary_story_id uuid references public.behavioral_stories(id) on delete set null,
  secondary_story_id uuid references public.behavioral_stories(id) on delete set null,
  outline text not null default '' check (length(outline) <= 20000),
  followups text not null default '' check (length(followups) <= 10000),
  updated_at timestamptz not null default now(),
  check (primary_story_id is null or secondary_story_id is null or primary_story_id <> secondary_story_id)
);
create index behavioral_answers_primary on public.behavioral_answers(primary_story_id);
create index behavioral_answers_secondary on public.behavioral_answers(secondary_story_id);
alter table public.behavioral_answers enable row level security;
revoke all on public.behavioral_answers from anon, authenticated;
grant select on public.behavioral_answers to anon, authenticated;
grant insert, update, delete on public.behavioral_answers to authenticated;
create policy "answers: app readers" on public.behavioral_answers for select to anon, authenticated using ((select rls.can_view_app('behavioral')));
create policy "answers: owner inserts" on public.behavioral_answers for insert to authenticated with check ((select rls.is_owner()));
create policy "answers: owner updates" on public.behavioral_answers for update to authenticated using ((select rls.is_owner())) with check ((select rls.is_owner()));
create policy "answers: owner deletes" on public.behavioral_answers for delete to authenticated using ((select rls.is_owner()));
create trigger behavioral_answers_touch before update on public.behavioral_answers for each row execute function private.touch_updated_at();

-- TKT-67: STAR stories share Experience bullets, but are never public CV data.
create table public.behavioral_stories (
  id uuid primary key default gen_random_uuid(),
  bullet_id uuid references public.experience_bullets(id) on delete set null,
  title text not null check (length(title) between 1 and 160),
  situation text not null default '' check (length(situation) <= 20000),
  task text not null default '' check (length(task) <= 20000),
  action text not null default '' check (length(action) <= 20000),
  result text not null default '' check (length(result) <= 20000),
  skills text not null default '' check (length(skills) <= 1000),
  numbers text not null default '' check (length(numbers) <= 2000),
  updated_at timestamptz not null default now()
);
create index behavioral_stories_bullet on public.behavioral_stories(bullet_id);
alter table public.behavioral_stories enable row level security;
revoke all on public.behavioral_stories from anon, authenticated;
grant select on public.behavioral_stories to anon, authenticated;
grant insert, update, delete on public.behavioral_stories to authenticated;
create policy "stories: app readers" on public.behavioral_stories for select to anon, authenticated using ((select rls.can_view_app('behavioral')));
create policy "stories: owner inserts" on public.behavioral_stories for insert to authenticated with check ((select rls.is_owner()));
create policy "stories: owner updates" on public.behavioral_stories for update to authenticated using ((select rls.is_owner())) with check ((select rls.is_owner()));
create policy "stories: owner deletes" on public.behavioral_stories for delete to authenticated using ((select rls.is_owner()));
create trigger behavioral_stories_touch before update on public.behavioral_stories for each row execute function private.touch_updated_at();

-- Split the existing owner ALL policies while touching the Experience relationship.
drop policy "experience_items: owner writes" on public.experience_items;
drop policy "experience_bullets: owner writes" on public.experience_bullets;
create policy "experience_items: owner inserts" on public.experience_items for insert to authenticated with check ((select rls.is_owner()));
create policy "experience_items: owner updates" on public.experience_items for update to authenticated using ((select rls.is_owner())) with check ((select rls.is_owner()));
create policy "experience_items: owner deletes" on public.experience_items for delete to authenticated using ((select rls.is_owner()));
create policy "experience_bullets: owner inserts" on public.experience_bullets for insert to authenticated with check ((select rls.is_owner()));
create policy "experience_bullets: owner updates" on public.experience_bullets for update to authenticated using ((select rls.is_owner())) with check ((select rls.is_owner()));
create policy "experience_bullets: owner deletes" on public.experience_bullets for delete to authenticated using ((select rls.is_owner()));
-- Registry was seeded invite-only. Preserve any later owner visibility choice.

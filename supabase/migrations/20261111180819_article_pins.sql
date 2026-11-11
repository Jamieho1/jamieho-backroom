-- Personal article bookmarks: readers manage only their own pins, never article content.
create table public.article_pins (
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 article_id uuid not null references public.articles(id) on delete cascade,
 created_at timestamptz not null default now(),
 primary key (user_id, article_id)
);
create index article_pins_article on public.article_pins(article_id);
alter table public.article_pins enable row level security;
revoke all on public.article_pins from public, anon, authenticated;
grant select, insert, delete on public.article_pins to authenticated;
grant select on public.article_pins to service_role;
create policy "pins: own reads" on public.article_pins for select to authenticated
 using ((select auth.uid()) = user_id);
create policy "pins: own accessible published inserts" on public.article_pins for insert to authenticated
 with check ((select auth.uid()) = user_id and exists (
  select 1 from public.articles a where a.id = article_id and a.published
 ));
create policy "pins: own deletes" on public.article_pins for delete to authenticated
 using ((select auth.uid()) = user_id);

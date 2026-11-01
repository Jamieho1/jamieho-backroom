-- Public reference articles; drafts and all writes are owner-only.
insert into public.apps(id,name,icon,kind,url,visibility,tags,description,sort,locked)
values ('articles','Articles','articles','internal','/articles','public','{References,Writing}','Extra references and reading for videos and posts.',35,true);
create table public.articles (
 id uuid primary key default gen_random_uuid(),
 slug text not null unique check (length(slug)<=80 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and slug not in ('manage','new','edit')),
 title text not null check (length(title) between 1 and 160),
 summary text not null default '' check(length(summary)<=600),
 body text not null default '' check(length(body)<=200000),
 platform text not null default 'other' check(platform in ('youtube','instagram','other')),
 source_url text not null default '' check(source_url='' or (source_url ~ '^https://' and length(source_url)<=2048)),
 published boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index articles_public_time on public.articles(published,created_at desc);
alter table public.articles enable row level security;
revoke all on public.articles from anon,authenticated;
grant select on public.articles to anon,authenticated;
grant insert,update,delete on public.articles to authenticated;
create policy "articles: published or owner reads" on public.articles for select to anon,authenticated using ((select rls.can_view_app('articles')) and (published or (select rls.is_owner())));
create policy "articles: owner inserts" on public.articles for insert to authenticated with check ((select rls.is_owner()));
create policy "articles: owner updates" on public.articles for update to authenticated using ((select rls.is_owner())) with check ((select rls.is_owner()));
create policy "articles: owner deletes" on public.articles for delete to authenticated using ((select rls.is_owner()));
create trigger articles_touch before update on public.articles for each row execute function private.touch_updated_at();

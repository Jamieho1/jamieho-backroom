-- Guides (2026-11-11): public, evergreen resource pages (e.g. "The MCP Guide") listed under Resources.
-- Separate from articles: articles are the long version of a social post; a guide is the reusable reference
-- many posts point to, with links to its Notion toolkit and an optional Google Doc.
create table public.guides (
 id uuid primary key default gen_random_uuid(),
 slug text not null unique check (length(slug)<=80 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and slug not in ('manage','new','edit')),
 title text not null check (length(title) between 1 and 160),
 summary text not null default '' check (length(summary)<=600),
 body text not null default '' check (length(body)<=200000),
 notion_url text not null default '' check (notion_url='' or (notion_url ~ '^https://' and length(notion_url)<=2048)),
 doc_url text not null default '' check (doc_url='' or (doc_url ~ '^https://' and length(doc_url)<=2048)),
 cover_url text not null default '' check (cover_url='' or (cover_url ~ '^https://' and length(cover_url)<=2048)),
 published boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index guides_public_time on public.guides(published,created_at desc);
alter table public.guides enable row level security;
revoke all on public.guides from anon,authenticated;
grant select on public.guides to anon,authenticated;
grant insert,update,delete on public.guides to authenticated;
create policy "guides: published or owner reads" on public.guides for select to anon,authenticated using (published or (select rls.is_owner()));
create policy "guides: owner inserts" on public.guides for insert to authenticated with check ((select rls.is_owner()));
create policy "guides: owner updates" on public.guides for update to authenticated using ((select rls.is_owner())) with check ((select rls.is_owner()));
create policy "guides: owner deletes" on public.guides for delete to authenticated using ((select rls.is_owner()));
create trigger guides_touch before update on public.guides for each row execute function private.touch_updated_at();

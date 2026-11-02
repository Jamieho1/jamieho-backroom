-- Articles redesign (2026-11-03): four categories, a cover image, RedNote (小红书) as a platform,
-- and an optional link to the project an article belongs to (Building in Public build logs).
alter table public.articles
  add column category text not null default 'ai' check (category in ('ai', 'career', 'productivity', 'building')),
  add column cover_url text not null default '' check (cover_url = '' or (cover_url ~ '^https://' and length(cover_url) <= 2048)),
  add column project_id text references public.apps (id) on delete set null;
alter table public.articles drop constraint articles_platform_check;
alter table public.articles add constraint articles_platform_check check (platform in ('youtube', 'instagram', 'xiaohongshu', 'other'));
create index articles_project on public.articles (project_id) where project_id is not null;
update public.apps set description = 'Writing on AI, career, productivity and building in public.', tags = '{Writing,AI,Career}' where id = 'articles';

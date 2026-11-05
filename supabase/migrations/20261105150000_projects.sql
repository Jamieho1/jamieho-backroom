-- Home v1.1 (TKT-83): portfolio projects, separate from the apps registry (apps stay desktop launchers only).
-- Everyone reads public projects; hidden rows and every write are owner-only. Nothing personal is seeded.
-- A project may have no website yet (url = ''), shown as "Website coming soon".

create or replace function private.all_https(a text[]) returns boolean
language sql immutable set search_path = '' as $$
  select coalesce(bool_and(x ~ '^https://' and length(x) <= 2048), true) from unnest(a) as x
$$;
create or replace function private.short_tags(a text[]) returns boolean
language sql immutable set search_path = '' as $$
  select coalesce(bool_and(length(btrim(x)) between 1 and 24), true) from unnest(a) as x
$$;

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique
    check (length(slug) <= 80 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and slug not in ('new', 'manage', 'edit')),
  name text not null check (length(name) between 1 and 80),
  tagline text not null default '' check (length(tagline) <= 160),
  body text not null default '' check (length(body) <= 50000),
  tags text[] not null default '{}' check (cardinality(tags) <= 8 and private.short_tags(tags)),
  screenshots text[] not null default '{}' check (cardinality(screenshots) <= 6 and private.all_https(screenshots)),
  url text not null default '' check (url = '' or (url ~ '^https://' and length(url) <= 2048)),
  featured boolean not null default false,
  public boolean not null default false,
  sort int not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index projects_listing on public.projects (public, featured desc, sort, created_at desc);
alter table public.projects enable row level security;
revoke all on public.projects from anon, authenticated;
grant select on public.projects to anon, authenticated;
grant insert, update, delete on public.projects to authenticated;
create policy "projects: public or owner reads" on public.projects for select to anon, authenticated
  using (public or (select rls.is_owner()));
create policy "projects: owner inserts" on public.projects for insert to authenticated with check ((select rls.is_owner()));
create policy "projects: owner updates" on public.projects for update to authenticated
  using ((select rls.is_owner())) with check ((select rls.is_owner()));
create policy "projects: owner deletes" on public.projects for delete to authenticated using ((select rls.is_owner()));
create trigger projects_touch before update on public.projects for each row execute function private.touch_updated_at();

-- Project screenshots: a public-read Storage bucket like article-images; only the owner uploads, replaces or deletes.
-- Guarded so the PGlite test database (which has no storage schema) skips it.
do $$
begin
  if exists (select 1 from pg_namespace where nspname = 'storage') then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values ('project-media', 'project-media', true, 5242880, array['image/png', 'image/jpeg', 'image/webp'])
    on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
    execute $p$create policy "project media: owner uploads" on storage.objects for insert to authenticated
      with check (bucket_id = 'project-media' and (select rls.is_owner()))$p$;
    execute $p$create policy "project media: owner lists" on storage.objects for select to authenticated
      using (bucket_id = 'project-media' and (select rls.is_owner()))$p$;
    execute $p$create policy "project media: owner replaces" on storage.objects for update to authenticated
      using (bucket_id = 'project-media' and (select rls.is_owner())) with check (bucket_id = 'project-media' and (select rls.is_owner()))$p$;
    execute $p$create policy "project media: owner deletes" on storage.objects for delete to authenticated
      using (bucket_id = 'project-media' and (select rls.is_owner()))$p$;
  end if;
end $$;

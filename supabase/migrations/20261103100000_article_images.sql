-- Article pictures (2026-11-03): a public-read Supabase Storage bucket; only the owner uploads, replaces or deletes.
-- Guarded so the PGlite test database (which has no storage schema) skips it.
do $$
begin
  if exists (select 1 from pg_namespace where nspname = 'storage') then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values ('article-images', 'article-images', true, 5242880, array['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
    on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
    execute $p$create policy "article images: owner uploads" on storage.objects for insert to authenticated
      with check (bucket_id = 'article-images' and (select rls.is_owner()))$p$;
    execute $p$create policy "article images: owner lists" on storage.objects for select to authenticated
      using (bucket_id = 'article-images' and (select rls.is_owner()))$p$;
    execute $p$create policy "article images: owner replaces" on storage.objects for update to authenticated
      using (bucket_id = 'article-images' and (select rls.is_owner())) with check (bucket_id = 'article-images' and (select rls.is_owner()))$p$;
    execute $p$create policy "article images: owner deletes" on storage.objects for delete to authenticated
      using (bucket_id = 'article-images' and (select rls.is_owner()))$p$;
  end if;
end $$;

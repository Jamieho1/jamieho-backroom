-- Home journey media (TKT-75, 2026-11-04): a public-read Supabase Storage bucket for the encoded clips, posters and
-- library layers. Only the owner uploads, replaces or deletes; anyone can read (the homepage is public).
-- Guarded so the PGlite test database (which has no storage schema) skips it.
do $$
begin
  if exists (select 1 from pg_namespace where nspname = 'storage') then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values ('home-media', 'home-media', true, 15728640, array['video/mp4', 'video/webm', 'image/jpeg', 'image/png', 'image/webp'])
    on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
    execute $p$create policy "home media: owner uploads" on storage.objects for insert to authenticated
      with check (bucket_id = 'home-media' and (select rls.is_owner()))$p$;
    execute $p$create policy "home media: owner lists" on storage.objects for select to authenticated
      using (bucket_id = 'home-media' and (select rls.is_owner()))$p$;
    execute $p$create policy "home media: owner replaces" on storage.objects for update to authenticated
      using (bucket_id = 'home-media' and (select rls.is_owner())) with check (bucket_id = 'home-media' and (select rls.is_owner()))$p$;
    execute $p$create policy "home media: owner deletes" on storage.objects for delete to authenticated
      using (bucket_id = 'home-media' and (select rls.is_owner()))$p$;
  end if;
end $$;

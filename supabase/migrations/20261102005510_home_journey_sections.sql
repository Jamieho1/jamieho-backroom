-- Home journey: two empty owner-editable sections. No personal content is seeded.
-- Existing public reads and owner-only UPDATE RLS/privileges remain unchanged.
alter table public.site_sections drop constraint site_sections_key_check;
alter table public.site_sections add constraint site_sections_key_check
  check (key in ('hero', 'about', 'interests', 'technology', 'writing', 'contact'));

insert into public.site_sections (key, title, body, sort) values
  ('interests', 'Interests', '', 25),
  ('technology', 'Technology', '', 30)
on conflict (key) do nothing;

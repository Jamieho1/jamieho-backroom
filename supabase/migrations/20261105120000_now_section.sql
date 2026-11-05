-- Home v1 room: an owner-editable "Now" section (what Jamie is doing right now), shown in the desk scene.
-- Empty on creation: no personal content is seeded. Public reads and owner-only UPDATE stay unchanged.
alter table public.site_sections drop constraint site_sections_key_check;
alter table public.site_sections add constraint site_sections_key_check
  check (key in ('hero', 'now', 'about', 'interests', 'technology', 'writing', 'contact'));

insert into public.site_sections (key, title, body, sort) values ('now', 'Now', '', 15)
on conflict (key) do nothing;

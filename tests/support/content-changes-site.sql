-- Test fixture only. PL2 (content_changes.site and private.content_change_site) is authored in PassLoop's repo and applied live
-- there; this repo's migrations from 20261125100000 on build on it, so the DB harness creates the same pieces before them.
-- Keep the classification in step with PassLoop's 20261124120000_content_changes_site.sql.
alter table public.content_changes add column site text not null default 'personal' check (site in ('personal','passloop'));
create function private.content_change_site(target text) returns text
language sql immutable set search_path = '' as $$
  select case
    when target in ('notes','question_notes','practice_code','practice_stars','resume_templates',
      'interview_behavioral_themes','interview_behavioral_questions','companies','company_questions',
      'interview_experiences','system_design_questions') then 'passloop'
    when target in ('projects','articles','guides','site_sections','experience_items','experience_bullets',
      'about_photos','behavioral_stories','behavioral_answers') then 'personal'
  end
$$;
revoke all on function private.content_change_site(text) from public, anon, authenticated, service_role;
-- Fixture only: PassLoop's writers set site='passloop' explicitly. The PassLoop-table draft tests that still live in this repo
-- insert without a site, so tag a set 'passloop' when every operation targets a PassLoop table (PL2's backfill rule).
create function private.test_tag_site() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if jsonb_typeof(new.operations) = 'array' and jsonb_array_length(new.operations) > 0 and new.photo_slots = '[]'::jsonb
     and not exists (select 1 from jsonb_array_elements(new.operations) o
       where jsonb_typeof(o.value) is distinct from 'object' or private.content_change_site(o.value->>'table') is distinct from 'passloop') then
    new.site := 'passloop';
  end if;
  return new;
end $$;
create trigger content_changes_test_tag_site before insert on public.content_changes for each row execute function private.test_tag_site();
-- Fixture only: PL2 backfills rows that already exist when the column is added (a seeded all-PassLoop draft stays approvable).
alter table public.content_changes disable trigger content_changes_apply;
update public.content_changes c set site = 'passloop'
where jsonb_array_length(c.operations) > 0 and c.photo_slots = '[]'::jsonb
  and not exists (select 1 from jsonb_array_elements(c.operations) o
    where jsonb_typeof(o.value) is distinct from 'object' or private.content_change_site(o.value->>'table') is distinct from 'passloop');
alter table public.content_changes enable trigger content_changes_apply;

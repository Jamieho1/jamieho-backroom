-- TKT-121. Independent private documents; never seed from experience_items/bullets.
create function private.check_resume_document(document jsonb) returns void
language plpgsql immutable set search_path='' as $$
declare entry jsonb; bullet jsonb; field text; value text; maximum integer; seen text[]:='{}'; bullet_ids text[]; trim_chars text:=chr(9)||chr(10)||chr(11)||chr(12)||chr(13)||chr(32)||chr(160)||chr(5760)||chr(8192)||chr(8193)||chr(8194)||chr(8195)||chr(8196)||chr(8197)||chr(8198)||chr(8199)||chr(8200)||chr(8201)||chr(8202)||chr(8232)||chr(8233)||chr(8239)||chr(8287)||chr(12288)||chr(65279);
 uuid_pattern text:='^([0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$';
begin
 if jsonb_typeof(document) is distinct from 'object' or document-array['entries']::text[]<>'{}'::jsonb or jsonb_typeof(document->'entries') is distinct from 'array' then raise exception 'Resume must contain an entries array.' using errcode='22023'; end if;
 if jsonb_array_length(document->'entries')>60 then raise exception 'At most 60 resume entries.' using errcode='22023'; end if;
 for entry in select x.value from jsonb_array_elements(document->'entries') x loop
  if jsonb_typeof(entry) is distinct from 'object' or entry-array['id','kind','title','org','dates','location','summary','sort','bullets']::text[]<>'{}'::jsonb then raise exception 'Unknown resume entry field.' using errcode='22023'; end if;
  if jsonb_typeof(entry->'id') is distinct from 'string' or (entry->>'id') !~* uuid_pattern or lower(entry->>'id')=any(seen) then raise exception 'Unique entry UUID required.' using errcode='22023'; end if;
  seen:=array_append(seen,lower(entry->>'id'));
  if jsonb_typeof(entry->'kind') is distinct from 'string' or entry->>'kind' not in ('role','project','education','certificate','skills','other') then raise exception 'Invalid resume kind.' using errcode='22023'; end if;
  foreach field in array array['title','org','dates','location','summary'] loop
   if jsonb_typeof(entry->field) is distinct from 'string' then raise exception 'Resume fields must be text.' using errcode='22023'; end if;
   value:=entry->>field;maximum:=case when field in ('dates','location') then 80 when field='summary' then 2000 else 160 end;
   if char_length(value)+char_length(regexp_replace(value,U&'[^\+010000-\+10FFFF]','','g'))>maximum or (field='title' and btrim(value,trim_chars)='') then raise exception 'Resume text is empty or exceeds its limit.' using errcode='22023'; end if;
  end loop;
  if jsonb_typeof(entry->'sort') is distinct from 'number' or (entry->>'sort')::numeric<>trunc((entry->>'sort')::numeric) or (entry->>'sort')::numeric not between 0 and 10000 then raise exception 'Invalid entry order.' using errcode='22023'; end if;
  if jsonb_typeof(entry->'bullets') is distinct from 'array' then raise exception 'Bullets must be an array.' using errcode='22023'; end if;
  if jsonb_array_length(entry->'bullets')>30 then raise exception 'At most 30 bullets per entry.' using errcode='22023'; end if;
  bullet_ids:='{}';
  for bullet in select x.value from jsonb_array_elements(entry->'bullets') x loop
   if jsonb_typeof(bullet) is distinct from 'object' or bullet-array['id','text','sort']::text[]<>'{}'::jsonb then raise exception 'Unknown bullet field.' using errcode='22023'; end if;
   if jsonb_typeof(bullet->'id') is distinct from 'string' or (bullet->>'id') !~* uuid_pattern or lower(bullet->>'id')=any(bullet_ids) then raise exception 'Unique bullet UUID required.' using errcode='22023'; end if;
   bullet_ids:=array_append(bullet_ids,lower(bullet->>'id'));
   if jsonb_typeof(bullet->'text') is distinct from 'string' then raise exception 'Bullet must be text.' using errcode='22023'; end if;
   value:=bullet->>'text';if btrim(value,trim_chars)='' or char_length(value)+char_length(regexp_replace(value,U&'[^\+010000-\+10FFFF]','','g'))>1000 then raise exception 'Bullet text is empty or exceeds its limit.' using errcode='22023'; end if;
   if jsonb_typeof(bullet->'sort') is distinct from 'number' or (bullet->>'sort')::numeric<>trunc((bullet->>'sort')::numeric) or (bullet->>'sort')::numeric not between 0 and 10000 then raise exception 'Invalid bullet order.' using errcode='22023'; end if;
  end loop;
 end loop;
end $$;
revoke all on function private.check_resume_document(jsonb) from public,anon,authenticated,service_role;
create table public.user_resumes(user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,content jsonb not null default '{"entries":[]}',revision integer not null default 1 check(revision between 1 and 2147483647),updated_at timestamptz not null default now());
create table public.resume_templates(key text primary key check(key='default'),title text not null default 'Resume guide',content jsonb not null default '{"entries":[]}',updated_at timestamptz not null default now());
create function private.validate_resume_row() returns trigger language plpgsql security definer set search_path='' as $$
begin
 perform private.check_resume_document(NEW.content);
 if TG_TABLE_NAME='resume_templates' then
  if btrim(NEW.title,chr(9)||chr(10)||chr(11)||chr(12)||chr(13)||chr(32)||chr(160)||chr(5760)||chr(8192)||chr(8193)||chr(8194)||chr(8195)||chr(8196)||chr(8197)||chr(8198)||chr(8199)||chr(8200)||chr(8201)||chr(8202)||chr(8232)||chr(8233)||chr(8239)||chr(8287)||chr(12288)||chr(65279))='' or char_length(NEW.title)+char_length(regexp_replace(NEW.title,U&'[^\+010000-\+10FFFF]','','g'))>160 then raise exception 'Template title is empty or exceeds its limit.' using errcode='22023'; end if;
 end if;
 NEW.updated_at:=clock_timestamp();return NEW;
end $$;
revoke all on function private.validate_resume_row() from public,anon,authenticated,service_role;
create trigger validate_user_resume before insert or update on public.user_resumes for each row execute function private.validate_resume_row();
create trigger validate_resume_template before insert or update on public.resume_templates for each row execute function private.validate_resume_row();
alter table public.user_resumes enable row level security;
alter table public.resume_templates enable row level security;
revoke all on public.user_resumes,public.resume_templates from anon,authenticated;
grant select,insert,update,delete on public.user_resumes to authenticated;
grant select on public.resume_templates to anon,authenticated;
grant insert,update,delete on public.resume_templates to authenticated;
grant select on public.user_resumes,public.resume_templates to service_role;
create policy "resumes: own rows" on public.user_resumes for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy "resume template: public read" on public.resume_templates for select to anon,authenticated using(true);
create policy "resume template: owner insert" on public.resume_templates for insert to authenticated with check((select rls.is_owner()));
create policy "resume template: owner update" on public.resume_templates for update to authenticated using((select rls.is_owner())) with check((select rls.is_owner()));
create policy "resume template: owner delete" on public.resume_templates for delete to authenticated using((select rls.is_owner()));
insert into public.resume_templates(key) values('default');
create function private.apply_resume_template_draft(operation jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare before_row jsonb; fields jsonb:=operation->'fields';
begin
 if auth.uid() is null or not rls.is_owner() then raise exception 'Only the owner can approve template drafts.' using errcode='42501'; end if;
 if jsonb_typeof(operation) is distinct from 'object' or operation-array['table','op','key','fields']::text[]<>'{}'::jsonb or operation->>'table' is distinct from 'resume_templates' or operation->>'op' is distinct from 'update' or operation->>'key' is distinct from 'default' or jsonb_typeof(operation->'key') is distinct from 'string' then raise exception 'Invalid resume template operation.' using errcode='22023'; end if;
 if jsonb_typeof(fields) is distinct from 'object' or fields='{}'::jsonb or fields-array['title','content']::text[]<>'{}'::jsonb then raise exception 'Unknown or empty template fields.' using errcode='22023'; end if;
 if fields?'title' and jsonb_typeof(fields->'title') is distinct from 'string' then raise exception 'Template title must be text.' using errcode='22023'; end if;
 select to_jsonb(t) into before_row from public.resume_templates t where key='default' for update;
 if before_row is null then raise exception 'Resume template no longer exists.' using errcode='22023'; end if;
 update public.resume_templates set title=case when fields?'title' then fields->>'title' else title end,content=case when fields?'content' then fields->'content' else content end where key='default';
 return jsonb_build_object('op','update','table','resume_templates','key','default','values',before_row);
end $$;
revoke all on function private.apply_resume_template_draft(jsonb) from public,anon,authenticated,service_role;

create or replace function private.apply_content_change() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  operation jsonb;
  field_name text;
  section_key text;
  old_values jsonb;
  history jsonb := '[]'::jsonb;
  field_count integer;
begin
  if TG_OP = 'INSERT' then
    if NEW.status <> 'draft' or NEW.previous is not null or NEW.approved_at is not null or NEW.approved_by is not null then
      raise exception 'New change sets must be drafts without approval metadata.' using errcode = '22023';
    end if;
    return NEW;
  end if;
  if auth.uid() is null or not rls.is_owner() then
    raise exception 'Only the owner can review content drafts.' using errcode = '42501';
  end if;
  if OLD.status <> 'draft' then
    raise exception 'This change set has already been reviewed.' using errcode = '22023';
  end if;
  if NEW.id is distinct from OLD.id or NEW.created_at is distinct from OLD.created_at then
    raise exception 'Change set identity and creation time cannot be edited.' using errcode = '22023';
  end if;
  if NEW.previous is not null or NEW.approved_at is not null or NEW.approved_by is not null then
    raise exception 'Approval metadata is filled only by the approval engine.' using errcode = '22023';
  end if;
  if NEW.status = 'draft' then return NEW; end if;
  if NEW.operations is distinct from OLD.operations or NEW.summary is distinct from OLD.summary or NEW.photo_slots is distinct from OLD.photo_slots then
    raise exception 'Save draft edits before reviewing the set.' using errcode = '22023';
  end if;
  -- Discard changes only status; malformed proposals can still be discarded safely.
  if NEW.status = 'discarded' then return NEW; end if;
  if jsonb_array_length(NEW.operations)>100 or (jsonb_array_length(NEW.operations)=0 and NEW.photo_slots='[]'::jsonb) then
    raise exception 'A change set must contain between 1 and 100 operations.' using errcode = '22023';
  end if;
  for operation in select value from jsonb_array_elements(NEW.operations) loop
    if jsonb_typeof(operation) is distinct from 'object' then
      raise exception 'Each operation must be an object.' using errcode = '22023';
    end if;
    if operation->>'table'='resume_templates' then
      history:=history||jsonb_build_array(private.apply_resume_template_draft(operation));
      continue;
    end if;
    if operation->>'table' in ('notes','question_notes','practice_code','practice_stars','behavioral_stories','behavioral_answers') then
      history := history || jsonb_build_array(private.apply_app_draft(operation));
      continue;
    end if;
    if operation->>'table' in ('projects','articles','guides') then
      history := history || jsonb_build_array(private.apply_publishing_draft(operation));
      continue;
    end if;
    if operation->>'table' in ('experience_items','experience_bullets') then
      history := history || jsonb_build_array(private.apply_experience_draft(operation));
      continue;
    end if;
    if (operation - array['op', 'table', 'key', 'fields']::text[]) <> '{}'::jsonb
       or operation->>'table' is distinct from 'site_sections' then
      raise exception 'Unknown table or operation property.' using errcode = '22023';
    end if;
    if operation->>'op' is distinct from 'update' then
      raise exception 'Only update operations are supported for site_sections.' using errcode = '22023';
    end if;
    section_key := operation->>'key';
    if jsonb_typeof(operation->'key') is distinct from 'string' or section_key not in ('hero','now','about','interests','technology','writing','contact') then
      raise exception 'Unknown section key.' using errcode = '22023';
    end if;
    if jsonb_typeof(operation->'fields') is distinct from 'object' then
      raise exception 'Operation fields must be an object.' using errcode = '22023';
    end if;
    field_count := 0;
    for field_name in select jsonb_object_keys(operation->'fields') loop
      field_count := field_count + 1;
      if field_name not in ('title','body') then
        raise exception 'Unknown editable field: %.', field_name using errcode = '22023';
      end if;
      if jsonb_typeof(operation->'fields'->field_name) is distinct from 'string' then
        raise exception 'Field % must be text.', field_name using errcode = '22023';
      end if;
      if char_length(operation->'fields'->>field_name) > (case when field_name = 'title' then 120 else 20000 end) then
        raise exception 'Field % is too long.', field_name using errcode = '22023';
      end if;
      -- Postgres JSON rejects NUL before storage; TS validation does the same.
    end loop;
    if field_count = 0 then
      raise exception 'Each update needs at least one editable field.' using errcode = '22023';
    end if;
    select jsonb_build_object('key', s.key, 'title', s.title, 'body', s.body)
      into old_values from public.site_sections s where s.key = section_key for update;
    if not found then
      raise exception 'Section % no longer exists.', section_key using errcode = '22023';
    end if;
    history := history || jsonb_build_array(jsonb_build_object('table', 'site_sections', 'key', section_key, 'values', old_values));
    update public.site_sections set
      title = case when operation->'fields' ? 'title' then operation->'fields'->>'title' else title end,
      body = case when operation->'fields' ? 'body' then operation->'fields'->>'body' else body end
      where key = section_key;
  end loop;
  if NEW.photo_slots <> '[]'::jsonb then history:=history||private.apply_draft_photos(NEW.id,NEW.photo_slots); end if;
  NEW.previous := history;
  NEW.approved_at := clock_timestamp();
  NEW.approved_by := auth.uid();
  return NEW;
end;
$$;
revoke all on function private.apply_content_change() from public, anon, authenticated, service_role;

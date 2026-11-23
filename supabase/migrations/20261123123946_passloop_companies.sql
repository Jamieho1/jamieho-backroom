-- C1: shared, owner-authored company content. No content seeds or live application.
create table public.companies (
 id uuid primary key default gen_random_uuid(),
 slug text not null check(char_length(slug)<=80 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 name text not null default '' check(char_length(name)<=160 and name ~ '[^[:space:]]'),
 logo_path text not null default '' check(logo_path='' or (char_length(logo_path)<=240 and logo_path ~ '^[a-zA-Z0-9_-]+(/[a-zA-Z0-9_-]+)*\.(png|jpg|jpeg|webp|svg)$')),
 overview text not null default '' check(char_length(overview)<=50000),
 sort integer not null default 100, public boolean not null default false,
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),unique(slug)
);
create table public.company_questions (
 id uuid primary key default gen_random_uuid(),company_id uuid not null references public.companies(id) on delete cascade,
 kind text not null check(kind in ('coding','system_design','low_level_design')),
 section text not null default '' check(char_length(section)<=80 and section ~ '[^[:space:]]'),
 question_ref text not null default '' check(char_length(question_ref)<=80 and question_ref ~ '[^[:space:]]'),
 rank integer not null default 100,public boolean not null default false
);
create index company_questions_company_rank on public.company_questions(company_id,rank,id);
create table public.interview_experiences (
 id uuid primary key default gen_random_uuid(),company_id uuid not null references public.companies(id) on delete cascade,
 slug text not null check(char_length(slug)<=80 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 title text not null default '' check(char_length(title)<=200 and title ~ '[^[:space:]]'),
 level text not null default 'Other' check(level in ('Junior','Mid','Senior','Staff','Other')),
 role text not null default '' check(char_length(role)<=160 and role ~ '[^[:space:]]'),
 interview_date text not null default '' check(interview_date='' or interview_date ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
 region text not null default '' check(char_length(region)<=160),body text not null default '' check(char_length(body)<=50000),
 published boolean not null default false,published_at timestamptz,unique(company_id,slug)
);
create index interview_experiences_company on public.interview_experiences(company_id);
create trigger companies_touch before update on public.companies for each row execute function private.touch_updated_at();
alter table public.companies enable row level security;
revoke all on public.companies from public,anon,authenticated,service_role;
grant select on public.companies to anon,authenticated,service_role;
grant insert,update,delete on public.companies to authenticated;
create policy "companies: public reads" on public.companies for select to anon,authenticated using (public);
create policy "companies: owner writes" on public.companies for all to authenticated using ((select rls.is_owner())) with check ((select rls.is_owner()));
alter table public.company_questions enable row level security;
revoke all on public.company_questions from public,anon,authenticated,service_role;
grant select on public.company_questions to anon,authenticated,service_role;
grant insert,update,delete on public.company_questions to authenticated;
create policy "company_questions: public reads" on public.company_questions for select to anon,authenticated using (public and exists(select 1 from public.companies c where c.id=company_id and c.public));
create policy "company_questions: owner writes" on public.company_questions for all to authenticated using ((select rls.is_owner())) with check ((select rls.is_owner()));
alter table public.interview_experiences enable row level security;
revoke all on public.interview_experiences from public,anon,authenticated,service_role;
grant select on public.interview_experiences to anon,authenticated,service_role;
grant insert,update,delete on public.interview_experiences to authenticated;
create policy "interview_experiences: public reads" on public.interview_experiences for select to anon,authenticated using (published and exists(select 1 from public.companies c where c.id=company_id and c.public));
create policy "interview_experiences: owner writes" on public.interview_experiences for all to authenticated using ((select rls.is_owner())) with check ((select rls.is_owner()));

create function private.apply_company_draft(operation jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare target text:=operation->>'table'; action text:=operation->>'op'; fields jsonb:=coalesce(operation->'fields','{}'); target_id uuid; old_row jsonb; payload jsonb; allowed text[]; field_name text; assignments text; pub text; ref text; kind text;
begin
 if auth.uid() is null or not rls.is_owner() then raise exception 'Only the owner can approve company drafts.' using errcode='42501'; end if;
 if jsonb_typeof(operation) is distinct from 'object' or target is null or target not in ('companies','company_questions','interview_experiences') or action is null or action not in ('insert','update','delete') or (operation-array['table','op','key','fields'])<>'{}'::jsonb then raise exception 'Invalid company draft operation.' using errcode='22023'; end if;
 if jsonb_typeof(operation->'key') is distinct from 'string' or operation->>'key' !~* '^([0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$' then raise exception 'Company key must be a UUID.' using errcode='22023'; end if;
 target_id:=(operation->>'key')::uuid;
 allowed:=case target when 'companies' then array['slug','name','logo_path','overview','sort','public'] when 'company_questions' then array['company_id','kind','section','question_ref','rank','public'] else array['company_id','slug','title','level','role','interview_date','region','body','published','published_at'] end;
 if jsonb_typeof(fields) is distinct from 'object' then raise exception 'Company fields must be an object.' using errcode='22023'; end if;
 if action='delete' and fields<>'{}'::jsonb or action<>'delete' and fields='{}'::jsonb then raise exception 'Invalid company draft fields.' using errcode='22023'; end if;
 for field_name in select jsonb_object_keys(fields) loop
  if not(field_name=any(allowed)) then raise exception 'Unknown company editable field.' using errcode='22023'; end if;
  if field_name in ('public','published') then
   if jsonb_typeof(fields->field_name) is distinct from 'boolean' then raise exception 'Publication must be boolean.' using errcode='22023'; end if;
  elsif field_name in ('sort','rank') then
   if jsonb_typeof(fields->field_name) is distinct from 'number' or (fields->>field_name)::numeric<>trunc((fields->>field_name)::numeric) or (fields->>field_name)::numeric not between -2147483648 and 2147483647 then raise exception 'Order must be a 32-bit integer.' using errcode='22023'; end if;
  elsif field_name='published_at' and fields->field_name='null'::jsonb then null;
  else
   if jsonb_typeof(fields->field_name) is distinct from 'string' then raise exception 'Company field must be text.' using errcode='22023'; end if;
   if field_name='company_id' and fields->>field_name !~* '^([0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$' then raise exception 'Company id must be a UUID.' using errcode='22023'; end if;
   if field_name='published_at' and fields->>field_name !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]+)?(Z|[+-][0-9]{2}:[0-9]{2})$' then raise exception 'Publication time must be ISO timestamp.' using errcode='22023'; end if;
  end if;
 end loop;
 execute format('select to_jsonb(t) from public.%I t where id=$1 for update',target) into old_row using target_id;
 if action='insert' and old_row is not null or action<>'insert' and old_row is null then raise exception 'Company target is missing or already exists.' using errcode='22023'; end if;
 if action='delete' then
  pub:=case target when 'interview_experiences' then 'published' else 'public' end;
  execute format('update public.%I set %I=false where id=$1',target,pub) using target_id;
 else
  payload:=coalesce(old_row,case target when 'companies' then jsonb_build_object('id',target_id,'logo_path','','overview','','sort',100,'public',false,'created_at',now(),'updated_at',now()) when 'company_questions' then jsonb_build_object('id',target_id,'rank',100,'public',false) else jsonb_build_object('id',target_id,'level','Other','interview_date','','region','','body','','published',false,'published_at',null) end)||fields;
  if target='company_questions' then
   ref:=payload->>'question_ref';kind:=payload->>'kind';
   if ref ~ '^[1-9][0-9]{0,8}$' then
    if not private.valid_draft_problem(ref::integer) or (kind='coding' and ref='146') or (kind='low_level_design' and ref<>'146') or kind='system_design' then raise exception 'Choose an existing practice problem for this kind.' using errcode='22023'; end if;
   elsif kind='low_level_design' and ref='class-design' then null;
   elsif kind='system_design' and ref like 'sd-%' and exists(select 1 from public.notes where id=ref) then null;
   else raise exception 'Choose an existing note topic for this kind.' using errcode='22023'; end if;
  end if;
  if action='insert' then
   execute format('insert into public.%I select (jsonb_populate_record(null::public.%I,$1)).*',target,target) using payload;
  else
   select string_agg(format('%I=(jsonb_populate_record(null::public.%I,$1)).%I',f,target,f),',') into assignments from jsonb_object_keys(fields) f;
   execute format('update public.%I set %s where id=$2',target,assignments) using payload,target_id;
  end if;
 end if;
 return jsonb_build_object('table',target,'key',target_id,'values',old_row);
end;
$$;
revoke all on function private.apply_company_draft(jsonb) from public,anon,authenticated,service_role;

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
    if operation->>'table' in ('companies','company_questions','interview_experiences') then
      history:=history||jsonb_build_array(private.apply_company_draft(operation));
      continue;
    end if;
    if operation->>'table'='about_photos' then
      history:=history||jsonb_build_array(private.apply_about_photo_draft(operation));
      continue;
    end if;
    if operation->>'table' in ('interview_behavioral_themes','interview_behavioral_questions') then
      history:=history||jsonb_build_array(private.apply_playbook_draft(operation));
      continue;
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
    if jsonb_typeof(operation->'key') is distinct from 'string' or section_key not in ('hero','now','about','interests','technology','writing','contact','story') then
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

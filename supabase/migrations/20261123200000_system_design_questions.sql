-- S1: system-design questions (solution, quiz, whiteboard steps) editable through Content Drafts, plus per-user
-- quiz attempts and flag/done state. No content seeds. NOT applied to any remote database until Jamie says "apply it".
create function private.valid_sd_quiz(quiz jsonb) returns boolean
language plpgsql immutable set search_path='' as $$
declare item jsonb; opt jsonb;
begin
 if jsonb_typeof(quiz) is distinct from 'array' or jsonb_array_length(quiz)>40 then return false; end if;
 for item in select value from jsonb_array_elements(quiz) loop
  if jsonb_typeof(item) is distinct from 'object' or (item-array['q','options','answer','explanation'])<>'{}'::jsonb or not (item ?& array['q','options','answer','explanation']) then return false; end if;
  if jsonb_typeof(item->'q') is distinct from 'string' or char_length(item->>'q') not between 1 and 500 or btrim(item->>'q')='' then return false; end if;
  if jsonb_typeof(item->'explanation') is distinct from 'string' or char_length(item->>'explanation')>1000 then return false; end if;
  if jsonb_typeof(item->'answer') is distinct from 'number' or (item->>'answer') !~ '^[0-3]$' then return false; end if;
  if jsonb_typeof(item->'options') is distinct from 'array' or jsonb_array_length(item->'options')<>4 then return false; end if;
  for opt in select value from jsonb_array_elements(item->'options') loop
   if jsonb_typeof(opt) is distinct from 'string' or char_length(opt#>>'{}') not between 1 and 300 or btrim(opt#>>'{}')='' then return false; end if;
  end loop;
 end loop;
 return true;
end;
$$;
-- Steps are defined in detail by S3; S1 only guarantees a bounded array of objects with a stable id and title.
create function private.valid_sd_steps(steps jsonb) returns boolean
language plpgsql immutable set search_path='' as $$
declare item jsonb;
begin
 if jsonb_typeof(steps) is distinct from 'array' or jsonb_array_length(steps)>12 or char_length(steps::text)>200000 then return false; end if;
 for item in select value from jsonb_array_elements(steps) loop
  if jsonb_typeof(item) is distinct from 'object' or not (item ?& array['id','title']) then return false; end if;
  if jsonb_typeof(item->'id') is distinct from 'string' or char_length(item->>'id')>40 or item->>'id' !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then return false; end if;
  if jsonb_typeof(item->'title') is distinct from 'string' or char_length(item->>'title') not between 1 and 120 or btrim(item->>'title')='' then return false; end if;
 end loop;
 return true;
end;
$$;
revoke all on function private.valid_sd_quiz(jsonb),private.valid_sd_steps(jsonb) from public,anon,authenticated,service_role;
grant execute on function private.valid_sd_quiz(jsonb),private.valid_sd_steps(jsonb) to authenticated;

create table public.system_design_questions (
 id uuid primary key default gen_random_uuid(),
 slug text not null check(char_length(slug)<=80 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and slug not in ('practice','notes')),
 title text not null default '' check(char_length(title)<=200 and title ~ '[^[:space:]]'),
 icon text not null default 'system-design' check(char_length(icon)<=40 and icon ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 topic text not null default '' check(char_length(topic)<=80),
 note_ref text not null default '' check(note_ref='' or (char_length(note_ref)<=80 and note_ref ~ '^sd-[a-z0-9]+(-[a-z0-9]+)*$')),
 solution text not null default '' check(char_length(solution)<=100000),
 quiz jsonb not null default '[]'::jsonb check(private.valid_sd_quiz(quiz)),
 steps jsonb not null default '[]'::jsonb check(private.valid_sd_steps(steps)),
 sort integer not null default 100,
 public boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(slug)
);
create trigger system_design_questions_touch before update on public.system_design_questions for each row execute function private.touch_updated_at();
alter table public.system_design_questions enable row level security;
revoke all on public.system_design_questions from public,anon,authenticated,service_role;
grant select on public.system_design_questions to anon,authenticated,service_role;
grant insert,update,delete on public.system_design_questions to authenticated;
create policy "system_design_questions: public reads" on public.system_design_questions for select to anon,authenticated using (public);
create policy "system_design_questions: owner reads all" on public.system_design_questions for select to authenticated using ((select rls.is_owner()));
create policy "system_design_questions: owner writes" on public.system_design_questions for all to authenticated using ((select rls.is_owner())) with check ((select rls.is_owner()));

-- Per-account quiz attempts: own rows only, including for the owner. Exported with user_id.
create table public.system_design_quiz_attempts (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 question_id uuid not null references public.system_design_questions(id) on delete cascade,
 score integer not null,
 total integer not null check(total between 1 and 40),
 answers jsonb not null default '[]'::jsonb check(jsonb_typeof(answers)='array' and jsonb_array_length(answers)<=40),
 created_at timestamptz not null default now(),
 check(score between 0 and total)
);
create index system_design_quiz_attempts_user_question_time on public.system_design_quiz_attempts(user_id,question_id,created_at desc);
alter table public.system_design_quiz_attempts enable row level security;
revoke all on public.system_design_quiz_attempts from public,anon,authenticated,service_role;
grant select,insert,delete on public.system_design_quiz_attempts to authenticated;
grant select on public.system_design_quiz_attempts to service_role;
create policy "system_design_quiz_attempts: own rows read" on public.system_design_quiz_attempts for select to authenticated using (user_id=(select auth.uid()));
create policy "system_design_quiz_attempts: own rows insert" on public.system_design_quiz_attempts for insert to authenticated with check (user_id=(select auth.uid()) and exists(select 1 from public.system_design_questions q where q.id=question_id and q.public));
create policy "system_design_quiz_attempts: own rows delete" on public.system_design_quiz_attempts for delete to authenticated using (user_id=(select auth.uid()));

-- Per-account flag/done for system-design questions (the integer-keyed practice tables cannot hold slugged questions).
create table public.system_design_progress (
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 question_id uuid not null references public.system_design_questions(id) on delete cascade,
 flagged boolean not null default false,
 done boolean not null default false,
 updated_at timestamptz not null default now(),
 primary key(user_id,question_id)
);
alter table public.system_design_progress enable row level security;
revoke all on public.system_design_progress from public,anon,authenticated,service_role;
grant select,insert,update,delete on public.system_design_progress to authenticated;
grant select on public.system_design_progress to service_role;
create policy "system_design_progress: own rows read" on public.system_design_progress for select to authenticated using (user_id=(select auth.uid()));
create policy "system_design_progress: own rows insert" on public.system_design_progress for insert to authenticated with check (user_id=(select auth.uid()) and exists(select 1 from public.system_design_questions q where q.id=question_id and q.public));
create policy "system_design_progress: own rows update" on public.system_design_progress for update to authenticated using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));
create policy "system_design_progress: own rows delete" on public.system_design_progress for delete to authenticated using (user_id=(select auth.uid()));
comment on table public.system_design_quiz_attempts is 'Per-account quiz attempts; own-row RLS, user_id exported with every row.';
comment on table public.system_design_progress is 'Per-account flag/done for system-design questions; own-row RLS.';

-- Owner-approved drafts: field allowlist mirrored in lib/content-drafts/system-design.ts; delete only unpublishes.
create function private.apply_system_design_draft(operation jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare target text:=operation->>'table'; action text:=operation->>'op'; fields jsonb:=coalesce(operation->'fields','{}'); target_id uuid; old_row jsonb; payload jsonb; field_name text; assignments text;
 allowed text[]:=array['slug','title','icon','topic','note_ref','solution','quiz','steps','sort','public'];
begin
 if auth.uid() is null or not rls.is_owner() then raise exception 'Only the owner can approve system design drafts.' using errcode='42501'; end if;
 if jsonb_typeof(operation) is distinct from 'object' or target is distinct from 'system_design_questions' or action is null or action not in ('insert','update','delete') or (operation-array['table','op','key','fields'])<>'{}'::jsonb then raise exception 'Invalid system design draft operation.' using errcode='22023'; end if;
 if jsonb_typeof(operation->'key') is distinct from 'string' or operation->>'key' !~* '^([0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$' then raise exception 'System design key must be a UUID.' using errcode='22023'; end if;
 target_id:=(operation->>'key')::uuid;
 if jsonb_typeof(fields) is distinct from 'object' then raise exception 'System design fields must be an object.' using errcode='22023'; end if;
 if action='delete' and fields<>'{}'::jsonb or action<>'delete' and fields='{}'::jsonb then raise exception 'Invalid system design draft fields.' using errcode='22023'; end if;
 for field_name in select jsonb_object_keys(fields) loop
  if not(field_name=any(allowed)) then raise exception 'Unknown system design editable field.' using errcode='22023'; end if;
  if field_name='public' then
   if jsonb_typeof(fields->field_name) is distinct from 'boolean' then raise exception 'Publication must be boolean.' using errcode='22023'; end if;
  elsif field_name='sort' then
   if jsonb_typeof(fields->field_name) is distinct from 'number' or (fields->>field_name)::numeric<>trunc((fields->>field_name)::numeric) or (fields->>field_name)::numeric not between -2147483648 and 2147483647 then raise exception 'Order must be a 32-bit integer.' using errcode='22023'; end if;
  elsif field_name in ('quiz','steps') then
   if jsonb_typeof(fields->field_name) is distinct from 'array' then raise exception 'Quiz and steps must be arrays.' using errcode='22023'; end if;
  elsif jsonb_typeof(fields->field_name) is distinct from 'string' then raise exception 'System design field must be text.' using errcode='22023';
  end if;
 end loop;
 select to_jsonb(t) into old_row from public.system_design_questions t where id=target_id for update;
 if action='insert' and old_row is not null or action<>'insert' and old_row is null then raise exception 'System design target is missing or already exists.' using errcode='22023'; end if;
 if action='delete' then
  update public.system_design_questions set public=false where id=target_id;
 else
  payload:=coalesce(old_row,jsonb_build_object('id',target_id,'icon','system-design','topic','','note_ref','','solution','','quiz','[]'::jsonb,'steps','[]'::jsonb,'sort',100,'public',false,'created_at',now(),'updated_at',now()))||fields;
  if action='insert' then
   if not(fields?&array['slug','title']) then raise exception 'Insert requires slug and title.' using errcode='22023'; end if;
   insert into public.system_design_questions select (jsonb_populate_record(null::public.system_design_questions,payload)).*;
  else
   select string_agg(format('%I=(jsonb_populate_record(null::public.system_design_questions,$1)).%I',f,f),',') into assignments from jsonb_object_keys(fields) f;
   execute format('update public.system_design_questions set %s where id=$2',assignments) using payload,target_id;
  end if;
 end if;
 return jsonb_build_object('table',target,'key',target_id,'values',old_row);
end;
$$;
revoke all on function private.apply_system_design_draft(jsonb) from public,anon,authenticated,service_role;

-- Dispatch the new table from the approval trigger (full replacement of the hardened trigger function).
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
    if operation->>'table'='system_design_questions' then
      history:=history||jsonb_build_array(private.apply_system_design_draft(operation));
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

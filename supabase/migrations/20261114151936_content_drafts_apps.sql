-- TKT-106: private owner draft operations. These are owner-managed tables, not per-user rows.
-- Catalogue content remains in code; only existing identifiers are mirrored here for validation.
create function private.valid_draft_problem(value integer) returns boolean
language sql immutable set search_path='' as $$ select coalesce(value=any(array[1,2,3,4,5,10,11,15,17,19,20,21,22,23,25,32,33,36,39,40,42,43,45,46,48,49,50,51,53,54,55,56,57,62,66,70,72,73,74,76,78,79,84,90,91,97,98,100,102,104,105,110,115,121,124,125,127,128,130,131,133,134,138,139,141,143,146,150,152,153,155,167,198,199,200,202,206,207,208,210,211,212,213,215,217,226,230,235,238,239,242,252,253,261,269,271,286,287,295,297,300,309,312,322,323,329,332,347,355,416,417,424,435,494,518,543,567,572,621,647,678,684,695,703,704,739,743,746,763,773,778,787,846,853,875,973,981,994,1046,1143,1448,1584,1851,1899,2013]::integer[]),false) $$;
revoke all on function private.valid_draft_problem(integer) from public,anon,authenticated,service_role;

create function private.apply_app_draft(operation jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare
 target text:=operation->>'table'; action text:=operation->>'op'; key_text text:=operation->>'key';
 fields jsonb:=operation->'fields'; before_row jsonb; payload jsonb; allowed text[]; key_column text; key_type text;
 field_name text; value jsonb; value_text text; units integer; maximum integer;
 uuid_pattern text:='^([0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$';
 trim_chars text:=chr(9)||chr(10)||chr(11)||chr(12)||chr(13)||chr(32)||chr(160)||chr(5760)||chr(8192)||chr(8193)||chr(8194)||chr(8195)||chr(8196)||chr(8197)||chr(8198)||chr(8199)||chr(8200)||chr(8201)||chr(8202)||chr(8232)||chr(8233)||chr(8239)||chr(8287)||chr(12288)||chr(65279);
 n public.notes; q public.question_notes; c public.practice_code; s public.behavioral_stories; a public.behavioral_answers;
begin
 if auth.uid() is null or not rls.is_owner() then raise exception 'Only the owner can approve app drafts.' using errcode='42501'; end if;
 if target is null or target not in ('notes','question_notes','practice_code','practice_stars','behavioral_stories','behavioral_answers') or (operation-array['op','table','key','fields']::text[])<>'{}'::jsonb then raise exception 'Unknown app table or operation property.' using errcode='22023'; end if;
 if action is null or (target='notes' and action<>'update') or (target='practice_stars' and action not in ('insert','delete')) or (target not in ('notes','practice_stars') and action not in ('insert','update')) then raise exception 'Unsupported app operation.' using errcode='22023'; end if;
 if target in ('question_notes','practice_code','practice_stars') then
  if jsonb_typeof(operation->'key') is distinct from 'number' then raise exception 'Problem key must be an integer from the code catalogue.' using errcode='22023'; end if;
  if key_text::numeric<>trunc(key_text::numeric) or key_text::numeric not between 1 and 10000 then raise exception 'Choose an existing practice problem.' using errcode='22023'; end if;
  if not private.valid_draft_problem(key_text::numeric::integer) then raise exception 'Choose an existing practice problem.' using errcode='22023'; end if;
  key_text:=(key_text::numeric::integer)::text;key_column:='problem';key_type:='integer';
 else
  if jsonb_typeof(operation->'key') is distinct from 'string' then raise exception 'App key must be text.' using errcode='22023'; end if;
  if target='notes' then
   if key_text !~ '^[a-z0-9][a-z0-9-]{0,79}$' then raise exception 'Invalid note key.' using errcode='22023'; end if;
   key_column:='id';key_type:='text';
  elsif target='behavioral_stories' then
   if key_text !~* uuid_pattern then raise exception 'Story key must be a UUID.' using errcode='22023'; end if;
   key_text:=(key_text::uuid)::text;key_column:='id';key_type:='uuid';
  else
   if key_text not in ('g-intro','g-proud','g-disagree','g-fail','g-ownership','g-incident','g-deadline','g-ambiguous','g-mentor','g-influence','g-learn','g-feedback','g-crossteam','g-incomplete','g-process','g-tradeoff','g-pushback','g-customer','g-bug','g-pivot','g-why-leave','g-weakness','p-why','p-deepdive','p-domain','p-userconflict','p-messy','b-why','b-pressure','b-latency','b-users','b-wrong','j-why','j-risk','j-explain','j-bigorg','j-current') then raise exception 'Choose an existing behavioral question.' using errcode='22023'; end if;
   key_column:='question_id';key_type:='text';
  end if;
 end if;
 if target='practice_stars' and fields is null then fields:='{}'::jsonb; end if;
 if jsonb_typeof(fields) is distinct from 'object' then raise exception 'App fields must be an object.' using errcode='22023'; end if;
 allowed:=case target when 'notes' then array['body','free'] when 'question_notes' then array['body'] when 'practice_code' then array['code'] when 'practice_stars' then array[]::text[] when 'behavioral_stories' then array['bullet_id','title','situation','task','action','result','skills','numbers'] else array['primary_story_id','secondary_story_id','outline','followups'] end;
 if (fields-allowed)<>'{}'::jsonb then raise exception 'Unknown editable app field.' using errcode='22023'; end if;
 if target<>'practice_stars' and fields='{}'::jsonb then raise exception 'Choose at least one editable field.' using errcode='22023'; end if;
 execute format('select to_jsonb(t) from public.%I t where %I=$1::%s for update',target,key_column,key_type) into before_row using key_text;
 if action='insert' and before_row is not null then raise exception 'App insert key already exists.' using errcode='22023'; end if;
 if action<>'insert' and before_row is null then raise exception 'App target no longer exists.' using errcode='22023'; end if;
 if target='practice_stars' then
  if action='delete' then delete from public.practice_stars where problem=key_text::integer;
  else insert into public.practice_stars(problem) values(key_text::integer); end if;
  return jsonb_build_object('op',action,'table',target,'key',operation->'key','values',before_row);
 end if;
 if action='insert' then
  if target='question_notes' and not(fields?'body') or target='practice_code' and not(fields?'code') or target='behavioral_stories' and not(fields?'title') then raise exception 'Insert requires its content field.' using errcode='22023'; end if;
 end if;
 payload:=coalesce(before_row,case target when 'behavioral_stories' then '{"bullet_id":null,"situation":"","task":"","action":"","result":"","skills":"","numbers":""}'::jsonb when 'behavioral_answers' then '{"primary_story_id":null,"secondary_story_id":null,"outline":"","followups":""}'::jsonb else '{}'::jsonb end)||fields||jsonb_build_object(key_column,case when key_type='integer' then to_jsonb(key_text::integer) else to_jsonb(key_text) end,'updated_at',clock_timestamp());
 foreach field_name in array allowed loop
  value:=payload->field_name;
  if field_name in ('bullet_id','primary_story_id','secondary_story_id') then
   if value='null'::jsonb then continue; end if;
   if jsonb_typeof(value) is distinct from 'string' or (value#>>'{}') !~* uuid_pattern then raise exception 'Story references must be UUIDs or null.' using errcode='22023'; end if;
   payload:=jsonb_set(payload,array[field_name],to_jsonb(((value#>>'{}')::uuid)::text));
  else
   if jsonb_typeof(value) is distinct from 'string' then raise exception 'App content fields must be text.' using errcode='22023'; end if;
   value_text:=value#>>'{}';
   if field_name='title' then value_text:=btrim(value_text,trim_chars); if value_text='' then raise exception 'Give the story a title.' using errcode='22023'; end if; end if;
   maximum:=case when target in ('notes','question_notes') then 200000 when target='practice_code' then 100000 when field_name='title' then 160 when field_name='skills' then 1000 when field_name='numbers' then 2000 when field_name='followups' then 10000 else 20000 end;
   if target in ('notes','question_notes','practice_code') then units:=char_length(value_text)+char_length(regexp_replace(value_text,U&'[^\+010000-\+10FFFF]','','g'));
   else units:=char_length(value_text); end if;
   if units>maximum then raise exception 'App text field exceeds its editor limit.' using errcode='22023'; end if;
   payload:=jsonb_set(payload,array[field_name],to_jsonb(value_text));
  end if;
 end loop;
 if target='notes' then
  select * into n from jsonb_populate_record(null::public.notes,payload);
  update public.notes set body=n.body,free=n.free,updated_at=n.updated_at where id=key_text;
 elsif target='question_notes' then
  select * into q from jsonb_populate_record(null::public.question_notes,payload);
  if action='insert' then insert into public.question_notes(problem,body,updated_at) values(q.problem,q.body,q.updated_at);
  else update public.question_notes set body=q.body,updated_at=q.updated_at where problem=q.problem; end if;
 elsif target='practice_code' then
  select * into c from jsonb_populate_record(null::public.practice_code,payload);
  if action='insert' then insert into public.practice_code(problem,code,updated_at) values(c.problem,c.code,c.updated_at);
  else update public.practice_code set code=c.code,updated_at=c.updated_at where problem=c.problem; end if;
 elsif target='behavioral_stories' then
  select * into s from jsonb_populate_record(null::public.behavioral_stories,payload);
  if action='insert' then insert into public.behavioral_stories(id,bullet_id,title,situation,task,action,result,skills,numbers) values(s.id,s.bullet_id,s.title,s.situation,s.task,s.action,s.result,s.skills,s.numbers);
  else update public.behavioral_stories set bullet_id=s.bullet_id,title=s.title,situation=s.situation,task=s.task,action=s.action,result=s.result,skills=s.skills,numbers=s.numbers where id=s.id; end if;
 else
  select * into a from jsonb_populate_record(null::public.behavioral_answers,payload);
  if a.primary_story_id is not null and a.primary_story_id=a.secondary_story_id then raise exception 'Choose two different stories.' using errcode='22023'; end if;
  if action='insert' then insert into public.behavioral_answers(question_id,primary_story_id,secondary_story_id,outline,followups) values(a.question_id,a.primary_story_id,a.secondary_story_id,a.outline,a.followups);
  else update public.behavioral_answers set primary_story_id=a.primary_story_id,secondary_story_id=a.secondary_story_id,outline=a.outline,followups=a.followups where question_id=a.question_id; end if;
 end if;
 return jsonb_build_object('op',action,'table',target,'key',operation->'key','values',before_row);
end;
$$;
revoke all on function private.apply_app_draft(jsonb) from public,anon,authenticated,service_role;

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
  if NEW.photo_slots <> '[]'::jsonb then
    raise exception 'Photo slots are not supported in this slice.' using errcode = '22023';
  end if;
  if jsonb_array_length(NEW.operations) not between 1 and 100 then
    raise exception 'A change set must contain between 1 and 100 operations.' using errcode = '22023';
  end if;
  for operation in select value from jsonb_array_elements(NEW.operations) loop
    if jsonb_typeof(operation) is distinct from 'object' then
      raise exception 'Each operation must be an object.' using errcode = '22023';
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
  NEW.previous := history;
  NEW.approved_at := clock_timestamp();
  NEW.approved_by := auth.uid();
  return NEW;
end;
$$;
revoke all on function private.apply_content_change() from public, anon, authenticated, service_role;

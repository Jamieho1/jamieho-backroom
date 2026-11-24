-- Q5: notes drafts may set `visual` (a jsonb array of visuals, or one visual object). This is the live
-- private.apply_app_draft from 20261115000906_per_user_practice.sql (the newest definition; later migrations only call it)
-- with exactly three changes: 'visual' joins the notes allowlist, a supplied visual is type/size/kind checked, and the
-- notes UPDATE also writes visual. Title and sort stay uneditable. Local until Jamie says "apply it".
create or replace function private.apply_app_draft(operation jsonb) returns jsonb
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
 allowed:=case target when 'notes' then array['body','free','visual'] when 'question_notes' then array['body'] when 'practice_code' then array['code'] when 'practice_stars' then array[]::text[] when 'behavioral_stories' then array['bullet_id','title','situation','task','action','result','skills','numbers'] else array['primary_story_id','secondary_story_id','outline','followups'] end;
 if (fields-allowed)<>'{}'::jsonb then raise exception 'Unknown editable app field.' using errcode='22023'; end if;
 if target<>'practice_stars' and fields='{}'::jsonb then raise exception 'Choose at least one editable field.' using errcode='22023'; end if;
 if target in ('practice_code','practice_stars') then
  execute format('select to_jsonb(t) from public.%I t where %I=$1::%s and user_id=auth.uid() for update',target,key_column,key_type) into before_row using key_text;
 else
  execute format('select to_jsonb(t) from public.%I t where %I=$1::%s for update',target,key_column,key_type) into before_row using key_text;
 end if;
 if action='insert' and before_row is not null then raise exception 'App insert key already exists.' using errcode='22023'; end if;
 if action<>'insert' and before_row is null then raise exception 'App target no longer exists.' using errcode='22023'; end if;
 if target='practice_stars' then
  if action='delete' then delete from public.practice_stars where problem=key_text::integer and user_id=auth.uid();
  else insert into public.practice_stars(user_id,problem) values(auth.uid(),key_text::integer); end if;
  return jsonb_build_object('op',action,'table',target,'key',operation->'key','values',before_row);
 end if;
 if action='insert' then
  if target='question_notes' and not(fields?'body') or target='practice_code' and not(fields?'code') or target='behavioral_stories' and not(fields?'title') then raise exception 'Insert requires its content field.' using errcode='22023'; end if;
 end if;
 payload:=coalesce(before_row,case target when 'behavioral_stories' then '{"bullet_id":null,"situation":"","task":"","action":"","result":"","skills":"","numbers":""}'::jsonb when 'behavioral_answers' then '{"primary_story_id":null,"secondary_story_id":null,"outline":"","followups":""}'::jsonb else '{}'::jsonb end)||fields||jsonb_build_object(key_column,case when key_type='integer' then to_jsonb(key_text::integer) else to_jsonb(key_text) end,'updated_at',clock_timestamp());
 foreach field_name in array allowed loop
  value:=payload->field_name;
  if field_name='visual' then
   -- Q5: only a supplied visual is checked (untouched live visuals are never re-validated). The TypeScript allowlist
   -- validates every visual against the Visual schema; here: a jsonb array/object of at most 40 objects with a known kind.
   if fields?'visual' then
    if jsonb_typeof(value) not in ('array','object') then raise exception 'Note visuals must be a JSON array or object.' using errcode='22023'; end if;
    if char_length(value::text)>200000 then raise exception 'Note visuals exceed their size limit.' using errcode='22023'; end if;
    if jsonb_typeof(value)='array' and jsonb_array_length(value)>40 then raise exception 'Note visuals hold at most 40 visuals.' using errcode='22023'; end if;
    if exists(select 1 from jsonb_array_elements(case when jsonb_typeof(value)='array' then value else jsonb_build_array(value) end) e where jsonb_typeof(e) is distinct from 'object' or e->>'kind' is null or e->>'kind' not in ('array','grid','graph','tables')) then raise exception 'Every note visual must be an object with a known kind.' using errcode='22023'; end if;
   end if;
  elsif field_name in ('bullet_id','primary_story_id','secondary_story_id') then
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
  update public.notes set body=n.body,free=n.free,visual=n.visual,updated_at=n.updated_at where id=key_text;
 elsif target='question_notes' then
  select * into q from jsonb_populate_record(null::public.question_notes,payload);
  if action='insert' then insert into public.question_notes(problem,body,updated_at) values(q.problem,q.body,q.updated_at);
  else update public.question_notes set body=q.body,updated_at=q.updated_at where problem=q.problem; end if;
 elsif target='practice_code' then
  select * into c from jsonb_populate_record(null::public.practice_code,payload);
  if action='insert' then insert into public.practice_code(user_id,problem,code,updated_at) values(auth.uid(),c.problem,c.code,c.updated_at);
  else update public.practice_code set code=c.code,updated_at=c.updated_at where problem=c.problem and user_id=auth.uid(); end if;
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

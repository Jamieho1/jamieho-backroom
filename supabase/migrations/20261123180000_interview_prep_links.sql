-- C4: ordered "What to prepare" links on interview experiences. Shape is enforced here with built-in jsonb/jsonpath
-- checks; note references are checked against the notes snapshot and fixed topics by the application allowlist, while
-- the approval function re-checks question and behavioral theme references against live rows. No content is written.
alter table public.interview_experiences add column prep_links jsonb not null default '[]'::jsonb;
alter table public.interview_experiences add constraint interview_experiences_prep_links_shape check (
 jsonb_typeof(prep_links)='array' and jsonb_array_length(prep_links)<=20
 and jsonb_array_length(jsonb_path_query_array(prep_links,'strict $[*] ? (@.type()=="object" && (@.kind=="note" || @.kind=="question" || @.kind=="behavioral_theme") && @.ref.type()=="string" && @.ref like_regex "^[a-z0-9]+(-[a-z0-9]+)*$")'))=jsonb_array_length(prep_links)
 and not jsonb_path_exists(prep_links,'strict $[*].keyvalue() ? (@.key!="kind" && @.key!="ref" && @.key!="label")')
 and not jsonb_path_exists(prep_links,'strict $[*] ? (exists(@.label) && !(@.label.type()=="string" && @.label like_regex "^[^\\s].{0,79}$" flag "s"))')
 and not jsonb_path_exists(prep_links,'strict $[*] ? (@.ref like_regex "^.{81,}$")')
);

create or replace function private.apply_company_draft(operation jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare target text:=operation->>'table'; action text:=operation->>'op'; fields jsonb:=coalesce(operation->'fields','{}'); target_id uuid; prep jsonb; old_row jsonb; payload jsonb; allowed text[]; field_name text; assignments text; pub text; ref text; kind text;
begin
 if auth.uid() is null or not rls.is_owner() then raise exception 'Only the owner can approve company drafts.' using errcode='42501'; end if;
 if jsonb_typeof(operation) is distinct from 'object' or target is null or target not in ('companies','company_questions','interview_experiences') or action is null or action not in ('insert','update','delete') or (operation-array['table','op','key','fields'])<>'{}'::jsonb then raise exception 'Invalid company draft operation.' using errcode='22023'; end if;
 if jsonb_typeof(operation->'key') is distinct from 'string' or operation->>'key' !~* '^([0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$' then raise exception 'Company key must be a UUID.' using errcode='22023'; end if;
 target_id:=(operation->>'key')::uuid;
 allowed:=case target when 'companies' then array['slug','name','logo_path','overview','sort','public'] when 'company_questions' then array['company_id','kind','section','question_ref','rank','public'] else array['company_id','slug','title','level','role','interview_date','region','body','published','published_at','prep_links'] end;
 if jsonb_typeof(fields) is distinct from 'object' then raise exception 'Company fields must be an object.' using errcode='22023'; end if;
 if action='delete' and fields<>'{}'::jsonb or action<>'delete' and fields='{}'::jsonb then raise exception 'Invalid company draft fields.' using errcode='22023'; end if;
 for field_name in select jsonb_object_keys(fields) loop
  if not(field_name=any(allowed)) then raise exception 'Unknown company editable field.' using errcode='22023'; end if;
  if field_name='prep_links' then
   if jsonb_typeof(fields->field_name) is distinct from 'array' then raise exception 'Prep links must be a list.' using errcode='22023'; end if;
  elsif field_name in ('public','published') then
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
  payload:=coalesce(old_row,case target when 'companies' then jsonb_build_object('id',target_id,'logo_path','','overview','','sort',100,'public',false,'created_at',now(),'updated_at',now()) when 'company_questions' then jsonb_build_object('id',target_id,'rank',100,'public',false) else jsonb_build_object('id',target_id,'level','Other','interview_date','','region','','body','','published',false,'published_at',null,'prep_links','[]'::jsonb) end)||fields;
  if target='company_questions' then
   ref:=payload->>'question_ref';kind:=payload->>'kind';
   if ref ~ '^[1-9][0-9]{0,8}$' then
    if not private.valid_draft_problem(ref::integer) or (kind='coding' and ref='146') or (kind='low_level_design' and ref<>'146') or kind='system_design' then raise exception 'Choose an existing practice problem for this kind.' using errcode='22023'; end if;
   elsif kind='low_level_design' and ref='class-design' then null;
   elsif kind='system_design' and ref like 'sd-%' and exists(select 1 from public.notes where id=ref) then null;
   else raise exception 'Choose an existing note topic for this kind.' using errcode='22023'; end if;
  end if;
  if target='interview_experiences' and payload ? 'prep_links' then
   for prep in select value from jsonb_array_elements(payload->'prep_links') loop
    if prep->>'kind'='question' then
     if prep->>'ref' !~ '^[1-9][0-9]{0,8}$' or not private.valid_draft_problem((prep->>'ref')::integer) then raise exception 'Choose an existing practice question for this prep link.' using errcode='22023'; end if;
    elsif prep->>'kind'='behavioral_theme' then
     if not exists(select 1 from public.interview_behavioral_themes t where t.id=prep->>'ref') then raise exception 'Choose an existing behavioral theme for this prep link.' using errcode='22023'; end if;
    end if;
   end loop;
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

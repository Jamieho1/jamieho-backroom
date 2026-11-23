-- S3: full interview-step shape for system_design_questions.steps, and per-account attempt history (the
-- "Finish attempt" snapshot). NOT applied to any remote database until Jamie says "apply it".
-- Replaces the S1 validator (compatible with S1 rows: only id and title are required; the other keys are optional).
create or replace function private.valid_sd_steps(steps jsonb) returns boolean
language plpgsql immutable set search_path='' as $$
declare item jsonb; entry jsonb; ids text[]:='{}';
 allowed text[]:=array['id','title','category','question','instruction','minutes','frame','how_to_answer','model_answer','checklist','clarifying'];
 frames text[]:=array['wb-functional','wb-non','wb-entities','wb-api','wb-hld'];
begin
 if jsonb_typeof(steps) is distinct from 'array' or jsonb_array_length(steps)>12 or char_length(steps::text)>200000 then return false; end if;
 for item in select value from jsonb_array_elements(steps) loop
  if jsonb_typeof(item) is distinct from 'object' or not (item ?& array['id','title']) or (item-allowed)<>'{}'::jsonb then return false; end if;
  if jsonb_typeof(item->'id') is distinct from 'string' or char_length(item->>'id')>40 or item->>'id' !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or item->>'id'=any(ids) then return false; end if;
  ids:=ids||(item->>'id');
  if jsonb_typeof(item->'title') is distinct from 'string' or char_length(item->>'title') not between 1 and 120 or btrim(item->>'title')='' then return false; end if;
  if item?'category' and (jsonb_typeof(item->'category') is distinct from 'string' or char_length(item->>'category')>40) then return false; end if;
  if item?'question' and (jsonb_typeof(item->'question') is distinct from 'string' or char_length(item->>'question')>600) then return false; end if;
  if item?'instruction' and (jsonb_typeof(item->'instruction') is distinct from 'string' or char_length(item->>'instruction')>600) then return false; end if;
  if item?'how_to_answer' and (jsonb_typeof(item->'how_to_answer') is distinct from 'string' or char_length(item->>'how_to_answer')>4000) then return false; end if;
  if item?'model_answer' and (jsonb_typeof(item->'model_answer') is distinct from 'string' or char_length(item->>'model_answer')>6000) then return false; end if;
  if item?'minutes' and (jsonb_typeof(item->'minutes') is distinct from 'number' or (item->>'minutes') !~ '^([1-9]|[1-5][0-9]|60)$') then return false; end if;
  if item?'frame' and (jsonb_typeof(item->'frame') is distinct from 'string' or not (item->>'frame'=any(frames))) then return false; end if;
  if item?'checklist' then
   if jsonb_typeof(item->'checklist') is distinct from 'array' or jsonb_array_length(item->'checklist')>12 then return false; end if;
   for entry in select value from jsonb_array_elements(item->'checklist') loop
    if jsonb_typeof(entry) is distinct from 'string' or char_length(entry#>>'{}') not between 1 and 200 or btrim(entry#>>'{}')='' then return false; end if;
   end loop;
  end if;
  if item?'clarifying' then
   if jsonb_typeof(item->'clarifying') is distinct from 'array' or jsonb_array_length(item->'clarifying')>10 then return false; end if;
   for entry in select value from jsonb_array_elements(item->'clarifying') loop
    if jsonb_typeof(entry) is distinct from 'object' or not (entry ?& array['q','a']) or (entry-array['q','a'])<>'{}'::jsonb then return false; end if;
    if jsonb_typeof(entry->'q') is distinct from 'string' or char_length(entry->>'q') not between 1 and 200 or btrim(entry->>'q')='' then return false; end if;
    if jsonb_typeof(entry->'a') is distinct from 'string' or char_length(entry->>'a') not between 1 and 600 or btrim(entry->>'a')='' then return false; end if;
   end loop;
  end if;
 end loop;
 return true;
end;
$$;

create function private.small_object(value jsonb,max_keys integer,max_bytes integer) returns boolean
language sql immutable set search_path='' as $$
 select jsonb_typeof(value)='object' and (select count(*) from jsonb_object_keys(value))<=max_keys and pg_column_size(value)<=max_bytes
$$;
revoke all on function private.small_object(jsonb,integer,integer) from public,anon,authenticated,service_role;
grant execute on function private.small_object(jsonb,integer,integer) to authenticated;

-- "Finish attempt" snapshots: canvas, per-step answers, checklist ticks, timer. Own rows only (including the owner);
-- immutable once saved (no update policy); the site keeps the newest 20 per question and a trigger caps the table at 30.
create table public.system_design_attempts (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 question_id uuid not null references public.system_design_questions(id) on delete cascade,
 scene jsonb not null check(
  jsonb_typeof(scene)='object'
  and coalesce(jsonb_typeof(scene->'elements')='array',false)
  and jsonb_array_length(scene->'elements')<=3000
  and pg_column_size(scene)<=1000000
 ),
 answers jsonb not null default '{}'::jsonb check(private.small_object(answers,12,200000)),
 checks jsonb not null default '{}'::jsonb check(private.small_object(checks,12,20000)),
 seconds integer not null default 0 check(seconds between 0 and 86400),
 covered integer not null default 0 check(covered between 0 and 200),
 total integer not null default 0 check(total between 0 and 200),
 created_at timestamptz not null default now(),
 check(covered<=total)
);
create index system_design_attempts_user_question_time on public.system_design_attempts(user_id,question_id,created_at desc);
create function private.cap_system_design_attempts() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if (select count(*) from public.system_design_attempts a where a.user_id=new.user_id and a.question_id=new.question_id)>=30 then
  raise exception 'Too many saved attempts for this question.' using errcode='54000';
 end if;
 return new;
end;
$$;
revoke all on function private.cap_system_design_attempts() from public,anon,authenticated,service_role;
create trigger system_design_attempts_cap before insert on public.system_design_attempts for each row execute function private.cap_system_design_attempts();
alter table public.system_design_attempts enable row level security;
revoke all on public.system_design_attempts from public,anon,authenticated,service_role;
grant select,insert,delete on public.system_design_attempts to authenticated;
grant select on public.system_design_attempts to service_role;
create policy "system_design_attempts: own rows read" on public.system_design_attempts for select to authenticated using (user_id=(select auth.uid()));
create policy "system_design_attempts: own rows insert" on public.system_design_attempts for insert to authenticated with check (user_id=(select auth.uid()) and exists(select 1 from public.system_design_questions q where q.id=question_id and q.public));
create policy "system_design_attempts: own rows delete" on public.system_design_attempts for delete to authenticated using (user_id=(select auth.uid()));
comment on table public.system_design_attempts is 'Per-account finished whiteboard attempts (canvas, answers, checklist ticks, timer); own-row RLS, user_id exported with every row.';

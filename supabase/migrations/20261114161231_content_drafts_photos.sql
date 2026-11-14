-- TKT-107: photo slots append verified owner uploads only on atomic approval.
-- Existing project-media bucket and its owner write policies are unchanged.
create function private.apply_draft_photos(set_id uuid, slots jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare
 slot jsonb; target jsonb; slot_name text; filename text; object_path text; target_id uuid;
 names text[]:=array[]::text[]; shots text[]; metadata jsonb; history jsonb:='[]'::jsonb;
begin
 if auth.uid() is null or not rls.is_owner() then raise exception 'Only the owner can approve photo slots.' using errcode='42501'; end if;
 if jsonb_typeof(slots) is distinct from 'array' or jsonb_array_length(slots)>6 then raise exception 'Use at most 6 photo slots.' using errcode='22023'; end if;
 for slot in select value from jsonb_array_elements(slots) loop
  if jsonb_typeof(slot) is distinct from 'object' or (slot-array['slot','expected_filename','bucket','target','caption','path']::text[])<>'{}'::jsonb or not(slot ?& array['slot','expected_filename','bucket','target','caption','path']) then raise exception 'Invalid photo slot fields.' using errcode='22023'; end if;
  slot_name:=slot->>'slot';filename:=slot->>'expected_filename';target:=slot->'target';
  if jsonb_typeof(slot->'slot') is distinct from 'string' or slot_name !~ '^[a-z0-9][a-z0-9-]{0,59}$' or slot_name=any(names) then raise exception 'Photo slot names must be valid and unique.' using errcode='22023'; end if;
  names:=array_append(names,slot_name);
  if jsonb_typeof(slot->'expected_filename') is distinct from 'string' or filename !~ '^[a-z0-9]+(-[a-z0-9]+)*\.(png|jpg|webp)$' or char_length(regexp_replace(filename,'\.(png|jpg|webp)$',''))>60 then raise exception 'Invalid expected photo filename.' using errcode='22023'; end if;
  if slot->>'bucket' is distinct from 'project-media' or jsonb_typeof(slot->'caption') is distinct from 'string' or char_length(slot->>'caption') not between 1 and 240 or btrim(slot->>'caption')='' then raise exception 'Use project-media and a photo caption.' using errcode='22023'; end if;
  if jsonb_typeof(target) is distinct from 'object' or (target-array['table','key','field']::text[])<>'{}'::jsonb or target->>'table' is distinct from 'projects' or target->>'field' is distinct from 'screenshots' or jsonb_typeof(target->'key') is distinct from 'string' or target->>'key' !~* '^([0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$' then raise exception 'Unknown photo target. Only project screenshots are supported.' using errcode='22023'; end if;
  target_id:=(target->>'key')::uuid;
  object_path:='drafts/'||set_id::text||'/'||slot_name||'/'||filename;
  if jsonb_typeof(slot->'path') is distinct from 'string' or slot->>'path' is distinct from object_path then raise exception 'Upload every expected photo to its matching draft slot before approving.' using errcode='22023'; end if;
  select o.metadata into metadata from storage.objects o where o.bucket_id='project-media' and o.name=object_path and o.owner_id=auth.uid()::text for share;
  if not found or metadata->>'mimetype' not in ('image/png','image/jpeg','image/webp') or metadata->>'mimetype' is null or metadata->>'size' is null or (metadata->>'size')::numeric not between 0 and 5242880 then raise exception 'Photo must exist, belong to the owner, use PNG/JPG/WebP and be at most 5 MB.' using errcode='22023'; end if;
  select p.screenshots into shots from public.projects p where p.id=target_id for update;
  if not found then raise exception 'Screenshot target project no longer exists.' using errcode='22023'; end if;
  if not ('https://lhacrrnwddvpawsreamk.supabase.co/storage/v1/object/public/project-media/'||object_path=any(shots)) then shots:=array_append(shots,'https://lhacrrnwddvpawsreamk.supabase.co/storage/v1/object/public/project-media/'||object_path); end if;
  history:=history||jsonb_build_array(private.apply_publishing_draft(jsonb_build_object('op','update','table','projects','key',target_id::text,'fields',jsonb_build_object('screenshots',to_jsonb(shots)))));
 end loop;
 return history;
end;
$$;
revoke all on function private.apply_draft_photos(uuid,jsonb) from public,anon,authenticated,service_role;

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

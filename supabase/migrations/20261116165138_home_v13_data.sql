-- TKT-110: data foundation only. No photo imports or changes to existing content.
create table public.about_photos (
 id uuid primary key default gen_random_uuid(),
 path text not null check (char_length(path)<=240 and path ~ '^[a-zA-Z0-9_-]+(/[a-zA-Z0-9_-]+)*\.(png|jpg|webp)$'),
 caption text not null default '' check (char_length(caption)<=240),
 alt text not null check (char_length(alt) between 1 and 240 and btrim(alt)<>''),
 sort integer not null default 100,
 centre boolean not null default false,
 public boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create unique index about_photos_one_centre on public.about_photos(centre) where centre;
alter table public.about_photos enable row level security;
revoke all on public.about_photos from public,anon,authenticated,service_role;
grant select on public.about_photos to anon,authenticated,service_role;
grant insert,update,delete on public.about_photos to authenticated;
create policy "about_photos: public reads" on public.about_photos for select to anon,authenticated using (public);
create policy "about_photos: owner" on public.about_photos for all to authenticated using ((select rls.is_owner())) with check ((select rls.is_owner()));
create trigger about_photos_touch before update on public.about_photos for each row execute function private.touch_updated_at();
alter table public.experience_items add column show_on_journey boolean not null default false,
 add column journey_icon text not null default 'briefcase' check (journey_icon in ('graduation-cap','microscope','neural-network','streams-plug','code','heart-hands','rocket','briefcase'));
alter table public.site_sections drop constraint site_sections_key_check;
alter table public.site_sections add constraint site_sections_key_check check (key in ('hero','now','about','interests','technology','writing','contact','story'));
insert into public.site_sections(key,title,body,sort) values ('story','My story','',100) on conflict(key) do nothing;

-- Canonical public deployment prefix: mirrored by MEDIA_PUBLIC_BASE and parity-tested.
create function private.draft_media_url(bucket text, object_path text) returns text
language plpgsql immutable set search_path='' as $$
begin
 if bucket not in ('project-media','home-media') or bucket is null then raise exception 'Unknown media bucket.' using errcode='22023'; end if;
 return 'https://lhacrrnwddvpawsreamk.supabase.co/storage/v1/object/public/'||bucket||'/'||object_path;
end;
$$;
revoke all on function private.draft_media_url(text,text) from public,anon,authenticated,service_role;

create function private.apply_about_photo_draft(operation jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare action text:=operation->>'op'; fields jsonb:=coalesce(operation->'fields','{}'::jsonb); target_id uuid; before_row jsonb; payload jsonb; photo public.about_photos; field_name text;
begin
 if auth.uid() is null or not rls.is_owner() then raise exception 'Only the owner can approve About photos.' using errcode='42501'; end if;
 if jsonb_typeof(operation) is distinct from 'object' or operation->>'table' is distinct from 'about_photos' or (operation-array['op','table','key','fields']::text[])<>'{}'::jsonb or action is null or action not in ('insert','update','delete') then raise exception 'Invalid About photo operation.' using errcode='22023'; end if;
 if jsonb_typeof(operation->'key') is distinct from 'string' or operation->>'key' !~* '^([0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$' then raise exception 'About photo key must be a UUID.' using errcode='22023'; end if;
 target_id:=(operation->>'key')::uuid;
 if jsonb_typeof(fields) is distinct from 'object' or (action='delete' and fields<>'{}'::jsonb) or (action<>'delete' and fields='{}'::jsonb) then raise exception 'Invalid About photo fields.' using errcode='22023'; end if;
 for field_name in select jsonb_object_keys(fields) loop
  if field_name in ('path','caption','alt') then
   if jsonb_typeof(fields->field_name) is distinct from 'string' or char_length(fields->>field_name)>240 then raise exception 'Invalid About photo text.' using errcode='22023'; end if;
  elsif field_name in ('centre','public') then
   if jsonb_typeof(fields->field_name) is distinct from 'boolean' then raise exception 'Photo flags must be booleans.' using errcode='22023'; end if;
  elsif field_name='sort' then
   if jsonb_typeof(fields->field_name) is distinct from 'number' or (fields->>field_name)::numeric<>trunc((fields->>field_name)::numeric) or (fields->>field_name)::numeric not between -2147483648 and 2147483647 then raise exception 'Photo sort must be a 32-bit integer.' using errcode='22023'; end if;
   fields:=jsonb_set(fields,'{sort}',to_jsonb((fields->>'sort')::numeric::integer));
  else raise exception 'Unknown About photo field.' using errcode='22023';
  end if;
 end loop;
 if action='insert' then
  if not(fields ?& array['path','alt']) then raise exception 'Photo insert requires path and alt.' using errcode='22023'; end if;
 else
  select to_jsonb(p) into before_row from public.about_photos p where id=target_id for update;
  if not found then raise exception 'About photo target no longer exists.' using errcode='22023'; end if;
 end if;
 if action='delete' then delete from public.about_photos where id=target_id;
 else
  payload:=coalesce(before_row,jsonb_build_object('id',target_id,'caption','','sort',100,'centre',false,'public',false))||fields;
  select * into photo from jsonb_populate_record(null::public.about_photos,payload);
  if action='insert' then insert into public.about_photos(id,path,caption,alt,sort,centre,public) values(target_id,photo.path,photo.caption,photo.alt,photo.sort,photo.centre,photo.public);
  else update public.about_photos set path=photo.path,caption=photo.caption,alt=photo.alt,sort=photo.sort,centre=photo.centre,public=photo.public where id=target_id; end if;
 end if;
 return jsonb_build_object('op',action,'table','about_photos','key',target_id,'values',before_row);
end;
$$;
revoke all on function private.apply_about_photo_draft(jsonb) from public,anon,authenticated,service_role;

-- TKT-104: extend the existing atomic draft transaction; existing editor permissions stay unchanged.
create or replace function private.apply_experience_draft(operation jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  target text := operation->>'table';
  action text := operation->>'op';
  target_id uuid;
  fields jsonb := operation->'fields';
  before_row jsonb;
  payload jsonb;
  field_name text;
  value_text text;
  units integer;
  max_units integer;
  item public.experience_items;
  bullet public.experience_bullets;
  uuid_pattern text := '^([0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$';
  trim_chars text := chr(9)||chr(10)||chr(11)||chr(12)||chr(13)||chr(32)||chr(160)||chr(5760)||chr(8192)||chr(8193)||chr(8194)||chr(8195)||chr(8196)||chr(8197)||chr(8198)||chr(8199)||chr(8200)||chr(8201)||chr(8202)||chr(8232)||chr(8233)||chr(8239)||chr(8287)||chr(12288)||chr(65279);
begin
  if auth.uid() is null or not rls.is_owner() then raise exception 'Only the owner can approve experience drafts.' using errcode='42501'; end if;
  if target is null or target not in ('experience_items','experience_bullets') or (operation-array['op','table','key','fields']::text[]) <> '{}'::jsonb then
    raise exception 'Unknown experience table or operation property.' using errcode='22023';
  end if;
  if action is null or action not in ('insert','update','delete') or (action='delete' and target<>'experience_bullets') then
    raise exception 'Unsupported experience operation; only bullets may be deleted.' using errcode='22023';
  end if;
  if jsonb_typeof(operation->'key') is distinct from 'string' or (operation->>'key') !~* uuid_pattern then raise exception 'Experience key must be a UUID.' using errcode='22023'; end if;
  target_id := (operation->>'key')::uuid;
  if action='delete' and fields is null then fields := '{}'::jsonb; end if;
  if jsonb_typeof(fields) is distinct from 'object' then raise exception 'Experience fields must be an object.' using errcode='22023'; end if;
  if action='delete' and fields <> '{}'::jsonb then raise exception 'Delete must have no editable fields.' using errcode='22023'; end if;
  if action<>'delete' and fields='{}'::jsonb then raise exception 'Choose at least one editable field.' using errcode='22023'; end if;
  for field_name in select jsonb_object_keys(fields) loop
    if (target='experience_items' and field_name not in ('kind','title','org','dates','location','summary','sort','public','show_on_journey','journey_icon')) or
       (target='experience_bullets' and field_name not in ('item_id','text','sort','public')) then
      raise exception 'Unknown editable experience field: %.',field_name using errcode='22023';
    end if;
    if field_name in ('public','show_on_journey') then
      if jsonb_typeof(fields->field_name) is distinct from 'boolean' then raise exception 'public must be a boolean.' using errcode='22023'; end if;
    elsif field_name='sort' then
      if jsonb_typeof(fields->field_name) is distinct from 'number' then raise exception 'sort must be a 32-bit integer.' using errcode='22023'; end if;
      if (fields->>field_name)::numeric <> trunc((fields->>field_name)::numeric) or (fields->>field_name)::numeric not between -2147483648 and 2147483647 then raise exception 'sort must be a 32-bit integer.' using errcode='22023'; end if;
      fields := jsonb_set(fields,array[field_name],to_jsonb(((fields->>field_name)::numeric)::integer));
    else
      if jsonb_typeof(fields->field_name) is distinct from 'string' then raise exception 'Field % must be text.',field_name using errcode='22023'; end if;
      value_text := fields->>field_name;
      if field_name='journey_icon' then
        if value_text not in ('graduation-cap','microscope','neural-network','streams-plug','code','heart-hands','rocket','briefcase') then raise exception 'Unknown journey icon.' using errcode='22023'; end if;
      elsif field_name='kind' then
        if value_text not in ('role','project','education','certificate','skills','other') then raise exception 'Unknown experience kind.' using errcode='22023'; end if;
      elsif field_name='item_id' then
        if value_text !~* uuid_pattern then raise exception 'item_id must be a UUID.' using errcode='22023'; end if;
        fields := jsonb_set(fields,array[field_name],to_jsonb((value_text::uuid)::text));
      else
        max_units := case when field_name in ('title','org') then 160 when field_name in ('dates','location') then 80 when field_name='summary' then 2000 else 1000 end;
        select coalesce(sum(case when ascii(substr(value_text,n,1))>65535 then 2 else 1 end),0) into units from generate_series(1,char_length(value_text)) n;
        if units>max_units then raise exception 'Field % is too long.',field_name using errcode='22023'; end if;
        value_text := btrim(value_text,trim_chars);
        if field_name in ('title','text') and value_text='' then raise exception 'Field % cannot be blank.',field_name using errcode='22023'; end if;
        fields := jsonb_set(fields,array[field_name],to_jsonb(value_text));
      end if;
    end if;
  end loop;
  if action='insert' then
    if target='experience_items' and not(fields?'title') then raise exception 'Insert requires a title.' using errcode='22023'; end if;
    if target='experience_bullets' and (not(fields?'text') or not(fields?'item_id')) then raise exception 'Bullet insert requires text and item_id.' using errcode='22023'; end if;
  else
    if target='experience_items' then select to_jsonb(i) into before_row from public.experience_items i where id=target_id for update;
    else select to_jsonb(b) into before_row from public.experience_bullets b where id=target_id for update; end if;
    if before_row is null then raise exception 'Experience target no longer exists.' using errcode='22023'; end if;
  end if;
  if action='delete' then
    delete from public.experience_bullets where id=target_id;
  elsif target='experience_items' then
    payload := coalesce(before_row,jsonb_build_object('id',target_id,'kind','role','title','','org','','dates','','location','','summary','','sort',100,'public',false,'show_on_journey',false,'journey_icon','briefcase')) || fields;
    select * into item from jsonb_populate_record(null::public.experience_items,payload);
    if action='insert' then insert into public.experience_items(id,kind,title,org,dates,location,summary,sort,public,show_on_journey,journey_icon) values(target_id,item.kind,item.title,item.org,item.dates,item.location,item.summary,item.sort,item.public,item.show_on_journey,item.journey_icon);
    else update public.experience_items set kind=item.kind,title=item.title,org=item.org,dates=item.dates,location=item.location,summary=item.summary,sort=item.sort,public=item.public,show_on_journey=item.show_on_journey,journey_icon=item.journey_icon where id=target_id; end if;
  else
    payload := coalesce(before_row,jsonb_build_object('id',target_id,'text','','sort',100,'public',false)) || fields;
    select * into bullet from jsonb_populate_record(null::public.experience_bullets,payload);
    if not exists(select 1 from public.experience_items where id=bullet.item_id) then raise exception 'Bullet parent item does not exist.' using errcode='22023'; end if;
    if action='insert' then insert into public.experience_bullets(id,item_id,text,sort,public) values(target_id,bullet.item_id,bullet.text,bullet.sort,bullet.public);
    else update public.experience_bullets set item_id=bullet.item_id,text=bullet.text,sort=bullet.sort,public=bullet.public where id=target_id; end if;
  end if;
  return jsonb_build_object('op',action,'table',target,'key',target_id,'values',before_row);
end;
$$;
revoke all on function private.apply_experience_draft(jsonb) from public,anon,authenticated,service_role;


-- Verified owner uploads append project screenshots or insert About photos atomically.
-- Existing bucket policies are unchanged.
create or replace function private.apply_draft_photos(set_id uuid, slots jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare
 slot jsonb; target jsonb; slot_name text; filename text; object_path text; target_id uuid;
 bucket text; fields jsonb; names text[]:=array[]::text[]; shots text[]; metadata jsonb; history jsonb:='[]'::jsonb;
begin
 if auth.uid() is null or not rls.is_owner() then raise exception 'Only the owner can approve photo slots.' using errcode='42501'; end if;
 if jsonb_typeof(slots) is distinct from 'array' or jsonb_array_length(slots)>6 then raise exception 'Use at most 6 photo slots.' using errcode='22023'; end if;
 for slot in select value from jsonb_array_elements(slots) loop
  if jsonb_typeof(slot) is distinct from 'object' or (slot-array['slot','expected_filename','bucket','target','caption','path','alt','sort','centre','public']::text[])<>'{}'::jsonb or not(slot ?& array['slot','expected_filename','bucket','target','caption','path']) then raise exception 'Invalid photo slot fields.' using errcode='22023'; end if;
  bucket:=slot->>'bucket';slot_name:=slot->>'slot';filename:=slot->>'expected_filename';target:=slot->'target';
  if jsonb_typeof(slot->'slot') is distinct from 'string' or slot_name !~ '^[a-z0-9][a-z0-9-]{0,59}$' or slot_name=any(names) then raise exception 'Photo slot names must be valid and unique.' using errcode='22023'; end if;
  names:=array_append(names,slot_name);
  if jsonb_typeof(slot->'expected_filename') is distinct from 'string' or filename !~ '^[a-z0-9]+(-[a-z0-9]+)*\.(png|jpg|webp)$' or char_length(regexp_replace(filename,'\.(png|jpg|webp)$',''))>60 then raise exception 'Invalid expected photo filename.' using errcode='22023'; end if;
  if (bucket is null or bucket not in ('project-media','home-media')) or jsonb_typeof(slot->'caption') is distinct from 'string' or char_length(slot->>'caption') not between 1 and 240 or btrim(slot->>'caption')='' then raise exception 'Use a supported media bucket and a photo caption.' using errcode='22023'; end if;
  if jsonb_typeof(target) is distinct from 'object' or (target-array['table','key','field']::text[])<>'{}'::jsonb or (bucket='project-media' and (target->>'table' is distinct from 'projects' or target->>'field' is distinct from 'screenshots')) or (bucket='home-media' and (target->>'table' is distinct from 'about_photos' or target->>'field' is distinct from 'path')) or jsonb_typeof(target->'key') is distinct from 'string' or target->>'key' !~* '^([0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$' then raise exception 'Unknown photo target. Use project screenshots or a new About photo.' using errcode='22023'; end if;
  target_id:=(target->>'key')::uuid;
  object_path:='drafts/'||set_id::text||'/'||slot_name||'/'||filename;
  if jsonb_typeof(slot->'path') is distinct from 'string' or slot->>'path' is distinct from object_path then raise exception 'Upload every expected photo to its matching draft slot before approving.' using errcode='22023'; end if;
  select o.metadata into metadata from storage.objects o where o.bucket_id=bucket and o.name=object_path and o.owner_id=auth.uid()::text for share;
  if not found or metadata->>'mimetype' not in ('image/png','image/jpeg','image/webp') or metadata->>'mimetype' is null or metadata->>'size' is null or (metadata->>'size')::numeric not between 0 and 5242880 then raise exception 'Photo must exist, belong to the owner, use PNG/JPG/WebP and be at most 5 MB.' using errcode='22023'; end if;
  if bucket='home-media' then
   if not(slot ?& array['alt','sort']) then raise exception 'About photo slots require alt and sort.' using errcode='22023'; end if;
   fields:=jsonb_build_object('path',object_path,'caption',slot->'caption','alt',slot->'alt','sort',slot->'sort','centre',coalesce(slot->'centre','false'::jsonb),'public',coalesce(slot->'public','false'::jsonb));
   history:=history||jsonb_build_array(private.apply_about_photo_draft(jsonb_build_object('op','insert','table','about_photos','key',target_id::text,'fields',fields)));
   continue;
  end if;
  if slot ?| array['alt','sort','centre','public'] then raise exception 'Unknown project screenshot slot fields.' using errcode='22023'; end if;
  select p.screenshots into shots from public.projects p where p.id=target_id for update;
  if not found then raise exception 'Screenshot target project no longer exists.' using errcode='22023'; end if;
  if not (private.draft_media_url(bucket,object_path)=any(shots)) then shots:=array_append(shots,private.draft_media_url(bucket,object_path)); end if;
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

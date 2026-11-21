-- Optional per-stop journey photo. NOT applied live: awaits Jamie's "apply it".
-- Adds experience_items.journey_photo (a home-media path, '' = none) and lets Content Drafts set it by
-- replacing private.apply_experience_draft (copied from 20261116165138_home_v13_data.sql with the new field).
-- RLS/grants are unchanged: the existing owner policies cover the new column; public readers already see public rows.
alter table public.experience_items add column journey_photo text not null default ''
 check (journey_photo='' or (char_length(journey_photo)<=240 and journey_photo ~ '^[a-zA-Z0-9_-]+(/[a-zA-Z0-9_-]+)*\.(png|jpg|webp)$'));

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
    if (target='experience_items' and field_name not in ('kind','title','org','dates','location','summary','sort','public','show_on_journey','journey_icon','journey_photo')) or
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
      if field_name='journey_photo' then
        if value_text<>'' and (char_length(value_text)>240 or value_text !~ '^[a-zA-Z0-9_-]+(/[a-zA-Z0-9_-]+)*\.(png|jpg|webp)$') then raise exception 'Journey photo must be a home-media path ending in .png, .jpg or .webp.' using errcode='22023'; end if;
      elsif field_name='journey_icon' then
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
    payload := coalesce(before_row,jsonb_build_object('id',target_id,'kind','role','title','','org','','dates','','location','','summary','','sort',100,'public',false,'show_on_journey',false,'journey_icon','briefcase','journey_photo','')) || fields;
    select * into item from jsonb_populate_record(null::public.experience_items,payload);
    if action='insert' then insert into public.experience_items(id,kind,title,org,dates,location,summary,sort,public,show_on_journey,journey_icon,journey_photo) values(target_id,item.kind,item.title,item.org,item.dates,item.location,item.summary,item.sort,item.public,item.show_on_journey,item.journey_icon,item.journey_photo);
    else update public.experience_items set kind=item.kind,title=item.title,org=item.org,dates=item.dates,location=item.location,summary=item.summary,sort=item.sort,public=item.public,show_on_journey=item.show_on_journey,journey_icon=item.journey_icon,journey_photo=item.journey_photo where id=target_id; end if;
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

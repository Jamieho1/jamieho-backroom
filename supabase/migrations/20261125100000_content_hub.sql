-- H1 Content hub: series, post codes, takeaways, slides and guide facts. NOT applied live; apply only after Jamie says "apply it".
-- Requires the PL2 migration (PassLoop repo, 20261124120000_content_changes_site.sql: content_changes.site and
-- private.content_change_site) to be live first. No content is created or backfilled: every new column is empty/null by default.
--  * public.content_series: published rows readable by everyone, owner-only writes (same policies as guides).
--  * articles/guides gain series_id + series_part (both set or both null); a part number is unique per series across BOTH tables
--    (trigger + advisory lock). Deleting a series detaches its members (series_id and series_part cleared together).
--  * articles gain code (unique, uppercase letters/digits), takeaway, slides; guides gain audience, highlights, exercises.
--  * private.apply_publishing_draft accepts content_series and the new fields (mirrors lib/content-drafts/allowlist.ts).
--  * private.apply_content_change is replaced in full: it is the PL2 body with content_series added to the publishing dispatch.
--    Any later replacement of that function (in either repo) must keep 'content_series' in that list.

create table public.content_series (
 id uuid primary key default gen_random_uuid(),
 slug text not null unique check (char_length(slug)<=80 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and slug not in ('manage','new','edit')),
 title text not null check (char_length(title) between 1 and 80),
 goal text not null default '' check (char_length(goal)<=200),
 topic text not null default 'ai' check (topic in ('ai','career','productivity','building')),
 planned_parts integer not null default 1 check (planned_parts between 1 and 50),
 sort integer not null default 100 check (sort between -1000 and 1000),
 published boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index content_series_public on public.content_series(published,sort);
alter table public.content_series enable row level security;
revoke all on public.content_series from anon,authenticated;
grant select on public.content_series to anon,authenticated;
grant insert,update,delete on public.content_series to authenticated;
create policy "content_series: published or owner reads" on public.content_series for select to anon,authenticated using (published or (select rls.is_owner()));
create policy "content_series: owner inserts" on public.content_series for insert to authenticated with check ((select rls.is_owner()));
create policy "content_series: owner updates" on public.content_series for update to authenticated using ((select rls.is_owner())) with check ((select rls.is_owner()));
create policy "content_series: owner deletes" on public.content_series for delete to authenticated using ((select rls.is_owner()));
create trigger content_series_touch before update on public.content_series for each row execute function private.touch_updated_at();

-- Pure validators used by CHECK constraints (run as the writing role, like valid_project_highlights).
create function private.valid_article_slides(value text[]) returns boolean
language sql immutable set search_path='' as $$
 select value is not null and coalesce(array_ndims(value),1)=1 and cardinality(value)<=20
 and not exists(select 1 from unnest(value) v where v is null or char_length(v)>2048 or v !~ '^https://.' or v ~ '[[:space:][:cntrl:]]' or position(chr(92) in v)>0);
$$;
revoke all on function private.valid_article_slides(text[]) from public,anon,authenticated,service_role;
grant execute on function private.valid_article_slides(text[]) to authenticated;
create function private.valid_guide_highlights(value text[]) returns boolean
language sql immutable set search_path='' as $$
 select value is not null and coalesce(array_ndims(value),1)=1 and cardinality(value)<=3
 and not exists(select 1 from unnest(value) v where v is null or char_length(v) not between 1 and 80 or v !~ '[^[:space:]]');
$$;
revoke all on function private.valid_guide_highlights(text[]) from public,anon,authenticated,service_role;
grant execute on function private.valid_guide_highlights(text[]) to authenticated;

alter table public.articles
 add column series_id uuid references public.content_series(id) on delete set null,
 add column series_part integer constraint articles_series_part_range check (series_part between 1 and 50),
 add column code text constraint articles_code_valid check (code ~ '^[A-Z0-9]{1,16}$') constraint articles_code_key unique,
 add column takeaway text not null default '' constraint articles_takeaway_len check (char_length(takeaway)<=160),
 add column slides text[] not null default '{}' constraint articles_slides_valid check (private.valid_article_slides(slides)),
 add constraint articles_series_pair check ((series_id is null)=(series_part is null));
alter table public.guides
 add column series_id uuid references public.content_series(id) on delete set null,
 add column series_part integer constraint guides_series_part_range check (series_part between 1 and 50),
 add column audience text not null default '' constraint guides_audience_len check (char_length(audience)<=200),
 add column highlights text[] not null default '{}' constraint guides_highlights_valid check (private.valid_guide_highlights(highlights)),
 add column exercises integer constraint guides_exercises_range check (exercises between 0 and 999),
 add constraint guides_series_pair check ((series_id is null)=(series_part is null));
create index articles_series on public.articles(series_id,series_part) where series_id is not null;
create index guides_series on public.guides(series_id,series_part) where series_id is not null;

-- A part number belongs to one article OR one guide per series. The advisory lock serialises concurrent writers
-- (including one writing an article while another writes a guide); SECURITY DEFINER so RLS cannot hide the other table's rows.
create function private.check_series_part() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if new.series_id is null then return new; end if;
 perform pg_advisory_xact_lock(hashtextextended(new.series_id::text,0));
 if exists(select 1 from public.articles a where a.series_id=new.series_id and a.series_part=new.series_part and not (tg_table_name='articles' and a.id=new.id))
  or exists(select 1 from public.guides g where g.series_id=new.series_id and g.series_part=new.series_part and not (tg_table_name='guides' and g.id=new.id)) then
  raise exception 'Part % of this series is already used by another article or guide.',new.series_part using errcode='23505';
 end if;
 return new;
end;
$$;
revoke all on function private.check_series_part() from public,anon,authenticated,service_role;
create trigger articles_series_part before insert or update of series_id,series_part on public.articles for each row execute function private.check_series_part();
create trigger guides_series_part before insert or update of series_id,series_part on public.guides for each row execute function private.check_series_part();

-- Deleting a series detaches its posts and guides (series_id and series_part are cleared together so the pair CHECK holds).
create function private.detach_series_members() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 update public.articles set series_id=null,series_part=null where series_id=old.id;
 update public.guides set series_id=null,series_part=null where series_id=old.id;
 return old;
end;
$$;
revoke all on function private.detach_series_members() from public,anon,authenticated,service_role;
create trigger content_series_detach before delete on public.content_series for each row execute function private.detach_series_members();


create or replace function private.apply_publishing_draft(operation jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare
 target text:=operation->>'table'; action text:=operation->>'op'; target_id uuid;
 fields jsonb:=operation->'fields'; before_row jsonb; payload jsonb; allowed text[];
 field_name text; value jsonb; value_text text; element jsonb; normalized jsonb; max_length integer;
 p public.projects; a public.articles; g public.guides; s public.content_series;
 trim_chars text:=chr(9)||chr(10)||chr(11)||chr(12)||chr(13)||chr(32)||chr(160)||chr(5760)||chr(8192)||chr(8193)||chr(8194)||chr(8195)||chr(8196)||chr(8197)||chr(8198)||chr(8199)||chr(8200)||chr(8201)||chr(8202)||chr(8232)||chr(8233)||chr(8239)||chr(8287)||chr(12288)||chr(65279);
begin
 if auth.uid() is null or not rls.is_owner() then raise exception 'Only the owner can approve publishing drafts.' using errcode='42501'; end if;
 if target is null or target not in ('projects','articles','guides','content_series') or (operation-array['op','table','key','fields']::text[])<>'{}'::jsonb then raise exception 'Unknown publishing table or operation property.' using errcode='22023'; end if;
 if action is null or action not in ('insert','update','delete') then raise exception 'Unsupported publishing operation.' using errcode='22023'; end if;
 if jsonb_typeof(operation->'key') is distinct from 'string' or (operation->>'key') !~* '^([0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$' then raise exception 'Publishing key must be a UUID.' using errcode='22023'; end if;
 target_id:=(operation->>'key')::uuid;
 if action='delete' and fields is null then fields:='{}'::jsonb; end if;
 if jsonb_typeof(fields) is distinct from 'object' then raise exception 'Publishing fields must be an object.' using errcode='22023'; end if;
 if action='delete' and fields<>'{}'::jsonb then raise exception 'Delete accepts no fields; it only unpublishes.' using errcode='22023'; end if;
 if action<>'delete' and fields='{}'::jsonb then raise exception 'Choose at least one editable field.' using errcode='22023'; end if;
 allowed:=case target when 'projects' then array['slug','name','tagline','body','tags','screenshots','highlights','capabilities','status','diagram','url','featured','public','sort'] when 'articles' then array['slug','title','summary','body','platform','category','source_url','cover_url','project_id','series_id','series_part','code','takeaway','slides','published'] when 'guides' then array['slug','title','summary','body','notion_url','doc_url','cover_url','series_id','series_part','audience','highlights','exercises','published'] else array['slug','title','goal','topic','planned_parts','sort','published'] end;
 if (fields-allowed)<>'{}'::jsonb then raise exception 'Unknown editable publishing field.' using errcode='22023'; end if;
 if action='insert' then
  if not(fields?'slug') or not(fields?(case target when 'projects' then 'name' else 'title' end)) then raise exception 'Insert requires a slug and name/title.' using errcode='22023'; end if;
  payload:=case target when 'projects' then '{"tagline":"","body":"","tags":[],"screenshots":[],"highlights":[],"capabilities":[],"status":"","diagram":null,"url":"","featured":false,"public":false,"sort":100}'::jsonb when 'articles' then '{"summary":"","body":"","platform":"other","category":"ai","source_url":"","cover_url":"","project_id":null,"series_id":null,"series_part":null,"code":null,"takeaway":"","slides":[],"published":false}'::jsonb when 'guides' then '{"summary":"","body":"","notion_url":"","doc_url":"","cover_url":"","series_id":null,"series_part":null,"audience":"","highlights":[],"exercises":null,"published":false}'::jsonb else '{"goal":"","topic":"ai","planned_parts":1,"sort":100,"published":false}'::jsonb end || jsonb_build_object('id',target_id) || fields;
 else
  -- The table name has already passed the fixed allowlist; no user-supplied SQL identifiers or expressions.
  execute format('select to_jsonb(t) from public.%I t where id=$1 for update',target) into before_row using target_id;
  if before_row is null then raise exception 'Publishing target no longer exists.' using errcode='22023'; end if;
  payload:=before_row||fields;
 end if;
 if action='delete' then
  execute format('update public.%I set %I=false where id=$1',target,case target when 'projects' then 'public' else 'published' end) using target_id;
  return jsonb_build_object('op',action,'table',target,'key',target_id,'values',before_row);
 end if;
 -- Validate the complete merged row, with the editor's field rules and normalisation.
 foreach field_name in array allowed loop
  value:=payload->field_name;
  if field_name in ('public','published','featured') then
   if jsonb_typeof(value) is distinct from 'boolean' then raise exception 'Field % must be boolean.',field_name using errcode='22023'; end if;
  elsif field_name='sort' then
   if jsonb_typeof(value) is distinct from 'number' then raise exception 'sort must be an integer from -1000 to 1000.' using errcode='22023'; end if;
   if (value#>>'{}')::numeric<>trunc((value#>>'{}')::numeric) or (value#>>'{}')::numeric not between -1000 and 1000 then raise exception 'sort must be an integer from -1000 to 1000.' using errcode='22023'; end if;
   payload:=jsonb_set(payload,array[field_name],to_jsonb(((value#>>'{}')::numeric)::integer));
  elsif field_name='highlights' then
   if jsonb_typeof(value) is distinct from 'array' then raise exception 'highlights must be an array.' using errcode='22023'; end if;
   if jsonb_array_length(value)>3 then raise exception 'At most three highlights.' using errcode='22023'; end if;
   normalized:='[]'::jsonb;
   for element in select v from jsonb_array_elements(value) as e(v) loop
    if jsonb_typeof(element) is distinct from 'string' then raise exception 'Highlights must be text.' using errcode='22023'; end if;
    value_text:=btrim(element#>>'{}',trim_chars);
    if char_length(value_text) not between 1 and (case target when 'guides' then 80 else 400 end) then raise exception 'Highlight length must be 1 to % characters.',(case target when 'guides' then 80 else 400 end) using errcode='22023'; end if;
    normalized:=normalized||jsonb_build_array(value_text);
   end loop;
   payload:=jsonb_set(payload,array[field_name],normalized);
  elsif field_name='capabilities' then
   if jsonb_typeof(value) is distinct from 'array' then raise exception 'capabilities must be an array.' using errcode='22023'; end if;
   if jsonb_array_length(value)>5 then raise exception 'At most five capabilities.' using errcode='22023'; end if;
   normalized:='[]'::jsonb;
   for element in select v from jsonb_array_elements(value) as e(v) loop
    if jsonb_typeof(element) is distinct from 'string' or (element#>>'{}') not in ('01','02','03','04','05') then raise exception 'Capabilities must be 01 to 05.' using errcode='22023'; end if;
    if normalized@>jsonb_build_array(element) then raise exception 'Capabilities must be unique.' using errcode='22023'; end if;
    normalized:=normalized||jsonb_build_array(element);
   end loop;
   payload:=jsonb_set(payload,array[field_name],normalized);
  elsif field_name in ('series_part','exercises','planned_parts') then
   if value is null or (value='null'::jsonb and field_name='planned_parts') then raise exception '% is required.',field_name using errcode='22023'; end if;
   if value<>'null'::jsonb then
    if jsonb_typeof(value) is distinct from 'number' then raise exception '% must be a whole number.',field_name using errcode='22023'; end if;
    if (value#>>'{}')::numeric<>trunc((value#>>'{}')::numeric) or (value#>>'{}')::numeric not between (case field_name when 'exercises' then 0 else 1 end) and (case field_name when 'exercises' then 999 else 50 end) then raise exception '% is outside its allowed range.',field_name using errcode='22023'; end if;
    payload:=jsonb_set(payload,array[field_name],to_jsonb(((value#>>'{}')::numeric)::integer));
   end if;
  elsif field_name='series_id' then
   if value is null then raise exception 'series_id is required.' using errcode='22023'; end if;
   if value<>'null'::jsonb and (jsonb_typeof(value) is distinct from 'string' or (value#>>'{}') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') then raise exception 'series_id must be a UUID or null.' using errcode='22023'; end if;
  elsif field_name='code' then
   if value is null then raise exception 'code is required.' using errcode='22023'; end if;
   if value<>'null'::jsonb and (jsonb_typeof(value) is distinct from 'string' or (value#>>'{}') !~ '^[A-Z0-9]{1,16}$') then raise exception 'Code must be 1 to 16 uppercase letters or digits.' using errcode='22023'; end if;
  elsif field_name='diagram' then
   if value is not null and value<>'null'::jsonb and not private.valid_project_diagram(value) then raise exception 'diagram is not a valid project diagram.' using errcode='22023'; end if;
  elsif field_name in ('tags','screenshots','slides') then
   if jsonb_typeof(value) is distinct from 'array' then raise exception 'Field % must be an array.',field_name using errcode='22023'; end if;
   if jsonb_array_length(value)>(case field_name when 'tags' then 8 when 'screenshots' then 6 else 20 end) then raise exception 'Too many %.',field_name using errcode='22023'; end if;
   normalized:='[]'::jsonb;
   for element in select v from jsonb_array_elements(value) as e(v) loop
    if jsonb_typeof(element) is distinct from 'string' then raise exception 'Array entries must be text.' using errcode='22023'; end if;
    value_text:=element#>>'{}';
    if field_name='tags' then value_text:=btrim(value_text,trim_chars); if char_length(value_text) not between 1 and 24 then raise exception 'Each tag must contain 1 to 24 characters.' using errcode='22023'; end if;
    elsif (select coalesce(sum(case when ascii(substr(value_text,n,1))>65535 then 2 else 1 end),0) from generate_series(1,char_length(value_text)) n)>2048 or value_text='' or not private.draft_https(value_text) then raise exception '% must be valid HTTPS URLs.',(case field_name when 'slides' then 'Slides' else 'Screenshots' end) using errcode='22023'; end if;
    normalized:=normalized||jsonb_build_array(value_text);
   end loop;
   payload:=jsonb_set(payload,array[field_name],normalized);
  else
   if field_name='project_id' and value='null'::jsonb then continue; end if;
   if jsonb_typeof(value) is distinct from 'string' then raise exception 'Field % must be text.',field_name using errcode='22023'; end if;
   value_text:=value#>>'{}';
   if field_name in ('name','title','tagline','url','status') then value_text:=btrim(value_text,trim_chars); end if;
   max_length:=case field_name when 'slug' then 80 when 'name' then 80 when 'title' then (case target when 'content_series' then 80 else 160 end) when 'tagline' then 160 when 'goal' then 200 when 'takeaway' then 160 when 'audience' then 200 when 'status' then 80 when 'summary' then 600 when 'body' then case target when 'projects' then 50000 else 200000 end when 'project_id' then 80 else 2048 end;
   if target='projects' and field_name='url' and (select coalesce(sum(case when ascii(substr(value_text,n,1))>65535 then 2 else 1 end),0) from generate_series(1,char_length(value_text)) n)>2048 then raise exception 'Project URL is too long.' using errcode='22023'; end if;
   if char_length(value_text)>max_length then raise exception 'Field % is too long.',field_name using errcode='22023'; end if;
   if field_name in ('name','title') and value_text='' then raise exception 'Name/title cannot be blank.' using errcode='22023'; end if;
   if field_name='slug' and (value_text !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or value_text in ('manage','new','edit')) then raise exception 'Invalid or reserved slug.' using errcode='22023'; end if;
   if field_name='platform' and value_text not in ('youtube','instagram','xiaohongshu','other') then raise exception 'Unknown article platform.' using errcode='22023'; end if;
   if field_name='category' and value_text not in ('ai','career','productivity','building') then raise exception 'Unknown article category.' using errcode='22023'; end if;
   if field_name='topic' and value_text not in ('ai','career','productivity','building') then raise exception 'Unknown series topic.' using errcode='22023'; end if;
   if (field_name='url' or field_name like '%\_url' escape '\') and not private.draft_https(value_text) then raise exception 'Links must be valid HTTPS URLs.' using errcode='22023'; end if;
   payload:=jsonb_set(payload,array[field_name],to_jsonb(value_text));
  end if;
 end loop;
 if target in ('articles','guides') and ((payload->'series_id')='null'::jsonb) is distinct from ((payload->'series_part')='null'::jsonb) then raise exception 'Set series_id and series_part together.' using errcode='22023'; end if;
 if target='projects' then
  select * into p from jsonb_populate_record(null::public.projects,payload);
  if action='insert' then insert into public.projects(id,slug,name,tagline,body,tags,screenshots,highlights,capabilities,status,diagram,url,featured,public,sort) values(target_id,p.slug,p.name,p.tagline,p.body,p.tags,p.screenshots,p.highlights,p.capabilities,p.status,p.diagram,p.url,p.featured,p.public,p.sort);
  else update public.projects set slug=p.slug,name=p.name,tagline=p.tagline,body=p.body,tags=p.tags,screenshots=p.screenshots,highlights=p.highlights,capabilities=p.capabilities,status=p.status,diagram=p.diagram,url=p.url,featured=p.featured,public=p.public,sort=p.sort where id=target_id; end if;
 elsif target='articles' then
  select * into a from jsonb_populate_record(null::public.articles,payload);
  if action='insert' then insert into public.articles(id,slug,title,summary,body,platform,category,source_url,cover_url,project_id,series_id,series_part,code,takeaway,slides,published) values(target_id,a.slug,a.title,a.summary,a.body,a.platform,a.category,a.source_url,a.cover_url,a.project_id,a.series_id,a.series_part,a.code,a.takeaway,a.slides,a.published);
  else update public.articles set slug=a.slug,title=a.title,summary=a.summary,body=a.body,platform=a.platform,category=a.category,source_url=a.source_url,cover_url=a.cover_url,project_id=a.project_id,series_id=a.series_id,series_part=a.series_part,code=a.code,takeaway=a.takeaway,slides=a.slides,published=a.published where id=target_id; end if;
 elsif target='guides' then
  select * into g from jsonb_populate_record(null::public.guides,payload);
  if action='insert' then insert into public.guides(id,slug,title,summary,body,notion_url,doc_url,cover_url,series_id,series_part,audience,highlights,exercises,published) values(target_id,g.slug,g.title,g.summary,g.body,g.notion_url,g.doc_url,g.cover_url,g.series_id,g.series_part,g.audience,g.highlights,g.exercises,g.published);
  else update public.guides set slug=g.slug,title=g.title,summary=g.summary,body=g.body,notion_url=g.notion_url,doc_url=g.doc_url,cover_url=g.cover_url,series_id=g.series_id,series_part=g.series_part,audience=g.audience,highlights=g.highlights,exercises=g.exercises,published=g.published where id=target_id; end if;
 elsif target='content_series' then
  select * into s from jsonb_populate_record(null::public.content_series,payload);
  if action='insert' then insert into public.content_series(id,slug,title,goal,topic,planned_parts,sort,published) values(target_id,s.slug,s.title,s.goal,s.topic,s.planned_parts,s.sort,s.published);
  else update public.content_series set slug=s.slug,title=s.title,goal=s.goal,topic=s.topic,planned_parts=s.planned_parts,sort=s.sort,published=s.published where id=target_id; end if;
 end if;
 return jsonb_build_object('op',action,'table',target,'key',target_id,'values',before_row);
end;
$$;
revoke all on function private.apply_publishing_draft(jsonb) from public,anon,authenticated,service_role;

-- Site classification (PL2): content_series belongs to the personal site.
create or replace function private.content_change_site(target text) returns text
language sql immutable set search_path = '' as $$
  select case
    when target in ('notes','question_notes','practice_code','practice_stars','resume_templates',
      'interview_behavioral_themes','interview_behavioral_questions','companies','company_questions',
      'interview_experiences','system_design_questions') then 'passloop'
    when target in ('projects','articles','guides','content_series','site_sections','experience_items','experience_bullets',
      'about_photos','behavioral_stories','behavioral_answers') then 'personal'
  end
$$;
revoke all on function private.content_change_site(text) from public, anon, authenticated, service_role;

-- Approval trigger: the PL2 definition (20261124120000_content_changes_site.sql in PassLoop) with content_series dispatched
-- to private.apply_publishing_draft.
create or replace function private.apply_content_change() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  operation jsonb;
  field_name text;
  section_key text;
  old_values jsonb;
  history jsonb := '[]'::jsonb;
  field_count integer;
  site_of text;
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
  -- PL2: a change set belongs to one site. Photo slots write personal-site media and tables.
  if NEW.photo_slots <> '[]'::jsonb and NEW.site <> 'personal' then
    raise exception 'Photo slots belong to the personal site.' using errcode = '22023';
  end if;
  for operation in select value from jsonb_array_elements(NEW.operations) loop
    site_of := case when jsonb_typeof(operation) = 'object' then private.content_change_site(operation->>'table') end;
    if site_of is not null and site_of <> NEW.site then
      raise exception 'Change set for site % cannot change % tables.', NEW.site, site_of using errcode = '22023';
    end if;
  end loop;
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
    if operation->>'table' in ('projects','articles','guides','content_series') then
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


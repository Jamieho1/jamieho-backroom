-- Projects pages redesign: capabilities (01-05), optional status line and optional how-it-works diagram.
-- NOT applied live; apply only after Jamie says "apply it". Existing project RLS/grants and the editor are unchanged;
-- no content is seeded. Content Drafts approval accepts the new fields (see lib/content-drafts/allowlist.ts).
create function private.valid_project_capabilities(value text[]) returns boolean
language sql immutable set search_path='' as $$
 select value is not null and coalesce(array_ndims(value),1)=1 and cardinality(value)<=5
 and value<@array['01','02','03','04','05']::text[]
 and cardinality(value)=(select count(distinct v) from unnest(value) v);
$$;
revoke all on function private.valid_project_capabilities(text[]) from public,anon,authenticated,service_role;
grant execute on function private.valid_project_capabilities(text[]) to authenticated;

-- Pure validator mirroring lib/project-diagram.ts: {title,caption?,nodes:[{id,title,lines?,highlight?}],edges:[{from,to,highlight?}]}.
create function private.valid_project_diagram(d jsonb) returns boolean
language plpgsql immutable set search_path='' as $$
declare node jsonb; edge jsonb; line jsonb; ids text[]:='{}'; pairs text[]:='{}'; v text; pair text;
begin
 if jsonb_typeof(d) is distinct from 'object' then return false; end if;
 if (d-array['title','caption','nodes','edges']::text[])<>'{}'::jsonb then return false; end if;
 if jsonb_typeof(d->'title') is distinct from 'string' or char_length(d->>'title') not between 1 and 120 or (d->>'title')<>btrim(d->>'title') then return false; end if;
 if d?'caption' and (jsonb_typeof(d->'caption') is distinct from 'string' or char_length(d->>'caption')>400) then return false; end if;
 if jsonb_typeof(d->'nodes') is distinct from 'array' or jsonb_array_length(d->'nodes') not between 1 and 12 then return false; end if;
 if jsonb_typeof(d->'edges') is distinct from 'array' or jsonb_array_length(d->'edges')>24 then return false; end if;
 for node in select e.v from jsonb_array_elements(d->'nodes') as e(v) loop
  if jsonb_typeof(node) is distinct from 'object' or (node-array['id','title','lines','highlight']::text[])<>'{}'::jsonb then return false; end if;
  if jsonb_typeof(node->'id') is distinct from 'string' then return false; end if;
  v:=node->>'id';
  if v !~ '^[a-z0-9][a-z0-9-]{0,39}$' or v=any(ids) then return false; end if;
  ids:=ids||v;
  if jsonb_typeof(node->'title') is distinct from 'string' or char_length(node->>'title') not between 1 and 80 or (node->>'title')<>btrim(node->>'title') then return false; end if;
  if node?'lines' then
   if jsonb_typeof(node->'lines') is distinct from 'array' or jsonb_array_length(node->'lines')>3 then return false; end if;
   for line in select e.v from jsonb_array_elements(node->'lines') as e(v) loop
    if jsonb_typeof(line) is distinct from 'string' or char_length(line#>>'{}') not between 1 and 60 or (line#>>'{}')<>btrim(line#>>'{}') then return false; end if;
   end loop;
  end if;
  if node?'highlight' and jsonb_typeof(node->'highlight') is distinct from 'boolean' then return false; end if;
 end loop;
 for edge in select e.v from jsonb_array_elements(d->'edges') as e(v) loop
  if jsonb_typeof(edge) is distinct from 'object' or (edge-array['from','to','highlight']::text[])<>'{}'::jsonb then return false; end if;
  if jsonb_typeof(edge->'from') is distinct from 'string' or jsonb_typeof(edge->'to') is distinct from 'string' then return false; end if;
  if not ((edge->>'from')=any(ids)) or not ((edge->>'to')=any(ids)) or (edge->>'from')=(edge->>'to') then return false; end if;
  pair:=(edge->>'from')||'>'||(edge->>'to');
  if pair=any(pairs) then return false; end if;
  pairs:=pairs||pair;
  if edge?'highlight' and jsonb_typeof(edge->'highlight') is distinct from 'boolean' then return false; end if;
 end loop;
 return octet_length(d::text)<=12000;
end;
$$;
revoke all on function private.valid_project_diagram(jsonb) from public,anon,authenticated,service_role;
grant execute on function private.valid_project_diagram(jsonb) to authenticated;

alter table public.projects
 add column capabilities text[] not null default '{}' constraint projects_capabilities_valid check (private.valid_project_capabilities(capabilities)),
 add column status text not null default '' constraint projects_status_valid check (char_length(status)<=80),
 add column diagram jsonb constraint projects_diagram_valid check (diagram is null or private.valid_project_diagram(diagram));

create or replace function private.apply_publishing_draft(operation jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare
 target text:=operation->>'table'; action text:=operation->>'op'; target_id uuid;
 fields jsonb:=operation->'fields'; before_row jsonb; payload jsonb; allowed text[];
 field_name text; value jsonb; value_text text; element jsonb; normalized jsonb; max_length integer;
 p public.projects; a public.articles; g public.guides;
 trim_chars text:=chr(9)||chr(10)||chr(11)||chr(12)||chr(13)||chr(32)||chr(160)||chr(5760)||chr(8192)||chr(8193)||chr(8194)||chr(8195)||chr(8196)||chr(8197)||chr(8198)||chr(8199)||chr(8200)||chr(8201)||chr(8202)||chr(8232)||chr(8233)||chr(8239)||chr(8287)||chr(12288)||chr(65279);
begin
 if auth.uid() is null or not rls.is_owner() then raise exception 'Only the owner can approve publishing drafts.' using errcode='42501'; end if;
 if target is null or target not in ('projects','articles','guides') or (operation-array['op','table','key','fields']::text[])<>'{}'::jsonb then raise exception 'Unknown publishing table or operation property.' using errcode='22023'; end if;
 if action is null or action not in ('insert','update','delete') then raise exception 'Unsupported publishing operation.' using errcode='22023'; end if;
 if jsonb_typeof(operation->'key') is distinct from 'string' or (operation->>'key') !~* '^([0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$' then raise exception 'Publishing key must be a UUID.' using errcode='22023'; end if;
 target_id:=(operation->>'key')::uuid;
 if action='delete' and fields is null then fields:='{}'::jsonb; end if;
 if jsonb_typeof(fields) is distinct from 'object' then raise exception 'Publishing fields must be an object.' using errcode='22023'; end if;
 if action='delete' and fields<>'{}'::jsonb then raise exception 'Delete accepts no fields; it only unpublishes.' using errcode='22023'; end if;
 if action<>'delete' and fields='{}'::jsonb then raise exception 'Choose at least one editable field.' using errcode='22023'; end if;
 allowed:=case target when 'projects' then array['slug','name','tagline','body','tags','screenshots','highlights','capabilities','status','diagram','url','featured','public','sort'] when 'articles' then array['slug','title','summary','body','platform','category','source_url','cover_url','project_id','published'] else array['slug','title','summary','body','notion_url','doc_url','cover_url','published'] end;
 if (fields-allowed)<>'{}'::jsonb then raise exception 'Unknown editable publishing field.' using errcode='22023'; end if;
 if action='insert' then
  if not(fields?'slug') or not(fields?(case target when 'projects' then 'name' else 'title' end)) then raise exception 'Insert requires a slug and name/title.' using errcode='22023'; end if;
  payload:=case target when 'projects' then '{"tagline":"","body":"","tags":[],"screenshots":[],"highlights":[],"capabilities":[],"status":"","diagram":null,"url":"","featured":false,"public":false,"sort":100}'::jsonb when 'articles' then '{"summary":"","body":"","platform":"other","category":"ai","source_url":"","cover_url":"","project_id":null,"published":false}'::jsonb else '{"summary":"","body":"","notion_url":"","doc_url":"","cover_url":"","published":false}'::jsonb end || jsonb_build_object('id',target_id) || fields;
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
    if char_length(value_text) not between 1 and 400 then raise exception 'Highlight length must be 1 to 400 characters.' using errcode='22023'; end if;
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
  elsif field_name='diagram' then
   if value is not null and value<>'null'::jsonb and not private.valid_project_diagram(value) then raise exception 'diagram is not a valid project diagram.' using errcode='22023'; end if;
  elsif field_name in ('tags','screenshots') then
   if jsonb_typeof(value) is distinct from 'array' then raise exception 'Field % must be an array.',field_name using errcode='22023'; end if;
   if jsonb_array_length(value)>(case field_name when 'tags' then 8 else 6 end) then raise exception 'Too many %.',field_name using errcode='22023'; end if;
   normalized:='[]'::jsonb;
   for element in select v from jsonb_array_elements(value) as e(v) loop
    if jsonb_typeof(element) is distinct from 'string' then raise exception 'Array entries must be text.' using errcode='22023'; end if;
    value_text:=element#>>'{}';
    if field_name='tags' then value_text:=btrim(value_text,trim_chars); if char_length(value_text) not between 1 and 24 then raise exception 'Each tag must contain 1 to 24 characters.' using errcode='22023'; end if;
    elsif (select coalesce(sum(case when ascii(substr(value_text,n,1))>65535 then 2 else 1 end),0) from generate_series(1,char_length(value_text)) n)>2048 or value_text='' or not private.draft_https(value_text) then raise exception 'Screenshots must be valid HTTPS URLs.' using errcode='22023'; end if;
    normalized:=normalized||jsonb_build_array(value_text);
   end loop;
   payload:=jsonb_set(payload,array[field_name],normalized);
  else
   if field_name='project_id' and value='null'::jsonb then continue; end if;
   if jsonb_typeof(value) is distinct from 'string' then raise exception 'Field % must be text.',field_name using errcode='22023'; end if;
   value_text:=value#>>'{}';
   if field_name in ('name','title','tagline','url','status') then value_text:=btrim(value_text,trim_chars); end if;
   max_length:=case field_name when 'slug' then 80 when 'name' then 80 when 'title' then 160 when 'tagline' then 160 when 'status' then 80 when 'summary' then 600 when 'body' then case target when 'projects' then 50000 else 200000 end when 'project_id' then 80 else 2048 end;
   if target='projects' and field_name='url' and (select coalesce(sum(case when ascii(substr(value_text,n,1))>65535 then 2 else 1 end),0) from generate_series(1,char_length(value_text)) n)>2048 then raise exception 'Project URL is too long.' using errcode='22023'; end if;
   if char_length(value_text)>max_length then raise exception 'Field % is too long.',field_name using errcode='22023'; end if;
   if field_name in ('name','title') and value_text='' then raise exception 'Name/title cannot be blank.' using errcode='22023'; end if;
   if field_name='slug' and (value_text !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or value_text in ('manage','new','edit')) then raise exception 'Invalid or reserved slug.' using errcode='22023'; end if;
   if field_name='platform' and value_text not in ('youtube','instagram','xiaohongshu','other') then raise exception 'Unknown article platform.' using errcode='22023'; end if;
   if field_name='category' and value_text not in ('ai','career','productivity','building') then raise exception 'Unknown article category.' using errcode='22023'; end if;
   if (field_name='url' or field_name like '%\_url' escape '\') and not private.draft_https(value_text) then raise exception 'Links must be valid HTTPS URLs.' using errcode='22023'; end if;
   payload:=jsonb_set(payload,array[field_name],to_jsonb(value_text));
  end if;
 end loop;
 if target='projects' then
  select * into p from jsonb_populate_record(null::public.projects,payload);
  if action='insert' then insert into public.projects(id,slug,name,tagline,body,tags,screenshots,highlights,capabilities,status,diagram,url,featured,public,sort) values(target_id,p.slug,p.name,p.tagline,p.body,p.tags,p.screenshots,p.highlights,p.capabilities,p.status,p.diagram,p.url,p.featured,p.public,p.sort);
  else update public.projects set slug=p.slug,name=p.name,tagline=p.tagline,body=p.body,tags=p.tags,screenshots=p.screenshots,highlights=p.highlights,capabilities=p.capabilities,status=p.status,diagram=p.diagram,url=p.url,featured=p.featured,public=p.public,sort=p.sort where id=target_id; end if;
 elsif target='articles' then
  select * into a from jsonb_populate_record(null::public.articles,payload);
  if action='insert' then insert into public.articles(id,slug,title,summary,body,platform,category,source_url,cover_url,project_id,published) values(target_id,a.slug,a.title,a.summary,a.body,a.platform,a.category,a.source_url,a.cover_url,a.project_id,a.published);
  else update public.articles set slug=a.slug,title=a.title,summary=a.summary,body=a.body,platform=a.platform,category=a.category,source_url=a.source_url,cover_url=a.cover_url,project_id=a.project_id,published=a.published where id=target_id; end if;
 elsif target='guides' then
  select * into g from jsonb_populate_record(null::public.guides,payload);
  if action='insert' then insert into public.guides(id,slug,title,summary,body,notion_url,doc_url,cover_url,published) values(target_id,g.slug,g.title,g.summary,g.body,g.notion_url,g.doc_url,g.cover_url,g.published);
  else update public.guides set slug=g.slug,title=g.title,summary=g.summary,body=g.body,notion_url=g.notion_url,doc_url=g.doc_url,cover_url=g.cover_url,published=g.published where id=target_id; end if;
 end if;
 return jsonb_build_object('op',action,'table',target,'key',target_id,'values',before_row);
end;
$$;
revoke all on function private.apply_publishing_draft(jsonb) from public,anon,authenticated,service_role;


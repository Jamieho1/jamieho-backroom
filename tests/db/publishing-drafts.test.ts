import {beforeAll,afterAll,it,expect,describe} from 'vitest';
import type {PGlite} from '@electric-sql/pglite';
import {freshDb,as,addUser} from './harness';
const user={id:'00000000-0000-4000-8000-000000000610',email:'publishing-owner@example.test'};
const member={id:'00000000-0000-4000-8000-000000000611',email:'publishing-member@example.test'};
const owner={role:'authenticated' as const,sub:user.id};
const id='00000000-0000-4000-8000-000000000601',added='00000000-0000-4000-8000-000000000602';
const op=(table:string,action='update',fields:unknown={},key=id)=>({table,op:action,fields,key});
type Query=<R=Record<string,unknown>>(sql:string,params?:unknown[])=>Promise<R[]>;
let db:PGlite;
beforeAll(async()=>{db=await freshDb();await db.query("insert into private.settings(key,value) values ('owner_email',$1)",[user.email]);await addUser(db,user);await addUser(db,member);await db.query("insert into public.projects(id,slug,name,public) values ($1,'live-project','Live project',true)",[id]);for(const table of ['articles','guides'])await db.query(`insert into public.${table}(id,slug,title,published) values ($1,'live-${table}','Live title',true)`,[id]);},30000);
afterAll(async()=>{await db?.close();});
async function seed(q:Query,ops:unknown[]){return (await q<{id:string}>("insert into public.content_changes(summary,operations) values ('Publishing proposal',$1) returning id",[JSON.stringify(ops)]))[0].id;}
async function approve(q:Query,id:string){return q<{status:string;previous:{table:string;key:string;values:Record<string,unknown>|null}[]}>("update public.content_changes set status='approved' where id=$1 returning *",[id]);}
for(const table of ['projects','articles','guides'])describe(table,()=>{
 const title=table==='projects'?'name':'title',publication=table==='projects'?'public':'published';
 it('inserts with safe defaults, updates content/slugs, unpublishes without deletion and can restore',async()=>{
  await as(db,owner,async q=>{
   const inserted=await seed(q,[op(table,'insert',{slug:'new-item',[title]:' New item '},added)]);await approve(q,inserted);
   expect(await q(`select ${title} as title,${publication} as visible from public.${table} where id=$1`,[added])).toEqual([{title:'New item',visible:false}]);
   const change=await seed(q,[op(table,'update',{slug:'renamed-item',[publication]:true},added),op(table,'delete',{},added)]);const [set]=await approve(q,change);
   expect(set.previous[0].values).toMatchObject({slug:'new-item',[publication]:false});expect(set.previous[1].values).toMatchObject({slug:'renamed-item',[publication]:true});
   expect(await q(`select slug,${publication} as visible from public.${table} where id=$1`,[added])).toEqual([{slug:'renamed-item',visible:false}]);
   await approve(q,await seed(q,[op(table,'update',{[publication]:true},added)]));expect(await q(`select ${publication} as visible from public.${table} where id=$1`,[added])).toEqual([{visible:true}]);
  });
 });
 const bad: [string,unknown,RegExp][]=[['blank',{[title]:' '},/blank/],['slug',{slug:'manage'},/slug/],['slug length',{slug:'a'.repeat(81)},/long/],['title length',{[title]:'x'.repeat(table==='projects'?81:161)},/long/],['null',{body:null},/must be text/],['unknown',{updated_at:'today'},/Unknown editable/],['publication',{[publication]:'true'},/boolean/],['bad link',{[table==='projects'?'url':'cover_url']:'javascript:alert(1)'},/HTTPS/],['invalid host',{[table==='projects'?'url':'cover_url']:'https://foo.123'},/HTTPS/],['too long body',{body:'x'.repeat(table==='projects'?50001:200001)},/long/]];
 if(table==='projects')bad.push(['tags',{tags:Array(9).fill('x')},/Too many/],['tag length',{tags:['x'.repeat(25)]},/tag/],['tag blank',{tags:[' ']},/tag/],['screenshots',{screenshots:['http://example.com']},/HTTPS/],['shot count',{screenshots:Array(7).fill('https://example.com/x')},/Too many/],['shot type',{screenshots:[null]},/must be text/],['fraction',{sort:1.5},/integer/],['sort max',{sort:1001},/integer/],['feature',{featured:1},/boolean/],['utf16 url',{url:'https://example.com/'+'😀'.repeat(1020)},/long/]);
 else bad.push(['summary',{summary:'x'.repeat(601)},/long/]);
 if(table==='articles')bad.push(['platform',{platform:'unknown'},/platform/],['category',{category:'unknown'},/category/],['project',{project_id:'missing-app'},/foreign key/]);
 for(const action of ['insert','update'])for(const [label,fields,message] of bad)it(`${action} rejects ${label} and rolls back an earlier operation`,async()=>{
  await as(db,owner,async q=>{
   const before=await q('select * from public.projects where id=$1',[id]);
   const set=await seed(q,[op('projects','update',{name:'Must roll back'}),op(table,action,{...(action==='insert'?{slug:'new-item',[title]:'Valid'}:{}),...fields as object},action==='insert'?added:id)]);
   await q('savepoint invalid');await expect(approve(q,set)).rejects.toThrow(message);await q('rollback to savepoint invalid');expect(await q('select * from public.projects where id=$1',[id])).toEqual(before);expect(await q('select status,previous from public.content_changes where id=$1',[set])).toEqual([{status:'draft',previous:null}]);
  });
 });
 it('rejects missing targets, duplicate slugs, metadata, delete payloads and missing insert fields',async()=>{
  for(const operation of [op(table,'update',{body:'X'},added),op(table,'insert',{slug:table==='projects'?'live-project':`live-${table}`,[title]:'X'},added),op(table,'delete',{body:'X'}),op(table,'insert',{},added),{...op(table,'update',{body:'X'}),sql:'anything'}])await expect(as(db,owner,async q=>approve(q,await seed(q,[operation])))).rejects.toThrow();
 });
});
it('cross-table approval stores all prior rows, remains atomic and preserves relational checks',async()=>{
 await as(db,owner,async q=>{const set=await seed(q,[op('projects','insert',{slug:'new-project',name:'Example project',featured:true,public:true,tags:[' AI '],screenshots:['https://example.com/image.png'],url:' https://example.com '},added),op('articles','update',{platform:'xiaohongshu',category:'building',project_id:'notes',source_url:'https://example.com/post'}),op('guides','update',{notion_url:'https://example.com/toolkit',doc_url:'https://example.com/doc'})]);const [saved]=await approve(q,set);expect(saved.previous).toHaveLength(3);expect(saved.previous[0].values).toBeNull();expect(await q('select name,tags,url,featured from public.projects where id=$1',[added])).toEqual([{name:'Example project',tags:['AI'],url:'https://example.com',featured:true}]);});
});
it('SQL helpers have no API execution and signed-out/member approval cannot change publishing data',async()=>{
 const r=await db.query<{name:string;callable:boolean}>("select proname as name,has_function_privilege('authenticated',oid,'EXECUTE') or has_function_privilege('anon',oid,'EXECUTE') as callable from pg_proc where oid in ('private.apply_publishing_draft(jsonb)'::regprocedure,'private.draft_https(text)'::regprocedure)");expect(r.rows).toHaveLength(2);expect(r.rows.every(x=>!x.callable)).toBe(true);
 const set=(await db.query<{id:string}>("insert into public.content_changes(summary,operations) values ('Owner approval only',$1) returning id",[JSON.stringify([op('projects','delete')])])).rows[0].id;
 expect(await as(db,{role:'authenticated',sub:member.id},q=>approve(q,set))).toEqual([]);await expect(db.query("update public.content_changes set status='approved' where id=$1",[set])).rejects.toThrow(/Only the owner/);
 expect((await db.query('select public from public.projects where id=$1',[id])).rows).toEqual([{public:true}]);
});
it('TypeScript and SQL agree on HTTPS host/port parsing without scheme coercion',async()=>{
 const {validateOperations}=await import('@/lib/content-drafts/allowlist');
 for(const [url,valid] of [['https://example.com/a%20b',true],['https://example.com/😀',true],['https://user:pass@localhost/path',true],['https://[::1]:443/x',true],['https://192.168.1.1:80/x',true],['https://foo.123',false],['https://foo.0xABC',false],['https://09.0.0.1',false],['https://999.999.999.999',false],['https://example.com:99999',false],['https://example.com:000080',false],['https://éxample.com',false],['https:example.com',false],['https://example.com/a b',false]] as const){
  expect((await db.query<{valid:boolean}>('select private.draft_https($1) as valid',[url])).rows[0].valid,url).toBe(valid);
  expect(validateOperations([op('projects','update',{url})]).ok,url).toBe(valid);
 }
});

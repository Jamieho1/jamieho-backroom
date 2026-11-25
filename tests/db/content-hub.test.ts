import {beforeAll,afterAll,it,expect,describe} from 'vitest';
import type {PGlite} from '@electric-sql/pglite';
import {freshDb,as,addUser} from './harness';
import {validateOperations} from '@/lib/content-drafts/allowlist';
const owner={id:'00000000-0000-4000-8000-000000000d01',email:'hub-owner@example.test'},member={id:'00000000-0000-4000-8000-000000000d02',email:'hub-member@example.test'};
const S1='00000000-0000-4000-8000-000000000d11',S2='00000000-0000-4000-8000-000000000d12',A1='00000000-0000-4000-8000-000000000d21',A2='00000000-0000-4000-8000-000000000d22',G1='00000000-0000-4000-8000-000000000d31',G2='00000000-0000-4000-8000-000000000d32',NEW='00000000-0000-4000-8000-000000000d41';
const who={role:'authenticated' as const,sub:owner.id},mem={role:'authenticated' as const,sub:member.id};
type Query=<R=Record<string,unknown>>(sql:string,params?:unknown[])=>Promise<R[]>;
let db:PGlite;
beforeAll(async()=>{
 db=await freshDb();await db.query("insert into private.settings(key,value) values ('owner_email',$1)",[owner.email]);await addUser(db,owner);await addUser(db,member);
 await db.query("insert into public.content_series(id,slug,title,published) values ($1,'mcp-101','MCP 101',true),($2,'hidden-series','Hidden series',false)",[S1,S2]);
 await db.query("insert into public.articles(id,slug,title,published) values ($1,'post-a','Post A',true),($2,'post-b','Post B',false)",[A1,A2]);
 await db.query("insert into public.guides(id,slug,title,published) values ($1,'guide-a','Guide A',true),($2,'guide-b','Guide B',false)",[G1,G2]);
});
afterAll(async()=>{await db?.close();});
/** Run one statement that must fail and leave the surrounding transaction usable. */
async function fails(q:Query,sql:string,message:RegExp,params:unknown[]=[]){await q('savepoint attempt');await expect(q(sql,params)).rejects.toThrow(message);await q('rollback to savepoint attempt');}

describe('content_series',()=>{
 it('defaults, and everyone reads published rows only (including direct slug reads)',async()=>{
  expect((await db.query<Record<string,unknown>>('select goal,topic,planned_parts,sort,published from public.content_series where id=$1',[S1])).rows).toEqual([{goal:'',topic:'ai',planned_parts:1,sort:100,published:true}]);
  for(const role of [{role:'anon' as const},mem])await as(db,role,async q=>{expect(await q('select slug from public.content_series')).toEqual([{slug:'mcp-101'}]);expect(await q("select title from public.content_series where slug='hidden-series'")).toEqual([]);});
 });
 it('only the owner reads drafts and writes; members and visitors cannot',async()=>{
  await as(db,who,async q=>{
   expect(await q('select slug from public.content_series order by slug')).toEqual([{slug:'hidden-series'},{slug:'mcp-101'}]);
   expect(await q("insert into public.content_series(slug,title,goal,topic,planned_parts) values ('career-ladder','Career ladder','Climb','career',4) returning published")).toEqual([{published:false}]);
   expect(await q("update public.content_series set published=true where slug='career-ladder' returning published")).toEqual([{published:true}]);
   expect(await q("delete from public.content_series where slug='career-ladder' returning slug")).toHaveLength(1);
  });
  await expect(as(db,mem,q=>q("insert into public.content_series(slug,title) values ('fake','Fake')"))).rejects.toThrow(/row-level security/);
  expect(await as(db,mem,q=>q("update public.content_series set published=true returning id"))).toEqual([]);expect(await as(db,mem,q=>q('delete from public.content_series returning id'))).toEqual([]);
  await expect(as(db,{role:'anon'},q=>q("insert into public.content_series(slug,title) values ('fake','Fake')"))).rejects.toThrow(/permission denied/);
  await expect(as(db,{role:'anon'},q=>q("update public.content_series set title='x' returning id"))).rejects.toThrow(/permission denied/);
  await expect(as(db,{role:'anon'},q=>q('delete from public.content_series returning id'))).rejects.toThrow(/permission denied/);
 });
 for(const [name,sql] of [['duplicate slug',"insert into public.content_series(slug,title) values ('mcp-101','Dup')"],['reserved slug',"insert into public.content_series(slug,title) values ('manage','X')"],['bad slug',"insert into public.content_series(slug,title) values ('Has Space','X')"],['long slug',"insert into public.content_series(slug,title) values (repeat('a',81),'X')"],['empty title',"insert into public.content_series(slug,title) values ('t1','')"],['long title',"insert into public.content_series(slug,title) values ('t2',repeat('x',81))"],['long goal',"insert into public.content_series(slug,title,goal) values ('t3','X',repeat('x',201))"],['unknown topic',"insert into public.content_series(slug,title,topic) values ('t4','X','sport')"],['zero parts',"insert into public.content_series(slug,title,planned_parts) values ('t5','X',0)"],['51 parts',"insert into public.content_series(slug,title,planned_parts) values ('t6','X',51)"],['sort range',"insert into public.content_series(slug,title,sort) values ('t7','X',1001)"]] as const)
  it('rejects '+name,async()=>{await as(db,who,q=>fails(q,sql,/violates|duplicate/));});
 it('accepts the boundary values',async()=>{await as(db,who,async q=>{expect(await q("insert into public.content_series(slug,title,goal,planned_parts,sort) values ('edge',repeat('x',80),repeat('g',200),50,-1000) returning planned_parts")).toEqual([{planned_parts:50}]);});});
});

describe('articles',()=>{
 it('new columns default to empty and old-style inserts keep working',async()=>{
  expect((await db.query('select series_id,series_part,code,takeaway,slides from public.articles where id=$1',[A1])).rows).toEqual([{series_id:null,series_part:null,code:null,takeaway:'',slides:[]}]);
 });
 it('anonymous readers see the new fields of a published post',async()=>{
  await as(db,{role:'anon'},async q=>{expect(await q('select code,takeaway from public.articles where id=$1',[A1])).toEqual([{code:null,takeaway:''}]);});
 });
 it('code is unique (case-sensitive uppercase), nullable many times, and limited to 16 uppercase letters or digits',async()=>{
  await as(db,who,async q=>{
   await q("update public.articles set code='MCP101' where id=$1",[A1]);
   await fails(q,"update public.articles set code='MCP101' where id=$1",/duplicate key|unique/,[A2]);
   for(const code of ['mcp101','MCP 101','MCP-101','','X'.repeat(17)])await fails(q,"update public.articles set code=$2 where id=$1",/check constraint/,[A2,code]);
   expect(await q("update public.articles set code='X'||repeat('9',15) where id=$1 returning code",[A2])).toEqual([{code:'X999999999999999'}]);
   expect(await q("update public.articles set code=null where id=$1 returning code",[A2])).toEqual([{code:null}]);
   expect(await q("update public.articles set code=null where id=$1 returning code",[A1])).toEqual([{code:null}]);
  });
 });
 it('takeaway allows 160 characters; slides allow 20 HTTPS URLs and reject the rest',async()=>{
  await as(db,who,async q=>{
   expect(await q("update public.articles set takeaway=repeat('t',160) where id=$1 returning char_length(takeaway) as n",[A1])).toEqual([{n:160}]);
   await fails(q,"update public.articles set takeaway=repeat('t',161) where id=$1",/check constraint/,[A1]);
   expect(await q("update public.articles set slides=array(select 'https://example.com/'||g||'.png' from generate_series(1,20) g) where id=$1 returning cardinality(slides) as n",[A1])).toEqual([{n:20}]);
   for(const sql of ["slides=array(select 'https://example.com/'||g||'.png' from generate_series(1,21) g)","slides=array['http://example.com/a.png']","slides=array['javascript:alert(1)']","slides=array['']","slides=array['https://']","slides=array['https://example.com/a b']","slides=array[null]::text[]","slides=null","slides=array['https://example.com/'||repeat('x',2049)]"])await fails(q,`update public.articles set ${sql} where id=$1`,/check constraint|null value/,[A1]);
   await q("update public.articles set slides='{}',takeaway='' where id=$1",[A1]);
  });
 });
 it('series_part is 1 to 50 and set together with series_id',async()=>{
  await as(db,who,async q=>{
   expect(await q("update public.articles set series_id=$2,series_part=50 where id=$1 returning series_part",[A1,S1])).toEqual([{series_part:50}]);
   await fails(q,"update public.articles set series_part=51 where id=$1",/check constraint/,[A1]);await fails(q,"update public.articles set series_part=0 where id=$1",/check constraint/,[A1]);
   await fails(q,"update public.articles set series_part=null where id=$1",/articles_series_pair/,[A1]);
   await fails(q,"update public.articles set series_id=$2,series_part=null where id=$1",/articles_series_pair/,[A2,S1]);
   await fails(q,"update public.articles set series_part=3 where id=$1",/articles_series_pair/,[A2]);
   await fails(q,"update public.articles set series_id=gen_random_uuid(),series_part=1 where id=$1",/foreign key/,[A2]);
   expect(await q("update public.articles set series_id=null,series_part=null where id=$1 returning series_id",[A1])).toEqual([{series_id:null}]);
  });
 });
 it('members and visitors cannot write the new columns',async()=>{
  expect(await as(db,mem,q=>q("update public.articles set code='HACK' returning id"))).toEqual([]);
  await expect(as(db,{role:'anon'},q=>q("update public.articles set code='HACK' returning id"))).rejects.toThrow(/permission denied/);
 });
});

describe('guides',()=>{
 it('new columns default to empty',async()=>{expect((await db.query('select series_id,series_part,audience,highlights,exercises from public.guides where id=$1',[G1])).rows).toEqual([{series_id:null,series_part:null,audience:'',highlights:[],exercises:null}]);});
 it('audience, highlights and exercises follow their limits',async()=>{
  await as(db,who,async q=>{
   expect(await q("update public.guides set audience=repeat('a',200),highlights=array['One',repeat('h',80),'Three'],exercises=0 where id=$1 returning exercises,cardinality(highlights) as n",[G1])).toEqual([{exercises:0,n:3}]);
   for(const sql of ["audience=repeat('a',201)","highlights=array['a','b','c','d']","highlights=array[repeat('h',81)]","highlights=array['']","highlights=array['   ']","highlights=array[null]::text[]","highlights=null","exercises=-1","exercises=1000"])await fails(q,`update public.guides set ${sql} where id=$1`,/check constraint|null value/,[G1]);
   expect(await q("update public.guides set exercises=null,audience='',highlights='{}' where id=$1 returning exercises",[G1])).toEqual([{exercises:null}]);
  });
 });
 it('series membership needs both fields and an existing series',async()=>{
  await as(db,who,async q=>{
   await fails(q,"update public.guides set series_id=$2 where id=$1",/guides_series_pair/,[G1,S1]);await fails(q,"update public.guides set series_part=2 where id=$1",/guides_series_pair/,[G1]);
   await fails(q,"update public.guides set series_id=$2,series_part=51 where id=$1",/check constraint/,[G1,S1]);await fails(q,"update public.guides set series_id=gen_random_uuid(),series_part=1 where id=$1",/foreign key/,[G1]);
  });
 });
});

describe('series parts are unique per series across articles and guides',()=>{
 it('an article and a guide cannot share a part, in either direction; other series and moves are fine',async()=>{
  await as(db,who,async q=>{
   await q("update public.articles set series_id=$2,series_part=1 where id=$1",[A1,S1]);
   await fails(q,"update public.guides set series_id=$2,series_part=1 where id=$1",/already used/,[G1,S1]);
   await fails(q,"update public.articles set series_id=$2,series_part=1 where id=$1",/already used/,[A2,S1]);
   await fails(q,"insert into public.guides(slug,title,series_id,series_part) values ('guide-new','New',$1,1)",/already used/,[S1]);
   await fails(q,"insert into public.articles(slug,title,series_id,series_part) values ('post-new','New',$1,1)",/already used/,[S1]);
   expect(await q("update public.guides set series_id=$2,series_part=2 where id=$1 returning series_part",[G1,S1])).toEqual([{series_part:2}]);
   expect(await q("update public.articles set series_id=$2,series_part=1 where id=$1 returning series_part",[A2,S2])).toEqual([{series_part:1}]);
   // re-saving the same row, or an unrelated column, never conflicts with itself
   expect(await q("update public.articles set series_part=1,title='Post A (edited)' where id=$1 returning series_part",[A1])).toEqual([{series_part:1}]);
   expect(await q("update public.guides set series_part=2,title='Guide A (edited)' where id=$1 returning series_part",[G1])).toEqual([{series_part:2}]);
   // a freed part can be reused by the other table
   await q("update public.articles set series_id=null,series_part=null where id=$1",[A1]);
   expect(await q("update public.guides set series_part=1 where id=$1 returning series_part",[G1])).toEqual([{series_part:1}]);
  });
 });
 it('the check sees hidden rows of the other table (drafts count)',async()=>{
  await as(db,who,async q=>{await q("update public.articles set series_id=$2,series_part=7 where id=$1",[A2,S1]);await fails(q,"update public.guides set series_id=$2,series_part=7 where id=$1",/already used/,[G2,S1]);});
 });
});

describe('deleting a series',()=>{
 it('detaches its articles and guides (series_id and series_part cleared together) and keeps the rows',async()=>{
  const sd='00000000-0000-4000-8000-000000000d51',ad='00000000-0000-4000-8000-000000000d52',gd='00000000-0000-4000-8000-000000000d53';
  await as(db,who,async q=>{
   await q("insert into public.content_series(id,slug,title) values ($1,'doomed','Doomed')",[sd]);
   await q("insert into public.articles(id,slug,title,series_id,series_part) values ($1,'doomed-post','Doomed post',$2,1)",[ad,sd]);
   await q("insert into public.guides(id,slug,title,series_id,series_part) values ($1,'doomed-guide','Doomed guide',$2,2)",[gd,sd]);
   expect(await q('delete from public.content_series where id=$1 returning slug',[sd])).toEqual([{slug:'doomed'}]);
   expect(await q('select slug,series_id,series_part from public.articles where id=$1',[ad])).toEqual([{slug:'doomed-post',series_id:null,series_part:null}]);
   expect(await q('select slug,series_id,series_part from public.guides where id=$1',[gd])).toEqual([{slug:'doomed-guide',series_id:null,series_part:null}]);
  });
 });
});

describe('Content Drafts',()=>{
 const op=(table:string,action='update',fields:unknown={},key=A1)=>({table,op:action,fields,key});
 async function seed(q:Query,ops:unknown[]){return (await q<{id:string}>("insert into public.content_changes(summary,operations) values ('Hub proposal',$1) returning id",[JSON.stringify(ops)]))[0].id;}
 const approve=(q:Query,id:string)=>q<{status:string;previous:{table:string;key:string;values:Record<string,unknown>|null}[]}>("update public.content_changes set status='approved' where id=$1 returning *",[id]);
 it('approves series, article and guide fields together, normalising numbers and highlights, and records the old values',async()=>{
  await as(db,who,async q=>{
   const set=await seed(q,[
    op('content_series','insert',{slug:'draft-series',title:' Draft series ',goal:'Ship it',topic:'career',planned_parts:4,sort:5,published:true},NEW),
    op('articles','update',{series_id:NEW,series_part:2.0,code:'DRAFT1',takeaway:'Learn drafts',slides:['https://example.com/1.png','https://example.com/2.png']},A1),
    op('guides','update',{series_id:NEW,series_part:1,audience:'Anyone',highlights:['  Setup  ','Tools'],exercises:6},G1)]);
   const [saved]=await approve(q,set);
   expect(await q('select slug,title,goal,topic,planned_parts,sort,published from public.content_series where id=$1',[NEW])).toEqual([{slug:'draft-series',title:'Draft series',goal:'Ship it',topic:'career',planned_parts:4,sort:5,published:true}]);
   expect(await q('select series_id,series_part,code,takeaway,slides from public.articles where id=$1',[A1])).toEqual([{series_id:NEW,series_part:2,code:'DRAFT1',takeaway:'Learn drafts',slides:['https://example.com/1.png','https://example.com/2.png']}]);
   expect(await q('select series_id,series_part,audience,highlights,exercises from public.guides where id=$1',[G1])).toEqual([{series_id:NEW,series_part:1,audience:'Anyone',highlights:['Setup','Tools'],exercises:6}]);
   expect(saved.previous[0]).toMatchObject({table:'content_series',values:null});expect(saved.previous[1].values).toMatchObject({code:null,series_id:null,takeaway:''});expect(saved.previous[2].values).toMatchObject({audience:'',exercises:null});
   // clear again with nulls, update only some fields, and unpublish the series (delete never removes rows)
   await approve(q,await seed(q,[op('articles','update',{series_id:null,series_part:null,code:null,slides:[]},A1),op('guides','update',{series_id:null,series_part:null,exercises:null},G1),op('content_series','update',{planned_parts:6},NEW),op('content_series','delete',{},NEW)]));
   expect(await q('select code,series_id,slides from public.articles where id=$1',[A1])).toEqual([{code:null,series_id:null,slides:[]}]);
   expect(await q('select planned_parts,published from public.content_series where id=$1',[NEW])).toEqual([{planned_parts:6,published:false}]);
  });
 });
 it('inserts a bare series with defaults and a new article and guide with the new defaults',async()=>{
  await as(db,who,async q=>{
   const n2='00000000-0000-4000-8000-000000000d61',n3='00000000-0000-4000-8000-000000000d62',n4='00000000-0000-4000-8000-000000000d63';
   await approve(q,await seed(q,[op('content_series','insert',{slug:'bare-series',title:'Bare'},n2),op('articles','insert',{slug:'bare-post',title:'Bare post'},n3),op('guides','insert',{slug:'bare-guide',title:'Bare guide'},n4)]));
   expect(await q('select goal,topic,planned_parts,sort,published from public.content_series where id=$1',[n2])).toEqual([{goal:'',topic:'ai',planned_parts:1,sort:100,published:false}]);
   expect(await q('select code,takeaway,slides,series_id from public.articles where id=$1',[n3])).toEqual([{code:null,takeaway:'',slides:[],series_id:null}]);
   expect(await q('select audience,highlights,exercises from public.guides where id=$1',[n4])).toEqual([{audience:'',highlights:[],exercises:null}]);
  });
 });
 const invalid:[string,string,Record<string,unknown>,RegExp][]=[
  ['article code lowercase','articles',{code:'mcp101'},/Code must be/],['article code too long','articles',{code:'X'.repeat(17)},/Code must be/],['article code number','articles',{code:5},/Code must be/],
  ['takeaway too long','articles',{takeaway:'x'.repeat(161)},/too long/],['takeaway null','articles',{takeaway:null},/must be text/],
  ['slides http','articles',{slides:['http://example.com/1.png']},/Slides must be valid HTTPS/],['slides empty entry','articles',{slides:['']},/Slides must be valid HTTPS/],['slides 21','articles',{slides:Array(21).fill('https://example.com/1.png')},/Too many/],['slides entry type','articles',{slides:[null]},/must be text/],['slides not array','articles',{slides:'https://example.com/1.png'},/must be an array/],
  ['series_part 51','articles',{series_id:S1,series_part:51},/range/],['series_part 0','articles',{series_id:S1,series_part:0},/range/],['series_part fraction','articles',{series_id:S1,series_part:1.5},/whole number|range/],['series_part text','articles',{series_id:S1,series_part:'1'},/whole number/],['series_id not a uuid','articles',{series_id:'x',series_part:1},/UUID/],['series_id number','articles',{series_id:5,series_part:1},/UUID/],
  ['series without part','articles',{series_id:S1,series_part:null},/together/],['part without series','articles',{series_id:null,series_part:3},/together/],['unknown series','articles',{series_id:'00000000-0000-4000-8000-0000000000ff',series_part:1},/foreign key/],
  ['audience too long','guides',{audience:'x'.repeat(201)},/too long/],['guide highlights 4','guides',{highlights:['a','b','c','d']},/At most three/],['guide highlight 81','guides',{highlights:['x'.repeat(81)]},/Highlight length/],['guide highlight blank','guides',{highlights:[' ']},/Highlight length/],['exercises negative','guides',{exercises:-1},/range/],['exercises fraction','guides',{exercises:1.5},/whole number|range/],['exercises text','guides',{exercises:'2'},/whole number/],['guide series without part','guides',{series_id:S1,series_part:null},/together/],
  ['series title 81','content_series',{title:'x'.repeat(81)},/too long/],['series blank title','content_series',{title:' '},/blank/],['series goal 201','content_series',{goal:'x'.repeat(201)},/too long/],['series topic','content_series',{topic:'sport'},/Unknown series topic/],['series parts 0','content_series',{planned_parts:0},/range/],['series parts 51','content_series',{planned_parts:51},/range/],['series parts null','content_series',{planned_parts:null},/required/],['series sort 1001','content_series',{sort:1001},/sort must be/],['series slug reserved','content_series',{slug:'manage'},/slug/],['series published text','content_series',{published:'true'},/boolean/],['series unknown field','content_series',{created_at:'now'},/Unknown editable/],
 ];
 for(const action of ['update','insert'])for(const [label,table,fields,message] of invalid)it(`${action} rejects ${label} and rolls back an earlier operation`,async()=>{
  const key=table==='articles'?A1:table==='guides'?G1:S1;
  await as(db,who,async q=>{
   const before=await q('select title from public.articles where id=$1',[A2]);
   const base=action==='insert'?{slug:'ins-'+table.replace('_','-'),title:'Valid'}:{};
   const set=await seed(q,[op('articles','update',{title:'Must roll back'},A2),op(table,action,{...base,...fields},action==='insert'?NEW:key)]);
   await q('savepoint invalid');await expect(approve(q,set)).rejects.toThrow(message);await q('rollback to savepoint invalid');
   expect(await q('select title from public.articles where id=$1',[A2])).toEqual(before);expect(await q('select status,previous from public.content_changes where id=$1',[set])).toEqual([{status:'draft',previous:null}]);
  });
 });
 it('TypeScript rejects the same field-level mistakes before they reach the database',()=>{
  for(const [label,table,fields] of invalid.filter(([label])=>!/series without part|part without series|unknown series|series_part fraction|series_id number|series published text|series blank title/.test(label)))expect(validateOperations([op(table,'update',fields)]).ok,label).toBe(false);
 });
 it('approval rejects a part already used by the other table and rolls everything back',async()=>{
  await as(db,who,async q=>{
   await q("update public.articles set series_id=$2,series_part=9 where id=$1",[A1,S1]);
   const set=await seed(q,[op('guides','update',{series_id:S1,series_part:9},G1)]);
   await q('savepoint conflict');await expect(approve(q,set)).rejects.toThrow(/already used/);await q('rollback to savepoint conflict');
   expect(await q('select series_id from public.guides where id=$1',[G1])).toEqual([{series_id:null}]);
  });
 });
 it('approval rejects a duplicate code and a missing key, and refuses non-owner approval',async()=>{
  await as(db,who,async q=>{
   await q("update public.articles set code='TAKEN1' where id=$1",[A1]);
   await q('savepoint dup');await expect(approve(q,await seed(q,[op('articles','update',{code:'TAKEN1'},A2)]))).rejects.toThrow(/duplicate key|unique/);await q('rollback to savepoint dup');
   await q('savepoint gone');await expect(approve(q,await seed(q,[op('content_series','update',{goal:'x'},'00000000-0000-4000-8000-0000000000fe')]))).rejects.toThrow(/no longer exists/);await q('rollback to savepoint gone');
  });
  const set=(await db.query<{id:string}>("insert into public.content_changes(summary,operations) values ('Owner only',$1) returning id",[JSON.stringify([op('content_series','update',{goal:'nope'},S1)])])).rows[0].id;
  expect(await as(db,mem,q=>approve(q,set))).toEqual([]);await expect(db.query("update public.content_changes set status='approved' where id=$1",[set])).rejects.toThrow(/Only the owner/);
  expect((await db.query('select goal from public.content_series where id=$1',[S1])).rows).toEqual([{goal:''}]);
 });
 it('content_series drafts belong to the personal site: a PassLoop set cannot change them',async()=>{
  expect((await db.query('select private.content_change_site($1) as site',['content_series'])).rows).toEqual([{site:'personal'}]);
  await as(db,who,async q=>{
   const set=(await q<{id:string}>("insert into public.content_changes(summary,operations,site) values ('Wrong site',$1,'passloop') returning id",[JSON.stringify([op('content_series','update',{goal:'x'},S1)])]))[0].id;
   await q('savepoint site');await expect(approve(q,set)).rejects.toThrow(/cannot change personal tables/);await q('rollback to savepoint site');
   expect(await q('select goal from public.content_series where id=$1',[S1])).toEqual([{goal:''}]);
  });
 });
});

it('helper and trigger functions are not callable through the API',async()=>{
 const fns=['private.apply_publishing_draft(jsonb)','private.check_series_part()','private.detach_series_members()','private.apply_content_change()','private.content_change_site(text)','private.valid_article_slides(text[])','private.valid_guide_highlights(text[])'];
 for(const fn of fns){const r=await db.query<{anon:boolean;pub:boolean;service:boolean}>("select has_function_privilege('anon',$1::regprocedure,'execute') as anon,has_function_privilege('public',$1::regprocedure,'execute') as pub,has_function_privilege('service_role',$1::regprocedure,'execute') as service",[fn]);expect(r.rows[0],fn).toEqual({anon:false,pub:false,service:false});}
 for(const fn of fns.filter(f=>!/valid_/.test(f)))expect((await db.query<{ok:boolean}>("select has_function_privilege('authenticated',$1::regprocedure,'execute') as ok",[fn])).rows[0].ok,fn).toBe(false);
 await expect(as(db,{role:'anon'},q=>q("select private.valid_guide_highlights(array['x'])"))).rejects.toThrow(/permission denied/);
 const hardened=await db.query<{proname:string;cfg:string[]|null}>("select proname,proconfig as cfg from pg_proc where proname in ('check_series_part','detach_series_members','valid_article_slides','valid_guide_highlights','apply_publishing_draft','apply_content_change')");
 expect(hardened.rows).toHaveLength(6);for(const r of hardened.rows)expect(r.cfg,r.proname).toContain('search_path=""');
});
it('content_series has row level security with the four owner/public policies',async()=>{
 expect((await db.query<{relrowsecurity:boolean}>("select relrowsecurity from pg_class where oid='public.content_series'::regclass")).rows[0].relrowsecurity).toBe(true);
 expect((await db.query<{cmd:string}>("select cmd from pg_policies where tablename='content_series' order by cmd")).rows.map(r=>r.cmd)).toEqual(['DELETE','INSERT','SELECT','UPDATE']);
});

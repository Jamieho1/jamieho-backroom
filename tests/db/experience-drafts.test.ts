import {beforeAll,afterAll,it,expect} from 'vitest';
import type {PGlite} from '@electric-sql/pglite';
import {freshDb,as,addUser} from './harness';
const user={id:'00000000-0000-4000-8000-000000000410',email:'experience-owner@example.test'};
const member={id:'00000000-0000-4000-8000-000000000411',email:'experience-member@example.test'};
const owner={role:'authenticated' as const,sub:user.id};
const item='00000000-0000-4000-8000-000000000401',other='00000000-0000-4000-8000-000000000402',bullet='00000000-0000-4000-8000-000000000403',added='00000000-0000-4000-8000-000000000404';
const op=(table='experience_items',action='update',fields:unknown={title:'New role'},key=item)=>({table,op:action,fields,key});
let db:PGlite;
beforeAll(async()=>{db=await freshDb();await db.query("insert into private.settings(key,value) values ('owner_email',$1)",[user.email]);await addUser(db,user);await addUser(db,member);await db.query("insert into public.experience_items(id,title,public) values ($1,'Live role',true),($2,'Other role',true)",[item,other]);await db.query("insert into public.experience_bullets(id,item_id,text,sort,public) values ($1,$2,'Old proof',12,true)",[bullet,item]);},30000);
afterAll(async()=>{await db?.close();});
type Query=<R=Record<string,unknown>>(sql:string,params?:unknown[])=>Promise<R[]>;
async function seed(q:Query,operations:unknown[]){return (await q<{id:string}>("insert into public.content_changes(summary,operations) values ('Experience proposal',$1) returning id",[JSON.stringify(operations)]))[0].id;}
async function approve(q:Query,id:string){return q<{status:string;previous:{op:string;table:string;key:string;values:Record<string,unknown>|null}[];approved_by:string}>("update public.content_changes set status='approved' where id=$1 returning *",[id]);}
it('one transaction adds a bullet, edits an entry and hides another; complete previous rows are audited',async()=>{
 await as(db,owner,async q=>{
  const [before]=await q<{row:Record<string,unknown>}>('select to_jsonb(i) as row from public.experience_items i where id=$1',[item]);
  const id=await seed(q,[op('experience_bullets','insert',{item_id:item,text:'Added proof',public:true},added),op('experience_items','update',{title:'Approved role',kind:'project',org:'Org',dates:'Dates',location:'London',summary:'Summary',sort:2}),op('experience_items','update',{public:false},other)]);
  const [set]=await approve(q,id);expect(set.status).toBe('approved');expect(set.approved_by).toBe(user.id);expect(set.previous[0].values).toBeNull();expect(set.previous[1].values).toEqual(before.row);
  expect(await q('select title,kind,org,dates,location,summary,sort from public.experience_items where id=$1',[item])).toEqual([{title:'Approved role',kind:'project',org:'Org',dates:'Dates',location:'London',summary:'Summary',sort:2}]);
  expect(await q('select public from public.experience_items where id=$1',[other])).toEqual([{public:false}]);
  expect(await q('select text,public from public.experience_bullets where id=$1',[added])).toEqual([{text:'Added proof',public:true}]);
 });
});
it('insert defaults remain hidden; a following bullet can reference the inserted entry',async()=>{
 await as(db,owner,async q=>{
  const id=await seed(q,[op('experience_items','insert',{title:'  New role  '},added),op('experience_bullets','insert',{text:' New bullet ',item_id:added},other)]);await approve(q,id);
  expect(await q('select title,kind,org,sort,public from public.experience_items where id=$1',[added])).toEqual([{title:'New role',kind:'role',org:'',sort:100,public:false}]);
  expect(await q('select text,sort,public,item_id from public.experience_bullets where id=$1',[other])).toEqual([{text:'New bullet',sort:100,public:false,item_id:added}]);
 });
});
it('bullet updates move parents and ordering; approved deletion stores the full preceding row',async()=>{
 await as(db,owner,async q=>{
  const id=await seed(q,[op('experience_bullets','update',{item_id:other,text:' Edited ',sort:3,public:false},bullet),op('experience_bullets','delete',{},bullet)]);
  expect(await q('select text from public.experience_bullets where id=$1',[bullet])).toEqual([{text:'Old proof'}]);
  const [set]=await approve(q,id);expect(set.previous[0].values).toMatchObject({id:bullet,item_id:item,text:'Old proof',sort:12,public:true});expect(set.previous[1].values).toMatchObject({id:bullet,item_id:other,text:'Edited',sort:3,public:false,updated_at:expect.anything()});
  expect(await q('select * from public.experience_bullets where id=$1',[bullet])).toEqual([]);
 });
});
it('discard never applies a pending bullet deletion',async()=>{
 await as(db,owner,async q=>{const id=await seed(q,[op('experience_bullets','delete',{},bullet)]);await q("update public.content_changes set status='discarded' where id=$1",[id]);expect(await q('select id from public.experience_bullets where id=$1',[bullet])).toHaveLength(1);});
});
const bad: [string,unknown,RegExp][]=[];
for(const action of ['insert','update']){
 for(const [field,max] of [['title',160],['org',160],['dates',80],['location',80],['summary',2000]] as const)bad.push([`${action} long ${field}`,op('experience_items',action,{title:'Valid',[field]:'x'.repeat(max+1)}),/too long/]);
 for(const [name,fields,message] of [['kind',{title:'X',kind:'unknown'},/Unknown experience kind/],['blank',{title:' \u00a0 '},/cannot be blank/],['public',{title:'X',public:'yes'},/boolean/],['sort',{title:'X',sort:1.5},/integer/],['overflow',{title:'X',sort:2147483648},/integer/],['unknown',{title:'X',updated_at:'today'},/Unknown editable/],['null',{title:'X',summary:null},/must be text/]] as const)bad.push([`${action} item ${name}`,op('experience_items',action,fields),message]);
 for(const [name,fields,message] of [['long',{text:'x'.repeat(1001),item_id:item},/too long/],['blank',{text:' ',item_id:item},/cannot be blank/],['parent',{text:'X',item_id:'invalid'},/UUID/],['public',{text:'X',item_id:item,public:0},/boolean/],['sort',{text:'X',item_id:item,sort:'2'},/integer/],['unknown',{text:'X',item_id:item,id:bullet},/Unknown editable/]] as const)bad.push([`${action} bullet ${name}`,op('experience_bullets',action,fields,bullet),message]);
}
bad.push(['item delete',op('experience_items','delete',{}),/only bullets/],['delete fields',op('experience_bullets','delete',{text:'X'},bullet),/no editable fields/],['delete absent',op('experience_bullets','delete',{},added),/no longer exists/],['item missing title',op('experience_items','insert',{org:'X'},added),/requires a title/],['bullet missing parent',op('experience_bullets','insert',{text:'X'},added),/requires text and item_id/],['bad UUID',op('experience_items','update',{title:'X'},'invalid'),/UUID/],['empty update',op('experience_items','update',{}),/at least one/],['missing parent',op('experience_bullets','update',{item_id:added},bullet),/parent item does not exist/],['insert duplicate',op('experience_items','insert',{title:'X'}),/duplicate key/],['update absent',op('experience_items','update',{title:'X'},added),/no longer exists/],['unknown op property',{...op(),sql:'anything'},/Unknown experience/]);
for(const [name,operation,message] of bad)it(`${name}: rejects SQL payload and rolls the earlier edit back`,async()=>{
 await as(db,owner,async q=>{
  const before=await q('select * from public.experience_items where id=$1',[item]);
  const id=await seed(q,[op('experience_items','update',{title:'Must roll back'}),operation]);await q('savepoint approval');
  await expect(approve(q,id)).rejects.toThrow(message);await q('rollback to savepoint approval');
  expect(await q('select * from public.experience_items where id=$1',[item])).toEqual(before);
  expect(await q('select status,previous,approved_at,approved_by from public.content_changes where id=$1',[id])).toEqual([{status:'draft',previous:null,approved_at:null,approved_by:null}]);
 });
});
it('SQL matches editor UTF-16 lengths and trimming, including astral characters',async()=>{
 await as(db,owner,async q=>{const id=await seed(q,[op('experience_items','update',{title:'😀'.repeat(80),sort:1e2}),op('experience_bullets','update',{text:'\ufeffTrimmed\u00a0'},bullet)]);await approve(q,id);expect(await q('select title,sort from public.experience_items where id=$1',[item])).toEqual([{title:'😀'.repeat(80),sort:100}]);expect(await q('select text from public.experience_bullets where id=$1',[bullet])).toEqual([{text:'Trimmed'}]);});
 await expect(as(db,owner,async q=>approve(q,await seed(q,[op('experience_items','update',{title:'😀'.repeat(81)})])))).rejects.toThrow(/too long/);
});
it('owner-only helper stays private and the original editor can still delete directly',async()=>{
 const r=await db.query<{prosecdef:boolean;proconfig:string[];granted:boolean}>("select prosecdef,proconfig,has_function_privilege('authenticated',oid,'EXECUTE') as granted from pg_proc where oid='private.apply_experience_draft(jsonb)'::regprocedure");expect(r.rows[0]).toEqual({prosecdef:true,proconfig:['search_path=""'],granted:false});
 for(const who of [{role:'anon' as const},{role:'authenticated' as const,sub:member.id},owner])await expect(as(db,who,q=>q("select private.apply_experience_draft('{}')"))).rejects.toThrow(/permission denied/);
 await as(db,owner,async q=>expect(await q('delete from public.experience_bullets where id=$1 returning id',[bullet])).toHaveLength(1));
});
it('non-owner cannot approve an experience draft and administrative callers still require owner claims',async()=>{
 const id=(await db.query<{id:string}>("insert into public.content_changes(summary,operations) values ('Private proposal',$1) returning id",[JSON.stringify([op()])])).rows[0].id;
 expect(await as(db,{role:'authenticated',sub:member.id},q=>approve(q,id))).toEqual([]);
 await expect(db.query("update public.content_changes set status='approved' where id=$1",[id])).rejects.toThrow(/Only the owner/);
 expect((await db.query('select title from public.experience_items where id=$1',[item])).rows).toEqual([{title:'Live role'}]);
});

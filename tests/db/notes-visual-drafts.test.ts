import {beforeAll,afterAll,it,expect} from 'vitest';
import type {PGlite} from '@electric-sql/pglite';
import {freshDb,as,addUser} from './harness';
// Q5: private.apply_app_draft lets notes drafts set `visual` (jsonb array/object), nothing else new.
const user={id:'00000000-0000-4000-8000-000000000a51',email:'visual-owner@example.test'},member={id:'00000000-0000-4000-8000-000000000a52',email:'visual-member@example.test'};
const owner={role:'authenticated' as const,sub:user.id};
const tables={kind:'tables',title:'LEFT JOIN',tables:[{id:'a',name:'a',columns:['id'],rows:[[1],[null]]}],frames:[{caption:'one'},{caption:'two',highlight:[{table:'a',row:1}]}]};
const op=(fields:unknown,key:string|number='sql-note',table='notes',action='update')=>({table,op:action,fields,key});
type Query=<R=Record<string,unknown>>(sql:string,params?:unknown[])=>Promise<R[]>;
let db:PGlite;
beforeAll(async()=>{db=await freshDb();await db.query("insert into private.settings(key,value) values ('owner_email',$1)",[user.email]);await addUser(db,user);await addUser(db,member);
 await db.query("insert into public.notes(id,title,body,free,visual,sort) values ('sql-note','SQL note','Live body','Live free','[{\"kind\":\"array\",\"title\":\"Old\"}]',9001)");
 await db.exec("insert into public.question_notes(problem,body) values (217,'Live question')");},30000);
afterAll(async()=>{await db?.close();});
async function seed(q:Query,operations:unknown[]){return (await q<{id:string}>("insert into public.content_changes(summary,operations) values ('Synthetic visual proposal',$1) returning id",[JSON.stringify(operations)]))[0].id;}
const approve=(q:Query,id:string)=>q<{previous:{table:string;key:string;values:Record<string,unknown>|null}[];status:string}>("update public.content_changes set status='approved' where id=$1 returning *",[id]);
const note=(q:Query)=>q("select title,body,free,visual,sort from public.notes where id='sql-note'");
const live={title:'SQL note',body:'Live body',free:'Live free',visual:[{kind:'array',title:'Old'}],sort:9001};

it('a notes draft sets visual (array), keeps title/sort/body/free, and the audit row retains the previous visual',async()=>{
 await as(db,owner,async q=>{
  const [set]=await approve(q,await seed(q,[op({visual:[tables]})]));expect(set.status).toBe('approved');
  expect(set.previous[0].values).toMatchObject({visual:[{kind:'array',title:'Old'}],title:'SQL note',sort:9001});
  expect(await note(q)).toEqual([{...live,visual:[tables]}]);
  const [stamp]=await q<{moved:boolean}>("select updated_at>now()-interval '1 minute' as moved from public.notes where id='sql-note'");expect(stamp.moved).toBe(true);
 });
});
it('accepts a single visual object, an empty list, and body+visual together',async()=>{
 await as(db,owner,async q=>{
  await approve(q,await seed(q,[op({visual:tables})]));expect((await note(q))[0]).toMatchObject({visual:tables});
  await approve(q,await seed(q,[op({visual:[]})]));expect((await note(q))[0]).toMatchObject({visual:[]});
  await approve(q,await seed(q,[op({body:'New body',visual:[tables,{kind:'grid',title:'G'}]})]));expect((await note(q))[0]).toMatchObject({body:'New body',free:'Live free',visual:[tables,{kind:'grid',title:'G'}]});
 });
});
it('a body-only draft keeps the live visual untouched (even one the visual check would refuse)',async()=>{
 await as(db,owner,async q=>{
  await q("update public.notes set visual='[1,\"odd\"]' where id='sql-note'");
  await approve(q,await seed(q,[op({body:'Body only'})]));
  expect(await note(q)).toEqual([{title:'SQL note',body:'Body only',free:'Live free',visual:[1,'odd'],sort:9001}]);
  await q("update public.notes set body='Live body',visual='[{\"kind\":\"array\",\"title\":\"Old\"}]' where id='sql-note'");
 });
});
const tooBig={kind:'tables',title:'x'.repeat(200001)};
const invalid:[string,unknown][]=[
 ['a string visual',{visual:'[]'}],['a number',{visual:5}],['null',{visual:null}],['a boolean',{visual:true}],
 ['a non-object element',{visual:[1]}],['an element with no kind',{visual:[{title:'x'}]}],['an unknown kind',{visual:[{kind:'chart'}]}],['a non-string kind',{visual:[{kind:5}]}],['a single object with an unknown kind',{visual:{kind:'chart'}}],
 ['41 visuals',{visual:Array.from({length:41},()=>tables)}],['an oversized visual',{visual:[tooBig]}],
 ['a title edit',{title:'Hacked'}],['a sort edit',{sort:1}],['an id edit',{id:'other'}],['a title next to a valid visual',{visual:[tables],title:'X'}],['an unknown field',{visual_extra:[]}],['no fields',{}],
];
for(const [label,fields] of invalid)it(`rejects ${label} and rolls back earlier operations, status and audit`,async()=>{
 await as(db,owner,async q=>{
  const before=await note(q);const id=await seed(q,[op({body:'Must roll back'}),op(fields)]);
  await q('savepoint approval');await expect(approve(q,id)).rejects.toThrow();await q('rollback to savepoint approval');
  expect(await note(q)).toEqual(before);expect(await q('select status,previous,approved_at from public.content_changes where id=$1',[id])).toEqual([{status:'draft',previous:null,approved_at:null}]);
 });
});
it('accepts exactly 40 visuals and a visual just under the size limit',async()=>{
 await as(db,owner,async q=>{
  await approve(q,await seed(q,[op({visual:Array.from({length:40},()=>({kind:'grid',title:'G'}))})]));expect((await note(q))[0].visual).toHaveLength(40);
  const pad='x'.repeat(199900);await approve(q,await seed(q,[op({visual:[{kind:'tables',title:pad}]})]));expect(((await note(q))[0].visual as unknown[]).length).toBe(1);
 });
});
it('visual is still not editable on other tables and notes keep update-only',async()=>{
 await as(db,owner,async q=>{
  for(const bad of [op({visual:[tables]},217,'question_notes'),op({visual:[tables]},'sql-note','notes','insert'),op({visual:[tables]},'sql-note','notes','delete'),op({visual:[tables]},'absent-note')]){
   const id=await seed(q,[bad]);await q('savepoint approval');await expect(approve(q,id)).rejects.toThrow();await q('rollback to savepoint approval');
  }
  expect(await q('select body from public.question_notes where problem=217')).toEqual([{body:'Live question'}]);
 });
});
it('members and visitors cannot approve a visual draft; the helper stays private with an empty search_path',async()=>{
 const id=(await db.query<{id:string}>("insert into public.content_changes(summary,operations) values ('Synthetic private visual',$1) returning id",[JSON.stringify([op({visual:[tables]})])])).rows[0].id;
 expect(await as(db,{role:'authenticated' as const,sub:member.id},q=>approve(q,id))).toEqual([]);
 await expect(db.query("update public.content_changes set status='approved' where id=$1",[id])).rejects.toThrow(/Only the owner/);
 const r=await db.query<{proconfig:string[];allowed:boolean}>("select proconfig,has_function_privilege('authenticated',oid,'EXECUTE') or has_function_privilege('anon',oid,'EXECUTE') or has_function_privilege('service_role',oid,'EXECUTE') as allowed from pg_proc where oid='private.apply_app_draft(jsonb)'::regprocedure");
 expect(r.rows[0]).toEqual({proconfig:['search_path=""'],allowed:false});
});

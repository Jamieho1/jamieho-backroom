import {beforeAll,afterAll,it,expect} from 'vitest';
import type {PGlite} from '@electric-sql/pglite';
import {freshDb,as,addUser} from './harness';
const ownerUser={id:'00000000-0000-4000-8000-000000000c10',email:'at-owner@example.test'},member={id:'00000000-0000-4000-8000-000000000c11',email:'at-member@example.test'},other={id:'00000000-0000-4000-8000-000000000c12',email:'at-other@example.test'};
const owner={role:'authenticated' as const,sub:ownerUser.id},memberWho={role:'authenticated' as const,sub:member.id},otherWho={role:'authenticated' as const,sub:other.id};
const pub='00000000-0000-4000-8000-000000000c01',hidden='00000000-0000-4000-8000-000000000c02';
const scene=JSON.stringify({v:1,elements:[{id:'a',type:'rectangle'}]});
const ins="insert into public.system_design_attempts(question_id,scene,answers,checks,seconds,covered,total) values ($1,$2::jsonb,$3::jsonb,$4::jsonb,$5,$6,$7)";
const good=(q:string)=>[q,scene,'{"entities":"my answer"}','{"entities":[0]}',90,1,3];
let db:PGlite;
beforeAll(async()=>{
 db=await freshDb();await db.query("insert into private.settings(key,value) values ('owner_email',$1)",[ownerUser.email]);
 for(const u of [ownerUser,member,other])await addUser(db,u);
 await db.query("insert into public.system_design_questions(id,slug,title,public) values ($1,'at-public','Public',true),($2,'at-hidden','Hidden',false)",[pub,hidden]);
});
afterAll(async()=>{await db?.close();});
const seed=(user:string,n=1)=>db.query("insert into public.system_design_attempts(user_id,question_id,scene) select $1,$2,$3::jsonb from generate_series(1,$4::int)",[user,pub,scene,n]);
it('a user inserts, reads and deletes only their own attempts; nobody (owner included) sees or changes others',async()=>{
 await as(db,memberWho,async q=>{await q(ins,good(pub));expect(await q('select covered,total,seconds from public.system_design_attempts')).toEqual([{covered:1,total:3,seconds:90}]);});
 await db.query("insert into public.system_design_attempts(user_id,question_id,scene) values ($1,$2,$3::jsonb)",[member.id,pub,scene]);
 for(const who of [otherWho,owner])await as(db,who,async q=>{
  expect(await q('select id from public.system_design_attempts')).toEqual([]);
  expect(await q('delete from public.system_design_attempts where user_id=$1 returning id',[member.id])).toEqual([]);
 });
 await expect(as(db,otherWho,q=>q("insert into public.system_design_attempts(user_id,question_id,scene) values ($1,$2,$3::jsonb)",[member.id,pub,scene]))).rejects.toThrow();
 await expect(as(db,otherWho,q=>q(ins,good(hidden)))).rejects.toThrow();
 await as(db,memberWho,async q=>{expect((await q('delete from public.system_design_attempts returning id')).length).toBe(1);});
 await db.query('delete from public.system_design_attempts');
});
it('snapshots are immutable and visitors have no access',async()=>{
 await db.query("insert into public.system_design_attempts(user_id,question_id,scene) values ($1,$2,$3::jsonb)",[member.id,pub,scene]);
 await expect(as(db,memberWho,q=>q("update public.system_design_attempts set seconds=1"))).rejects.toThrow();
 await expect(as(db,{role:'anon'},q=>q('select * from public.system_design_attempts'))).rejects.toThrow();
 await expect(as(db,{role:'anon'},q=>q(ins,good(pub)))).rejects.toThrow();
 await db.query('delete from public.system_design_attempts');
});
it('bounds the canvas, answers, ticks, timer and summary',async()=>{
 const bad:unknown[][]=[
  [pub,'[]','{}','{}',0,0,0],[pub,'{}','{}','{}',0,0,0],[pub,JSON.stringify({elements:Array.from({length:3001},(_,i)=>({id:'e'+i}))}),'{}','{}',0,0,0],[pub,JSON.stringify({elements:[{t:'x'.repeat(1_000_001)}]}),'{}','{}',0,0,0],
  [pub,scene,'[]','{}',0,0,0],[pub,scene,JSON.stringify(Object.fromEntries(Array.from({length:13},(_,i)=>['s'+i,'x']))),'{}',0,0,0],[pub,scene,JSON.stringify({a:'x'.repeat(200_001)}),'{}',0,0,0],
  [pub,scene,'{}','[]',0,0,0],[pub,scene,'{}',JSON.stringify({a:Array.from({length:30000},()=>1)}),0,0,0],
  [pub,scene,'{}','{}',-1,0,0],[pub,scene,'{}','{}',86401,0,0],[pub,scene,'{}','{}',0,2,1],[pub,scene,'{}','{}',0,-1,1],[pub,scene,'{}','{}',0,0,201],
 ];
 for(const b of bad)await expect(as(db,otherWho,q=>q(ins,b))).rejects.toThrow();
 await as(db,otherWho,async q=>{await q(ins,[pub,JSON.stringify({elements:Array.from({length:3000},(_,i)=>({id:'e'+i}))}),'{}','{}',86400,200,200]);});
});
it('caps stored attempts at 30 per user and question (other users and questions unaffected)',async()=>{
 await seed(member.id,30);
 await expect(seed(member.id,1)).rejects.toThrow(/Too many saved attempts/);
 await seed(other.id,1);
 await db.query("insert into public.system_design_questions(id,slug,title,public) values ('00000000-0000-4000-8000-000000000c03','at-second','Second',true)");
 await db.query("insert into public.system_design_attempts(user_id,question_id,scene) values ($1,'00000000-0000-4000-8000-000000000c03',$2::jsonb)",[member.id,scene]);
 await db.query('delete from public.system_design_attempts where user_id=$1',[member.id]);await seed(member.id,1);
 await db.query('delete from public.system_design_attempts');
});
it('only the export role reads across accounts; rows cascade with the account and the question',async()=>{
 expect((await db.query<{ok:boolean}>("select has_table_privilege('service_role','public.system_design_attempts','select') ok")).rows[0].ok).toBe(true);
 expect((await db.query<{ok:boolean}>("select has_table_privilege('service_role','public.system_design_attempts','insert') or has_table_privilege('anon','public.system_design_attempts','select') or has_table_privilege('authenticated','public.system_design_attempts','update') ok")).rows[0].ok).toBe(false);
 await seed(other.id,1);await seed(member.id,1);
 expect((await db.query('select * from public.system_design_attempts')).rows).toHaveLength(2);
 await db.query("delete from auth.users where id=$1",[member.id]);
 expect((await db.query('select user_id from public.system_design_attempts')).rows).toEqual([{user_id:other.id}]);
 await db.query("delete from public.system_design_questions where id=$1",[pub]);
 expect((await db.query('select * from public.system_design_attempts')).rows).toEqual([]);
});
it('the tightened step validator accepts S1 and S3 shapes and rejects bad ones',async()=>{
 const full={id:'redirect-flow',title:'Redirect flow',category:'Deep dive',question:'q',instruction:'i',minutes:3,frame:'wb-hld',how_to_answer:'h',model_answer:'m',checklist:['a','b'],clarifying:[{q:'x',a:'y'}]};
 const ok=async(steps:unknown)=>(await db.query<{v:boolean}>("select private.valid_sd_steps($1::jsonb) v",[JSON.stringify(steps)])).rows[0].v;
 expect(await ok([])).toBe(true);expect(await ok([{id:'a',title:'A'}])).toBe(true);expect(await ok([full,{id:'two',title:'Two',frame:'wb-api'}])).toBe(true);
 for(const bad of [[{...full,extra:1}],[{...full,frame:'wb-x'}],[{...full,minutes:0}],[{...full,minutes:61}],[{...full,minutes:2.5}],[{...full,minutes:'3'}],[{...full,checklist:['']}],[{...full,checklist:Array(13).fill('x')}],[{...full,checklist:'x'}],[{...full,clarifying:[{q:'x'}]}],[{...full,clarifying:[{q:'x',a:'y',z:1}]}],[{...full,clarifying:Array(11).fill({q:'x',a:'y'})}],[{...full,category:'x'.repeat(41)}],[{...full,model_answer:'x'.repeat(6001)}],[{...full,how_to_answer:'x'.repeat(4001)}],[{...full,question:'x'.repeat(601)}],[full,full],[{id:'a'}],Array(13).fill(0).map((_,i)=>({id:'s'+i,title:'T'}))])
  expect(await ok(bad)).toBe(false);
 await db.query("insert into public.system_design_questions(slug,title,steps) values ('steps-ok','T',$1::jsonb)",[JSON.stringify([full])]);
 await expect(db.query("insert into public.system_design_questions(slug,title,steps) values ('steps-bad','T',$1::jsonb)",[JSON.stringify([{...full,frame:'nope'}])])).rejects.toThrow();
});

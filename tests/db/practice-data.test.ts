import { beforeAll,afterAll,expect,it } from 'vitest';
import type { PGlite } from '@electric-sql/pglite';
import { freshDb,addUser,as } from './harness';
let db:PGlite;
const owner={id:'00000000-0000-4000-8000-0000000000b1',email:'owner@example.com'};
const member={id:'00000000-0000-4000-8000-0000000000b2',email:'member@example.com'};
const invited={id:'00000000-0000-4000-8000-0000000000b3',email:'invited@example.com'};
const who=(id:string)=>({role:'authenticated' as const,sub:id});
beforeAll(async()=>{
 db=await freshDb();await db.query("insert into private.settings (key,value) values ('owner_email',$1)",[owner.email]);
 for(const user of [owner,member,invited])await addUser(db,user);
 await db.query('insert into public.invites (email) values ($1)',[invited.email]);
 await db.query("insert into public.practice_code (problem,code) values (217,'Private code')");
 await db.query("insert into public.practice_attempts (id,problem,code,mode,status,passed,total) values ('00000000-0000-4000-8000-0000000000aa',217,'Private attempt','submit','ok',2,2)");
 await db.query("insert into public.question_notes (problem,body) values (217,'Shared explanation')");
});
afterAll(async()=>{await db.close();});
it('only the owner reads saved code and attempts, even when Practice is public',async()=>{
 await db.query("update public.apps set visibility='public' where id='practice'");
 for(const role of [{role:'anon' as const},who(member.id),who(invited.id)]){
  expect(await as(db,role,q=>q('select problem from public.practice_code'))).toEqual([]);
  expect(await as(db,role,q=>q('select problem from public.practice_attempts'))).toEqual([]);
 }
 for(const table of ['practice_code','practice_attempts'])expect((await as(db,who(owner.id),q=>q(`select problem from public.${table}`))).length).toBe(1);
});
it('question notes follow all visibility modes and invitation removal',async()=>{
 for(const [visibility,a,m,i] of [['public',1,1,1],['signed_in',0,1,1],['invite_only',0,0,1],['owner_only',0,0,0]] as const){
  await db.query("update public.apps set visibility=$1 where id='practice'",[visibility]);
  for(const [role,count] of [[{role:'anon' as const},a],[who(member.id),m],[who(invited.id),i],[who(owner.id),1]] as const){
   expect((await as(db,role,q=>q('select problem from public.question_notes'))).length).toBe(count);
  }
 }
 await db.query("update public.apps set visibility='invite_only' where id='practice'");
 await db.query('delete from public.invites where email=$1',[invited.email]);
 expect(await as(db,who(invited.id),q=>q('select problem from public.question_notes'))).toEqual([]);
 await db.query("update public.apps set visibility='signed_in' where id='practice'");
});
it('members cannot insert, update or delete any Practice data',async()=>{
 for(const user of [member,invited]){
  for(const sql of ["insert into public.practice_code (problem,code) values (1,'X')","insert into public.practice_attempts (problem,code,mode,status) values (1,'X','run','ok')","insert into public.question_notes (problem,body) values (1,'X')"]){
   await expect(as(db,who(user.id),q=>q(sql))).rejects.toThrow(/row-level security/);
  }
  for(const [table,col] of [['practice_code','code'],['practice_attempts','code'],['question_notes','body']]){
   expect(await as(db,who(user.id),q=>q(`update public.${table} set ${col}='Changed' returning problem`))).toEqual([]);
   expect(await as(db,who(user.id),q=>q(`delete from public.${table} returning problem`))).toEqual([]);
  }
 }
});
it('the owner can upsert code and question notes, and attempt retries create only one row',async()=>{
 await as(db,who(owner.id),async q=>{
  await q("insert into public.practice_code (problem,code) values (217,'New code') on conflict (problem) do update set code=excluded.code");
  await q("insert into public.question_notes (problem,body) values (217,'New notes') on conflict (problem) do update set body=excluded.body");
  for(let n=0;n<2;n++)await q("insert into public.practice_attempts (id,problem,code,mode,status) values ('00000000-0000-4000-8000-0000000000ab',217,'Run snapshot','run','ok') on conflict (id) do update set code=excluded.code");
  expect(await q("select count(*)::int as n from public.practice_attempts where id='00000000-0000-4000-8000-0000000000ab'")).toEqual([{n:1}]);
  for(const table of ['practice_code','practice_attempts','question_notes'])expect((await q(`delete from public.${table} returning problem`)).length).toBeGreaterThan(0);
 });
});
it('committed owner code is visible from another session; visitors still see no private code',async()=>{
 await db.exec('begin');try{
  await db.query("select set_config('request.jwt.claims',$1,true)",[JSON.stringify({role:'authenticated',sub:owner.id})]);
  await db.exec('set local role authenticated');await db.query("update public.practice_code set code='Synced' where problem=217");await db.exec('commit');
 }catch(error){await db.exec('rollback');throw error;}
 expect(await as(db,who(owner.id),q=>q('select code from public.practice_code'))).toEqual([{code:'Synced'}]);
 expect(await as(db,who(member.id),q=>q('select code from public.practice_code'))).toEqual([]);
});

import {beforeAll,afterAll,it,expect} from 'vitest';
import type {PGlite} from '@electric-sql/pglite';
import {freshDb,as,addUser} from './harness';
let db:PGlite;
const owner={id:'00000000-0000-4000-8000-000000000071',email:'owner@example.com'},member={id:'00000000-0000-4000-8000-000000000072',email:'member@example.com'},invited={id:'00000000-0000-4000-8000-000000000073',email:'invited@example.com'};
const who=(id:string)=>({role:'authenticated' as const,sub:id});
beforeAll(async()=>{db=await freshDb();await db.query("insert into private.settings(key,value) values ('owner_email',$1)",[owner.email]);for(const u of [owner,member,invited])await addUser(db,u);await db.query('insert into public.invites(email) values ($1)',[invited.email]);await db.query('insert into public.practice_stars(problem) values (217)');});
afterAll(async()=>{await db.close();});
it('review list is owner-only under every Practice visibility',async()=>{
 for(const visibility of ['public','signed_in','invite_only','owner_only']){
  await db.query("update public.apps set visibility=$1 where id='practice'",[visibility]);
  for(const role of [{role:'anon' as const},who(member.id),who(invited.id)])expect(await as(db,role,q=>q('select problem from public.practice_stars'))).toEqual([]);
  expect(await as(db,who(owner.id),q=>q('select problem from public.practice_stars'))).toEqual([{problem:217}]);
 }
});
it('members/invitees cannot insert, update or delete; anonymous has no write privilege',async()=>{
 for(const u of [member,invited]){
  await expect(as(db,who(u.id),q=>q('insert into public.practice_stars(problem) values (1)'))).rejects.toThrow(/row-level security/);
  expect(await as(db,who(u.id),q=>q('update public.practice_stars set problem=1 returning problem'))).toEqual([]);
  expect(await as(db,who(u.id),q=>q('delete from public.practice_stars returning problem'))).toEqual([]);
 }
 await expect(as(db,{role:'anon'},q=>q('insert into public.practice_stars(problem) values (1)'))).rejects.toThrow(/permission denied/);
});
it('owner retries star/unstar idempotently, and can update own review list',async()=>{
 await as(db,who(owner.id),async q=>{
  for(let i=0;i<2;i++)await q('insert into public.practice_stars(problem) values (1) on conflict(problem) do update set problem=excluded.problem');
  expect(await q('select count(*)::int n from public.practice_stars where problem=1')).toEqual([{n:1}]);
  expect(await q('update public.practice_stars set problem=242 where problem=1 returning problem')).toEqual([{problem:242}]);
  expect(await q('delete from public.practice_stars where problem=242 returning problem')).toEqual([{problem:242}]);
  expect(await q('delete from public.practice_stars where problem=242 returning problem')).toEqual([]);
 });
});
it('a committed owner star is available in a second session and private from members',async()=>{
 await db.exec('begin');try{
  await db.query("select set_config('request.jwt.claims',$1,true)",[JSON.stringify({role:'authenticated',sub:owner.id})]);await db.exec('set local role authenticated');await db.query('insert into public.practice_stars(problem) values (1)');await db.exec('commit');
 }catch(e){await db.exec('rollback');throw e;}
 expect(await as(db,who(owner.id),q=>q('select problem from public.practice_stars order by problem'))).toEqual([{problem:1},{problem:217}]);
 expect(await as(db,who(member.id),q=>q('select problem from public.practice_stars'))).toEqual([]);
});

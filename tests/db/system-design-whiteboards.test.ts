import {beforeAll,afterAll,it,expect} from 'vitest';
import type {PGlite} from '@electric-sql/pglite';
import {freshDb,as,addUser} from './harness';
const ownerUser={id:'00000000-0000-4000-8000-000000000b10',email:'wb-owner@example.test'},member={id:'00000000-0000-4000-8000-000000000b11',email:'wb-member@example.test'},other={id:'00000000-0000-4000-8000-000000000b12',email:'wb-other@example.test'};
const owner={role:'authenticated' as const,sub:ownerUser.id},memberWho={role:'authenticated' as const,sub:member.id},otherWho={role:'authenticated' as const,sub:other.id};
const pub='00000000-0000-4000-8000-000000000b01',hidden='00000000-0000-4000-8000-000000000b02';
const scene=JSON.stringify({v:1,elements:[{id:'a',type:'rectangle'}]});
let db:PGlite;
beforeAll(async()=>{
 db=await freshDb();await db.query("insert into private.settings(key,value) values ('owner_email',$1)",[ownerUser.email]);
 for(const u of [ownerUser,member,other])await addUser(db,u);
 await db.query("insert into public.system_design_questions(id,slug,title,public) values ($1,'wb-public','Public',true),($2,'wb-hidden','Hidden',false)",[pub,hidden]);
});
afterAll(async()=>{await db?.close();});
it('a user reads, writes, updates and deletes only their own board; others (including the owner) see nothing',async()=>{
 // `as` rolls back, so the board a user "already has" is inserted directly.
 await db.query("insert into public.system_design_whiteboards(user_id,question_id,scene) values ($1,$2,$3::jsonb)",[member.id,pub,scene]);
 await as(db,memberWho,async q=>{
  expect(await q('select question_id from public.system_design_whiteboards')).toEqual([{question_id:pub}]);
  expect(await q("update public.system_design_whiteboards set scene='{\"elements\":[]}'::jsonb returning question_id")).toEqual([{question_id:pub}]);
 });
 await as(db,otherWho,async q=>{await q("insert into public.system_design_whiteboards(question_id,scene) values ($1,$2::jsonb)",[pub,scene]);expect(await q('select user_id from public.system_design_whiteboards')).toEqual([{user_id:other.id}]);});
 for(const who of [otherWho,owner])await as(db,who,async q=>{
  expect((await q<{user_id:string}>('select user_id from public.system_design_whiteboards')).every(r=>r.user_id!==member.id)).toBe(true);
  expect(await q("update public.system_design_whiteboards set scene='{\"elements\":[]}'::jsonb where user_id=$1 returning question_id",[member.id])).toEqual([]);
  expect(await q('delete from public.system_design_whiteboards where user_id=$1 returning question_id',[member.id])).toEqual([]);
 });
 await as(db,owner,async q=>{expect(await q('select * from public.system_design_whiteboards')).toEqual([]);});
 await expect(as(db,otherWho,q=>q("insert into public.system_design_whiteboards(user_id,question_id,scene) values ($1,$2,$3::jsonb)",[member.id,hidden,scene]))).rejects.toThrow();
 await expect(as(db,otherWho,q=>q("insert into public.system_design_whiteboards(user_id,question_id,scene) values ($1,$2,$3::jsonb)",[member.id,pub,scene]))).rejects.toThrow();
 await expect(as(db,memberWho,q=>q("update public.system_design_whiteboards set user_id=$1",[other.id]))).rejects.toThrow();
 await as(db,memberWho,async q=>{expect(await q('delete from public.system_design_whiteboards returning question_id')).toHaveLength(1);});
 await db.query('delete from public.system_design_whiteboards');
});
it('visitors have no access at all',async()=>{
 await expect(as(db,{role:'anon'},q=>q('select * from public.system_design_whiteboards'))).rejects.toThrow();
 await expect(as(db,{role:'anon'},q=>q("insert into public.system_design_whiteboards(user_id,question_id,scene) values ($1,$2,'{\"elements\":[]}'::jsonb)",[member.id,pub]))).rejects.toThrow();
});
it('requires a public question and a well-formed, bounded scene',async()=>{
 await expect(as(db,otherWho,q=>q("insert into public.system_design_whiteboards(question_id,scene) values ($1,$2::jsonb)",[hidden,scene]))).rejects.toThrow();
 for(const bad of ['[]','{}','{"elements":{}}','"x"',JSON.stringify({elements:Array.from({length:3001},(_,i)=>({id:'e'+i}))}),JSON.stringify({elements:[{t:'x'.repeat(1_000_001)}]})])
  await expect(as(db,otherWho,q=>q("insert into public.system_design_whiteboards(question_id,scene) values ($1,$2::jsonb)",[pub,bad]))).rejects.toThrow();
 await as(db,memberWho,async q=>{await q("insert into public.system_design_whiteboards(question_id,scene) values ($1,$2::jsonb)",[pub,JSON.stringify({elements:Array.from({length:3000},(_,i)=>({id:'e'+i}))})]);});
 await db.query("insert into public.system_design_whiteboards(user_id,question_id,scene) values ($1,$2,$3::jsonb)",[member.id,pub,scene]);
 await expect(db.query("insert into public.system_design_whiteboards(user_id,question_id,scene) values ($1,$2,$3::jsonb)",[member.id,pub,scene])).rejects.toThrow();// one board per user and question
 await db.query("delete from public.system_design_whiteboards where user_id=$1",[member.id]);
});
it('only the export role can read across accounts, and the board cascades with the account and the question',async()=>{
 await db.query("insert into public.system_design_whiteboards(user_id,question_id,scene) values ($1,$2,$3::jsonb)",[other.id,pub,scene]);
 expect((await db.query<{ok:boolean}>("select has_table_privilege('service_role','public.system_design_whiteboards','select') ok")).rows[0].ok).toBe(true);
 expect((await db.query<{ok:boolean}>("select has_table_privilege('service_role','public.system_design_whiteboards','insert') or has_table_privilege('anon','public.system_design_whiteboards','select') ok")).rows[0].ok).toBe(false);
 expect((await db.query('select * from public.system_design_whiteboards')).rows).toHaveLength(1);
 await db.query("insert into public.system_design_whiteboards(user_id,question_id,scene) values ($1,$2,$3::jsonb)",[member.id,pub,scene]);
 await db.query("delete from auth.users where id=$1",[member.id]);
 expect((await db.query('select user_id from public.system_design_whiteboards')).rows).toEqual([{user_id:other.id}]);
 await db.query("delete from public.system_design_questions where id=$1",[pub]);
 expect((await db.query('select * from public.system_design_whiteboards')).rows).toEqual([]);
});

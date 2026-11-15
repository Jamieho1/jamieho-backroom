import {beforeAll,afterAll,it,expect} from 'vitest';
import type {PGlite} from '@electric-sql/pglite';
import {freshDb,as,addUser} from './harness';
const users=[{id:'00000000-0000-4000-8000-000000000071',email:'owner@example.test'},{id:'00000000-0000-4000-8000-000000000072',email:'a@example.test'},{id:'00000000-0000-4000-8000-000000000073',email:'b@example.test'}];
const who=(id:string)=>({role:'authenticated' as const,sub:id});
const tables=['practice_stars','practice_code','practice_attempts'];const attempt='00000000-0000-4000-8000-000000000080';let db:PGlite;
const insert=(table:string,identity:string,problem=1)=>`insert into public.${table}(user_id,problem${table==='practice_code'?',code':table==='practice_attempts'?',id,code,mode,status':''}) values ('${identity}',${problem}${table==='practice_code'?",'Synthetic code'":table==='practice_attempts'?",'00000000-0000-4000-8000-000000000081','Synthetic attempt','run','ok'":''})`;
beforeAll(async()=>{db=await freshDb();await db.query("insert into private.settings(key,value) values ('owner_email',$1)",[users[0].email]);for(const u of users){await addUser(db,u);await db.query('insert into public.practice_stars(user_id,problem) values ($1,217)',[u.id]);await db.query("insert into public.practice_code(user_id,problem,code) values ($1,217,$2)",[u.id,u.email]);await db.query("insert into public.practice_attempts(user_id,id,problem,code,mode,status,passed,total) values ($1,$2,217,$3,'submit','ok',2,2)",[u.id,attempt,u.email]);}},30000);
afterAll(async()=>{await db?.close();});
for(const table of tables){
 it(`${table}: anonymous has no SELECT/INSERT/UPDATE/DELETE grants`,async()=>{for(const sql of [`select * from public.${table}`,insert(table,users[0].id),`update public.${table} set problem=1`,`delete from public.${table}`])await expect(as(db,{role:'anon'},q=>q(sql))).rejects.toThrow(/permission denied/);});
 for(const user of users)it(`${table}: ${user.email} has only own-row CRUD, including owner isolation`,async()=>{
  const other=users.find(u=>u.id!==user.id)!;
  await as(db,who(user.id),async q=>{expect(await q(`select user_id from public.${table}`)).toEqual([{user_id:user.id}]);await q(insert(table,user.id));expect(await q(`update public.${table} set problem=2 where problem=1 returning user_id`)).toEqual([{user_id:user.id}]);expect(await q(`delete from public.${table} where problem=2 returning user_id`)).toEqual([{user_id:user.id}]);expect(await q(`update public.${table} set problem=3 where user_id=$1 returning *`,[other.id])).toEqual([]);expect(await q(`delete from public.${table} where user_id=$1 returning *`,[other.id])).toEqual([]);});
  await expect(as(db,who(user.id),q=>q(insert(table,other.id)))).rejects.toThrow(/row-level security/);
  await expect(as(db,who(user.id),q=>q(`update public.${table} set user_id=$1 where problem=217`,[other.id]))).rejects.toThrow(/row-level security/);
 });
}
it('composite attempt IDs and problem keys coexist across users; account deletion cascades only its rows',async()=>{await db.query('delete from auth.users where id=$1',[users[2].id]);for(const table of tables){expect((await db.query(`select user_id from public.${table} order by user_id`)).rows).toEqual(users.slice(0,2).map(u=>({user_id:u.id})));}});

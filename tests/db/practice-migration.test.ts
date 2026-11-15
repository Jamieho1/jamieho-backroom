import {it,expect} from 'vitest';
import {freshDb,addUser,as} from './harness';
const user={id:'00000000-0000-4000-8000-000000000120',email:'migration-owner@example.test'};
it('upgrades populated legacy data to its unique owner without changing any values',async()=>{
 const before:Record<string,unknown[]>={};const tables=['practice_code','practice_stars','practice_attempts'];
 const db=await freshDb({beforeMigration:async(db,file)=>{if(!file.endsWith('_per_user_practice.sql'))return;
  await db.query("insert into private.settings(key,value) values ('owner_email',$1)",[user.email]);await addUser(db,user);
  await db.exec("insert into public.practice_code(problem,code,updated_at) values (217,'Synthetic original code','2026-01-01');insert into public.practice_stars(problem,created_at) values(217,'2026-01-02');insert into public.practice_attempts(id,problem,code,mode,status,passed,total,created_at) values ('00000000-0000-4000-8000-000000000121',217,'Synthetic original attempt','submit','ok',2,2,'2026-01-03')");
  for(const t of tables)before[t]=(await db.query<{original:unknown}>(`select to_jsonb(t) as original from public.${t} t`)).rows.map(row=>row.original);
 }});
 try{for(const t of tables)expect(await as(db,{role:'authenticated',sub:user.id},q=>q(`select to_jsonb(t)-'user_id' as original from public.${t} t`))).toEqual(before[t].map(original=>({original:JSON.parse(JSON.stringify(original))})));
 }finally{await db.close();}
},30000);

it('refuses to assign populated legacy data when no owner profile exists',async()=>{
 let opened:import('@electric-sql/pglite').PGlite|undefined;
 try{await expect(freshDb({beforeMigration:async(db,file)=>{if(!file.endsWith('_per_user_practice.sql'))return;opened=db;await db.exec("insert into public.practice_code(problem,code) values (217,'Synthetic unassigned code')");}})).rejects.toThrow(/exactly one owner/);
 }finally{await opened?.close();}
},30000);

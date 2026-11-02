import {beforeAll,it,expect} from 'vitest';
import type {PGlite} from '@electric-sql/pglite';
import {freshDb,as,addUser} from './harness';
let db:PGlite;
const owner={role:'authenticated' as const,sub:'00000000-0000-4000-8000-00000000f101'};
const member={role:'authenticated' as const,sub:'00000000-0000-4000-8000-00000000f102'};
const guest={role:'authenticated' as const,sub:'00000000-0000-4000-8000-00000000f103'};
const anon={role:'anon' as const};
beforeAll(async()=>{db=await freshDb();await db.query("insert into private.settings(key,value) values ('owner_email','owner@example.com')");for(const [who,email] of [[owner,'owner@example.com'],[member,'member@example.com'],[guest,'guest@example.com']] as const)await addUser(db,{id:who.sub,email});await db.query("insert into public.invites(email) values ('guest@example.com')");});
for(const kind of ['certificate','skills'])it(`${kind} defaults hidden, respects public/Behavioral reads and owner-only entry/bullet CRUD`,async()=>{
 const {rows:[item]}=await db.query<{id:string;public:boolean}>("insert into public.experience_items(kind,title) values ($1,'Neutral entry') returning id,public",[kind]);
 expect(item.public).toBe(false);
 const {rows:[bullet]}=await db.query<{id:string;public:boolean}>("insert into public.experience_bullets(item_id,text) values ($1,'Neutral bullet') returning id,public",[item.id]);expect(bullet.public).toBe(false);
 for(const who of [anon,member]){
  expect(await as(db,who,q=>q('select id from public.experience_items where id=$1',[item.id]))).toHaveLength(0);
  expect(await as(db,who,q=>q('select id from public.experience_bullets where id=$1',[bullet.id]))).toHaveLength(0);
 }
 for(const who of [guest,owner]){
  expect(await as(db,who,q=>q('select id from public.experience_items where id=$1',[item.id]))).toHaveLength(1);
  expect(await as(db,who,q=>q('select id from public.experience_bullets where id=$1',[bullet.id]))).toHaveLength(1);
 }
 for(const who of [anon,member,guest])for(const table of ['experience_items','experience_bullets']){
  const id=table==='experience_items'?item.id:bullet.id;
  const insert=table==='experience_items'?()=>as(db,who,q=>q("insert into public.experience_items(kind,title) values ($1,'Forbidden')",[kind])):()=>as(db,who,q=>q("insert into public.experience_bullets(item_id,text) values ($1,'Forbidden')",[item.id]));
  await expect(insert()).rejects.toThrow(/permission denied|row-level security/);
  for(const sql of [`update public.${table} set public=true where id=$1 returning id`,`delete from public.${table} where id=$1 returning id`]){
   if(who===anon)await expect(as(db,who,q=>q(sql,[id]))).rejects.toThrow(/permission denied/);
   else expect(await as(db,who,q=>q(sql,[id]))).toEqual([]);
  }
 }
 await as(db,owner,async q=>{expect(await q('update public.experience_items set public=true where id=$1 returning id',[item.id])).toHaveLength(1);expect(await q('update public.experience_bullets set public=true where id=$1 returning id',[bullet.id])).toHaveLength(1)});
 await db.query('update public.experience_items set public=true where id=$1',[item.id]);
 await db.query('update public.experience_bullets set public=true where id=$1',[bullet.id]);
 for(const who of [anon,member]){
  expect(await as(db,who,q=>q('select id from public.experience_items where id=$1',[item.id]))).toHaveLength(1);
  expect(await as(db,who,q=>q('select id from public.experience_bullets where id=$1',[bullet.id]))).toHaveLength(1);
 }
 await as(db,owner,async q=>{const [added]=await q<{id:string}>("insert into public.experience_items(kind,title) values ($1,'Owner entry') returning id",[kind]);expect(await q("insert into public.experience_bullets(item_id,text) values ($1,'Owner bullet') returning id",[added.id])).toHaveLength(1);expect(await q('delete from public.experience_bullets where id=$1 returning id',[bullet.id])).toHaveLength(1);expect(await q('delete from public.experience_items where id=$1 returning id',[item.id])).toHaveLength(1)});
});
it('keeps experience SELECT policies separate from owner write policies',async()=>{
 const {rows}=await db.query<{tablename:string;cmd:string}>('select tablename,cmd from pg_policies where tablename in (\'experience_items\',\'experience_bullets\')');
 for(const table of ['experience_items','experience_bullets'])expect(rows.filter(r=>r.tablename===table).map(r=>r.cmd).sort()).toEqual(['DELETE','INSERT','SELECT','UPDATE']);
 await expect(db.query("insert into public.experience_items(kind) values ('unknown')")).rejects.toThrow(/check constraint/);
});

import { beforeAll,afterAll,it,expect } from 'vitest';
import type { PGlite } from '@electric-sql/pglite';
import { freshDb,as,addUser } from './harness';
let db:PGlite;
const owner={id:'00000000-0000-4000-8000-0000000000d1',email:'owner@example.com'};
const member={id:'00000000-0000-4000-8000-0000000000d2',email:'member@example.com'};
const invited={id:'00000000-0000-4000-8000-0000000000d3',email:'invited@example.com'};
const item='00000000-0000-4000-8000-0000000000e1',bullet='00000000-0000-4000-8000-0000000000e2';
const who=(id:string)=>({role:'authenticated' as const,sub:id});
beforeAll(async()=>{
 db=await freshDb();await db.query("insert into private.settings(key,value) values ('owner_email',$1)",[owner.email]);
 for(const u of [owner,member,invited])await addUser(db,u);
 await db.query('insert into public.invites(email) values ($1)',[invited.email]);
 await db.query("insert into public.experience_items(id,title) values ($1,'Hidden role')",[item]);
 await db.query("insert into public.experience_bullets(id,item_id,text) values ($1,$2,'Hidden bullet')",[bullet,item]);
 await db.query("insert into public.behavioral_stories(bullet_id,title,situation) values ($1,'Example story','Example situation')",[bullet]);
});
afterAll(async()=>{await db.close();});
it('Behavioral starts invite-only; uninvited users get no private CV or stories',async()=>{
 expect((await db.query<{visibility:string}>("select visibility from public.apps where id='behavioral'")).rows[0].visibility).toBe('invite_only');
 for(const role of [{role:'anon' as const},who(member.id)])for(const table of ['behavioral_stories','experience_items','experience_bullets'])expect(await as(db,role,q=>q(`select id from public.${table}`))).toEqual([]);
});
it('invitees and owner read the hidden CV and linked story',async()=>{
 for(const u of [owner,invited])await as(db,who(u.id),async q=>{
  expect(await q('select text from public.experience_bullets')).toEqual([{text:'Hidden bullet'}]);
  expect(await q('select bullet_id,title from public.behavioral_stories')).toEqual([{bullet_id:bullet,title:'Example story'}]);
 });
});
it('revoking an invitation immediately removes story and hidden CV access',async()=>{
 await db.query('delete from public.invites where email=$1',[invited.email]);
 for(const table of ['behavioral_stories','experience_items','experience_bullets'])expect(await as(db,who(invited.id),q=>q(`select id from public.${table}`))).toEqual([]);
 await db.query('insert into public.invites(email) values ($1)',[invited.email]);
});
it('each story read respects registry visibility modes',async()=>{
 for(const [visibility,a,m,g] of [['public',1,1,1],['signed_in',0,1,1],['invite_only',0,0,1],['owner_only',0,0,0]] as const){
  await db.query("update public.apps set visibility=$1 where id='behavioral'",[visibility]);
  for(const [role,n] of [[{role:'anon' as const},a],[who(member.id),m],[who(invited.id),g],[who(owner.id),1]] as const)expect((await as(db,role,q=>q('select id from public.behavioral_stories'))).length).toBe(n);
 }
 await db.query("update public.apps set visibility='invite_only' where id='behavioral'");
});
it('invitees cannot insert, update or delete stories; anon has no writes',async()=>{
 for(const u of [member,invited])await as(db,who(u.id),async q=>{
  await expect(q("insert into public.behavioral_stories(title) values ('Fake')")).rejects.toThrow(/row-level security/);
 });
 for(const u of [member,invited])await as(db,who(u.id),async q=>{
  expect(await q("update public.behavioral_stories set title='Changed' returning id")).toEqual([]);
  expect(await q('delete from public.behavioral_stories returning id')).toEqual([]);
 });
 await expect(as(db,{role:'anon'},q=>q("insert into public.behavioral_stories(title) values ('Fake')"))).rejects.toThrow(/permission denied/);
});
it('owner can create, update, relink and delete stories',async()=>{
 await as(db,who(owner.id),async q=>{
  const rows=await q<{id:string}>("insert into public.behavioral_stories(title) values ('New') returning id");
  expect(await q('update public.behavioral_stories set bullet_id=$1, result=$2 where id=$3 returning bullet_id,result',[bullet,'Measurable result',rows[0].id])).toEqual([{bullet_id:bullet,result:'Measurable result'}]);
  expect(await q('delete from public.behavioral_stories where id=$1 returning id',[rows[0].id])).toHaveLength(1);
 });
});
it('deleting a CV bullet keeps its story with an empty link',async()=>{
 await as(db,who(owner.id),async q=>{await q('delete from public.experience_bullets where id=$1',[bullet]);expect(await q('select bullet_id from public.behavioral_stories')).toEqual([{bullet_id:null}]);});
});
it('split Experience write policies retain owner inserts/updates/deletes and reject member writes',async()=>{
 for(const table of ['experience_items','experience_bullets']){
  expect((await db.query<{cmd:string}>("select cmd from pg_policies where schemaname='public' and tablename=$1",[table])).rows.map(r=>r.cmd).sort()).toEqual(['DELETE','INSERT','SELECT','UPDATE']);
 }
 await as(db,who(owner.id),async q=>{
  const [i]=await q<{id:string}>("insert into public.experience_items(title) values ('New role') returning id");
  const [b]=await q<{id:string}>('insert into public.experience_bullets(item_id,text) values ($1,$2) returning id',[i.id,'New bullet']);
  expect(await q("update public.experience_items set title='Edited' where id=$1 returning id",[i.id])).toHaveLength(1);
  expect(await q("update public.experience_bullets set text='Edited' where id=$1 returning id",[b.id])).toHaveLength(1);
  expect(await q('delete from public.experience_bullets where id=$1 returning id',[b.id])).toHaveLength(1);
  expect(await q('delete from public.experience_items where id=$1 returning id',[i.id])).toHaveLength(1);
 });
 await expect(as(db,who(member.id),q=>q('insert into public.experience_bullets(item_id,text) values ($1,$2)',[item,'Fake']))).rejects.toThrow(/row-level security/);
});

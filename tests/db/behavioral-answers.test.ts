import { beforeAll,afterAll,it,expect } from 'vitest';
import type { PGlite } from '@electric-sql/pglite';
import { freshDb,as,addUser } from './harness';
let db:PGlite;
const owner={id:'00000000-0000-4000-8000-0000000000a1',email:'owner@example.com'},member={id:'00000000-0000-4000-8000-0000000000a2',email:'member@example.com'},invited={id:'00000000-0000-4000-8000-0000000000a3',email:'invited@example.com'};
const s1='00000000-0000-4000-8000-0000000000b1',s2='00000000-0000-4000-8000-0000000000b2';
const who=(id:string)=>({role:'authenticated' as const,sub:id});
beforeAll(async()=>{db=await freshDb();await db.query("insert into private.settings(key,value) values ('owner_email',$1)",[owner.email]);for(const u of [owner,member,invited])await addUser(db,u);await db.query('insert into public.invites(email) values ($1)',[invited.email]);await db.query("insert into public.behavioral_stories(id,title) values ($1,'First story'),($2,'Second story')",[s1,s2]);await db.query("insert into public.behavioral_answers(question_id,primary_story_id,outline,followups) values ('g-disagree',$1,'Outline','Follow-up')",[s1]);});
afterAll(async()=>{await db.close();});
it('only owner and invitees read preparation under default invite-only access',async()=>{
 for(const role of [{role:'anon' as const},who(member.id)])expect(await as(db,role,q=>q('select question_id from public.behavioral_answers'))).toEqual([]);
 for(const u of [owner,invited])expect(await as(db,who(u.id),q=>q('select outline,followups from public.behavioral_answers'))).toEqual([{outline:'Outline',followups:'Follow-up'}]);
});
it('read policy respects all visibility settings and invitation revocation',async()=>{
 for(const [visibility,a,m,g] of [['public',1,1,1],['signed_in',0,1,1],['invite_only',0,0,1],['owner_only',0,0,0]] as const){await db.query("update public.apps set visibility=$1 where id='behavioral'",[visibility]);for(const [role,n] of [[{role:'anon' as const},a],[who(member.id),m],[who(invited.id),g],[who(owner.id),1]] as const)expect((await as(db,role,q=>q('select question_id from public.behavioral_answers'))).length).toBe(n);}
 await db.query("update public.apps set visibility='invite_only' where id='behavioral'");await db.query('delete from public.invites where email=$1',[invited.email]);expect(await as(db,who(invited.id),q=>q('select question_id from public.behavioral_answers'))).toEqual([]);await db.query('insert into public.invites(email) values ($1)',[invited.email]);
});
it('nonowners cannot insert/update/delete; invitees remain read-only',async()=>{
 for(const u of [member,invited]){
  await expect(as(db,who(u.id),q=>q("insert into public.behavioral_answers(question_id) values ('g-proud')"))).rejects.toThrow(/row-level security/);
  expect(await as(db,who(u.id),q=>q("update public.behavioral_answers set outline='Changed' returning question_id"))).toEqual([]);
  expect(await as(db,who(u.id),q=>q('delete from public.behavioral_answers returning question_id'))).toEqual([]);
 }
 await expect(as(db,{role:'anon'},q=>q("insert into public.behavioral_answers(question_id) values ('g-proud')"))).rejects.toThrow(/permission denied/);
});
it('owner upserts mappings/outlines/followups and can clear/delete them',async()=>{
 await as(db,who(owner.id),async q=>{
  for(let i=0;i<2;i++)await q("insert into public.behavioral_answers(question_id,primary_story_id,secondary_story_id,outline,followups) values ('g-proud',$1,$2,'Saved outline','Saved followup') on conflict (question_id) do update set outline=excluded.outline",[s1,s2]);
  expect(await q("select count(*)::int n from public.behavioral_answers where question_id='g-proud'")).toEqual([{n:1}]);
  expect(await q("update public.behavioral_answers set primary_story_id=null,secondary_story_id=null where question_id='g-proud' returning primary_story_id,secondary_story_id")).toEqual([{primary_story_id:null,secondary_story_id:null}]);
  expect(await q("delete from public.behavioral_answers where question_id='g-proud' returning question_id")).toHaveLength(1);
 });
});
it('foreign keys and duplicate-story constraint reject invalid mappings',async()=>{
 await expect(as(db,who(owner.id),q=>q("update public.behavioral_answers set secondary_story_id=$1",[s1]))).rejects.toThrow(/check constraint/);
 await expect(as(db,who(owner.id),q=>q("update public.behavioral_answers set secondary_story_id='00000000-0000-4000-8000-000000000099'"))).rejects.toThrow(/foreign key/);
});
it('deleting a story clears its mapping without losing answer text',async()=>{
 await as(db,who(owner.id),async q=>{await q('delete from public.behavioral_stories where id=$1',[s1]);expect(await q('select primary_story_id,outline from public.behavioral_answers')).toEqual([{primary_story_id:null,outline:'Outline'}]);});
});

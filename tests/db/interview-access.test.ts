import {beforeAll,afterAll,it,expect} from 'vitest';
import type {PGlite} from '@electric-sql/pglite';
import {readFileSync} from 'node:fs';
import {PASSLOOP_TABLES} from '../support/passloop-tables';
import {freshDb,as,addUser} from './harness';
let db:PGlite;
const owner={id:'00000000-0000-4000-8000-000000000d01',email:'owner@example.com'};
const reader={id:'00000000-0000-4000-8000-000000000d02',email:'reader@example.com'};
const signed=(sub:string)=>({role:'authenticated' as const,sub});
let before:unknown[];
beforeAll(async()=>{
 db=await freshDb({beforeMigration:async(db,file)=>{
  if(!file.endsWith('_interview_public_access.sql'))return;
  await db.query("insert into private.settings(key,value) values('owner_email',$1)",[owner.email]);
  for(const u of [owner,reader])await addUser(db,u);
  await db.exec("insert into public.notes(id,title,body) values('synthetic-note','Synthetic','Synthetic private note'); insert into public.behavioral_stories(title) values('Synthetic private story'); insert into public.behavioral_answers(question_id,outline) values('g-intro','Synthetic private outline'); insert into public.experience_items(title) values('Synthetic hidden role')");
  before=(await db.query("select jsonb_build_object('notes',(select jsonb_agg(n) from public.notes n),'stories',(select jsonb_agg(s) from public.behavioral_stories s),'answers',(select jsonb_agg(a) from public.behavioral_answers a),'cv',(select jsonb_agg(to_jsonb(i)-array['show_on_journey','journey_icon','journey_photo']) from public.experience_items i)) snapshot")).rows;
 }});
 // The Q4 migration seeds three empty SQL notes; these tests compare only the synthetic fixtures above.
 await db.exec("delete from public.notes where id like 'sql-%'");
});
afterAll(async()=>{await db.close();});
it('opens exactly the three registry entries; no content is changed or removed',async()=>{
 expect((await db.query("select id,visibility from public.apps where id in ('notes','practice','behavioral') order by id")).rows).toEqual(['behavioral','notes','practice'].map(id=>({id,visibility:'public'})));
 expect((await db.query("select jsonb_build_object('notes',(select jsonb_agg(n) from public.notes n),'stories',(select jsonb_agg(s) from public.behavioral_stories s),'answers',(select jsonb_agg(a) from public.behavioral_answers a),'cv',(select jsonb_agg(to_jsonb(i)-array['show_on_journey','journey_icon','journey_photo']) from public.experience_items i)) snapshot")).rows).toEqual(before);
});
it('an uninvited account reads Notes; anon reads none even through the Data API',async()=>{
 expect(await as(db,{role:'anon'},q=>q('select body from public.notes'))).toEqual([]);
 expect(await as(db,signed(reader.id),q=>q('select body from public.notes'))).toEqual([{body:'Synthetic private note'}]);
 expect(await as(db,signed(reader.id),q=>q("select id from public.desktop_apps where id in ('notes','practice','behavioral') order by id"))).toHaveLength(3);
});
it('public Behavioral access never exposes hidden owner CV, stories or outlines',async()=>{
 for(const table of ['experience_items','behavioral_stories','behavioral_answers']){
  for(const who of [{role:'anon' as const},signed(reader.id)])expect(await as(db,who,q=>q(`select * from public.${table}`))).toEqual([]);
  expect(await as(db,signed(owner.id),q=>q(`select * from public.${table}`))).toHaveLength(1);
 }
});
it('public questions, Resume template and Behavioral guides stay readable anonymously',async()=>{
 expect(await as(db,{role:'anon'},q=>q('select key from public.resume_templates'))).toHaveLength(1);
 expect(await as(db,{role:'anon'},q=>q('select id from public.interview_behavioral_themes'))).toHaveLength(9);
 expect(await as(db,{role:'anon'},q=>q('select id from public.interview_behavioral_questions'))).toHaveLength(18);
});
it('every public table is exported by exactly one site: this manifest or PassLoop-owned',async()=>{
 const actual=(await db.query<{tablename:string}>("select tablename from pg_tables where schemaname='public' order by tablename")).rows.map(t=>t.tablename);
 const manifest:string[]=JSON.parse(readFileSync('scripts/export-tables.json','utf8'));expect(manifest.filter(t=>(PASSLOOP_TABLES as readonly string[]).includes(t))).toEqual([]);expect([...manifest,...PASSLOOP_TABLES].sort()).toEqual(actual);
});

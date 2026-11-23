import {beforeAll,afterAll,it,expect} from 'vitest';
import type {PGlite} from '@electric-sql/pglite';
import {freshDb,as,addUser} from './harness';
const ownerUser={id:'00000000-0000-4000-8000-000000000a10',email:'sd-owner@example.test'},member={id:'00000000-0000-4000-8000-000000000a11',email:'sd-member@example.test'},other={id:'00000000-0000-4000-8000-000000000a12',email:'sd-other@example.test'};
const owner={role:'authenticated' as const,sub:ownerUser.id},memberWho={role:'authenticated' as const,sub:member.id},otherWho={role:'authenticated' as const,sub:other.id};
const pub='00000000-0000-4000-8000-000000000a01',hidden='00000000-0000-4000-8000-000000000a02';
const item={q:'Which layer scales reads?',options:['A cache','A cron job','A linter','A font'],answer:0,explanation:'Caches absorb repeated reads.'};
let db:PGlite;
const op=(fields:unknown,action='update',key=pub)=>({table:'system_design_questions',op:action,key,fields});
beforeAll(async()=>{
 db=await freshDb();await db.query("insert into private.settings(key,value) values ('owner_email',$1)",[ownerUser.email]);
 for(const u of [ownerUser,member,other])await addUser(db,u);
 await db.query("insert into public.system_design_questions(id,slug,title,solution,quiz,public) values ($1,'fixture-question','Fixture Question','## Overview\nBody',$2,true),($3,'hidden-question','Hidden Question','',$4,false)",[pub,JSON.stringify([item]),hidden,'[]']);
});
afterAll(async()=>{await db?.close();});
async function approve(ops:unknown[],check?:(q:<R=Record<string,unknown>>(sql:string,params?:unknown[])=>Promise<R[]>)=>Promise<void>){return as(db,owner,async q=>{const [set]=await q<{id:string}>("insert into public.content_changes(summary,operations) values ('Synthetic system design draft',$1) returning id",[JSON.stringify(ops)]);await q("update public.content_changes set status='approved' where id=$1",[set.id]);await check?.(q);return (await q<{previous:{values:Record<string,unknown>|null}[]}>('select previous from public.content_changes where id=$1',[set.id]))[0];});}

it('visitors and members read only public questions and cannot write',async()=>{
 for(const who of [{role:'anon' as const},memberWho]){
  await as(db,who,async q=>{expect(await q('select slug from public.system_design_questions')).toEqual([{slug:'fixture-question'}]);});
  await expect(as(db,who,q=>q("insert into public.system_design_questions(slug,title) values ('blocked','Blocked')"))).rejects.toThrow();
 }
 expect(await as(db,memberWho,q=>q('update public.system_design_questions set title=title returning id'))).toEqual([]);
 expect(await as(db,memberWho,q=>q('delete from public.system_design_questions returning id'))).toEqual([]);
});
it('owner reads hidden rows and writes directly',async()=>{await as(db,owner,async q=>{expect(await q('select id from public.system_design_questions')).toHaveLength(2);expect(await q('update public.system_design_questions set sort=sort returning id')).toHaveLength(2);});});
it('table checks reject reserved slugs and malformed quiz or steps',async()=>{
 const cases:[string,string][]=[['slug','practice'],['slug','notes'],['slug','Bad Slug'],['note_ref','not-a-note'],['quiz',JSON.stringify([{...item,options:['a','b','c']}])],['quiz',JSON.stringify([{...item,answer:4}])],['quiz',JSON.stringify([{...item,extra:1}])],['quiz',JSON.stringify([{...item,q:'  '}])],['quiz','{}'],['steps',JSON.stringify([{id:'Bad Id',title:'x'}])],['steps',JSON.stringify([{id:'ok'}])]];
 for(const [col,val] of cases){
  const json=col==='quiz'||col==='steps';
  const sql=col==='slug'?"insert into public.system_design_questions(slug,title) values ($1,'Check')":`insert into public.system_design_questions(slug,title,${col}) values ('check-'||floor(random()*1e9)::text,'Check',$1${json?'::jsonb':''})`;
  await expect(db.query(sql,[val])).rejects.toThrow();
 }
 await expect(db.query("insert into public.system_design_questions(slug,title,quiz) values ('too-many','T',$1)",[JSON.stringify(Array(41).fill(item))])).rejects.toThrow();
});
it('approval inserts, updates and audits; delete only unpublishes; touch trigger runs',async()=>{
 const added='00000000-0000-4000-8000-000000000a03';
 const result=await approve([op({slug:'new-question',title:'New Question',solution:'## Overview\nx',quiz:[item],steps:[{id:'requirements',title:'Requirements',minutes:2}],public:true},'insert',added),op({title:'Renamed',sort:5},'update',added),op({},'delete',added)],async q=>{
  expect(await q('select slug,title,sort,public,steps from public.system_design_questions where id=$1',[added])).toMatchObject([{slug:'new-question',title:'Renamed',sort:5,public:false,steps:[{id:'requirements',title:'Requirements',minutes:2}]}]);
 });
 expect(result.previous.map(p=>p.values)).toMatchObject([null,{title:'New Question',public:true},{title:'Renamed',public:true}]);
});
for(const [fields,action,key] of [[{unknown:'x'},'update',pub],[{public:'true'},'update',pub],[{sort:1.5},'update',pub],[{quiz:{}},'update',pub],[{slug:'practice'},'update',pub],[{title:'x'.repeat(201)},'update',pub],[{quiz:[{...item,answer:9}]},'update',pub],[{slug:'only-slug'},'insert','00000000-0000-4000-8000-000000000a04'],[{},'update',pub],[{title:'x'},'delete',pub],[{title:'x'},'insert',pub]] as [Record<string,unknown>,string,string][])
 it(`rejects and rolls back an invalid draft ${JSON.stringify(fields).slice(0,50)} (${action})`,async()=>{
  await expect(approve([op({title:'Must roll back'}),op(fields,action,key)])).rejects.toThrow();
  expect((await db.query('select title from public.system_design_questions where id=$1',[pub])).rows).toEqual([{title:'Fixture Question'}]);
 });
it('a non-owner cannot approve, and the draft helper is hardened and not callable by API roles',async()=>{
 await expect(as(db,memberWho,async q=>{const [set]=await q<{id:string}>("insert into public.content_changes(summary,operations) values ('x',$1) returning id",[JSON.stringify([op({title:'x'})])]);await q("update public.content_changes set status='approved' where id=$1",[set.id]);})).rejects.toThrow();
 const [fn]=(await db.query<{prosecdef:boolean;proconfig:string[];callable:boolean}>("select prosecdef,proconfig,has_function_privilege('anon',oid,'execute') or has_function_privilege('authenticated',oid,'execute') callable from pg_proc where oid='private.apply_system_design_draft(jsonb)'::regprocedure")).rows;
 expect(fn.prosecdef).toBe(true);expect(fn.proconfig).toContain('search_path=""');expect(fn.callable).toBe(false);
});
it('quiz attempts and progress are own-rows only; visitors have no access; others cannot read or forge them',async()=>{
 await as(db,memberWho,async q=>{await q("insert into public.system_design_quiz_attempts(question_id,score,total,answers) values ($1,1,1,'[0]')",[pub]);await q("insert into public.system_design_progress(question_id,flagged,done) values ($1,true,false)",[pub]);expect(await q('select score from public.system_design_quiz_attempts')).toEqual([{score:1}]);expect(await q('select flagged from public.system_design_progress')).toEqual([{flagged:true}]);expect(await q('update public.system_design_progress set done=true returning done')).toEqual([{done:true}]);});
 await db.query("insert into public.system_design_quiz_attempts(user_id,question_id,score,total) values ($1,$2,1,1)",[member.id,pub]);await db.query("insert into public.system_design_progress(user_id,question_id,flagged) values ($1,$2,true)",[member.id,pub]);
 for(const who of [otherWho,owner]){await as(db,who,async q=>{expect(await q('select * from public.system_design_quiz_attempts')).toEqual([]);expect(await q('select * from public.system_design_progress')).toEqual([]);expect(await q('delete from public.system_design_quiz_attempts returning id')).toEqual([]);expect(await q('update public.system_design_progress set done=true returning question_id')).toEqual([]);expect(await q('delete from public.system_design_progress returning question_id')).toEqual([]);});}
 await expect(as(db,{role:'anon'},q=>q('select * from public.system_design_quiz_attempts'))).rejects.toThrow();
 await expect(as(db,{role:'anon'},q=>q('select * from public.system_design_progress'))).rejects.toThrow();
 await expect(as(db,otherWho,q=>q("insert into public.system_design_quiz_attempts(user_id,question_id,score,total) values ($1,$2,1,1)",[member.id,pub]))).rejects.toThrow();
 await expect(as(db,otherWho,q=>q("insert into public.system_design_progress(user_id,question_id) values ($1,$2)",[member.id,pub]))).rejects.toThrow();
 await as(db,memberWho,async q=>{expect(await q('delete from public.system_design_quiz_attempts returning id')).toHaveLength(1);});
});
it('attempts validate scores, forbid updates and hidden questions, and cascade with the account',async()=>{
 await expect(as(db,otherWho,q=>q("insert into public.system_design_quiz_attempts(question_id,score,total) values ($1,2,1)",[pub]))).rejects.toThrow();
 await expect(as(db,otherWho,q=>q("insert into public.system_design_quiz_attempts(question_id,score,total) values ($1,0,41)",[pub]))).rejects.toThrow();
 await expect(as(db,otherWho,q=>q("insert into public.system_design_quiz_attempts(question_id,score,total) values ($1,0,1)",[hidden]))).rejects.toThrow();
 await expect(as(db,otherWho,q=>q("insert into public.system_design_progress(question_id) values ($1)",[hidden]))).rejects.toThrow();
 await expect(as(db,memberWho,q=>q("update public.system_design_quiz_attempts set score=0"))).rejects.toThrow();
 await db.query("insert into public.system_design_quiz_attempts(user_id,question_id,score,total) values ($1,$2,1,1)",[member.id,pub]);
 await db.query("delete from auth.users where id=$1",[member.id]);
 expect((await db.query('select * from public.system_design_quiz_attempts')).rows).toEqual([]);expect((await db.query('select * from public.system_design_progress')).rows).toEqual([]);
});

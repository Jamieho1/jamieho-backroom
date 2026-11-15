import {beforeAll,afterAll,it,expect} from 'vitest';
import type {PGlite} from '@electric-sql/pglite';
import {freshDb,as,addUser} from './harness';
import {PROBLEMS} from '@/lib/practice/catalog';
import {QUESTIONS} from '@/lib/behavioral/questions';
const user={id:'00000000-0000-4000-8000-000000000901',email:'app-owner@example.test'},member={id:'00000000-0000-4000-8000-000000000902',email:'app-member@example.test'};
const owner={role:'authenticated' as const,sub:user.id};const story='00000000-0000-4000-8000-000000000903',added='00000000-0000-4000-8000-000000000904';
const op=(table='notes',action='update',fields:unknown={body:'Draft note'},key:string|number='fixture-note')=>({table,op:action,fields,key});
let db:PGlite;
beforeAll(async()=>{db=await freshDb();await db.query("insert into private.settings(key,value) values ('owner_email',$1)",[user.email]);await addUser(db,user);await addUser(db,member);await db.query("insert into public.invites(email) values ($1)",[member.email]);await db.exec("insert into public.notes(id,title,body,free,visual,sort) values ('fixture-note','Live title','Live body','Live free','[]',4); insert into public.question_notes(problem,body) values (217,'Live question'); insert into public.practice_code(user_id,problem,code) values ('00000000-0000-4000-8000-000000000901',217,'Live code'); insert into public.practice_stars(user_id,problem) values('00000000-0000-4000-8000-000000000901',217)");await db.query("insert into public.behavioral_stories(id,title) values ($1,'Live story')",[story]);await db.query("insert into public.behavioral_answers(question_id,primary_story_id,outline) values ('g-intro',$1,'Live outline')",[story]);},30000);
afterAll(async()=>{await db?.close();});
type Query=<R=Record<string,unknown>>(sql:string,params?:unknown[])=>Promise<R[]>;
async function seed(q:Query,operations:unknown[]){return (await q<{id:string}>("insert into public.content_changes(summary,operations) values ('Synthetic app proposal',$1) returning id",[JSON.stringify(operations)]))[0].id;}
const approve=(q:Query,id:string)=>q<{previous:{table:string;key:string|number;values:Record<string,unknown>|null}[];status:string}>("update public.content_changes set status='approved' where id=$1 returning *",[id]);
it('atomically updates all six tables, retains full previous values and preserves note metadata',async()=>{
 await as(db,owner,async q=>{
  const id=await seed(q,[op(),op('question_notes','update',{body:'Draft question'},217),op('practice_code','update',{code:'Draft code'},217),op('practice_stars','delete',{},217),op('behavioral_stories','update',{title:' Draft story ',situation:'Situation',task:'Task',action:'Action',result:'Result',skills:'Skills',numbers:'1',bullet_id:null},story),op('behavioral_answers','update',{outline:'Draft outline',followups:'Followups',secondary_story_id:null},'g-intro')]);
  const [set]=await approve(q,id);expect(set.status).toBe('approved');expect(set.previous).toHaveLength(6);expect(set.previous[3].values).toMatchObject({problem:217,created_at:expect.anything()});
  expect(await q('select title,body,free,visual,sort from public.notes where id=$1',['fixture-note'])).toEqual([{title:'Live title',body:'Draft note',free:'Live free',visual:[],sort:4}]);
  expect(await q('select body from public.question_notes where problem=217')).toEqual([{body:'Draft question'}]);expect(await q('select code from public.practice_code where problem=217')).toEqual([{code:'Draft code'}]);expect(await q('select * from public.practice_stars where problem=217')).toEqual([]);
  expect(await q('select title,action from public.behavioral_stories where id=$1',[story])).toEqual([{title:'Draft story',action:'Action'}]);expect(await q("select outline,followups from public.behavioral_answers where question_id='g-intro'")).toEqual([{outline:'Draft outline',followups:'Followups'}]);
 });
});
it('inserts practice data, stars, story and answer in dependency order with editor defaults',async()=>{
 await as(db,owner,async q=>{
  const [set]=await approve(q,await seed(q,[op('question_notes','insert',{body:'New question'},1),op('practice_code','insert',{code:'New code'},1),op('practice_stars','insert',{},1),op('behavioral_stories','insert',{title:'New story'},added),op('behavioral_answers','insert',{primary_story_id:added,outline:'New answer'},'g-proud')]));expect(set.previous.every(p=>p.values===null)).toBe(true);
  expect(await q('select bullet_id,title,situation,action from public.behavioral_stories where id=$1',[added])).toEqual([{bullet_id:null,title:'New story',situation:'',action:''}]);
  expect(await q("select primary_story_id,secondary_story_id,outline,followups from public.behavioral_answers where question_id='g-proud'")).toEqual([{primary_story_id:added,secondary_story_id:null,outline:'New answer',followups:''}]);
 });
});
const invalid:unknown[]=[op('notes','insert'),op('notes','delete',{}),op('notes','update',{title:'X'}),op('notes','update',{owner_id:user.id}),op('notes','update',{}),op('notes','update',{body:null}),op('notes','update',{body:'X'},'INVALID'),op('notes','update',{body:'X'},'absent-note'),op('question_notes','insert',{body:'X'},217),op('question_notes','update',{body:'X'},1),op('question_notes','insert',{},1),op('question_notes','insert',{body:'X'},9999),op('question_notes','insert',{body:'X'},'1'),op('question_notes','insert',{body:'X'},1.5),op('practice_code','insert',{},1),op('practice_code','delete',{},217),op('practice_stars','update',{},217),op('practice_stars','insert',{starred:true},1),op('practice_stars','delete',{},1),op('behavioral_stories','insert',{situation:'X'},added),op('behavioral_stories','update',{title:'  '},story),op('behavioral_stories','delete',{},story),op('behavioral_stories','update',{bullet_id:added},story),op('behavioral_answers','update',{secondary_story_id:story},'g-intro'),op('behavioral_answers','insert',{primary_story_id:added},'g-proud'),op('behavioral_answers','update',{outline:'X'},'unknown'),op('behavioral_answers','delete',{},'g-intro'),op('behavioral_answers','update',{owner_id:user.id},'g-intro'),op('problems'),op('practice_attempts')];
for(const [table,field,max,key] of [['notes','body',200000,'fixture-note'],['notes','free',200000,'fixture-note'],['question_notes','body',200000,217],['practice_code','code',100000,217],['behavioral_stories','title',160,story],['behavioral_stories','situation',20000,story],['behavioral_stories','task',20000,story],['behavioral_stories','action',20000,story],['behavioral_stories','result',20000,story],['behavioral_stories','skills',1000,story],['behavioral_stories','numbers',2000,story],['behavioral_answers','outline',20000,'g-intro'],['behavioral_answers','followups',10000,'g-intro']] as const)for(const action of table==='notes'?['update']:['insert','update'])invalid.push(op(table,action,{...(table==='behavioral_stories'?{title:'X'}:{}),[field]:'x'.repeat(max+1)},action==='insert'?(table==='behavioral_stories'?added:table==='behavioral_answers'?'g-proud':1):key));
for(const [i,operation] of invalid.entries())it(`invalid app proposal ${i+1} rolls back earlier content, status and audit`,async()=>{
 await as(db,owner,async q=>{const before=await q('select * from public.notes where id=$1',['fixture-note']);const id=await seed(q,[op('notes','update',{body:'Must roll back'}),operation]);await q('savepoint approval');await expect(approve(q,id)).rejects.toThrow();await q('rollback to savepoint approval');expect(await q('select * from public.notes where id=$1',['fixture-note'])).toEqual(before);expect(await q('select status,previous,approved_at from public.content_changes where id=$1',[id])).toEqual([{status:'draft',previous:null,approved_at:null}]);});
});
it('SQL catalogue keys match code and behavioral question identifiers',async()=>{
 const result=await db.query<{id:number}>('select i as id from generate_series(1,10000) i where private.valid_draft_problem(i)');expect(result.rows.map(r=>r.id)).toEqual(PROBLEMS.map(p=>p.lc).sort((a,b)=>a-b));
 await as(db,owner,async q=>{for(const question of QUESTIONS){const id=await seed(q,[op('behavioral_answers',question.id==='g-intro'?'update':'insert',{outline:'Synthetic answer'},question.id)]);await approve(q,id);}});
});
it('Unicode limits follow the relevant editors',async()=>{
 await as(db,owner,async q=>{await approve(q,await seed(q,[op('practice_code','update',{code:'😀'.repeat(50000)},217),op('behavioral_stories','update',{title:'😀'.repeat(160)},story)]));expect(await q('select char_length(code) as length from public.practice_code where problem=217')).toEqual([{length:50000}]);});
 await expect(as(db,owner,async q=>approve(q,await seed(q,[op('practice_code','update',{code:'😀'.repeat(50001)},217)])))).rejects.toThrow(/limit/);
});
it('discard changes no app rows; members with app access and visitors cannot read or approve proposals',async()=>{
 const id=(await db.query<{id:string}>("insert into public.content_changes(summary,operations) values ('Synthetic private proposal',$1) returning id",[JSON.stringify([op()])])).rows[0].id;
 for(const who of [{role:'anon' as const},{role:'authenticated' as const,sub:member.id}]){
  if(who.role==='anon')await expect(as(db,who,q=>q('select * from public.content_changes'))).rejects.toThrow(/permission denied/);
  else {expect(await as(db,who,q=>q('select * from public.content_changes'))).toEqual([]);expect(await as(db,who,q=>approve(q,id))).toEqual([]);}
 }
 await expect(db.query("update public.content_changes set status='approved' where id=$1",[id])).rejects.toThrow(/Only the owner/);
 await as(db,owner,async q=>{await q("update public.content_changes set status='discarded' where id=$1",[id]);expect(await q("select body from public.notes where id='fixture-note'")).toEqual([{body:'Live body'}]);});
});
it('private helpers retain empty search_path and revoked API execution',async()=>{
 for(const name of ['private.apply_app_draft(jsonb)','private.valid_draft_problem(integer)']){const r=await db.query<{proconfig:string[];allowed:boolean}>("select proconfig,has_function_privilege('authenticated',oid,'EXECUTE') or has_function_privilege('anon',oid,'EXECUTE') or has_function_privilege('service_role',oid,'EXECUTE') as allowed from pg_proc where oid=$1::regprocedure",[name]);expect(r.rows[0]).toEqual({proconfig:['search_path=""'],allowed:false});}
});

it('practice drafts are hard-scoped to the approving owner even with colliding member keys',async()=>{
 await db.query("insert into public.practice_code(user_id,problem,code) values ($1,217,'Member private code'),($1,1,'Member other code')",[member.id]);
 await db.query('insert into public.practice_stars(user_id,problem) values ($1,217)',[member.id]);
 try{
  await as(db,owner,async q=>{
   const [set]=await approve(q,await seed(q,[op('practice_code','update',{code:'Owner draft'},217),op('practice_code','insert',{code:'Owner new'},1),op('practice_stars','delete',{},217)]));
   expect(set.previous[0].values?.user_id).toBe(user.id);expect(set.previous[2].values?.user_id).toBe(user.id);
   expect(await q('select user_id,code from public.practice_code where problem=217')).toEqual([{user_id:user.id,code:'Owner draft'}]);
  });
  expect((await db.query('select code from public.practice_code where user_id=$1 order by problem',[member.id])).rows).toEqual([{code:'Member other code'},{code:'Member private code'}]);
  expect((await db.query('select problem from public.practice_stars where user_id=$1',[member.id])).rows).toEqual([{problem:217}]);
  for(const operation of [op('practice_code','update',{user_id:member.id,code:'No'},217),{...op('practice_stars','insert',{},1),user_id:member.id}])await expect(as(db,owner,async q=>approve(q,await seed(q,[operation])))).rejects.toThrow(/Unknown/);
 }finally{await db.query('delete from public.practice_code where user_id=$1',[member.id]);await db.query('delete from public.practice_stars where user_id=$1',[member.id]);}
});

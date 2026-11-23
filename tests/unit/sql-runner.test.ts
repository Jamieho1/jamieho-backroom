import {it,expect} from 'vitest';
import {SqlRunner,type WorkerPort} from '@/lib/practice/sql-runner';
import {sqlProblemByNumber} from '@/lib/practice/sql-catalog';
import type {SqlExecution} from '@/lib/practice/sql-engine';
const problem=sqlProblemByNumber(1757)!;
const ok=(rows:(number)[][]):SqlExecution=>({ok:true,columns:['item_id'],rows});
/** A scripted stand-in for the PGlite worker: answers each 'run' message through `answer`, or never when it returns undefined. */
function fake(answer:(m:{setup:string;query:string;id:number},n:number)=>SqlExecution|undefined,opts:{ready?:'ready'|'crash'|'silent'}={}){
 const ports:{terminated:boolean;runs:number}[]=[];
 const factory=():WorkerPort=>{
  const state={terminated:false,runs:0};ports.push(state);let emit:(d:any)=>void=()=>{};let fail:()=>void=()=>{};
  return {post(m:any){if(state.terminated)return;if(m.type!=='run')return;state.runs++;const r=answer(m,state.runs);if(r)queueMicrotask(()=>emit({type:'result',id:m.id,execution:r}));},
   listen(onMessage,onFailure){emit=onMessage;fail=onFailure;if(opts.ready==='crash')queueMicrotask(()=>emit({type:'crash',error:'No wasm today'}));else if(opts.ready!=='silent')queueMicrotask(()=>emit({type:'ready'}));void fail;},
   terminate(){state.terminated=true;}};
 };
 return {factory,ports};
}
it('Run checks the first test, Submit all of them; wrong then right is reported per case with a diff',async()=>{
 const wrong=fake(()=>ok([[1],[4],[5]]));const runner=new SqlRunner(wrong.factory,{testMs:200,loadMs:1000});
 const run=await runner.run(problem,'SELECT item_id FROM catalogue_items','run');
 expect(run.outcome).toMatchObject({status:'ok',passed:0,total:1});expect(wrong.ports[0].runs).toBe(1);
 expect(run.details[0].comparison?.pass).toBe(false);expect(run.details[0].comparison?.actual.rows.map(r=>r.ok)).toEqual([true,true,false]);
 const submit=await runner.run(problem,'SELECT item_id FROM catalogue_items','submit');
 expect(submit.outcome).toMatchObject({status:'ok',total:problem.tests.length});expect(wrong.ports[0].runs).toBe(1+problem.tests.length);
 const right=fake((m,n)=>ok(problem.tests[n-1].expected.rows as unknown as number[][]));const second=new SqlRunner(right.factory,{testMs:200,loadMs:1000});
 const accepted=await second.run(problem,'SELECT item_id FROM catalogue_items','submit');
 expect(accepted.outcome).toMatchObject({status:'ok',passed:problem.tests.length,total:problem.tests.length});expect(accepted.details.every(d=>d.comparison?.pass)).toBe(true);
 expect(right.ports).toHaveLength(1);
});
it('maps Postgres errors and rejected statements to per-case errors, verbatim',async()=>{
 const f=fake(()=>({ok:false,kind:'error',message:'column "nope" does not exist',code:'42703',position:'8'}));const runner=new SqlRunner(f.factory,{testMs:200,loadMs:1000});
 const r=await runner.run(problem,'SELECT nope FROM catalogue_items','run');
 expect(r.outcome).toMatchObject({status:'ok',passed:0,results:[{status:'error',error:'column "nope" does not exist'}]});
 expect(r.details[0].failure).toEqual({kind:'error',message:'column "nope" does not exist',code:'42703',position:'8'});
});
it('stops a query that exceeds the time limit by terminating the worker, then starts a fresh one',async()=>{
 let calls=0;const f=fake(()=>++calls===1?undefined:ok([[1],[4]]));const runner=new SqlRunner(f.factory,{testMs:40,loadMs:1000});
 const slow=await runner.run(problem,'SELECT item_id FROM catalogue_items','submit');
 expect(slow.outcome).toMatchObject({status:'timeout',afterMs:40});expect(slow.details[0].failure?.kind).toBe('timeout');
 expect(f.ports[0].terminated).toBe(true);
 await runner.warmUp();expect(f.ports).toHaveLength(2);
 const again=await runner.run(problem,'SELECT item_id FROM catalogue_items','run');expect(again.outcome).toMatchObject({status:'ok',passed:1});
});
it('reports a worker that cannot load, and lets a later call retry',async()=>{
 const crashing=fake(()=>undefined,{ready:'crash'});const runner=new SqlRunner(crashing.factory,{testMs:40,loadMs:1000});
 await expect(runner.warmUp()).rejects.toThrow('No wasm today');
 const r=await runner.run(problem,'SELECT 1','run');expect(r.outcome).toMatchObject({status:'crash',error:'No wasm today'});expect(crashing.ports.length).toBeGreaterThanOrEqual(2);
 const silent=fake(()=>undefined,{ready:'silent'});const slowLoad=new SqlRunner(silent.factory,{testMs:40,loadMs:30});
 await expect(slowLoad.warmUp()).rejects.toThrow(/too long to load/);expect(silent.ports[0].terminated).toBe(true);
});
it('refuses a second run while one is in flight and cleans up on dispose',async()=>{
 const f=fake(()=>undefined);const runner=new SqlRunner(f.factory,{testMs:500,loadMs:1000});
 const first=runner.run(problem,'SELECT 1','run');await new Promise(r=>setTimeout(r,5));
 expect((await runner.run(problem,'SELECT 1','run')).outcome).toMatchObject({status:'crash',error:'A run is already in progress.'});
 runner.dispose();expect((await first).outcome).toMatchObject({status:'crash',error:'Run stopped.'});expect(f.ports[0].terminated).toBe(true);
});

// The same runner, driven by a real PGlite instead of a script: wrong then right, for every seeded question.
import {PGlite} from '@electric-sql/pglite';
import {runSqlTest,type SqlDbLike} from '@/lib/practice/sql-engine';
import {SQL_PROBLEMS} from '@/lib/practice/sql-catalog';
import {submissionInput} from '@/lib/practice/submissions';
import {completedProblems} from '@/lib/practice/progress';
function pglitePort(db:PGlite):WorkerPort{
 let emit:(d:any)=>void=()=>{};
 return {post(m:any){if(m.type==='run')void runSqlTest(db as unknown as SqlDbLike,{setup:m.setup,query:m.query,rowCap:m.rowCap}).then(execution=>emit({type:'result',id:m.id,execution}));},
  listen(onMessage){emit=onMessage;queueMicrotask(()=>emit({type:'ready'}));},terminate(){}};
}
it.each(SQL_PROBLEMS.map(p=>[p.lc,p] as const))('SQL %i end to end through the runner: a wrong query fails and the solution is accepted and counted complete',async(_lc,p)=>{
 const db=new PGlite();await db.waitReady;
 try{
  const runner=new SqlRunner(()=>pglitePort(db),{testMs:5000,loadMs:5000});
  const wrong=await runner.run(p,`SELECT 1 AS nope`,'submit');
  expect(wrong.outcome).toMatchObject({status:'ok',passed:0,total:p.tests.length});expect(wrong.details.every(d=>d.comparison?.pass===false)).toBe(true);
  expect(submissionInput(p.lc,'SELECT 1',{time_complexity:'',space_complexity:''},wrong.outcome)).toMatchObject({language:'SQL',status:'wrong answer',passed:0});
  const right=await runner.run(p,p.solution,'submit');
  expect(right.outcome).toMatchObject({status:'ok',passed:p.tests.length,total:p.tests.length});
  expect(submissionInput(p.lc,p.solution,{time_complexity:'',space_complexity:''},right.outcome)).toMatchObject({language:'SQL',status:'accepted',passed:p.tests.length});
  const only=await runner.run(p,p.solution,'run');expect(only.outcome).toMatchObject({status:'ok',passed:1,total:1});
  expect(completedProblems([{problem:p.lc,mode:'submit',status:'ok',passed:p.tests.length,total:p.tests.length}])).toEqual([p.lc]);
 }finally{await db.close();}
});

/**
 * Browser-side SQL runner: owns the PGlite worker, runs one test at a time and enforces the time limit by
 * terminating the worker (PGlite ignores statement_timeout). The query text is only ever sent to that worker.
 */
import {compareResults,type Comparison} from './sql-compare';
import {STATEMENT_TIMEOUT_MS,ROW_CAP,type SqlExecution} from './sql-engine';
import type {SqlProblem} from './sql-types';
import type {CaseResult,RunMode,RunOutcome} from './runner';

export interface WorkerPort{post(message:unknown):void;listen(onMessage:(data:any)=>void,onFailure:()=>void):void;terminate():void}
/** The literal `new URL(…)` inside `new Worker(…)` is what lets the bundler emit the worker as its own chunk. */
export function browserWorker():WorkerPort{
 const worker=new Worker(new URL('./sql-worker.ts',import.meta.url),{type:'module'});
 return {post:m=>worker.postMessage(m),listen:(onMessage,onFailure)=>{worker.addEventListener('message',e=>onMessage(e.data));worker.addEventListener('error',onFailure);},terminate:()=>worker.terminate()};
}

export interface SqlCaseDetail{
 name:string;ordered:boolean;
 /** Present when the query ran; the diff is built from it. */
 comparison?:Comparison;
 /** Present when the query was rejected or Postgres reported an error. */
 failure?:{kind:'rejected'|'error'|'setup'|'cap'|'timeout';message:string;code?:string;position?:string};
}
export interface SqlRunResult{outcome:RunOutcome;details:SqlCaseDetail[]}
export const SQL_LIMITS={testMs:STATEMENT_TIMEOUT_MS,loadMs:60000,rowCap:ROW_CAP} as const;

interface Slot{port:WorkerPort;ready:Promise<void>;listeners:Set<(data:any)=>void>;onFailure:Set<()=>void>;stop():void}
function spawn(factory:()=>WorkerPort,loadMs:number):Slot{
 const port=factory();const listeners=new Set<(data:any)=>void>(),onFailure=new Set<()=>void>();
 let timer:ReturnType<typeof setTimeout>,settle:{reject(e:Error):void}|null=null;
 const ready=new Promise<void>((resolve,reject)=>{
  settle={reject};
  timer=setTimeout(()=>{port.terminate();reject(new Error('PostgreSQL took too long to load. Try again.'));},loadMs);
  const first=(data:any)=>{
   if(data?.type==='ready'){clearTimeout(timer);listeners.delete(first);resolve();}
   if(data?.type==='crash'){clearTimeout(timer);listeners.delete(first);port.terminate();reject(new Error(String(data.error)));}
  };
  listeners.add(first);
  port.listen(data=>[...listeners].forEach(l=>l(data)),()=>{clearTimeout(timer);reject(new Error('PostgreSQL could not be loaded.'));[...onFailure].forEach(f=>f());});
 });
 ready.catch(()=>{});
 return {port,ready,listeners,onFailure,stop(){clearTimeout(timer);port.terminate();settle?.reject(new Error('Runner closed'));}};
}

export class SqlRunner{
 private slot:Slot|null=null;
 private busy=false;
 private cancel:(()=>void)|null=null;
 constructor(private readonly factory:()=>WorkerPort=browserWorker,private readonly limits:{testMs:number;loadMs:number}=SQL_LIMITS){}
 private ensure():Slot{
  if(!this.slot){
   const slot=spawn(this.factory,this.limits.loadMs);this.slot=slot;
   slot.ready.catch(()=>{if(this.slot===slot){slot.stop();this.slot=null;}});
  }
  return this.slot;
 }
 /** Starts (or reuses) the worker. Rejects when PostgreSQL cannot be loaded; a later call starts a new worker. */
 warmUp():Promise<void>{try{return this.ensure().ready;}catch(error){return Promise.reject(error);}}
 async run(problem:SqlProblem,query:string,mode:RunMode):Promise<SqlRunResult>{
  const crash=(error:string,details:SqlCaseDetail[]=[]):SqlRunResult=>({outcome:{status:'crash',error},details});
  if(this.busy)return crash('A run is already in progress.');
  let slot:Slot;
  try{slot=this.ensure();}catch{return crash('Web Workers are unavailable in this browser.');}
  this.busy=true;
  try{await slot.ready;}catch(error){this.busy=false;return crash(error instanceof Error?error.message:'PostgreSQL is unavailable.');}
  const tests=mode==='run'?problem.tests.slice(0,1):problem.tests;
  const started=performance.now();const elapsed=()=>Math.round((performance.now()-started)*100)/100;
  try{
   return await new Promise<SqlRunResult>(resolve=>{
    const results:CaseResult[]=[],details:SqlCaseDetail[]=[];let index=0,done=false,timer:ReturnType<typeof setTimeout>,caseStarted=started,token=0;
    const finish=(result:SqlRunResult)=>{if(done)return;done=true;clearTimeout(timer);slot.listeners.delete(onMessage);slot.onFailure.delete(onFailure);this.cancel=null;resolve(result);};
    const lost=(slotGone:boolean,message:string)=>{if(slotGone){slot.stop();if(this.slot===slot)this.slot=null;}finish(crash(message,details));};
    const onFailure=()=>lost(true,'The SQL worker stopped unexpectedly.');
    const record=(test:SqlProblem['tests'][number],execution:SqlExecution,ms:number)=>{
     const expected=JSON.stringify(test.expected.rows);
     if(execution.ok){
      const comparison=compareResults(test.expected,execution,test.ordered);
      results.push({id:test.name,visible:true,status:comparison.pass?'pass':'fail',got:JSON.stringify(execution.rows),expected,ms,error:comparison.pass?undefined:comparison.summary});
      details.push({name:test.name,ordered:test.ordered,comparison});
     }else{
      results.push({id:test.name,visible:true,status:'error',expected,error:execution.message,ms});
      details.push({name:test.name,ordered:test.ordered,failure:{kind:execution.kind,message:execution.message,code:execution.code,position:execution.position}});
     }
    };
    const send=()=>{
     if(index>=tests.length){finish({outcome:{status:'ok',results,passed:results.filter(r=>r.status==='pass').length,total:tests.length,stdout:'',ms:elapsed()},details});return;}
     const test=tests[index];caseStarted=performance.now();token++;
     timer=setTimeout(()=>{
      results.push({id:test.name,visible:true,status:'too_slow',error:`Stopped after ${this.limits.testMs} ms`,expected:JSON.stringify(test.expected.rows),ms:this.limits.testMs});
      details.push({name:test.name,ordered:test.ordered,failure:{kind:'timeout',message:`The query ran for more than ${this.limits.testMs/1000} seconds and was stopped.`}});
      // The only way to interrupt WebAssembly Postgres is to discard the worker; the next run starts a fresh one.
      slot.stop();if(this.slot===slot)this.slot=null;
      finish({outcome:{status:'timeout',afterMs:this.limits.testMs,results,ms:elapsed()},details});
     },this.limits.testMs);
     try{slot.port.post({type:'run',id:token,setup:test.setup,query,rowCap:SQL_LIMITS.rowCap});}catch{lost(true,'The run could not be started.');}
    };
    const onMessage=(data:any)=>{
     if(done)return;
     if(data?.type==='crash'){lost(true,String(data.error));return;}
     if(data?.type!=='result'||data.id!==token)return;
     clearTimeout(timer);record(tests[index],data.execution as SqlExecution,Math.round((performance.now()-caseStarted)*100)/100);index++;send();
    };
    this.cancel=()=>finish(crash('Run stopped.',details));
    slot.listeners.add(onMessage);slot.onFailure.add(onFailure);send();
   });
  }finally{this.busy=false;}
 }
 dispose(){this.cancel?.();this.slot?.stop();this.slot=null;this.busy=false;}
}

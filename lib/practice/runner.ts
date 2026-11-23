/** Browser-only worker lifecycle. No Python is sent to an API or executed on the server. */
import type { ArenaProblem, ArenaTest } from "./types";
export type RunMode = "run" | "submit";
export interface CaseResult { id:string; visible:boolean; status:"pass"|"fail"|"error"|"too_slow"|"unknown"; input?:string; stdout?:string; ms?:number; got?:string; expected?:string; error?:string }
export type RunOutcome =
 | {status:"ok";results:CaseResult[];passed:number;total:number;stdout:string;ms?:number}
 | {status:"compile_error";error:string;results?:CaseResult[];ms?:number}
 | {status:"timeout";afterMs:number;results?:CaseResult[];ms?:number}
 | {status:"crash";error:string;ms?:number};
export const selectTests = (tests:ArenaProblem["tests"],mode:RunMode) => (mode==="run" ? tests.filter(t=>t.visible) : tests).map(t=>({...t,kind:"functional"}));
interface Slot { worker:Worker; ready:Promise<void>; stop():void }
function spawn():Slot {
 const worker=new Worker("/runner/worker.mjs",{type:"module"});
 let rejectReady:(error:Error)=>void=()=>{};
 let timer:ReturnType<typeof setTimeout>;
 const ready=new Promise<void>((resolve,reject)=>{
  rejectReady=reject;
  timer=setTimeout(()=>{worker.terminate();reject(new Error("Python took too long to load. Try again."));},60000);
  worker.addEventListener("message",function onMessage({data}){
   if(data?.type==="ready"){clearTimeout(timer);worker.removeEventListener("message",onMessage);resolve();}
   if(data?.type==="crash"){clearTimeout(timer);worker.terminate();reject(new Error(String(data.error)));}
  });
  worker.addEventListener("error",()=>{clearTimeout(timer);worker.terminate();reject(new Error("Python could not be loaded."));});
 });
 ready.catch(()=>{});
 return {worker,ready,stop(){clearTimeout(timer);worker.terminate();rejectReady(new Error("Runner closed"));}};
}
export class PythonRunner {
 private spare:Slot|null=null;
 private active:Slot|null=null;
 private cancelRun:(()=>void)|null=null;
 warmUp():Promise<void>{
  try{this.spare ??= spawn();return this.spare.ready;}
  catch(error){return Promise.reject(error);}
 }
 async run(problem:ArenaProblem,code:string,mode:RunMode,timeoutMs=5000,editableTests?:ArenaTest[]):Promise<RunOutcome>{
  if(this.active)return {status:'crash',error:'A run is already in progress.'};
  try{this.spare??=spawn();}catch{return {status:'crash',error:'Python workers are unavailable in this browser.'};}
  const slot=this.spare;this.spare=null;this.active=slot;
  const tests=mode==='run'&&editableTests?editableTests:selectTests(problem.tests,mode);
  try{
   await slot.ready;
   return await new Promise<RunOutcome>(resolve=>{
    let done=false,index=0,timer:ReturnType<typeof setTimeout>,started=performance.now(),caseStarted=started;const results:CaseResult[]=[];
    const elapsed=()=>Math.round((performance.now()-started)*100)/100;
    const finish=(out:RunOutcome)=>{if(done)return;done=true;clearTimeout(timer);this.cancelRun=null;resolve(out);};
    const input=(t:ArenaTest)=>t.operations?JSON.stringify({operations:t.operations,arguments:t.arguments}):t.input;
    const send=()=>{
     if(index>=tests.length){finish({status:'ok',results,passed:results.filter(r=>r.status==='pass').length,total:tests.length,stdout:results.map(r=>r.stdout??'').join('').slice(0,16000),ms:elapsed()});return;}
     const test=tests[index];caseStarted=performance.now();
     timer=setTimeout(()=>{results.push({id:test.id,visible:test.visible,status:'too_slow',input:input(test),expected:test.expected,error:'Time limit exceeded',ms:timeoutMs});finish({status:'timeout',afterMs:timeoutMs,results,ms:elapsed()});},timeoutMs);
     try{slot.worker.postMessage({type:'run',code,method:problem.method,tests:[{...test,kind:'functional'}],extra:{prelude:problem.prelude,driver:problem.driver,className:problem.kind==='class_design'&&!problem.driver?problem.method:undefined}});}catch{finish({status:'crash',error:'The run could not be started.'});}
    };
    this.cancelRun=()=>finish({status:'crash',error:'Run stopped.'});
    slot.worker.addEventListener('error',()=>finish({status:'crash',error:'Python worker stopped unexpectedly.'}));
    slot.worker.addEventListener('message',({data})=>{
     if(done)return;if(data?.type==='crash'){finish({status:'crash',error:String(data.error)});return;}
     if(data?.type!=='done')return;clearTimeout(timer);const out=data.out;
     if(out?.compile_error){finish({status:'compile_error',error:String(out.compile_error),results,ms:elapsed()});return;}
     if(!Array.isArray(out?.results)||out.results.length!==1){finish({status:'crash',error:'Python returned an invalid result.'});return;}
     const test=tests[index];results.push({...out.results[0],id:test.id,visible:test.visible,input:input(test),stdout:String(data.stdout??'').slice(0,16000),ms:Math.round((performance.now()-caseStarted)*100)/100});index++;send();
    });send();
   });
  }catch(error){return {status:'crash',error:error instanceof Error?error.message:'Python is unavailable.'};}
  finally{slot.stop();if(this.active===slot)this.active=null;}
 }

 dispose(){this.cancelRun?.();this.active?.stop();this.spare?.stop();this.active=null;this.spare=null;}
}

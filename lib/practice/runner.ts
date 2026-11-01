/** Browser-only worker lifecycle. No Python is sent to an API or executed on the server. */
import type { ArenaProblem } from "./types";
export type RunMode = "run" | "submit";
export interface CaseResult { id:string; visible:boolean; status:"pass"|"fail"|"error"|"too_slow"; ms?:number; got?:string; expected?:string; error?:string }
export type RunOutcome =
 | {status:"ok";results:CaseResult[];passed:number;total:number;stdout:string}
 | {status:"compile_error";error:string}
 | {status:"timeout";afterMs:number}
 | {status:"crash";error:string};
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
 async run(problem:ArenaProblem,code:string,mode:RunMode,timeoutMs=5000):Promise<RunOutcome>{
  if(this.active) return {status:"crash",error:"A run is already in progress."};
  try{this.spare ??= spawn();}catch{return {status:"crash",error:"Python workers are unavailable in this browser."};}
  const slot=this.spare;this.spare=null;this.active=slot;
  try{
   await slot.ready;
   return await new Promise<RunOutcome>(resolve=>{
    let done=false;
    const finish=(out:RunOutcome)=>{if(done)return;done=true;clearTimeout(timer);this.cancelRun=null;resolve(out);};
    const timer=setTimeout(()=>finish({status:"timeout",afterMs:timeoutMs}),timeoutMs);
    this.cancelRun=()=>finish({status:"crash",error:"Run stopped."});
    slot.worker.addEventListener("error",()=>finish({status:"crash",error:"Python worker stopped unexpectedly."}));
    slot.worker.addEventListener("message",({data})=>{
     if(data?.type==="crash")finish({status:"crash",error:String(data.error)});
     if(data?.type==="done"){
      const out=data.out;
      if(out?.compile_error) finish({status:"compile_error",error:String(out.compile_error)});
      else if(Array.isArray(out?.results)) finish({status:"ok",results:out.results,passed:out.results.filter((r:CaseResult)=>r.status==="pass").length,total:out.results.length,stdout:String(data.stdout??"")});
      else finish({status:"crash",error:"Python returned an invalid result."});
     }
    });
    try { slot.worker.postMessage({type:"run",code,method:problem.method,tests:selectTests(problem.tests,mode),extra:{prelude:problem.prelude,driver:problem.driver}}); }
    catch { finish({status:"crash",error:"The run could not be started."}); }
   });
  }catch(error){return {status:"crash",error:error instanceof Error?error.message:"Python is unavailable."};}
  finally{slot.stop();if(this.active===slot)this.active=null;}
 }
 dispose(){this.cancelRun?.();this.active?.stop();this.spare?.stop();this.active=null;this.spare=null;}
}

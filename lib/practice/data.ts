import { problemByNumber } from './catalog';
import type { RunOutcome } from './runner';
export interface AttemptSummary { id:string;mode:'run'|'submit';status:RunOutcome['status'];passed:number;total:number;created_at:string }
export interface AttemptInput { id:string;problem:number;code:string;mode:'run'|'submit';status:RunOutcome['status'];passed:number;total:number;error:string }
export interface PracticeData { note:string; code:string|null; attempts:AttemptSummary[] }
export type DataResult = {ok:true;data:PracticeData}|{ok:false;message:string};
export type SaveResult = {ok:true;updated_at?:string;created_at?:string}|{ok:false;message:string};
export const validProblem=(value:unknown):value is number=>typeof value==='number'&&Number.isInteger(value)&&!!problemByNumber(value);
export const validCode=(code:unknown):code is string=>typeof code==='string'&&code.length<=100000;
export function attemptInput(problem:number,code:string,mode:'run'|'submit',out:RunOutcome):AttemptInput {
 return {id:crypto.randomUUID(),problem,code,mode,status:out.status,passed:out.status==='ok'?out.passed:0,total:out.status==='ok'?out.total:0,error:out.status==='ok'?'':out.status==='timeout'?`Stopped after ${out.afterMs} ms`:out.error.slice(0,2000)};
}
export function validAttempt(value:unknown):value is AttemptInput {
 if(!value||typeof value!=='object')return false;
 const a=value as AttemptInput;
 return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(a.id)&&validProblem(a.problem)&&validCode(a.code)&&['run','submit'].includes(a.mode)&&['ok','compile_error','timeout','crash'].includes(a.status)&&Number.isInteger(a.passed)&&Number.isInteger(a.total)&&a.passed>=0&&a.total>=a.passed&&a.total<=10000&&typeof a.error==='string'&&a.error.length<=2000;
}

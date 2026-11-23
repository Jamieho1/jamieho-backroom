import {z} from 'zod';
import {validProblem} from './data';
import type {RunOutcome} from './runner';
import {extraOf,solutionOf} from './solutions';
export const Complexity=z.object({time_complexity:z.string().max(120),space_complexity:z.string().max(120)}).strict();
export type Complexity=z.infer<typeof Complexity>;
export const emptyComplexity:Complexity={time_complexity:'',space_complexity:''};
export const SubmissionInput=Complexity.safeExtend({id:z.uuid(),problem:z.number().int().refine(validProblem),status:z.enum(['accepted','wrong answer','runtime error','time limit']),passed:z.number().int().min(0),total:z.number().int().min(1).max(10000),runtime_ms:z.number().finite().min(0).max(86400000),language:z.literal('Python'),code:z.string().max(100000)}).refine(s=>s.passed<=s.total&&((s.status==='accepted')===(s.passed===s.total)),{message:'Submission status must match its results.'});
export type SubmissionInput=z.infer<typeof SubmissionInput>;
export type Submission=SubmissionInput&{created_at:string};
export function submissionInput(problem:number,code:string,complexity:Complexity,out:RunOutcome):SubmissionInput{
 const results='results'in out?out.results??[]:[],total=out.status==='ok'?out.total:0;
 const status=out.status==='timeout'?'time limit':out.status!=='ok'||results.some(r=>r.status==='error')?'runtime error':total>0&&out.passed===total?'accepted':'wrong answer';
 // Preserve partial results on timeout; every Submit still targets the complete catalogue.
 const count=problemTests(problem);const passed=results.filter(r=>r.status==='pass').length;
 return SubmissionInput.parse({id:crypto.randomUUID(),problem,code,...complexity,status,passed:status==='accepted'?count:Math.min(passed,count-1),total:count,runtime_ms:out.ms??0,language:'Python'});
}
import {problemByNumber} from './catalog';
const problemTests=(id:number)=>problemByNumber(id)?.tests.length??0;
export function expectedComplexity(problem:number){const extra=extraOf(problem);return extra?`${extra.time.o} · ${extra.space.o}`:solutionOf(problem)?.complexity??'Not specified';}
export function relativeTime(date:string,now=Date.now()){const seconds=Math.max(0,Math.floor((now-Date.parse(date))/1000));if(!Number.isFinite(seconds))return 'Unknown date';if(seconds<60)return 'just now';if(seconds<3600)return `${Math.floor(seconds/60)}m ago`;if(seconds<86400)return `${Math.floor(seconds/3600)}h ago`;return `${Math.floor(seconds/86400)}d ago`;}

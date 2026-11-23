'use server';
import {getViewer} from '@/lib/viewer';
import {supabaseServer} from '@/lib/supabase/server';
import {validPracticeProblem,type SaveResult} from '@/lib/practice/data';
import {Complexity,SubmissionInput,emptyComplexity,type Submission} from '@/lib/practice/submissions';
async function client(expectedUserId:string){const viewer=await getViewer();if(!viewer.id||viewer.role==='anonymous'||viewer.id!==expectedUserId)return null;const sb=await supabaseServer();return sb?{sb,id:viewer.id}:null;}
export async function loadPracticeComplexity(problem:number,expectedUserId:string){
 if(!validPracticeProblem(problem))return {ok:false as const,message:'Choose a valid problem.'};
 try{const c=await client(expectedUserId);if(!c)return {ok:false as const,message:'Sign in to the same account.'};const {data,error}=await c.sb.from('practice_complexities').select('time_complexity,space_complexity').eq('user_id',c.id).eq('problem',problem).maybeSingle();if(error)throw Error();return {ok:true as const,complexity:Complexity.parse(data??emptyComplexity)};}catch{return {ok:false as const,message:'Could not load complexity. Local edits are still available.'};}
}
export async function savePracticeComplexity(problem:number,value:unknown,expectedUserId:string):Promise<SaveResult>{
 const parsed=Complexity.safeParse(value);if(!validPracticeProblem(problem)||!parsed.success)return {ok:false,message:'Keep Time and Space under 120 characters.'};
 try{const c=await client(expectedUserId);if(!c)return {ok:false,message:'Sign in to the same account.'};const {data,error}=await c.sb.from('practice_complexities').upsert({...parsed.data,user_id:c.id,problem,updated_at:new Date().toISOString()},{onConflict:'user_id,problem'}).select('problem');return error||!data?.length?{ok:false,message:'Could not save complexity. Saved locally; retry.'}:{ok:true};}catch{return {ok:false,message:'Could not save complexity. Saved locally; retry.'};}
}
export async function loadPracticeSubmissions(problem:number,expectedUserId:string,offset=0):Promise<{ok:true;rows:Submission[];more:boolean}|{ok:false;message:string}>{
 if(!validPracticeProblem(problem)||!Number.isInteger(offset)||offset<0||offset>100000)return {ok:false,message:'Choose a valid submission page.'};
 try{const c=await client(expectedUserId);if(!c)return {ok:false,message:'Sign in to view your submissions.'};const {data,error}=await c.sb.from('practice_submissions').select('id,problem,status,passed,total,runtime_ms,language,code,time_complexity,space_complexity,created_at').eq('user_id',c.id).eq('problem',problem).order('created_at',{ascending:false}).order('id',{ascending:false}).range(offset,offset+19);if(error)throw Error();return {ok:true,rows:(data??[]) as Submission[],more:data?.length===20};}catch{return {ok:false,message:'Could not load submissions. Retry.'};}
}
export async function savePracticeSubmission(value:unknown,expectedUserId:string):Promise<SaveResult>{
 const parsed=SubmissionInput.safeParse(value);if(!parsed.success)return {ok:false,message:'Invalid submission snapshot.'};
 try{const c=await client(expectedUserId);if(!c)return {ok:false,message:'Your account changed. Sign in again to save this submission.'};
 // Retry the same UUID without replacing an already stored snapshot or timestamp.
 const {error}=await c.sb.from('practice_submissions').upsert({...parsed.data,user_id:c.id},{onConflict:'user_id,id',ignoreDuplicates:true});return error?{ok:false,message:'Could not save submission. Keep this page open and retry.'}:{ok:true};}catch{return {ok:false,message:'Could not save submission. Keep this page open and retry.'};}
}

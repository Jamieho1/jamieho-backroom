'use server';
import { getViewer } from '@/lib/viewer';
import { supabaseServer } from '@/lib/supabase/server';
import { validProblem,validCode,validAttempt,type AttemptInput,type AttemptSummary,type DataResult,type SaveResult } from '@/lib/practice/data';
const failed=():SaveResult=>({ok:false,message:"Couldn't save. Your draft is still here — retry."});
async function ownerClient(){const viewer=await getViewer();return viewer.role==='owner'?supabaseServer():null;}

export async function loadPracticeData(problem:number):Promise<DataResult>{
 if(!validProblem(problem))return {ok:false,message:'Choose a valid problem.'};
 try{
  const viewer=await getViewer();if(viewer.role==='anonymous')return {ok:false,message:'Sign in to read question notes.'};
  const sb=await supabaseServer();if(!sb)throw new Error('unavailable');
  const note=await sb.from('question_notes').select('body').eq('problem',problem).maybeSingle();
  if(note.error)throw new Error('unavailable');
  if(viewer.role!=='owner')return {ok:true,data:{note:note.data?.body??'',code:null,attempts:[]}};
  const [saved,attempts]=await Promise.all([
   sb.from('practice_code').select('code').eq('problem',problem).maybeSingle(),
   sb.from('practice_attempts').select('id,mode,status,passed,total,created_at').eq('problem',problem).order('created_at',{ascending:false}).limit(20),
  ]);
  if(saved.error||attempts.error)throw new Error('unavailable');
  return {ok:true,data:{note:note.data?.body??'',code:saved.data?.code??null,attempts:(attempts.data??[]) as AttemptSummary[]}};
 }catch{return {ok:false,message:"Can't reach saved Practice data right now. Your browser code is still available."};}
}
export async function savePracticeCode(problem:number,code:string):Promise<SaveResult>{
 if(!validProblem(problem)||!validCode(code))return {ok:false,message:'Choose a valid problem and keep code under 100,000 characters.'};
 try{
  const sb=await ownerClient();if(!sb)return {ok:false,message:'Only the owner can save Practice code.'};
  const updated_at=new Date().toISOString();
  const {data,error}=await sb.from('practice_code').upsert({problem,code,updated_at},{onConflict:'problem'}).select('problem');
  return error||!data?.length?failed():{ok:true,updated_at};
 }catch{return failed();}
}
export async function savePracticeAttempt(attempt:AttemptInput):Promise<SaveResult>{
 if(!validAttempt(attempt))return {ok:false,message:'The attempt could not be saved.'};
 try{
  const sb=await ownerClient();if(!sb)return {ok:false,message:'Only the owner can save attempts.'};
  // A stable attempt ID makes retries idempotent; do not overwrite the separately saved code.
  const {id,problem,code,mode,status,passed,total,error:detail}=attempt;
  const {data,error}=await sb.from('practice_attempts').upsert({id,problem,code,mode,status,passed,total,error:detail},{onConflict:'id'}).select('id,created_at');
  return error||!data?.length?failed():{ok:true,created_at:data[0].created_at};
 }catch{return failed();}
}
export async function saveQuestionNotes(problem:number,body:string):Promise<SaveResult>{
 if(!validProblem(problem)||typeof body!=='string'||body.length>200000)return {ok:false,message:'Keep question notes under 200,000 characters.'};
 try{
  const sb=await ownerClient();if(!sb)return {ok:false,message:'Only the owner can edit question notes.'};
  const updated_at=new Date().toISOString();
  const {data,error}=await sb.from('question_notes').upsert({problem,body,updated_at},{onConflict:'problem'}).select('problem');
  return error||!data?.length?failed():{ok:true,updated_at};
 }catch{return failed();}
}

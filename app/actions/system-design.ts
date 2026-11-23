'use server';
import {getViewer} from '@/lib/viewer';
import {supabaseServer} from '@/lib/supabase/server';
import {picksSchema,scoreQuiz,questionSchema,SD_TABLE,type QuizAttempt,type QuizPick} from '@/lib/interview/system-design';
export type SdProgressResult={ok:true;flagged:string[];done:string[]}|{ok:false;message:string};
export type SdSaveResult={ok:true}|{ok:false;message:string};
export type SdAttemptsResult={ok:true;attempts:QuizAttempt[]}|{ok:false;message:string};
export type SdAttemptSave={ok:true;attempt:QuizAttempt}|{ok:false;message:string};
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
async function account(){const viewer=await getViewer();return viewer.id&&viewer.role!=='anonymous'?viewer.id:null;}
export async function loadSdProgress():Promise<SdProgressResult>{
 try{
  const id=await account();if(!id)return {ok:false,message:'Sign in to read your flags.'};
  const sb=await supabaseServer();if(!sb)throw Error('unavailable');
  const {data,error}=await sb.from('system_design_progress').select('question_id,flagged,done').eq('user_id',id);
  if(error)throw Error('unavailable');
  const rows=data??[];return {ok:true,flagged:rows.filter(r=>r.flagged).map(r=>r.question_id),done:rows.filter(r=>r.done).map(r=>r.question_id)};
 }catch{return {ok:false,message:"Couldn't load your progress. Retry."};}
}
export async function saveSdProgress(questionId:string,field:'flagged'|'done',value:boolean):Promise<SdSaveResult>{
 if(!UUID.test(questionId)||(field!=='flagged'&&field!=='done')||typeof value!=='boolean')return {ok:false,message:'Choose a valid question.'};
 try{
  const id=await account();if(!id)return {ok:false,message:'Sign in to save your progress.'};
  const sb=await supabaseServer();if(!sb)throw Error('unavailable');
  // Only the changed column is sent, so the other flag keeps its stored value on conflict.
  const {data,error}=await sb.from('system_design_progress').upsert({user_id:id,question_id:questionId,[field]:value,updated_at:new Date().toISOString()},{onConflict:'user_id,question_id'}).select('question_id');
  if(error||!data?.length)throw Error('unavailable');
  return {ok:true};
 }catch{return {ok:false,message:"Couldn't save the change. Retry."};}
}
export async function loadQuizAttempts(questionId:string):Promise<SdAttemptsResult>{
 if(!UUID.test(questionId))return {ok:false,message:'Choose a valid question.'};
 try{
  const id=await account();if(!id)return {ok:false,message:'Sign in to read your attempts.'};
  const sb=await supabaseServer();if(!sb)throw Error('unavailable');
  const {data,error}=await sb.from('system_design_quiz_attempts').select('id,score,total,created_at').eq('user_id',id).eq('question_id',questionId).order('created_at',{ascending:false}).limit(20);
  if(error)throw Error('unavailable');
  return {ok:true,attempts:(data??[]).map(r=>({id:r.id,score:r.score,total:r.total,created_at:r.created_at}))};
 }catch{return {ok:false,message:"Couldn't load your attempts. Retry."};}
}
/** The score is recomputed here from the stored quiz, so a client cannot record a score it did not earn. */
export async function saveQuizAttempt(questionId:string,picks:(QuizPick)[]):Promise<SdAttemptSave>{
 const parsed=picksSchema.safeParse(picks);
 if(!UUID.test(questionId)||!parsed.success)return {ok:false,message:'Choose a valid quiz attempt.'};
 try{
  const id=await account();if(!id)return {ok:false,message:'Sign in to save attempts.'};
  const sb=await supabaseServer();if(!sb)throw Error('unavailable');
  const q=await sb.from(SD_TABLE).select('quiz').eq('id',questionId).eq('public',true).maybeSingle();
  if(q.error||!q.data)throw Error('unavailable');
  const quiz=questionSchema.shape.quiz.safeParse(q.data.quiz);if(!quiz.success||!quiz.data.length||parsed.data.length!==quiz.data.length)return {ok:false,message:'That attempt does not match the quiz.'};
  const result=scoreQuiz(quiz.data,parsed.data);
  const {data,error}=await sb.from('system_design_quiz_attempts').insert({user_id:id,question_id:questionId,score:result.score,total:result.total,answers:parsed.data}).select('id,score,total,created_at').single();
  if(error||!data)throw Error('unavailable');
  return {ok:true,attempt:{id:data.id,score:data.score,total:data.total,created_at:data.created_at}};
 }catch{return {ok:false,message:"Couldn't save this attempt. Your score is shown below; retry saving."};}
}

'use server';
import {revalidatePath} from 'next/cache';
import {getViewer} from '@/lib/viewer';
import {supabaseServer} from '@/lib/supabase/server';
import {privateAnswerSchema,customQuestionSchema,questionHref,type PrivateAnswer,type PrivateQuestion} from '@/lib/interview/behavioral';
type Result<T>={ok:true;value:T}|{ok:false;message:string};
export async function saveBehavioralAnswer(input:unknown):Promise<Result<PrivateAnswer>>{
 const parsed=privateAnswerSchema.safeParse(input);if(!parsed.success)return {ok:false,message:'Check your STAR fields and role selection; each text field allows 20,000 characters.'};
 try{
  const viewer=await getViewer();if(!viewer.id||viewer.role==='anonymous')return {ok:false,message:'Sign in to save a private answer.'};
  const sb=await supabaseServer();if(!sb)throw Error();
  const {data,error}=await sb.from('interview_behavioral_answers').upsert({...parsed.data,user_id:viewer.id},{onConflict:'user_id,question_id'}).select('question_id,custom,situation,task,action,result,role_id').single();
  if(error||!data)return {ok:false,message:'Could not save. Check that the question and your selected resume role still exist, then retry. Your edits are still here.'};
  revalidatePath('/interview/behavioral','layout');return {ok:true,value:data as PrivateAnswer};
 }catch{return {ok:false,message:'Could not save. Your edits are still here. Please retry.'};}
}
export async function createBehavioralQuestion(input:unknown):Promise<Result<PrivateQuestion>>{
 const parsed=customQuestionSchema.safeParse(input);if(!parsed.success)return {ok:false,message:'Choose a theme and enter a question (up to 400 characters).'};
 try{const viewer=await getViewer();if(!viewer.id||viewer.role==='anonymous')return {ok:false,message:'Sign in to create a private question.'};const sb=await supabaseServer();if(!sb)throw Error();
 const {data,error}=await sb.from('interview_behavioral_custom_questions').insert({...parsed.data,user_id:viewer.id}).select('id,theme_id,prompt').single();if(error?.code==='23505'){const existing=await sb.from('interview_behavioral_custom_questions').select('id,theme_id,prompt').eq('id',parsed.data.id).eq('user_id',viewer.id).maybeSingle();if(!existing.error&&existing.data)return {ok:true,value:existing.data as PrivateQuestion};}if(error||!data)throw Error();
 revalidatePath('/interview/behavioral','layout');revalidatePath(questionHref(data.id));return {ok:true,value:data as PrivateQuestion};
 }catch{return {ok:false,message:'Could not create the question. Your text is still here. Please retry.'};}
}

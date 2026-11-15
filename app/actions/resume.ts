'use server';
import {getViewer} from '@/lib/viewer';
import {supabaseServer} from '@/lib/supabase/server';
import {emptyResume,resumeDocumentSchema,type UserResume} from '@/lib/resume';
export type ResumeResult={ok:true;resume:UserResume}|{ok:false;message:string};
export async function startResume(mode:unknown):Promise<ResumeResult>{
 if(mode!=='blank'&&mode!=='template')return {ok:false,message:'Choose how to start your resume.'};
 try{
  const viewer=await getViewer();if(!viewer.id||viewer.role==='anonymous')return {ok:false,message:'Sign in to build your own resume.'};
  const sb=await supabaseServer();if(!sb)throw Error();let content=emptyResume();
  if(mode==='template'){const result=await sb.from('resume_templates').select('content').eq('key','default').maybeSingle();if(result.error||!result.data)return {ok:false,message:'Could not load the template. Retry or start blank.'};content=resumeDocumentSchema.parse(result.data.content);}
  const {data,error}=await sb.from('user_resumes').insert({user_id:viewer.id,content}).select('content,revision,updated_at').single();
  if(error)return {ok:false,message:error.code==='23505'?'You already have a resume. Reload to continue editing it.':'Could not start your resume. Please retry.'};
  return {ok:true,resume:data as UserResume};
 }catch{return {ok:false,message:'Could not start your resume. Please retry.'};}
}
export async function saveResume(input:unknown,revision:unknown):Promise<ResumeResult>{
 const parsed=resumeDocumentSchema.safeParse(input);
 if(!parsed.success)return {ok:false,message:'Check your resume: '+parsed.error.issues.map(i=>i.message).join(' ')};
 if(typeof revision!=='number'||!Number.isInteger(revision)||revision<1||revision>=2147483647)return {ok:false,message:'Reload your resume before saving.'};
 try{
  const viewer=await getViewer();if(!viewer.id||viewer.role==='anonymous')return {ok:false,message:'Sign in to save your resume.'};const sb=await supabaseServer();if(!sb)throw Error();
  const {data,error}=await sb.from('user_resumes').update({content:parsed.data,revision:revision+1}).eq('user_id',viewer.id).eq('revision',revision).select('content,revision,updated_at').maybeSingle();
  if(error)throw Error();if(!data)return {ok:false,message:'Your resume changed in another tab. Copy your unsaved edits, then reload before saving.'};
  return {ok:true,resume:data as UserResume};
 }catch{return {ok:false,message:'Could not save. Your edits are still here. Please retry.'};}
}

import {cache} from 'react';
import {supabaseServer} from '@/lib/supabase/server';
import {getViewer} from '@/lib/viewer';
import {getHomePreview} from '@/lib/content-drafts/preview';
import type {BehavioralTheme,GuideQuestion,PrivateQuestion,PrivateAnswer} from './behavioral';
import {resumeDocumentSchema} from '@/lib/resume';
export const getBehavioralData=cache(async()=>{
 const viewer=await getViewer();const sb=await supabaseServer();
 const data:{userId?:string;configured:boolean;themes:BehavioralTheme[];questions:GuideQuestion[];custom:PrivateQuestion[];answers:PrivateAnswer[];roles:{id:string;title:string}[];error?:string;preview:Awaited<ReturnType<typeof getHomePreview>>}={userId:viewer.id,configured:!!sb,themes:[],questions:[],custom:[],answers:[],roles:[],preview:null};
 if(!sb)return data;
 try{
  const [themes,questions]=await Promise.all([sb.from('interview_behavioral_themes').select('*').order('sort'),sb.from('interview_behavioral_questions').select('*').eq('published',true).order('sort')]);
  if(themes.error||questions.error)throw Error();data.themes=themes.data??[];data.questions=questions.data??[];
  const preview=await getHomePreview();if(preview?.behavioral){data.preview=preview;data.themes=preview.behavioral.themes;data.questions=preview.behavioral.questions;}
  if(viewer.id&&viewer.role!=='anonymous'){
   const [custom,answers,resume]=await Promise.all([sb.from('interview_behavioral_custom_questions').select('*').eq('user_id',viewer.id).order('created_at'),sb.from('interview_behavioral_answers').select('question_id,custom,situation,task,action,result,role_id').eq('user_id',viewer.id),sb.from('user_resumes').select('content').eq('user_id',viewer.id).maybeSingle()]);
   if(custom.error||answers.error||resume.error)throw Error();data.custom=custom.data??[];data.answers=answers.data??[];
   const parsed=resumeDocumentSchema.safeParse(resume.data?.content);if(parsed.success)data.roles=parsed.data.entries.filter(e=>e.kind==='role').map(e=>({id:e.id,title:e.title}));
  }
 }catch{data.error='Could not load the Playbook. Reload to retry.';data.custom=[];data.answers=[];data.roles=[];}
 return data;
});

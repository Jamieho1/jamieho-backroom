import {getViewer} from '@/lib/viewer';
import {supabaseServer} from '@/lib/supabase/server';
import {getHomePreview} from '@/lib/content-drafts/preview';
import {PagePreview} from '@/components/content-drafts/page-preview';
import {ResumeWorkspace} from '@/components/interview/resume-editor';
import {emptyTemplate,resumeDocumentSchema,type UserResume,type ResumeTemplate} from '@/lib/resume';
export const dynamic='force-dynamic';
export default async function ResumePage(){
 const viewer=await getViewer();const sb=await supabaseServer();let template=emptyTemplate();let initial:UserResume|null=null;
 const preview=await getHomePreview();
 if(sb){
  const result=await sb.from('resume_templates').select('key,title,content').eq('key','default').maybeSingle();
  if(result.error)return <section className="iv-resume"><h1>Resume</h1><p role="alert">Could not load the resume guide. Please reload to retry.</p></section>;
  if(result.data)template={...result.data,content:resumeDocumentSchema.parse(result.data.content)} as ResumeTemplate;
  if(viewer.id&&viewer.role!=='anonymous'&&!preview?.resumeTemplate){const own=await sb.from('user_resumes').select('content,revision,updated_at').eq('user_id',viewer.id).maybeSingle();if(own.error)return <section className="iv-resume"><h1>Resume</h1><p role="alert">Could not load your resume. Please reload to retry.</p></section>;if(own.data)initial={...own.data,content:resumeDocumentSchema.parse(own.data.content)} as UserResume;}
 }
 if(preview?.resumeTemplate)template=preview.resumeTemplate;
 return <ResumeWorkspace initial={initial} template={template} userId={viewer.id} configured={!!sb}><PagePreview preview={preview?.resumeTemplate?preview:null} page="/interview/resume"/></ResumeWorkspace>;
}

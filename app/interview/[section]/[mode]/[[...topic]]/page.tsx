import {UsedInDesign} from '@/components/practice/question-connections';
import {notFound} from 'next/navigation';
import {INTERVIEW_SECTIONS,PRACTICE_SECTIONS,interviewTopics} from '@/lib/interview/navigation';
import {InterviewPlaceholder} from '@/components/interview/placeholder';
import {InterviewQuestions} from '@/components/interview/questions';
import {getInterviewNotes} from '@/lib/interview/notes';
import {NotesReader} from '@/components/notes/reader';
import {PagePreview} from '@/components/content-drafts/page-preview';
import {NotesSignIn} from '@/components/notes/sign-in';
import {modeHref,noteSection,ROLE_NOTE_SECTIONS} from '@/lib/interview/content';
import Link from 'next/link';
import {SystemDesignList} from '@/components/interview/sd-list';
import {getSdQuestions} from '@/lib/interview/system-design-data';
import {sdHref} from '@/lib/interview/system-design';
import {systemDesignQuestionRoute} from './system-design';
export const dynamic='force-dynamic';
export default async function InterviewTopicPage({params}:{params:Promise<{section:string;mode:string;topic?:string[]}>}){
 const {section,mode,topic}=await params;
 if(section==='system-design'&&!topic&&mode!=='practice'&&mode!=='notes')return systemDesignQuestionRoute(mode);
 const item=INTERVIEW_SECTIONS.find(s=>s.id===section);
 const roleNotes=ROLE_NOTE_SECTIONS.some(s=>s===section);
 if(!item||!(PRACTICE_SECTIONS.some(s=>s===section)||roleNotes)||!['practice','notes'].includes(mode)||roleNotes&&mode!=='notes'||topic&&topic.length!==1)notFound();
 const data=await getInterviewNotes();const topics=interviewTopics(section,data.notes);const id=topic?.[0];
 const selected=id?topics.find(t=>t.id===id):undefined;
 // Private imported note IDs must not become a signed-out existence oracle.
 if(id&&!selected&&!(mode==='notes'&&!data.allowed&&/^[a-z0-9][a-z0-9-]{0,79}$/.test(id)&&noteSection(id)===section))notFound();
 if(mode==='practice'){
  if(section==='system-design'){const all=await getSdQuestions();return <SystemDesignList questions={id?all.filter(q=>q.note_ref===id):all} title={selected?.label??item.label}/>;}
  if((section==='finance'||section==='ai-engineering')&&!topics.length)return <InterviewPlaceholder section={item}/>;
  return <InterviewQuestions section={section} topic={id} title={selected?.label??item.label}/>;
 }
 const page=modeHref(section,true,id);
 if(data.viewer.role==='anonymous')return <NotesSignIn next={page} configured={data.configured}/>;
 if(!data.allowed||data.error)return <p role="alert">Can&apos;t reach the notes right now. Please try again.</p>;
 if(!id)return <section className="iv-question-page"><h1>{item.label} notes</h1><p>This notes overview will be designed later.</p></section>;
 const note=data.notes.find(n=>n.id===id);if(!note)return <section className="iv-question-page"><h1>{selected?.label}</h1><p>No notes have been added for this topic yet.</p>{section==='dsa'?<UsedInDesign topic={id} readOnly={!!data.preview}/>:null}</section>;
 const sdQuestions=section==='system-design'?(await getSdQuestions()).filter(q=>q.note_ref===id):[];
 return <div className="iv-note-reader">{sdQuestions.map(q=><p className="iv-sd-note-link" key={q.id}><Link href={sdHref(q.slug)} prefetch={false}>Practice: {q.title} ›</Link></p>)}<NotesReader key={`${id}:${data.preview?.id??'live'}`} notes={[note]} canEdit={data.viewer.role==='owner'&&!data.preview} singleTopic interviewLinks/>{section==='dsa'?<UsedInDesign topic={id} readOnly={!!data.preview}/>:null}<PagePreview preview={data.preview} page={page}/></div>;
}

import {notFound,redirect} from 'next/navigation';
import {INTERVIEW_SECTIONS,interviewTopics} from '@/lib/interview/navigation';
import {ROLE_NOTE_SECTIONS} from '@/lib/interview/content';
import {getInterviewNotes} from '@/lib/interview/notes';
import {InterviewPlaceholder} from '@/components/interview/placeholder';
import {RoleNotes} from '@/components/interview/role-notes';
export const dynamic='force-dynamic';
export default async function InterviewSectionPage({params}:{params:Promise<{section:string}>}){
 const {section}=await params;const item=INTERVIEW_SECTIONS.find(s=>s.id===section&&['resume','behavioral','roadmaps','applications','forward-deploy-engineer','data-scientist','mock-interview','fundamental','sql','full-stack','machine-learning','project'].includes(s.id));
 if(!item)notFound();
 if(item.id==='sql')redirect('/interview/sql/practice');
 // Role pages show their note topics once the viewer can read at least one; otherwise the shared Soon placeholder stays.
 if(ROLE_NOTE_SECTIONS.some(s=>s===item.id)){const data=await getInterviewNotes();const topics=data.allowed?interviewTopics(item.id,data.notes):[];if(topics.length)return <RoleNotes section={item} topics={topics}/>;}
 return <InterviewPlaceholder section={item}/>;
}

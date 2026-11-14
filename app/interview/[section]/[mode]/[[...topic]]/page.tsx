import {notFound} from 'next/navigation';
import {INTERVIEW_SECTIONS,PRACTICE_SECTIONS,interviewTopics} from '@/lib/interview/navigation';
import {InterviewPlaceholder} from '@/components/interview/placeholder';
export default async function InterviewTopicPage({params}:{params:Promise<{section:string;mode:string;topic?:string[]}>}){
 const {section,mode,topic}=await params;const item=INTERVIEW_SECTIONS.find(s=>s.id===section);
 if(!item||!PRACTICE_SECTIONS.some(s=>s===section)||!['practice','notes'].includes(mode))notFound();
 const selected=topic?.length===1?interviewTopics(section).find(t=>t.id===topic[0]):undefined;
 if(topic?.length&&!selected)notFound();
 return <InterviewPlaceholder section={item} title={selected?selected.label:undefined}/>;
}

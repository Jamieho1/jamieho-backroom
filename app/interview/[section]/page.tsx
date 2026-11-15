import {notFound} from 'next/navigation';
import {INTERVIEW_SECTIONS} from '@/lib/interview/navigation';
import {InterviewPlaceholder} from '@/components/interview/placeholder';
export default async function InterviewSectionPage({params}:{params:Promise<{section:string}>}){
 const {section}=await params;const item=INTERVIEW_SECTIONS.find(s=>s.id===section&&['resume','behavioral','companies','roadmaps','applications','forward-deploy-engineer','data-scientist','mock-interview'].includes(s.id));
 if(!item)notFound();return <InterviewPlaceholder section={item}/>;
}

import type {Metadata} from 'next';
import {InterviewShell} from '@/components/interview/shell';
import '../notes.css';
import '../practice.css';
import './interview.css';
import {getInterviewNotes} from '@/lib/interview/notes';
export const metadata:Metadata={title:{default:'Interview · Jamie Ho',template:'%s · Interview · Jamie Ho'},description:'A focused workspace for interview preparation.'};
export default async function InterviewLayout({children}:{children:React.ReactNode}){const data=await getInterviewNotes();return <InterviewShell noteTopics={data.notes.map(n=>({id:n.id,title:n.title}))}>{children}</InterviewShell>;}

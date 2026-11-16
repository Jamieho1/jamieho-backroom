import type {Metadata} from 'next';
import {InterviewShell} from '@/components/interview/shell';
import '../notes.css';
import '../practice.css';
import './interview.css';
import {getBehavioralData} from '@/lib/interview/behavioral-data';
import {isAnswered} from '@/lib/interview/behavioral';
import {getInterviewNotes} from '@/lib/interview/notes';
export const metadata:Metadata={title:{default:'PassLoop · Jamie Ho',template:'%s · PassLoop · Jamie Ho'},description:'A focused workspace for interview preparation.'};
export default async function InterviewLayout({children}:{children:React.ReactNode}){const data=await getInterviewNotes();const behavioral=await getBehavioralData();const all=[...behavioral.questions,...behavioral.custom];return <InterviewShell behavioralUserId={behavioral.userId} behavioralThemes={behavioral.themes.map(t=>({...t,total:all.filter(q=>q.theme_id===t.id).length,answered:all.filter(q=>q.theme_id===t.id&&isAnswered(behavioral.answers.find(a=>a.question_id===q.id))).length}))} noteTopics={data.notes.map(n=>({id:n.id,title:n.title}))}>{children}</InterviewShell>;}

import type {Metadata} from 'next';
import {InterviewShell} from '@/components/interview/shell';
import './interview.css';
export const metadata:Metadata={title:{default:'Interview · Jamie Ho',template:'%s · Interview · Jamie Ho'},description:'A focused workspace for interview preparation.'};
export default function InterviewLayout({children}:{children:React.ReactNode}){return <InterviewShell>{children}</InterviewShell>;}

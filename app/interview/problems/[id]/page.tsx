import {notFound} from 'next/navigation';
import {getViewer} from '@/lib/viewer';
import {problemByNumber} from '@/lib/practice/catalog';
import {PracticeContent} from '@/app/desktop/practice-content';
export const dynamic='force-dynamic';
export default async function InterviewProblem({params}:{params:Promise<{id:string}>}){
 const {id}=await params;if(!/^[1-9][0-9]*$/.test(id)||!problemByNumber(Number(id)))notFound();
 const viewer=await getViewer();
 return <PracticeContent viewerKey={viewer.id??'visitor'} canEdit={viewer.role==='owner'} initialProblem={Number(id)} interview/>;
}

import {notFound} from 'next/navigation';
import {getViewer} from '@/lib/viewer';
import {sqlProblemByNumber} from '@/lib/practice/sql-catalog';
import {PracticeSession} from '@/components/practice/session';
import {SqlPracticeWorkspace} from '@/components/practice/sql-workspace';
export const dynamic='force-dynamic';
/** One SQL 50 question. PGlite loads only here, in a Web Worker started by the workspace. */
export default async function SqlProblemPage({params}:{params:Promise<{lc:string}>}){
 const {lc}=await params;if(!/^[1-9][0-9]*$/.test(lc)||!sqlProblemByNumber(Number(lc)))notFound();
 const viewer=await getViewer();const viewerKey=viewer.id??'visitor';
 return <PracticeSession viewerKey={viewerKey}><SqlPracticeWorkspace key={`${viewerKey}:${lc}`} lc={Number(lc)} viewerKey={viewerKey} canSave={viewerKey!=='visitor'} canEdit={viewer.role==='owner'}/></PracticeSession>;
}

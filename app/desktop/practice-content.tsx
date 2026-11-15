import {getHomePreview} from '@/lib/content-drafts/preview';
import {practicePreviewData} from '@/lib/content-drafts/app-overlay';
import {PagePreview} from '@/components/content-drafts/page-preview';
import {PracticeSession} from '@/components/practice/session';
import {PracticeArena} from '@/components/practice/arena';
export async function PracticeContent({viewerKey,initialProblem,canEdit,interview=false}:{interview?:boolean;viewerKey:string;initialProblem?:number;canEdit:boolean}){
 const candidate=await getHomePreview();const preview=candidate?.appData?.question_notes?candidate:null;
 const first=preview?.operations.find(op=>['question_notes','practice_code','practice_stars'].includes(op.table));
 const selected=Number.isFinite(initialProblem)?initialProblem:first?Number(first.key):undefined;
 return <><PracticeSession viewerKey={viewerKey}><PracticeArena key={`${viewerKey}:${interview?`${preview?.id??"live"}:${selected}`:preview?.id??"live"}`} canSave={viewerKey!=='visitor'} singleProblem={interview} viewerKey={viewerKey} initialProblem={selected} canEdit={canEdit} previewData={preview?practicePreviewData(preview.appData!,preview.operations):undefined}/><PagePreview preview={preview} page={interview?`/interview/problems/${initialProblem}`:initialProblem?`/practices/${initialProblem}`:'/practices'}/></PracticeSession></>;
}

import {notFound} from 'next/navigation';
import {z} from 'zod';
import {getBehavioralData} from '@/lib/interview/behavioral-data';
import {BehavioralWorkspace} from '@/components/interview/behavioral';
import {PagePreview} from '@/components/content-drafts/page-preview';
export const dynamic='force-dynamic';
export default async function BehavioralPage({params}:{params:Promise<{path?:string[]}>}){
 const {path=[]}=await params;const data=await getBehavioralData();let themeId:string|undefined,questionId:string|undefined;
 const course=path.length===1&&path[0]==='course';
 if(path.length&&!course){if(path.length!==2)notFound();if(path[0]==='themes'){themeId=path[1];if(!data.error&&!data.themes.some(t=>t.id===themeId))notFound();}else if(path[0]==='questions'){questionId=path[1];if(!z.uuid().safeParse(questionId).success||!data.error&&![...data.questions,...data.custom].some(q=>q.id===questionId))notFound();}else notFound();}
 return <BehavioralWorkspace data={data} themeId={themeId} questionId={questionId} course={course}><PagePreview preview={data.preview} page={'/interview/behavioral'+(path.length?'/'+path.join('/'):'')}/></BehavioralWorkspace>;
}

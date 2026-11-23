import {notFound} from 'next/navigation';
import {getHomePreview} from '@/lib/content-drafts/preview';
import {getCompanyPage} from '@/lib/interview/companies-data';
import {getInterviewNotes} from '@/lib/interview/notes';
import {resolveCompanyQuestions} from '@/lib/interview/company-page';
import {getPrepContext} from '@/lib/interview/prep-data';
import {mostMentionedTopics,renderChips,resolvePrepLink} from '@/lib/interview/prep';
import {CompanyPage} from '@/components/interview/company-page';
import {PagePreview} from '@/components/content-drafts/page-preview';
export default async function CompanyDetailPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const preview=await getHomePreview();let data;
 try{data=await getCompanyPage(slug,preview);}catch{return <section className="iv-companies"><h1>Company unavailable</h1><p role="alert">Could not load this company. Please reload to retry.</p></section>;}
 if(!data)notFound();const notes=await getInterviewNotes();const ctx=await getPrepContext(!!preview?.companies);
 const topics=mostMentionedTopics(data.experiences).flatMap(l=>{const item=resolvePrepLink(l,ctx);return item?[{...item,count:l.count}]:[];});
 return <><CompanyPage {...data} company={{...data.company,overview:renderChips(data.company.overview,ctx)}} topics={topics} questions={resolveCompanyQuestions(data.questions,notes.notes.map(n=>({id:n.id,title:n.title})))} preview={!!preview?.companies}/><PagePreview preview={preview?.companies?preview:null} page={`/interview/companies/${encodeURIComponent(slug)}`}/></>;
}

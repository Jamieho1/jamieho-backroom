import {notFound} from 'next/navigation';
import {getHomePreview} from '@/lib/content-drafts/preview';
import {getCompanyPage,getPublicInterviewExperiences} from '@/lib/interview/companies-data';
import {relatedExperiences} from '@/lib/interview/experiences';
import {companyExperienceHref} from '@/lib/interview/company-page';
import {getPrepContext} from '@/lib/interview/prep-data';
import {renderChips,resolvePrepLinks} from '@/lib/interview/prep';
import {ExperienceDetail} from '@/components/interview/experience-detail';
import {PagePreview} from '@/components/content-drafts/page-preview';
export default async function InterviewExperiencePage({params}:{params:Promise<{slug:string;experience:string}>}){
 const {slug,experience:experienceSlug}=await params;const preview=await getHomePreview();let data,rows;
 try{data=await getCompanyPage(slug,preview);if(data)rows=await getPublicInterviewExperiences(preview);}catch{return <section className="iv-companies"><h1>Experience unavailable</h1><p role="alert">Could not load this interview experience. Please reload to retry.</p></section>;}
 const experience=data?.experiences.find(e=>e.slug===experienceSlug);if(!data||!experience)notFound();
 const ctx=await getPrepContext(!!preview?.companies);
 return <><ExperienceDetail company={data.company} companies={data.companies} experience={{...experience,body:renderChips(experience.body,ctx)}} related={relatedExperiences(experience,rows??[],data.companies)} prep={resolvePrepLinks(experience.prep_links,ctx)} preview={!!preview?.companies}/><PagePreview preview={preview?.companies?preview:null} page={companyExperienceHref(slug,experienceSlug)}/></>;
}

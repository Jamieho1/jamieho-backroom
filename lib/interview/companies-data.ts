import {createClient} from '@supabase/supabase-js';
import {readSupabaseEnv} from '@/lib/env';
import {companyDirectory,companySchema,companyQuestionSchema,interviewExperienceSchema,type DirectoryCompany} from './companies';
import type {HomePreview} from '@/lib/content-drafts/types';
/** Cookie-free live reader; owner previews are supplied only by getHomePreview. */
export async function getCompanies(preview?:HomePreview|null):Promise<DirectoryCompany[]>{
 if(preview?.companies)return companyDirectory(preview.companies.companies,preview.companies.company_questions);
 const env=readSupabaseEnv();if(!env)return [];
 const sb=createClient(env.url,env.anonKey,{auth:{persistSession:false}});
 const [c,q]=await Promise.all([sb.from('companies').select('id,slug,name,logo_path,overview,sort,public').eq('public',true),sb.from('company_questions').select('id,company_id,kind,section,question_ref,rank,public').eq('public',true)]);
 if(c.error||q.error)throw Error('Could not load companies. Please reload to retry.');
 return companyDirectory((c.data??[]).map(r=>companySchema.parse(r)),(q.data??[]).map(r=>companyQuestionSchema.parse(r)));
}

export async function getCompanyPage(slug:string,preview?:HomePreview|null){
 const companies=await getCompanies(preview);const company=companies.find(c=>c.slug===slug);if(!company)return null;
 if(preview?.companies)return {company,companies,questions:preview.companies.company_questions.filter(q=>q.company_id===company.id&&q.public),experiences:preview.companies.interview_experiences.filter(e=>e.company_id===company.id&&e.published)};
 const env=readSupabaseEnv();if(!env)return null;const sb=createClient(env.url,env.anonKey,{auth:{persistSession:false}});
 const [q,e]=await Promise.all([sb.from('company_questions').select('*').eq('company_id',company.id).eq('public',true),sb.from('interview_experiences').select('*').eq('company_id',company.id).eq('published',true)]);
 if(q.error||e.error)throw Error('Could not load this company. Please reload to retry.');
 return {company,companies,questions:(q.data??[]).map(q=>companyQuestionSchema.parse(q)),experiences:(e.data??[]).map(e=>interviewExperienceSchema.parse(e))};
}

/** Public shared stories only; filter parent publication before returning related content. */
export async function getPublicInterviewExperiences(preview?:HomePreview|null){
 if(preview?.companies){const ids=new Set(preview.companies.companies.filter(c=>c.public).map(c=>c.id));return preview.companies.interview_experiences.filter(e=>e.published&&ids.has(e.company_id));}
 const env=readSupabaseEnv();if(!env)return [];const sb=createClient(env.url,env.anonKey,{auth:{persistSession:false}});
 const {data,error}=await sb.from('interview_experiences').select('*').eq('published',true);
 if(error)throw Error('Could not load interview experiences. Please reload to retry.');return (data??[]).map(e=>interviewExperienceSchema.parse(e));
}

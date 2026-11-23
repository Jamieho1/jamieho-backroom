import {createClient} from '@supabase/supabase-js';
import {readSupabaseEnv} from '@/lib/env';
import {companyDirectory,companySchema,companyQuestionSchema,type DirectoryCompany} from './companies';
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

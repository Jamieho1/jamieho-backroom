import type {SupabaseClient} from '@supabase/supabase-js';
import {resumeDocumentSchema,templateFields,type ResumeTemplate} from '@/lib/resume';
import type {ContentOperation} from './allowlist';
export async function loadTemplatePreview(sb:SupabaseClient,operations:ContentOperation[]):Promise<ResumeTemplate|undefined>{
 const ops=operations.filter(op=>op.table==='resume_templates');if(!ops.length)return;
 const {data,error}=await sb.from('resume_templates').select('key,title,content').eq('key','default').maybeSingle();if(error||!data)throw Error('Resume template unavailable.');
 let row:ResumeTemplate={...data,content:resumeDocumentSchema.parse(data.content)};
 for(const op of ops)if(op.table==='resume_templates'){row={...row,...op.fields,draftChanged:true};templateFields.title.parse(row.title);resumeDocumentSchema.parse(row.content);}
 return row;
}

import {z} from 'zod';
import {companyExperienceHref} from '@/lib/interview/company-page';
import type {SupabaseClient} from '@supabase/supabase-js';
import {companyFields,companyQuestionFields,experienceFields,referenceInput,companySchemas,companyDefaults,COMPANY_TABLES,isCompanyTable,validCompanyReference,type Company,type CompanyQuestion,type InterviewExperience} from '@/lib/interview/companies';
import type {ContentOperation} from './allowlist';
export const COMPANY_ALLOWLIST={
 companies:{key:z.uuid(),fields:companyFields,operations:['insert','update','delete'] as const,routes:['/interview/companies'] as const},
 company_questions:{key:z.uuid(),fields:{...companyQuestionFields,question_ref:referenceInput},operations:['insert','update','delete'] as const,routes:['/interview/companies'] as const},
 interview_experiences:{key:z.uuid(),fields:experienceFields,operations:['insert','update','delete'] as const,routes:['/interview/companies'] as const},
};
export function companyOperation(table:keyof typeof COMPANY_ALLOWLIST){
 const entry=COMPANY_ALLOWLIST[table];return z.object({table:z.literal(table),op:z.enum(entry.operations),key:z.uuid(),fields:z.object(entry.fields).partial().strict().default({})}).strict().superRefine((v,ctx)=>{
  if(v.op==='delete'){if(Object.keys(v.fields).length)ctx.addIssue({code:'custom',message:'Delete accepts no fields; it unpublishes.'});return;}
  if(!Object.keys(v.fields).length)ctx.addIssue({code:'custom',message:'Choose at least one editable field.'});
  const required=table==='companies'?['slug','name']:table==='company_questions'?['company_id','kind','section','question_ref']:['company_id','slug','title','role'];
  if(v.op==='insert')for(const key of required)if(!(key in v.fields))ctx.addIssue({code:'custom',message:`Insert requires ${key}.`});
 });
}
export interface CompaniesPreview{companies:Company[];company_questions:CompanyQuestion[];interview_experiences:InterviewExperience[]}
export function overlayCompanies(live:CompaniesPreview,operations:ContentOperation[],notes:readonly string[]=[]):CompaniesPreview{
 const result=structuredClone(live);
 for(const op of operations){if(!isCompanyTable(op.table))continue;const table=op.table;const rows=result[table] as unknown as Record<string,unknown>[];const i=rows.findIndex(r=>r.id===op.key);const old=rows[i];
  if(op.op==='insert'?!!old:!old)throw Error('Company content target is missing or already exists.');
  const next=op.op==='delete'?{...old,[table==='interview_experiences'?'published':'public']:false}:{...(old??{id:op.key,...companyDefaults[table]}),...op.fields};
  const row=companySchemas[table].parse(next);const candidate={...row,draftChanged:true};
  if('slug' in row&&rows.some(r=>r.id!==row.id&&r.slug===row.slug&&(table==='companies'||r.company_id===('company_id' in row?row.company_id:null))))throw Error('Company content slug is already in use.');
  if(i<0)rows.push(candidate);else rows[i]=candidate;
 }
 for(const q of result.company_questions){if(!result.companies.some(c=>c.id===q.company_id))throw Error('Choose an existing company.');if(!validCompanyReference(q.question_ref,q.kind,notes))throw Error('Choose an existing practice problem or note topic for this kind.');}
 for(const e of result.interview_experiences)if(!result.companies.some(c=>c.id===e.company_id))throw Error('Choose an existing company.');
 for(const op of operations)if(isCompanyTable(op.table)&&op.table!=='companies'){
  const child=(result[op.table] as {id:string;company_id:string}[]).find(r=>r.id===op.key);const company=result.companies.find(c=>c.id===child?.company_id);if(company)company.draftChanged=true;
 }
 return result;
}
/** Call only after the verified-owner gate. */
export async function loadCompaniesPreview(sb:SupabaseClient,operations:ContentOperation[]):Promise<CompaniesPreview|undefined>{
 if(!operations.some(op=>isCompanyTable(op.table)))return;
 const rows=await Promise.all(COMPANY_TABLES.map(t=>sb.from(t).select('*')));const notes=await sb.from('notes').select('id');if(rows.some(r=>r.error)||notes.error)throw Error('Could not load company draft targets.');
 return overlayCompanies(Object.fromEntries(COMPANY_TABLES.map((t,i)=>[t,rows[i].data??[]])) as unknown as CompaniesPreview,operations,(notes.data??[]).map(n=>n.id));
}
export function companyTargets(ops:ContentOperation[],snapshot?:CompaniesPreview){return ops.some(o=>isCompanyTable(o.table))?[{href:'/interview/companies',label:'Preview Companies'},...(snapshot?.companies.filter(c=>c.public&&c.draftChanged).map(c=>({href:'/interview/companies/'+encodeURIComponent(c.slug),label:'Preview '+c.name}))??[]),...(snapshot?.interview_experiences.filter(e=>e.published&&e.draftChanged).flatMap(e=>{const c=snapshot.companies.find(c=>c.id===e.company_id&&c.public);return c?[{href:companyExperienceHref(c.slug,e.slug),label:'Preview '+e.title}]:[];})??[])]:[];}

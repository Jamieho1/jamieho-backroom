import {z} from 'zod';
import {PRACTICE_ANCHORS as PRACTICE_LIST} from '@/lib/notes/neetcode150';
import {TOPICS} from '@/lib/notes/topics';
const text=(max:number)=>z.string().refine(s=>!s.includes('\0')&&Array.from(s).length<=max,`Text must be at most ${max} characters.`);
const required=(max:number)=>text(max).refine(s=>!!s.trim(),'Text cannot be blank.');
const integer=z.number().int().min(-2147483648).max(2147483647);
const slug=text(80).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);
export const companyFields={slug,name:required(160),logo_path:z.union([z.literal(''),text(240).regex(/^[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*\.(?:png|jpg|jpeg|webp|svg)$/)]),overview:text(50000),sort:integer,public:z.boolean()};
export const companyQuestionFields={company_id:z.uuid(),kind:z.enum(['coding','system_design','low_level_design']),section:required(80),question_ref:required(80),rank:integer,public:z.boolean()};
export const experienceFields={company_id:z.uuid(),slug,title:required(200),level:z.enum(['Junior','Mid','Senior','Staff','Other']),role:required(160),interview_date:z.union([z.literal(''),z.string().regex(/^[0-9]{4}-(0[1-9]|1[0-2])$/)]),region:text(160),body:text(50000),published:z.boolean(),published_at:z.iso.datetime({offset:true}).nullable()};
export const companySchema=z.object({id:z.uuid(),...companyFields});
export const companyQuestionSchema=z.object({id:z.uuid(),...companyQuestionFields});
export const interviewExperienceSchema=z.object({id:z.uuid(),...experienceFields});
export type Company=z.infer<typeof companySchema>&{draftChanged?:boolean};
export type CompanyQuestion=z.infer<typeof companyQuestionSchema>&{draftChanged?:boolean};
export type InterviewExperience=z.infer<typeof interviewExperienceSchema>&{draftChanged?:boolean};
export type DirectoryCompany=Company&{questionCount:number};
export const COMPANY_TABLES=['companies','company_questions','interview_experiences'] as const;
export type CompanyTable=typeof COMPANY_TABLES[number];
export const isCompanyTable=(s:string):s is CompanyTable=>COMPANY_TABLES.some(t=>t===s);
export const companySchemas={companies:companySchema,company_questions:companyQuestionSchema,interview_experiences:interviewExperienceSchema};
export const companyDefaults={companies:{logo_path:'',overview:'',sort:100,public:false},company_questions:{rank:100,public:false},interview_experiences:{level:'Other',interview_date:'',region:'',body:'',published:false,published_at:null}};
export const companyHref=(slug:string)=>`/interview/companies/${encodeURIComponent(slug)}`;
export function validCompanyReference(ref:string,kind?:string,notes:readonly string[]=[]):boolean {
 const problem=PRACTICE_LIST.find(p=>String(p.lc)===ref);
 if(problem)return !kind||kind==='coding'&&problem.topic!=='class-design'||kind==='low_level_design'&&problem.topic==='class-design';
 if(kind==='coding')return false;
 if(kind==='system_design')return ref.startsWith('sd-')&&notes.includes(ref);
 if(kind==='low_level_design')return ref==='class-design';
 return TOPICS.some(t=>t.id===ref)||notes.includes(ref);
}
/** Notes outside the fixed taxonomy are verified against the owner's database snapshot before preview/approval. */
export const referenceInput=required(80).refine(s=>PRACTICE_LIST.some(p=>String(p.lc)===s)||TOPICS.some(t=>t.id===s)||/^sd-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s),'Choose an existing practice problem or note topic.');
export function companyDirectory(companies:readonly Company[],questions:readonly CompanyQuestion[]):DirectoryCompany[]{
 const counts=new Map<string,number>();for(const q of questions)if(q.public)counts.set(q.company_id,(counts.get(q.company_id)??0)+1);
 return companies.filter(c=>c.public).map(c=>({...c,questionCount:counts.get(c.id)??0}));
}
export function filterCompanies(rows:readonly DirectoryCompany[],search:string,sort:'az'|'questions'):DirectoryCompany[]{
 const query=search.trim().toLocaleLowerCase('en');return rows.filter(c=>c.name.toLocaleLowerCase('en').includes(query)).sort((a,b)=>(sort==='questions'?b.questionCount-a.questionCount:0)||a.name.localeCompare(b.name,'en')||a.id.localeCompare(b.id));
}
const MONOGRAM_COLOURS=['#4765a0','#627344','#945b43','#70518d','#397b7e','#916637'];
export function companyMonogram(name:string){const words=name.trim().split(/\s+/u).filter(Boolean);let hash=0;for(const c of name)hash=(Math.imul(hash,31)+c.codePointAt(0)!)>>>0;return {letters:words.slice(0,2).map(w=>Array.from(w)[0]).join('').toLocaleUpperCase('en')||'?',color:MONOGRAM_COLOURS[hash%MONOGRAM_COLOURS.length]};}

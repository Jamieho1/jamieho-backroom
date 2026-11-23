import {filterExperiences} from './experiences';
import {PRACTICE_ANCHORS} from '@/lib/notes/neetcode150';
import {TOPICS,type TopicId} from '@/lib/notes/topics';
import {companyHref,type CompanyQuestion,type InterviewExperience} from './companies';
import {interviewProblemHref,noteHref} from './content';
export const COMPANY_TABS=[{id:'overview',label:'Overview'},{id:'coding',label:'Coding'},{id:'system-design',label:'System Design'},{id:'low-level-design',label:'Low-Level Design'},{id:'experiences',label:'Interview Experiences'}] as const;
export type CompanyTab=typeof COMPANY_TABS[number]['id'];
export type CompanyStatus='all'|'todo'|'done'|'flagged';
export function companyTab(input:unknown):CompanyTab{return COMPANY_TABS.some(t=>t.id===input)?input as CompanyTab:'overview';}
export function companyTabHref(slug:string,tab:CompanyTab,params=''){const query=new URLSearchParams(params);query.set('tab',tab);return companyHref(slug)+'?'+query.toString();}
export interface CompanyQuestionView extends CompanyQuestion{title:string;href:string;topic:TopicId|'system-design';colour:string;difficulty?:string;problem?:number}
export function resolveCompanyQuestions(rows:readonly CompanyQuestion[],notes:readonly {id:string;title:string}[]=[]):CompanyQuestionView[]{return rows.filter(q=>q.public).flatMap(q=>{
 const problem=PRACTICE_ANCHORS.find(p=>String(p.lc)===q.question_ref);const topic=problem?.topic??(q.kind==='low_level_design'?'class-design':'system-design');
 if(!problem&&q.kind==='coding')return [];
 const title=problem?.title??notes.find(n=>n.id===q.question_ref)?.title??q.question_ref.replace(/^sd-/,'').split('-').map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(' ');
 return [{...q,title,topic,colour:TOPICS.find(t=>t.id===topic)?.dot??'#F54E00',href:problem?interviewProblemHref(problem.lc):noteHref(q.question_ref),...(problem?{problem:problem.lc,difficulty:problem.difficulty}:{})}];
});}
export function filterCompanyQuestions(rows:readonly CompanyQuestionView[],search:string,status:CompanyStatus,flags:ReadonlySet<number>,done:ReadonlySet<number>){const term=search.trim().toLowerCase();return rows.filter(q=>`${q.title} ${q.section} ${q.difficulty??''} ${q.question_ref}`.toLowerCase().includes(term)&&(status==='all'||status==='todo'&&(!q.problem||!done.has(q.problem))||status==='done'&&!!q.problem&&done.has(q.problem)||status==='flagged'&&!!q.problem&&flags.has(q.problem))).sort((a,b)=>a.rank-b.rank||a.title.localeCompare(b.title,'en')||a.id.localeCompare(b.id));}
export function groupCompanyQuestions(rows:readonly CompanyQuestionView[]){const groups=new Map<string,CompanyQuestionView[]>();for(const row of [...rows].sort((a,b)=>a.rank-b.rank||a.title.localeCompare(b.title,'en')||a.id.localeCompare(b.id))){const key=row.section;const group=groups.get(key)??[];group.push(row);groups.set(key,group);}return [...groups].map(([section,questions])=>({section,questions}));}
export function latestCompanyExperiences(rows:readonly InterviewExperience[],search='',limit=3){return filterExperiences(rows,search).slice(0,limit);}
export const companyExperienceHref=(slug:string,experience:string)=>`${companyHref(slug)}/experiences/${encodeURIComponent(experience)}`;

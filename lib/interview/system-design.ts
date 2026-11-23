import {z} from 'zod';
import {diagramSchema,type ProjectDiagram} from '@/lib/project-diagram';

/** S1: system-design questions (solution Markdown, quiz, whiteboard steps). Own-words content only; no runtime AI. */
const text=(max:number)=>z.string().refine(s=>!s.includes('\0')&&Array.from(s).length<=max,`Text must be at most ${max} characters.`);
const required=(max:number)=>text(max).refine(s=>!!s.trim(),'Text cannot be blank.');
const integer=z.number().int().min(-2147483648).max(2147483647);
const slug=text(80).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);
export const SD_LIMITS={solution:100000,quiz:40,steps:12,question:500,option:300,explanation:1000} as const;

export const quizItemSchema=z.object({q:required(SD_LIMITS.question),options:z.array(required(SD_LIMITS.option)).length(4),answer:z.number().int().min(0).max(3),explanation:text(SD_LIMITS.explanation)}).strict();
export type QuizItem=z.infer<typeof quizItemSchema>;
/** S3 fills the step contents; S1 only stores them, so each step needs a stable id and title and may carry more. */
export const stepSchema=z.looseObject({id:z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).max(40),title:required(120)});
export type SdStep=z.infer<typeof stepSchema>;

export const questionFields={slug,title:required(200),icon:text(40).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),topic:text(80),note_ref:z.union([z.literal(''),text(80).regex(/^sd-[a-z0-9]+(-[a-z0-9]+)*$/)]),solution:text(SD_LIMITS.solution),quiz:z.array(quizItemSchema).max(SD_LIMITS.quiz),steps:z.array(stepSchema).max(SD_LIMITS.steps),sort:integer,public:z.boolean()};
export const questionSchema=z.object({id:z.uuid(),...questionFields});
export type SdQuestion=z.infer<typeof questionSchema>;
export const sdQuestionDefaults={icon:'system-design',topic:'',note_ref:'',solution:'',quiz:[],steps:[],sort:100,public:false};
export type SdListItem=Pick<SdQuestion,'id'|'slug'|'title'|'icon'|'sort'|'topic'|'note_ref'>;
export const SD_TABLE='system_design_questions';
export const sdHref=(slug:string,tab?:SdTab)=>`/interview/system-design/${encodeURIComponent(slug)}${tab&&tab!=='solution'?`?tab=${tab}`:''}`;
export const SD_LIST_HREF='/interview/system-design/practice';
/** Section slugs that belong to the existing list/notes routes and can never be a question slug. */
export const SD_RESERVED_SLUGS=['practice','notes'] as const;

export const SD_TABS=[{id:'solution',label:'Solution'},{id:'quiz',label:'Quiz'},{id:'whiteboard',label:'Whiteboard'}] as const;
export type SdTab=typeof SD_TABS[number]['id'];
export const sdTab=(input:unknown):SdTab=>SD_TABS.some(t=>t.id===input)?input as SdTab:'solution';

/** Agreed solution section order, for authors and tests; headings outside this list still render. */
export const SOLUTION_SECTIONS=['Overview','Requirements','Data Model','API Design','Key Questions','Basic design','Advanced design','Main flows','Additional discussion points'] as const;

// ---- Table of contents -------------------------------------------------------------------------------------------
export interface TocItem{id:string;text:string}
const FENCE=/^ {0,3}(`{3,}|~{3,})/;
/** Plain text of an inline-Markdown heading: links, emphasis and code marks removed. */
export function plainHeading(raw:string):string{return raw.replace(/\[([^\]]*)\]\([^)]*\)/g,'$1').replace(/[`*_~]/g,'').replace(/\s+#+\s*$/,'').replace(/\s+/g,' ').trim();}
export function headingSlug(value:string):string{return value.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g,'').replace(/[^\p{L}\p{N}]+/gu,'-').replace(/^-+|-+$/g,'')||'section';}
/** ids for each `##` heading outside fenced code, unique within the page (-2, -3 suffixes). */
export function tocFromMarkdown(markdown:string):TocItem[]{
 const items:TocItem[]=[];const used=new Map<string,number>();let fence:string|null=null;
 for(const line of markdown.split(/\r?\n/)){
  const f=FENCE.exec(line);
  if(fence){if(f&&f[1][0]===fence[0]&&f[1].length>=fence.length&&line.trim()===f[1])fence=null;continue;}
  if(f){fence=f[1];continue;}
  const m=/^ {0,3}##(?!#)\s+(.+?)\s*$/.exec(line);if(!m)continue;
  const label=plainHeading(m[1]);if(!label)continue;
  const base=headingSlug(label);const n=(used.get(base)??0)+1;used.set(base,n);
  items.push({id:n===1?base:`${base}-${n}`,text:label});
 }
 return items;
}

// ---- Solution blocks ---------------------------------------------------------------------------------------------
export const tableSchemaSchema=z.object({
 table:required(60),note:text(200).optional(),
 columns:z.array(z.object({name:required(60),type:required(40),pk:z.boolean().optional(),note:text(120).optional()}).strict()).min(1).max(30),
}).strict();
export type TableSchema=z.infer<typeof tableSchemaSchema>;
export type TableSchemaResult={ok:true;schema:TableSchema}|{ok:false;message:string};
export function parseTableSchema(raw:string):TableSchemaResult{
 let value:unknown;try{value=JSON.parse(raw);}catch{return {ok:false,message:'Table schema is not valid JSON.'};}
 const parsed=tableSchemaSchema.safeParse(value);
 if(!parsed.success)return {ok:false,message:'Table schema needs a table name and columns with name and type.'};
 const names=parsed.data.columns.map(c=>c.name.toLowerCase());
 if(new Set(names).size!==names.length)return {ok:false,message:'Table schema column names must be unique.'};
 return {ok:true,schema:parsed.data};
}
export type SolutionBlock={kind:'markdown';text:string}|{kind:'table-schema';result:TableSchemaResult}|{kind:'diagram';diagram:ProjectDiagram|null;message?:string};
/** Splits the body at ```table-schema and ```diagram fences; every other fence stays inside the Markdown segments. */
export function splitSolution(markdown:string):SolutionBlock[]{
 const blocks:SolutionBlock[]=[];let buffer:string[]=[];
 const flush=()=>{if(buffer.some(l=>l.trim()))blocks.push({kind:'markdown',text:buffer.join('\n')});buffer=[];};
 const lines=markdown.split(/\r?\n/);
 for(let i=0;i<lines.length;i++){
  const open=/^ {0,3}(`{3,}|~{3,})\s*([A-Za-z0-9_-]*)\s*$/.exec(lines[i]);
  if(!open){buffer.push(lines[i]);continue;}
  const body:string[]=[];let j=i+1;let closed=false;
  for(;j<lines.length;j++){if(lines[j].trim()===open[1]||(lines[j].trim().startsWith(open[1][0].repeat(open[1].length))&&/^[`~]+$/.test(lines[j].trim()))){closed=true;break;}body.push(lines[j]);}
  const kind=open[2].toLowerCase();
  if(kind==='table-schema'||kind==='diagram'){
   flush();
   if(kind==='table-schema')blocks.push({kind:'table-schema',result:parseTableSchema(body.join('\n'))});
   else{let value:unknown;let message:string|undefined;try{value=JSON.parse(body.join('\n'));}catch{message='Diagram is not valid JSON.';}
    const parsed=message?null:diagramSchema.safeParse(value);if(parsed&&!parsed.success)message='Diagram data is not valid.';
    blocks.push({kind:'diagram',diagram:parsed&&parsed.success?parsed.data:null,message});}
   i=closed?j:lines.length;continue;
  }
  buffer.push(...lines.slice(i,closed?j+1:lines.length));i=closed?j:lines.length;
 }
 flush();return blocks;
}

// ---- Quiz --------------------------------------------------------------------------------------------------------
/** A pick is an option index 0-3, or null for "Don't know" (always counted wrong). */
export type QuizPick=number|null;
export interface QuizScore{score:number;total:number;percent:number;wrong:{index:number;picked:QuizPick}[]}
export function scoreQuiz(items:readonly QuizItem[],picks:readonly QuizPick[]):QuizScore{
 let score=0;const wrong:QuizScore['wrong']=[];
 items.forEach((item,index)=>{const picked=picks[index]??null;if(picked!==null&&picked===item.answer)score++;else wrong.push({index,picked:picked!==null&&Number.isInteger(picked)&&picked>=0&&picked<=3?picked:null});});
 return {score,total:items.length,percent:items.length?Math.round(score/items.length*100):0,wrong};
}
export const picksSchema=z.array(z.number().int().min(0).max(3).nullable()).max(SD_LIMITS.quiz);
export interface QuizAttempt{id:string;score:number;total:number;created_at:string}
export const QUIZ_STORAGE_PREFIX='jb.sd.quiz.v1.';
export const MAX_LOCAL_ATTEMPTS=20;
export function parseLocalAttempts(raw:string|null):QuizAttempt[]{
 if(!raw)return [];let value:unknown;try{value=JSON.parse(raw);}catch{return [];}
 const parsed=z.array(z.object({id:z.string().max(80),score:z.number().int().min(0).max(SD_LIMITS.quiz),total:z.number().int().min(1).max(SD_LIMITS.quiz),created_at:z.string().max(40)})).safeParse(value);
 return parsed.success?parsed.data.filter(a=>a.score<=a.total&&!Number.isNaN(Date.parse(a.created_at))).slice(0,MAX_LOCAL_ATTEMPTS):[];
}
export const addLocalAttempt=(existing:readonly QuizAttempt[],attempt:QuizAttempt)=>[attempt,...existing].slice(0,MAX_LOCAL_ATTEMPTS);
export function formatAttemptDate(iso:string){const d=new Date(iso);return Number.isNaN(d.getTime())?'':d.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});}

import {noteHref,interviewProblemHref} from '@/lib/interview/content';
import type {SupabaseClient} from '@supabase/supabase-js';
import {validateNoteEdit,type NoteRow} from '@/lib/notes';
import {validCode,validProblem,type PracticeData} from '@/lib/practice/data';
import {storySchema,type Story} from '@/lib/behavioral';
import {answerSchema,type Answer} from '@/lib/behavioral/answers';
import {APP_ALLOWLIST,isAppTable,type AppTable} from './app-allowlist';
import type {ContentOperation} from './allowlist';
export interface AppRows {
 notes:NoteRow[];question_notes:{problem:number;body:string;updated_at:string;draftChanged?:boolean}[];
 practice_code:{problem:number;code:string;updated_at:string;draftChanged?:boolean}[];
 practice_stars:{problem:number;created_at:string;draftChanged?:boolean}[];
 behavioral_stories:Story[];behavioral_answers:Answer[];
}
export type AppPreview=Partial<AppRows>;
export interface PracticePreview {notes:NonNullable<AppPreview['question_notes']>;code:NonNullable<AppPreview['practice_code']>;stars:number[];changedStars:number[]}
export function practicePreviewData(preview:AppPreview,operations:ContentOperation[]):PracticePreview {
 return {notes:preview.question_notes??[],code:preview.practice_code??[],stars:(preview.practice_stars??[]).map(s=>s.problem),changedStars:operations.filter(op=>op.table==='practice_stars').map(op=>Number(op.key))};
}
export function practiceData(preview:PracticePreview,problem:number):PracticeData {
 return {note:preview.notes.find(n=>n.problem===problem)?.body??'',code:preview.code.find(c=>c.problem===problem)?.code??null,attempts:[]};
}
export const appKey=(table:AppTable,row:Record<string,unknown>)=>String(row[table==='notes'||table==='behavioral_stories'?'id':table==='behavioral_answers'?'question_id':'problem']);
/** Owner-managed tables have no per-user identity columns; callers must verify owner before loading. */
export function overlayApp<T extends AppTable>(table:T,live:AppRows[T],operations:ContentOperation[],stamp='1970-01-01T00:00:00.000Z'):AppRows[T]{
 const rows=new Map<string,Record<string,unknown>>(live.map(row=>{const copy={...structuredClone(row)};return [appKey(table,copy),copy];}));
 for(const op of operations){
  if(op.table!==table)continue;
  const key=String(op.key),old=rows.get(key);
  if(op.op==='insert'&&old)throw Error(`${table}: insert key already exists.`);
  if(op.op!=='insert'&&!old)throw Error(`${table}: target no longer exists.`);
  if(op.op==='delete'){rows.delete(key);continue;}
  const defaults=table==='behavioral_stories'?{id:op.key,bullet_id:null,situation:'',task:'',action:'',result:'',skills:'',numbers:''}
   :table==='behavioral_answers'?{question_id:op.key,primary_story_id:null,secondary_story_id:null,outline:'',followups:''}
   :{problem:op.key,created_at:stamp};
  const next:Record<string,unknown>={...(old??defaults),...op.fields,updated_at:stamp};
  if(table==='notes'&&validateNoteEdit(op.key,next))throw Error('Invalid note text.');
  if(table==='practice_code'&&(!validProblem(op.key)||!validCode(next.code)))throw Error('Invalid practice code.');
  if(table==='behavioral_stories'){
   const parsed=storySchema.safeParse(next);if(!parsed.success)throw Error('Invalid story fields.');Object.assign(next,parsed.data);
  }
  if(table==='behavioral_answers'){
   const parsed=answerSchema.safeParse(next);if(!parsed.success)throw Error('Invalid answer fields or duplicate story mappings.');Object.assign(next,parsed.data);
  }
  rows.set(key,{...next,draftChanged:true});
 }
 return [...rows.values()] as unknown as AppRows[T];
}
export async function loadAppPreview(sb:SupabaseClient,operations:ContentOperation[]):Promise<AppPreview>{
 const tables=new Set(operations.filter(op=>isAppTable(op.table)).map(op=>op.table as AppTable));
 // Practice preview replaces its complete owner view, preventing async live reads from overwriting it.
 if(['question_notes','practice_code','practice_stars'].some(t=>tables.has(t as AppTable)))for(const t of ['question_notes','practice_code','practice_stars'] as const)tables.add(t);
 const result:AppPreview={};const stamp=new Date().toISOString();
 for(const table of tables){const {data,error}=await sb.from(table).select('*');if(error)throw Error(`Could not load ${table} for draft validation.`);Object.assign(result,{[table]:overlayApp(table,data??[],operations,stamp)});}
 return result;
}
export function appTargets(operations:ContentOperation[]):{href:string;label:string}[]{
 const targets:{href:string;label:string}[]=[];
 for(const op of operations){
  if(op.table==='notes')targets.push({href:noteHref(String(op.key)),label:'Preview Notes'});
  else if(op.table==='question_notes'||op.table==='practice_code'||op.table==='practice_stars')targets.push({href:interviewProblemHref(op.key),label:`Preview problem ${op.key}`});
  else if(op.table==='behavioral_stories'||op.table==='behavioral_answers')targets.push({href:'/behavioral',label:'Preview Resume & Stories'});
 }
 return targets.filter((t,i,a)=>a.findIndex(x=>x.href===t.href)===i);
}

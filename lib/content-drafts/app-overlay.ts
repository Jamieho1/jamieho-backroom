import type {SupabaseClient} from '@supabase/supabase-js';
import {storySchema,type Story,answerSchema,type Answer} from '@/lib/behavioral';
import {APP_ALLOWLIST,isAppTable,type AppTable} from './app-allowlist';
import type {ContentOperation} from './allowlist';
export interface AppRows {behavioral_stories:Story[];behavioral_answers:Answer[]}
export type AppPreview=Partial<AppRows>;
export const appKey=(table:AppTable,row:Record<string,unknown>)=>String(row[table==='behavioral_stories'?'id':'question_id']);
/** Callers verify the owner. Only the personal-site legacy owner tables remain; PassLoop tables are not drafted here. */
export function overlayApp<T extends AppTable>(table:T,live:AppRows[T],operations:ContentOperation[],stamp='1970-01-01T00:00:00.000Z'):AppRows[T]{
 const rows=new Map<string,Record<string,unknown>>(live.map(row=>{const copy={...structuredClone(row)};return [appKey(table,copy),copy];}));
 for(const op of operations){
  if(op.table!==table)continue;
  const key=String(op.key),old=rows.get(key);
  if(op.op==='insert'&&old)throw Error(`${table}: insert key already exists.`);
  if(op.op!=='insert'&&!old)throw Error(`${table}: target no longer exists.`);
  const defaults=table==='behavioral_stories'?{id:op.key,bullet_id:null,situation:'',task:'',action:'',result:'',skills:'',numbers:''}
   :{question_id:op.key,primary_story_id:null,secondary_story_id:null,outline:'',followups:''};
  const next:Record<string,unknown>={...(old??defaults),...op.fields,updated_at:stamp};
  if(table==='behavioral_stories'){
   const parsed=storySchema.safeParse(next);if(!parsed.success)throw Error('Invalid story fields.');Object.assign(next,parsed.data);
  }else{
   const parsed=answerSchema.safeParse(next);if(!parsed.success)throw Error('Invalid answer fields or duplicate story mappings.');Object.assign(next,parsed.data);
  }
  rows.set(key,{...next,draftChanged:true});
 }
 return [...rows.values()] as unknown as AppRows[T];
}
export async function loadAppPreview(sb:SupabaseClient,operations:ContentOperation[]):Promise<AppPreview>{
 const tables=new Set(operations.filter(op=>isAppTable(op.table)).map(op=>op.table as AppTable));
 const result:AppPreview={};const stamp=new Date().toISOString();
 for(const table of tables){const {data,error}=await sb.from(table).select('*');if(error)throw Error(`Could not load ${table} for draft validation.`);Object.assign(result,{[table]:overlayApp(table,(data??[]) as never,operations,stamp)});}
 return result;
}

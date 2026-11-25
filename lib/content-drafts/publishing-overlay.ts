import {isPublishingTable,publishingSchemas,type PublishingTable,type ContentOperation} from './allowlist';
import type {Project} from '@/lib/portfolio-core';
import type {Article} from '@/lib/articles';
import type {Guide} from '@/lib/guides';
import type {SeriesRow} from '@/lib/content-series-data';
import type {SupabaseClient} from '@supabase/supabase-js';
export interface PublishingRows {projects:Project[];articles:Article[];guides:Guide[];content_series:SeriesRow[]}
export type PublishingPreview=Partial<PublishingRows>;
const defaults={
 projects:{tagline:'',body:'',tags:[],screenshots:[],capabilities:[],status:'',diagram:null,url:'',featured:false,public:false,sort:100},
 articles:{summary:'',body:'',platform:'other',category:'ai',source_url:'',cover_url:'',project_id:null,series_id:null,series_part:null,code:null,takeaway:'',slides:[],published:false},
 guides:{summary:'',body:'',notion_url:'',doc_url:'',cover_url:'',series_id:null,series_part:null,audience:'',highlights:[],exercises:null,published:false},
 content_series:{goal:'',topic:'ai',planned_parts:1,sort:100,published:false},
};
/** Validate the final merged row with the editor schema; compose only a cloned owner snapshot. */
export function overlayPublishing<T extends PublishingTable>(table:T, live:PublishingRows[T],operations:ContentOperation[],date='1970-01-01T00:00:00.000Z'):PublishingRows[T] {
 const rows=new Map<string,Record<string,unknown>>(live.map(row=>[row.id,{...structuredClone(row)}]));
 for(const operation of operations){
  if(operation.table!==table)continue;
  const old=rows.get(operation.key);
  if(operation.op==='insert'&&old)throw Error(`${table}: insert key already exists.`);
  if(operation.op!=='insert'&&!old)throw Error(`${table}: target no longer exists.`);
  if(operation.op==='delete'){rows.set(operation.key,{...old,[table==='projects'?'public':'published']:false,updated_at:date,draftChanged:true});continue;}
  const candidate={...(old??{...defaults[table],id:operation.key,created_at:date,updated_at:date}),...operation.fields,updated_at:date};
  const parsed=publishingSchemas[table].safeParse(candidate);
  if(!parsed.success)throw Error(`Invalid ${table} row: ${parsed.error.issues.map(i=>i.message).join('; ')}`);
  if([...rows.values()].some(row=>row.id!==operation.key&&row.slug===parsed.data.slug))throw Error(`${table}: slug is already in use.`);
  // The database also enforces this (unique code) and, at approval, a part number used once per series across articles and guides.
  if(table==='articles'&&(parsed.data as {code?:string|null}).code&&[...rows.values()].some(row=>row.id!==operation.key&&row.code===(parsed.data as {code?:string|null}).code))throw Error('articles: code is already in use.');
  rows.set(operation.key,{...candidate,...parsed.data,draftChanged:true});
 }
 return [...rows.values()] as unknown as PublishingRows[T];
}
/** Called only after the owner gate, in preview or before approval. Raw rows include hidden targets. */
export async function loadPublishingPreview(sb:SupabaseClient,operations:ContentOperation[],snapshotTime = new Date().toISOString()):Promise<PublishingPreview>{
 const result:PublishingPreview={};
 for(const table of ['projects','articles','guides','content_series'] as const)if(operations.some(op=>op.table===table)){
  const {data,error}=await sb.from(table).select('*');if(error)throw Error(`Could not load ${table} for draft validation.`);
  Object.assign(result,{[table]:overlayPublishing(table,data??[],operations,snapshotTime)});
 }
 return result;
}
export function publishingTargets(operations:ContentOperation[]):{href:string;label:string}[]{
 // Posts, guides and series are previewed on the Content hub tabs; a series draft that names its slug also gets its own page.
 const tables=new Set(operations.map(op=>op.table).filter(isPublishingTable));
 const targets:{href:string;label:string}[]=[];
 if(tables.has('projects'))targets.push({href:'/projects',label:'Preview projects'},{href:'/',label:'Preview homepage'});
 if(tables.has('articles'))targets.push({href:'/content',label:'Preview Latest'});
 if(tables.has('content_series')){targets.push({href:'/content/series',label:'Preview Series'});
  for(const slug of new Set(operations.flatMap(op=>op.table==='content_series'&&'slug' in op.fields&&typeof op.fields.slug==='string'&&op.fields.slug?[op.fields.slug]:[])))targets.push({href:`/content/series/${encodeURIComponent(slug)}`,label:'Preview series page'});}
 if(tables.has('guides'))targets.push({href:'/content/guides',label:'Preview Free guides'});
 return targets;
}

import {createClient} from '@supabase/supabase-js';
import {readSupabaseEnv} from '@/lib/env';
import {questionSchema,SD_TABLE,type SdListItem,type SdQuestion} from './system-design';
const LIST_COLUMNS='id,slug,title,icon,sort,topic,note_ref';
const byOrder=(a:SdListItem,b:SdListItem)=>a.sort-b.sort||a.title.localeCompare(b.title,'en')||a.id.localeCompare(b.id);
/** Cookie-free reader of published questions. A database without the S1 migration reads as "no questions". */
export async function getSdQuestions():Promise<SdListItem[]>{
 const env=readSupabaseEnv();if(!env)return [];
 const sb=createClient(env.url,env.anonKey,{auth:{persistSession:false}});
 const {data,error}=await sb.from(SD_TABLE).select(LIST_COLUMNS).eq('public',true);
 if(error||!data)return [];
 return data.flatMap(r=>{const p=questionSchema.pick({id:true,slug:true,title:true,icon:true,sort:true,topic:true,note_ref:true}).safeParse(r);return p.success?[p.data]:[];}).sort(byOrder);
}
export async function getSdQuestion(slug:string):Promise<SdQuestion|null>{
 if(!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)||slug.length>80)return null;
 const env=readSupabaseEnv();if(!env)return null;
 const sb=createClient(env.url,env.anonKey,{auth:{persistSession:false}});
 const {data,error}=await sb.from(SD_TABLE).select('*').eq('public',true).eq('slug',slug).maybeSingle();
 if(error||!data)return null;
 const parsed=questionSchema.safeParse(data);return parsed.success?parsed.data:null;
}

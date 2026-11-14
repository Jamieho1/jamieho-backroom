import type {HomePreview} from './content-drafts/types';
import {createClient} from '@supabase/supabase-js';
import {readSupabaseEnv} from './env';
import {GUIDE_CARD_SELECT,GUIDE_SELECT,type Guide,type GuideCard} from './guides';
function publicClient(){const env=readSupabaseEnv();return env?createClient(env.url,env.anonKey,{auth:{persistSession:false}}):null;}
/** Cookie-free public reads (keeps /resources pre-rendered): drafts are excluded by both query and RLS. */
export async function getPublicGuides(preview?:HomePreview|null):Promise<GuideCard[]>{
 if(preview?.publishing?.guides)return preview.publishing.guides.filter(g=>g.published).sort((a,b)=>b.updated_at.localeCompare(a.updated_at));
 const sb=publicClient();if(!sb)return [];
 const {data,error}=await sb.from('guides').select(GUIDE_CARD_SELECT).eq('published',true).order('updated_at',{ascending:false});
 if(error)throw new Error('Guides unavailable');return (data??[]) as GuideCard[];
}
export async function getPublicGuide(slug:string,preview?:HomePreview|null):Promise<Guide|null>{
 if(preview?.publishing?.guides)return preview.publishing.guides.find(g=>g.slug===slug&&(g.published||g.draftChanged))??null;
 const sb=publicClient();if(!sb)return null;
 const {data,error}=await sb.from('guides').select(GUIDE_SELECT).eq('slug',slug).eq('published',true).maybeSingle();
 if(error)throw new Error('Guides unavailable');return data as Guide|null;
}

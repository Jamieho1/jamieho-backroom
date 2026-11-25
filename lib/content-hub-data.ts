import {cache} from 'react';
import {createClient} from '@supabase/supabase-js';
import {readSupabaseEnv} from './env';
import type {HomePreview} from './content-drafts/types';
import {newestFirst,toHubGuide,toHubPost,type HubData,type HubSeries} from './content-hub';
/** Cookie-free reads for the pre-rendered Content hub pages. Drafts are excluded by the query and by RLS. */
const POST_COLUMNS='id,slug,title,summary,body,platform,category,cover_url,created_at,series_id,series_part,code,takeaway,slides';
const GUIDE_COLUMNS='id,slug,title,summary,body,cover_url,notion_url,doc_url,created_at,updated_at,series_id,series_part,audience,highlights,exercises';
const SERIES_COLUMNS='id,slug,title,goal,topic,planned_parts,sort';
function publicClient(){const env=readSupabaseEnv();return env?createClient(env.url,env.anonKey,{auth:{persistSession:false}}):null;}
const toSeries=(s:HubSeries):HubSeries=>({id:s.id,slug:s.slug,title:s.title,goal:s.goal,topic:s.topic,planned_parts:s.planned_parts,sort:s.sort});
/** Posts (newest first), guides (most recently updated first) and published series. Each table follows an owner preview when it has one. */
export const getHubData=cache(async(preview?:HomePreview|null):Promise<HubData>=>{
 const p=preview?.publishing;
 const sb=publicClient();
 const [posts,guides,series]=await Promise.all([
  p?.articles?Promise.resolve(p.articles.filter(a=>a.published)):sb?sb.from('articles').select(POST_COLUMNS).eq('published',true).order('created_at',{ascending:false}).then(({data,error})=>{if(error)throw new Error('Articles unavailable');return (data??[]) as never[];}):Promise.resolve([]),
  p?.guides?Promise.resolve(p.guides.filter(g=>g.published)):sb?sb.from('guides').select(GUIDE_COLUMNS).eq('published',true).order('updated_at',{ascending:false}).then(({data,error})=>{if(error)throw new Error('Guides unavailable');return (data??[]) as never[];}):Promise.resolve([]),
  p?.content_series?Promise.resolve(p.content_series.filter(s=>s.published)):sb?sb.from('content_series').select(SERIES_COLUMNS).eq('published',true).order('sort',{ascending:true}).then(({data,error})=>{if(error)throw new Error('Series unavailable');return (data??[]) as HubSeries[];}):Promise.resolve([]),
 ]);
 return {posts:newestFirst(posts.map(toHubPost)),guides:[...guides.map(toHubGuide)].sort((a,b)=>b.updated_at.localeCompare(a.updated_at)),series:series.map(toSeries)};
});

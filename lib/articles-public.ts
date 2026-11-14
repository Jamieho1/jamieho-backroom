import type {HomePreview} from './content-drafts/types';
import {createClient} from '@supabase/supabase-js';
import {readSupabaseEnv} from './env';
import {ARTICLE_SELECT,CARD_SELECT,type Article,type ArticleCard} from './articles';
function publicClient(){const env=readSupabaseEnv();return env?createClient(env.url,env.anonKey,{auth:{persistSession:false}}):null;}
/** Cookie-free public reads: drafts are excluded by both query and RLS. */
export async function getPublicArticles(preview?:HomePreview|null):Promise<ArticleCard[]>{
 if(preview?.publishing?.articles)return preview.publishing.articles.filter(a=>a.published).sort((a,b)=>b.created_at.localeCompare(a.created_at));
 const sb=publicClient();if(!sb)return [];
 const {data,error}=await sb.from('articles').select(CARD_SELECT).eq('published',true).order('created_at',{ascending:false});
 if(error)throw new Error('Articles unavailable');return (data??[]) as ArticleCard[];
}
export async function getPublicArticle(slug:string,preview?:HomePreview|null):Promise<Article|null>{
 if(preview?.publishing?.articles)return preview.publishing.articles.find(a=>a.slug===slug&&(a.published||a.draftChanged))??null;
 const sb=publicClient();if(!sb)return null;
 const {data,error}=await sb.from('articles').select(ARTICLE_SELECT).eq('slug',slug).eq('published',true).maybeSingle();
 if(error)throw new Error('Articles unavailable');return data as Article|null;
}
export type LatestItem=Pick<Article,'slug'|'title'|'platform'|'source_url'|'cover_url'|'created_at'>;
/** The journey's Creator section (v1.1): newest YouTube post, newest Instagram post and newest other article. */
export interface LatestMedia{video:LatestItem|null;instagram:LatestItem|null;rednote:LatestItem|null;article:LatestItem|null}
export function pickLatest(rows:LatestItem[]):LatestMedia{
 const video=rows.find(r=>r.platform==='youtube'&&!!r.source_url)??null;
 const instagram=rows.find(r=>r.platform==='instagram'&&!!r.source_url)??null;
 const rednote=rows.find(r=>r.platform==='xiaohongshu'&&!!r.source_url)??null;
 return {video,instagram,rednote,article:rows.find(r=>r!==video&&r!==instagram&&r!==rednote)??null};
}
export async function getLatestMedia(preview?:HomePreview|null):Promise<LatestMedia>{
 if(preview?.publishing?.articles)return pickLatest(preview.publishing.articles.filter(a=>a.published).sort((a,b)=>b.created_at.localeCompare(a.created_at)).slice(0,30));
 const sb=publicClient();if(!sb)return {video:null,instagram:null,rednote:null,article:null};
 const {data,error}=await sb.from('articles').select('slug,title,platform,source_url,cover_url,created_at').eq('published',true).order('created_at',{ascending:false}).limit(30);
 if(error)throw new Error('Articles unavailable');
 return pickLatest((data??[]) as LatestItem[]);
}

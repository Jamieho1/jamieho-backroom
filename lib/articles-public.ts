import {createClient} from '@supabase/supabase-js';
import {readSupabaseEnv} from './env';
import {ARTICLE_SELECT,CARD_SELECT,type Article,type ArticleCard} from './articles';
function publicClient(){const env=readSupabaseEnv();return env?createClient(env.url,env.anonKey,{auth:{persistSession:false}}):null;}
/** Cookie-free public reads: drafts are excluded by both query and RLS. */
export async function getPublicArticles():Promise<ArticleCard[]>{
 const sb=publicClient();if(!sb)return [];
 const {data,error}=await sb.from('articles').select(CARD_SELECT).eq('published',true).order('created_at',{ascending:false});
 if(error)throw new Error('Articles unavailable');return (data??[]) as ArticleCard[];
}
export async function getPublicArticle(slug:string):Promise<Article|null>{
 const sb=publicClient();if(!sb)return null;
 const {data,error}=await sb.from('articles').select(ARTICLE_SELECT).eq('slug',slug).eq('published',true).maybeSingle();
 if(error)throw new Error('Articles unavailable');return data as Article|null;
}
export type LatestItem=Pick<Article,'slug'|'title'|'platform'|'source_url'|'cover_url'|'created_at'>;
/** The journey's Creator section (v1.1): newest YouTube post, newest Instagram post and newest other article. */
export interface LatestMedia{video:LatestItem|null;instagram:LatestItem|null;article:LatestItem|null}
export function pickLatest(rows:LatestItem[]):LatestMedia{
 const video=rows.find(r=>r.platform==='youtube'&&!!r.source_url)??null;
 const instagram=rows.find(r=>r.platform==='instagram'&&!!r.source_url)??null;
 return {video,instagram,article:rows.find(r=>r!==video&&r!==instagram)??null};
}
export async function getLatestMedia():Promise<LatestMedia>{
 const sb=publicClient();if(!sb)return {video:null,instagram:null,article:null};
 const {data,error}=await sb.from('articles').select('slug,title,platform,source_url,cover_url,created_at').eq('published',true).order('created_at',{ascending:false}).limit(30);
 if(error)throw new Error('Articles unavailable');
 return pickLatest((data??[]) as LatestItem[]);
}

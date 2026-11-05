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
/** The journey's desk (Home v1): newest published YouTube post and newest other post, for the "Latest" panel. */
export async function getLatestMedia():Promise<{video:LatestItem|null;article:LatestItem|null}>{
 const sb=publicClient();if(!sb)return {video:null,article:null};
 const {data,error}=await sb.from('articles').select('slug,title,platform,source_url,cover_url,created_at').eq('published',true).order('created_at',{ascending:false}).limit(20);
 if(error)throw new Error('Articles unavailable');
 const rows=(data??[]) as LatestItem[];
 const video=rows.find(r=>r.platform==='youtube'&&!!r.source_url)??null;
 return {video,article:rows.find(r=>r!==video)??null};
}

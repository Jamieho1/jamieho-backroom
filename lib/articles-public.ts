import {createClient} from '@supabase/supabase-js';
import {readSupabaseEnv} from './env';
import {ARTICLE_SELECT,type Article,type ArticleCard} from './articles';
function publicClient(){const env=readSupabaseEnv();return env?createClient(env.url,env.anonKey,{auth:{persistSession:false}}):null;}
/** Cookie-free public reads: drafts are excluded by both query and RLS. */
export async function getPublicArticles():Promise<ArticleCard[]>{
 const sb=publicClient();if(!sb)return [];
 const {data,error}=await sb.from('articles').select('id,slug,title,summary,platform,created_at').eq('published',true).order('created_at',{ascending:false});
 if(error)throw new Error('Articles unavailable');return data??[];
}
export async function getPublicArticle(slug:string):Promise<Article|null>{
 const sb=publicClient();if(!sb)return null;
 const {data,error}=await sb.from('articles').select(ARTICLE_SELECT).eq('slug',slug).eq('published',true).maybeSingle();
 if(error)throw new Error('Articles unavailable');return data as Article|null;
}

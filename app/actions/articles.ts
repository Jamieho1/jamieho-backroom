'use server';
import {revalidatePath} from 'next/cache';
import {getViewer} from '@/lib/viewer';
import {supabaseServer} from '@/lib/supabase/server';
import {articleSchema,ARTICLE_SELECT,articleHref,type ArticleSave} from '@/lib/articles';
export async function saveArticle(input:unknown):Promise<ArticleSave>{
 const parsed=articleSchema.safeParse(input);if(!parsed.success)return {ok:false,message:'Add a title, a valid unique slug and HTTPS source link; keep fields within their limits.'};
 try{
  if((await getViewer()).role!=='owner')return {ok:false,message:'Only the owner can edit articles.'};
  const sb=await supabaseServer();if(!sb)throw new Error('unavailable');
  const previous=await sb.from('articles').select('slug').eq('id',parsed.data.id).maybeSingle();if(previous.error)throw new Error('unavailable');
  const {data,error}=await sb.from('articles').upsert(parsed.data,{onConflict:'id'}).select(ARTICLE_SELECT).single();
  if(error?.code==='23505')return {ok:false,message:'That slug is already in use. Choose another one.'};
  if(error||!data)throw new Error('unavailable');
  revalidatePath('/articles');revalidatePath(articleHref(data.slug));if(previous.data?.slug&&previous.data.slug!==data.slug)revalidatePath(articleHref(previous.data.slug));
  return {ok:true,article:data};
 }catch{return {ok:false,message:"Couldn't save. Your draft is still here — retry."};}
}

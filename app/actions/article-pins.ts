"use server";
import {getViewer} from "@/lib/viewer";
import {supabaseServer} from "@/lib/supabase/server";
export async function loadArticlePins():Promise<{ok:true;ids:string[]}|{ok:false;message:string}>{
 try{
  const viewer=await getViewer();if(viewer.role==='anonymous'||!viewer.id)return {ok:false,message:'Sign in to load your pins.'};
  const sb=await supabaseServer();if(!sb)throw new Error('unavailable');
  const {data,error}=await sb.from('article_pins').select('article_id').eq('user_id',viewer.id).order('created_at',{ascending:false});
  if(error)throw new Error('unavailable');return {ok:true,ids:(data??[]).map(row=>row.article_id)};
 }catch{return {ok:false,message:"Couldn't load your pinned posts. Retry."};}
}
export async function saveArticlePin(articleId:string,pinned:boolean):Promise<{ok:true}|{ok:false;message:string}>{
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(articleId)||typeof pinned!=='boolean')return {ok:false,message:'Choose a valid article.'};
 try{
  const viewer=await getViewer();if(viewer.role==='anonymous'||!viewer.id)return {ok:false,message:'Sign in to pin articles.'};
  const sb=await supabaseServer();if(!sb)throw new Error('unavailable');
  const result=pinned
   ?await sb.from('article_pins').upsert({user_id:viewer.id,article_id:articleId},{onConflict:'user_id,article_id',ignoreDuplicates:true})
   :await sb.from('article_pins').delete().eq('user_id',viewer.id).eq('article_id',articleId);
  if(result.error)throw new Error('unavailable');return {ok:true};
 }catch{return {ok:false,message:"Couldn't save your pin. Retry."};}
}

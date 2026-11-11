'use server';
import {revalidatePath} from 'next/cache';
import {getViewer} from '@/lib/viewer';
import {supabaseServer} from '@/lib/supabase/server';
import {guideSchema,GUIDE_SELECT,guideHref,type GuideSave} from '@/lib/guides';
export async function saveGuide(input:unknown):Promise<GuideSave>{
 const parsed=guideSchema.safeParse(input);if(!parsed.success)return {ok:false,message:'Add a title, a valid unique slug and HTTPS links; keep fields within their limits.'};
 try{
  if((await getViewer()).role!=='owner')return {ok:false,message:'Only the owner can edit guides.'};
  const sb=await supabaseServer();if(!sb)throw new Error('unavailable');
  const previous=await sb.from('guides').select('slug').eq('id',parsed.data.id).maybeSingle();if(previous.error)throw new Error('unavailable');
  const {data,error}=await sb.from('guides').upsert(parsed.data,{onConflict:'id'}).select(GUIDE_SELECT).single();
  if(error?.code==='23505')return {ok:false,message:'That slug is already in use. Choose another one.'};
  if(error||!data)throw new Error('unavailable');
  revalidatePath('/resources');revalidatePath('/guides');revalidatePath(guideHref(data.slug));if(previous.data?.slug&&previous.data.slug!==data.slug)revalidatePath(guideHref(previous.data.slug));
  return {ok:true,guide:data};
 }catch{return {ok:false,message:"Couldn't save. Your draft is still here — retry."};}
}

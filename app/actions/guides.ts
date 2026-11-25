'use server';
import {revalidatePath} from 'next/cache';
import {getViewer} from '@/lib/viewer';
import {supabaseServer} from '@/lib/supabase/server';
import {revalidateSeriesPages} from '@/lib/content-series-revalidate';
import {guideSchema,GUIDE_SELECT,guideHref,type GuideSave} from '@/lib/guides';
export async function saveGuide(input:unknown):Promise<GuideSave>{
 const parsed=guideSchema.safeParse(input);if(!parsed.success)return {ok:false,message:'Add a title, a valid unique slug and HTTPS links; keep fields within their limits. A series needs a part number (1-50); at most three highlights of 80 characters.'};
 try{
  if((await getViewer()).role!=='owner')return {ok:false,message:'Only the owner can edit guides.'};
  const sb=await supabaseServer();if(!sb)throw new Error('unavailable');
  const previous=await sb.from('guides').select('slug,series_id').eq('id',parsed.data.id).maybeSingle();if(previous.error)throw new Error('unavailable');
  const {data,error}=await sb.from('guides').upsert(parsed.data,{onConflict:'id'}).select(GUIDE_SELECT).single();
  if(error?.code==='23505')return {ok:false,message:/series/i.test(error.message)?'That part number is already used in this series.':'That slug is already in use. Choose another one.'};
  if(error||!data)throw new Error('unavailable');
  revalidatePath('/resources');revalidatePath('/guides');revalidatePath('/content');revalidatePath('/content/series');revalidatePath('/content/guides');revalidatePath(guideHref(data.slug));if(previous.data?.slug&&previous.data.slug!==data.slug)revalidatePath(guideHref(previous.data.slug));
  await revalidateSeriesPages(sb,[data.series_id,previous.data?.series_id]);
  return {ok:true,guide:data};
 }catch{return {ok:false,message:"Couldn't save. Your draft is still here — retry."};}
}

'use server';
import {revalidatePath} from 'next/cache';
import {getViewer} from '@/lib/viewer';
import {supabaseServer} from '@/lib/supabase/server';
import {seriesSchema,SERIES_SELECT,seriesHref,type SeriesSave} from '@/lib/content-series-data';
export async function saveSeries(input:unknown):Promise<SeriesSave>{
 const parsed=seriesSchema.safeParse(input);if(!parsed.success)return {ok:false,message:'Add a title (80 characters at most), a valid unique slug and 1-50 planned parts; keep the goal within 200 characters.'};
 try{
  if((await getViewer()).role!=='owner')return {ok:false,message:'Only the owner can edit series.'};
  const sb=await supabaseServer();if(!sb)throw new Error('unavailable');
  const previous=await sb.from('content_series').select('slug').eq('id',parsed.data.id).maybeSingle();if(previous.error)throw new Error('unavailable');
  const {data,error}=await sb.from('content_series').upsert(parsed.data,{onConflict:'id'}).select(SERIES_SELECT).single();
  if(error?.code==='23505')return {ok:false,message:'That slug is already in use. Choose another one.'};
  if(error||!data)throw new Error('unavailable');
  revalidatePath('/content');revalidatePath('/content/series');revalidatePath('/content/guides');revalidatePath(seriesHref(data.slug));if(previous.data?.slug&&previous.data.slug!==data.slug)revalidatePath(seriesHref(previous.data.slug));
  return {ok:true,series:data};
 }catch{return {ok:false,message:"Couldn't save. Your draft is still here — retry."};}
}

import {revalidatePath} from 'next/cache';
import type {SupabaseClient} from '@supabase/supabase-js';
import {seriesHref} from './content-series-data';
/** A post or guide's save changes its series page, but the save only knows the series id. Look the slug up and revalidate /content/series/<slug> for every series involved (the new one and the one it left). Best effort: the save has already succeeded. */
export async function revalidateSeriesPages(sb:SupabaseClient,ids:(string|null|undefined)[]):Promise<void>{
 const list=[...new Set(ids.filter((x):x is string=>!!x))];
 if(!list.length)return;
 try{
  const {data}=await sb.from('content_series').select('slug').in('id',list);
  for(const row of (data??[]) as {slug:string}[])revalidatePath(seriesHref(row.slug));
 }catch{/* The page refreshes within the hour anyway. */}
}

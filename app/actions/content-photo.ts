'use server';
import {z} from 'zod';
import {revalidatePath} from 'next/cache';
import {getViewer} from '@/lib/viewer';
import {supabaseServer} from '@/lib/supabase/server';
import {photoPath} from '@/lib/content-drafts/photo-slots';
import {parsePhotoSet,checkSlotObject} from '@/lib/content-drafts/photo-server';
import type {DraftResult} from '@/lib/content-drafts/types';
/** Records an existing owner-uploaded object; never writes a live content row. */
export async function saveContentPhoto(id:string,slotName:string,path:string):Promise<DraftResult>{
 try{
  const viewer=await getViewer();if(viewer.role!=='owner'||!viewer.id)return {ok:false,message:'Only the owner can upload draft photos.'};
  if(!z.uuid().safeParse(id).success)return {ok:false,message:'Invalid change set ID.'};
  const sb=await supabaseServer();if(!sb)return {ok:false,message:'Storage is not configured.'};
  const {data,error}=await sb.from('content_changes').select('id,status,operations,photo_slots').eq('id',id).eq('status','draft').maybeSingle();
  if(error||!data)return {ok:false,message:'This draft is missing or already reviewed.'};
  const {slots}=parsePhotoSet(data.operations,data.photo_slots,id);const slot=slots.find(s=>s.slot===slotName);
  if(!slot||path!==photoPath(id,slot))return {ok:false,message:'The uploaded path does not match this photo slot.'};
  await checkSlotObject(sb,{...slot,path});
  const current=await getViewer();if(current.role!=='owner'||current.id!==viewer.id)return {ok:false,message:'Only the owner can upload draft photos.'};
  const updated=await sb.from('content_changes').update({photo_slots:slots.map(s=>s.slot===slotName?{...s,path}:s)}).eq('id',id).eq('status','draft').filter('photo_slots','eq',JSON.stringify(data.photo_slots)).select('id');
  if(updated.error||!updated.data?.length)return {ok:false,message:'The draft changed. Reload and retry the upload.'};
  try{revalidatePath('/manage/review');}catch{/* Slot is committed; the client refresh can reload it. */}
  return {ok:true,message:'Photo uploaded. Preview is updated.'};
 }catch(error){return {ok:false,message:error instanceof Error?error.message:'Could not save the photo slot. Try again.'};}
}

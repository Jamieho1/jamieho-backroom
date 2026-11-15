import {cache} from 'react';
import {getViewer} from '@/lib/viewer';
import {supabaseServer} from '@/lib/supabase/server';
import {getHomePreview} from '@/lib/content-drafts/preview';
import type {NoteRow} from '@/lib/notes';
/** Request-scoped only: app discovery and notes RLS remain the authority. Never cache across viewers. */
export const getInterviewNotes=cache(async()=>{
 const viewer=await getViewer();const sb=await supabaseServer();
 if(viewer.role==='anonymous'||!sb)return {viewer,configured:!!sb,allowed:false,notes:[] as NoteRow[],preview:null,error:false};
 const access=await sb.from('desktop_apps').select('id').eq('id','notes').maybeSingle();
 if(access.error||!access.data)return {viewer,configured:true,allowed:false,notes:[] as NoteRow[],preview:null,error:!!access.error};
 const result=await sb.from('notes').select('id,title,body,free,visual,sort,updated_at').order('sort').order('id');
 const candidate=viewer.role==='owner'?await getHomePreview():null;
 const preview=candidate?.appData?.notes?candidate:null;
 return {viewer,configured:true,allowed:true,notes:(preview?.appData?.notes??result.data??[]) as NoteRow[],preview,error:!!result.error};
});

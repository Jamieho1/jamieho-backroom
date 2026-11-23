'use server';
import {getViewer} from '@/lib/viewer';
import {supabaseServer} from '@/lib/supabase/server';
import {ATTEMPT_LIMITS,historyPayloadSchema,itemOf,parseHistoryRow,sortHistory,type HistoryAttempt,type HistoryItem} from '@/lib/interview/sd-attempt';
import {sanitizeScene} from '@/lib/interview/whiteboard';
export type HistoryListResult={ok:true;items:HistoryItem[]}|{ok:false;message:string};
export type HistoryLoadResult={ok:true;attempt:HistoryAttempt}|{ok:false;message:string};
export type HistorySaveResult={ok:true;item:HistoryItem}|{ok:false;message:string};
export type HistoryDeleteResult={ok:true}|{ok:false;message:string};
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ITEM_COLUMNS='id,created_at,seconds,covered,total';
async function account(){const viewer=await getViewer();return viewer.id&&viewer.role!=='anonymous'?viewer.id:null;}
/** Lists the signed-in user's attempts without the canvases (newest first). */
export async function listSdAttempts(questionId:string):Promise<HistoryListResult>{
 if(!UUID.test(questionId))return {ok:false,message:'Choose a valid question.'};
 try{
  const id=await account();if(!id)return {ok:false,message:'Sign in to read your history.'};
  const sb=await supabaseServer();if(!sb)throw Error('unavailable');
  const {data,error}=await sb.from('system_design_attempts').select(ITEM_COLUMNS).eq('user_id',id).eq('question_id',questionId).order('created_at',{ascending:false}).limit(ATTEMPT_LIMITS.history);
  if(error||!data)throw Error('unavailable');
  return {ok:true,items:sortHistory(data.flatMap(r=>{const a=parseHistoryRow({...r,answers:{},checks:{},scene:null});return a?[itemOf(a)]:[];}))};
 }catch{return {ok:false,message:"Couldn't load your history. Retry."};}
}
export async function loadSdAttempt(questionId:string,attemptId:string):Promise<HistoryLoadResult>{
 if(!UUID.test(questionId)||!UUID.test(attemptId))return {ok:false,message:'Choose a valid attempt.'};
 try{
  const id=await account();if(!id)return {ok:false,message:'Sign in to read your history.'};
  const sb=await supabaseServer();if(!sb)throw Error('unavailable');
  const {data,error}=await sb.from('system_design_attempts').select(`${ITEM_COLUMNS},answers,checks,scene`).eq('user_id',id).eq('question_id',questionId).eq('id',attemptId).maybeSingle();
  if(error)throw Error('unavailable');
  const attempt=data?parseHistoryRow(data):null;
  return attempt?{ok:true,attempt}:{ok:false,message:'That attempt is no longer available.'};
 }catch{return {ok:false,message:"Couldn't open that attempt. Retry."};}
}
/** Re-validates the snapshot (scene element types, links, sizes, ids) and derives the user id server-side; keeps the newest 20. */
export async function saveSdAttempt(questionId:string,payload:unknown):Promise<HistorySaveResult>{
 if(!UUID.test(questionId))return {ok:false,message:'Choose a valid question.'};
 if(!payload||typeof payload!=='object')return {ok:false,message:"This attempt can't be saved."};
 const {scene,...rest}=payload as {scene?:unknown};
 const meta=historyPayloadSchema.safeParse(rest);const clean=sanitizeScene(scene);
 if(!meta.success)return {ok:false,message:"This attempt can't be saved."};
 if(!clean)return {ok:false,message:'This board is too large to save.'};
 try{
  const id=await account();if(!id)return {ok:false,message:'Sign in to save your history.'};
  const sb=await supabaseServer();if(!sb)throw Error('unavailable');
  const {data,error}=await sb.from('system_design_attempts').insert({user_id:id,question_id:questionId,scene:clean,...meta.data}).select(ITEM_COLUMNS);
  if(error||!data?.length)throw Error('unavailable');
  const saved=parseHistoryRow({...data[0],answers:{},checks:{},scene:null});if(!saved)throw Error('unavailable');
  // Pruning is best effort: a failure leaves an extra old attempt, never a lost new one.
  const old=await sb.from('system_design_attempts').select('id').eq('user_id',id).eq('question_id',questionId).order('created_at',{ascending:false}).range(ATTEMPT_LIMITS.history,ATTEMPT_LIMITS.history+50);
  if(!old.error&&old.data?.length)await sb.from('system_design_attempts').delete().eq('user_id',id).in('id',old.data.map(r=>r.id));
  return {ok:true,item:itemOf(saved)};
 }catch{return {ok:false,message:"Couldn't save your attempt. Retry."};}
}
export async function deleteSdAttempt(questionId:string,attemptId:string):Promise<HistoryDeleteResult>{
 if(!UUID.test(questionId)||!UUID.test(attemptId))return {ok:false,message:'Choose a valid attempt.'};
 try{
  const id=await account();if(!id)return {ok:false,message:'Sign in to manage your history.'};
  const sb=await supabaseServer();if(!sb)throw Error('unavailable');
  const {error}=await sb.from('system_design_attempts').delete().eq('user_id',id).eq('question_id',questionId).eq('id',attemptId);
  if(error)throw Error('unavailable');
  return {ok:true};
 }catch{return {ok:false,message:"Couldn't delete that attempt. Retry."};}
}

'use server';
import {getViewer} from '@/lib/viewer';
import {supabaseServer} from '@/lib/supabase/server';
import {sanitizeScene,sceneBytes,WB_LIMITS,type WbScene} from '@/lib/interview/whiteboard';
export type WbLoadResult={ok:true;scene:WbScene|null}|{ok:false;message:string};
export type WbSaveResult={ok:true}|{ok:false;message:string};
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
async function account(){const viewer=await getViewer();return viewer.id&&viewer.role!=='anonymous'?viewer.id:null;}
export async function loadSdWhiteboard(questionId:string):Promise<WbLoadResult>{
 if(!UUID.test(questionId))return {ok:false,message:'Choose a valid question.'};
 try{
  const id=await account();if(!id)return {ok:false,message:'Sign in to read your board.'};
  const sb=await supabaseServer();if(!sb)throw Error('unavailable');
  const {data,error}=await sb.from('system_design_whiteboards').select('scene').eq('user_id',id).eq('question_id',questionId).maybeSingle();
  if(error)throw Error('unavailable');
  return {ok:true,scene:data?sanitizeScene(data.scene):null};
 }catch{return {ok:false,message:"Couldn't load your board. Retry."};}
}
/** The scene is re-validated here (element types, links, size), so a client cannot store embeds or oversized data. */
export async function saveSdWhiteboard(questionId:string,scene:unknown):Promise<WbSaveResult>{
 if(!UUID.test(questionId))return {ok:false,message:'Choose a valid question.'};
 if(sceneBytes(scene)>WB_LIMITS.bytes*2)return {ok:false,message:'This board is too large to save.'};
 const clean=sanitizeScene(scene);if(!clean)return {ok:false,message:'This board is too large to save.'};
 try{
  const id=await account();if(!id)return {ok:false,message:'Sign in to save your board.'};
  const sb=await supabaseServer();if(!sb)throw Error('unavailable');
  const {data,error}=await sb.from('system_design_whiteboards').upsert({user_id:id,question_id:questionId,scene:clean,updated_at:new Date().toISOString()},{onConflict:'user_id,question_id'}).select('question_id');
  if(error||!data?.length)throw Error('unavailable');
  return {ok:true};
 }catch{return {ok:false,message:"Couldn't save your board. Retry."};}
}
export async function resetSdWhiteboard(questionId:string):Promise<WbSaveResult>{
 if(!UUID.test(questionId))return {ok:false,message:'Choose a valid question.'};
 try{
  const id=await account();if(!id)return {ok:false,message:'Sign in to reset your board.'};
  const sb=await supabaseServer();if(!sb)throw Error('unavailable');
  const {error}=await sb.from('system_design_whiteboards').delete().eq('user_id',id).eq('question_id',questionId);
  if(error)throw Error('unavailable');
  return {ok:true};
 }catch{return {ok:false,message:"Couldn't reset your board. Retry."};}
}

'use server';
import {getViewer} from '@/lib/viewer';
import {supabaseServer} from '@/lib/supabase/server';
import {validProblem} from '@/lib/practice/data';
export type StarsResult={ok:true;problems:number[]}|{ok:false;message:string};
export type StarSave={ok:true}|{ok:false;message:string};
export async function loadPracticeStars():Promise<StarsResult>{
 try{
  if((await getViewer()).role!=='owner')return {ok:false,message:'Only the owner can read the review list.'};
  const sb=await supabaseServer();if(!sb)throw new Error('unavailable');
  const {data,error}=await sb.from('practice_stars').select('problem').order('created_at',{ascending:false});
  if(error)throw new Error('unavailable');
  return {ok:true,problems:(data??[]).map(r=>r.problem).filter(validProblem)};
 }catch{return {ok:false,message:"Couldn't load your starred questions. Retry to open your review list."};}
}
export async function savePracticeStar(problem:number,starred:boolean):Promise<StarSave>{
 if(!validProblem(problem)||typeof starred!=='boolean')return {ok:false,message:'Choose a valid question.'};
 try{
  if((await getViewer()).role!=='owner')return {ok:false,message:'Only the owner can change the review list.'};
  const sb=await supabaseServer();if(!sb)throw new Error('unavailable');
  const result=starred
   ?await sb.from('practice_stars').upsert({problem},{onConflict:'problem'}).select('problem')
   :await sb.from('practice_stars').delete().eq('problem',problem).select('problem');
  if(result.error||(starred&&!result.data?.length))throw new Error('unavailable');
  return {ok:true};
 }catch{return {ok:false,message:"Couldn't save the star. Your review list hasn't changed — retry."};}
}

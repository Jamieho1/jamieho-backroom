'use server';
import {getViewer} from '@/lib/viewer';
import {supabaseServer} from '@/lib/supabase/server';
import {completedProblems} from '@/lib/practice/progress';
export async function loadPracticeCompletions():Promise<{ok:true;problems:number[]}|{ok:false;message:string}>{
 try{
  const viewer=await getViewer();if(!viewer.id||viewer.role==='anonymous')return {ok:false,message:'Sign in to read your progress.'};
  const sb=await supabaseServer();if(!sb)throw Error('unavailable');
  const problems=new Set<number>();
  // Page large histories without silently losing older completions at the API row limit.
  for(let start=0;;start+=500){
   const {data,error}=await sb.from('practice_attempts').select('id,problem,mode,status,passed,total').eq('user_id',viewer.id).eq('mode','submit').eq('status','ok').order('id').range(start,start+499);
   if(error)throw Error('unavailable');for(const id of completedProblems(data??[]))problems.add(id);if((data??[]).length<500)break;
  }
  return {ok:true,problems:[...problems]};
 }catch{return {ok:false,message:'Could not load your completions. Retry.'};}
}

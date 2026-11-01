'use server';
import { revalidatePath } from 'next/cache';
import { getViewer } from '@/lib/viewer';
import { supabaseServer } from '@/lib/supabase/server';
import { answerSchema,ANSWER_SELECT,type AnswerSave } from '@/lib/behavioral/answers';
import { storySchema,STORY_SELECT,type StorySave } from '@/lib/behavioral';
export async function saveStory(input:unknown):Promise<StorySave>{
 const parsed=storySchema.safeParse(input);
 if(!parsed.success)return {ok:false,message:'Add a title and keep each field within its limit.'};
 try{
  if((await getViewer()).role!=='owner')return {ok:false,message:'Only the owner can edit stories.'};
  const sb=await supabaseServer();if(!sb)throw new Error('unavailable');
  const {data,error}=await sb.from('behavioral_stories').upsert(parsed.data,{onConflict:'id'}).select(STORY_SELECT).single();
  if(error||!data)throw new Error('unavailable');
  revalidatePath('/desktop');return {ok:true,story:data};
 }catch{return {ok:false,message:"Couldn't save. Your draft is still here — retry."};}
}

export async function saveAnswer(input:unknown):Promise<AnswerSave>{
 const parsed=answerSchema.safeParse(input);
 if(!parsed.success)return {ok:false,message:'Choose a valid question, two different stories, and keep text within its limits.'};
 try{
  if((await getViewer()).role!=='owner')return {ok:false,message:'Only the owner can edit answers.'};
  const sb=await supabaseServer();if(!sb)throw new Error('unavailable');
  const {data,error}=await sb.from('behavioral_answers').upsert(parsed.data,{onConflict:'question_id'}).select(ANSWER_SELECT).single();
  if(error||!data)throw new Error('unavailable');
  revalidatePath('/desktop');return {ok:true,answer:data};
 }catch{return {ok:false,message:"Couldn't save. Your draft is still here — retry."};}
}

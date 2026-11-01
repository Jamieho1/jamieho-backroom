import { supabaseServer } from '@/lib/supabase/server';
import { SELECT,fromRows } from '@/lib/experience';
import { STORY_SELECT,type Story } from '@/lib/behavioral';
import { ANSWER_SELECT,type Answer } from '@/lib/behavioral/answers';
import { Behavioral } from '@/components/behavioral/workspace';
export async function BehavioralContent({canEdit=false}:{canEdit?:boolean}={}){
 try{
  const sb=await supabaseServer();if(!sb)throw new Error('unavailable');
  const allowed=await sb.from('desktop_apps').select('id').eq('id','behavioral').maybeSingle();
  if(allowed.error)throw new Error('unavailable');
  if(!allowed.data)return <p>You don&apos;t have access to Behavioral.</p>;
  const [cv,stories,answers]=await Promise.all([
   sb.from('experience_items').select(SELECT).order('sort'),
   sb.from('behavioral_stories').select(STORY_SELECT).order('updated_at',{ascending:false}).order('id'),
   sb.from('behavioral_answers').select(ANSWER_SELECT).order('question_id'),
  ]);
  if(cv.error||stories.error||answers.error)throw new Error('unavailable');
  return <Behavioral items={fromRows(cv.data??[])} initialStories={(stories.data??[]) as Story[]} initialAnswers={(answers.data??[]) as Answer[]} canEdit={canEdit} />;
 }catch{return <div className="desktop-placeholder"><p role="alert">Can&apos;t reach the data right now.</p><a href="/behavioral">Try again</a></div>;}
}

import { z } from 'zod';
import { THEMES,QUESTIONS,questionById } from './questions';
export const answerSchema=z.object({
 question_id:z.string().refine(id=>!!questionById(id)),
 primary_story_id:z.uuid().nullable(),secondary_story_id:z.uuid().nullable(),
 outline:z.string().max(20000),followups:z.string().max(10000),
}).refine(a=>!a.primary_story_id||a.primary_story_id!==a.secondary_story_id,{message:'Choose two different stories.'});
export type AnswerEdit=z.infer<typeof answerSchema>;
export type Answer=AnswerEdit&{updated_at:string};
export type AnswerSave={ok:true;answer:Answer}|{ok:false;message:string};
export const ANSWER_SELECT='question_id,primary_story_id,secondary_story_id,outline,followups,updated_at';
export const emptyAnswer=(question_id:string):AnswerEdit=>({question_id,primary_story_id:null,secondary_story_id:null,outline:'',followups:''});
/** Count mappings only to existing stories. Blank outlines are not story coverage. */
export function coverage(answers:AnswerEdit[],storyIds:string[]){
 const ids=new Set(storyIds);
 return THEMES.map(theme=>{const questions=QUESTIONS.filter(q=>q.theme===theme);return {theme,total:questions.length,mapped:questions.filter(q=>{const a=answers.find(a=>a.question_id===q.id);return a&&[a.primary_story_id,a.secondary_story_id].some(id=>id&&ids.has(id));}).length};});
}

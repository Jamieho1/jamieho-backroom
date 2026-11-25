import { z } from 'zod';
export const storySchema = z.object({
 id:z.uuid(), bullet_id:z.uuid().nullable(), title:z.string().trim().min(1).max(160),
 situation:z.string().max(20000), task:z.string().max(20000), action:z.string().max(20000), result:z.string().max(20000),
 skills:z.string().max(1000), numbers:z.string().max(2000),
});
export type StoryEdit = z.infer<typeof storySchema>;
export type Story = StoryEdit & {updated_at:string;draftChanged?:boolean};
export type StorySave = {ok:true;story:Story}|{ok:false;message:string};
export const STORY_SELECT='id,bullet_id,title,situation,task,action,result,skills,numbers,updated_at';
export const emptyStory=(bullet_id:string|null=null):StoryEdit=>({id:crypto.randomUUID(),bullet_id,title:'',situation:'',task:'',action:'',result:'',skills:'',numbers:''});
/** Legacy owner answers (table kept; the editor lives in PassLoop's history only). Validates draft rows, not catalogue ids. */
export const answerSchema=z.object({
 question_id:z.string().min(1).max(100),
 primary_story_id:z.uuid().nullable(),secondary_story_id:z.uuid().nullable(),
 outline:z.string().max(20000),followups:z.string().max(10000),
}).refine(a=>!a.primary_story_id||a.primary_story_id!==a.secondary_story_id,{message:'Choose two different stories.'});
export type AnswerEdit=z.infer<typeof answerSchema>;
export type Answer=AnswerEdit&{updated_at:string;draftChanged?:boolean};

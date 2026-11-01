import { z } from 'zod';
export const storySchema = z.object({
 id:z.uuid(), bullet_id:z.uuid().nullable(), title:z.string().trim().min(1).max(160),
 situation:z.string().max(20000), task:z.string().max(20000), action:z.string().max(20000), result:z.string().max(20000),
 skills:z.string().max(1000), numbers:z.string().max(2000),
});
export type StoryEdit = z.infer<typeof storySchema>;
export type Story = StoryEdit & {updated_at:string};
export type StorySave = {ok:true;story:Story}|{ok:false;message:string};
export const STORY_SELECT='id,bullet_id,title,situation,task,action,result,skills,numbers,updated_at';
export const emptyStory=(bullet_id:string|null=null):StoryEdit=>({id:crypto.randomUUID(),bullet_id,title:'',situation:'',task:'',action:'',result:'',skills:'',numbers:''});

import {z} from 'zod';
import {storySchema,answerSchema} from '@/lib/behavioral';
const storyFields=storySchema.omit({id:true}).shape;
const answerFields={primary_story_id:answerSchema.shape.primary_story_id,secondary_story_id:answerSchema.shape.secondary_story_id,outline:answerSchema.shape.outline,followups:answerSchema.shape.followups};
/** Personal-site owner tables only. PassLoop's tables (notes, practice_*, interview_*, companies, ...) are PassLoop's, not drafted here (PL4). */
export const APP_ALLOWLIST={
 behavioral_stories:{key:z.uuid().transform(s=>s.toLowerCase()),fields:storyFields,operations:['insert','update'] as const,routes:[] as const},
 behavioral_answers:{key:answerSchema.shape.question_id,fields:answerFields,operations:['insert','update'] as const,routes:[] as const},
};
export type AppTable=keyof typeof APP_ALLOWLIST;
export const isAppTable=(value:string):value is AppTable=>Object.hasOwn(APP_ALLOWLIST,value);
function operation<T extends AppTable>(table:T){
 const entry=APP_ALLOWLIST[table];
 return z.object({table:z.literal(table),op:z.enum(entry.operations),key:entry.key,fields:z.object(entry.fields).partial().strict().default({})}).strict().superRefine((value,ctx)=>{
  if(!Object.keys(value.fields).length)ctx.addIssue({code:'custom',message:'Choose at least one editable field.'});
  if(value.op==='insert'&&table==='behavioral_stories'&&!('title' in value.fields))ctx.addIssue({code:'custom',message:'Insert requires title.'});
  for(const text of Object.values(value.fields as Record<string,unknown>))if(typeof text==='string'&&text.includes('\0'))ctx.addIssue({code:'custom',message:'Text cannot contain NUL.'});
 });
}
export const appOperationSchema=z.discriminatedUnion('table',[operation('behavioral_stories'),operation('behavioral_answers')]);

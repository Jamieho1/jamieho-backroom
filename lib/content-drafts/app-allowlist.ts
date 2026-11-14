import {z} from 'zod';
import {NOTE_TEXT_LIMIT} from '@/lib/notes';
import {validProblem} from '@/lib/practice/data';
import {storySchema} from '@/lib/behavioral';
import {answerSchema} from '@/lib/behavioral/answers';
const rawText=(max:number)=>z.string().refine(s=>s.length<=max,`Text must be ${max} characters or fewer.`).refine(s=>!s.includes('\0'),'Text cannot contain NUL.');
const problem=z.number().int().refine(validProblem,'Choose an existing practice problem.');
const noteKey=z.string().regex(/^[a-z0-9][a-z0-9-]{0,79}$/);
const storyFields=storySchema.omit({id:true}).shape;
const answerFields={primary_story_id:answerSchema.shape.primary_story_id,secondary_story_id:answerSchema.shape.secondary_story_id,outline:answerSchema.shape.outline,followups:answerSchema.shape.followups};
export const APP_ALLOWLIST={
 notes:{key:noteKey,fields:{body:rawText(NOTE_TEXT_LIMIT),free:rawText(NOTE_TEXT_LIMIT)},operations:['update'] as const,routes:['/notes'] as const},
 question_notes:{key:problem,fields:{body:rawText(200000)},operations:['insert','update'] as const,routes:['/practices'] as const},
 practice_code:{key:problem,fields:{code:rawText(100000)},operations:['insert','update'] as const,routes:['/practices'] as const},
 practice_stars:{key:problem,fields:{},operations:['insert','delete'] as const,routes:['/practices'] as const},
 behavioral_stories:{key:z.uuid().transform(s=>s.toLowerCase()),fields:storyFields,operations:['insert','update'] as const,routes:['/behavioral'] as const},
 behavioral_answers:{key:answerSchema.shape.question_id,fields:answerFields,operations:['insert','update'] as const,routes:['/behavioral'] as const},
};
export type AppTable=keyof typeof APP_ALLOWLIST;
export const isAppTable=(value:string):value is AppTable=>Object.hasOwn(APP_ALLOWLIST,value);
function operation<T extends AppTable>(table:T){
 const entry=APP_ALLOWLIST[table];
 return z.object({table:z.literal(table),op:z.enum(entry.operations),key:entry.key,fields:z.object(entry.fields).partial().strict().default({})}).strict().superRefine((value,ctx)=>{
  if(table==='practice_stars')return;
  if(!Object.keys(value.fields).length)ctx.addIssue({code:'custom',message:'Choose at least one editable field.'});
  if(value.op==='insert'){
   const required=table==='behavioral_stories'?'title':table==='practice_code'?'code':table==='question_notes'?'body':null;
   if(required&&!(required in value.fields))ctx.addIssue({code:'custom',message:`Insert requires ${required}.`});
  }
  for(const text of Object.values(value.fields as Record<string,unknown>))if(typeof text==='string'&&text.includes('\0'))ctx.addIssue({code:'custom',message:'Text cannot contain NUL.'});
 });
}
export const appOperationSchema=z.discriminatedUnion('table',[operation('notes'),operation('question_notes'),operation('practice_code'),operation('practice_stars'),operation('behavioral_stories'),operation('behavioral_answers')]);

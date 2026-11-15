import {z} from 'zod';
const text=(max:number,required=false)=>z.string().max(max).refine(s=>!s.includes('\0'),'Text cannot contain NUL.').refine(s=>!required||!!s.trim(),'Enter some text.');
export const guideFields={looking_for:text(6000),talk_about:text(6000),star:text(6000),mistakes:text(6000),followups:text(6000),sample:text(12000)};
export const GUIDE_LABELS:Record<keyof typeof guideFields,string>={looking_for:'What interviewers look for',talk_about:'What you might talk about',star:'STAR structure',mistakes:'Common mistakes',followups:'Likely follow-ups',sample:'Generic sample answer'};
export const themeFields={title:text(100,true),color:z.string().regex(/^#[0-9a-fA-F]{6}$/),sort:z.number().int().min(0).max(10000)};
export const themeSchema=z.object({id:z.string().regex(/^[a-z][a-z0-9-]{0,59}$/),...themeFields}).strict();
export const questionFields={theme_id:themeSchema.shape.id,prompt:text(400,true),...guideFields,sort:themeFields.sort,published:z.boolean()};
export const questionSchema=z.object({id:z.uuid(),...questionFields}).strict();
export type BehavioralTheme=z.infer<typeof themeSchema>;
export type GuideQuestion=z.infer<typeof questionSchema>&{draftChanged?:boolean};
export const customQuestionSchema=z.object({id:z.uuid(),theme_id:themeSchema.shape.id,prompt:text(400,true)}).strict();
export type PrivateQuestion=z.infer<typeof customQuestionSchema>&{legacy?:Record<string,unknown>};
export const answerFields={situation:text(20000),task:text(20000),action:text(20000),result:text(20000),role_id:z.uuid().nullable()};
export const privateAnswerSchema=z.object({question_id:z.uuid(),custom:z.boolean(),...answerFields}).strict();
export type PrivateAnswer=z.infer<typeof privateAnswerSchema>;
export const blankAnswer=(question_id:string,custom=false):PrivateAnswer=>({question_id,custom,situation:'',task:'',action:'',result:'',role_id:null});
/** A partial note is a draft; completed STAR has all four nonblank fields. */
export const isAnswered=(a:Pick<PrivateAnswer,'situation'|'task'|'action'|'result'>|undefined)=>!!a&&(['situation','task','action','result'] as const).every(k=>!!a[k].trim());
export const questionHref=(id:string)=>'/interview/behavioral/questions/'+encodeURIComponent(id);
export const themeHref=(id:string)=>'/interview/behavioral/themes/'+encodeURIComponent(id);
export function behavioralOperation(table:'interview_behavioral_themes'|'interview_behavioral_questions'){
 const theme=table==='interview_behavioral_themes';const fields=z.object(theme?themeFields:questionFields);
 return z.object({table:z.literal(table),op:z.enum(['insert','update']),key:theme?themeSchema.shape.id:z.uuid(),fields:fields.partial().strict()}).strict().superRefine((v,ctx)=>{
  if(!Object.keys(v.fields).length)ctx.addIssue({code:'custom',message:'Choose a guide field.'});
  if(v.op==='insert')for(const key of theme?['title','color','sort']:['theme_id','prompt'])if(!(key in v.fields))ctx.addIssue({code:'custom',message:'Insert requires '+key});
 });
}
export const isGuideTable=(s:string):s is 'interview_behavioral_themes'|'interview_behavioral_questions'=>s==='interview_behavioral_themes'||s==='interview_behavioral_questions';

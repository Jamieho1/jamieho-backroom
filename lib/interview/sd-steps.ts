import {z} from 'zod';

/** S3: the interview-step shape stored in system_design_questions.steps (mirrored by private.valid_sd_steps). Own-words content only; no runtime AI. */
const text=(max:number)=>z.string().refine(s=>!s.includes('\0')&&Array.from(s).length<=max,`Text must be at most ${max} characters.`);
const required=(max:number)=>text(max).refine(s=>!!s.trim(),'Text cannot be blank.');
export const STEP_LIMITS={steps:12,title:120,category:40,question:600,instruction:600,minutes:60,how:4000,model:6000,checkItem:200,checklist:12,clarifying:10,clarifyQ:200,clarifyA:600} as const;
/** Ids of the S2 template frames (lib/interview/whiteboard.ts buildTemplate); a step's `frame` names the one to focus. */
export const SD_FRAME_IDS=['wb-functional','wb-non','wb-entities','wb-api','wb-hld'] as const;
export type SdFrameId=typeof SD_FRAME_IDS[number];
export const SD_FRAME_NAMES:Record<SdFrameId,string>={'wb-functional':'Functional Requirements','wb-non':'Non-Functional Requirements','wb-entities':'Core Entities','wb-api':'API Design','wb-hld':'High-Level Design'};
export const clarifyingSchema=z.object({q:required(STEP_LIMITS.clarifyQ),a:required(STEP_LIMITS.clarifyA)}).strict();
export const sdStepSchema=z.object({
 id:z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).max(40),title:required(STEP_LIMITS.title),
 category:text(STEP_LIMITS.category).optional(),question:text(STEP_LIMITS.question).optional(),instruction:text(STEP_LIMITS.instruction).optional(),
 minutes:z.number().int().min(1).max(STEP_LIMITS.minutes).optional(),frame:z.enum(SD_FRAME_IDS).optional(),
 how_to_answer:text(STEP_LIMITS.how).optional(),model_answer:text(STEP_LIMITS.model).optional(),
 checklist:z.array(required(STEP_LIMITS.checkItem)).max(STEP_LIMITS.checklist).optional(),
 clarifying:z.array(clarifyingSchema).max(STEP_LIMITS.clarifying).optional(),
}).strict();
export type SdStep=z.infer<typeof sdStepSchema>;
export const sdStepsSchema=z.array(sdStepSchema).max(STEP_LIMITS.steps).refine(a=>new Set(a.map(s=>s.id)).size===a.length,'Step ids must be unique.');
export interface ResolvedStep{id:string;title:string;category:string;question:string;instruction:string;minutes:number|null;frame:SdFrameId|null;howToAnswer:string;modelAnswer:string;checklist:string[];clarifying:{q:string;a:string}[]}
/** Fills defaults so the UI never branches on missing fields. */
export function resolveStep(s:SdStep):ResolvedStep{
 return {id:s.id,title:s.title,category:s.category?.trim()||s.title,question:s.question??'',instruction:s.instruction??'',minutes:s.minutes??null,frame:s.frame??null,howToAnswer:s.how_to_answer??'',modelAnswer:s.model_answer??'',checklist:s.checklist??[],clarifying:s.clarifying??[]};
}
export const timeHint=(minutes:number|null)=>minutes?`Spend ~${minutes} minute${minutes===1?'':'s'} in a real interview.`:'';

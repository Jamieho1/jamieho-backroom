import {z} from 'zod';
import {sanitizeScene,sceneBytes,toScene,type WbScene} from './whiteboard';
import {SD_FRAME_NAMES,STEP_LIMITS,type ResolvedStep,type SdFrameId} from './sd-steps';

/** S3: pure attempt model (answers, checklist ticks, timer), frame focus, history snapshots and dictation helpers. No AI, no network. */
export const ATTEMPT_LIMITS={answer:8000,seconds:86_400,history:20,localHistory:3,localBytes:400_000,steps:STEP_LIMITS.steps} as const;
export const ATTEMPT_STORAGE_PREFIX='jb.sd.attempt.v1.';
export const HISTORY_STORAGE_PREFIX='jb.sd.history.v1.';
export interface AttemptDraft{step:number;answers:Record<string,string>;checks:Record<string,number[]>;seconds:number}
export const emptyDraft=():AttemptDraft=>({step:0,answers:{},checks:{},seconds:0});
const STEP_ID=/^[a-z0-9]+(-[a-z0-9]+)*$/;

// ---- Checklist -----------------------------------------------------------------------------------------------------
/** Ticked indexes that exist, once each, ascending. */
export const cleanTicks=(ticked:readonly number[],total:number)=>[...new Set(ticked.filter(i=>Number.isInteger(i)&&i>=0&&i<total))].sort((a,b)=>a-b);
export function scoreChecklist(step:Pick<ResolvedStep,'checklist'>,ticked:readonly number[]):{covered:number;total:number}{
 const total=step.checklist.length;return {covered:cleanTicks(ticked,total).length,total};
}
export const toggleTick=(ticked:readonly number[],index:number)=>ticked.includes(index)?ticked.filter(i=>i!==index):[...ticked,index].sort((a,b)=>a-b);
export function attemptSummary(steps:readonly ResolvedStep[],draft:AttemptDraft):{covered:number;total:number;answered:number}{
 let covered=0,total=0,answered=0;
 for(const s of steps){const r=scoreChecklist(s,draft.checks[s.id]??[]);covered+=r.covered;total+=r.total;if((draft.answers[s.id]??'').trim())answered++;}
 return {covered,total,answered};
}

// ---- In-progress draft (per browser) -------------------------------------------------------------------------------
const draftSchema=z.object({step:z.number().int().min(0).max(ATTEMPT_LIMITS.steps).catch(0),answers:z.record(z.string(),z.string()).catch({}),checks:z.record(z.string(),z.array(z.number())).catch({}),seconds:z.number().min(0).max(ATTEMPT_LIMITS.seconds).catch(0)});
/** Cleans untrusted draft data against the live step list: unknown steps dropped, texts capped, ticks bounded. */
export function sanitizeDraft(raw:unknown,steps:readonly Pick<ResolvedStep,'id'|'checklist'>[]):AttemptDraft{
 const p=draftSchema.safeParse(raw);if(!p.success)return emptyDraft();
 const out=emptyDraft();out.step=steps.length?Math.min(p.data.step,steps.length-1):0;out.seconds=Math.floor(p.data.seconds);
 for(const s of steps){
  const a=p.data.answers[s.id];if(typeof a==='string'&&a.trim())out.answers[s.id]=Array.from(a.replace(/\0/g,'')).slice(0,ATTEMPT_LIMITS.answer).join('');
  const c=cleanTicks(p.data.checks[s.id]??[],s.checklist.length);if(c.length)out.checks[s.id]=c;
 }
 return out;
}
export function parseStoredDraft(raw:string|null,steps:readonly Pick<ResolvedStep,'id'|'checklist'>[]):AttemptDraft{
 if(!raw)return emptyDraft();try{return sanitizeDraft(JSON.parse(raw),steps);}catch{return emptyDraft();}
}
export const isEmptyDraft=(d:AttemptDraft)=>!d.seconds&&!Object.keys(d.answers).length&&!Object.keys(d.checks).length;

// ---- History snapshots ---------------------------------------------------------------------------------------------
export const historyPayloadSchema=z.object({
 answers:z.record(z.string().regex(STEP_ID).max(40),z.string().max(ATTEMPT_LIMITS.answer*4)),
 checks:z.record(z.string().regex(STEP_ID).max(40),z.array(z.number().int().min(0).max(STEP_LIMITS.checklist-1)).max(STEP_LIMITS.checklist)),
 seconds:z.number().int().min(0).max(ATTEMPT_LIMITS.seconds),covered:z.number().int().min(0).max(200),total:z.number().int().min(0).max(200),
}).refine(v=>v.covered<=v.total,'covered cannot exceed total').refine(v=>Object.keys(v.answers).length<=ATTEMPT_LIMITS.steps&&Object.keys(v.checks).length<=ATTEMPT_LIMITS.steps,'too many steps');
export interface HistoryPayload{scene:WbScene;answers:Record<string,string>;checks:Record<string,number[]>;seconds:number;covered:number;total:number}
export interface HistoryItem{id:string;created_at:string;seconds:number;covered:number;total:number}
export interface HistoryAttempt extends HistoryItem{scene:WbScene|null;answers:Record<string,string>;checks:Record<string,number[]>}
/** What "Finish attempt" stores: canvas, answers, ticks, timer and the covered/total summary (answers and ticks only for existing steps). */
export function buildHistoryPayload(steps:readonly ResolvedStep[],draft:AttemptDraft,scene:WbScene):HistoryPayload{
 const clean=sanitizeDraft(draft,steps);const sum=attemptSummary(steps,clean);
 return {scene,answers:clean.answers,checks:clean.checks,seconds:clean.seconds,covered:sum.covered,total:sum.total};
}
/** A stored attempt becomes the live draft again ("Restore to board"). */
export const draftFromAttempt=(a:Pick<HistoryAttempt,'answers'|'checks'|'seconds'>,steps:readonly ResolvedStep[]):AttemptDraft=>sanitizeDraft({step:0,answers:a.answers,checks:a.checks,seconds:a.seconds},steps);
export const itemOf=(a:HistoryItem):HistoryItem=>({id:a.id,created_at:a.created_at,seconds:a.seconds,covered:a.covered,total:a.total});
const itemSchema=z.object({id:z.string().min(1).max(80),created_at:z.string().max(40),seconds:z.number().int().min(0).max(ATTEMPT_LIMITS.seconds),covered:z.number().int().min(0).max(200),total:z.number().int().min(0).max(200)});
const rowSchema=itemSchema.extend({answers:z.record(z.string(),z.string()),checks:z.record(z.string(),z.array(z.number())),scene:z.unknown()});
export function parseHistoryRow(raw:unknown):HistoryAttempt|null{
 const p=rowSchema.safeParse(raw);if(!p.success||Number.isNaN(Date.parse(p.data.created_at))||p.data.covered>p.data.total)return null;
 const v=historyPayloadSchema.safeParse({answers:p.data.answers,checks:p.data.checks,seconds:p.data.seconds,covered:p.data.covered,total:p.data.total});
 if(!v.success)return null;
 return {...itemOf(p.data),answers:v.data.answers,checks:v.data.checks,scene:sanitizeScene(p.data.scene)};
}
export const sortHistory=<T extends HistoryItem>(items:readonly T[])=>[...items].sort((a,b)=>Date.parse(b.created_at)-Date.parse(a.created_at));
/** Visitors keep their last few attempts in this browser; a snapshot that would not fit is not stored. */
export function parseLocalHistory(raw:string|null):HistoryAttempt[]{
 if(!raw)return [];let value:unknown;try{value=JSON.parse(raw);}catch{return [];}
 if(!Array.isArray(value))return [];
 return sortHistory(value.flatMap(v=>{const a=parseHistoryRow(v);return a?[a]:[];})).slice(0,ATTEMPT_LIMITS.localHistory);
}
export function addLocalHistory(existing:readonly HistoryAttempt[],attempt:HistoryAttempt):HistoryAttempt[]|null{
 const next=sortHistory([attempt,...existing]).slice(0,ATTEMPT_LIMITS.localHistory);
 return sceneBytes(next)>ATTEMPT_LIMITS.localBytes*ATTEMPT_LIMITS.localHistory?null:next;
}
export function formatWhen(iso:string){const d=new Date(iso);return Number.isNaN(d.getTime())?'':d.toLocaleString('en-GB',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',timeZone:'UTC'})+' UTC';}

// ---- Board focus ---------------------------------------------------------------------------------------------------
type BoardEl={id:string;type:string;name?:string|null;isDeleted?:boolean};
/** The slice of Excalidraw's imperative API this module needs (kept structural so nothing here imports Excalidraw). */
export interface BoardApiLike{
 getSceneElements():readonly BoardEl[];getAppState():{scrollX:number;scrollY:number;zoom:{value:number}};
 scrollToContent(target?:unknown,opts?:Record<string,unknown>):void;updateScene(scene:{appState?:Record<string,unknown>}):void;
}
export function findFrame(elements:readonly BoardEl[],frame:SdFrameId):BoardEl|null{
 const live=elements.filter(e=>!e.isDeleted&&e.type==='frame');
 return live.find(e=>e.id===frame)??live.find(e=>(e.name??'')===SD_FRAME_NAMES[frame])??null;
}
/** Selects the step's template frame and zooms to it. False when the frame is gone (the student deleted it). */
export function focusFrame(api:BoardApiLike,frame:SdFrameId|null,reduceMotion:boolean):boolean{
 if(!frame)return false;const el=findFrame(api.getSceneElements(),frame);if(!el)return false;
 api.updateScene({appState:{selectedElementIds:{[el.id]:true}}});
 api.scrollToContent(el,{fitToViewport:true,viewportZoomFactor:0.9,maxZoom:1,animate:!reduceMotion,duration:350});
 return true;
}
export function sceneFromApi(api:BoardApiLike):WbScene{
 const s=api.getAppState();return toScene(api.getSceneElements(),{scrollX:s.scrollX,scrollY:s.scrollY,zoom:s.zoom.value});
}

// ---- Dictation (browser Web Speech API) ----------------------------------------------------------------------------
export interface SpeechResultLike{isFinal:boolean;0:{transcript:string}}
export interface SpeechRecognitionLike{
 continuous:boolean;interimResults:boolean;lang:string;start():void;stop():void;abort():void;
 onresult:((e:{resultIndex?:number;results:ArrayLike<SpeechResultLike>})=>void)|null;onerror:((e:{error?:string})=>void)|null;onend:(()=>void)|null;
}
export type SpeechRecognitionCtor=new()=>SpeechRecognitionLike;
/** The browser's own recognizer, if it has one. Nothing is sent by this site; the browser's speech service does the work. */
export function speechRecognitionCtor(win:unknown=typeof window==='undefined'?undefined:window):SpeechRecognitionCtor|null{
 const w=win as {SpeechRecognition?:SpeechRecognitionCtor;webkitSpeechRecognition?:SpeechRecognitionCtor}|undefined;
 return w?.SpeechRecognition??w?.webkitSpeechRecognition??null;
}
export function spokenText(results:ArrayLike<SpeechResultLike>):string{
 let out='';for(let i=0;i<results.length;i++)out+=(out&&!/\s$/.test(out)?' ':'')+(results[i][0]?.transcript??'').trim();return out.trim();
}
/** Dictated text appended to what was already typed, with one space between them. */
export const joinDictation=(base:string,spoken:string)=>!spoken?base:!base.trim()?spoken:base.replace(/\s+$/,'')+' '+spoken;
export const capAnswer=(value:string)=>Array.from(value.replace(/\0/g,'')).slice(0,ATTEMPT_LIMITS.answer).join('');

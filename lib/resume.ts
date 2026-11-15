import {z} from 'zod';
export const RESUME_KINDS=['role','project','education','certificate','skills','other'] as const;
export const RESUME_LABELS:Record<(typeof RESUME_KINDS)[number],string>={role:'Role',project:'Project',education:'Education',certificate:'Certificate',skills:'Skills',other:'Other'};
const text=(max:number,required=false)=>z.string().refine(s=>s.length<=max,`Keep this field under ${max} characters.`).refine(s=>!s.includes('\0'),'Text cannot contain NUL.').refine(s=>!required||!!s.trim(),'Enter some text.');
const sort=z.number().int().min(0).max(10000);
export const resumeBulletSchema=z.object({id:z.uuid().transform(s=>s.toLowerCase()),text:text(1000,true),sort}).strict();
export const resumeEntrySchema=z.object({id:z.uuid().transform(s=>s.toLowerCase()),kind:z.enum(RESUME_KINDS),title:text(160,true),org:text(160),dates:text(80),location:text(80),summary:text(2000),sort,bullets:z.array(resumeBulletSchema).max(30)}).strict().refine(e=>new Set(e.bullets.map(b=>b.id)).size===e.bullets.length,'Bullet IDs must be unique.');
export const resumeDocumentSchema=z.object({entries:z.array(resumeEntrySchema).max(60)}).strict().refine(d=>new Set(d.entries.map(e=>e.id)).size===d.entries.length,'Entry IDs must be unique.');
export type ResumeDocument=z.infer<typeof resumeDocumentSchema>;
export type ResumeEntry=z.infer<typeof resumeEntrySchema>;
export interface UserResume {content:ResumeDocument;revision:number;updated_at:string}
export interface ResumeTemplate {key:'default';title:string;content:ResumeDocument;draftChanged?:boolean}
export const emptyResume=():ResumeDocument=>({entries:[]});
export const emptyTemplate=():ResumeTemplate=>({key:'default',title:'Resume guide',content:emptyResume()});
export function sortResume(doc:ResumeDocument):ResumeDocument {return {entries:[...doc.entries].sort((a,b)=>a.sort-b.sort).map(e=>({...e,bullets:[...e.bullets].sort((a,b)=>a.sort-b.sort)}))};}
export function newResumeEntry(kind:ResumeEntry['kind']='role'):ResumeEntry {return {id:crypto.randomUUID(),kind,title:'',org:'',dates:'',location:'',summary:'',sort:0,bullets:[]};}
export function moveResumeItem<T>(items:T[],index:number,delta:number):T[]{const next=[...items],at=index+delta;if(at<0||at>=next.length)return next;[next[index],next[at]]=[next[at],next[index]];return next;}
export const templateFields={title:text(160,true),content:resumeDocumentSchema};
export const templateOperation=z.object({table:z.literal('resume_templates'),op:z.literal('update'),key:z.literal('default'),fields:z.object(templateFields).partial().strict().refine(f=>!!Object.keys(f).length,'Choose a template field.')}).strict();

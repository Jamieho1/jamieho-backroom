import {TOPICS,topicById} from '@/lib/notes/topics';
import {PRACTICE_LIST} from '@/lib/practice/catalog';
import {shelfTitle} from '@/lib/notes';
export type SkillSection='dsa'|'system-design'|'low-level-design'|'finance'|'ai-engineering';
export interface InterviewTopic {id:string;label:string;dot:string}
/** Deterministic assignment for imports and drafts; no schema or private-content mapping required. */
export function noteSection(id:string):SkillSection {
 if(id==='class-design')return 'low-level-design';
 if(id.startsWith('sd-'))return 'system-design';
 if(id.startsWith('finance-'))return 'finance';
 if(id.startsWith('ai-'))return 'ai-engineering';
 return 'dsa';
}
export function sectionTopics(section:string,notes:readonly {id:string;title:string}[]=[]):InterviewTopic[]{
 const fixed:InterviewTopic[]=section==='dsa'?TOPICS.filter(t=>t.id!=='class-design'):section==='low-level-design'?TOPICS.filter(t=>t.id==='class-design'):[];
 const extra=notes.filter(n=>noteSection(n.id)===section&&!fixed.some(t=>t.id===n.id)).map(n=>({id:n.id,label:shelfTitle(n.title),dot:section==='system-design'?'#F54E00':section==='finance'?'#F7A501':section==='ai-engineering'?'#7C3AED':TOPICS[0].dot}));
 return [...fixed,...extra];
}
export const noteHref=(id:string)=>`/interview/${noteSection(id)}/notes/${encodeURIComponent(id)}`;
export const interviewProblemHref=(id:number|string)=>`/interview/problems/${encodeURIComponent(String(id))}`;
export function sectionQuestions(section:string,topic?:string){return ['dsa','low-level-design'].includes(section)?PRACTICE_LIST.filter(p=>(section==='low-level-design'?p.topic==='class-design':p.topic!=='class-design')&&(!topic||p.topic===topic)):[];}
export function modeHref(section:string,notes:boolean,topic?:string){return `/interview/${section}/${notes?'notes':'practice'}${topic?'/'+encodeURIComponent(topic):''}`;}
export const topicIcon=(id:string)=>topicById(id)?.id??(id.startsWith('sd-')?'system-design':noteSection(id));

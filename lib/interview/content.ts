import {TOPICS,topicById} from '@/lib/notes/topics';
import {PRACTICE_LIST} from '@/lib/practice/catalog';
import type {Anchor} from '@/lib/notes/neetcode150';
import {shelfTitle} from '@/lib/notes';
import {SQL_LIST,sqlProblemHref,type SqlAnchor} from '@/lib/practice/sql-catalog';
import {SQL_TOPICS} from '@/lib/practice/sql-types';
export type RoleNoteSection='full-stack'|'forward-deploy-engineer'|'data-scientist'|'machine-learning';
export type SkillSection='sql'|'dsa'|'system-design'|'low-level-design'|'finance'|'ai-engineering'|RoleNoteSection;
/** Role sections that hold notes only (no practice catalogue yet); the page stays Soon until a note exists. */
export const ROLE_NOTE_SECTIONS:readonly RoleNoteSection[]=['full-stack','forward-deploy-engineer','data-scientist','machine-learning'];
const ROLE_PREFIX:readonly (readonly [string,RoleNoteSection])[]=[['full-stack-','full-stack'],['fde-','forward-deploy-engineer'],['data-science-','data-scientist'],['ml-','machine-learning']];
const SQL_DOT='#2DD4BF';
const ROLE_DOT:Record<RoleNoteSection,string>={'full-stack':'#34D399','forward-deploy-engineer':'#22D3EE','data-scientist':'#A78BFA','machine-learning':'#F472B6'};
export interface InterviewTopic {id:string;label:string;dot:string}
/** Q4: the SQL notes shelf. Order is fixed here (not by database sort), so it holds before and after the rows are drafted. */
export const SQL_NOTES=[
 {id:'sql-basics',label:'SQL basics'},
 {id:'sql-tackling',label:'Tackling SQL questions'},
 {id:'sql-postgres-mysql',label:'Postgres vs MySQL'},
] as const;
export const isSqlNoteId=(id:string)=>SQL_NOTES.some(n=>n.id===id);
export const sqlNoteLabel=(id:string)=>SQL_NOTES.find(n=>n.id===id)?.label;
/** A drafted-later note: the row exists (or not yet) but has no text, so readers see "coming soon" instead of a 404 or a blank page. */
export const noteComingSoon=(note?:{body?:string;free?:string}|null)=>!note||!(note.body??'').trim()&&!(note.free??'').trim();
/** Deterministic assignment for imports and drafts; no schema or private-content mapping required. */
export function noteSection(id:string):SkillSection {
 if(id==='class-design')return 'low-level-design';
 if(id.startsWith('sd-'))return 'system-design';
 if(id.startsWith('sql-'))return 'sql';
 if(id.startsWith('finance-'))return 'finance';
 if(id.startsWith('ai-'))return 'ai-engineering';
 for(const [prefix,section] of ROLE_PREFIX)if(id.startsWith(prefix))return section;
 return 'dsa';
}
export function sectionTopics(section:string,notes:readonly {id:string;title:string}[]=[],mode:'practice'|'notes'='practice'):InterviewTopic[]{
 // SQL: practice lists the seven SQL 50 topics; the notes shelf lists exactly the three SQL notes (never topics as notes, never notes as topics).
 if(section==='sql')return mode==='notes'?SQL_NOTES.map(n=>({id:n.id,label:n.label,dot:SQL_DOT})):SQL_TOPICS.map(t=>({id:t.id,label:t.label,dot:SQL_DOT}));
 const fixed:InterviewTopic[]=section==='dsa'?TOPICS.filter(t=>t.id!=='class-design'):section==='low-level-design'?TOPICS.filter(t=>t.id==='class-design'):[];
 const extra=notes.filter(n=>noteSection(n.id)===section&&!fixed.some(t=>t.id===n.id)).map(n=>({id:n.id,label:shelfTitle(n.title),dot:section==='system-design'?'#F54E00':section==='finance'?'#F7A501':section==='ai-engineering'?'#7C3AED':ROLE_DOT[section as RoleNoteSection]??TOPICS[0].dot}));
 return [...fixed,...extra];
}
export const noteHref=(id:string)=>`/interview/${noteSection(id)}/notes/${encodeURIComponent(id)}`;
export const interviewProblemHref=(id:number|string)=>`/interview/problems/${encodeURIComponent(String(id))}`;
/** Question page for a list entry: SQL questions live under /interview/sql, DSA and LLD under /interview/problems. */
export const questionHref=(section:string,id:number|string)=>section==='sql'?sqlProblemHref(id):interviewProblemHref(id);
export function sectionQuestions(section:string,topic?:string):readonly (Anchor|SqlAnchor)[]{if(section==='sql')return SQL_LIST.filter(p=>!topic||p.topic===topic);return ['dsa','low-level-design'].includes(section)?PRACTICE_LIST.filter(p=>(section==='low-level-design'?p.topic==='class-design':p.topic!=='class-design')&&(!topic||p.topic===topic)):[];}
export function modeHref(section:string,notes:boolean,topic?:string){return `/interview/${section}/${notes?'notes':'practice'}${topic?'/'+encodeURIComponent(topic):''}`;}
export const topicIcon=(id:string)=>topicById(id)?.id??(id.startsWith('sd-')?'system-design':noteSection(id));

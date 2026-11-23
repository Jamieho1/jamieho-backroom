import {z} from 'zod';
import {PRACTICE_ANCHORS,leetcodeSlug} from '@/lib/notes/neetcode150';
import {topicById} from '@/lib/notes/topics';
import {shelfTitle} from '@/lib/notes';
import {interviewProblemHref,noteHref} from './content';
import {themeHref} from './behavioral';

/** "What to prepare" links (C4): pointers to the site's own notes, practice questions and behavioral themes. */
export const PREP_KINDS=['note','question','behavioral_theme'] as const;
export type PrepKind=typeof PREP_KINDS[number];
export const MAX_PREP_LINKS=20;
const refText=z.string().max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/,'Use a lowercase id such as arrays-hashing, 217 or conflict.');
const labelText=z.string().max(80).refine(s=>!s.includes('\0')&&!!s.trim(),'Label cannot be blank.');
export const prepLinkSchema=z.object({kind:z.enum(PREP_KINDS),ref:refText,label:labelText.optional()}).strict();
export const prepLinksSchema=z.array(prepLinkSchema).max(MAX_PREP_LINKS).superRefine((links,ctx)=>{
 const seen=new Set<string>();links.forEach((l,i)=>{const key=l.kind+':'+l.ref;if(seen.has(key))ctx.addIssue({code:'custom',path:[i],message:'Each prep link may appear once.'});seen.add(key);});
});
export type PrepLink=z.infer<typeof prepLinkSchema>;

export interface PrepContext{
 /** Notes the caller may know about (owner snapshot for validation; the viewer's accessible notes for rendering). */
 notes:readonly {id:string;title?:string}[];
 themes:readonly {id:string;title:string;total?:number;answered?:number}[];
}
const SECTION_PREFIX=/^(?:sd|finance|ai|full-stack|fde|data-science|ml)-/;
/** Render-time check for visitors who cannot read private note metadata: fixed topics, accessible notes or a known section prefix. */
const looksLikeNote=(ref:string)=>SECTION_PREFIX.test(ref)&&ref.length>3;
export function questionRef(raw:string):string|undefined{
 if(/^\d+$/.test(raw))return PRACTICE_ANCHORS.some(p=>String(p.lc)===raw)?raw:undefined;
 const slug=raw.toLowerCase();const matches=PRACTICE_ANCHORS.filter(p=>(p.slug??leetcodeSlug(p.title))===slug);
 return matches.length===1?String(matches[0].lc):undefined;
}
/** strict=true validates against actual database notes (Content Drafts); false is the visitor-safe render check. */
export function validPrepRef(kind:PrepKind,ref:string,ctx:PrepContext,strict=true):boolean{
 if(kind==='question')return PRACTICE_ANCHORS.some(p=>String(p.lc)===ref);
 if(kind==='behavioral_theme')return ctx.themes.some(t=>t.id===ref);
 return !!topicById(ref)||ctx.notes.some(n=>n.id===ref)||!strict&&looksLikeNote(ref);
}
export const unknownPrepLinks=(links:readonly PrepLink[],ctx:PrepContext)=>links.filter(l=>!validPrepRef(l.kind,l.ref,ctx));

export type PrepGroup='concept'|'practice'|'behavioral';
export interface PrepItem{kind:PrepKind;ref:string;label:string;href:string;group:PrepGroup;difficulty?:string;problem?:number;total?:number;answered?:number;count?:number}
const titleCase=(ref:string)=>ref.replace(SECTION_PREFIX,'').split('-').filter(Boolean).map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(' ');
export function resolvePrepLink(link:PrepLink,ctx:PrepContext):PrepItem|undefined{
 if(!validPrepRef(link.kind,link.ref,ctx,false))return undefined;
 if(link.kind==='question'){const p=PRACTICE_ANCHORS.find(p=>String(p.lc)===link.ref)!;return {kind:'question',ref:link.ref,label:link.label??p.title,href:interviewProblemHref(p.lc),group:'practice',difficulty:p.difficulty,problem:p.lc};}
 if(link.kind==='behavioral_theme'){const t=ctx.themes.find(t=>t.id===link.ref)!;return {kind:'behavioral_theme',ref:link.ref,label:link.label??t.title,href:themeHref(t.id),group:'behavioral',total:t.total,answered:t.answered};}
 const note=ctx.notes.find(n=>n.id===link.ref);
 return {kind:'note',ref:link.ref,label:link.label??(note?.title?shelfTitle(note.title):topicById(link.ref)?.label??titleCase(link.ref)),href:noteHref(link.ref),group:'concept'};
}
export function resolvePrepLinks(links:readonly PrepLink[]|undefined,ctx:PrepContext){return (links??[]).flatMap(l=>{const item=resolvePrepLink(l,ctx);return item?[item]:[];});}
export const PREP_GROUPS:readonly {id:PrepGroup;label:string}[]=[{id:'concept',label:'Concepts'},{id:'practice',label:'Practice'},{id:'behavioral',label:'Behavioral'}];
export const groupPrepItems=(items:readonly PrepItem[])=>PREP_GROUPS.map(g=>({...g,items:items.filter(i=>i.group===g.id)})).filter(g=>g.items.length);

/** Aggregation for the Company Overview: each experience counts a reference once. Ties: kind order, then reference. */
export function mostMentionedTopics(experiences:readonly {published:boolean;prep_links?:readonly PrepLink[]}[],limit=8):(PrepLink&{count:number})[]{
 const counts=new Map<string,PrepLink&{count:number}>();
 for(const e of experiences){if(!e.published)continue;const once=new Set<string>();for(const l of e.prep_links??[]){const key=l.kind+':'+l.ref;if(once.has(key))continue;once.add(key);const row=counts.get(key);if(row){row.count++;row.label??=l.label;}else counts.set(key,{...l,count:1});}}
 return [...counts.values()].sort((a,b)=>b.count-a.count||PREP_KINDS.indexOf(a.kind)-PREP_KINDS.indexOf(b.kind)||a.ref.localeCompare(b.ref,'en')).slice(0,limit);
}

/** Inline chips: [[note:id]] [[question:id-or-slug]] [[behavioral:theme]]. Code spans/blocks are left untouched. */
const CHIP=/\[\[(note|question|behavioral):([A-Za-z0-9-]{1,80})\]\]/g;
const CODE=/(```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]*`)/;
const CHIP_KIND={note:'note',question:'question',behavioral:'behavioral_theme'} as const;
export interface ChipRef{kind:PrepKind;ref:string;raw:string}
function chipLink(kind:keyof typeof CHIP_KIND,raw:string):PrepLink{const k=CHIP_KIND[kind];return {kind:k,ref:k==='question'?questionRef(raw)??raw.toLowerCase():raw.toLowerCase()};}
const outsideCode=(text:string,fn:(segment:string)=>string)=>text.split(CODE).map((s,i)=>i%2?s:fn(s)).join('');
export function chipRefs(text:string):ChipRef[]{const found:ChipRef[]=[];outsideCode(text,s=>{for(const m of s.matchAll(CHIP)){const link=chipLink(m[1] as keyof typeof CHIP_KIND,m[2]);found.push({...link,raw:m[0]});}return s;});return found;}
export const unknownChips=(text:string,ctx:PrepContext)=>chipRefs(text).filter(c=>!validPrepRef(c.kind,c.ref,ctx));
const escapeLabel=(s:string)=>s.replace(/[\\[\]`*_<>]/g,m=>'\\'+m);
/** Known references become a Markdown link marked with the "iv-chip" title (styled by Markdown); unknown ones become plain text. */
export function renderChips(text:string,ctx:PrepContext):string{
 if(!text.includes('[['))return text;
 return outsideCode(text,s=>s.replace(CHIP,(_m,kind:keyof typeof CHIP_KIND,raw:string)=>{const item=resolvePrepLink(chipLink(kind,raw),ctx);return item?`[${escapeLabel(item.label)}](${item.href} "iv-chip")`:raw;}));
}
/** Plain-text view for excerpts and search. */
export const stripChips=(text:string)=>text.replace(CHIP,'$2');

import {plainText,readMinutes,sectionId,CATEGORY_LABEL} from './articles';
import {guideSeries} from './content-series';
import type {HubGuide,HubSeries} from './content-hub';
/** Free guides (H4): pure helpers for the guide cards and the guide page. No data access here. */

/** One chapter of a guide: the body's "## " headings (code blocks skipped), with its own read time. Not stored. */
export interface GuideChapter{id:string;n:string;title:string;minutes:number}
const pad2=(n:number)=>String(n).padStart(2,'0');
export function guideChapters(body:string):GuideChapter[]{
 const out:{id:string;title:string;lines:string[]}[]=[];let fence=false;
 for(const line of (body??'').replace(/\r\n?/g,'\n').split('\n')){
  if(/^\s*(```|~~~)/.test(line)){fence=!fence;out.at(-1)?.lines.push(line);continue;}
  const m=!fence&&/^##\s+(.+?)\s*#*\s*$/.exec(line);
  if(m){const title=plainText(m[1]);if(title){out.push({id:sectionId(title),title,lines:[]});continue;}}
  out.at(-1)?.lines.push(line);
 }
 return out.map((c,i)=>({id:c.id,n:pad2(i+1),title:c.title,minutes:readMinutes(c.lines.join('\n'))}));
}
export interface GuideFact{value:string;label:string}
const plural=(n:number,one:string,many:string)=>n===1?one:many;
/** The facts row: chapters (from headings), minutes, and exercises only when set. Empty facts are left out. */
export function guideFacts(g:Pick<HubGuide,'chapters'|'minutes'|'exercises'>):GuideFact[]{
 const out:GuideFact[]=[];
 if(g.chapters>0)out.push({value:String(g.chapters),label:plural(g.chapters,'chapter','chapters')});
 if(g.minutes>0)out.push({value:`${g.minutes}m`,label:'to read'});
 if(g.exercises!==null&&g.exercises>0)out.push({value:String(g.exercises),label:plural(g.exercises,'exercise','exercises')});
 return out;
}
/** Up to three non-blank ticks. */
export const guideHighlights=(g:Pick<HubGuide,'highlights'>):string[]=>(g.highlights??[]).map(h=>h.trim()).filter(Boolean).slice(0,3);
/** The topic chip: the guide's series topic, else the older editorial label. */
export function guideTopic(g:Pick<HubGuide,'slug'|'series_id'>,series:Pick<HubSeries,'id'|'topic'>[]):string{
 const s=g.series_id?series.find(x=>x.id===g.series_id):undefined;
 return s?CATEGORY_LABEL[s.topic]:guideSeries(g);
}

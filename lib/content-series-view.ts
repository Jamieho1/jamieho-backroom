import {PLATFORM_LABEL,articleHref,type Platform} from './articles';
import {guideHref} from './guides';
import {SERIES_TOPIC_LABEL,seriesHref} from './content-series-data';
import type {HubGuide,HubPost,HubSeries} from './content-hub';
/** Series pages (/content/series, /content/series/[slug]): part ordering across articles and guides, coming slots and per-browser progress. Pure; no data access. */

/** One published part of a series: a post or a guide. `part` is its number in the series. */
export interface SeriesPart{kind:'post'|'guide';id:string;slug:string;title:string;part:number;platform:Platform|null;minutes:number;created_at:string;blurb:string;cover_url:string;firstSlide:string;href:string}
/** A numbered place in the series: a published part, or "coming" (planned, not yet published; no title is invented). */
export type SeriesSlot={n:number;part:SeriesPart}|{n:number;part:null};

const fromPost=(p:HubPost,part:number):SeriesPart=>({kind:'post',id:p.id,slug:p.slug,title:p.title,part,platform:p.platform,minutes:p.minutes,created_at:p.created_at,blurb:p.takeaway||p.summary,cover_url:p.cover_url,firstSlide:p.firstSlide,href:articleHref(p.slug)});
const fromGuide=(g:HubGuide,part:number):SeriesPart=>({kind:'guide',id:g.id,slug:g.slug,title:g.title,part,platform:null,minutes:g.minutes,created_at:g.created_at,blurb:g.summary,cover_url:g.cover_url,firstSlide:'',href:guideHref(g.slug)});

/** The published articles and guides of one series, in series order (part number, then publish date). A part without a number goes after the numbered ones. */
export function seriesParts(series:Pick<HubSeries,'id'>,posts:HubPost[],guides:HubGuide[]):SeriesPart[]{
 const rows=[...posts.filter(p=>p.series_id===series.id).map(p=>({part:p.series_part,make:(n:number)=>fromPost(p,n),at:p.created_at})),...guides.filter(g=>g.series_id===series.id).map(g=>({part:g.series_part,make:(n:number)=>fromGuide(g,n),at:g.created_at}))];
 rows.sort((a,b)=>(a.part??Infinity)-(b.part??Infinity)||a.at.localeCompare(b.at));
 let next=Math.max(0,...rows.map(r=>r.part??0));
 return rows.map(r=>r.make(r.part??++next));
}
/** Numbers 1..N with a published part where there is one and a "coming" slot where there is not. N is the planned count (or the highest published part if that is larger). */
export function seriesSlots(parts:SeriesPart[],planned:number):SeriesSlot[]{
 const total=Math.max(planned,...parts.map(p=>p.part),0);
 const slots:SeriesSlot[]=[];
 for(let n=1;n<=total;n++){const here=parts.filter(p=>p.part===n);if(here.length)for(const part of here)slots.push({n,part});else slots.push({n,part:null});}
 return slots;
}
export const slotParts=(slots:SeriesSlot[]):SeriesPart[]=>slots.flatMap(s=>s.part?[s.part]:[]);

export interface SeriesProgress{planned:number;out:number;read:number;minutes:number;percent:number;next:SeriesPart|null;first:SeriesPart|null;label:'Start'|'Continue'|'Read again';target:SeriesPart|null}
/** Progress in this browser. `next` is the first released part not yet read. Start (nothing read) / Continue (something read, more to read) / Read again (everything out is read). */
export function seriesProgress(slots:SeriesSlot[],read:ReadonlySet<string>):SeriesProgress{
 const released=slotParts(slots);
 const readCount=released.filter(p=>read.has(p.id)).length;
 const next=released.find(p=>!read.has(p.id))??null;
 const first=released[0]??null;
 const label=readCount===0?'Start':next?'Continue':'Read again';
 return {planned:slots.length,out:released.length,read:readCount,minutes:released.reduce((n,p)=>n+p.minutes,0),percent:slots.length?Math.round(readCount/slots.length*100):0,next,first,label,target:readCount===0?first:next??first};
}
/** "Instagram", "YouTube" or "Free guide" */
export const partKind=(p:Pick<SeriesPart,'kind'|'platform'>)=>p.kind==='guide'?'Free guide':PLATFORM_LABEL[p.platform??'other'];

export type CardRow={n:number;title:string;href:string;state:'done'|'next'|'soon'|'open'};
/** The first four parts of a series card: ✓ read, Next on the first unread released part, Soon for coming slots. */
export function cardRows(slots:SeriesSlot[],read:ReadonlySet<string>,limit=4):{rows:CardRow[];more:number}{
 const next=seriesProgress(slots,read).next;
 const rows=slots.slice(0,limit).map<CardRow>(s=>s.part?{n:s.n,title:s.part.title,href:s.part.href,state:read.has(s.part.id)?'done':s.part.id===next?.id?'next':'open'}:{n:s.n,title:`Part ${s.n}`,href:'',state:'soon'});
 return {rows,more:Math.max(0,slots.length-limit)};
}

/** Everything a series card or page renders, built on the server from the published rows. Only visible series (published, with at least one published part) are passed in. */
export function seriesViews(series:HubSeries[],posts:HubPost[],guides:HubGuide[]){
 return series.map(s=>({slug:s.slug,href:seriesHref(s.slug),title:s.title,goal:s.goal,topic:s.topic,topicLabel:SERIES_TOPIC_LABEL[s.topic],category:s.topic,slots:seriesSlots(seriesParts(s,posts,guides),s.planned_parts)}));
}
export {seriesHref};

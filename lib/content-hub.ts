import {CATEGORY_LABEL,PLATFORM_LABEL,readMinutes,normalizeCode,articleHref,type Category,type Platform} from './articles';
import {chapterCount,guideHref} from './guides';
import type {SeriesRow} from './content-series-data';
/** Content hub (/content): pure helpers for the Latest page, search and short links. No data access here. */

/** One post card. Read time is computed from the body on the server; the body itself is never sent to the browser. */
export interface HubPost{id:string;slug:string;title:string;summary:string;platform:Platform;category:Category;cover_url:string;firstSlide:string;created_at:string;series_id:string|null;series_part:number|null;code:string|null;takeaway:string;minutes:number;draftChanged?:boolean}
export interface HubGuide{id:string;slug:string;title:string;summary:string;cover_url:string;notion_url:string;doc_url:string;created_at:string;updated_at:string;series_id:string|null;series_part:number|null;audience:string;highlights:string[];exercises:number|null;minutes:number;chapters:number;draftChanged?:boolean}
export type HubSeries=Pick<SeriesRow,'id'|'slug'|'title'|'goal'|'topic'|'planned_parts'|'sort'>;
export interface HubData{posts:HubPost[];guides:HubGuide[];series:HubSeries[]}

type ArticleRow={id:string;slug:string;title:string;summary:string;body:string;platform:Platform;category:Category;cover_url:string;created_at:string;series_id:string|null;series_part:number|null;code:string|null;takeaway:string;slides:string[]|null;draftChanged?:boolean};
type GuideRow={id:string;slug:string;title:string;summary:string;body:string;cover_url:string;notion_url:string;doc_url:string;created_at:string;updated_at:string;series_id:string|null;series_part:number|null;audience:string;highlights:string[]|null;exercises:number|null;draftChanged?:boolean};
export function toHubPost(a:ArticleRow):HubPost{
 return {id:a.id,slug:a.slug,title:a.title,summary:a.summary??'',platform:a.platform,category:a.category,cover_url:a.cover_url??'',firstSlide:a.slides?.[0]??'',created_at:a.created_at,series_id:a.series_id??null,series_part:a.series_part??null,code:a.code??null,takeaway:a.takeaway??'',minutes:readMinutes(a.body??''),...(a.draftChanged?{draftChanged:true}:{})};
}
export function toHubGuide(g:GuideRow):HubGuide{
 return {id:g.id,slug:g.slug,title:g.title,summary:g.summary??'',cover_url:g.cover_url??'',notion_url:g.notion_url??'',doc_url:g.doc_url??'',created_at:g.created_at,updated_at:g.updated_at,series_id:g.series_id??null,series_part:g.series_part??null,audience:g.audience??'',highlights:g.highlights??[],exercises:g.exercises??null,minutes:readMinutes(g.body??''),chapters:chapterCount(g.body??''),...(g.draftChanged?{draftChanged:true}:{})};
}
export const newestFirst=<T extends {created_at:string}>(rows:T[]):T[]=>[...rows].sort((a,b)=>b.created_at.localeCompare(a.created_at));

/** A series is shown only when published and at least one published part (post or guide) belongs to it. */
export function visibleSeries(series:HubSeries[],posts:HubPost[],guides:HubGuide[]):HubSeries[]{
 const used=new Set([...posts,...guides].map(p=>p.series_id).filter((x):x is string=>!!x));
 return series.filter(s=>used.has(s.id)).sort((a,b)=>a.sort-b.sort||a.title.localeCompare(b.title));
}
/** "MCP 101 · 1/5": the series chip on a card; absent when the post has no (published) series. */
export function seriesChip(post:Pick<HubPost,'series_id'|'series_part'>,series:HubSeries[]):string{
 if(!post.series_id||post.series_part===null)return '';
 const s=series.find(x=>x.id===post.series_id);
 return s?`${s.title} · ${post.series_part}/${Math.max(s.planned_parts,post.series_part)}`:'';
}

/* ---------- Code lookup (short links and the search box) ---------- */
/** Exact, case-insensitive post code match. Returns null for empty, invalid or unknown codes. */
export function findPostByCode<T extends {code:string|null}>(posts:T[],raw:string):T|null{
 const code=normalizeCode(raw);
 return code?posts.find(p=>p.code===code)??null:null;
}
/** The code as written in a URL path or query (uppercase letters and digits only, max 16), else null. */
export function cleanCode(raw:string|null|undefined):string|null{
 const code=normalizeCode(raw??'');
 return code&&/^[A-Z0-9]{1,16}$/.test(code)?code:null;
}

/* ---------- Filters in the URL ---------- */
export interface Filters{topic:Category|'';platform:Platform|''}
export const NO_FILTERS:Filters={topic:'',platform:''};
const isTopic=(v:string|null):v is Category=>!!v&&Object.hasOwn(CATEGORY_LABEL,v);
const isPlatform=(v:string|null):v is Platform=>!!v&&Object.hasOwn(PLATFORM_LABEL,v);
/** Unknown or repeated values are ignored, so a hand-edited URL never breaks the page. */
export function parseFilters(params:{get(key:string):string|null}):Filters{
 const topic=params.get('topic'),platform=params.get('platform');
 return {topic:isTopic(topic)?topic:'',platform:isPlatform(platform)?platform:''};
}
/** "?topic=ai&platform=instagram", or "" when nothing is filtered (so the clean URL is /content). */
export function filtersQuery(f:Filters,keep:Record<string,string>={}):string{
 const p=new URLSearchParams();
 if(f.topic)p.set('topic',f.topic);if(f.platform)p.set('platform',f.platform);
 for(const [k,v] of Object.entries(keep))p.set(k,v);
 const s=p.toString();return s?`?${s}`:'';
}
export const filtersActive=(f:Filters)=>!!(f.topic||f.platform);
export const applyFilters=<T extends Pick<HubPost,'category'|'platform'>>(posts:T[],f:Filters):T[]=>posts.filter(p=>(!f.topic||p.category===f.topic)&&(!f.platform||p.platform===f.platform));
export interface FilterOption<V extends string>{value:V|'';label:string;count:number}
/** Dropdown options with counts. Each menu counts against the other filter (what you would get by choosing it). Empty options are hidden unless chosen. */
export function topicOptions(posts:HubPost[],f:Filters):FilterOption<Category>[]{
 const base=applyFilters(posts,{topic:'',platform:f.platform});
 return [{value:'',label:'All topics',count:base.length},...(Object.keys(CATEGORY_LABEL) as Category[]).map(c=>({value:c,label:CATEGORY_LABEL[c],count:base.filter(p=>p.category===c).length})).filter(o=>o.count>0||o.value===f.topic)];
}
export function platformOptions(posts:HubPost[],f:Filters):FilterOption<Platform>[]{
 const base=applyFilters(posts,{topic:f.topic,platform:''});
 return [{value:'',label:'All platforms',count:base.length},...(Object.keys(PLATFORM_LABEL) as Platform[]).map(p=>({value:p,label:PLATFORM_LABEL[p],count:base.filter(x=>x.platform===p).length})).filter(o=>o.count>0||o.value===f.platform)];
}

/* ---------- Months, badges, read time ---------- */
const MONTH=new Intl.DateTimeFormat('en-GB',{month:'long',year:'numeric',timeZone:'Europe/London'});
const PARTS=new Intl.DateTimeFormat('en-GB',{year:'numeric',month:'2-digit',timeZone:'Europe/London'});
export function monthKey(iso:string):string{
 const d=new Date(iso);if(Number.isNaN(d.getTime()))return 'unknown';
 const p=Object.fromEntries(PARTS.formatToParts(d).map(x=>[x.type,x.value]));return `${p.year}-${p.month}`;
}
export function monthLabel(iso:string):string{const d=new Date(iso);return Number.isNaN(d.getTime())?'Undated':MONTH.format(d);}
export interface MonthGroup<T>{key:string;label:string;posts:T[];total:number}
/** Groups the visible posts (already newest first) by month. `total` counts the whole filtered list, not just the visible part. */
export function groupByMonth<T extends {created_at:string}>(visible:T[],all:T[]=visible):MonthGroup<T>[]{
 const totals=new Map<string,number>();for(const p of all)totals.set(monthKey(p.created_at),(totals.get(monthKey(p.created_at))??0)+1);
 const groups:MonthGroup<T>[]=[];
 for(const p of visible){const key=monthKey(p.created_at);let g=groups.at(-1);if(!g||g.key!==key){g={key,label:monthLabel(p.created_at),posts:[],total:totals.get(key)??0};groups.push(g);}g.posts.push(p);}
 return groups;
}
export const monthHeading=(g:{label:string;total:number})=>`${g.label} · ${g.total} ${g.total===1?'post':'posts'}`;
export const NEW_DAYS=14;
/** NEW: published in the last 14 days. Computed in the browser so a cached page never shows a stale badge. */
export function isNew(iso:string,now:number):boolean{const t=Date.parse(iso);return Number.isFinite(t)&&now-t<=NEW_DAYS*86_400_000;}
/** "5 min read", or "5 min video" for YouTube (the body is the video's written version, so its length is the best estimate we have). */
export const timeLabel=(p:Pick<HubPost,'platform'|'minutes'>)=>`${p.minutes} min ${p.platform==='youtube'?'video':'read'}`;
export const PAGE_STEP=12;

/* ---------- Search ---------- */
export interface SearchItem{kind:'post'|'guide'|'series';title:string;summary:string;href:string;code:string|null;platform?:Platform}
/** Titles and summaries of posts, series and guides: small enough to ship with the pre-rendered page. */
export function buildSearchIndex(d:{posts:HubPost[];guides:HubGuide[];series:HubSeries[]}):SearchItem[]{
 return [
  ...d.posts.map(p=>({kind:'post' as const,title:p.title,summary:p.summary,href:articleHref(p.slug),code:p.code,platform:p.platform})),
  ...d.series.map(s=>({kind:'series' as const,title:s.title,summary:s.goal,href:'/content/series',code:null})),
  ...d.guides.map(g=>({kind:'guide' as const,title:g.title,summary:g.summary,href:guideHref(g.slug),code:null})),
 ];
}
export type SearchResult={mode:'idle'}|{mode:'code';hit:SearchItem}|{mode:'results';items:SearchItem[]};
export const SEARCH_LIMIT=8;
/** An exact post code gives one row that opens the post; anything else searches titles and summaries (every word must match; title matches first). */
export function runSearch(index:SearchItem[],query:string):SearchResult{
 const q=query.trim();if(!q)return {mode:'idle'};
 const code=cleanCode(q);
 const byCode=code?index.find(i=>i.kind==='post'&&i.code===code):undefined;
 if(byCode)return {mode:'code',hit:byCode};
 const words=q.toLowerCase().split(/\s+/).filter(Boolean);
 const scored=index.flatMap((item,order)=>{
  const title=item.title.toLowerCase(),text=`${title} ${item.summary.toLowerCase()}`;
  return words.every(w=>text.includes(w))?[{item,order,rank:words.every(w=>title.includes(w))?0:1}]:[];
 }).sort((a,b)=>a.rank-b.rank||a.order-b.order);
 return {mode:'results',items:scored.slice(0,SEARCH_LIMIT).map(s=>s.item)};
}
export const KIND_LABEL={post:'Post',guide:'Free guide',series:'Series'} as const;

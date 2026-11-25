import {CATEGORY_LABEL,PLATFORM_LABEL,articleDate,type Article,type Platform} from './articles';
import {timeLabel,type HubPost,type HubSeries,type HubGuide} from './content-hub';
import {guideChapters} from './guide-view';
import {seriesParts,type SeriesPart} from './content-series-view';
/** The post page (/articles/<slug>): pure helpers for the chapter rail, series bar, next part, related posts and slides. No data access here. */

/** The left chapter rail: the body's "## " headings (code blocks skipped). Same extraction as the guide page and My story. */
export const postChapters=guideChapters;

/** "Part 1 of 5": the total is the planned count, or the part itself when it is larger. */
export const partOfLabel=(part:number,series:Pick<HubSeries,'planned_parts'>)=>`part ${part} of ${Math.max(series.planned_parts,part)}`;
/** Breadcrumb tail "MCP 101 · part 1 of 5", or null when the post has no (published) series. */
export function crumbSeries(post:Pick<Article,'series_id'|'series_part'>,series:HubSeries[]):{series:HubSeries;label:string}|null{
 const s=post.series_id?series.find(x=>x.id===post.series_id):undefined;
 if(!s)return null;
 return {series:s,label:post.series_part===null?s.title:`${s.title} · ${partOfLabel(post.series_part,s)}`};
}
/** "11 Nov 2026 · 5 min read · AI · Code MCP101" (a YouTube post says "min video", as on its card). The code is left out when empty. */
export function postMeta(a:Pick<Article,'created_at'|'category'|'platform'|'code'>,minutes:number):string{
 return [articleDate(a.created_at),timeLabel({platform:a.platform,minutes}),CATEGORY_LABEL[a.category],a.code?`Code ${a.code}`:''].filter(Boolean).join(' · ');
}
const ORIGIN:Record<Platform,string>={instagram:'Instagram carousel',youtube:'YouTube video',xiaohongshu:'RedNote post',other:'post'};
/** "The long version of my Instagram carousel." */
export const originLine=(platform:Platform)=>`The long version of my ${ORIGIN[platform]}.`;
export const originName=(platform:Platform)=>PLATFORM_LABEL[platform];

/** The next part of the post's series by part number (an article or a guide), or null: no series, no part number, or this is the last released part. */
export function nextPart(post:Pick<Article,'series_id'|'series_part'>,posts:HubPost[],guides:HubGuide[]):SeriesPart|null{
 if(!post.series_id||post.series_part===null)return null;
 const parts=seriesParts({id:post.series_id},posts,guides);
 return parts.find(p=>p.part>post.series_part!)??null;
}
/** "More like this": up to three other posts, the same series first (in part order), then the same topic (newest first). No padding from other topics. */
export function relatedPosts(posts:HubPost[],current:Pick<Article,'id'|'series_id'|'category'>,n=3):HubPost[]{
 const others=posts.filter(p=>p.id!==current.id);
 const sameSeries=current.series_id?others.filter(p=>p.series_id===current.series_id).sort((a,b)=>(a.series_part??Infinity)-(b.series_part??Infinity)||b.created_at.localeCompare(a.created_at)):[];
 const used=new Set(sameSeries.map(p=>p.id));
 const sameTopic=others.filter(p=>!used.has(p.id)&&p.category===current.category).sort((a,b)=>b.created_at.localeCompare(a.created_at));
 return [...sameSeries,...sameTopic].slice(0,n);
}
/** Slide viewer: next/previous with wrap-around, so focus never lands on a disabled button. */
export const stepSlide=(index:number,delta:number,count:number)=>count<=0?0:(((index+delta)%count)+count)%count;

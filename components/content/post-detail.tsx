import Link from 'next/link';
import {ArticleMarkdown} from '@/components/articles/article-markdown';
import {YouTubeEmbed} from '@/components/articles/youtube';
import {StoryNav} from '@/components/story/story-nav';
import {MarkRead} from './mark-read';
import {PostActions} from './post-actions';
import {PostSlides} from './post-slides';
import {RelatedPosts} from './related-posts';
import {PlatformMark} from './post-card';
import {readMinutes,youtubeId,type Article} from '@/lib/articles';
import {seriesHref} from '@/lib/content-series-data';
import type {SeriesPart} from '@/lib/content-series-view';
import type {HubPost,HubSeries} from '@/lib/content-hub';
import {crumbSeries,originLine,partOfLabel,postChapters,postMeta} from '@/lib/post-view';

/** The post page in the My story look: crumb, title, meta with Pin, origin banner, slides, the body with the chapter rail, series bar, More like this. */
export function PostDetail({article,series,next,related,allSeries,project,unpublished=false}:{article:Article;series:HubSeries|null;next:SeriesPart|null;related:HubPost[];allSeries:HubSeries[];project?:{name:string}|null;unpublished?:boolean}){
 const chapters=postChapters(article.body);
 const crumb=crumbSeries(article,series?[series]:[]);
 const video=article.source_url?youtubeId(article.source_url):null;
 const slides=article.slides??[];
 const total=series?Math.max(series.planned_parts,article.series_part??0):0;
 return <div className="guide-page post-page">
  <article className="article-read guide-read" data-draft-changed={article.draftChanged||undefined}>
   <MarkRead id={article.id}/>
   <header className="hub-in guide-hero" id="overview">
    <nav className="guide-crumb" aria-label="Breadcrumb"><Link href="/content" prefetch={false}>Content</Link>{crumb?<><span aria-hidden="true">/</span><Link href={seriesHref(crumb.series.slug)} prefetch={false}>{crumb.label}</Link></>:null}</nav>
    <h1>{article.title}</h1>
    {unpublished?<p role="status" className="hub-note">Unpublished in this preview</p>:null}
    {article.summary?<p className="sty-lede">{article.summary}</p>:null}
    <div className="post-metarow"><div className="sty-hmeta">{postMeta(article,readMinutes(article.body))}</div><PostActions id={article.id} slug={article.slug} title={article.title}/></div>
    {project?<p className="post-project">Part of <Link href="/projects" prefetch={false}>{project.name}</Link></p>:null}
    {article.source_url?<div className="post-origin"><PlatformMark platform={article.platform}/><span>{originLine(article.platform)}</span><a href={article.source_url} target="_blank" rel="noopener noreferrer">View post ↗</a></div>:null}
   </header>
   {video?<div className="hub-in post-media"><YouTubeEmbed id={video} title={article.title}/></div>:null}
   {slides.length?<div className="hub-in"><PostSlides slides={slides} title={article.title}/></div>:null}
   {/* eslint-disable-next-line @next/next/no-img-element */}
   {article.cover_url&&!video&&!slides.length?<div className="hub-in"><img className="guide-cover" src={article.cover_url} alt="" referrerPolicy="no-referrer"/></div>:null}
   {chapters.length
    ?<div className="hub-in sty-body guide-bodywrap"><StoryNav items={chapters.map(({id,n,title})=>({id,n,title}))}/><div className="sty-cols guide-body" id="story-cols"><ArticleMarkdown text={article.body}/></div></div>
    :<div className="hub-in guide-bodywrap"><div className="guide-body guide-col"><ArticleMarkdown text={article.body}/></div></div>}
   {series?<nav className="hub-in post-nextbar" aria-label="Series"><Link href={seriesHref(series.slug)} prefetch={false}><span className="hub-part-k">Series</span><b>All {total} parts of {series.title}</b>{article.series_part!==null?<small>You are on {partOfLabel(article.series_part,series)}</small>:null}</Link>
    {next?<Link className="is-next" href={next.href} prefetch={false}><span className="hub-part-k">Next · part {next.part}</span><b>{next.title} →</b></Link>:null}</nav>:null}
   <div className="hub-in"><RelatedPosts posts={related} series={allSeries}/></div>
  </article>
 </div>;
}

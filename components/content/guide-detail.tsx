import Link from 'next/link';
import {ArticleMarkdown} from '@/components/articles/article-markdown';
import {StoryNav} from '@/components/story/story-nav';
import {MarkRead} from './mark-read';
import {articleDate,readMinutes} from '@/lib/articles';
import {guideChapters} from '@/lib/guide-view';
import {partKind,type SeriesPart} from '@/lib/content-series-view';
import type {Guide} from '@/lib/guides';

/** The free guide page in the My story look: hero, "Take it with you", chapter cards, then the body with the chapter rail. */
export function GuideDetail({guide,topic,posts,unpublished=false}:{guide:Guide;topic:string;posts:SeriesPart[];unpublished?:boolean}){
 const chapters=guideChapters(guide.body);
 const meta=[chapters.length?`${chapters.length} ${chapters.length===1?'chapter':'chapters'}`:'',`~${readMinutes(guide.body)} min read`,`Updated ${articleDate(guide.updated_at)}`].filter(Boolean);
 const toolkit=!!(guide.notion_url||guide.doc_url);
 return <div className="guide-page">
  <article className="article-read guide-read" data-draft-changed={guide.draftChanged||undefined}>
   <MarkRead id={guide.id}/>
   <header className="hub-in guide-hero" id="overview">
    <nav className="guide-crumb" aria-label="Breadcrumb"><Link href="/content" prefetch={false}>Content</Link><span aria-hidden="true">/</span><Link href="/content/guides" prefetch={false}>Free guides</Link></nav>
    <p className="sty-eyebrow">FREE GUIDE · {topic.toUpperCase()}</p>
    <h1>{guide.title}</h1>
    {unpublished?<p role="status" className="hub-note">Unpublished in this preview</p>:null}
    {guide.summary?<p className="sty-lede">{guide.summary}</p>:null}
    <div className="sty-hmeta">{meta.join(' · ')}</div>
    {chapters.length?<div className="guide-actions"><a className="hub-btn" href={`#${chapters[0].id}`}>Start chapter 1 →</a></div>:null}
   </header>
   {toolkit||posts.length?<section className="hub-in guide-take" aria-labelledby="guide-take-h"><div className="guide-take-card">
    <h2 id="guide-take-h">Take it with you</h2>
    {toolkit?<div className="guide-toolkit" aria-label="Toolkit">
     {guide.notion_url?<a className="hub-btn" href={guide.notion_url} target="_blank" rel="noopener noreferrer" aria-label="Open the Notion toolkit ↗">Open the Notion toolkit ↗</a>:null}
     {guide.doc_url?<a className="hub-btn is-ghost" href={guide.doc_url} target="_blank" rel="noopener noreferrer">Copy the Google Doc ↗</a>:null}
    </div>:null}
    {posts.length?<div className="guide-links"><h3>Posts that link here</h3><ul>{posts.map(p=><li key={p.id}><Link href={p.href} prefetch={false}><span className="hub-part-k">Part {p.part} · {partKind(p)}</span><b>{p.title}</b></Link></li>)}</ul></div>:null}
   </div></section>:null}
   {chapters.length?<section className="hub-in guide-chapters" aria-labelledby="guide-ch-h">
    <h2 id="guide-ch-h" className="guide-h">Chapters</h2>
    <ol className="guide-chgrid">{chapters.map(c=><li key={c.id}><a href={`#${c.id}`}><span className="n">{c.n}</span><b>{c.title}</b><small>{c.minutes} min</small></a></li>)}</ol>
   </section>:null}
   {/* eslint-disable-next-line @next/next/no-img-element */}
   {guide.cover_url?<div className="hub-in"><img className="guide-cover" src={guide.cover_url} alt="" referrerPolicy="no-referrer"/></div>:null}
   {chapters.length
    ?<div className="hub-in sty-body guide-bodywrap"><StoryNav items={chapters.map(({id,n,title})=>({id,n,title}))}/><div className="sty-cols guide-body" id="story-cols"><ArticleMarkdown text={guide.body}/></div></div>
    :<div className="hub-in guide-bodywrap"><div className="guide-body guide-col"><ArticleMarkdown text={guide.body}/></div></div>}
  </article>
 </div>;
}

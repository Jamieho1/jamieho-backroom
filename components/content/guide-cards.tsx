import Link from 'next/link';
import {articleDate} from '@/lib/articles';
import {guideHref} from '@/lib/guides';
import {guideFacts,guideHighlights,guideTopic} from '@/lib/guide-view';
import type {HubGuide,HubSeries} from '@/lib/content-hub';

/** Free guide cards (/content/guides): enough to decide without opening the guide. Empty parts are left out. */
export function GuideCards({guides,series}:{guides:HubGuide[];series:Pick<HubSeries,'id'|'topic'>[]}){
 if(!guides.length)return <p className="hub-empty">No guides published yet.</p>;
 return <div className="hub-ggrid">{guides.map(g=>{
  const facts=guideFacts(g),ticks=guideHighlights(g);
  return <article key={g.id} className="hub-gcard guide-card" data-draft-changed={g.draftChanged||undefined}>
   <div className="hub-gcard-hd">
    <span className="hub-chips"><span className="hub-chip is-gold">{guideTopic(g,series)}</span><span className="hub-chip">Updated {articleDate(g.updated_at)}</span></span>
    <h3><Link href={guideHref(g.slug)} prefetch={false}>{g.title}</Link></h3>
    {g.summary?<p className="hub-gcard-sub">{g.summary}</p>:null}
   </div>
   {facts.length?<dl className="hub-facts" style={{gridTemplateColumns:`repeat(${facts.length},1fr)`}}>{facts.map(f=><div key={f.label}><dt><b>{f.value}</b></dt><dd>{f.label}</dd></div>)}</dl>:null}
   {g.audience||ticks.length?<div className="hub-gcard-bd">
    {g.audience?<p className="hub-for"><b>For:</b> {g.audience}</p>:null}
    {ticks.length?<ul className="hub-ticks">{ticks.map((t,i)=><li key={i}>{t}</li>)}</ul>:null}
   </div>:null}
   <div className="hub-gcard-act">
    <Link className="hub-btn" href={guideHref(g.slug)} prefetch={false}>Read the guide →</Link>
    {g.notion_url?<a className="hub-btn is-ghost" href={g.notion_url} target="_blank" rel="noopener noreferrer">Notion toolkit ↗</a>:null}
    {g.doc_url?<a className="hub-btn is-ghost" href={g.doc_url} target="_blank" rel="noopener noreferrer">Google Doc ↗</a>:null}
   </div>
  </article>;
 })}</div>;
}

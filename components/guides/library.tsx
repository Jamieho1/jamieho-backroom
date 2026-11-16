"use client";
import Link from 'next/link';
import {useMemo,useState,type ReactNode} from 'react';
import {guideHref,type GuideCard} from '@/lib/guides';
import {guideSeries,type ContentSeries} from '@/lib/content-series';
import {articleDate} from '@/lib/articles';
import {useViewer} from '@/components/viewer-provider';

/** Resources share Articles' independent browse/reading panes, without article-only pins. */
export function GuidesShell({guides,currentId,children}:{guides:GuideCard[];currentId?:string;children?:ReactNode}) {
 const {viewer}=useViewer();
 const [search,setSearch]=useState('');const [series,setSeries]=useState<ContentSeries|''>('');
 const [count,setCount]=useState(8);
 const shown=useMemo(()=>guides.filter(g=>(!series||guideSeries(g)===series)&&`${g.title} ${g.summary}`.toLowerCase().includes(search.toLowerCase().trim())),[guides,search,series]);
 const seriesOptions=[...new Set(guides.map(guideSeries))];
 return <div className="articles-wrap"><div className="articles-app">
  <aside className="articles-side" aria-label="Browse resources" tabIndex={0} onScroll={event=>{const el=event.currentTarget;if(el.scrollHeight-el.scrollTop-el.clientHeight<48)setCount(n=>Math.min(n+8,shown.length));}}>
   <div className="articles-side-head"><Link className="articles-home" href="/resources">Resources</Link>{viewer.status==='owner'?<Link className="btn ghost small" href="/guides/manage" prefetch={false}>Manage guides</Link>:null}</div>
   <label className="field"><span className="sr-only">Search resources</span><input type="search" placeholder="Search resources…" value={search} onChange={e=>{setSearch(e.target.value);setCount(8);}} /></label>
   <div className="articles-pills" role="group" aria-label="Series">{(['',...seriesOptions] as (ContentSeries|'')[]).map(s=><button key={s||'all'} type="button" className="articles-pill" aria-pressed={series===s} onClick={()=>{setSeries(s);setCount(8);}}>{s||'All series'}</button>)}</div>
   <nav className="articles-list" aria-label="Latest resources"><h2 className="articles-list-heading">Latest resources</h2>
    {shown.slice(0,count).map(g=><Link key={g.id} href={guideHref(g.slug)} prefetch={false} aria-current={g.id===currentId?'page':undefined}><span>{g.title}</span><small>{guideSeries(g)} · {articleDate(g.updated_at)}</small></Link>)}
    {shown.length>count?<button type="button" className="btn ghost small" onClick={()=>setCount(n=>n+8)}>Show more</button>:null}
    {!shown.length?<p className="muted">No matching resources.</p>:null}
   </nav>
  </aside>
  <div className="articles-main">{children??<section aria-label="All resources"><header className="articles-intro"><h1>Resources</h1><p>Free guides and practical references.</p></header><h2 className="resources-guides-heading">Guides</h2>
   {shown.length?<div className="articles-grid">{shown.map(g=><Link key={g.id} className="catalog-card article-card guide-card" href={guideHref(g.slug)} prefetch={false} data-draft-changed={g.draftChanged||undefined} aria-label={g.title}>
    {g.cover_url?/* eslint-disable-next-line @next/next/no-img-element */<img className="article-card-cover" src={g.cover_url} alt="" loading="lazy" referrerPolicy="no-referrer" />:<div className="article-card-cover placeholder" aria-hidden="true">{guideSeries(g)}</div>}
    <div className="catalog-card-body"><span className="content-series-tag">{guideSeries(g)}</span><h2>{g.title}</h2>{g.summary?<p>{g.summary}</p>:null}</div>
    <div className="catalog-card-footer"><span className="site-auth-button">Read guide <span aria-hidden="true">→</span></span></div>
   </Link>)}</div>:<p className="muted">{guides.length?'No resources match these filters.':'No guides published yet.'}</p>}
  </section>}</div>
 </div></div>;
}

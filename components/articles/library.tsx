'use client';
import Link from 'next/link';
import {useMemo,useState,type ReactNode} from 'react';
import {useViewer} from '@/components/viewer-provider';
import {CATEGORY_LABEL,PLATFORM_LABEL,articleDate,articleHref,type ArticleCard,type Category,type Platform} from '@/lib/articles';

export function ArticleManageLink(){const {viewer}=useViewer();return viewer.status==='owner'?<Link className="btn ghost small" prefetch={false} href="/articles/manage">Manage articles</Link>:null;}

const LIST_STEP=8,GRID_STEP=6;
const PLATFORMS:(Platform|'')[]=['','youtube','instagram','xiaohongshu'];

/**
 * Articles app: a left column with search, category pills, a platform toggle and (on an article page) a short list
 * of posts; the main column shows either the cards (index) or the article itself.
 */
export function ArticlesShell({articles,currentId,children,footer}:{articles:ArticleCard[];currentId?:string;children?:ReactNode;footer?:ReactNode}){
 const [search,setSearch]=useState('');const [category,setCategory]=useState<Category|''>('');const [platform,setPlatform]=useState<Platform|''>('');
 const [listN,setListN]=useState(LIST_STEP);const [gridN,setGridN]=useState(GRID_STEP);
 const shown=useMemo(()=>articles.filter(a=>(!category||a.category===category)&&(!platform||a.platform===platform)&&`${a.title} ${a.summary}`.toLowerCase().includes(search.toLowerCase().trim())),[articles,category,platform,search]);
 const usedPlatforms=PLATFORMS.filter(p=>!p||articles.some(a=>a.platform===p));
 const reset=()=>{setListN(LIST_STEP);setGridN(GRID_STEP);};
 const empty=<p className="muted">{articles.length?'No articles match these filters.':'No articles have been published yet.'}</p>;
 return <div className="articles-wrap"><div className="articles-app">
  <aside className="articles-side" aria-label="Browse articles">
   <div className="articles-side-head"><Link href="/articles" prefetch={false} className="articles-home">Articles</Link><ArticleManageLink /></div>
   <label className="field"><span className="sr-only">Search articles</span><input type="search" placeholder="Search articles…" value={search} onChange={e=>{setSearch(e.target.value);reset();}} /></label>
   <div className="articles-pills" role="group" aria-label="Category">
    {(['',...Object.keys(CATEGORY_LABEL)] as (Category|'')[]).map(c=><button key={c||'all'} type="button" className="articles-pill" aria-pressed={category===c} onClick={()=>{setCategory(c);reset();}}>{c?CATEGORY_LABEL[c]:'All'}</button>)}
   </div>
   {usedPlatforms.length>2?<div className="articles-toggle" role="group" aria-label="Platform">
    {usedPlatforms.map(p=><button key={p||'all'} type="button" aria-pressed={platform===p} onClick={()=>{setPlatform(p);reset();}}>{p?PLATFORM_LABEL[p]:'All'}</button>)}
   </div>:null}
   {currentId?<nav aria-label="Articles" className="articles-list">
    {shown.slice(0,listN).map(a=><Link key={a.id} href={articleHref(a.slug)} prefetch={false} aria-current={a.id===currentId?'page':undefined}><span>{a.title}</span><small>{articleDate(a.created_at)} · {CATEGORY_LABEL[a.category]}</small></Link>)}
    {!shown.length?empty:null}
    {shown.length>listN?<button type="button" className="btn ghost small" onClick={()=>setListN(n=>n+LIST_STEP)}>Show more</button>:null}
   </nav>:null}
  </aside>
  <div className="articles-main">
   {children??<section aria-label="All articles">
    <header className="articles-intro"><h1>Articles</h1><p>Notes on AI, career, productivity and building in public — the written side of my videos and posts.</p></header>
    {!shown.length?empty:<div className="articles-grid">{shown.slice(0,gridN).map(a=><ArticleCardView key={a.id} a={a} />)}</div>}
    {shown.length>gridN?<button type="button" className="btn ghost" onClick={()=>setGridN(n=>n+GRID_STEP)}>Show more</button>:null}
   </section>}
   {footer}
  </div>
 </div></div>;
}

export function ArticleCardView({a}:{a:ArticleCard}){
 return <article className="article-card">
  <Link className="article-card-image-link" href={articleHref(a.slug)} prefetch={false} aria-label={`Read ${a.title}`}>
   {a.cover_url?/* eslint-disable-next-line @next/next/no-img-element */<img className="article-card-cover" src={a.cover_url} alt="" loading="lazy" referrerPolicy="no-referrer" />:<div className="article-card-cover placeholder" aria-hidden="true">{CATEGORY_LABEL[a.category]}</div>}
  </Link>
  <p className="article-meta">{articleDate(a.created_at)} · {CATEGORY_LABEL[a.category]}</p>
  <h2><Link href={articleHref(a.slug)} prefetch={false}>{a.title}</Link></h2>
  {a.summary?<p>{a.summary}</p>:null}
 </article>;
}

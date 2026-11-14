'use client';
import Link from 'next/link';
import {useMemo,useState,type ReactNode,type UIEvent} from 'react';
import {useViewer} from '@/components/viewer-provider';
import {SignInButton} from '@/components/sign-in-button';
import {useArticlePins} from './use-article-pins';
import {CATEGORY_LABEL,PLATFORM_LABEL,articleDate,articleHref,type ArticleCard,type Category,type Platform} from '@/lib/articles';

export function ArticleManageLink(){const {viewer}=useViewer();return viewer.status==='owner'?<Link className="btn ghost small" prefetch={false} href="/articles/manage">Manage articles</Link>:null;}

const LIST_STEP=8,GRID_STEP=6;
const PLATFORMS:(Platform|'')[]=['','youtube','instagram','xiaohongshu'];

/**
 * Articles app: a left column with search, category pills, a platform toggle and a short newest-first list
 * of posts; the main column shows either the cards (index) or the article itself.
 */
export function ArticlesShell({articles,currentId,children,footer}:{articles:ArticleCard[];currentId?:string;children?:ReactNode;footer?:ReactNode}){
 const {viewer,configured}=useViewer();
 const signedIn=viewer.status==='member'||viewer.status==='owner';
 const pins=useArticlePins(signedIn&&viewer.id?viewer.id:null);
 const pinnedArticles=[...pins.ids].flatMap(id=>articles.filter(a=>a.id===id));
 const pinButton=(a:ArticleCard)=><button type="button" className="article-pin" aria-label={`${pins.ids.has(a.id)?'Unpin':'Pin'} ${a.title}`} aria-pressed={pins.ids.has(a.id)} disabled={!pins.loaded||pins.saving} onClick={()=>void pins.save(a.id,!pins.ids.has(a.id))}><svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m12 2 6 6-3 1-3 5-2-2-6 6m6-6-4-4 5-3z" /></svg></button>;
 const [search,setSearch]=useState('');const [category,setCategory]=useState<Category|''>('');const [platform,setPlatform]=useState<Platform|''>('');
 const [listN,setListN]=useState(LIST_STEP);const [gridN,setGridN]=useState(GRID_STEP);
 const shown=useMemo(()=>articles.filter(a=>(!category||a.category===category)&&(!platform||a.platform===platform)&&`${a.title} ${a.summary}`.toLowerCase().includes(search.toLowerCase().trim())),[articles,category,platform,search]);
 const usedPlatforms=PLATFORMS.filter(p=>!p||articles.some(a=>a.platform===p));
 const reset=()=>{setListN(LIST_STEP);setGridN(GRID_STEP);};
 const moreLatest=(event:UIEvent<HTMLElement>)=>{const el=event.currentTarget;if(el.scrollHeight-el.scrollTop-el.clientHeight<48)setListN(n=>Math.min(n+LIST_STEP,shown.length));};
 const empty=<p className="muted">{articles.length?'No articles match these filters.':'No articles have been published yet.'}</p>;
 return <div className="articles-wrap"><div className="articles-app">
  <aside className="articles-side" aria-label="Browse articles" onScroll={moreLatest} tabIndex={0}>
   <div className="articles-side-head"><Link href="/articles" prefetch={false} className="articles-home">Articles</Link><ArticleManageLink /></div>
   <label className="field"><span className="sr-only">Search articles</span><input type="search" placeholder="Search articles…" value={search} onChange={e=>{setSearch(e.target.value);reset();}} /></label>
   <div className="articles-pills" role="group" aria-label="Category">
    {(['',...Object.keys(CATEGORY_LABEL)] as (Category|'')[]).map(c=><button key={c||'all'} type="button" className="articles-pill" aria-pressed={category===c} onClick={()=>{setCategory(c);reset();}}>{c?CATEGORY_LABEL[c]:'All'}</button>)}
   </div>
   {usedPlatforms.length>2?<div className="articles-toggle" role="group" aria-label="Platform">
    {usedPlatforms.map(p=><button key={p||'all'} type="button" aria-pressed={platform===p} onClick={()=>{setPlatform(p);reset();}}>{p?PLATFORM_LABEL[p]:'All'}</button>)}
   </div>:null}
   {signedIn?<section className="articles-pinned" aria-label="Pinned posts">
    <h2 className="articles-list-heading">Pinned posts</h2>
    {pins.loading?<p className="muted" role="status">Loading pins…</p>:pins.loadError?<p role="alert">{pins.loadError} <button type="button" className="btn ghost small" onClick={pins.reload}>Retry loading pins</button></p>:!pinnedArticles.length?<p className="muted">Pin posts below to find them here.</p>:<nav className="articles-list" aria-label="Pinned articles">{pinnedArticles.map(a=><div className="article-sidebar-row" key={a.id}><Link href={articleHref(a.slug)} prefetch={false} aria-current={a.id===currentId?'page':undefined}><span>{a.title}</span></Link>{pinButton(a)}</div>)}</nav>}
   </section>:viewer.status==='anonymous'?<div className="articles-pin-signin"><p className="muted">Sign in to pin posts across devices.</p>{configured?<SignInButton label="Sign in to pin posts" next={currentId?articleHref(articles.find(a=>a.id===currentId)?.slug??''):'/articles'} />:null}</div>:null}
   {pins.saveError?<p role="alert">{pins.saveError} <button type="button" className="btn ghost small" onClick={()=>void pins.retry()}>Retry pin change</button></p>:null}
   <nav aria-label="Articles" className="articles-list" onScroll={moreLatest}>
    <h2 className="articles-list-heading">Latest posts</h2>
    {shown.slice(0,listN).map(a=><div className="article-sidebar-row" key={a.id}><Link href={articleHref(a.slug)} prefetch={false} aria-current={a.id===currentId?'page':undefined}><span>{a.title}</span><small>{articleDate(a.created_at)} · {CATEGORY_LABEL[a.category]}</small></Link>{signedIn?pinButton(a):null}</div>)}
    {!shown.length?<p className="muted">{articles.length?'No matching posts.':'No published posts yet.'}</p>:null}
    {shown.length>listN?<button type="button" className="btn ghost small" onClick={()=>setListN(n=>n+LIST_STEP)}>Show more</button>:null}
   </nav>
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
 return <Link data-draft-changed={a.draftChanged||undefined} className="catalog-card article-card" href={articleHref(a.slug)} prefetch={false} aria-label={a.title}>
   {a.cover_url?/* eslint-disable-next-line @next/next/no-img-element */<img className="article-card-cover" src={a.cover_url} alt="" loading="lazy" referrerPolicy="no-referrer" />:<div className="article-card-cover placeholder" aria-hidden="true">{CATEGORY_LABEL[a.category]}</div>}
  <div className="catalog-card-body article-card-body">
   <p className="article-meta">{articleDate(a.created_at)} · {CATEGORY_LABEL[a.category]}</p>
   <h2>{a.title}</h2>
   {a.summary?<p>{a.summary}</p>:null}
  </div>
  <div className="catalog-card-footer"><span className="site-auth-button">Read article <span aria-hidden="true">→</span></span></div>
 </Link>;
}

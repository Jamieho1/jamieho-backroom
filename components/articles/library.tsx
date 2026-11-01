'use client';
import Link from 'next/link';
import {useState} from 'react';
import {useViewer} from '@/components/viewer-provider';
import {PLATFORM_LABEL,articleHref,type ArticleCard} from '@/lib/articles';
export function ArticleManageLink(){const {viewer}=useViewer();return viewer.status==='owner'?<Link className="btn ghost" prefetch={false} href="/articles/manage">Manage articles</Link>:null;}
export function ArticlesLibrary({articles}:{articles:ArticleCard[]}){
 const [search,setSearch]=useState('');const [platform,setPlatform]=useState('');
 const shown=articles.filter(a=>(!platform||a.platform===platform)&&`${a.title} ${a.summary}`.toLowerCase().includes(search.toLowerCase().trim()));
 return <div className="page articles-page"><header className="articles-heading"><div><p className="eyebrow">Extra references</p><h1>Articles</h1></div><ArticleManageLink /></header>
  <p>Further reading and references for my YouTube videos and Instagram posts.</p>
  <div className="articles-filters"><label className="field"><span>Search articles</span><input type="search" placeholder="Search articles…" value={search} onChange={e=>setSearch(e.target.value)} /></label><label className="field"><span>Platform</span><select value={platform} onChange={e=>setPlatform(e.target.value)}><option value="">All platforms</option>{Object.entries(PLATFORM_LABEL).map(([id,label])=><option value={id} key={id}>{label}</option>)}</select></label></div>
  {!shown.length?<p>{articles.length?'No articles match these filters.':'No articles have been published yet.'}</p>:<div className="articles-grid">{shown.map(a=><article className="article-card" key={a.id}><span className="badge">{PLATFORM_LABEL[a.platform]}</span><h2><Link href={articleHref(a.slug)} prefetch={false}>{a.title}</Link></h2><p>{a.summary}</p><Link href={articleHref(a.slug)} prefetch={false}>Read article →</Link></article>)}</div>}
 </div>;
}

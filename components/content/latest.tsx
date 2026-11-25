"use client";
import Link from 'next/link';
import {useEffect,useMemo,useState} from 'react';
import {FilterMenu} from './filter-menu';
import {PostCard,PostRow} from './post-card';
import {useQueryString} from './use-query-string';
import {PAGE_STEP,applyFilters,filtersActive,filtersQuery,findPostByCode,groupByMonth,isNew,parseFilters,platformOptions,topicOptions,type Filters,type HubGuide,type HubPost,type HubSeries} from '@/lib/content-hub';
import {readIds,readView,saveView,type HubView} from '@/lib/content-read-state';

/** Latest: filters in the URL, a guide band, month groups, Cards / List, and 12 posts at a time. */
export function LatestView({posts,series,guide}:{posts:HubPost[];series:HubSeries[];guide:HubGuide|null}){
 const [query,setQuery]=useQueryString();
 const params=useMemo(()=>new URLSearchParams(query),[query]);
 const filters=useMemo(()=>parseFilters(params),[params]);
 const code=params.get('code')?.trim()??'';
 const [view,setView]=useState<HubView>('grid');
 const [read,setRead]=useState<Set<string>>(()=>new Set());
 const [now,setNow]=useState<number|null>(null);
 const [limit,setLimit]=useState(PAGE_STEP);
 useEffect(()=>{setView(readView());setRead(readIds());setNow(Date.now());},[]);
 const filterKey=filtersQuery(filters);
 useEffect(()=>{setLimit(PAGE_STEP);},[filterKey]);
 const filtered=useMemo(()=>applyFilters(posts,filters),[posts,filters]);
 const visible=filtered.slice(0,limit);
 const groups=useMemo(()=>groupByMonth(visible,filtered),[visible,filtered]);
 const remaining=filtered.length-visible.length;
 const setFilter=(patch:Partial<Filters>)=>setQuery(filtersQuery({...filters,...patch}));
 const chooseView=(v:HubView)=>{setView(v);saveView(v);};
 return <section aria-label="Latest posts" className="hub-latest">
  {code&&!findPostByCode(posts,code)?<p className="hub-note" role="status"><b>No post with that code yet.</b> Codes are printed on the last slide of each post. Check the spelling, or browse everything below.</p>:null}
  <div className="hub-filters" role="group" aria-label="Filter posts">
   <FilterMenu label="Topic" value={filters.topic} options={topicOptions(posts,filters)} onChange={topic=>setFilter({topic})}/>
   <FilterMenu label="Platform" value={filters.platform} options={platformOptions(posts,filters)} onChange={platform=>setFilter({platform})}/>
   {filtersActive(filters)?<button type="button" className="hub-clear" onClick={()=>setQuery('')}>Clear filters</button>:null}
   <span className="hub-result" role="status">{filtered.length} {filtered.length===1?'post':'posts'}</span>
  </div>
  {guide?<div className="hub-band"><span className="hub-plat hub-plat-guide" aria-hidden="true">G</span><span className="hub-band-text"><b>Free: {guide.title}.</b>{guide.summary?<span> {guide.summary}</span>:null}</span><Link href="/content/guides" prefetch={false}>All free guides →</Link></div>:null}
  <div className="hub-intro"><span><b>Every post&apos;s long version, newest first.</b> Posts you&apos;ve opened are marked Read.</span>
   <span className="hub-switch" role="group" aria-label="View"><button type="button" aria-pressed={view==='grid'} onClick={()=>chooseView('grid')}>▦ Cards</button><button type="button" aria-pressed={view==='list'} onClick={()=>chooseView('list')}>☰ List</button></span></div>
  {!posts.length?<p className="hub-empty">No posts have been published yet.</p>
   :!filtered.length?<p className="hub-empty">No posts match these filters. <button type="button" className="hub-clear" onClick={()=>setQuery('')}>Clear filters</button></p>
   :groups.map(g=><section key={g.key} aria-labelledby={`hub-m-${g.key}`}>
    <h2 className="hub-month" id={`hub-m-${g.key}`}>{g.label}<small> · {g.total} {g.total===1?'post':'posts'}</small></h2>
    {view==='grid'
     ?<div className="hub-grid">{g.posts.map(p=><PostCard key={p.id} post={p} series={series} isNew={now!==null&&isNew(p.created_at,now)} isRead={read.has(p.id)}/>)}</div>
     :<div className="hub-list">{g.posts.map(p=><PostRow key={p.id} post={p} series={series} isRead={read.has(p.id)}/>)}</div>}
   </section>)}
  {filtered.length?<div className="hub-more">
   {remaining>0?<button type="button" className="hub-btn is-ghost" onClick={()=>setLimit(n=>n+PAGE_STEP)}>Show {Math.min(PAGE_STEP,remaining)} more</button>:null}
   <small>Showing {visible.length} of {filtered.length}</small></div>:null}
 </section>;
}

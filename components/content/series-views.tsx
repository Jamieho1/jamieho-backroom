"use client";
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {Cover} from './post-card';
import {articleDate} from '@/lib/articles';
import {cardRows,partKind,seriesProgress,type SeriesPart,type SeriesSlot} from '@/lib/content-series-view';
import {readIds} from '@/lib/content-read-state';
import type {HubPost} from '@/lib/content-hub';

/** What a series card or page needs, all serialisable (the page itself is pre-rendered; reading progress is added in the browser). */
export interface SeriesView{slug:string;href:string;title:string;goal:string;topic:string;topicLabel:string;slots:SeriesSlot[];category:HubPost['category']}
function useRead():ReadonlySet<string>{
 const [read,setRead]=useState<ReadonlySet<string>>(()=>new Set());
 useEffect(()=>{setRead(readIds());},[]);
 return read;
}
function Ring({read,planned,percent}:{read:number;planned:number;percent:number}){
 return <span className="hub-ring" style={{'--p':percent} as React.CSSProperties} role="img" aria-label={`You have read ${read} of ${planned}`}><span aria-hidden="true">{read}/{planned}</span></span>;
}
/** /content/series: one card per series with progress ring, "After this", the first four parts and a Start / Continue button. */
export function SeriesCards({items}:{items:SeriesView[]}){
 const read=useRead();
 return <div className="hub-sgrid">{items.map(s=>{
  const pr=seriesProgress(s.slots,read),{rows,more}=cardRows(s.slots,read);
  return <article className="hub-scard" key={s.slug} aria-labelledby={`hub-s-${s.slug}`}>
   <div className="hub-scard-top"><div><span className="hub-chip is-gold">{s.topicLabel}</span><h3 id={`hub-s-${s.slug}`}><Link href={s.href} prefetch={false}>{s.title}</Link></h3></div><Ring read={pr.read} planned={pr.planned} percent={pr.percent}/></div>
   {s.goal?<p className="hub-goal"><b>After this:</b> {s.goal}</p>:null}
   <ol className="hub-srows">{rows.map(r=><li key={r.n} className={`is-${r.state}`}>
    <span className="hub-tick" aria-hidden="true">{r.state==='done'?'✓':''}</span>
    <span>{r.n}. {r.href?<Link href={r.href} prefetch={false}>{r.title}</Link>:<>Part {r.n}</>}{r.state==='done'?<span className="hub-sr"> (read)</span>:null}</span>
    <small>{r.state==='next'?'Next':r.state==='soon'?'Soon':''}</small></li>)}
    {more>0?<li className="is-soon"><span/><span>+ {more} more</span><small/></li>:null}</ol>
   <div className="hub-scard-foot"><span className="hub-meta">{pr.out} of {pr.planned} out · ~{pr.minutes} min</span>
    {pr.target?<Link className="hub-btn" href={pr.target.href} prefetch={false}>{pr.label} →</Link>:null}</div>
  </article>;})}</div>;
}

function Thumb({part,category}:{part:SeriesPart;category:HubPost['category']}){
 if(part.kind==='post')return <Cover square post={{id:part.id,slug:part.slug,title:part.title,summary:'',platform:part.platform??'other',category,cover_url:part.cover_url,firstSlide:part.firstSlide,created_at:part.created_at,series_id:null,series_part:null,code:null,takeaway:'',minutes:part.minutes}}/>;
 return <span className="hub-cover is-square"><span className="hub-guide-art" aria-hidden="true">{part.title}</span></span>;
}
/** /content/series/[slug]: sticky info column (progress, Start / Continue) and the parts on a vertical line, with dashed "coming" slots. */
export function SeriesDetail({s}:{s:SeriesView}){
 const read=useRead();
 const pr=seriesProgress(s.slots,read);
 return <div className="hub-sd">
  <aside className="hub-sd-aside">
   <nav className="hub-meta" aria-label="Breadcrumb"><Link href="/content/series">Series</Link> / <span aria-current="page">{s.title}</span></nav>
   <h1>{s.title}</h1>
   {s.goal?<p className="hub-sd-goal">{s.goal}</p>:null}
   <span className="hub-chip is-gold">{s.topicLabel}</span>
   <span className="hub-meta">{pr.out} of {pr.planned} parts out</span>
   <div className="hub-bar" role="progressbar" aria-label="Parts published" aria-valuemin={0} aria-valuemax={pr.planned} aria-valuenow={pr.out}><i style={{width:`${pr.planned?Math.round(pr.out/pr.planned*100):0}%`}}/></div>
   {pr.read>0?<span className="hub-meta">You have read {pr.read} of {pr.out}</span>:null}
   {pr.target?<Link className="hub-btn" href={pr.target.href} prefetch={false}>{pr.label==='Start'?`Start at part ${pr.target.part} →`:pr.label==='Continue'?`Continue at part ${pr.target.part} →`:'Read again from part 1 →'}</Link>:null}
  </aside>
  <ol className="hub-parts">{s.slots.map(slot=>slot.part
   ?<li key={slot.part.id}><Link href={slot.part.href} prefetch={false} className="hub-part">
     <Thumb part={slot.part} category={s.category}/>
     <span className="hub-part-main"><span className="hub-part-k">Part {slot.n} · {partKind(slot.part)}</span><b>{slot.part.title}</b>{slot.part.blurb?<small>{slot.part.blurb}</small>:null}<small>{slot.part.minutes} min{slot.part.platform==='youtube'?' video':slot.part.kind==='guide'?' guide':' read'}</small></span>
     <span className="hub-part-end"><span className="hub-chip">{articleDate(slot.part.created_at)}</span>{read.has(slot.part.id)?<span className="hub-chip is-gold">Read</span>:null}</span></Link></li>
   :<li key={`soon-${slot.n}`} className="is-soon"><div className="hub-part"><span className="hub-cover is-square hub-cover-soon" aria-hidden="true"/>
     <span className="hub-part-main"><span className="hub-part-k">Part {slot.n} · coming</span><small>Follow on Instagram to get it first</small></span></div></li>)}</ol>
 </div>;
}

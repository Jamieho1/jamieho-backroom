"use client";
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useId,useMemo,useState,type KeyboardEvent} from 'react';
import {KIND_LABEL,runSearch,type SearchItem} from '@/lib/content-hub';
import {PlatformMark} from './post-card';

/** One box for both jobs: a post code from the last slide (MCP101) opens that post; anything else searches titles and summaries. */
export function HubSearch({index}:{index:SearchItem[]}){
 const [q,setQ]=useState('');
 const router=useRouter();
 const panel=useId();
 const result=useMemo(()=>runSearch(index,q),[index,q]);
 const first=result.mode==='code'?result.hit:result.mode==='results'?result.items[0]:undefined;
 const onKey=(e:KeyboardEvent<HTMLInputElement>)=>{
  if(e.key==='Enter'&&first){e.preventDefault();router.push(first.href);}
  else if(e.key==='Escape'&&q){e.preventDefault();e.stopPropagation();setQ('');}
 };
 return <div className="hub-find">
  <label className="sr-only" htmlFor={`${panel}-q`}>Search posts or enter a post code</label>
  <input id={`${panel}-q`} type="search" value={q} onChange={e=>setQ(e.target.value)} onKeyDown={onKey} placeholder="Search, or type the code from a post" autoComplete="off" spellCheck={false} aria-controls={result.mode==='idle'?undefined:panel}/>
  <small className="hub-find-hint">Every post ends with a code, like <b>MCP101</b>.</small>
  {result.mode!=='idle'?<div className="hub-hits" id={panel} role="region" aria-label="Search results" aria-live="polite">
   {result.mode==='code'
    ?<Link className="hub-hit is-code" href={result.hit.href} prefetch={false}>{result.hit.platform?<PlatformMark platform={result.hit.platform}/>:null}<span className="hub-hit-main"><b>{result.hit.title}</b><small>Code {result.hit.code} · open the complete content</small></span><span aria-hidden="true">→</span></Link>
    :result.items.length
     ?<ul>{result.items.map(item=><li key={item.kind+item.href+item.title}><Link className="hub-hit" href={item.href} prefetch={false}><span className="hub-hit-main"><b>{item.title}</b><small>{KIND_LABEL[item.kind]}{item.summary?` · ${item.summary}`:''}</small></span><span aria-hidden="true">→</span></Link></li>)}</ul>
     :<p className="hub-hit-none">Nothing matches &ldquo;{q.trim()}&rdquo;. Codes are letters and digits, like MCP101.</p>}
  </div>:null}
 </div>;
}

'use client';
import Link from 'next/link';
import {useState} from 'react';
import {useViewer} from '@/components/viewer-provider';
import {InterviewIcon,isInterviewIcon} from './icons';
import {useSdProgress} from './use-sd-progress';
import {sdHref,type SdListItem} from '@/lib/interview/system-design';
export function SystemDesignList({questions,title}:{questions:SdListItem[];title:string}){
 const {viewer}=useViewer();const account=viewer.status==='owner'||viewer.status==='member'?viewer.id:undefined;
 const progress=useSdProgress(!!account,account);const [query,setQuery]=useState('');const term=query.trim().toLowerCase();
 const shown=questions.filter(q=>`${q.title} ${q.topic}`.toLowerCase().includes(term));
 return <section className="iv-question-page iv-sd-list"><h1>{title}</h1>{questions.length?<>
  <label className="iv-search">Search questions<input type="search" placeholder="Search questions…" value={query} onChange={e=>setQuery(e.target.value)}/></label>
  <p className="iv-result-count" role="status">{shown.length} {shown.length===1?'question':'questions'}</p>
  {progress.error?<p role="alert">{progress.error}<button onClick={()=>void progress.reload()}>Retry</button></p>:null}
  <ul className="iv-questions">{shown.map(q=><li key={q.id}><Link href={sdHref(q.slug)} prefetch={false}><span className="iv-question-name"><span className="iv-icon"><InterviewIcon name={isInterviewIcon(q.icon)?q.icon:'system-design'}/></span> {q.title}</span><span className="iv-question-tags"><span>Solution · Quiz</span></span></Link>
   {account?<div className="iv-question-progress"><button type="button" className="iv-flag" aria-label={`${progress.flagged.has(q.id)?'Unflag':'Flag'} ${q.title}`} aria-pressed={progress.flagged.has(q.id)} disabled={!progress.loaded||progress.saving} onClick={()=>void progress.toggle(q.id,'flagged')}><svg viewBox="0 0 24 24" fill={progress.flagged.has(q.id)?'currentColor':'none'} stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M5 21V4h13l-3 5 3 5H5"/></svg></button><span className="iv-completion" role="img" aria-label={`${q.title} ${progress.done.has(q.id)?'completed':'not completed'}`} data-complete={progress.done.has(q.id)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="12" cy="12" r="8"/>{progress.done.has(q.id)?<path d="m8.5 12.2 2.5 2.5 4.5-5"/>:null}</svg></span></div>:null}</li>)}</ul>
  {!shown.length?<p>No matching questions.</p>:null}</>:<p>No system design questions yet.</p>}</section>;
}

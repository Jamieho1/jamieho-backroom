'use client';
import Link from 'next/link';
import {useEffect,useRef,useState} from 'react';
import {practiceNavigation} from '@/lib/interview/practice-navigation';
import {interviewProblemHref} from '@/lib/interview/content';
import type {usePracticeStars} from './use-practice-stars';

export function ProblemDrawer({lc,onClose,onNavigate,flags,completed,canSave}:{lc:number;onClose():void;onNavigate():void;flags:ReturnType<typeof usePracticeStars>;completed:ReadonlySet<number>;canSave:boolean}){
 const dialog=useRef<HTMLDialogElement>(null);const [query,setQuery]=useState('');const nav=practiceNavigation(lc);
 useEffect(()=>{const el=dialog.current;if(!el)return;el.showModal();requestAnimationFrame(()=>el.querySelector('[aria-current="page"]')?.scrollIntoView({block:'nearest'}));return()=>el.close();},[]);
 const term=query.trim().toLowerCase();
 return <dialog ref={dialog} className="pw-drawer" aria-label="Section questions" onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();onClose();}}} onCancel={e=>{e.preventDefault();onClose();}} onClick={e=>{if(e.target!==e.currentTarget)return;const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)onClose();}}>
  <header><h2>{nav.section==='dsa'?'Data Structures & Algorithms':'Low Level Design'}</h2><button aria-label="Close question drawer" onClick={onClose}>×</button></header>
  <label className="pw-search">Search questions<input autoFocus type="search" placeholder="Search questions…" value={query} onChange={e=>setQuery(e.target.value)}/></label>
  {flags.loadError?<p role="alert">{flags.loadError}<button onClick={()=>void flags.load()}>Retry flags</button></p>:null}
  {flags.saveError?<p role="alert">{flags.saveError}<button onClick={()=>void flags.retry()}>Retry flag</button></p>:null}
  <nav aria-label="Section questions">{nav.topics.map(t=>{const questions=nav.questions.filter(p=>p.topic===t.id&&`${p.title} ${p.lc} ${t.label}`.toLowerCase().includes(term));return questions.length?<section key={t.id}><h3>{t.label}</h3><ul>{questions.map(p=><li key={p.lc}>
   <Link href={interviewProblemHref(p.lc)} aria-current={p.lc===lc?'page':undefined} onClick={e=>{if(e.button===0&&!e.metaKey&&!e.ctrlKey&&!e.shiftKey&&!e.altKey){onNavigate();onClose();}}}>{p.title}</Link>
   {canSave?<><span role="img" aria-label={`${p.title} ${completed.has(p.lc)?'completed':'not completed'}`} className="pw-done" data-complete={completed.has(p.lc)}>{completed.has(p.lc)?'✓':'○'}</span><button aria-label={`${flags.stars.has(p.lc)?'Unflag':'Flag'} ${p.title}`} aria-pressed={flags.stars.has(p.lc)} disabled={!flags.loaded||flags.loading||!!flags.loadError||flags.saving} onClick={()=>void flags.save(p.lc,!flags.stars.has(p.lc))}>{flags.stars.has(p.lc)?'⚑':'⚐'}</button></>:null}
  </li>)}</ul></section>:null;})}
  {!nav.questions.some(p=>`${p.title} ${p.lc} ${nav.topics.find(t=>t.id===p.topic)?.label}`.toLowerCase().includes(term))?<p>No matching questions.</p>:null}</nav>
 </dialog>;
}

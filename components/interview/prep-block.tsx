"use client";
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {useViewer} from '@/components/viewer-provider';
import {loadPracticeCompletions} from '@/app/actions/practice-progress';
import {groupPrepItems,type PrepItem} from '@/lib/interview/prep';
/** "What to prepare": Concepts · Practice (difficulty + the reader's done tick) · Behavioral (answered X of Y). Empty groups are hidden. */
export function PrepBlock({items,compact=false,preview=false,label='What to prepare'}:{items:PrepItem[];compact?:boolean;preview?:boolean;label?:string}){
 const {viewer}=useViewer();const account=!preview&&!compact&&(viewer.status==='owner'||viewer.status==='member')?viewer.id:undefined;
 const [done,setDone]=useState<Set<number>>(new Set());const [error,setError]=useState('');const [retry,setRetry]=useState(0);
 const hasPractice=items.some(i=>i.group==='practice');
 useEffect(()=>{let alive=true;setDone(new Set());if(account&&hasPractice)void loadPracticeCompletions().then(r=>{if(!alive)return;if(r.ok){setDone(new Set(r.problems));setError('');}else setError(r.message);}).catch(()=>{if(alive)setError('Could not load your progress.');});return()=>{alive=false;};},[account,hasPractice,retry]);
 const groups=groupPrepItems(items);if(!groups.length)return null;
 return <section className={`iv-prep${compact?' iv-prep-compact':' iv-prep-main'}`} aria-label={label}><h2>What to prepare</h2>
  {error?<p role="alert">{error} <button type="button" onClick={()=>setRetry(v=>v+1)}>Retry progress</button></p>:null}
  {groups.map(g=><section key={g.id} aria-label={`${g.label}${compact?' (summary)':''}`}><h3>{g.label}</h3><ul>{g.items.map(i=><li key={i.kind+':'+i.ref}><Link href={i.href} prefetch={false}><span className="iv-prep-title">{i.label}</span>
   {!compact&&i.difficulty?<span className={`iv-difficulty ${i.difficulty.toLowerCase()}`}>{i.difficulty}</span>:null}
   {!compact&&i.group==='behavioral'&&i.answered!==undefined&&i.total!==undefined?<small>answered {i.answered} of {i.total}</small>:null}
   {!compact&&i.problem&&account?<span className="iv-completion" role="img" aria-label={`${i.label} ${done.has(i.problem)?'completed':'not completed'}`} data-complete={done.has(i.problem)} title="Completed by a passed Submit in the practice workspace"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4"/>{done.has(i.problem)?<path d="m7 12 3 3 7-7"/>:null}</svg></span>:null}
  </Link></li>)}</ul></section>)}
 </section>;
}

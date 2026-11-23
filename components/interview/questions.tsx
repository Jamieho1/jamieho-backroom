'use client';
import Link from 'next/link';
import {useState,useEffect} from 'react';
import {useViewer} from '@/components/viewer-provider';
import {usePracticeStars} from '@/components/practice/use-practice-stars';
import {loadPracticeCompletions} from '@/app/actions/practice-progress';
import {sectionQuestions,questionHref} from '@/lib/interview/content';
export function InterviewQuestions({section,topic,title}:{section:string;topic?:string;title:string}){
 const {viewer}=useViewer();const account=viewer.status==='owner'||viewer.status==='member'?viewer.id:undefined;
 return <PracticeQuestions key={account??'visitor'} section={section} topic={topic} title={title} account={account}/>;
}
function PracticeQuestions({section,topic,title,account}:{section:string;topic?:string;title:string;account?:string}){
 const flags=usePracticeStars(!!account,account);const [completed,setCompleted]=useState<number[]>([]);const [progressError,setProgressError]=useState('');const [retry,setRetry]=useState(0);
 useEffect(()=>{let live=true;if(account)void loadPracticeCompletions().then(result=>{if(!live)return;if(result.ok){setCompleted(result.problems);setProgressError('');}else setProgressError(result.message);}).catch(()=>{if(live)setProgressError('Could not load your progress. Retry.');});return()=>{live=false;};},[account,retry]);
 const [query,setQuery]=useState('');const questions=sectionQuestions(section,topic);const term=query.trim().toLowerCase();
 const collection=(p:{extra?:boolean})=>section==='sql'?'SQL 50':p.extra?'Extra':'NeetCode 150';
 const shown=questions.filter(p=>`${p.title} ${p.lc} ${p.difficulty} ${collection(p)}`.toLowerCase().includes(term));
 const done=questions.filter(p=>completed.includes(p.lc)).length;
 return <section className="iv-question-page"><h1>{title}</h1>{questions.length?<>
 <label className="iv-search">Search questions<input type="search" placeholder="Search questions…" value={query} onChange={e=>setQuery(e.target.value)}/></label>
 <p className="iv-result-count" role="status">{shown.length} {shown.length===1?'question':'questions'}</p>
 {account&&section==='sql'?<p className="iv-result-count" data-testid="sql-progress">{done} of {questions.length} done</p>:null}
 {flags.loadError?<p role="alert">{flags.loadError}<button onClick={()=>void flags.load()}>Retry flags</button></p>:null}{flags.saveError?<p role="alert">{flags.saveError}<button onClick={()=>void flags.retry()}>Retry flag</button></p>:null}{progressError?<p role="alert">{progressError}<button onClick={()=>setRetry(v=>v+1)}>Retry progress</button></p>:null}<ul className="iv-questions">{shown.map(p=><li key={p.lc}><Link href={questionHref(section,p.lc)} prefetch={false}><span className="iv-question-name">{p.title}</span><span className="iv-question-tags"><span className={`iv-difficulty ${p.difficulty.toLowerCase()}`}>{p.difficulty}</span><span>{collection(p)}</span></span></Link>{account?<div className="iv-question-progress"><button type="button" className="iv-flag" aria-label={`${flags.stars.has(p.lc)?"Unflag":"Flag"} ${p.title}`} aria-pressed={flags.stars.has(p.lc)} disabled={!flags.loaded||flags.loading||!!flags.loadError||flags.saving} onClick={()=>void flags.save(p.lc,!flags.stars.has(p.lc))}><svg viewBox="0 0 24 24" fill={flags.stars.has(p.lc)?"currentColor":"none"} stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M5 21V4h13l-3 5 3 5H5"/></svg></button><span className="iv-completion" role="img" aria-label={completed.includes(p.lc)?`${p.title} completed`:`${p.title} not completed`} data-complete={completed.includes(p.lc)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4"/>{completed.includes(p.lc)?<path d="m7 12 3 3 7-7"/>:null}</svg></span></div>:null}</li>)}</ul>
 {!shown.length?<p>No matching questions.</p>:null}
 </>:<p>No practice questions yet.</p>}</section>;
}

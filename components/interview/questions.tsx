'use client';
import Link from 'next/link';
import {useState} from 'react';
import {sectionQuestions,interviewProblemHref} from '@/lib/interview/content';
export function InterviewQuestions({section,topic,title}:{section:string;topic?:string;title:string}){
 const [query,setQuery]=useState('');const questions=sectionQuestions(section,topic);const term=query.trim().toLowerCase();
 const shown=questions.filter(p=>`${p.title} ${p.lc} ${p.difficulty} ${p.extra?'Extra':'NeetCode 150'}`.toLowerCase().includes(term));
 return <section className="iv-question-page"><h1>{title}</h1>{questions.length?<>
 <label className="iv-search">Search questions<input type="search" placeholder="Search questions…" value={query} onChange={e=>setQuery(e.target.value)}/></label>
 <p className="iv-result-count" role="status">{shown.length} {shown.length===1?'question':'questions'}</p>
 <ul className="iv-questions">{shown.map(p=><li key={p.lc}><Link href={interviewProblemHref(p.lc)} prefetch={false}><span className="iv-question-name">{p.title}</span><span className="iv-question-tags"><span className={`iv-difficulty ${p.difficulty.toLowerCase()}`}>{p.difficulty}</span><span>{p.extra?'Extra':'NeetCode 150'}</span></span><span className="iv-progress-empty" role="img" aria-label="Not flagged (coming soon)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M5 21V4h13l-3 5 3 5H5"/></svg></span><span className="iv-progress-empty" role="img" aria-label="Not completed (coming soon)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="m7 12 3 3 7-7" opacity=".35"/></svg></span></Link></li>)}</ul>
 {!shown.length?<p>No matching questions.</p>:null}
 </>:<p>No practice questions yet.</p>}</section>;
}

'use client';
import {useEffect,useRef,useState} from 'react';
import {loadQuizAttempts,saveQuizAttempt} from '@/app/actions/system-design';
import {QUIZ_STORAGE_PREFIX,addLocalAttempt,formatAttemptDate,parseLocalAttempts,scoreQuiz,type QuizAttempt,type QuizItem,type QuizPick} from '@/lib/interview/system-design';
const LETTERS=['1','2','3','4'];
function readLocal(key:string){try{return parseLocalAttempts(localStorage.getItem(key));}catch{return [];}}
function writeLocal(key:string,attempts:QuizAttempt[]){try{localStorage.setItem(key,JSON.stringify(attempts));}catch{/* Attempts are a convenience for visitors. */}}
export function QuizPanel({questionId,slug,title,quiz,account}:{questionId:string;slug:string;title:string;quiz:QuizItem[];account?:string}){
 const storageKey=QUIZ_STORAGE_PREFIX+slug;
 const [attempts,setAttempts]=useState<QuizAttempt[]>([]);const [attemptsError,setAttemptsError]=useState('');const [retry,setRetry]=useState(0);
 const [phase,setPhase]=useState<'intro'|'run'|'done'>('intro');const [index,setIndex]=useState(0);const [picks,setPicks]=useState<QuizPick[]>([]);const [answered,setAnswered]=useState(false);
 const [saveState,setSaveState]=useState<{status:'idle'|'saving'|'saved'|'failed';message?:string}>({status:'idle'});
 const next=useRef<HTMLButtonElement>(null);const heading=useRef<HTMLHeadingElement>(null);
 useEffect(()=>{
  let alive=true;setAttemptsError('');
  if(account)void loadQuizAttempts(questionId).then(r=>{if(!alive)return;if(r.ok)setAttempts(r.attempts);else setAttemptsError(r.message);}).catch(()=>{if(alive)setAttemptsError("Couldn't load your attempts. Retry.");});
  else setAttempts(readLocal(storageKey));
  return()=>{alive=false;};
 },[account,questionId,storageKey,retry]);
 const item=quiz[index];
 const choose=(pick:QuizPick)=>{if(answered||!item)return;setPicks(p=>{const copy=[...p];copy[index]=pick;return copy;});setAnswered(true);};
 useEffect(()=>{if(phase!=='run'||answered)return;const key=(e:KeyboardEvent)=>{if(e.ctrlKey||e.metaKey||e.altKey)return;if(['1','2','3','4'].includes(e.key)){e.preventDefault();choose(Number(e.key)-1);}};document.addEventListener('keydown',key);return()=>document.removeEventListener('keydown',key);});
 useEffect(()=>{if(answered)next.current?.focus();},[answered]);
 useEffect(()=>{if(phase!=='intro')heading.current?.focus();},[phase,index]);
 const start=()=>{setPicks([]);setIndex(0);setAnswered(false);setSaveState({status:'idle'});setPhase('run');};
 const persist=async(final:QuizPick[])=>{
  setSaveState({status:'saving'});
  if(account){
   try{const r=await saveQuizAttempt(questionId,final);if(r.ok){setAttempts(a=>[r.attempt,...a.filter(x=>x.id!==r.attempt.id)].slice(0,20));setSaveState({status:'saved'});}else setSaveState({status:'failed',message:r.message});}
   catch{setSaveState({status:'failed',message:"Couldn't save this attempt. Retry saving."});}
   return;
  }
  const result=scoreQuiz(quiz,final);const attempt:QuizAttempt={id:(typeof crypto!=='undefined'&&'randomUUID' in crypto?crypto.randomUUID():String(Date.now())),score:result.score,total:result.total,created_at:new Date().toISOString()};
  setAttempts(a=>{const list=addLocalAttempt(a,attempt);writeLocal(storageKey,list);return list;});setSaveState({status:'saved'});
 };
 const advance=()=>{
  if(index+1<quiz.length){setIndex(index+1);setAnswered(false);return;}
  setPhase('done');void persist(Array.from({length:quiz.length},(_,i)=>picks[i]??null));
 };
 const final=Array.from({length:quiz.length},(_,i)=>picks[i]??null);
 if(phase==='intro')return <section className="iv-sd-quiz" aria-label="Quiz">
  <div className="iv-sd-quiz-card"><div><h2 tabIndex={-1} ref={heading}>{title} · Quiz · {quiz.length} {quiz.length===1?'Q':'Qs'}</h2><p>Multiple choice with a short explanation after every answer.</p></div>
   <button type="button" className="iv-sd-primary" disabled={!quiz.length} onClick={start}>Start quiz</button></div>
  {!quiz.length?<p className="iv-sd-empty">No quiz questions have been written for this question yet.</p>:null}
  <h3>Your attempts</h3>
  {attemptsError?<p role="alert">{attemptsError} <button type="button" onClick={()=>setRetry(v=>v+1)}>Retry</button></p>:null}
  {attempts.length?<ul className="iv-sd-attempts" aria-label="Your attempts">{attempts.map(a=><li key={a.id}><strong>{a.score} / {a.total}</strong><span>{formatAttemptDate(a.created_at)}</span></li>)}</ul>:<p className="iv-sd-empty">No attempts yet.</p>}
  {!account?<p className="iv-sd-note">Attempts are kept in this browser only. Sign in to keep them with your account.</p>:null}
 </section>;
 if(phase==='run'&&item){
  const picked=picks[index];const right=answered&&picked===item.answer;
  return <section className="iv-sd-quiz" aria-label="Quiz">
   <div className="iv-sd-progress"><span aria-live="polite">{index+1} / {quiz.length}</span><progress max={quiz.length} value={index+(answered?1:0)} aria-label="Quiz progress"/></div>
   <h2 className="iv-sd-q" tabIndex={-1} ref={heading}>{item.q}</h2>
   <ol className="iv-sd-options" role="list">{item.options.map((o,i)=>{const state=!answered?undefined:i===item.answer?'correct':i===picked?'wrong':'idle';return <li key={i}><button type="button" data-state={state} aria-pressed={answered&&picked===i} disabled={answered} onClick={()=>choose(i)}><kbd aria-hidden="true">{LETTERS[i]}</kbd><span>{o}</span></button></li>;})}</ol>
   {!answered?<button type="button" className="iv-sd-dont-know" onClick={()=>choose(null)}>Don&apos;t know</button>:null}
   {answered?<div className="iv-sd-feedback" role="status" data-result={right?'correct':'incorrect'}><strong>{right?'Correct':picked===null?"Marked as don't know — counted as wrong":'Incorrect'}</strong>{!right?<p>Correct answer: {item.options[item.answer]}</p>:null}{item.explanation?<p>{item.explanation}</p>:null}<button type="button" className="iv-sd-primary" ref={next} onClick={advance}>{index+1<quiz.length?'Next':'See score'}</button></div>:null}
  </section>;
 }
 const result=scoreQuiz(quiz,final);
 return <section className="iv-sd-quiz" aria-label="Quiz result">
  <h2 tabIndex={-1} ref={heading}>Your score: {result.score} / {result.total}</h2><p className="iv-sd-percent">{result.percent}%</p>
  {saveState.status==='failed'?<p role="alert">{saveState.message} <button type="button" onClick={()=>void persist(final)}>Retry saving</button></p>:saveState.status==='saved'?<p className="iv-sd-note" role="status">{account?'Attempt saved to your account.':'Attempt saved in this browser.'}</p>:null}
  {result.wrong.length?<><h3>Review wrong answers</h3><ol className="iv-sd-review">{result.wrong.map(w=>{const q=quiz[w.index];return <li key={w.index}><strong>{w.index+1}. {q.q}</strong><p>{w.picked===null?"You answered: Don't know":`You answered: ${q.options[w.picked]}`}</p><p>Correct answer: {q.options[q.answer]}</p>{q.explanation?<p>{q.explanation}</p>:null}</li>;})}</ol></>:<p>Every answer was correct.</p>}
  <div className="iv-sd-actions"><button type="button" className="iv-sd-primary" onClick={start}>Retake quiz</button><button type="button" onClick={()=>setPhase('intro')}>Back to attempts</button></div>
 </section>;
}

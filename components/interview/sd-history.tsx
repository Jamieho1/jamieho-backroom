'use client';
import {useState} from 'react';
import {attemptSummary,formatWhen,scoreChecklist,type HistoryAttempt,type HistoryItem} from '@/lib/interview/sd-attempt';
import {formatTimer} from '@/lib/interview/whiteboard';
import type {ResolvedStep} from '@/lib/interview/sd-steps';

export type HistoryList={status:'loading'}|{status:'error';message:string}|{status:'ready';items:HistoryItem[]};
export function HistoryDrawer({list,account,onOpen,onDelete,onClose,notice}:{list:HistoryList;account:boolean;onOpen:(id:string)=>void;onDelete:(id:string)=>void;onClose:()=>void;notice:string}){
 return <aside className="iv-sd-history" role="dialog" aria-label="Attempt history">
  <header><h2>History</h2><button type="button" onClick={onClose} aria-label="Close history">×</button></header>
  <p className="iv-sd-history-note">{account?'Your finished attempts are saved with your account.':'Signed out: the last 3 attempts stay in this browser only.'}</p>
  {notice?<p role="alert" className="iv-sd-history-note">{notice}</p>:null}
  {list.status==='loading'?<p role="status">Loading…</p>:list.status==='error'?<p role="alert">{list.message}</p>:
   list.items.length?<ul>{list.items.map(a=><li key={a.id}>
    <div><b>{formatWhen(a.created_at)}</b><span>{a.total?`Covered ${a.covered} of ${a.total}`:'No checklist'} · {formatTimer(a.seconds)}</span></div>
    <button type="button" onClick={()=>onOpen(a.id)}>Open</button><button type="button" className="iv-sd-danger" aria-label={`Delete attempt from ${formatWhen(a.created_at)}`} onClick={()=>onDelete(a.id)}>Delete</button>
   </li>)}</ul>:<p>No finished attempts yet. Use “Finish attempt” in the steps panel.</p>}
 </aside>;
}
/** Read-only view of a saved attempt (the canvas beside it is read-only too); Restore replaces the live board and answers. */
export function AttemptReview({attempt,steps,onRestore,onClose}:{attempt:HistoryAttempt;steps:readonly ResolvedStep[];onRestore:()=>void;onClose:()=>void}){
 const [confirm,setConfirm]=useState(false);
 const sum=attemptSummary(steps,{step:0,answers:attempt.answers,checks:attempt.checks,seconds:attempt.seconds});
 return <aside className="iv-sd-board-panel iv-sd-review" aria-label="Saved attempt (read only)">
  <h2>Saved attempt</h2>
  <p className="iv-sd-review-meta">{formatWhen(attempt.created_at)} · {formatTimer(attempt.seconds)} · read only</p>
  <p className="iv-sd-covered">{sum.total?`You covered ${sum.covered} of ${sum.total}`:'No checklist points'} · {sum.answered} of {steps.length} answers written</p>
  {steps.map(s=>{const r=scoreChecklist(s,attempt.checks[s.id]??[]);const a=attempt.answers[s.id]??'';return <section key={s.id} className="iv-sd-review-step"><h3>{s.title}</h3>
   <p className="iv-sd-review-answer">{a.trim()?a:'No answer written.'}</p>{r.total?<p className="iv-sd-covered">Covered {r.covered} of {r.total}</p>:null}</section>;})}
  <footer className="iv-sd-steps-foot">
   {confirm?<><p role="alertdialog" aria-label="Restore to board">Replace your current board, answers and timer with this attempt?</p>
    <button type="button" className="iv-sd-danger" onClick={onRestore}>Restore</button><button type="button" onClick={()=>setConfirm(false)}>Cancel</button></>
   :<><button type="button" className="iv-sd-primary" disabled={!attempt.scene} onClick={()=>setConfirm(true)}>Restore to board</button><button type="button" onClick={onClose}>Back to my board</button></>}
  </footer>
 </aside>;
}

'use client';
import { useState,useTransition } from 'react';
import { Markdown } from '@/components/notes/markdown';
import { saveQuestionNotes } from '@/app/actions/practice';
export function QuestionNotes({problem,body,canEdit,onSaved,onEditing}:{problem:number;body:string;canEdit:boolean;onSaved(body:string):void;onEditing(v:boolean):void}){
 const [editing,setEditing]=useState(false);const [draft,setDraft]=useState(body);const [error,setError]=useState('');const [pending,start]=useTransition();
 function close(){setEditing(false);onEditing(false);setError('');}
 return <aside className="practice-question-notes" aria-label="Question notes">
  <h3>Question notes</h3>
  {editing&&canEdit?<form onSubmit={e=>{e.preventDefault();start(async()=>{
   setError('');try{const result=await saveQuestionNotes(problem,draft);if(result.ok){onSaved(draft);close();}else setError(result.message);}catch{setError("Couldn't save. Your draft is still here — retry.");}
  });}}>
   <label className="field"><span>Question notes (Markdown)</span><textarea rows={16} maxLength={200000} value={draft} disabled={pending} onChange={e=>setDraft(e.target.value)} /></label>
   <div className="actions"><button type="submit" className="btn" disabled={pending}>{pending?'Saving…':error?'Retry':'Save notes'}</button><button className="btn ghost" type="button" disabled={pending} onClick={close}>Cancel</button></div>
   {error?<p role="alert">{error}</p>:null}
  </form>:<>
   {body?<Markdown text={body} />:<p>No notes for this problem yet.</p>}
   {canEdit?<button className="btn ghost small" type="button" onClick={()=>{setDraft(body);setEditing(true);onEditing(true);}}>Edit question notes</button>:null}
  </>}
 </aside>;
}

'use client';
import { useState } from 'react';
import { QUESTIONS,SETS,THEMES,type Theme,type QuestionSet } from '@/lib/behavioral/questions';
import { coverage,emptyAnswer,type Answer,type AnswerEdit } from '@/lib/behavioral/answers';
import type { Story } from '@/lib/behavioral';
import { saveAnswer } from '@/app/actions/behavioral';
export function QuestionBank({stories,initialAnswers,canEdit,onEditing,onOpenStory}:{stories:Story[];initialAnswers:Answer[];canEdit:boolean;onEditing(v:boolean):void;onOpenStory(id:string):void}){
 const [answers,setAnswers]=useState(initialAnswers);
 const [set,setSet]=useState<QuestionSet|''>('');const [theme,setTheme]=useState<Theme|''>('');const [search,setSearch]=useState('');
 const [selected,setSelected]=useState<string|null>(null);const [draft,setDraft]=useState<AnswerEdit|null>(null);
 const [saving,setSaving]=useState(false);const [error,setError]=useState('');
 const visible=QUESTIONS.filter(q=>(!set||q.set===set)&&(!theme||q.theme===theme)&&q.text.toLowerCase().includes(search.toLowerCase().trim()));
 const question=visible.find(q=>q.id===selected)??visible[0];
 const answer=answers.find(a=>a.question_id===question?.id);
 function close(){setDraft(null);setError('');onEditing(false);}
 async function save(){if(!draft||saving)return;setSaving(true);setError('');
  try{const result=await saveAnswer(draft);if(result.ok){setAnswers(xs=>[result.answer,...xs.filter(a=>a.question_id!==result.answer.question_id)]);close();}else setError(result.message);}
  catch{setError("Couldn't save. Your draft is still here — retry.");}finally{setSaving(false);}
 }
 return <section aria-label="Question bank" className="behavioral-questions">
  <h3>Question bank</h3><p className="muted">Generic practice prompts. Company sets are preparation prompts, not an official interview list.</p>
  <div className="behavioral-coverage" aria-label="Story coverage">{coverage(answers,stories.map(s=>s.id)).map(c=><button type="button" className="btn ghost small" key={c.theme} disabled={!!draft} aria-pressed={theme===c.theme} onClick={()=>{setTheme(theme===c.theme?'':c.theme);setSelected(null);}}>{c.theme}: {c.mapped}/{c.total} mapped</button>)}</div>
  <div className="behavioral-filters">
   <label className="field"><span>Question set</span><select value={set} disabled={!!draft} onChange={e=>{setSet(e.target.value as QuestionSet|'');setSelected(null);}}><option value="">All sets</option>{SETS.map(s=><option key={s}>{s}</option>)}</select></label>
   <label className="field"><span>Theme</span><select value={theme} disabled={!!draft} onChange={e=>{setTheme(e.target.value as Theme|'');setSelected(null);}}><option value="">All themes</option>{THEMES.map(s=><option key={s}>{s}</option>)}</select></label>
   <label className="field"><span>Search questions</span><input type="search" value={search} disabled={!!draft} onChange={e=>{setSearch(e.target.value);setSelected(null);}} /></label>
  </div>
  <div className="behavioral-columns">
   <nav aria-label="Choose question">{THEMES.map(t=>{const rows=visible.filter(q=>q.theme===t);return rows.length?<section key={t}><h4>{t}</h4>{rows.map(q=><button type="button" className="btn ghost behavioral-question" key={q.id} disabled={!!draft} aria-pressed={question?.id===q.id} onClick={()=>setSelected(q.id)}>{q.text}<span className="muted">{q.set}</span></button>)}</section>:null;})}{!visible.length?<p>No questions match these filters.</p>:null}</nav>
   {question?<article className="behavioral-answer" aria-label="Selected question">
    <p className="eyebrow">{question.theme} · {question.set}</p><h3>{question.text}</h3>
    {draft&&canEdit?<form aria-label="Edit answer" onSubmit={e=>{e.preventDefault();void save();}}>
     {(['primary_story_id','secondary_story_id'] as const).map((key,i)=><label className="field" key={key}><span>Best story {i+1}</span><select value={draft[key]??''} disabled={saving} onChange={e=>setDraft({...draft,[key]:e.target.value||null})}><option value="">No story mapped</option>{draft[key]&&!stories.some(s=>s.id===draft[key])?<option value={draft[key]!}>Previous story (unavailable)</option>:null}{stories.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select></label>)}
     <label className="field"><span>Answer outline</span><textarea rows={9} maxLength={20000} value={draft.outline} disabled={saving} onChange={e=>setDraft({...draft,outline:e.target.value})} /></label>
     <label className="field"><span>Follow-ups</span><textarea rows={6} maxLength={10000} value={draft.followups} disabled={saving} onChange={e=>setDraft({...draft,followups:e.target.value})} /></label>
     {error?<p role="alert">{error}</p>:null}<div className="actions"><button className="btn" type="submit" disabled={saving}>{saving?'Saving…':error?'Retry':'Save answer'}</button><button className="btn ghost" type="button" disabled={saving} onClick={close}>Cancel</button></div>
    </form>:<>
     <h4>Best stories</h4>{[answer?.primary_story_id,answer?.secondary_story_id].some(id=>stories.some(s=>s.id===id))?<div className="actions">{[answer?.primary_story_id,answer?.secondary_story_id].map((id,i)=>{const story=stories.find(s=>s.id===id);return story?<button type="button" className="btn ghost" key={i} onClick={()=>onOpenStory(story.id)}>{story.title}</button>:null;})}</div>:<p>No stories mapped yet.</p>}
     <h4>Answer outline</h4><p className="behavioral-text">{answer?.outline||'No outline added yet.'}</p>
     <h4>Follow-ups</h4><p className="behavioral-text">{answer?.followups||'No follow-ups added yet.'}</p>
     {canEdit?<button type="button" className="btn" onClick={()=>{setDraft(answer?{...answer}:emptyAnswer(question.id));setError('');onEditing(true);}}>Edit answer</button>:null}
    </>}
   </article>:null}
  </div>
 </section>;
}

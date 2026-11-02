'use client';
import { useState } from 'react';
import type { Item } from '@/lib/experience';
import { emptyStory,type Story,type StoryEdit } from '@/lib/behavioral';
import { saveStory } from '@/app/actions/behavioral';
import { ResumeSections } from './resume';
import { QuestionBank } from './questions';
import type { Answer } from '@/lib/behavioral/answers';
const fields=['situation','task','action','result','skills','numbers'] as const;
const labels={situation:'Situation',task:'Task',action:'Action',result:'Result',skills:'Skills',numbers:'Numbers'};
export function Behavioral({items:initialItems,initialStories,initialAnswers=[],canEdit=false}:{items:Item[];initialStories:Story[];initialAnswers?:Answer[];canEdit?:boolean}){
 const [items,setItems]=useState(initialItems);
 const [resumeEditing,setResumeEditing]=useState(false);
 const [view,setView]=useState<'cv'|'questions'>('cv');
 const [questionEditing,setQuestionEditing]=useState(false);
 const [stories,setStories]=useState(initialStories);
 const [bullet,setBullet]=useState<string|null>(null);
 const [selected,setSelected]=useState<string|null>(null);
 const [draft,setDraft]=useState<StoryEdit|null>(null);
 const [error,setError]=useState('');const [saving,setSaving]=useState(false);
 const current=stories.find(s=>s.id===selected);
 const shown=bullet?stories.filter(s=>s.bullet_id===bullet):stories.filter(s=>s.id===selected);
 const bullets=items.flatMap(i=>i.bullets.filter(b=>b.id).map(b=>({id:b.id!,text:b.text,item:i.title})));
 const source=bullets.find(b=>b.id===(draft?.bullet_id??current?.bullet_id));
 function updateResume(next:Item[]){
  const previousIds=new Set(items.flatMap(item=>item.bullets.map(b=>b.id).filter(Boolean)));
  const nextIds=new Set(next.flatMap(item=>item.bullets.map(b=>b.id).filter(Boolean)));
  setItems(next);
  setStories(rows=>rows.map(story=>story.bullet_id&&previousIds.has(story.bullet_id)&&!nextIds.has(story.bullet_id)?{...story,bullet_id:null}:story));
  if(bullet&&!nextIds.has(bullet))setBullet(null);
 }
 function edit(story:StoryEdit){setDraft({...story});setError('');}
 async function save(){if(!draft||saving)return;setSaving(true);setError('');
  try{const result=await saveStory(draft);if(result.ok){setStories(xs=>[result.story,...xs.filter(s=>s.id!==result.story.id)]);setSelected(result.story.id);setBullet(result.story.bullet_id);setDraft(null);}else setError(result.message);}
  catch{setError("Couldn't save. Your draft is still here — retry.");}finally{setSaving(false);}
 }
 return <div className="behavioral">
  <header className="behavioral-head"><h2>Resume &amp; Stories</h2><div className="behavioral-toolbar"><div className="behavioral-tabs" role="tablist" aria-label="Behavioral view"><button type="button" role="tab" id="behavioral-tab-cv" aria-controls="behavioral-cv" aria-selected={view==='cv'} disabled={questionEditing||resumeEditing} onClick={()=>setView('cv')}>CV</button><button type="button" role="tab" id="behavioral-tab-questions" aria-controls="behavioral-questions" aria-selected={view==='questions'} disabled={!!draft||resumeEditing} onClick={()=>setView('questions')}>Questions</button></div>{canEdit?<button className="btn" disabled={!!draft||questionEditing||resumeEditing} onClick={()=>{setView('cv');edit(emptyStory(bullet));}}>Add story</button>:null}</div></header>
  <div id="behavioral-questions" role="tabpanel" aria-labelledby="behavioral-tab-questions" hidden={view!=='questions'}><details className="behavioral-story-library"><summary>Story library ({stories.length})</summary><nav aria-label="Story library">{stories.map(story=><button type="button" className="btn ghost small" key={story.id} disabled={questionEditing} onClick={()=>{setSelected(story.id);setBullet(null);setView('cv')}}>{story.title}</button>)}{!stories.length?<p>No stories added yet.</p>:null}</nav></details><QuestionBank stories={stories} initialAnswers={initialAnswers} canEdit={canEdit} onEditing={setQuestionEditing} onOpenStory={id=>{setSelected(id);setBullet(null);setView('cv');}} /></div>
  <div id="behavioral-cv" role="tabpanel" aria-labelledby="behavioral-tab-cv" hidden={view!=='cv'}>
  <div className={`behavioral-resume-layout${draft||bullet||selected?' has-story':''}`}>
   <ResumeSections items={items} canEdit={canEdit} disabled={!!draft} onItems={updateResume} onEditing={setResumeEditing} activeBullet={bullet} storyCount={id=>stories.filter(s=>s.bullet_id===id).length} onBullet={id=>{setBullet(id);setSelected(stories.find(s=>s.bullet_id===id)?.id??null)}} />
   {draft||bullet||selected ?
   <section className="behavioral-stories" aria-label="STAR stories">
    {draft&&canEdit?<form onSubmit={e=>{e.preventDefault();void save();}} aria-label="Edit STAR story">
     <h3>{stories.some(s=>s.id===draft.id)?'Edit story':'New story'}</h3>
     <label className="field"><span>Title</span><input required maxLength={160} value={draft.title} disabled={saving} onChange={e=>setDraft({...draft,title:e.target.value})} /></label>
     <label className="field"><span>Linked CV bullet</span><select value={draft.bullet_id??''} disabled={saving} onChange={e=>setDraft({...draft,bullet_id:e.target.value||null})}><option value="">No linked bullet</option>{draft.bullet_id&&!bullets.some(b=>b.id===draft.bullet_id)?<option value={draft.bullet_id}>Previous bullet</option>:null}{bullets.map(b=><option key={b.id} value={b.id}>{b.item}: {b.text}</option>)}</select></label>
     {fields.map(f=><label className="field" key={f}><span>{labels[f]}</span><textarea rows={f==='skills'||f==='numbers'?2:5} maxLength={f==='skills'?1000:f==='numbers'?2000:20000} value={draft[f]} disabled={saving} onChange={e=>setDraft({...draft,[f]:e.target.value})} /></label>)}
     {error?<p role="alert">{error}</p>:null}<div className="actions"><button type="submit" className="btn" disabled={saving}>{saving?'Saving…':error?'Retry':'Save story'}</button><button type="button" className="btn ghost" disabled={saving} onClick={()=>{setDraft(null);setError('');}}>Cancel</button></div>
    </form>:<>
     <div className="actions"><h3>{bullet?'Stories for this bullet':'Selected story'}</h3><button className="btn ghost small" onClick={()=>{setBullet(null);setSelected(null);}}>Close stories</button></div>
     {!shown.length?<p>No stories {bullet?'linked to this bullet':'added'} yet.</p>:<nav aria-label="Choose story">{shown.map(s=><button className="btn ghost" key={s.id} aria-pressed={selected===s.id} onClick={()=>setSelected(s.id)}>{s.title}</button>)}</nav>}
     {current?<article aria-label="Selected STAR story"><header className="behavioral-head"><h3>{current.title}</h3>{canEdit?<button className="btn ghost small" disabled={resumeEditing} onClick={()=>edit(current)}>Edit story</button>:null}</header>
      <p className="muted">{source?`From: ${source.item} — ${source.text}`:'No linked CV bullet'}</p>
      {fields.map(f=><section key={f}><h4>{labels[f]}</h4><p className="behavioral-text">{current[f]||'Not added yet.'}</p></section>)}
     </article>:shown.length?<p>Select a story to read it.</p>:null}
    </>}
   </section> : null}
  </div>
  </div>
 </div>;
}

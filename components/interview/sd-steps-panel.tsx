'use client';
import {useState} from 'react';
import {Markdown} from '@/components/markdown';
import {AnswerInput} from './sd-answer';
import {cleanTicks,scoreChecklist,toggleTick,type AttemptDraft} from '@/lib/interview/sd-attempt';
import {timeHint,type ResolvedStep} from '@/lib/interview/sd-steps';

export interface FinishState{status:'idle'|'saving'|'saved'|'failed';message?:string}
interface Props{steps:readonly ResolvedStep[];draft:AttemptDraft;onStep:(index:number)=>void;onAnswer:(stepId:string,text:string)=>void;onChecks:(stepId:string,ticked:number[])=>void;onFinish:()=>void;finish:FinishState}
/** Left panel of the whiteboard: step navigator, answer box, model-answer comparison, how-to and clarifying questions. */
export function StepsPanel({steps,draft,onStep,onAnswer,onChecks,onFinish,finish}:Props){
 const index=steps.length?Math.min(draft.step,steps.length-1):0;const step=steps[index];
 return <aside className="iv-sd-board-panel" aria-label="Interview steps">
  <h2>Interview steps</h2>
  {step?<>
   <nav className="iv-sd-steps-nav" aria-label="Choose a step">
    <button type="button" aria-label="Previous step" disabled={index===0} onClick={()=>onStep(index-1)}>‹</button>
    <ol>{steps.map((s,n)=><li key={s.id}><button type="button" aria-label={`Step ${n+1}: ${s.title}`} title={s.title} aria-current={n===index?'step':undefined} data-done={!!(draft.answers[s.id]??'').trim()||undefined} onClick={()=>onStep(n)}>{n+1}</button></li>)}</ol>
    <button type="button" aria-label="Next step" disabled={index===steps.length-1} onClick={()=>onStep(index+1)}>›</button>
   </nav>
   <StepBody key={step.id} step={step} index={index} count={steps.length} answer={draft.answers[step.id]??''} ticked={draft.checks[step.id]??[]} onAnswer={t=>onAnswer(step.id,t)} onChecks={t=>onChecks(step.id,t)}/>
  </>:<p className="iv-sd-steps-empty">This question has no interview steps yet. You can still draw on the board and finish an attempt.</p>}
  <footer className="iv-sd-steps-foot">
   <button type="button" className="iv-sd-primary" onClick={onFinish} disabled={finish.status==='saving'}>{finish.status==='saving'?'Saving…':'Finish attempt'}</button>
   <p role="status" data-state={finish.status}>{finish.status==='saved'?'Attempt saved. Open History to review it.':finish.status==='failed'?finish.message:'Saves your board, answers, checklist and timer to History.'}</p>
  </footer>
 </aside>;
}
function StepBody({step,index,count,answer,ticked,onAnswer,onChecks}:{step:ResolvedStep;index:number;count:number;answer:string;ticked:number[];onAnswer:(t:string)=>void;onChecks:(t:number[])=>void}){
 const [compare,setCompare]=useState(false);const [tab,setTab]=useState<'how'|'ask'>('how');const [open,setOpen]=useState<number[]>([]);
 const score=scoreChecklist(step,ticked);const live=cleanTicks(ticked,step.checklist.length);const hint=timeHint(step.minutes);
 return <section className="iv-sd-step" aria-label={`Step ${index+1} of ${count}: ${step.title}`}>
  <p className="iv-sd-step-count">Step {index+1} of {count}</p>
  <p className="iv-sd-step-cat">{step.category}</p>
  <h3>{step.title}</h3>
  {step.question?<blockquote className="iv-sd-interviewer"><span>Interviewer</span>{step.question}</blockquote>:null}
  {step.instruction?<p className="iv-sd-step-todo">{step.instruction}</p>:null}
  {hint?<p className="iv-sd-step-time">{hint}</p>:null}
  <AnswerInput label="Your answer" value={answer} onChange={onAnswer}/>
  <button type="button" className="iv-sd-compare-btn" aria-expanded={compare} onClick={()=>setCompare(v=>!v)}>{compare?'Hide model answer':'Compare with model answer'}</button>
  {compare?<div className="iv-sd-compare" data-testid="sd-compare">
   <h4>Model answer</h4>
   {step.modelAnswer.trim()?<Markdown text={step.modelAnswer}/>:<p>No model answer has been written for this step yet.</p>}
   {step.checklist.length?<>
    <h4 id={`chk-${step.id}`}>Key points: tick what you covered</h4>
    <ul className="iv-sd-checklist" aria-labelledby={`chk-${step.id}`}>{step.checklist.map((c,n)=><li key={n}><label><input type="checkbox" checked={live.includes(n)} onChange={()=>onChecks(toggleTick(live,n))}/><span>{c}</span></label></li>)}</ul>
    <p className="iv-sd-covered" role="status">You covered {score.covered} of {score.total}</p>
   </>:null}
  </div>:null}
  <div className="iv-sd-step-tabs" role="tablist" aria-label="Help for this step">
   <button type="button" role="tab" id={`tab-how-${step.id}`} aria-selected={tab==='how'} aria-controls={`pane-${step.id}`} onClick={()=>setTab('how')}>How to answer</button>
   <button type="button" role="tab" id={`tab-ask-${step.id}`} aria-selected={tab==='ask'} aria-controls={`pane-${step.id}`} onClick={()=>setTab('ask')}>Ask clarifying questions</button>
  </div>
  <div role="tabpanel" id={`pane-${step.id}`} aria-labelledby={`tab-${tab}-${step.id}`} className="iv-sd-step-pane">
   {tab==='how'?(step.howToAnswer.trim()?<Markdown text={step.howToAnswer}/>:<p>No guidance has been written for this step yet.</p>)
    :step.clarifying.length?<ul className="iv-sd-clarify">{step.clarifying.map((c,n)=>{const shown=open.includes(n);return <li key={n}>
      <button type="button" aria-expanded={shown} onClick={()=>setOpen(o=>shown?o.filter(x=>x!==n):[...o,n])}>{c.q}</button>
      {shown?<p className="iv-sd-interviewer-says"><span>Interviewer</span>{c.a}</p>:null}</li>;})}</ul>
    :<p>No common clarifying questions have been written for this step yet.</p>}
  </div>
 </section>;
}

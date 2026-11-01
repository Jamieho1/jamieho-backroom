"use client";

import { useEffect, useRef, useState } from "react";
import { PRACTICE_LIST, problemByNumber, starterCode } from "@/lib/practice/catalog";
import { extraOf, solutionOf } from "@/lib/practice/solutions";
import { PythonRunner, type RunOutcome, type RunMode } from "@/lib/practice/runner";
import { readCode, storeCode } from "@/lib/practice/storage";
import { leetcodeUrl } from "@/lib/notes/neetcode150";
import { TOPICS } from "@/lib/notes/topics";
import { Visual } from "@/lib/notes/visual";
import { Markdown } from "@/components/notes/markdown";
import { CodeBlock } from "@/components/notes/code-highlight";
import { TraceVisual } from "@/components/notes/trace-visual";
import { CodeEditor } from "./code-editor";
import { QuestionNotes } from "./question-notes";
import { usePracticeStars } from "./use-practice-stars";
import { useSavedPractice } from "./use-saved-practice";

export function PracticeArena({ viewerKey, initialProblem, canEdit = false }: { viewerKey:string; initialProblem?:number;canEdit?:boolean }) {
 const [selected,setSelected]=useState(problemByNumber(initialProblem??0)?.lc ?? PRACTICE_LIST[0].lc);
 const [search,setSearch]=useState("");
 const [topic,setTopic]=useState("");
 const [starredOnly,setStarredOnly]=useState(false);
 const stars=usePracticeStars(canEdit);
 const [busy,setBusy]=useState(false);
 const list=PRACTICE_LIST.filter(p=>(!topic||p.topic===topic)&&`${p.title} ${p.lc}`.toLowerCase().includes(search.toLowerCase().trim())&&(!canEdit||!starredOnly||stars.stars.has(p.lc)));
 return <div className="practice-arena">
  <aside className="practice-sidebar">
   <h2>Practice</h2>
   <label className="field"><span>Search problems</span><input type="search" placeholder="Search questions…" value={search} onChange={e=>setSearch(e.target.value)} /></label>
   <label className="field"><span>Topic</span><select value={topic} onChange={e=>setTopic(e.target.value)}><option value="">All topics</option>{TOPICS.map(t=><option key={t.id} value={t.id}>{t.label}</option>)}</select></label>
   {canEdit?<>
    <div className="practice-review-filter" aria-label="Review list"><button type="button" className="btn ghost small" aria-pressed={!starredOnly} onClick={()=>setStarredOnly(false)}>All questions</button><button type="button" className="btn ghost small" aria-pressed={starredOnly} disabled={!stars.loaded} onClick={()=>setStarredOnly(true)}>★ Starred ({stars.stars.size})</button></div>
    {stars.loading?<p role="status">Loading starred questions…</p>:null}
    {stars.loadError?<div role="alert"><p>{stars.loadError}</p><button type="button" className="btn ghost small" onClick={()=>void stars.load()}>Retry loading stars</button></div>:null}
    {stars.saveError?<div role="alert"><p>{stars.saveError}</p><button type="button" className="btn ghost small" disabled={stars.saving} onClick={()=>void stars.retry()}>Retry saving star</button></div>:null}
   </>:null}
   <nav aria-label="Practice problems">{list.map(p=><button type="button" key={p.lc} disabled={busy} aria-current={selected===p.lc?"page":undefined} onClick={()=>setSelected(p.lc)}>{canEdit&&stars.stars.has(p.lc)?<span aria-label="Starred">★ </span>:null}{p.title}<span className="practice-tags"><Difficulty value={p.difficulty} /><span className="practice-tag practice-collection">NeetCode 150</span></span></button>)}{!list.length?<p>{canEdit&&starredOnly?'No starred questions match. Star a question to revisit it here.':'No matching problems.'}</p>:null}</nav>
  </aside>
  <ProblemWorkspace key={`${viewerKey}:${selected}`} lc={selected} viewerKey={viewerKey} canEdit={canEdit} onBusy={setBusy} starred={stars.stars.has(selected)} starDisabled={!stars.loaded||stars.loading||!!stars.loadError||stars.saving||!!stars.pending} onStar={()=>void stars.save(selected,!stars.stars.has(selected))} />
 </div>;
}

function Difficulty({value}:{value:string}){return <span className={`practice-tag practice-difficulty ${value.toLowerCase()}`} data-difficulty={value.toLowerCase()}>{value}</span>;}

function ProblemWorkspace({lc,viewerKey,canEdit,onBusy,starred,starDisabled,onStar}:{lc:number;viewerKey:string;canEdit:boolean;onBusy(b:boolean):void;starred:boolean;starDisabled:boolean;onStar():void}) {
 const problem=problemByNumber(lc)!;
 const meta=PRACTICE_LIST.find(p=>p.lc===lc)!;
 const [code,setCode]=useState(()=>readCode(viewerKey,lc)??starterCode(lc));
 const [editorVersion,setEditorVersion]=useState(0);
 const [browserDraft,setBrowserDraft]=useState(()=>readCode(viewerKey,lc));
 const [notesEditing,setNotesEditing]=useState(false);
 const saved=useSavedPractice(lc,canEdit,remote=>{if(remote!==null){setCode(remote);setEditorVersion(v=>v+1);}});
 const ownerReady=!canEdit||saved.loaded;
 const [tab,setTab]=useState("Problem");
 const [phase,setPhase]=useState<"loading"|"ready"|"busy"|"failed">("loading");
 const [failure,setFailure]=useState("");
 const [storageFailed,setStorageFailed]=useState(false);
 const [result,setResult]=useState<RunOutcome|null>(null);
 const [mode,setMode]=useState<RunMode>("run");
 const runner=useRef<PythonRunner|null>(null);
 const mounted=useRef(false);
 useEffect(()=>{onBusy(phase==='busy'||notesEditing||saved.savingCode||saved.savingAttempt||!!saved.pendingAttempt);},[phase,notesEditing,saved.savingCode,saved.savingAttempt,saved.pendingAttempt,onBusy]);
 async function prepare(current:PythonRunner) {
  try{await current.warmUp();if(mounted.current&&runner.current===current)setPhase("ready");}
  catch{if(mounted.current&&runner.current===current){setPhase("failed");setFailure("Python could not load. Run and Submit are unavailable. You can still read the problem and solution.");}}
 }
 useEffect(()=>{
  mounted.current=true;
  const current=new PythonRunner();runner.current=current;void prepare(current);
  return ()=>{mounted.current=false;current.dispose();runner.current=null;};
 },[]);
 async function run(nextMode:RunMode) {
  const current=runner.current;if(!current||phase!=="ready"||!ownerReady||saved.pendingAttempt)return;
  const snapshot=code;
  setPhase("busy");setMode(nextMode);setResult(null);
  const out=await current.run(problem,snapshot,nextMode);
  if(mounted.current){setResult(out);setPhase("loading");void prepare(current);if(canEdit)void saved.record(snapshot,nextMode,out);}
 }
 return <section className="practice-workspace" aria-label={meta.title}>
  <header className="practice-heading"><h2>{meta.title}</h2><div className="practice-heading-meta"><Difficulty value={meta.difficulty} /><span className="practice-tag practice-collection">NeetCode 150</span><a href={leetcodeUrl(meta)} target="_blank" rel="noopener noreferrer">Original problem ↗</a>{canEdit?<button type="button" className="btn ghost small practice-star" aria-label={`${starred?'Unstar':'Star'} ${meta.title} for later`} aria-pressed={starred} disabled={starDisabled} onClick={onStar}>{starred?'★ Starred':'☆ Star'}</button>:null}</div></header>
  <div className="practice-columns">
   <div className="practice-description">
    <div className="notes-tabs" role="tablist" aria-label="Problem view">{["Problem","Solution","Notes"].map(t=><button type="button" role="tab" key={t} disabled={notesEditing&&t!=="Notes"} id={`practice-tab-${t}`} aria-selected={tab===t} aria-controls="practice-panel" onClick={()=>setTab(t)}>{t}</button>)}</div>
    <div role="tabpanel" id="practice-panel" aria-labelledby={`practice-tab-${tab}`}>
     {tab==="Problem"?<>
      <Markdown text={problem.statement} />
      <h3>Examples</h3>{problem.examples.map((e,i)=><div className="practice-example" key={i}><h4>Example {i+1}</h4><pre>Input: {e.input}{"\n"}Output: {e.output}</pre>{e.explanation?<p>{e.explanation}</p>:null}</div>)}
      <h3>Constraints</h3><ul>{problem.constraints.map(c=><li key={c}>{c}</li>)}</ul>
      <details><summary>Hints</summary>{problem.hints.map((h,i)=><p key={i}>{h}</p>)}</details>
     </>:tab==="Solution"?<ProblemSolution lc={lc} />:<>
      {saved.loading?<p role="status">Loading question notes…</p>:saved.loadError?<div role="alert"><p>{saved.loadError}</p><button type="button" className="btn ghost small" onClick={()=>void saved.load()}>Retry loading notes</button></div>:<QuestionNotes problem={lc} body={saved.data.note} canEdit={canEdit} onSaved={saved.setNote} onEditing={setNotesEditing} />}
     </>}
    </div>
   </div>
   <div className="practice-coding">
    <h3>Python</h3><p className="muted small">{canEdit?"Save code to sync it across devices. Runs and submissions are recorded automatically.":"Code is saved in this browser only."} Run checks examples; Submit checks all local tests.</p>
    {!ownerReady?<p role="status">Loading saved code…</p>:<CodeEditor key={editorVersion} initial={code} label="Python code" onChange={value=>{setCode(value);setBrowserDraft(value);setStorageFailed(!storeCode(viewerKey,lc,value));}} />}
    {canEdit&&ownerReady?<div className="practice-owner-save">
     <button type="button" className="btn ghost small" disabled={saved.savingCode||saved.loading||!!saved.loadError} onClick={()=>void saved.saveCode(code)}>{saved.savingCode?'Saving code…':saved.codeError?'Retry saving code':'Save code'}</button>
     <span role="status">{saved.savingCode?'Saving…':saved.data.code===code?'Saved across devices':'Unsaved changes'}</span>
     {saved.codeError?<p role="alert">{saved.codeError}</p>:null}
     {saved.loadError?<div role="alert"><p>{saved.loadError}</p><button type="button" onClick={()=>void saved.load()}>Retry loading saved data</button></div>:null}
     {saved.data.code!==null&&saved.data.code!==code&&!saved.loading&&!saved.loadError?<button type="button" className="btn ghost small" disabled={saved.savingCode} onClick={()=>{setCode(saved.data.code!);setEditorVersion(v=>v+1);}}>Load saved code</button>:null}
     {browserDraft!==null&&browserDraft!==code?<button type="button" className="btn ghost small" onClick={()=>{setCode(browserDraft);setEditorVersion(v=>v+1);}}>Restore browser draft</button>:null}
    </div>:null}
    {storageFailed?<p role="status">Browser storage is unavailable or full. Keep a copy of your code before leaving.</p>:null}
    <div className="practice-run-controls">
     <button type="button" className="btn ghost" disabled={phase!=="ready"||!ownerReady||!!saved.pendingAttempt||saved.savingAttempt} onClick={()=>void run("run")}>Run</button>
     <button type="button" className="btn" disabled={phase!=="ready"||!ownerReady||!!saved.pendingAttempt||saved.savingAttempt} onClick={()=>void run("submit")}>Submit</button>
     {phase==="loading"?<span role="status">Loading Python…</span>:phase==="busy"?<span role="status">Running…</span>:phase==="ready"?<span className="muted small">Python ready</span>:null}
    </div>
    {phase==="failed"?<div role="alert"><p>{failure}</p><button type="button" className="btn ghost small" onClick={()=>{runner.current?.dispose();const current=new PythonRunner();runner.current=current;setPhase("loading");void prepare(current);}}>Retry Python</button></div>:null}
    {result?<Results result={result} mode={mode} />:null}
    {canEdit?<>
     {saved.savingAttempt?<p role="status">Saving attempt…</p>:null}
     {saved.attemptError?<div role="alert"><p>{saved.attemptError} Retry saving this attempt before starting another run.</p><button type="button" className="btn ghost small" disabled={saved.savingAttempt} onClick={()=>void saved.retryAttempt()}>Retry saving attempt</button></div>:null}
     {saved.data.attempts.length?<details className="practice-history"><summary>Recent attempts</summary><ol>{saved.data.attempts.map(a=><li key={a.id}><time dateTime={a.created_at}>{new Date(a.created_at).toLocaleString()}</time> · {a.mode} · {a.status} · {a.passed}/{a.total}</li>)}</ol></details>:null}
    </>:null}
   </div>
  </div>
 </section>;
}

function ProblemSolution({lc}:{lc:number}) {
 const problem=problemByNumber(lc)!;const solution=solutionOf(lc);const extra=extraOf(lc);
 const parsed=solution?Visual.safeParse(solution.visual):null;
 return <div className="practice-solution">
  {solution?<><h3>Intuition</h3><Markdown text={solution.intuition} /><h3>Algorithm</h3><Markdown text={solution.algorithm} /></>:null}
  {parsed?.success?<TraceVisual visual={parsed.data} />:null}
  <h3>Reference code</h3><CodeBlock code={problem.solution} />
  <h3>Complexity</h3>{extra?<dl><dt>Time: {extra.time.o}</dt><dd><Markdown text={extra.time.why} /></dd><dt>Space: {extra.space.o}</dt><dd><Markdown text={extra.space.why} /></dd></dl>:<p>{solution?.complexity}</p>}
  {extra?<><h3>Common pitfalls</h3><ul>{extra.pitfalls.map(p=><li key={p}><Markdown text={p} /></li>)}</ul></>:null}
 </div>;
}
function Results({result,mode}:{result:RunOutcome;mode:RunMode}) {
 return <section className="practice-results" aria-label="Test results" aria-live="polite">
  <h3>{mode==="run"?"Run":"Submit"} results</h3>
  {result.status==="ok"?<>
   <p>{result.passed} / {result.total} passed</p>
   <ul>{result.results.map((r,i)=><li key={r.id}><strong>{r.visible?r.id:`Additional test ${i+1}`}: {r.status}</strong>{r.visible?<pre>{r.error??`Got: ${r.got}\nExpected: ${r.expected}`}</pre>:null}</li>)}</ul>
   {result.stdout?<details open><summary>Output</summary><pre>{result.stdout}</pre></details>:null}
  </>:result.status==="timeout"?<p>The run exceeded {result.afterMs/1000} seconds and was stopped. Check for an infinite loop.</p>:<pre>{result.error}</pre>}
 </section>;
}

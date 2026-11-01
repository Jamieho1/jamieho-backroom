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

export function PracticeArena({ viewerKey, initialProblem }: { viewerKey:string; initialProblem?:number }) {
 const [selected,setSelected]=useState(problemByNumber(initialProblem??0)?.lc ?? PRACTICE_LIST[0].lc);
 const [search,setSearch]=useState("");
 const [topic,setTopic]=useState("");
 const [busy,setBusy]=useState(false);
 const list=PRACTICE_LIST.filter(p=>(!topic||p.topic===topic)&&p.title.toLowerCase().includes(search.toLowerCase().trim()));
 return <div className="practice-arena">
  <aside className="practice-sidebar">
   <h2>Practice</h2>
   <label className="field"><span>Search problems</span><input type="search" value={search} onChange={e=>setSearch(e.target.value)} /></label>
   <label className="field"><span>Topic</span><select value={topic} onChange={e=>setTopic(e.target.value)}><option value="">All topics</option>{TOPICS.map(t=><option key={t.id} value={t.id}>{t.label}</option>)}</select></label>
   <nav aria-label="Practice problems">{list.map(p=><button type="button" key={p.lc} disabled={busy} aria-current={selected===p.lc?"page":undefined} onClick={()=>setSelected(p.lc)}>{p.title}<small>{p.difficulty}</small></button>)}{!list.length?<p>No matching problems.</p>:null}</nav>
  </aside>
  <ProblemWorkspace key={`${viewerKey}:${selected}`} lc={selected} viewerKey={viewerKey} onBusy={setBusy} />
 </div>;
}

function ProblemWorkspace({lc,viewerKey,onBusy}:{lc:number;viewerKey:string;onBusy(b:boolean):void}) {
 const problem=problemByNumber(lc)!;
 const meta=PRACTICE_LIST.find(p=>p.lc===lc)!;
 const [code,setCode]=useState(()=>readCode(viewerKey,lc)??starterCode(lc));
 const [tab,setTab]=useState("Problem");
 const [phase,setPhase]=useState<"loading"|"ready"|"busy"|"failed">("loading");
 const [failure,setFailure]=useState("");
 const [storageFailed,setStorageFailed]=useState(false);
 const [result,setResult]=useState<RunOutcome|null>(null);
 const [mode,setMode]=useState<RunMode>("run");
 const runner=useRef<PythonRunner|null>(null);
 const mounted=useRef(false);
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
  const current=runner.current;if(!current||phase!=="ready")return;
  setPhase("busy");onBusy(true);setMode(nextMode);setResult(null);
  try{
   const out=await current.run(problem,code,nextMode);
   if(mounted.current){setResult(out);setPhase("loading");void prepare(current);}
  }finally{if(mounted.current)onBusy(false);}
 }
 return <section className="practice-workspace" aria-label={meta.title}>
  <header className="practice-heading"><h2>{meta.title}</h2><span>{meta.difficulty}</span><a href={leetcodeUrl(meta)} target="_blank" rel="noopener noreferrer">Original problem ↗</a></header>
  <div className="practice-columns">
   <div className="practice-description">
    <div className="notes-tabs" role="tablist" aria-label="Problem view">{["Problem","Solution"].map(t=><button type="button" role="tab" key={t} id={`practice-tab-${t}`} aria-selected={tab===t} aria-controls="practice-panel" onClick={()=>setTab(t)}>{t}</button>)}</div>
    <div role="tabpanel" id="practice-panel" aria-labelledby={`practice-tab-${tab}`}>
     {tab==="Problem"?<>
      <Markdown text={problem.statement} />
      <h3>Examples</h3>{problem.examples.map((e,i)=><div className="practice-example" key={i}><h4>Example {i+1}</h4><pre>Input: {e.input}{"\n"}Output: {e.output}</pre>{e.explanation?<p>{e.explanation}</p>:null}</div>)}
      <h3>Constraints</h3><ul>{problem.constraints.map(c=><li key={c}>{c}</li>)}</ul>
      <details><summary>Hints</summary>{problem.hints.map((h,i)=><p key={i}>{h}</p>)}</details>
     </>:<ProblemSolution lc={lc} />}
    </div>
   </div>
   <div className="practice-coding">
    <h3>Python</h3><p className="muted small">Code is saved in this browser only. Run checks examples; Submit checks all local tests.</p>
    <CodeEditor initial={code} label="Python code" onChange={value=>{setCode(value);setStorageFailed(!storeCode(viewerKey,lc,value));}} />
    {storageFailed?<p role="status">Browser storage is unavailable or full. Keep a copy of your code before leaving.</p>:null}
    <div className="practice-run-controls">
     <button type="button" className="btn ghost" disabled={phase!=="ready"} onClick={()=>void run("run")}>Run</button>
     <button type="button" className="btn" disabled={phase!=="ready"} onClick={()=>void run("submit")}>Submit</button>
     {phase==="loading"?<span role="status">Loading Python…</span>:phase==="busy"?<span role="status">Running…</span>:phase==="ready"?<span className="muted small">Python ready</span>:null}
    </div>
    {phase==="failed"?<div role="alert"><p>{failure}</p><button type="button" className="btn ghost small" onClick={()=>{runner.current?.dispose();const current=new PythonRunner();runner.current=current;setPhase("loading");void prepare(current);}}>Retry Python</button></div>:null}
    {result?<Results result={result} mode={mode} />:null}
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

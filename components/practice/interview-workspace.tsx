'use client';
import Link from 'next/link';
import {useEffect,useMemo,useRef,useState,type CSSProperties} from 'react';
import {problemByNumber,starterCode} from '@/lib/practice/catalog';
import {practiceNavigation} from '@/lib/interview/practice-navigation';
import {interviewProblemHref} from '@/lib/interview/content';
import {PythonRunner,type RunMode,type RunOutcome} from '@/lib/practice/runner';
import {practiceData,type PracticePreview} from '@/lib/content-drafts/app-overlay';
import {loadPracticeCompletions} from '@/app/actions/practice-progress';
import {leetcodeUrl} from '@/lib/notes/neetcode150';
import {Markdown} from '@/components/notes/markdown';
import {CodeEditor} from './code-editor';
import {QuestionNotes} from './question-notes';
import {PracticeTimer} from './timer';
import {ResizeHandle,usePracticePanels} from './panels';
import {useSavedPractice} from './use-saved-practice';
import {useCodeAutosave} from './use-code-autosave';
import {usePracticeStars} from './use-practice-stars';
import {ProblemDrawer} from './problem-drawer';
import {ProblemSolution} from './problem-readers';

import {useTestCases} from './use-test-cases';
import {TestConsole} from './test-console';
import {casesToTests} from '@/lib/practice/cases';

const PANEL_KEY='jb.practice.workspace.v1';
function useWorkspacePanels(){
 const [state,setState]=useState({editor:60,console:true,description:true});const [ready,setReady]=useState(false);
 useEffect(()=>{try{const v=JSON.parse(localStorage.getItem(PANEL_KEY)??'null');if(v)setState({editor:typeof v.editor==='number'&&Number.isFinite(v.editor)?Math.max(25,Math.min(75,v.editor)):60,console:typeof v.console==='boolean'?v.console:true,description:typeof v.description==='boolean'?v.description:true});}catch{}setReady(true);},[]);
 useEffect(()=>{if(ready)try{localStorage.setItem(PANEL_KEY,JSON.stringify(state));}catch{}},[ready,state]);
 return {state,setState};
}
function Shortcuts({onClose}:{onClose():void}){
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{ref.current?.showModal();return()=>ref.current?.close();},[]);
 return <dialog className="pw-shortcuts" ref={ref} aria-label="Keyboard shortcuts" onCancel={e=>{e.preventDefault();onClose();}}><header><h2>Keyboard shortcuts</h2><button aria-label="Close shortcuts" onClick={onClose}>×</button></header><dl><dt>⌘ / Ctrl + Enter</dt><dd>Run</dd><dt>⌘ / Ctrl + Shift + Enter</dt><dd>Submit</dd><dt>⌘ / Ctrl + S</dt><dd>Save now</dd><dt>Escape</dt><dd>Exit fullscreen or close panels</dd></dl></dialog>;
}
export function InterviewPracticeWorkspace({lc,viewerKey,canSave,canEdit,preview}:{lc:number;viewerKey:string;canSave:boolean;canEdit:boolean;preview?:PracticePreview}){
 const navigation=practiceNavigation(lc),meta=navigation.current!,problem=problemByNumber(lc)!;
 const previewRow=useMemo(()=>preview?practiceData(preview,lc):undefined,[preview,lc]);
 const tests=useTestCases(problem,viewerKey,canSave,!!preview);
 const [caseError,setCaseError]=useState('');
 const saved=useSavedPractice(lc,canSave&&!preview,()=>{},previewRow);
 const autosave=useCodeAutosave({viewerKey,problem:lc,starter:previewRow?.code??starterCode(lc),canSave:canSave&&!preview,ready:!canSave||saved.loaded&&!saved.loadError,remote:saved.data.code,readOnly:!!preview});
 const liveFlags=usePracticeStars(canSave&&!preview,viewerKey);
 const flags=preview?{...liveFlags,stars:new Set(preview.stars),loaded:true}:liveFlags;
 const [completed,setCompleted]=useState<Set<number>>(new Set());const [progressError,setProgressError]=useState('');const [progressRetry,setProgressRetry]=useState(0);
 useEffect(()=>{let alive=true;if(canSave&&!preview)void loadPracticeCompletions().then(r=>{if(!alive)return;if(r.ok){setCompleted(new Set(r.problems));setProgressError('');}else setProgressError(r.message);}).catch(()=>{if(alive)setProgressError('Could not load your progress.');});return()=>{alive=false;};},[canSave,preview,viewerKey,progressRetry]);
 const [drawer,setDrawer]=useState(false),[shortcuts,setShortcuts]=useState(false),[fullscreen,setFullscreen]=useState(false),[editorVersion,setEditorVersion]=useState(0),[tab,setTab]=useState('Problem'),[notesEditing,setNotesEditing]=useState(false);
 const panels=useWorkspacePanels(),horizontal=usePracticePanels();
 const columns=useRef<HTMLDivElement>(null),right=useRef<HTMLDivElement>(null),topicButton=useRef<HTMLButtonElement>(null),helpButton=useRef<HTMLButtonElement>(null),fullButton=useRef<HTMLButtonElement>(null);
 const [size,setSize]=useState({width:1000,height:500});
 useEffect(()=>{const observer=new ResizeObserver(()=>setSize({width:columns.current?.clientWidth??1000,height:right.current?.clientHeight??500}));if(columns.current)observer.observe(columns.current);if(right.current)observer.observe(right.current);return()=>observer.disconnect();},[]);
 const runner=useRef<PythonRunner|null>(null),mounted=useRef(false);
 const [phase,setPhase]=useState<'loading'|'ready'|'busy'|'failed'>('loading'),[result,setResult]=useState<RunOutcome|null>(null),[mode,setMode]=useState<RunMode>('run');
 async function prepare(current:PythonRunner){try{await current.warmUp();if(mounted.current&&runner.current===current)setPhase('ready');}catch{if(mounted.current&&runner.current===current)setPhase('failed');}}
 useEffect(()=>{mounted.current=true;if(!preview){const current=new PythonRunner();runner.current=current;void prepare(current);}return()=>{mounted.current=false;runner.current?.dispose();runner.current=null;};},[]);
 const available=!preview&&phase==='ready'&&(!canSave||saved.loaded)&&!saved.pendingAttempt&&!saved.savingAttempt;
 async function run(next:RunMode){
  if(!available||!runner.current)return;const current=runner.current,snapshot=autosave.code;
  let runTests;try{if(next==='run')runTests=casesToTests(problem,tests.cases);setCaseError('');}catch{setCaseError('Check test inputs: class operations and arguments must be matching JSON arrays, starting with '+problem.method+'.');panels.setState(s=>({...s,console:true}));return;}
  setPhase('busy');setMode(next);setResult(null);panels.setState(s=>({...s,console:true}));void autosave.flush();void tests.flush();
  const out=await current.run(problem,snapshot,next,5000,runTests);if(!mounted.current)return;
  setResult(out);setPhase('loading');void prepare(current);if(canSave){void saved.record(snapshot,next,out);if(next==='submit'&&out.status==='ok'&&out.total>0&&out.passed===out.total)setCompleted(s=>new Set([...s,lc]));}
 }
 const commands=useRef({run,save:()=>Promise.all([autosave.flush(),tests.flush()]),fullscreen,drawer,shortcuts});commands.current={run,save:()=>Promise.all([autosave.flush(),tests.flush()]),fullscreen,drawer,shortcuts};
 useEffect(()=>{
  const key=(e:KeyboardEvent)=>{
   const target=e.target as HTMLElement|null;const editor=!!target?.closest('.cm-editor');
   if(target?.closest('input,textarea,select,[contenteditable="true"]')&&!editor)return;
   if(e.key==='Escape'){if(commands.current.drawer||commands.current.shortcuts)return;if(commands.current.fullscreen){e.preventDefault();setFullscreen(false);requestAnimationFrame(()=>fullButton.current?.focus());}return;}
   if(commands.current.drawer||commands.current.shortcuts||!(e.metaKey||e.ctrlKey))return;
   if(e.key==='Enter'){e.preventDefault();e.stopPropagation();void commands.current.run(e.shiftKey?'submit':'run');}
   else if(e.key.toLowerCase()==='s'){e.preventDefault();e.stopPropagation();void commands.current.save();}
  };
  document.addEventListener('keydown',key,true);return()=>document.removeEventListener('keydown',key,true);
 },[]);
 const closeDrawer=()=>{setDrawer(false);requestAnimationFrame(()=>topicButton.current?.focus());};
 const closeShortcuts=()=>{setShortcuts(false);requestAnimationFrame(()=>helpButton.current?.focus());};
 const problemStyle={'--pw-columns':panels.state.description?`${horizontal.state.split}fr 8px ${100-horizontal.state.split}fr`:'minmax(0,1fr)','--pw-rows':`${panels.state.editor}fr 8px ${100-panels.state.editor}fr`} as CSSProperties;
 return <section className="pw-workspace" aria-label={meta.title} style={problemStyle} data-description={panels.state.description}>
  <header className="pw-navigation"><nav aria-label="Problem navigation">
   {navigation.previous?<Link aria-label="Previous question" href={interviewProblemHref(navigation.previous.lc)} onClick={()=>void autosave.flush()}>‹</Link>:<button aria-label="Previous question" disabled>‹</button>}
   {navigation.next?<Link aria-label="Next question" href={interviewProblemHref(navigation.next.lc)} onClick={()=>void autosave.flush()}>›</Link>:<button aria-label="Next question" disabled>›</button>}
   <button ref={topicButton} onClick={()=>setDrawer(true)} aria-haspopup="dialog" aria-expanded={drawer}>{navigation.topicLabel} ▾</button>
  </nav><PracticeTimer title={meta.title}/></header>
  <div className="pw-columns" ref={columns}>
   {panels.state.description?<><section className="pw-description" aria-label="Question description">
    <div className="notes-tabs" role="tablist" aria-label="Problem view">{['Problem','Solution','Submissions','Notes'].map(t=><button type="button" role="tab" key={t} disabled={notesEditing&&t!=='Notes'} id={`practice-tab-${t}`} aria-selected={tab===t} aria-controls="practice-panel" onClick={()=>setTab(t)}>{t}</button>)}</div>
    <div className="pw-description-body" role="tabpanel" id="practice-panel" aria-labelledby={`practice-tab-${tab}`}>
    <header className="practice-heading" data-draft-changed={preview?.changedStars.includes(lc)||undefined}><h2>{meta.title}</h2><div className="practice-heading-meta"><span className={`practice-tag practice-difficulty ${meta.difficulty.toLowerCase()}`}>{meta.difficulty}</span><span className="practice-tag practice-collection">{meta.extra?'Extra':'NeetCode 150'}</span><a href={leetcodeUrl(meta)} target="_blank" rel="noopener noreferrer">Original problem ↗</a>{canSave?<button aria-label={`${flags.stars.has(lc)?'Unflag':'Flag'} ${meta.title} for later`} aria-pressed={flags.stars.has(lc)} disabled={!!preview||!flags.loaded||!!flags.loadError||flags.saving} onClick={()=>void flags.save(lc,!flags.stars.has(lc))}>{flags.stars.has(lc)?'⚑':'⚐'}</button>:null}</div></header>
    {tab==='Problem'?<><Markdown text={problem.statement}/><h3>Examples</h3>{problem.examples.map((e,i)=><div className="practice-example" key={i}><h4>Example {i+1}</h4><pre>Input: {e.input}{'\n'}Output: {e.output}</pre>{e.explanation?<p>{e.explanation}</p>:null}</div>)}<h3>Constraints</h3><ul>{problem.constraints.map(c=><li key={c}>{c}</li>)}</ul><details><summary>Hints</summary>{problem.hints.map((h,i)=><p key={i}>{h}</p>)}</details></>:tab==='Solution'?<ProblemSolution lc={lc}/>:tab==='Submissions'?<p>Submissions workspace is coming soon.</p>:saved.loading?<p role="status">Loading question notes…</p>:saved.loadError?<p role="alert">{saved.loadError}<button onClick={()=>void saved.load()}>Retry loading notes</button></p>:<QuestionNotes problem={lc} body={saved.data.note} canEdit={canEdit&&!preview} draftChanged={preview?.notes.find(n=>n.problem===lc)?.draftChanged} onSaved={saved.setNote} onEditing={setNotesEditing}/>}
    </div></section><ResizeHandle label="Resize problem and code panels" value={horizontal.state.split} min={25} max={75} reset={50} unit="percent" scale={100/Math.max(1,size.width-8)} onChange={split=>horizontal.setState(s=>({...s,split}))}/></>:null}
   <section className="pw-right" aria-label="Code and console" data-fullscreen={fullscreen} data-console={panels.state.console}>
    <div className="pw-right-body" ref={right}>
     <div className="pw-editor" data-draft-changed={preview?.code.find(c=>c.problem===lc)?.draftChanged||undefined}>
      <header className="pw-editor-header"><strong>Python</strong><span className="pw-save-status" role="status">{preview?'Read-only draft preview':saved.loadError&&canSave?'Offline — saved locally':autosave.status}</span><div className="pw-editor-tools">
       <button aria-label="Reset to starter code" disabled={!!preview} onClick={()=>{if(window.confirm('Replace your code with the starter code?')){autosave.edit(starterCode(lc));setEditorVersion(v=>v+1);}}}>↺</button>
       <button ref={fullButton} aria-label={fullscreen?'Exit fullscreen editor':'Fullscreen editor'} aria-pressed={fullscreen} onClick={()=>setFullscreen(v=>!v)}>⛶</button>
       <button aria-label={panels.state.description?'Collapse description panel':'Expand description panel'} aria-pressed={!panels.state.description} onClick={()=>panels.setState(s=>({...s,description:!s.description}))}>{panels.state.description?'⇤':'⇥'}</button>
       <button ref={helpButton} aria-label="Keyboard shortcuts" aria-haspopup="dialog" onClick={()=>setShortcuts(true)}>?</button>
      </div></header>
      <CodeEditor key={editorVersion} value={autosave.code} initial={autosave.code} readOnly={!!preview} label="Python code" onChange={autosave.edit}/>
      {autosave.storageError?<p role="alert">Browser storage is unavailable or full. Keep a copy before leaving.</p>:null}
     </div>
     {panels.state.console?<><ResizeHandle className="practice-resizer pw-console-resizer" label="Resize editor and console" orientation="horizontal" value={panels.state.editor} min={25} max={75} reset={60} unit="percent" scale={100/Math.max(1,size.height-8)} onChange={editor=>panels.setState(s=>({...s,editor}))}/><section id="practice-console" className="pw-console" aria-label="Console / Test">
      <h3>Console / Test</h3><p role={preview?undefined:"status"}>{preview?'Read-only draft preview':phase==='loading'?'Loading Python…':phase==='busy'?'Running…':phase==='ready'?'Python ready':'Python could not load. You can still edit and save code.'}</p>
      {phase==='failed'?<button onClick={()=>{runner.current?.dispose();const current=new PythonRunner();runner.current=current;setPhase('loading');void prepare(current);}}>Retry Python</button>:null}
      <TestConsole problem={problem} cases={tests.cases} onChange={tests.change} result={result} mode={mode} busy={phase==='busy'} readOnly={!!preview} status={tests.status} validationError={caseError}/>{tests.storageError?<p role="alert">Browser storage is unavailable. Keep a copy of your custom inputs.</p>:null}{tests.error?<p role="alert">{tests.error}<button onClick={tests.retry}>Retry test case sync</button></p>:null}
      {saved.attemptError?<p role="alert">{saved.attemptError}<button onClick={()=>void saved.retryAttempt()}>Retry saving attempt</button></p>:null}
      {saved.savingAttempt?<p role="status">Saving attempt…</p>:null}
      {progressError?<p role="alert">{progressError}<button onClick={()=>setProgressRetry(v=>v+1)}>Retry progress</button></p>:null}
      {saved.loadError&&canSave?<p role="alert">{saved.loadError}<button onClick={()=>void saved.load()}>Retry loading saved data</button></p>:null}
     </section></>:null}
    </div>
    <footer className="pw-bottom-bar"><button aria-controls="practice-console" aria-expanded={panels.state.console} onClick={()=>panels.setState(s=>({...s,console:!s.console}))}>Console / Test <span aria-hidden="true">{panels.state.console?'⌄':'⌃'}</span></button><div><button disabled={!available} onClick={()=>void run('run')}>Run</button><button className="pw-submit" disabled={!available} onClick={()=>void run('submit')}>Submit</button></div></footer>
   </section>
  </div>
  {drawer?<ProblemDrawer lc={lc} onClose={closeDrawer} onNavigate={()=>void autosave.flush()} flags={flags} completed={completed} canSave={canSave&&!preview}/>:null}
  {shortcuts?<Shortcuts onClose={closeShortcuts}/>:null}
 </section>;
}

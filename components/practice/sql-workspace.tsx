'use client';
import Link from 'next/link';
import {useEffect,useMemo,useRef,useState,type CSSProperties} from 'react';
import {sqlNavigation,sqlProblemByNumber,sqlProblemHref,starterSql} from '@/lib/practice/sql-catalog';
import {SqlRunner,type SqlRunResult} from '@/lib/practice/sql-runner';
import type {RunMode} from '@/lib/practice/runner';
import {loadPracticeCompletions} from '@/app/actions/practice-progress';
import {leetcodeUrl} from '@/lib/notes/neetcode150';
import {CodeEditor} from './code-editor';
import {QuestionNotes} from './question-notes';
import {PracticeTimer} from './timer';
import {ResizeHandle,usePracticePanels} from './panels';
import {useSavedPractice} from './use-saved-practice';
import {useCodeAutosave} from './use-code-autosave';
import {usePracticeStars} from './use-practice-stars';
import {ProblemDrawer} from './problem-drawer';
import {useSubmissions} from './use-submissions';
import {Submissions} from './submissions';
import {Shortcuts,useWorkspacePanels} from './interview-workspace';
import {SqlConsole} from './sql-console';
import {SqlProblemView,SqlSolutionView} from './sql-problem';
import {WorkspaceToolbar} from '@/components/interview/workspace-toolbar';

/**
 * SQL practice workspace: the DSA practice workspace (Problem / Solution / Submissions / Notes tabs, ‹ ›, autosave,
 * editor controls, flags, progress) with a SQL editor. Run = first test, Submit = every test. The query runs in a
 * PGlite Web Worker in this browser and is never sent anywhere else.
 */
export function SqlPracticeWorkspace({lc,viewerKey,canSave,canEdit}:{lc:number;viewerKey:string;canSave:boolean;canEdit:boolean}){
 const navigation=sqlNavigation(lc),meta=navigation.current!,problem=sqlProblemByNumber(lc)!;
 const submissions=useSubmissions(lc,viewerKey,canSave,false,{complexity:false});
 const saved=useSavedPractice(lc,canSave,()=>{});
 const autosave=useCodeAutosave({viewerKey,problem:lc,starter:starterSql(lc),canSave,ready:!canSave||saved.loaded&&!saved.loadError,remote:saved.data.code});
 const flags=usePracticeStars(canSave,viewerKey);
 const [completed,setCompleted]=useState<Set<number>>(new Set());const [progressError,setProgressError]=useState('');const [progressRetry,setProgressRetry]=useState(0);
 useEffect(()=>{let alive=true;if(canSave)void loadPracticeCompletions().then(r=>{if(!alive)return;if(r.ok){setCompleted(new Set(r.problems));setProgressError('');}else setProgressError(r.message);}).catch(()=>{if(alive)setProgressError('Could not load your progress.');});return()=>{alive=false;};},[canSave,viewerKey,progressRetry]);
 const [drawer,setDrawer]=useState(false),[shortcuts,setShortcuts]=useState(false),[fullscreen,setFullscreen]=useState(false),[editorVersion,setEditorVersion]=useState(0),[tab,setTab]=useState('Problem'),[notesEditing,setNotesEditing]=useState(false);
 const panels=useWorkspacePanels(),horizontal=usePracticePanels();
 const columns=useRef<HTMLDivElement>(null),right=useRef<HTMLDivElement>(null),topicButton=useRef<HTMLButtonElement>(null),helpButton=useRef<HTMLButtonElement>(null),fullButton=useRef<HTMLButtonElement>(null);
 const [size,setSize]=useState({width:1000,height:500});
 useEffect(()=>{const observer=new ResizeObserver(()=>setSize({width:columns.current?.clientWidth??1000,height:right.current?.clientHeight??500}));if(columns.current)observer.observe(columns.current);if(right.current)observer.observe(right.current);return()=>observer.disconnect();},[]);
 const runner=useRef<SqlRunner|null>(null),mounted=useRef(false);
 const [phase,setPhase]=useState<'loading'|'ready'|'busy'|'failed'>('loading'),[failure,setFailure]=useState(''),[result,setResult]=useState<SqlRunResult|null>(null),[mode,setMode]=useState<RunMode>('run');
 async function prepare(current:SqlRunner){try{await current.warmUp();if(mounted.current&&runner.current===current)setPhase('ready');}catch(error){if(mounted.current&&runner.current===current){setPhase('failed');setFailure(error instanceof Error?error.message:'PostgreSQL could not be loaded.');}}}
 useEffect(()=>{mounted.current=true;const current=new SqlRunner();runner.current=current;void prepare(current);return()=>{mounted.current=false;runner.current?.dispose();runner.current=null;};},[]);
 const available=phase==='ready'&&(!canSave||saved.loaded)&&!saved.pendingAttempt&&!saved.savingAttempt&&!submissions.pending&&!submissions.saving;
 async function run(next:RunMode){
  if(!available||!runner.current)return;const current=runner.current,snapshot=autosave.code;
  if(snapshot.length>100000){setResult({outcome:{status:'crash',error:'Keep the query under 100,000 characters before running or submitting.'},details:[]});panels.setState(s=>({...s,console:true}));return;}
  setPhase('busy');setMode(next);setResult(null);panels.setState(s=>({...s,console:true}));void autosave.flush();void submissions.flush();
  const out=await current.run(problem,snapshot,next);if(!mounted.current)return;
  setResult(out);setPhase('loading');void prepare(current);
  if(canSave){if(next==='submit')void submissions.record(snapshot,{time_complexity:'',space_complexity:''},out.outcome);void saved.record(snapshot,next,out.outcome);if(next==='submit'&&out.outcome.status==='ok'&&out.outcome.total>0&&out.outcome.passed===out.outcome.total)setCompleted(s=>new Set([...s,lc]));}
 }
 const commands=useRef({run,save:()=>Promise.all([autosave.flush(),submissions.flush()]),fullscreen,drawer,shortcuts});commands.current={run,save:()=>Promise.all([autosave.flush(),submissions.flush()]),fullscreen,drawer,shortcuts};
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
 const leaving=()=>{void autosave.flush();void submissions.flush();};
 const problemStyle=useMemo(()=>({'--pw-columns':panels.state.description?`${horizontal.state.split}fr 8px ${100-horizontal.state.split}fr`:'minmax(0,1fr)','--pw-rows':`${panels.state.editor}fr 8px ${100-panels.state.editor}fr`} as CSSProperties),[panels.state,horizontal.state.split]);
 return <section className="pw-workspace sql-workspace" aria-label={meta.title} style={problemStyle} data-description={panels.state.description}>
  <WorkspaceToolbar><header className="pw-navigation"><nav aria-label="Problem navigation">
   {navigation.previous?<Link aria-label="Previous question" href={sqlProblemHref(navigation.previous.lc)} onClick={leaving}>‹</Link>:<button aria-label="Previous question" disabled>‹</button>}
   {navigation.next?<Link aria-label="Next question" href={sqlProblemHref(navigation.next.lc)} onClick={leaving}>›</Link>:<button aria-label="Next question" disabled>›</button>}
   <button ref={topicButton} onClick={()=>setDrawer(true)} aria-haspopup="dialog" aria-expanded={drawer}>{navigation.topicLabel} ▾</button>
  </nav><PracticeTimer title={meta.title} compact/></header></WorkspaceToolbar>
  <div className="pw-columns" ref={columns}>
   {panels.state.description?<><section className="pw-description" aria-label="Question description">
    <div className="notes-tabs" role="tablist" aria-label="Problem view">{['Problem','Solution','Submissions','Notes'].map(t=><button type="button" role="tab" key={t} disabled={notesEditing&&t!=='Notes'} id={`practice-tab-${t}`} aria-selected={tab===t} aria-controls="practice-panel" onClick={()=>setTab(t)}>{t}</button>)}</div>
    <div className="pw-description-body" role="tabpanel" id="practice-panel" aria-labelledby={`practice-tab-${tab}`}>
    <header className="practice-heading"><h2>{meta.title}</h2><div className="practice-heading-meta"><span className={`practice-tag practice-difficulty ${meta.difficulty.toLowerCase()}`}>{meta.difficulty}</span><span className="practice-tag practice-collection">SQL 50</span><a href={leetcodeUrl(meta)} target="_blank" rel="noopener noreferrer">Original problem ↗</a>{canSave?<button aria-label={`${flags.stars.has(lc)?'Unflag':'Flag'} ${meta.title} for later`} aria-pressed={flags.stars.has(lc)} disabled={!flags.loaded||!!flags.loadError||flags.saving} onClick={()=>void flags.save(lc,!flags.stars.has(lc))}>{flags.stars.has(lc)?'⚑':'⚐'}</button>:null}</div></header>
    {tab==='Problem'?<SqlProblemView problem={problem}/>:tab==='Solution'?<SqlSolutionView problem={problem}/>:tab==='Submissions'?<Submissions problem={lc} rows={submissions.rows} canSave={canSave} readOnly={false} loading={submissions.loading} more={submissions.more} error={submissions.error} onRetry={()=>void submissions.retrySubmission()} onMore={()=>void submissions.load(true)} onLoad={code=>{autosave.edit(code);setEditorVersion(v=>v+1);}}/>:saved.loading?<p role="status">Loading question notes…</p>:saved.loadError?<p role="alert">{saved.loadError}<button onClick={()=>void saved.load()}>Retry loading notes</button></p>:<QuestionNotes problem={lc} body={saved.data.note} canEdit={canEdit} onSaved={saved.setNote} onEditing={setNotesEditing}/>}
    </div></section><ResizeHandle label="Resize problem and code panels" value={horizontal.state.split} min={25} max={75} reset={50} unit="percent" scale={100/Math.max(1,size.width-8)} onChange={split=>horizontal.setState(s=>({...s,split}))}/></>:null}
   <section className="pw-right" aria-label="Code and console" data-fullscreen={fullscreen} data-console={panels.state.console}>
    <div className="pw-right-body" ref={right}>
     <div className="pw-editor">
      <header className="pw-editor-header"><strong>SQL</strong><span className="pw-save-status" role="status">{saved.loadError&&canSave?'Offline — saved locally':autosave.status}</span><div className="pw-editor-tools">
       <button aria-label="Reset to starter code" onClick={()=>{if(window.confirm('Replace your query with the starter code?')){autosave.edit(starterSql(lc));setEditorVersion(v=>v+1);}}}>↺</button>
       <button ref={fullButton} aria-label={fullscreen?'Exit fullscreen editor':'Fullscreen editor'} aria-pressed={fullscreen} onClick={()=>setFullscreen(v=>!v)}>⛶</button>
       <button aria-label={panels.state.description?'Collapse description panel':'Expand description panel'} aria-pressed={!panels.state.description} onClick={()=>panels.setState(s=>({...s,description:!s.description}))}>{panels.state.description?'⇤':'⇥'}</button>
       <button ref={helpButton} aria-label="Keyboard shortcuts" aria-haspopup="dialog" onClick={()=>setShortcuts(true)}>?</button>
      </div></header>
      <CodeEditor key={editorVersion} language="sql" value={autosave.code} initial={autosave.code} label="SQL query" onChange={autosave.edit}/>
      {autosave.storageError?<p role="alert">Browser storage is unavailable or full. Keep a copy before leaving.</p>:null}
     </div>
     {panels.state.console?<><ResizeHandle className="practice-resizer pw-console-resizer" label="Resize editor and console" orientation="horizontal" value={panels.state.editor} min={25} max={75} reset={60} unit="percent" scale={100/Math.max(1,size.height-8)} onChange={editor=>panels.setState(s=>({...s,editor}))}/><section id="practice-console" className="pw-console" aria-label="Console">
      {phase==='loading'&&!result?<p role="status">Loading PostgreSQL…</p>:phase==='failed'?<p role="alert">{failure} You can still edit and save your query.</p>:null}
      {phase==='failed'?<button onClick={()=>{runner.current?.dispose();const current=new SqlRunner();runner.current=current;setPhase('loading');void prepare(current);}}>Retry PostgreSQL</button>:null}
      <SqlConsole problem={problem} result={result} mode={mode} busy={phase==='busy'} loading={phase==='loading'}/>
      {submissions.error&&submissions.pending?<p role="alert">{submissions.error}<button disabled={submissions.saving} onClick={()=>void submissions.retrySubmission()}>Retry saving submission</button></p>:null}{submissions.saving?<p role="status">Saving submission…</p>:null}
      {saved.attemptError?<p role="alert">{saved.attemptError}<button onClick={()=>void saved.retryAttempt()}>Retry saving attempt</button></p>:null}
      {saved.savingAttempt?<p role="status">Saving attempt…</p>:null}
      {progressError?<p role="alert">{progressError}<button onClick={()=>setProgressRetry(v=>v+1)}>Retry progress</button></p>:null}
      {saved.loadError&&canSave?<p role="alert">{saved.loadError}<button onClick={()=>void saved.load()}>Retry loading saved data</button></p>:null}
     </section></>:null}
    </div>
    <footer className="pw-bottom-bar"><button aria-label="Toggle console" title="Toggle console" aria-controls="practice-console" aria-expanded={panels.state.console} onClick={()=>panels.setState(s=>({...s,console:!s.console}))}>Console <span aria-hidden="true">{panels.state.console?'⌄':'⌃'}</span></button><div><button disabled={!available} onClick={()=>void run('run')}>Run</button><button className="pw-submit" disabled={!available} onClick={()=>void run('submit')}>Submit</button></div></footer>
   </section>
  </div>
  {drawer?<ProblemDrawer lc={lc} onClose={closeDrawer} onNavigate={leaving} flags={flags} completed={completed} canSave={canSave} navigation={navigation} heading="SQL 50" hrefFor={sqlProblemHref}/>:null}
  {shortcuts?<Shortcuts onClose={closeShortcuts}/>:null}
 </section>;
}

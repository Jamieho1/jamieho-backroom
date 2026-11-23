'use client';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {useCallback,useEffect,useMemo,useRef,useState,useSyncExternalStore} from 'react';
import {useViewer} from '@/components/viewer-provider';
import {loadSdWhiteboard,resetSdWhiteboard,saveSdWhiteboard} from '@/app/actions/system-design-whiteboard';
import {SD_LIST_HREF,sdHref,type SdQuestion} from '@/lib/interview/system-design';
import {PANEL_DEFAULT,WB_LIMITS,WB_PANEL_KEY,WB_STORAGE_PREFIX,buildTemplate,clampPanel,formatTimer,parseStoredScene,sceneBytes,type WbScene,type WbTemplate} from '@/lib/interview/whiteboard';

/** The only import of the Excalidraw module: a client-only chunk fetched when this route mounts. */
const Canvas=dynamic(()=>import('./sd-whiteboard-canvas'),{ssr:false,loading:()=><p className="iv-sd-board-status" role="status">Loading the canvas…</p>});

export type WhiteboardQuestion=Pick<SdQuestion,'id'|'slug'|'title'|'solution'>;
const PHONE='(max-width: 768px)';
function usePhone(){
 return useSyncExternalStore(cb=>{const m=window.matchMedia(PHONE);m.addEventListener('change',cb);return()=>m.removeEventListener('change',cb);},()=>window.matchMedia(PHONE).matches,()=>false);
}
function readPanel(){try{const n=Number(localStorage.getItem(WB_PANEL_KEY));return Number.isFinite(n)&&n>0?n:PANEL_DEFAULT;}catch{return PANEL_DEFAULT;}}
function useTimer(){
 const [seconds,setSeconds]=useState(0);const [running,setRunning]=useState(false);
 const base=useRef(0);const started=useRef(0);
 useEffect(()=>{
  if(!running)return;started.current=Date.now();
  const id=setInterval(()=>setSeconds(base.current+Math.floor((Date.now()-started.current)/1000)),500);
  return()=>{clearInterval(id);base.current+=Math.floor((Date.now()-started.current)/1000);};
 },[running]);
 return {seconds,running,toggle:()=>setRunning(r=>!r),reset:()=>{base.current=0;setSeconds(0);setRunning(false);}};
}
export function TemplatePreview({template}:{template:WbTemplate}){
 return <svg className="iv-sd-preview" viewBox={`-20 -20 ${template.width+40} ${template.height+40}`} role="img" aria-label="Preview of the starting board" preserveAspectRatio="xMidYMin meet">
  {template.frames.map(f=><g key={f.id}><rect x={f.x} y={f.y} width={f.w} height={f.h} rx="12" fill="none" stroke="#8a97ab" strokeWidth="4"/><text x={f.x+14} y={f.y-12} fontSize="38" fill="#eaf0f8">{f.name}</text></g>)}
  {template.texts.filter(t=>t.id==='wb-title').map(t=><text key={t.id} x={t.x} y={t.y+34} fontSize="46" fill="#eaf0f8" fontWeight="600">{t.text}</text>)}
 </svg>;
}
export function SystemDesignWhiteboard({question}:{question:WhiteboardQuestion}){
 const {viewer}=useViewer();const account=viewer.status==='owner'||viewer.status==='member'?viewer.id:undefined;
 return <Workspace key={(account??'visitor')+':'+question.id} question={question} account={account}/>;
}
type Load={status:'loading'}|{status:'error';message:string}|{status:'ready';scene:WbScene|null};
type SaveState={status:'idle'|'saving'|'saved'|'failed';message?:string};
function Workspace({question,account}:{question:WhiteboardQuestion;account?:string}){
 const template=useMemo(()=>buildTemplate({title:question.title,solution:question.solution}),[question.title,question.solution]);
 const storageKey=WB_STORAGE_PREFIX+question.slug;
 const phone=usePhone();const [proceed,setProceed]=useState(false);
 const [load,setLoad]=useState<Load>({status:'loading'});const [retry,setRetry]=useState(0);
 const [save,setSave]=useState<SaveState>({status:'idle'});
 const timer=useTimer();
 const [panel,setPanel]=useState(PANEL_DEFAULT);const box=useRef<HTMLDivElement>(null);
 useEffect(()=>{setPanel(readPanel());},[]);
 useEffect(()=>{
  let alive=true;setLoad({status:'loading'});
  if(account)void loadSdWhiteboard(question.id).then(r=>{if(alive)setLoad(r.ok?{status:'ready',scene:r.scene}:{status:'error',message:r.message});}).catch(()=>{if(alive)setLoad({status:'error',message:"Couldn't load your board. Retry."});});
  else{let scene:WbScene|null=null;try{scene=parseStoredScene(localStorage.getItem(storageKey));}catch{/* Visitors' boards are a browser convenience. */}setLoad({status:'ready',scene});}
  return()=>{alive=false;};
 },[account,question.id,storageKey,retry]);
 // Saves run one at a time; a newer scene replaces any that is waiting.
 const latest=useRef<WbScene|null>(null);const busy=useRef(false);const alive=useRef(true);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;};},[]);
 const persist=useCallback(async()=>{
  if(busy.current)return;busy.current=true;
  try{
   while(latest.current){
    const scene=latest.current;latest.current=null;
    if(sceneBytes(scene)>WB_LIMITS.bytes){if(alive.current)setSave({status:'failed',message:'This board is too large to save. Delete some shapes.'});continue;}
    if(alive.current)setSave({status:'saving'});
    if(account){
     try{const r=await saveSdWhiteboard(question.id,scene);if(alive.current)setSave(r.ok?{status:'saved'}:{status:'failed',message:r.message});}
     catch{if(alive.current)setSave({status:'failed',message:"Couldn't save your board. Keep editing to retry."});}
    }else{
     try{localStorage.setItem(storageKey,JSON.stringify(scene));if(alive.current)setSave({status:'saved'});}
     catch{if(alive.current)setSave({status:'failed',message:"This browser can't store the board."});}
    }
   }
  }finally{busy.current=false;}
 },[account,question.id,storageKey]);
 const onSave=useCallback((scene:WbScene)=>{latest.current=scene;void persist();},[persist]);
 const onReset=useCallback(()=>{
  latest.current=null;setSave({status:'idle'});
  if(account)void resetSdWhiteboard(question.id).then(r=>{if(!r.ok&&alive.current)setSave({status:'failed',message:r.message});}).catch(()=>{if(alive.current)setSave({status:'failed',message:"Couldn't reset your saved board."});});
  else{try{localStorage.removeItem(storageKey);}catch{/* nothing stored */}}
 },[account,question.id,storageKey]);
 const resize=(width:number)=>{const total=box.current?.clientWidth||1000;const next=clampPanel(width,total);setPanel(next);try{localStorage.setItem(WB_PANEL_KEY,String(next));}catch{/* optional */}};
 const drag=(e:React.PointerEvent<HTMLDivElement>)=>{
  e.preventDefault();const el=e.currentTarget;el.setPointerCapture(e.pointerId);const left=box.current?.getBoundingClientRect().left??0;
  const move=(m:PointerEvent)=>resize(m.clientX-left);
  const up=()=>{el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up);};
  el.addEventListener('pointermove',move);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
 };
 const note=save.status==='saving'?'Saving…':save.status==='saved'?'Saved':save.status==='failed'?save.message:account?'Autosaves to your account':'Autosaves in this browser';
 if(phone&&!proceed)return <section className="iv-sd-board iv-sd-phone" data-testid="sd-board-phone">
  <h1>{question.title}</h1><h2>Best on a larger screen</h2>
  <p>The whiteboard needs room to draw. Open this page on a laptop or tablet, or look at the starting board below.</p>
  <TemplatePreview template={template}/>
  <div className="iv-sd-actions"><button type="button" className="iv-sd-primary" onClick={()=>setProceed(true)}>Continue anyway</button><Link href={sdHref(question.slug)} prefetch={false}>← Back to the question</Link></div>
 </section>;
 return <section className="iv-sd-board" aria-label={`Whiteboard: ${question.title}`}>
  <header className="iv-sd-board-bar">
   <Link href={sdHref(question.slug)} prefetch={false} className="iv-sd-back" aria-label="Back to the question">←<span> Question</span></Link>
   <h1>{question.title}</h1>
   <div className="iv-sd-timer" role="group" aria-label="Interview timer"><span role="timer" aria-label="Elapsed time">{formatTimer(timer.seconds)}</span>
    <button type="button" onClick={timer.toggle}>{timer.running?'Pause':timer.seconds?'Resume':'Start'}</button><button type="button" onClick={timer.reset} disabled={!timer.seconds&&!timer.running}>Reset timer</button></div>
   <button type="button" disabled title="History arrives with the interview steps">History</button>
   <Link href={SD_LIST_HREF} prefetch={false} className="iv-sd-all-link">All questions</Link>
  </header>
  <div className="iv-sd-board-body" ref={box} style={{'--sd-panel':panel+'px'} as React.CSSProperties}>
   <aside className="iv-sd-board-panel" aria-label="Interview steps"><span className="iv-soon">Soon</span><h2>Interview steps</h2><p>Guided steps and answer practice will appear here.</p></aside>
   <div className="iv-sd-divider" role="separator" aria-orientation="vertical" aria-label="Resize panels" aria-valuemin={240} aria-valuenow={panel} tabIndex={0} onPointerDown={drag}
    onKeyDown={e=>{if(e.key==='ArrowLeft'){e.preventDefault();resize(panel-16);}else if(e.key==='ArrowRight'){e.preventDefault();resize(panel+16);}}}/>
   <div className="iv-sd-board-main">
    {load.status==='loading'?<p className="iv-sd-board-status" role="status">Loading your board…</p>:null}
    {load.status==='error'?<p className="iv-sd-board-status" role="alert">{load.message} <button type="button" onClick={()=>setRetry(n=>n+1)}>Retry</button></p>:null}
    {load.status==='ready'?<Canvas template={template} scene={load.scene} onSave={onSave} onReset={onReset}/>:null}
    <p className="iv-sd-save-note" role="status" data-state={save.status}>{note}</p>
   </div>
  </div>
 </section>;
}

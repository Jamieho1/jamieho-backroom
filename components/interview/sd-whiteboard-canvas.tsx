'use client';
// Loaded only through next/dynamic from sd-whiteboard.tsx (decision 2026-11-23: Excalidraw is for the whiteboard route only).
import '@excalidraw/excalidraw/index.css';
import {CaptureUpdateAction,Excalidraw,MainMenu,convertToExcalidrawElements,getSceneVersion} from '@excalidraw/excalidraw';
import type {ExcalidrawImperativeAPI,LibraryItem} from '@excalidraw/excalidraw/types';
import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {WB_BLOCKS,filterBlocks,templateSkeletons,toScene,type WbScene,type WbTemplate} from '@/lib/interview/whiteboard';

/** Fonts are served from /excalidraw-assets (copied by scripts/copy-excalidraw.mjs), never from a CDN. */
declare global{interface Window{EXCALIDRAW_ASSET_PATH?:string|string[]}}
if(typeof window!=='undefined')window.EXCALIDRAW_ASSET_PATH='/excalidraw-assets/';

type Skeleton=Record<string,unknown>;
const INK='#1e1e1e';
const shape=(type:string,x:number,y:number,width:number,height:number,bg:string,extra:Skeleton={})=>({type,x,y,width,height,backgroundColor:bg,fillStyle:'solid',strokeColor:INK,strokeWidth:2,roughness:0,...extra});
const labelled=(text:string)=>({label:{text,fontSize:16,strokeColor:INK}});
/** Own-designed library shapes. Multi-part blocks share a group id so they move together. */
function blockSkeleton(id:string):Skeleton[]{
 const g={groupIds:[`g-${id}`]};
 switch(id){
  case 'client':return [shape('rectangle',0,0,140,70,'#a5d8ff',{roundness:{type:3},...labelled('Client')})];
  case 'server':return [shape('rectangle',0,0,140,70,'#b2f2bb',labelled('Server'))];
  case 'multi-server':return [shape('rectangle',16,-16,160,70,'#d8f5dc',g),shape('rectangle',0,0,160,70,'#b2f2bb',{...g,...labelled('Multi-instance\nServer')})];
  case 'api-gateway':return [shape('rectangle',0,0,160,70,'#d0bfff',{roundness:{type:3},...labelled('API Gateway')})];
  case 'load-balancer':return [shape('diamond',0,0,170,110,'#ffec99',labelled('Load\nBalancer'))];
  case 'message-queue':return [shape('rectangle',0,0,230,60,'#ffd8a8',{strokeStyle:'dashed',...labelled('Message Queue')})];
  case 'database':return [shape('rectangle',0,0,140,90,'#ffc9c9',{...g,...labelled('Database')}),shape('ellipse',0,-14,140,28,'#ffc9c9',g)];
  case 'cache':return [shape('rectangle',0,0,140,70,'#fff3bf',{strokeStyle:'dotted',roundness:{type:3},...labelled('Cache')})];
  case 'cdn':return [shape('ellipse',0,0,150,76,'#99e9f2',labelled('CDN'))];
  case 'object-storage':return [shape('rectangle',0,0,160,70,'#e9ecef',{roundness:{type:3},...labelled('Object\nStorage')})];
  case 'worker':return [shape('rectangle',0,0,140,70,'#c3fae8',{roundness:{type:3},strokeStyle:'dashed',...labelled('Worker')})];
  case 'dns':return [shape('ellipse',0,0,110,64,'#eebefa',labelled('DNS'))];
  default:return [];
 }
}
const USER_PREFIX='passloop-';
const blockItem=(id:string,name:string,order:number):LibraryItem=>({id:USER_PREFIX+id,status:'unpublished',created:1700000000000+order,name,elements:convertToExcalidrawElements(blockSkeleton(id) as never)});
const items=(query:string)=>filterBlocks(query,WB_BLOCKS).map(b=>blockItem(b.id,b.name,WB_BLOCKS.indexOf(b)));

export interface CanvasProps{
 template:WbTemplate;scene:WbScene|null;
 /** Debounced (about a second after the last edit) and flushed when the board closes. */
 onSave:(scene:WbScene)=>void;onReset:()=>void;
}
const SAVE_DELAY=1000;
export default function WhiteboardCanvas({template,scene,onSave,onReset}:CanvasProps){
 const api=useRef<ExcalidrawImperativeAPI|null>(null);
 const [ready,setReady]=useState(false);const [query,setQuery]=useState('');const [confirming,setConfirming]=useState(false);
 const [frames,setFrames]=useState('');const [count,setCount]=useState(0);
 const timer=useRef<ReturnType<typeof setTimeout>|null>(null);const pending=useRef<WbScene|null>(null);
 const baseline=useRef<number|null>(null);const touched=useRef(false);const userItems=useRef<LibraryItem[]>([]);
 const save=useRef(onSave);useEffect(()=>{save.current=onSave;},[onSave]);
 const flush=useCallback(()=>{if(timer.current){clearTimeout(timer.current);timer.current=null;}const s=pending.current;pending.current=null;if(s)save.current(s);},[]);
 useEffect(()=>{const hide=()=>{if(document.visibilityState==='hidden')flush();};document.addEventListener('visibilitychange',hide);window.addEventListener('pagehide',flush);return()=>{document.removeEventListener('visibilitychange',hide);window.removeEventListener('pagehide',flush);flush();};},[flush]);
 const initialData=useMemo(()=>{
  const elements=scene?scene.elements:convertToExcalidrawElements(templateSkeletons(template) as never);
  return {elements:elements as never,appState:{viewBackgroundColor:'#ffffff',...(scene?.view?{scrollX:scene.view.scrollX,scrollY:scene.view.scrollY,zoom:{value:scene.view.zoom as never}}:{})},scrollToContent:!scene?.view,libraryItems:items('')};
  // eslint-disable-next-line react-hooks/exhaustive-deps -- the starting data is read once, on mount
 },[]);
 const onChange=useCallback((elements:readonly {isDeleted?:boolean;type:string;name?:string|null}[],state:{scrollX:number;scrollY:number;zoom:{value:number}})=>{
  const live=elements.filter(e=>!e.isDeleted);
  setCount(live.length);setFrames(live.filter(e=>e.type==='frame').map(e=>e.name??'').join('|'));
  const version=getSceneVersion(elements as never);
  // Layout passes after load (font metrics) must not create a saved copy of an untouched template.
  if(baseline.current===null||!touched.current){baseline.current=version;return;}
  if(version===baseline.current)return;
  baseline.current=version;
  pending.current=toScene(elements,{scrollX:state.scrollX,scrollY:state.scrollY,zoom:state.zoom.value});
  if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(flush,SAVE_DELAY);
 },[flush]);
 const search=(value:string)=>{
  setQuery(value);
  void api.current?.updateLibrary({libraryItems:[...userItems.current,...items(value)],merge:false,openLibraryMenu:false});
 };
 const openLibrary=()=>{api.current?.toggleSidebar({name:'default',tab:'library',force:true});};
 const reset=()=>{
  const a=api.current;if(!a)return;
  a.updateScene({elements:convertToExcalidrawElements(templateSkeletons(template) as never),captureUpdate:CaptureUpdateAction.IMMEDIATELY});
  a.scrollToContent(undefined,{fitToViewport:true});
  if(timer.current){clearTimeout(timer.current);timer.current=null;}pending.current=null;
  baseline.current=null;touched.current=false;setConfirming(false);onReset();
 };
 return <div className="iv-sd-canvas-wrap">
  <div className="iv-sd-canvas-bar" role="toolbar" aria-label="Whiteboard tools">
   <label className="iv-sd-lib-search"><span>Components</span><input type="search" value={query} placeholder="Search: queue, cache, database…" aria-label="Search components" onChange={e=>search(e.target.value)}/></label>
   <button type="button" onClick={openLibrary}>Open library</button>
   {confirming?<span className="iv-sd-confirm" role="alertdialog" aria-label="Reset board"><span>Reset to the template? Your drawing is replaced.</span><button type="button" className="iv-sd-danger" onClick={reset}>Reset</button><button type="button" onClick={()=>setConfirming(false)}>Cancel</button></span>:<button type="button" onClick={()=>setConfirming(true)}>Reset board</button>}
  </div>
  <div className="iv-sd-canvas" data-testid="sd-board-canvas" data-ready={ready} data-frames={frames} data-elements={count} onPointerDownCapture={()=>{touched.current=true;}} onKeyDownCapture={()=>{touched.current=true;}} onDropCapture={()=>{touched.current=true;}}>
   <Excalidraw
    theme="dark" name="whiteboard" initialData={initialData as never} excalidrawAPI={a=>{api.current=a;setReady(true);}} onChange={onChange as never}
    onLibraryChange={l=>{userItems.current=l.filter(i=>!i.id.startsWith(USER_PREFIX));}}
    isCollaborating={false} aiEnabled={false} validateEmbeddable={false} autoFocus={false} handleKeyboardGlobally={false} showDeprecatedFonts={false}
    UIOptions={{canvasActions:{export:false,saveAsImage:false,loadScene:false,saveToActiveFile:false,clearCanvas:false,toggleTheme:false,changeViewBackgroundColor:false},tools:{image:false}}}
   ><MainMenu><MainMenu.DefaultItems.Help/></MainMenu></Excalidraw>
  </div>
 </div>;
}

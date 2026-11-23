'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {savePracticeCode} from '@/app/actions/practice';
import {codeKey,readCode,storeCode} from '@/lib/practice/storage';

// A route unmount may leave an action in flight. Share ordering across workspace mounts,
// and skip obsolete queued snapshots before issuing another request.
const queues=new Map<string,Promise<unknown>>();
const latest=new Map<string,number>();let sequence=0;
function enqueue(key:string,generation:number,save:()=>Promise<unknown>){
 const previous=queues.get(key)??Promise.resolve();
 const next=previous.catch(()=>{}).then(()=>latest.get(key)===generation?save():undefined);
 queues.set(key,next);
 void next.finally(()=>{if(queues.get(key)===next)queues.delete(key);}).catch(()=>{});
 return next;
}

/** Local writes are immediate; remote writes are serialized and never replay an older edit last. */
export function useCodeAutosave({viewerKey,problem,starter,canSave,ready,remote,readOnly=false}:{viewerKey:string;problem:number;starter:string;canSave:boolean;ready:boolean;remote:string|null;readOnly?:boolean}){
 const key=codeKey(viewerKey,problem),pendingKey=key+'.pending';
 const generation=useRef(0);
 const [code,setCode]=useState(()=>readOnly?starter:readCode(viewerKey,problem)??starter);
 const [status,setStatus]=useState('Saved');
 const [storageError,setStorageError]=useState(false);
 const current=useRef(code),revision=useRef(0),dirty=useRef(false),hydrated=useRef(false),alive=useRef(true),flight=useRef<Promise<void>|null>(null);
 const access=useRef({canSave,ready,readOnly});access.current={canSave,ready,readOnly};
 const local=useCallback((value:string,pending:boolean)=>{
  if(readOnly)return true;
  let stored=storeCode(viewerKey,problem,value);
  try{if(pending)localStorage.setItem(pendingKey,value);else if(localStorage.getItem(pendingKey)===value)localStorage.removeItem(pendingKey);}catch{stored=false;}
  if(alive.current)setStorageError(!stored);
  return stored;
 },[viewerKey,problem,pendingKey,readOnly]);
 const flush=useCallback(()=>{
  if(flight.current)return flight.current;
  if(!dirty.current||!access.current.canSave||!access.current.ready||access.current.readOnly)return Promise.resolve();
  const work=async()=>{
   while(dirty.current&&latest.get(key)===generation.current){
    const value=current.current,version=revision.current,token=generation.current;
    if(alive.current)setStatus('Saving…');
    try{
     const result=await enqueue(key,token,()=>savePracticeCode(problem,value,viewerKey)) as Awaited<ReturnType<typeof savePracticeCode>>|undefined;
     if(latest.get(key)!==generation.current)break;
     if(!result)continue;
     if(!result.ok){if(alive.current)setStatus('Offline — saved locally');break;}
     if(revision.current===version){dirty.current=false;local(value,false);if(alive.current)setStatus('Saved');}
    }catch{if(alive.current)setStatus('Offline — saved locally');break;}
   }
  };
  flight.current=work().finally(()=>{flight.current=null;});return flight.current;
 },[problem,local,viewerKey,key]);
 const edit=useCallback((value:string)=>{
  if(readOnly)return;current.current=value;revision.current++;generation.current=++sequence;latest.set(key,generation.current);dirty.current=true;setCode(value);
  const stored=local(value,canSave);
  setStatus(canSave?'Saving…':stored?'Saved':'Browser storage unavailable');
 },[readOnly,local,canSave,key]);
 useEffect(()=>{
  if(readOnly||hydrated.current||!ready)return;
  hydrated.current=true;
  let pending:string|null=null;try{pending=localStorage.getItem(pendingKey);}catch{}
  if(!revision.current&&pending!==null){current.current=pending;setCode(pending);generation.current=++sequence;latest.set(key,generation.current);dirty.current=true;}
  else if(!revision.current&&remote!==null){current.current=remote;setCode(remote);local(remote,false);}
  if(dirty.current)void flush();
 },[ready,remote,readOnly,pendingKey,key,local,flush]);
 useEffect(()=>{if(!dirty.current||readOnly||!canSave||!ready)return;const timer=setTimeout(()=>void flush(),800);return()=>clearTimeout(timer);},[code,readOnly,canSave,ready,flush]);
 useEffect(()=>{
  alive.current=true;
  const leaving=()=>{if(!readOnly){local(current.current,canSave&&dirty.current);void flush();}};
  const visibility=()=>{if(document.visibilityState==='hidden')leaving();};
  const online=()=>void flush();
  window.addEventListener('pagehide',leaving);window.addEventListener('beforeunload',leaving);window.addEventListener('online',online);document.addEventListener('visibilitychange',visibility);
  return()=>{alive.current=false;leaving();window.removeEventListener('pagehide',leaving);window.removeEventListener('beforeunload',leaving);window.removeEventListener('online',online);document.removeEventListener('visibilitychange',visibility);};
 },[local,flush,readOnly,canSave]);
 return {code,edit,flush,status,storageError};
}

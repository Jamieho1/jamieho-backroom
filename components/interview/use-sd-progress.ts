'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {loadSdProgress,saveSdProgress} from '@/app/actions/system-design';
/** Per-account flag/done for system-design questions. Visitors get an inert hook (nothing is loaded or stored). */
export function useSdProgress(enabled:boolean,scope=''){
 const [flagged,setFlagged]=useState<Set<string>>(new Set());const [done,setDone]=useState<Set<string>>(new Set());
 const [loaded,setLoaded]=useState(false);const [error,setError]=useState('');const [saving,setSaving]=useState(false);
 const live=useRef(false);const version=useRef(0);
 const load=useCallback(async()=>{
  if(!enabled)return;const request=++version.current;setError('');
  try{const r=await loadSdProgress();if(!live.current||request!==version.current)return;if(r.ok){setFlagged(new Set(r.flagged));setDone(new Set(r.done));setLoaded(true);}else setError(r.message);}
  catch{if(live.current&&request===version.current)setError("Couldn't load your progress. Retry.");}
 },[enabled]);
 useEffect(()=>{live.current=true;if(enabled)void load();else{setFlagged(new Set());setDone(new Set());setLoaded(false);setError('');}return()=>{live.current=false;version.current++;};},[enabled,scope,load]);
 const toggle=useCallback(async(id:string,field:'flagged'|'done')=>{
  if(!enabled||!loaded||saving)return;const set=field==='flagged'?flagged:done;const next=!set.has(id);setSaving(true);setError('');
  try{const r=await saveSdProgress(id,field,next);if(!live.current)return;if(r.ok){const apply=(prev:Set<string>)=>{const copy=new Set(prev);if(next)copy.add(id);else copy.delete(id);return copy;};if(field==='flagged')setFlagged(apply);else setDone(apply);}else setError(r.message);}
  catch{if(live.current)setError("Couldn't save the change. Retry.");}
  finally{if(live.current)setSaving(false);}
 },[enabled,loaded,saving,flagged,done]);
 return {flagged,done,loaded,error,saving,toggle,reload:load};
}

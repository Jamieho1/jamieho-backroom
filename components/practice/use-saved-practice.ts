'use client';
import { useEffect,useRef,useState } from 'react';
import { loadPracticeData,savePracticeCode,savePracticeAttempt } from '@/app/actions/practice';
import { attemptInput,type AttemptInput,type PracticeData } from '@/lib/practice/data';
import type { RunMode,RunOutcome } from '@/lib/practice/runner';
const empty:PracticeData={note:'',code:null,attempts:[]};
export function useSavedPractice(problem:number,canEdit:boolean,onInitialCode:(code:string|null)=>void){
 const [data,setData]=useState<PracticeData>(empty);const [loaded,setLoaded]=useState(false);const [loading,setLoading]=useState(true);const [loadError,setLoadError]=useState('');
 const [savingCode,setSavingCode]=useState(false);const [codeError,setCodeError]=useState('');
 const [savingAttempt,setSavingAttempt]=useState(false);const [attemptError,setAttemptError]=useState('');const [pendingAttempt,setPendingAttempt]=useState<AttemptInput|null>(null);
 const alive=useRef(false);const version=useRef(0);const initial=useRef(onInitialCode);initial.current=onInitialCode;
 async function load(first=false){
  const current=++version.current;setLoading(true);setLoadError('');
  try{
   const result=await loadPracticeData(problem);if(!alive.current||version.current!==current)return;
   if(result.ok){setData(result.data);if(first&&canEdit)initial.current(result.data.code);}
   else setLoadError(result.message);
  }catch{if(alive.current&&version.current===current)setLoadError("Can't reach saved Practice data right now. Your browser code is still available.");}
  finally{if(alive.current&&version.current===current){setLoading(false);setLoaded(true);}}
 }
 useEffect(()=>{alive.current=true;void load(true);return()=>{alive.current=false;version.current++;};},[problem,canEdit]);
 async function saveCode(code:string){
  setSavingCode(true);setCodeError('');
  try{const result=await savePracticeCode(problem,code);if(!alive.current)return;if(result.ok)setData(d=>({...d,code}));else setCodeError(result.message);}
  catch{if(alive.current)setCodeError("Couldn't save code. Your browser draft is still here — retry.");}
  finally{if(alive.current)setSavingCode(false);}
 }
 async function persistAttempt(attempt:AttemptInput){
  setPendingAttempt(attempt);setSavingAttempt(true);setAttemptError('');
  try{
   const result=await savePracticeAttempt(attempt);if(!alive.current)return;
   if(result.ok){setPendingAttempt(null);setData(d=>({...d,attempts:[{id:attempt.id,mode:attempt.mode,status:attempt.status,passed:attempt.passed,total:attempt.total,created_at:result.created_at??new Date().toISOString()},...d.attempts.filter(a=>a.id!==attempt.id)].slice(0,20)}));}
   else setAttemptError(result.message);
  }catch{if(alive.current)setAttemptError("Couldn't save the attempt. The result and code are still here — retry.");}
  finally{if(alive.current)setSavingAttempt(false);}
 }
 async function record(code:string,mode:RunMode,outcome:RunOutcome){if(canEdit)await persistAttempt(attemptInput(problem,code,mode,outcome));}
 return {data,loaded,loading,loadError,savingCode,codeError,savingAttempt,attemptError,pendingAttempt,load,saveCode,record,retryAttempt:()=>pendingAttempt?persistAttempt(pendingAttempt):Promise.resolve(),setNote:(note:string)=>setData(d=>({...d,note}))};
}

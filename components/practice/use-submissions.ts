'use client';
import {useEffect,useRef,useState} from 'react';
import {loadPracticeComplexity,savePracticeComplexity,loadPracticeSubmissions,savePracticeSubmission} from '@/app/actions/practice-submissions';
import {Complexity,emptyComplexity,submissionInput,type Submission,type SubmissionInput} from '@/lib/practice/submissions';
import type {RunOutcome} from '@/lib/practice/runner';
import {useCodeAutosave} from './use-code-autosave';
/** `complexity:false` (SQL questions) skips the Time/Space draft entirely; submissions are unaffected. */
export function useSubmissions(problem:number,viewerKey:string,canSave:boolean,readOnly:boolean,options:{complexity?:boolean}={}){
 const withComplexity=options.complexity!==false;
 const alive=useRef(true);const [remote,setRemote]=useState<string|null>(null),[ready,setReady]=useState(!canSave),[complexityError,setComplexityError]=useState(''),[retry,setRetry]=useState(0);
 const [rows,setRows]=useState<Submission[]>([]),[more,setMore]=useState(false),[loading,setLoading]=useState(false),[error,setError]=useState(''),[pending,setPending]=useState<SubmissionInput|null>(null),[saving,setSaving]=useState(false);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;};},[]);
 useEffect(()=>{let current=true;if(canSave&&!readOnly&&withComplexity)void loadPracticeComplexity(problem,viewerKey).then(r=>{if(!current)return;if(r.ok){setRemote(JSON.stringify(r.complexity));setReady(true);setComplexityError('');}else setComplexityError(r.message);}).catch(()=>{if(current)setComplexityError('Could not load complexity. Local edits remain available.');});return()=>{current=false;};},[problem,viewerKey,canSave,readOnly,retry,withComplexity]);
 const draft=useCodeAutosave({viewerKey,problem,starter:JSON.stringify(emptyComplexity),canSave:canSave&&!readOnly&&withComplexity,readOnly,ready:!canSave||ready||!withComplexity,remote,storageKey:`jamieho.practice.complexity.v1.${viewerKey}.${problem}`,saveDraft:text=>savePracticeComplexity(problem,JSON.parse(text),viewerKey)});
 let complexity=emptyComplexity;try{complexity=Complexity.parse(JSON.parse(draft.code));}catch{}
 async function load(append=false){if(!canSave||readOnly)return;setLoading(true);setError('');try{const r=await loadPracticeSubmissions(problem,viewerKey,append?rows.length:0);if(!alive.current)return;if(r.ok){setRows(old=>append?[...old,...r.rows.filter(r=>!old.some(o=>o.id===r.id))]:r.rows);setMore(r.more);}else setError(r.message);}catch{if(alive.current)setError('Could not load submissions. Retry.');}finally{if(alive.current)setLoading(false);}}
 useEffect(()=>{void load();},[problem,viewerKey,canSave,readOnly]);
 async function persist(input:SubmissionInput){if(!canSave||readOnly)return;setPending(input);setSaving(true);setError('');try{const r=await savePracticeSubmission(input,viewerKey);if(!alive.current)return;if(r.ok){setPending(null);await load();}else setError(r.message);}catch{if(alive.current)setError('Could not save submission. Keep this page open and retry.');}finally{if(alive.current)setSaving(false);}}
 return {rows,more,loading,error,pending,saving,load,retrySubmission:()=>pending?persist(pending):load(),record:(code:string,value:Complexity,out:RunOutcome)=>persist(submissionInput(problem,code,value,out)),complexity,edit:(value:Complexity)=>draft.edit(JSON.stringify(value)),flush:draft.flush,status:draft.status,storageError:draft.storageError,complexityError,retryComplexity:()=>setRetry(n=>n+1)};
}

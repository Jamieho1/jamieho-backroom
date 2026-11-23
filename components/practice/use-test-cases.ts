'use client';
import {useEffect,useMemo,useState} from 'react';
import {loadPracticeCases,savePracticeCases} from '@/app/actions/practice-cases';
import {PracticeCases,mergedCases,visibleCases,type EditableCase} from '@/lib/practice/cases';
import type {ArenaProblem} from '@/lib/practice/types';
import {useCodeAutosave} from './use-code-autosave';
export function useTestCases(problem:ArenaProblem,viewerKey:string,canSave:boolean,readOnly:boolean){
 const initial=useMemo(()=>visibleCases(problem),[problem]);const [remote,setRemote]=useState<string|null>(null),[ready,setReady]=useState(!canSave),[error,setError]=useState(''),[retry,setRetry]=useState(0);
 useEffect(()=>{let alive=true;if(canSave&&!readOnly)void loadPracticeCases(problem.lc).then(r=>{if(!alive)return;if(r.ok){setRemote(JSON.stringify(mergedCases(problem,r.cases)));setReady(true);setError('');}else setError(r.message);}).catch(()=>{if(alive)setError('Could not load test cases. Local cases are still available.');});return()=>{alive=false;};},[problem,canSave,readOnly,retry]);
 const draft=useCodeAutosave({viewerKey,problem:problem.lc,starter:JSON.stringify(initial),remote,ready:!canSave||ready,canSave:canSave&&!readOnly,readOnly,storageKey:`jamieho.practice.cases.v1.${viewerKey}.${problem.lc}`,saveDraft:async text=>{try{return await savePracticeCases(problem.lc,JSON.parse(text),viewerKey);}catch{return {ok:false,message:'Invalid local cases.'};}}});
 let cases=initial;try{const parsed=PracticeCases.safeParse(JSON.parse(draft.code));if(parsed.success)cases=mergedCases(problem,parsed.data);}catch{}
 return {cases,change:(value:EditableCase[])=>draft.edit(JSON.stringify(value)),flush:draft.flush,status:error?'Offline — saved locally':draft.status,error,storageError:draft.storageError,retry:()=>setRetry(v=>v+1)};
}

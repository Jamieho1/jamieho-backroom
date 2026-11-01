'use client';
import {useEffect,useRef,useState} from 'react';
import {loadPracticeStars,savePracticeStar} from '@/app/actions/practice-stars';
export function usePracticeStars(enabled:boolean){
 const [stars,setStars]=useState<Set<number>>(new Set());const [loaded,setLoaded]=useState(false);const [loading,setLoading]=useState(enabled);const [loadError,setLoadError]=useState('');
 const [saving,setSaving]=useState(false);const [saveError,setSaveError]=useState('');const [pending,setPending]=useState<{problem:number;starred:boolean}|null>(null);
 const live=useRef(false);const version=useRef(0);
 async function load(){if(!enabled)return;const request=++version.current;setLoading(true);setLoadError('');
  try{const result=await loadPracticeStars();if(!live.current||request!==version.current)return;if(result.ok){setStars(new Set(result.problems));setLoaded(true);}else setLoadError(result.message);}
  catch{if(live.current&&request===version.current)setLoadError("Couldn't load your starred questions. Retry.");}
  finally{if(live.current&&request===version.current)setLoading(false);}
 }
 useEffect(()=>{live.current=true;if(enabled)void load();else{setStars(new Set());setLoaded(false);setLoading(false);setSaving(false);setLoadError('');setPending(null);setSaveError('');}return()=>{live.current=false;version.current++;};},[enabled]);
 async function save(problem:number,starred:boolean){if(!enabled||saving||!loaded||loadError)return;setSaving(true);setSaveError('');setPending({problem,starred});const request=version.current;
  try{const result=await savePracticeStar(problem,starred);if(!live.current||request!==version.current)return;if(result.ok){setStars(previous=>{const next=new Set(previous);starred?next.add(problem):next.delete(problem);return next;});setPending(null);}else setSaveError(result.message);}
  catch{if(live.current&&request===version.current)setSaveError("Couldn't save the change to your review list. Retry.");}
  finally{if(live.current&&request===version.current)setSaving(false);}
 }
 return {stars,loaded,loading,loadError,saving,saveError,pending,load,save,retry:()=>pending?save(pending.problem,pending.starred):Promise.resolve()};
}

"use client";
import {useEffect,useRef,useState} from 'react';
import {loadArticlePins,saveArticlePin} from '@/app/actions/article-pins';
const EMPTY=new Set<string>();
export function useArticlePins(userId:string|null){
 const version=useRef(0);
 const [state,setState]=useState<{userId:string|null;ids:Set<string>;loaded:boolean;error:string}>({userId:null,ids:EMPTY,loaded:false,error:''});
 const [pending,setPending]=useState<{userId:string;id:string;pinned:boolean}|null>(null);
 const [saveError,setSaveError]=useState('');
 const [reload,setReload]=useState(0);
 const lock=useRef(false);
 useEffect(()=>{
  const request=++version.current;lock.current=false;setPending(null);setSaveError('');
  setState({userId,ids:new Set(),loaded:false,error:''});
  if(userId)void loadArticlePins().then(result=>{
   if(request!==version.current)return;
   setState({userId,ids:new Set(result.ok?result.ids:[]),loaded:result.ok,error:result.ok?'':result.message});
  }).catch(()=>{if(request===version.current)setState({userId,ids:new Set(),loaded:false,error:"Couldn't load your pinned posts. Retry."});});
  return()=>{version.current++;};
 },[userId,reload]);
 const current=state.userId===userId;
 const ids=current?state.ids:EMPTY;
 const loaded=!!userId&&current&&state.loaded;
 async function save(id:string,pinned:boolean){
  if(!userId||!loaded||lock.current)return;
  lock.current=true;const request=version.current;setPending({userId,id,pinned});setSaveError('');
  try{const result=await saveArticlePin(id,pinned);if(request!==version.current)return;
   if(result.ok){setState(s=>({...s,ids:new Set(pinned?[id,...s.ids]:[...s.ids].filter(item=>item!==id))}));setPending(null);}
   else setSaveError(result.message);
  }catch{if(request===version.current)setSaveError("Couldn't save your pin. Retry.");}
  finally{if(request===version.current)lock.current=false;}
 }
 const ownPending=pending?.userId===userId?pending:null;
 return {ids,loaded,loading:!!userId&&(!current||(!state.loaded&&!state.error)),loadError:current?state.error:'',saveError:ownPending?saveError:'',saving:!!ownPending&&!saveError,
  save,reload:()=>setReload(n=>n+1),retry:()=>ownPending?save(ownPending.id,ownPending.pinned):Promise.resolve()};
}

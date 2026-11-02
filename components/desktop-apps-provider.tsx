'use client';
import { createContext,useCallback,useContext,useEffect,useState,type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import type { AppRow } from '@/lib/apps';
import { getDesktopApps } from '@/app/actions/desktop';
import { useViewer } from './viewer-provider';
interface Snapshot {id:string;apps:AppRow[]}
const Context=createContext({apps:[] as AppRow[],loadError:false,loading:false,seed:(_id:string,_apps:AppRow[])=>{}});
export const useDesktopApps=()=>useContext(Context);
/** Lives above the page boundary: navigation must not clear an account's permitted icons. */
export function DesktopAppsProvider({children}:{children:ReactNode}){
 const pathname=usePathname();
 const {viewer}=useViewer();const anonymous=viewer.status==='anonymous';const [snapshot,setSnapshot]=useState<Snapshot|null>(null);const [loadError,setLoadError]=useState(false);
 useEffect(()=>{
  let live=true;setLoadError(false);
  if(viewer.status==='anonymous'){setSnapshot(null);return;}
  if(!anonymous&&viewer.id){
   const id=viewer.id;
   void getDesktopApps().then(apps=>{if(live)setSnapshot({id,apps});}).catch(()=>{if(live)setLoadError(true);});
  }
  return()=>{live=false;};
 },[anonymous,viewer.id,pathname]);
 const seed=useCallback((id:string,apps:AppRow[])=>{
  if(viewer.status==='anonymous'||(viewer.id&&viewer.id!==id))return;
  setSnapshot({id,apps});
 },[viewer.status,viewer.id,pathname]);
 const sameUser=snapshot&&(viewer.id===snapshot.id||(!viewer.id&&viewer.status==='loading'));
 return <Context.Provider value={{apps:sameUser?snapshot.apps:[],loadError,loading:!loadError&&!sameUser&&!anonymous,seed}}>{children}</Context.Provider>;
}

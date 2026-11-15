'use client';
import {useViewer} from '@/components/viewer-provider';
export function PracticeSession({viewerKey,children}:{viewerKey:string;children:React.ReactNode}){
 const {viewer,configured}=useViewer();
 if(configured&&(viewer.status==='loading'||(viewer.id??'visitor')!==viewerKey))return <p role="status">Loading your practice workspace…</p>;
 return <>{children}</>;
}

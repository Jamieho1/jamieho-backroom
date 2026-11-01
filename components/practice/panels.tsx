'use client';
import {useEffect,useRef,useState} from 'react';
const KEY='jamieho.practice.panels.v1';
const clamp=(value:number,min:number,max:number)=>Math.max(min,Math.min(max,value));
export function usePracticePanels(){
 const [state,setState]=useState({sidebar:220,split:50,collapsed:false});const [ready,setReady]=useState(false);
 useEffect(()=>{try{const value=JSON.parse(localStorage.getItem(KEY)??'null');if(value&&typeof value.sidebar==='number'&&Number.isFinite(value.sidebar)&&typeof value.split==='number'&&Number.isFinite(value.split)&&typeof value.collapsed==='boolean')setState({sidebar:clamp(value.sidebar,180,420),split:clamp(value.split,25,75),collapsed:value.collapsed});}catch{}setReady(true);},[]);
 useEffect(()=>{if(ready)try{localStorage.setItem(KEY,JSON.stringify(state));}catch{}},[state,ready]);
 return {state,setState};
}
export function ResizeHandle({label,value,min,max,onChange,scale=1,reset,unit='pixels'}:{label:string;value:number;min:number;max:number;onChange(n:number):void;scale?:number;reset:number;unit?:string}){
 const start=useRef<{x:number;value:number}|null>(null);
 const change=(next:number)=>onChange(clamp(next,min,max));
 return <div className="practice-resizer" role="separator" tabIndex={0} aria-label={label} aria-orientation="vertical" aria-valuemin={min} aria-valuemax={max} aria-valuenow={Math.round(value)} aria-valuetext={`${Math.round(value)} ${unit}`} title="Drag or use arrow keys to resize; double-click to reset"
  onPointerDown={e=>{if(e.button!==0)return;start.current={x:e.clientX,value};e.currentTarget.setPointerCapture?.(e.pointerId);e.preventDefault();}}
  onPointerMove={e=>{if(start.current)change(start.current.value+(e.clientX-start.current.x)*scale);}}
  onPointerUp={()=>{start.current=null;}} onPointerCancel={()=>{start.current=null;}} onLostPointerCapture={()=>{start.current=null;}}
  onDoubleClick={()=>change(reset)}
  onKeyDown={e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();change(e.key==='Home'?min:e.key==='End'?max:value+(e.key==='ArrowRight'?1:-1)*(unit==='pixels'?10:2));}}
 ><span aria-hidden="true" /></div>;
}

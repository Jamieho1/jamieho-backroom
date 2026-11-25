"use client";
import {useEffect,useId,useRef,useState,type KeyboardEvent} from 'react';
import type {FilterOption} from '@/lib/content-hub';

/** A "Topic: All topics ⌄" dropdown button. Menu with radio items and counts; arrows, Home/End, Enter/Space and Escape work. */
export function FilterMenu<V extends string>({label,value,options,onChange}:{label:string;value:V|'';options:FilterOption<V>[];onChange:(v:V|'')=>void}){
 const [open,setOpen]=useState(false);
 const root=useRef<HTMLDivElement>(null),button=useRef<HTMLButtonElement>(null),items=useRef<(HTMLButtonElement|null)[]>([]);
 const menuId=useId();
 const current=options.find(o=>o.value===value)??options[0];
 const focusItem=(i:number)=>{const n=options.length;items.current[(i+n)%n]?.focus();};
 useEffect(()=>{
  if(!open)return;
  const away=(e:PointerEvent)=>{if(!root.current?.contains(e.target as Node))setOpen(false);};
  document.addEventListener('pointerdown',away);return()=>document.removeEventListener('pointerdown',away);
 },[open]);
 useEffect(()=>{if(open)focusItem(Math.max(0,options.findIndex(o=>o.value===value)));/* eslint-disable-next-line react-hooks/exhaustive-deps */},[open]);
 const close=(refocus:boolean)=>{setOpen(false);if(refocus)button.current?.focus();};
 const choose=(v:V|'')=>{onChange(v);close(true);};
 const onButtonKey=(e:KeyboardEvent)=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();setOpen(true);}};
 const onItemKey=(e:KeyboardEvent,i:number)=>{
  if(e.key==='ArrowDown'){e.preventDefault();focusItem(i+1);}
  else if(e.key==='ArrowUp'){e.preventDefault();focusItem(i-1);}
  else if(e.key==='Home'){e.preventDefault();focusItem(0);}
  else if(e.key==='End'){e.preventDefault();focusItem(options.length-1);}
  else if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close(true);}
  else if(e.key==='Tab')setOpen(false);
 };
 return <div className={`hub-dd${open?' is-open':''}`} ref={root}>
  <button type="button" ref={button} className="hub-dd-btn" aria-haspopup="menu" aria-expanded={open} aria-controls={open?menuId:undefined} onClick={()=>setOpen(o=>!o)} onKeyDown={onButtonKey}>
   <span>{label}:</span> <b>{current.label}</b><svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
  </button>
  {open?<div className="hub-dd-menu" role="menu" id={menuId} aria-label={label}>
   {options.map((o,i)=><button type="button" role="menuitemradio" aria-checked={o.value===value} key={o.value||'all'} ref={n=>{items.current[i]=n;}} tabIndex={-1} onClick={()=>choose(o.value)} onKeyDown={e=>onItemKey(e,i)}><span>{o.label}</span><small>{o.count}</small></button>)}
  </div>:null}
 </div>;
}

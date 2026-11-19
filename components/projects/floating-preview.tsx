"use client";
import {forwardRef,useEffect,useImperativeHandle,useRef,useState} from "react";
import {TitleCard} from "./title-card";

export interface PreviewItem {key:string;name:string;tags:string[];shot?:string;n:number;total:number}
interface PointerLike {clientX:number;clientY:number;pointerType:string}
export interface PreviewHandle {enter(index:number,event:PointerLike):void;move(event:PointerLike):void;leave():void}
const W=360,H=253;

/**
 * Cursor-following preview: a fixed frame moved by transform only, eased toward the pointer (snapped with reduced
 * motion). It exists for mouse pointers on wide screens only; phones and touch never show or run it.
 */
export const FloatingPreview=forwardRef<PreviewHandle,{items:PreviewItem[]}>(function FloatingPreview({items},ref){
 const root=useRef<HTMLDivElement>(null);
 const [active,setActive]=useState(-1);
 const s=useRef({tx:0,ty:0,cx:0,cy:0,raf:0,shown:false});
 const reduced=()=>typeof matchMedia==="function"&&matchMedia("(prefers-reduced-motion: reduce)").matches;
 const allowed=(e:PointerLike)=>e.pointerType==="mouse"&&typeof matchMedia==="function"&&matchMedia("(hover:hover) and (min-width:901px)").matches;
 const paint=()=>{if(root.current)root.current.style.transform=`translate3d(${s.current.cx.toFixed(1)}px,${s.current.cy.toFixed(1)}px,0)`;};
 const tick=()=>{const v=s.current;v.raf=0;if(reduced()){v.cx=v.tx;v.cy=v.ty;}else{v.cx+=(v.tx-v.cx)*.14;v.cy+=(v.ty-v.cy)*.14;}paint();if(v.shown&&(Math.abs(v.tx-v.cx)>.3||Math.abs(v.ty-v.cy)>.3))v.raf=requestAnimationFrame(tick);};
 const go=()=>{if(!s.current.raf)s.current.raf=requestAnimationFrame(tick);};
 const target=(e:PointerLike)=>{const v=s.current;let x=e.clientX+28,y=e.clientY-H/2;if(x+W>innerWidth-12)x=e.clientX-28-W;y=Math.max(12,Math.min(innerHeight-H-12,y));v.tx=x;v.ty=y;};
 useImperativeHandle(ref,()=>({
  enter(index,e){if(!allowed(e))return;const v=s.current;target(e);if(!v.shown){v.cx=v.tx;v.cy=v.ty;paint();}v.shown=true;setActive(index);root.current?.classList.add("on");go();},
  move(e){if(!allowed(e))return;target(e);go();},
  leave(){s.current.shown=false;root.current?.classList.remove("on");},
 }),[]);
 useEffect(()=>{const v=s.current;return()=>{if(v.raf)cancelAnimationFrame(v.raf);};},[]);
 return <div ref={root} className="pj-fp" data-preview="true" aria-hidden="true">
  <div className="browser-frame"><div className="browser-traffic-lights"><i/><i/><i/></div>
   <div className="pj-screen">{items.map((item,i)=><div key={item.key} className={`pj-fp-slide${i===active?" on":""}`}>{item.shot?<div className="pj-shot" style={{position:"absolute",inset:0}}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={item.shot} alt=""/></div>:<TitleCard n={item.n} total={item.total} name={item.name} tags={item.tags}/>}</div>)}</div>
  </div>
 </div>;
});

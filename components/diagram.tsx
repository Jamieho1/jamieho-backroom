"use client";
import {createElement,useEffect,useId,useRef,useState} from "react";
import type {ReactNode} from "react";
import type {Shape} from "@/lib/project-diagram";

/** Trusted geometry only. Owner-editable copy is always rendered as React text, never HTML. */
export function ShapeTree({shape,prefix}:{shape:Shape|string;prefix:string}):ReactNode{
 if(typeof shape==="string")return shape;
 const props={...shape.props};
 for(const [key,value]of Object.entries(props))if(typeof value==="string")props[key]=value.replace(/url\(#mk-([wg])\)/g,`url(#${prefix}-$1)`);
 if(shape.tag==="svg"){props.role="img";}
 return createElement(shape.tag,props,...shape.children.map((child,index)=><ShapeTree key={index} shape={child} prefix={prefix}/>));
}

/**
 * The one diagram frame shared by What I build and project case studies: FIG header, arrow markers, caption.
 * `reveal` draws the diagram when it scrolls into view (immediately with reduced motion); otherwise it is always drawn.
 */
export function DiagramFigure({fig,title,caption,reveal=false,figureProps,children}:{fig:string;title:string;caption?:string;reveal?:boolean;figureProps?:Record<string,unknown>;children:(prefix:string)=>ReactNode}){
 const prefix=useId().replace(/:/g,"");
 const ref=useRef<HTMLElement>(null);
 const [seen,setSeen]=useState(false);
 useEffect(()=>{
  if(!reveal)return;const node=ref.current;
  if(!node||typeof IntersectionObserver==="undefined"||(typeof matchMedia==="function"&&matchMedia("(prefers-reduced-motion: reduce)").matches)){const frame=requestAnimationFrame(()=>setSeen(true));return()=>cancelAnimationFrame(frame);}
  const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){setSeen(true);observer.disconnect();}},{threshold:.3});observer.observe(node);return()=>observer.disconnect();
 },[reveal]);
 return <figure ref={ref} className={`diag${!reveal||seen?" on":""}`} {...figureProps}>
  <header className="diag-h"><span>{fig}</span><b>{title}</b></header>
  <svg width="0" height="0" style={{position:"absolute"}} aria-hidden="true"><defs>{["w","g"].map(v=><marker key={v} id={`${prefix}-${v}`} markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M1.5 1.5L8 5L1.5 8.5" fill="none" stroke={v==="g"?"#E8C46A":"#F3EEE6"} strokeWidth="1.3"/></marker>)}</defs></svg>
  {children(prefix)}
  {caption?<figcaption className="diag-c">{caption}</figcaption>:null}
 </figure>;
}

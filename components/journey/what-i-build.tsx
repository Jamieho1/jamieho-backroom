"use client";
import {createElement,forwardRef,useId,useImperativeHandle,useRef,useState} from "react";
import type {ReactNode} from "react";
import type {BuildContent} from "@/lib/journey/build";
import {buildStep,buildStepLocal} from "@/lib/journey/build";
import {PrimaryPill} from "@/components/primary-pill";
import diagrams from "@/lib/journey/build-diagrams.json";

interface Shape {tag:string;props:Record<string,unknown>;children:(Shape|string)[]}
export interface BuildHandle {setProgress(local:number):void}
function Credentials({data}:{data:BuildContent}){return <div className="build-credentials">{data.certifications.map(c=>{const inside=<><svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true"><path d="M15 2L26 8.5V21.5L15 28L4 21.5V8.5Z M10 15.5L13.5 19L20.5 11.5" stroke="#E8C46A" strokeWidth="1.4"/></svg><span><b>{c.title}</b>{c.url?<i>Verify on Credly ↗</i>:null}</span></>;return c.url?<a key={c.title} className="cred" href={c.url} target="_blank" rel="noopener noreferrer">{inside}</a>:<div key={c.title} className="cred">{inside}</div>;})}</div>}
/** Trusted geometry only. Owner-editable copy is always rendered as React text, never HTML. */
function ShapeTree({shape,prefix}:{shape:Shape|string;prefix:string}):ReactNode{
 if(typeof shape==="string")return shape;
 const props={...shape.props};
 for(const [key,value]of Object.entries(props))if(typeof value==="string")props[key]=value.replace(/url\(#mk-([wg])\)/g,`url(#${prefix}-$1)`);
 if(shape.tag==="svg"){props.role="img";}

 return createElement(shape.tag,props,...shape.children.map((child,index)=><ShapeTree key={index} shape={child} prefix={prefix}/>));
}
export function BuildDiagram({index,data}:{index:number;data:BuildContent}){const id=useId().replace(/:/g,"");const item=data.items[index];return <figure className="diag on" data-diagram={index} style={{["--diagram-ratio" as string]:diagrams[index].props.viewBox.split(" ").slice(2).join(" / ")}}><header className="diag-h"><span>FIG {String(index+1).padStart(2,"0")}</span><b>{item.diagramTitle}</b></header><div className="dscroll" tabIndex={0} aria-label={`${item.title} diagram; scroll horizontally to explore`}><svg width="0" height="0" style={{position:"absolute"}} aria-hidden="true"><defs>{["w","g"].map(v=><marker key={v} id={`${id}-${v}`} markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M1.5 1.5L8 5L1.5 8.5" fill="none" stroke={v==="g"?"#E8C46A":"#F3EEE6"} strokeWidth="1.3"/></marker>)}</defs></svg><ShapeTree shape={diagrams[index] as Shape} prefix={id}/></div><p className="dhint">Pan to explore →</p>{item.caption?<figcaption className="diag-c">{item.caption}</figcaption>:null}</figure>}
export const WhatIBuild=forwardRef<BuildHandle,{data:BuildContent;still?:boolean;accordion?:boolean;onSeek?:(local:number)=>void}>(function WhatIBuild({data,still=false,accordion=false,onSeek},ref){
 const [active,setActive]=useState(0);const activeRef=useRef(0);const id=useId();
 useImperativeHandle(ref,()=>({setProgress(local){const next=buildStep(local);if(next!==activeRef.current){activeRef.current=next;setActive(next);}}}),[]);
 return <section className={`wib${still?" wib-still":""}${accordion?" wib-accordion":""}`} aria-label="What I build"><div className="wib-grid" aria-hidden="true"/><div className="wib-stage"><header className="wib-head"><div><h2>{data.title}</h2><p className="wib-sub">{data.description}</p></div><span className="wib-count" aria-live="polite">{String(active+1).padStart(2,"0")} / 05</span></header><div className="wib-body"><ol className="wib-list">{data.items.map((item,index)=>{const open=still||index===active;return <li className={`wi${open?" open":""}`} key={index} data-build-row={index}><button className="wi-h" aria-expanded={open} aria-controls={`${id}-${index}`} onClick={()=>{if(still)return;setActive(index===active&&accordion?-1:index);if(!accordion)onSeek?.(buildStepLocal(index));}}><span className="wi-n">{String(index+1).padStart(2,"0")}</span><span className="wi-t">{item.title}</span></button><div className="wi-c" id={`${id}-${index}`} inert={!open}><div className="wi-ci"><div className="wi-in"><p className="wi-d">{item.description}</p>{item.languages.length?<div className="langs"><span className="lb">Languages</span>{item.languages.map(v=><span className="chip l" tabIndex={0} key={v}>{v}</span>)}</div>:null}<div className="chips">{item.chips.map(v=><span className="chip" tabIndex={0} key={v}>{v}</span>)}</div>{index===2?<Credentials data={data}/>:null}<BuildDiagram index={index} data={data}/></div></div></div></li>})}</ol></div><footer className="wib-cta"><h3>{data.ctaTitle}</h3><PrimaryPill strong data-contact-jump href="#home-contact">{data.ctaLabel}</PrimaryPill></footer></div></section>
});

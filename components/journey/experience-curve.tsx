"use client";
import {forwardRef,useEffect,useId,useImperativeHandle,useMemo,useRef,useState} from "react";
import {experienceLayout,experienceState,type ExperienceStop} from "@/lib/journey/experience-curve";
import {ExperienceIcon} from "./experience-icon";

export interface ExperienceCurveHandle {setProgress(local:number):void}
export const ExperienceCurve=forwardRef<ExperienceCurveHandle,{stops:ExperienceStop[];still?:boolean;vertical?:boolean}>(function ExperienceCurve({stops,still=false,vertical=false},ref){
 const uid=useId(),root=useRef<HTMLElement>(null),line=useRef<SVGPathElement>(null);
 const [animated,setAnimated]=useState(false),[current,setCurrent]=useState(0),[focused,setFocused]=useState<number|null>(null);
 const [geometry,setGeometry]=useState<{width:number;heights:number[]}>({width:1000,heights:[]});
 const latest=useRef(0);
 const place=useMemo(()=>experienceLayout(stops.length,vertical,geometry.width,geometry.heights),[stops.length,vertical,geometry]);
 const selected=focused??current;
 useImperativeHandle(ref,()=>({setProgress(local){latest.current=local;const state=experienceState(local,stops.length);setCurrent(previous=>previous===state.current?previous:state.current);if(line.current)line.current.style.strokeDashoffset=String(1-state.progress);}}),[stops.length]);
 useEffect(()=>{
  const query=matchMedia("(min-width: 769px) and (prefers-reduced-motion: no-preference)");
  const sync=()=>setAnimated(!still&&!vertical&&query.matches);sync();query.addEventListener("change",sync);
  return ()=>query.removeEventListener("change",sync);
 },[still,vertical]);
 useEffect(()=>{
  const node=root.current;if(!node)return;
  const measure=()=>{const width=node.clientWidth;const heights=vertical?[...node.querySelectorAll<HTMLElement>(".experience-stop-item")].map(el=>el.getBoundingClientRect().height):[];
   setGeometry(old=>old.width===width&&old.heights.join()===heights.join()?old:{width,heights});};
  measure();const observer=new ResizeObserver(measure);observer.observe(node);node.querySelectorAll(".experience-stop-item").forEach(el=>observer.observe(el));return ()=>observer.disconnect();
 },[vertical,stops]);
 return <section ref={root} className={`experience-curve${vertical?" experience-vertical":""}`} data-animated={animated} data-current={selected} aria-label="Experience journey"
  onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node|null))setFocused(null);}}
  onWheel={event=>{const node=event.currentTarget;if((event.deltaY>0&&node.scrollTop+node.clientHeight<node.scrollHeight-1)||(event.deltaY<0&&node.scrollTop>0))event.stopPropagation();}}>
  <div className="experience-art-layer" aria-hidden="true"/>
  <header className="experience-heading"><p>Experience</p><h2>Along the way</h2></header>
  <div className="experience-board">
   <svg className="experience-path" viewBox={`0 0 ${place.width} ${place.height}`} preserveAspectRatio="none" style={{height:place.height}} aria-hidden="true">
    <path d={place.path} className="experience-path-track"/><path ref={line} d={place.path} pathLength="1" className="experience-path-drawn" style={{strokeDasharray:1,strokeDashoffset:animated?1-experienceState(latest.current,stops.length).progress:0}}/>
   </svg>
   <ol className="experience-stops">
    {stops.map((stop,i)=><li key={stop.id} className="experience-stop-item" style={{"--stop-x":`${place.points[i].x/place.width*100}%`,"--stop-y":`${place.points[i].y}px`,"--stop-direction":i%2?-1:1} as React.CSSProperties}>
     {i<stops.length-1?<svg className="experience-mobile-segment" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d={i%2?"M 42 0 C 42 50 58 50 58 100":"M 58 0 C 58 50 42 50 42 100"}/></svg>:null}
     <button className="experience-stop" data-active={!animated||i===selected} data-present={stop.present} aria-label={stop.project?"Projects":`${stop.org||stop.title}, ${stop.dates}`} aria-current={animated&&i===selected?"step":undefined} aria-controls={`${uid}-card-${i}`}
      onFocus={()=>setFocused(i)} onClick={()=>setCurrent(i)}>
      <span className="experience-stop-ring"><ExperienceIcon name={stop.icon}/></span><span className="experience-stop-label">{stop.project?"Projects":stop.org||stop.title}</span>
     </button>
     <article id={`${uid}-card-${i}`} className="experience-card" data-active={i===selected} data-draft-changed={stop.draftChanged||undefined} hidden={animated&&i!==selected} aria-label={stop.project?"Projects":stop.title}>
      {stop.project?<><h3>Projects</h3><a className="experience-work-link" href="#projects">See the work ↓</a></>:<>
       <p className="experience-card-meta">{[stop.org,stop.dates].filter(Boolean).join(" · ")}</p><h3>{stop.title}</h3>
       {stop.bullets.length?<ul>{stop.bullets.map((bullet,b)=><li key={b} data-draft-changed={bullet.draftChanged||undefined}>{bullet.text}</li>)}</ul>:null}
      </>}
     </article>
    </li>)}
   </ol>
  </div>
 </section>;
});

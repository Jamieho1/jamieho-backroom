"use client";
import {forwardRef,useImperativeHandle,useRef,useState,type CSSProperties} from "react";
export interface ScreenshotCarouselHandle {setProgress(progress:number):void}
/** Desktop Work shares the journey clock; all other views retain a native swipeable row. */
export const ScreenshotCarousel=forwardRef<ScreenshotCarouselHandle,{shots:string[];name:string;aspect?:number;scrub?:boolean;onSelect?:(index:number)=>void}>(function ScreenshotCarousel({shots,name,aspect=16/10,scrub=false,onSelect},ref){
 const track=useRef<HTMLDivElement>(null),root=useRef<HTMLElement>(null),progress=useRef(0);const [current,setCurrent]=useState(0),[ratio,setRatio]=useState(aspect);
 const controlled=()=>scrub&&matchMedia('(min-width:769px) and (prefers-reduced-motion:no-preference)').matches;
 function paint(p:number){const node=track.current;if(!node||!controlled())return;root.current?.setAttribute('data-scrub','true');node.scrollLeft=p*(node.scrollWidth-node.clientWidth);setCurrent(Math.round(p*Math.max(0,shots.length-1)));}
 useImperativeHandle(ref,()=>({setProgress(p){progress.current=p;paint(p);}}),[scrub,shots.length]);
 function go(index:number){const node=track.current;if(!node)return;const next=Math.max(0,Math.min(shots.length-1,index));if(controlled()&&onSelect){onSelect(next);return;}node.scrollTo({left:next*node.clientWidth,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});}
 return <section ref={root} className="screenshot-carousel browser-frame" style={{'--shot-aspect':ratio} as CSSProperties} role="region" aria-roledescription="carousel" aria-label={`${name} screenshots`}>
  <div className="browser-traffic-lights" aria-hidden="true"><i/><i/><i/></div>
  <div ref={track} className="screenshot-carousel-track" tabIndex={0} aria-label="Screenshots — use left and right arrow keys" onKeyDown={event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();event.stopPropagation();go(current+(event.key==='ArrowRight'?1:-1));}}} onScroll={()=>{const node=track.current;if(node&&!controlled())setCurrent(Math.round(node.scrollLeft/node.clientWidth));}}>
   {shots.map((src,i)=><figure className="screenshot-slide" key={src}><img src={src} data-fit={i===0?'cover':'contain'} alt={`${name} screenshot ${i+1} of ${shots.length}`} loading="lazy" draggable={false} onLoad={event=>{if(i===0){const img=event.currentTarget;if(img.naturalWidth&&img.naturalHeight)setRatio(img.naturalWidth/img.naturalHeight);}paint(progress.current);}}/></figure>)}
  </div>
  {shots.length>1?<div className="screenshot-controls"><div className="screenshot-dots">{shots.map((_,i)=><button type="button" key={i} aria-label={`Show ${name} screenshot ${i+1}`} aria-current={i===current?'true':undefined} onClick={()=>go(i)}><span/></button>)}</div><span className="sr-only" role="status">Screenshot {current+1} of {shots.length}</span></div>:null}
 </section>;
});

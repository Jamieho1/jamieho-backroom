"use client";
import {useRef,useState} from "react";
/** Native horizontal touch scrolling; controls never change the page's vertical position. */
export function ScreenshotCarousel({shots,name}:{shots:string[];name:string}){
 const track=useRef<HTMLDivElement>(null);const [current,setCurrent]=useState(0);
 function go(index:number){const node=track.current;if(!node)return;const next=Math.max(0,Math.min(shots.length-1,index));node.scrollTo({left:next*node.clientWidth,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});}
 return <section className="screenshot-carousel" role="region" aria-roledescription="carousel" aria-label={`${name} screenshots`}>
  <div ref={track} className="screenshot-carousel-track" tabIndex={0} aria-label="Screenshots — use left and right arrow keys" onKeyDown={event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();event.stopPropagation();go(current+(event.key==='ArrowRight'?1:-1));}}} onScroll={()=>{const node=track.current;if(node)setCurrent(Math.round(node.scrollLeft/node.clientWidth));}}>
   {shots.map((src,i)=><figure className="screenshot-slide" key={src}><img src={src} alt={`${name} screenshot ${i+1} of ${shots.length}`} loading="lazy" draggable={false}/></figure>)}
  </div>
  {shots.length>1?<div className="screenshot-controls"><button type="button" aria-label={`Previous ${name} screenshot`} disabled={current===0} onClick={()=>go(current-1)}>←</button><div className="screenshot-dots">{shots.map((_,i)=><button type="button" key={i} aria-label={`Show ${name} screenshot ${i+1}`} aria-current={i===current?'true':undefined} onClick={()=>go(i)}><span/></button>)}</div><button type="button" aria-label={`Next ${name} screenshot`} disabled={current===shots.length-1} onClick={()=>go(current+1)}>→</button><span className="sr-only" role="status">Screenshot {current+1} of {shots.length}</span></div>:null}
 </section>;
}

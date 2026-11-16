"use client";
import {forwardRef,useEffect,useImperativeHandle,useMemo,useRef,useState,type CSSProperties} from 'react';
import {gsap} from 'gsap';
import {constellationLayout,constellationPhotos,constellationTitle,type PhotoPosition} from '@/lib/journey/constellation';
import type {AboutPhoto} from '@/lib/home-content-schema';
import type {Panel} from '@/lib/journey/timeline';
import {mediaUrl} from '@/lib/journey/media';
import {stripKeys} from '@/lib/journey/motion';
import {Markdown} from '@/components/markdown';
export interface AboutConstellationHandle {setProgress(progress:number):void}
interface Props {panel:Panel;photos:AboutPhoto[];base:string;still?:boolean;changed?:boolean}
/** Content stays HTML; only the board's transform drifts. The static render is the finished layout. */
export const AboutConstellation=forwardRef<AboutConstellationHandle,Props>(function AboutConstellation({panel,photos,base,still=false,changed=false},ref){
 const selected=useMemo(()=>constellationPhotos(photos),[photos]);
 const board=useRef<HTMLDivElement>(null),motion=useRef<HTMLDivElement>(null);
 const [size,setSize]=useState({width:1000,height:440});
 const update=useRef<()=>void>(()=>{}),progress=useRef(.5),pointer=useRef({x:0,y:0});
 const positions=useMemo(()=>constellationLayout(selected.length,size),[selected.length,size]);
 useImperativeHandle(ref,()=>({setProgress(value){progress.current=Math.max(0,Math.min(1,value));update.current();}}),[]);
 useEffect(()=>{
  const node=board.current;if(!node||typeof ResizeObserver==='undefined')return;
  const observer=new ResizeObserver(([entry])=>{if(entry.contentRect.width&&entry.contentRect.height)setSize({width:entry.contentRect.width,height:entry.contentRect.height});});
  observer.observe(node);return()=>observer.disconnect();
 },[]);
 useEffect(()=>{
  const node=motion.current;if(!node||still)return;
  const media=gsap.matchMedia();
  media.add('(min-width:769px) and (prefers-reduced-motion:no-preference)',()=>{
   const x=gsap.quickTo(node,'x',{duration:.8,ease:'power2.out'}),y=gsap.quickTo(node,'y',{duration:.8,ease:'power2.out'});
   update.current=()=>{x(pointer.current.x*6);y(pointer.current.y*5+(progress.current-.5)*12);};update.current();
   return()=>{update.current=()=>{};x.tween.kill();y.tween.kill();};
  });
  return()=>{update.current=()=>{};media.revert();};
 },[still]);
 const style=(position:PhotoPosition):CSSProperties=>({left:`${position.x/positions.width*100}%`,top:`${position.y/positions.height*100}%`,width:`${position.width/positions.width*100}%`,height:`${position.height/positions.height*100}%`,'--photo-tilt':`${position.tilt}deg`} as CSSProperties);
 function photo(index:number){
  const p=selected[index],pos=positions.photos[index];if(!p||!pos)return null;
  return <figure className={`about-photo${index===0?' is-centre':''}`} style={style(pos)} tabIndex={0} aria-label={p.alt} data-draft-changed={p.draftChanged||undefined}>
   <div className="about-photo-print"><img src={mediaUrl(base,p.path)} alt={p.alt} loading="lazy" decoding="async"/><figcaption>{p.caption||p.alt}</figcaption></div>
  </figure>;
 }
 return <section style={{translate:"0 0"}} className={`about-constellation ${still?'is-still journey-still-panel':'journey-panel'}`} aria-label={stripKeys(panel.title)} data-draft-changed={changed||panel.draftChanged||undefined}
  onPointerMove={event=>{if(event.pointerType!=='mouse')return;const rect=event.currentTarget.getBoundingClientRect();pointer.current={x:(event.clientX-rect.left)/rect.width*2-1,y:(event.clientY-rect.top)/rect.height*2-1};update.current();}}
  onPointerLeave={()=>{pointer.current={x:0,y:0};update.current();}}
  onWheel={event=>{const node=event.currentTarget;if((event.deltaY>0&&node.scrollTop+node.clientHeight<node.scrollHeight-1)||(event.deltaY<0&&node.scrollTop>0))event.stopPropagation();}}>
  <div className="about-constellation-intro">
   <div><p className="about-constellation-eyebrow">About</p><h2 className="about-constellation-title">{constellationTitle(stripKeys(panel.title)).map((part,i)=><span key={i}>{i>0?' ':''}{part.connector?<em>{part.word}</em>:part.word}</span>)}</h2>
   <a className="about-story-link" href="/about">Read my story <span aria-hidden="true">↗</span></a></div>
   {panel.body?<div className="about-constellation-body"><Markdown text={panel.body} disableLinks/></div>:null}
  </div>
  {selected.length?<div ref={board} className="about-constellation-board" data-layout={positions.mode}>
   <div ref={motion} className="about-constellation-motion">
    <svg className="about-constellation-lines" viewBox={`0 0 ${positions.width} ${positions.height}`} preserveAspectRatio="none" aria-hidden="true"><circle cx={positions.width/2} cy={positions.photos[0]?.y??positions.height/2} r={Math.min(positions.width*.38,positions.height*(positions.mode==='simple'?.30:.38))}/>{positions.paths.map((d,i)=><path key={i} d={d}/>)}</svg>
    <div className="about-constellation-centre">{photo(0)}</div>
    <ol className="about-constellation-orbit" aria-label="More photos">{selected.slice(1).map((p,i)=><li key={p.id}>{photo(i+1)}</li>)}</ol>
   </div>
  </div>:null}
 </section>;
});

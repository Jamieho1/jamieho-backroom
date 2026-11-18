"use client";
import {PrimaryPill} from "@/components/primary-pill";
import {Fragment,forwardRef,useEffect,useImperativeHandle,useRef,useState,type CSSProperties,type ReactNode} from 'react';
import {gsap} from 'gsap';
import {Markdown} from '@/components/markdown';
import {ScreenshotCarousel,type ScreenshotCarouselHandle} from '@/components/screenshot-carousel';
import {screenshotAspect} from '@/lib/screenshot-geometry';
import {projectHref} from '@/lib/portfolio-core';
import {constellationPhotos,constellationTitle} from '@/lib/journey/background-photos';
import {capabilityLinks,coordinates,dialCount,dialLocal,dialTime,dialShotProgress,presentEntry,type DialData} from '@/lib/journey/dial';
import {clamp01,smoothstep,type Panel} from '@/lib/journey/timeline';
import {mediaUrl} from '@/lib/journey/media';
import type {AboutPhoto} from '@/lib/home-content-schema';
import {ExperienceIcon} from './experience-icon';
export interface HomeDialHandle {setProgress(local:number):void}
/** Mockup constellation: four side prints sit on the ring (percent of the square dial) and slide to the outer edge as ghosts. */
const ORBIT=[{a0:45.86,a1:76,tilt:4},{a0:134.14,a1:104,tilt:-5},{a0:225.86,a1:256,tilt:5},{a0:314.14,a1:284,tilt:-4}],RING=38.5;
const orbitAt=(n:number,e:number)=>{const o=ORBIT[n],a=(o.a0+(o.a1-o.a0)*e)*Math.PI/180;return {left:`${(50+RING*Math.sin(a)).toFixed(2)}%`,top:`${(50-RING*Math.cos(a)).toFixed(2)}%`};};
/** Edges draw first, then nodes pop in; the paused timeline is scrubbed by the shared scroll clock (1.2s of timeline). */
function iconTimeline(svg:Element){const edges=svg.querySelectorAll('path,rect,line'),nodes=svg.querySelectorAll('circle'),tl=gsap.timeline({paused:true});
 if(edges.length)tl.fromTo(edges,{strokeDashoffset:1,opacity:0},{strokeDashoffset:0,opacity:1,duration:.5,ease:'power1.inOut',stagger:{amount:.3}},0);
 if(nodes.length)tl.fromTo(nodes,{strokeDashoffset:1,opacity:0,scale:.4,transformOrigin:'50% 50%',transformBox:'fill-box'},{strokeDashoffset:0,opacity:1,scale:1,duration:.25,ease:'back.out(2)',stagger:{amount:.15}},.8);
 tl.set({},{},1.2);return tl;}
interface Props {data:DialData;panel:Panel;photos:AboutPhoto[];base:string;still?:boolean;changed?:boolean;onSeek?:(local:number)=>void}
/** One parent-owned scroll clock. Static/compact rendering uses the same public data in natural document flow. */
export const HomeDial=forwardRef<HomeDialHandle,Props>(function HomeDial({data,panel,photos,base,still=false,changed=false,onSeek},ref){
 const root=useRef<HTMLDivElement>(null),cards=useRef<(HTMLElement|null)[]>([]),visuals=useRef<(HTMLDivElement|null)[]>([]),orbitRoot=useRef<HTMLDivElement>(null),orbit=useRef<(HTMLDivElement|null)[]>([]),icons=useRef<Map<number,{svg:Element;tl:gsap.core.Timeline;p:number}>>(new Map()),carousels=useRef<(ScreenshotCarouselHandle|null)[]>([]);
 useEffect(()=>{const map=icons.current;return()=>{map.forEach(i=>i.tl.kill());map.clear();};},[]);
 const [active,setActive]=useState(0);const selected=constellationPhotos(photos),sides=still?selected.slice(1):selected.slice(1,1+ORBIT.length),count=dialCount(data),last=useRef(-1);
 const steps=[{kind:'background' as const,key:'background',label:'Background',title:panel.title},...data.experiences.map(entry=>({kind:'experience' as const,key:entry.id,label:entry.org||entry.title,title:entry.title,entry})),...data.projects.map(project=>({kind:'project' as const,key:project.id,label:project.name,title:project.name,project}))];
 useImperativeHandle(ref,()=>({setProgress(local){if(still)return;const t=dialTime(local,count),index=Math.max(0,Math.min(count-1,Math.round(t)));if(last.current!==index){last.current=index;setActive(index);}
  root.current?.style.setProperty('--dial-turn',`${Math.max(0,t)*40}deg`);
  cards.current.forEach((el,i)=>{const d=t-i,o=1-smoothstep(.22,.5,Math.abs(d));if(el){el.style.opacity=String(o);el.style.visibility=o>.01?'visible':'hidden';el.inert=i!==index;el.style.transform=`translateY(${-d*24}px)`;}});
  visuals.current.forEach((el,i)=>{if(!el)return;const d=t-i,o=1-smoothstep(.32,.56,Math.abs(d));el.style.opacity=String(o);el.style.visibility=o>.01?'visible':'hidden';el.inert=i!==index;
   const svg=el.querySelector('.dial-icon svg');if(!svg)return;let icon=icons.current.get(i);if(icon&&icon.svg!==svg){icon.tl.kill();icon=undefined;}if(!icon){icon={svg,tl:iconTimeline(svg),p:-1};icons.current.set(i,icon);}
   const p=clamp01((t-(i-.45))/.45);if(icon.p!==p){icon.p=p;icon.tl.progress(p);}});
  const e=smoothstep(0,.7,t),firstWork=1+data.experiences.length,ghost=(1-.8*e)*(1-smoothstep(firstWork-.8,firstWork-.2,t)),orb=orbitRoot.current;
  if(orb){orb.style.setProperty('--orbit-o',ghost.toFixed(3));orb.style.setProperty('--ghost',e.toFixed(3));orb.style.setProperty('--tag-o',(1-clamp01(e*3)).toFixed(3));orb.style.visibility=ghost>.01?'visible':'hidden';if(e>.5)orb.setAttribute('aria-hidden','true');else orb.removeAttribute('aria-hidden');}
  orbit.current.forEach((el,n)=>{if(el)Object.assign(el.style,orbitAt(n,e));});
  data.projects.forEach((p,n)=>carousels.current[n]?.setProgress(dialShotProgress(local,1+data.experiences.length+n,count)));
 }}),[still,count,data]);
 function photo(photo:AboutPhoto,className='',style?:CSSProperties,ref?:(el:HTMLDivElement|null)=>void){return <div className={`dial-photo-item ${className}`} style={style} ref={ref}><figure className="dial-print" data-draft-changed={photo.draftChanged||undefined}><img src={mediaUrl(base,photo.path)} alt={photo.alt} loading="lazy"/></figure><p className="dial-tag">{photo.caption}</p></div>;}
 const side=(p:AboutPhoto,n:number,live:boolean)=>photo(p,live?'dial-orbit-photo':'dial-side-photo',live?{...orbitAt(n,0),'--tilt':`${ORBIT[n]?.tilt??0}deg`} as CSSProperties:{'--tilt':`${n%2?4:-4}deg`} as CSSProperties,live?(el=>{orbit.current[n]=el;}):undefined);
 const wrap=(node:ReactNode)=>still?node:<div className="dial-const">{node}</div>;
 function centre(i:number){const step=steps[i];if(step.kind==='background')return still?<div className="dial-photos">{selected[0]?photo(selected[0],'dial-photo-centre'):null}<div className="dial-side-photos">{sides.map((p,n)=><Fragment key={p.id}>{side(p,n,false)}</Fragment>)}</div></div>:wrap(selected[0]?photo(selected[0],'dial-photo-centre'):null);
  if(step.kind==='experience')return step.entry.kind==='education'&&selected[0]?wrap(photo(selected[0],'dial-photo-centre')):wrap(<div className={`dial-icon${presentEntry(step.entry.dates)?' is-present':''}`}><ExperienceIcon name={step.entry.kind==='education'?'graduation-cap':step.entry.journey_icon??'briefcase'}/></div>);
  return step.project.screenshots.length?<div className="dial-browser"><ScreenshotCarousel ref={h=>{carousels.current[i-1-data.experiences.length]=h;}} shots={step.project.screenshots} name={step.project.name} aspect={screenshotAspect(step.project.slug)} scrub={!still} onSelect={n=>onSeek?.(dialLocal(i,count,step.project.screenshots.length>1?-.25+.5*n/(step.project.screenshots.length-1):0))}/></div>:<div className="dial-empty">{step.project.name}</div>;
 }
 function copy(i:number){const step=steps[i];return <>
  <p className="dial-eyebrow">{step.kind==='background'?'Background':step.kind==='experience'?'Experience':'Selected Work'}</p>
  <h2>{constellationTitle(step.title).map((t,n)=><span key={n} className={t.connector?'dial-connector':undefined}>{t.word}{' '}</span>)}</h2>
  {step.kind==='background'?<><div className="dial-prose"><Markdown text={panel.body??''} disableLinks/></div><PrimaryPill className="dial-link" href="/about">Read my story</PrimaryPill></>:step.kind==='experience'?<><p className="dial-org">{step.entry.org}</p><p className="dial-meta">{[step.entry.dates,step.entry.location].filter(Boolean).join(' · ')}</p><ul className="dial-points">{(step.entry.experience_bullets??[]).map(b=><li key={b.id} data-draft-changed={b.draftChanged||undefined}><Markdown text={b.text}/></li>)}</ul></>:<>
   <p className="dial-tagline">{step.project.tagline}</p>{step.project.highlights?.length?<ul className="dial-points">{step.project.highlights.slice(0,3).map(line=><li key={line}>{line}</li>)}</ul>:null}
   <ul className="dial-tags">{step.project.tags.map(tag=><li key={tag} tabIndex={0}>{tag}</li>)}</ul>
   <p className="dial-capabilities">{capabilityLinks(step.project.tags).map(label=><a key={label} href="#toolkit">→ {label}</a>)}</p>
   <div className="dial-links">{step.project.url?<PrimaryPill className="dial-link" href={step.project.url} target="_blank" rel="noopener noreferrer">Visit</PrimaryPill>:null}<PrimaryPill className="dial-link" href={projectHref(step.project.slug)}>Case study</PrimaryPill></div>{i===steps.length-1?<PrimaryPill className="dial-all" href="/projects">All projects</PrimaryPill>:null}
  </>}
 </>;}
 const marked=(i:number)=>steps[i].kind==='background'?changed:steps[i].kind==='experience'?steps[i].entry.draftChanged:steps[i].project.draftChanged;
 if(still)return <div ref={root} className="home-dial dial-stacked" data-dial-count={count}>{steps.map((step,i)=><section className="dial-stack-step" key={step.key} id={step.kind==='experience'&&i===1?'experience':step.kind==='project'&&i===1+data.experiences.length?'projects':undefined} data-dial-step={i} data-draft-changed={marked(i)||undefined}>
  {step.kind==='project'&&i===1+data.experiences.length?<span id="work" className="journey-anchor-alias"/>:null}<div className="dial-stack-copy">{copy(i)}</div><div className="dial-stack-visual">{centre(i)}</div>
 </section>)}</div>;
 const current=steps[active],coord=current.kind==='experience'?coordinates(current.entry):current.kind==='project'?current.project.url.replace(/^https?:\/\//,'').replace(/\/$/,''):coordinates();
 return <div ref={root} className="home-dial dial-pinned" data-dial-count={count} data-active-step={active}>
  <nav className="dial-index" aria-label="Background, experience and work"><div className="dial-index-line"/>{steps.map((step,i)=><button key={step.key} type="button" aria-current={i===active?'step':undefined} onClick={()=>onSeek?.(dialLocal(i,count))}><span className="dial-node"/><span>{String(i).padStart(2,'0')} {step.label}</span></button>)}</nav>
  <div className="dial-copy">{steps.map((step,i)=><article data-lenis-prevent-wheel key={step.key} ref={el=>{cards.current[i]=el;}} style={{opacity:i===0?1:0,visibility:i===0?'visible':'hidden'}} data-dial-step={i} data-draft-changed={marked(i)||undefined} inert={i!==active}>{copy(i)}</article>)}</div>
  <div className="dial-board"><div className="dial-watermark" aria-hidden="true">JAMIE HO</div><svg className="dial-rings" viewBox="0 0 1000 1000" aria-hidden="true"><g className="dial-rotation">{[480,385,225].map(radius=><circle key={radius} cx="500" cy="500" r={radius}/>)}{Array.from({length:120},(_,i)=>{const a=i*Math.PI/60;return <line key={i} x1={500+Math.cos(a)*480} y1={500+Math.sin(a)*480} x2={500+Math.cos(a)*(i%5?477:466)} y2={500+Math.sin(a)*(i%5?477:466)}/>;})}<circle className="dial-gold-dot" cx="500" cy="885" r="3"/></g></svg>
   <p className="dial-coordinate">{coord}</p><div ref={orbitRoot} className="dial-const dial-orbit">{sides.map((p,n)=><Fragment key={p.id}>{side(p,n,true)}</Fragment>)}</div>{steps.map((step,i)=><div className="dial-centre" key={step.key} ref={el=>{visuals.current[i]=el;}} style={{opacity:i===0?1:0,visibility:i===0?'visible':'hidden'}} inert={i!==active}>{centre(i)}</div>)}
  </div><footer className="dial-corners"><span>London · Hong Kong</span><span>Section 02 / {current.kind==='project'?'Selected Work':current.kind} · {String(active).padStart(2,'0')} / {String(count-1).padStart(2,'0')}</span></footer>
 </div>;
});

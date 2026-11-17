"use client";
import {forwardRef,useImperativeHandle,useRef,useState,type CSSProperties} from 'react';
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
interface Props {data:DialData;panel:Panel;photos:AboutPhoto[];base:string;still?:boolean;changed?:boolean;onSeek?:(local:number)=>void}
/** One parent-owned scroll clock. Static/compact rendering uses the same public data in natural document flow. */
export const HomeDial=forwardRef<HomeDialHandle,Props>(function HomeDial({data,panel,photos,base,still=false,changed=false,onSeek},ref){
 const root=useRef<HTMLDivElement>(null),cards=useRef<(HTMLElement|null)[]>([]),visuals=useRef<(HTMLDivElement|null)[]>([]),carousels=useRef<(ScreenshotCarouselHandle|null)[]>([]);
 const [active,setActive]=useState(0);const selected=constellationPhotos(photos),count=dialCount(data),last=useRef(-1);
 const steps=[{kind:'background' as const,key:'background',label:'Background',title:panel.title},...data.experiences.map(entry=>({kind:'experience' as const,key:entry.id,label:entry.org||entry.title,title:entry.title,entry})),...data.projects.map(project=>({kind:'project' as const,key:project.id,label:project.name,title:project.name,project}))];
 useImperativeHandle(ref,()=>({setProgress(local){if(still)return;const t=dialTime(local,count),index=Math.max(0,Math.min(count-1,Math.round(t)));if(last.current!==index){last.current=index;setActive(index);}
  root.current?.style.setProperty('--dial-turn',`${Math.max(0,t)*40}deg`);
  cards.current.forEach((el,i)=>{const d=t-i,o=1-smoothstep(.22,.5,Math.abs(d));if(el){el.style.opacity=String(o);el.style.visibility=o>.01?'visible':'hidden';el.inert=i!==index;el.style.transform=`translateY(${-d*24}px)`;}});
  visuals.current.forEach((el,i)=>{if(!el)return;const d=t-i,o=1-smoothstep(.32,.56,Math.abs(d));el.style.opacity=String(o);el.style.visibility=o>.01?'visible':'hidden';el.inert=i!==index;el.style.setProperty('--icon-draw',String(1-clamp01((t-i+.42)/.35)));});
  root.current?.style.setProperty('--photo-exit',String(smoothstep(0,.8,t)));
  data.projects.forEach((p,n)=>carousels.current[n]?.setProgress(dialShotProgress(local,1+data.experiences.length+n,count)));
 }}),[still,count,data]);
 function photo(photo:AboutPhoto,centre=false){return <figure className={`dial-print${centre?' dial-print-centre':''}`} data-draft-changed={photo.draftChanged||undefined}><img src={mediaUrl(base,photo.path)} alt={photo.alt} loading="lazy"/><figcaption>{photo.caption}</figcaption></figure>;}
 function introPhotos(){return <div className="dial-photos">{selected[0]?photo(selected[0],true):null}{selected.slice(1).map((p,i)=>{const angle=(-110+i*360/Math.max(1,selected.length-1))*Math.PI/180;return <div className="dial-orbit-photo" key={p.id} style={{'--px':`${50+Math.cos(angle)*34}%`,'--py':`${50+Math.sin(angle)*34}%`,'--tilt':`${i%2?4:-4}deg`} as CSSProperties}>{photo(p)}</div>;})}</div>;}
 function centre(i:number){const step=steps[i];if(step.kind==='background')return introPhotos();if(step.kind==='experience')return step.entry.kind==='education'&&selected[0]?photo(selected[0],true):<div className={`dial-icon${presentEntry(step.entry.dates)?' is-present':''}`}><ExperienceIcon name={step.entry.kind==='education'?'graduation-cap':step.entry.journey_icon??'briefcase'}/></div>;
  return step.project.screenshots.length?<div className="dial-browser"><ScreenshotCarousel ref={h=>{carousels.current[i-1-data.experiences.length]=h;}} shots={step.project.screenshots} name={step.project.name} aspect={screenshotAspect(step.project.slug)} scrub={!still} onSelect={n=>onSeek?.(dialLocal(i,count,step.project.screenshots.length>1?-.25+.5*n/(step.project.screenshots.length-1):0))}/></div>:<div className="dial-empty">{step.project.name}</div>;
 }
 function copy(i:number){const step=steps[i];return <>
  <p className="dial-eyebrow">{step.kind==='background'?'Background':step.kind==='experience'?'Experience':'Selected Work'}</p>
  <h2>{constellationTitle(step.title).map((t,n)=><span key={n} className={t.connector?'dial-connector':undefined}>{t.word}{' '}</span>)}</h2>
  {step.kind==='background'?<><div className="dial-prose"><Markdown text={panel.body??''} disableLinks/></div><a className="dial-link" href="/about">Read my story <span aria-hidden="true">↗</span></a></>:step.kind==='experience'?<><p className="dial-org">{step.entry.org}</p><p className="dial-meta">{[step.entry.dates,step.entry.location].filter(Boolean).join(' · ')}</p><ul className="dial-points">{(step.entry.experience_bullets??[]).map(b=><li key={b.id} data-draft-changed={b.draftChanged||undefined}><Markdown text={b.text}/></li>)}</ul></>:<>
   <p className="dial-tagline">{step.project.tagline}</p>{step.project.highlights?.length?<ul className="dial-points">{step.project.highlights.slice(0,3).map(line=><li key={line}>{line}</li>)}</ul>:null}
   <ul className="dial-tags">{step.project.tags.map(tag=><li key={tag}>{tag}</li>)}</ul>
   <p className="dial-capabilities">{capabilityLinks(step.project.tags).map(label=><a key={label} href="#toolkit">→ {label}</a>)}</p>
   <div className="dial-links">{step.project.url?<a className="dial-link" href={step.project.url} target="_blank" rel="noopener noreferrer">Visit ↗</a>:null}<a className="dial-link" href={projectHref(step.project.slug)}>Case study →</a></div>{i===steps.length-1?<a className="dial-all" href="/projects">All projects →</a>:null}
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
   <p className="dial-coordinate">{coord}</p>{steps.map((step,i)=><div className="dial-centre" key={step.key} ref={el=>{visuals.current[i]=el;}} style={{opacity:i===0?1:0,visibility:i===0?'visible':'hidden'}} inert={i!==active}>{centre(i)}</div>)}
  </div><footer className="dial-corners"><span>London · Hong Kong</span><span>Section 02 / {current.kind==='project'?'Selected Work':current.kind} · {String(active).padStart(2,'0')} / {String(count-1).padStart(2,'0')}</span></footer>
 </div>;
});

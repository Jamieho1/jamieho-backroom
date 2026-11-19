"use client";
import Link from "next/link";
import {useCallback,useEffect,useMemo,useRef,useState} from "react";
import {PrimaryPill} from "@/components/primary-pill";
import {ProjectManageLink} from "@/components/portfolio/manage-link";
import {CAPABILITY_IDS,CAPABILITY_TITLES,capabilityNumbers,capabilitySearch,filterByCapability,parseCapabilityParam,type CapabilityId} from "@/lib/project-capabilities";
import {hostOf,isVolunteer,pad2,type ProjectSummary} from "@/lib/project-view";
import {CONTACT_HREF} from "@/lib/journey/content";
import {FloatingPreview,type PreviewHandle,type PreviewItem} from "./floating-preview";
import {ProjectFrame} from "./project-frame";

const Arrow=({glyph="→"}:{glyph?:string})=><span className="pj-ar" aria-hidden="true"><em className="a1">{glyph}</em><em className="a2">{glyph}</em></span>;
const Chips=({tags}:{tags:string[]})=>tags.length?<span className="chips">{tags.slice(0,4).map(t=><span key={t} className={`chip${isVolunteer(t)?" vol":""}`} tabIndex={0}>{t}</span>)}</span>:null;

/** Reads the filter from the URL after mount (the page itself stays pre-rendered) and keeps the URL in step. */
function useCapabilityParam():[CapabilityId|null,(next:CapabilityId|null)=>void]{
 const [value,setValue]=useState<CapabilityId|null>(null);
 useEffect(()=>{
  const read=()=>setValue(parseCapabilityParam(new URLSearchParams(window.location.search).get("capability")));
  read();window.addEventListener("popstate",read);return()=>window.removeEventListener("popstate",read);
 },[]);
 const set=useCallback((next:CapabilityId|null)=>{
  setValue(next);
  try{window.history.replaceState(window.history.state,"",`${window.location.pathname}${capabilitySearch(next)}${window.location.hash}`);}catch{/* the filter still works without a shareable URL */}
 },[]);
 return [value,set];
}

export function ProjectsIndex({projects}:{projects:ProjectSummary[]}){
 const [capability,setCapability]=useCapabilityParam();
 const total=projects.length;
 const matching=useMemo(()=>new Set(filterByCapability(projects,capability).map(p=>p.id)),[projects,capability]);
 const featured=projects.filter(p=>p.featured);
 const featuredShown=featured.filter(p=>matching.has(p.id));
 const rowsShown=projects.filter(p=>matching.has(p.id)).length;
 // Featured cards fade out first, then leave the grid so the remaining card reflows.
 const [gone,setGone]=useState<Record<string,boolean>>({});
 useEffect(()=>{
  const reduce=typeof matchMedia==="function"&&matchMedia("(prefers-reduced-motion: reduce)").matches;
  const timers=featured.filter(p=>!matching.has(p.id)).map(p=>window.setTimeout(()=>setGone(g=>g[p.id]?g:{...g,[p.id]:true}),reduce?0:420));
  const frame=requestAnimationFrame(()=>setGone(g=>{const next={...g};let changed=false;for(const p of featured)if(matching.has(p.id)&&next[p.id]){delete next[p.id];changed=true;}return changed?next:g;}));
  return()=>{timers.forEach(clearTimeout);cancelAnimationFrame(frame);};
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[matching]);
 // Fit the headline to its container, as the approved design does.
 const heading=useRef<HTMLHeadingElement>(null);
 useEffect(()=>{
  const h1=heading.current;if(!h1)return;
  const fit=()=>{h1.style.fontSize="";if(typeof matchMedia!=="function"||matchMedia("(max-width:640px)").matches)return;const w=h1.clientWidth,sw=h1.scrollWidth;if(sw>w)h1.style.fontSize=`${(parseFloat(getComputedStyle(h1).fontSize)*w/sw*.98).toFixed(1)}px`;};
  fit();window.addEventListener("resize",fit);void document.fonts?.ready.then(fit);return()=>window.removeEventListener("resize",fit);
 },[]);
 const preview=useRef<PreviewHandle>(null);
 const previewItems:PreviewItem[]=projects.map((p,i)=>({key:p.id,name:p.name,tags:p.tags,shot:p.screenshots[0],n:i+1,total}));
 return <div className="pj pj-index">
  <div className="pj-layer pj-dots" aria-hidden="true"/><div className="pj-layer pj-grain" aria-hidden="true"/>
  <div className="pj-wrap">
   <header className="pj-hd">
    <div className="pj-topline"><p className="pj-eyebrow">PROJECTS</p><span className="pj-count">{pad2(total)} PROJECTS</span></div>
    <h1 ref={heading}><span>Selected</span> <span>Work</span></h1>
    <p className="pj-lede">Things I&apos;ve built and shipped, from prototypes to volunteer work.</p>
    <p style={{margin:"18px 0 0"}}><ProjectManageLink/></p>
   </header>
   <div className="pj-filters" role="group" aria-label="Filter projects by capability">
    <button type="button" className="pj-fchip" data-filter="all" aria-pressed={capability===null} onClick={()=>setCapability(null)}>All</button>
    {CAPABILITY_IDS.map(id=><button type="button" key={id} className="pj-fchip" data-filter={id} aria-pressed={capability===id} onClick={()=>setCapability(id)}>{id} {CAPABILITY_TITLES[id]}</button>)}
   </div>
   {featured.length?<section className={`pj-feat pj-co${featuredShown.length?"":" out"}`} aria-labelledby="pj-feat-h" inert={featuredShown.length===0}><div className="in">
    <div className="pj-sec-h"><h2 className="pj-lbl" id="pj-feat-h">Featured</h2></div>
    <div className="pj-fgrid">{featured.map((p,i)=>{const out=!matching.has(p.id),index=projects.indexOf(p);return <article key={p.id} className={`pj-fcard${out?" out":""}`} hidden={!!gone[p.id]} data-slug={p.slug} data-draft-changed={p.draftChanged||undefined} aria-hidden={out||undefined}>
     <ProjectFrame project={p} n={index+1} total={total}/>
     <div className="pj-fb"><span className="pj-num">{pad2(i+1)} / FEATURED</span><h3>{p.name}</h3>{p.tagline?<p className="tl">{p.tagline}</p>:null}{p.status?<p className="pj-status">{p.status}</p>:null}<Chips tags={p.tags}/>
      <div className="pj-acts"><PrimaryPill href={`/projects/${encodeURIComponent(p.slug)}`}>Case study</PrimaryPill>{p.url?<a className="pj-lnk g pj-fx" href={p.url} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${p.name} (${hostOf(p.url)})`}>Visit <Arrow glyph="↗"/></a>:null}</div></div>
    </article>;})}</div>
   </div></section>:null}
   <section className="pj-list" aria-labelledby="pj-all-h">
    <div className="pj-sec-h"><h2 className="pj-lbl" id="pj-all-h">All projects</h2></div>
    <div className="pj-lh" aria-hidden="true"><span>No.</span><span>Project</span><span>Capabilities</span><span>Tags</span><span>-</span></div>
    <ul className="pj-rows" data-count={rowsShown}>{projects.map((p,i)=>{const out=!matching.has(p.id);return <li key={p.id} className={`pj-co${out?" out":""}`} data-slug={p.slug} inert={out}><div className="in">
     <Link className="pj-row pj-fx" href={`/projects/${encodeURIComponent(p.slug)}`} prefetch={false} data-draft-changed={p.draftChanged||undefined}
      onPointerEnter={e=>preview.current?.enter(i,e)} onPointerMove={e=>preview.current?.move(e)} onPointerLeave={()=>preview.current?.leave()}>
      <span className="pj-rn">{pad2(i+1)}</span>
      <span className="pj-rt"><b className="pj-rname">{p.name}</b>{p.tagline?<span className="pj-rtag">{p.tagline}</span>:null}</span>
      <span className="pj-rcap">{capabilityNumbers(p.capabilities)}</span>
      <Chips tags={p.tags}/>
      <Arrow/>
     </Link></div></li>;})}</ul>
    <p className={`pj-empty${rowsShown===0?" show":""}`} role="status" aria-live="polite">{rowsShown===0?"Nothing public here yet.":""}</p>
   </section>
  </div>
  <div className="pj-cta"><h2>Have a project in mind?</h2><PrimaryPill strong href={CONTACT_HREF}>Get in touch</PrimaryPill></div>
  <FloatingPreview ref={preview} items={previewItems}/>
 </div>;
}

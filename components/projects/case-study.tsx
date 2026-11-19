"use client";
import Link from "next/link";
import {useEffect,useMemo,useRef,useState} from "react";
import type {ReactNode} from "react";
import {Markdown} from "@/components/markdown";
import {PrimaryPill} from "@/components/primary-pill";
import {ProjectManageLink} from "@/components/portfolio/manage-link";
import {ScreenshotCarousel} from "@/components/screenshot-carousel";
import {CAPABILITY_TITLES,capabilityNumbers,normalizeCapabilities} from "@/lib/project-capabilities";
import {isHowItWorks,splitCaseBody} from "@/lib/project-sections";
import {hostOf,pad2,type ProjectSummary} from "@/lib/project-view";
import {screenshotAspect} from "@/lib/screenshot-geometry";
import {CONTACT_HREF} from "@/lib/journey/content";
import type {Project} from "@/lib/portfolio-core";
import {FloatingPreview,type PreviewHandle} from "./floating-preview";
import {ProjectDiagram} from "./project-diagram";
import {TitleCard} from "./title-card";

const Arrow=({glyph}:{glyph:string})=><span className="pj-ar" aria-hidden="true"><em className="a1">{glyph}</em><em className="a2">{glyph}</em></span>;

/** The nearest scrolling ancestor (the app page's content pane), or the window. */
function scroller(el:HTMLElement|null):HTMLElement|Window{
 for(let p=el?.parentElement;p;p=p.parentElement){const o=getComputedStyle(p).overflowY;if((o==="auto"||o==="scroll")&&p.scrollHeight>p.clientHeight)return p;}
 return window;
}

/** Sticky mini-index with scroll spy: the active dot follows the section being read. */
function MiniIndex({items}:{items:{id:string;title:string}[]}){
 const [active,setActive]=useState(0);
 const nav=useRef<HTMLElement>(null);
 const key=items.map(i=>i.id).join("|");
 useEffect(()=>{
  const root=scroller(nav.current),top=()=>root instanceof Window?0:root.getBoundingClientRect().top;
  let frame=0;
  const update=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{
   let current=0;items.forEach((item,k)=>{const el=document.getElementById(item.id);if(el&&el.getBoundingClientRect().top-top()<=Math.max(120,innerHeight*.3))current=k;});
   const end=root instanceof Window?innerHeight+scrollY>=document.documentElement.scrollHeight-2:root.scrollTop+root.clientHeight>=root.scrollHeight-2;
   setActive(end?items.length-1:current);
  });};
  update();root.addEventListener("scroll",update,{passive:true});window.addEventListener("resize",update);
  return()=>{cancelAnimationFrame(frame);root.removeEventListener("scroll",update);window.removeEventListener("resize",update);};
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[key]);
 return <nav ref={nav} className="pj-toc" aria-label="On this page"><ol>{items.map((item,i)=><li key={item.id} className={i===active?"on":undefined}><a href={`#${item.id}`} aria-current={i===active?"location":undefined}><b>{pad2(i+1)}</b>{item.title}</a></li>)}</ol></nav>;
}

export function ProjectCaseStudy({project,index,total,next}:{project:Project;index:number;total:number;next?:ProjectSummary&{n:number}|null}){
 const p=project,caps=normalizeCapabilities(p.capabilities),host=p.url?hostOf(p.url):"";
 const body=useMemo(()=>splitCaseBody(p.body),[p.body]);
 const sections:{id:string;title:string;body:string;diagram?:boolean}[]=[...body.sections];
 let hosted=sections.findIndex(s=>isHowItWorks(s.title));
 if(p.diagram&&hosted<0){sections.push({id:"how-it-works",title:"How it works",body:"",diagram:true});hosted=sections.length-1;}
 const preview=useRef<PreviewHandle>(null);
 const hasMeta=!!(p.status||caps.length||p.tags.length||p.url);
 let visual:ReactNode;
 if(p.screenshots.length)visual=<ScreenshotCarousel shots={p.screenshots} name={p.name} aspect={screenshotAspect(p.slug)}/>;
 else visual=<div className="browser-frame"><div className="browser-traffic-lights" aria-hidden="true"><i/><i/><i/></div><div className="pj-screen is-card"><TitleCard n={index} total={total} name={p.name} tags={p.tags}/></div></div>;
 return <article className="pj pj-case project-read" data-draft-changed={p.draftChanged||undefined} data-project={p.slug}>
  <div className="pj-layer pj-dots" aria-hidden="true"/><div className="pj-layer pj-grain" aria-hidden="true"/>
  <div className="pj-wrap">
   <div className="pj-back"><Link className="pj-lnk pj-fx" href="/projects" prefetch={false}><span className="pj-ar" aria-hidden="true"><em className="a1">←</em><em className="a2">←</em></span> All projects</Link><ProjectManageLink slug={p.slug}/></div>
   <header>
    <div className="pj-ey"><p className="pj-eyebrow">CASE STUDY · {pad2(index)}</p><span>{pad2(index)} / {pad2(total)}</span></div>
    <h1>{p.name}</h1>
    {p.tagline?<p className="pj-sub">{p.tagline}</p>:null}
    {p.draftChanged&&!p.public?<p className="pj-draft" role="status">Unpublished in this preview</p>:null}
    {hasMeta?<div className="pj-meta">
     {p.status?<div className="pj-mc" data-slot="status"><h2>Status</h2><div className="v">{p.status}</div></div>:null}
     {caps.length?<div className="pj-mc" data-slot="capabilities"><h2>Capabilities</h2><div className="v">{capabilityNumbers(caps)}<small>{caps.map(c=><span key={c}>{CAPABILITY_TITLES[c]}<br/></span>)}</small></div></div>:null}
     {p.tags.length?<div className="pj-mc stk" data-slot="stack"><h2>Stack</h2><div className="chips">{p.tags.map(t=><span key={t} className="chip" tabIndex={0}>{t}</span>)}</div></div>:null}
     {p.url?<div className="pj-mc" data-slot="links"><h2>Links</h2><div className="v"><a className="pj-lnk g pj-fx" href={p.url} target="_blank" rel="noopener noreferrer">Visit {host||"website"} <Arrow glyph="↗"/></a></div></div>:null}
    </div>:null}
   </header>
   <figure className="pj-vis" style={{marginLeft:0,marginRight:0}} data-visual={p.screenshots.length?"screenshots":"title-card"}>{visual}</figure>
   {body.intro||sections.length?<div className={`pj-body${sections.length?"":" no-index"}`}>
    {sections.length?<MiniIndex items={sections.map(({id,title})=>({id,title}))}/>:null}
    <div className="pj-content">
     {body.intro?<div className="pj-intro"><Markdown text={body.intro}/></div>:null}
     {sections.map((s,i)=><section key={s.id} className="pj-sx" id={s.id} aria-labelledby={`${s.id}-h`}>
      <p className="pj-lbl">{pad2(i+1)}</p><h2 className="pj-h" id={`${s.id}-h`}>{s.title}</h2>
      {s.body?<Markdown text={s.body}/>:null}
      {p.diagram&&i===hosted?<ProjectDiagram diagram={p.diagram}/>:null}
     </section>)}
    </div>
   </div>:null}
  </div>
  {next?<div className="pj-nx-w"><Link className="pj-nx" href={`/projects/${encodeURIComponent(next.slug)}`} prefetch={false} aria-label={`Next project: ${next.name}`} onPointerEnter={e=>preview.current?.enter(0,e)} onPointerMove={e=>preview.current?.move(e)} onPointerLeave={()=>preview.current?.leave()}>
   <span><span className="k">NEXT PROJECT · {pad2(next.n)}</span><h2>{next.name}</h2>{next.tagline?<p>{next.tagline}</p>:null}</span>
   <span className="big-ar" aria-hidden="true"><em className="a1">→</em><em className="a2">→</em></span>
  </Link></div>:null}
  <div className="pj-wrap"><div className="pj-cta"><h2>Have a project in mind?</h2><PrimaryPill strong href={CONTACT_HREF}>Get in touch</PrimaryPill></div></div>
  {next?<FloatingPreview ref={preview} items={[{key:next.id,name:next.name,tags:next.tags,shot:next.screenshots[0],n:next.n,total}]}/>:null}
 </article>;
}

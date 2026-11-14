'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect,useRef,useState,type ReactNode,type CSSProperties} from 'react';
import {useViewer} from '@/components/viewer-provider';
import {SignInButton} from '@/components/sign-in-button';
import {INTERVIEW_SECTIONS,interviewSection,interviewTopics} from '@/lib/interview/navigation';
import {InterviewIcon,type InterviewIconName} from './icons';
export const INTERVIEW_STORAGE={rail:'jb.interview.rail-collapsed.v1',topics:'jb.interview.topics-collapsed.v1'};
function useCollapse(key:string){
 const [collapsed,setCollapsed]=useState(false);
 useEffect(()=>{try{setCollapsed(localStorage.getItem(key)==='true');}catch{/* Browser storage is optional. */}},[key]);
 const toggle=()=>setCollapsed(value=>{const next=!value;try{localStorage.setItem(key,String(next));}catch{/* Keep in-memory controls working. */}return next;});
 return [collapsed,toggle] as const;
}
export function InterviewShell({children}:{children:ReactNode}){
 const path=usePathname();const section=interviewSection(path);const topics=interviewTopics(section.id);const notes=path.includes('/notes');
 const [railCollapsed,toggleRail]=useCollapse(INTERVIEW_STORAGE.rail);const [topicsCollapsed,toggleTopics]=useCollapse(INTERVIEW_STORAGE.topics);
 const [mobile,setMobile]=useState(false);const [drawer,setDrawer]=useState(false);const [topicsOpen,setTopicsOpen]=useState(false);
 const [tip,setTip]=useState<{label:string;x:number;y:number}|null>(null);
 const rail=useRef<HTMLElement>(null);const topicPanel=useRef<HTMLElement>(null);const menuButton=useRef<HTMLButtonElement>(null);const topicsButton=useRef<HTMLButtonElement>(null);
 const {viewer,configured}=useViewer();
 useEffect(()=>{const query=matchMedia('(max-width:768px)');const update=()=>{setMobile(query.matches);setDrawer(false);setTopicsOpen(false);setTip(null);};update();query.addEventListener('change',update);return()=>query.removeEventListener('change',update);},[]);
 useEffect(()=>{setDrawer(false);setTopicsOpen(false);setTip(null);},[path]);
 useEffect(()=>{
  if(!mobile||!drawer)return;
  const links=()=>[...rail.current?.querySelectorAll<HTMLElement>('a[href],button:not(:disabled)')??[]].filter(el=>el.getClientRects().length);
  links()[0]?.focus();
  const key=(event:KeyboardEvent)=>{if(event.key==='Escape'){event.preventDefault();setDrawer(false);requestAnimationFrame(()=>menuButton.current?.focus());}if(event.key==='Tab'){const all=links(),first=all[0],last=all.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}}};
  document.addEventListener('keydown',key);return()=>document.removeEventListener('keydown',key);
 },[mobile,drawer]);
 useEffect(()=>{
  if(!mobile||!topicsOpen)return;topicPanel.current?.querySelector<HTMLElement>('a[href],button')?.focus();
  const close=(event:PointerEvent)=>{if(!topicPanel.current?.contains(event.target as Node)&&!topicsButton.current?.contains(event.target as Node))setTopicsOpen(false);};
  const key=(event:KeyboardEvent)=>{if(event.key==='Escape'){setTopicsOpen(false);topicsButton.current?.focus();}};
  document.addEventListener('pointerdown',close);document.addEventListener('keydown',key);return()=>{document.removeEventListener('pointerdown',close);document.removeEventListener('keydown',key);};
 },[mobile,topicsOpen]);
 useEffect(()=>{if(!tip)return;const dismiss=(event:KeyboardEvent)=>{if(event.key==='Escape')setTip(null);};document.addEventListener('keydown',dismiss);return()=>document.removeEventListener('keydown',dismiss);},[tip]);
 const tooltip=(label:string,node:HTMLElement)=>{if(!railCollapsed||mobile)return;const rect=node.getBoundingClientRect();setTip({label,x:rect.right+10,y:rect.top+rect.height/2});};
 const tipProps=(label:string)=>({onMouseEnter:(e:React.MouseEvent<HTMLElement>)=>tooltip(label,e.currentTarget),onMouseLeave:(e:React.MouseEvent<HTMLElement>)=>{if(document.activeElement!==e.currentTarget)setTip(null);},onFocus:(e:React.FocusEvent<HTMLElement>)=>tooltip(label,e.currentTarget),onBlur:()=>setTip(null),'aria-describedby':tip?.label===label?'iv-tooltip':undefined});
 const iconLabel=(icon:InterviewIconName,label:string,color?:string)=><><span className="iv-icon" style={{color}}><InterviewIcon name={icon}/></span><span className="iv-rail-label">{label}</span></>;
 const closeDrawer=()=>{setDrawer(false);requestAnimationFrame(()=>menuButton.current?.focus());};
 return <div className="iv-shell" data-rail-collapsed={railCollapsed} data-topics-collapsed={topicsCollapsed}>
  <a className="iv-skip" href="#interview-content">Skip to content</a>
  {mobile&&drawer?<button className="iv-backdrop" aria-label="Dismiss interview menu" onClick={closeDrawer}/>:null}
  <aside id="interview-rail" ref={rail} className="iv-rail" data-open={drawer} role={mobile&&drawer?'dialog':undefined} aria-modal={mobile&&drawer?true:undefined} aria-label="Interview menu" inert={mobile&&!drawer}>
   <div className="iv-brand-row"><Link href="/" className="iv-brand" aria-label="Jamie Ho — home" {...tipProps('Jamie Ho — home')}>{iconLabel('brand','Interview')}</Link><button className="iv-mobile-close iv-icon-button" aria-label="Close interview menu" onClick={closeDrawer}><InterviewIcon name="close"/></button></div>
   <button type="button" className="iv-rail-toggle" aria-label={railCollapsed?'Expand section rail':'Collapse section rail'} aria-expanded={!railCollapsed} onClick={()=>{toggleRail();setTip(null);}}><InterviewIcon name={railCollapsed?'expand':'collapse'}/><span className="iv-rail-label">Collapse rail</span></button>
   <nav className="iv-sections" aria-label="Interview sections">{[null,'Interview Skills','Career','Tools'].map(group=><div className="iv-group" key={group??'start'}>{group?<h2>{group}</h2>:null}{INTERVIEW_SECTIONS.filter(item=>item.group===group).map(item=><Link key={item.id} prefetch={false} href={item.href} className="iv-section-link" aria-label={item.label} aria-current={section.id===item.id?'page':undefined} {...tipProps(item.label)}>{iconLabel(item.id,item.label,item.color)}</Link>)}</div>)}</nav>
   <div className="iv-rail-bottom"><button type="button" className="iv-section-link" aria-label="Feedback — coming soon" {...tipProps('Feedback — coming soon')} onClick={()=>{}}>{iconLabel('feedback','Feedback')}<span className="iv-rail-label iv-mini-soon">Soon</span></button><Link href="/" className="iv-section-link" aria-label="Back to site" {...tipProps('Back to site')}>{iconLabel('back','Back to site')}</Link>
    <div className="iv-account">{viewer.status==='member'||viewer.status==='owner'?<><span className="iv-account-name iv-rail-label">{viewer.name??'Your account'}</span><form action="/auth/signout" method="post"><button type="submit" className="iv-section-link" aria-label="Sign out" {...tipProps('Sign out')}>{iconLabel('account','Sign out')}</button></form></>:viewer.status==='loading'?<span className="iv-section-link" role="status">{iconLabel('account','Checking account…')}</span>:<span {...tipProps('Sign in')} className="iv-signin" aria-label="Sign in">{configured?<SignInButton label="Sign in" next={path} className="iv-signin-button"/>:<button className="iv-signin-button" disabled>Sign in</button>}<span className="iv-signin-icon"><InterviewIcon name="account"/></span></span>}</div>
   </div>
  </aside>
  <aside id="interview-topics" ref={topicPanel} className="iv-topics" data-open={topicsOpen} inert={mobile&&drawer} aria-label="Topic list">
   <header><div><span className="iv-overline">Explore</span><h2>{section.label}</h2></div><button className="iv-icon-button iv-topic-collapse" aria-label="Collapse topics" aria-expanded="true" onClick={toggleTopics}><InterviewIcon name="collapse"/></button><button className="iv-icon-button iv-mobile-close" aria-label="Close topics" onClick={()=>{setTopicsOpen(false);topicsButton.current?.focus();}}><InterviewIcon name="close"/></button></header>
   {['dsa','system-design','low-level-design'].includes(section.id)?notes&&section.id!=='dsa'?<span className="iv-mode-link" aria-disabled="true">Practice · No practice questions yet</span>:<Link className="iv-mode-link" href={path.replace(/\/(practice|notes)(?=\/|$)/,notes?'/practice':'/notes')} prefetch={false}>{notes?'Practice':'Notes'}</Link>:null}
   <nav aria-label="Topics">{topics.length?topics.map(topic=><Link key={topic.id} prefetch={false} href={`/interview/${section.id}/${notes?'notes':'practice'}/${topic.id}`} aria-current={path.endsWith('/'+topic.id)?'page':undefined}><span className="iv-icon" style={{color:topic.dot} as CSSProperties}><InterviewIcon name={topic.id}/></span><span>{topic.label}</span></Link>):<p className="iv-empty-topics">{section.id==='dashboard'?'Choose an Interview Skills section to explore its topics.':'Topics are coming soon.'}</p>}</nav>
  </aside>
  <section className="iv-workspace" aria-label="Interview workspace" inert={mobile&&drawer}>
   <div className="iv-mobile-toolbar"><button ref={menuButton} className="iv-toolbar-button" aria-label="Open interview menu" aria-controls="interview-rail" aria-expanded={drawer} onClick={()=>{setTopicsOpen(false);setDrawer(true);}}><InterviewIcon name="menu"/>Menu</button><button ref={topicsButton} className="iv-toolbar-button" aria-controls="interview-topics" aria-expanded={topicsOpen} onClick={()=>setTopicsOpen(value=>!value)}>Topics <span aria-hidden="true">▾</span></button></div>
   <div className="iv-content-toolbar">{topicsCollapsed?<button className="iv-toolbar-button iv-expand-topics" aria-controls="interview-topics" aria-expanded="false" onClick={toggleTopics}><InterviewIcon name="topics"/>Expand topics</button>:null}<span>{section.id==='dashboard'?'Your preparation space':section.label}</span></div>
   <main id="interview-content" tabIndex={-1}>{children}</main>
  </section>
  {tip&&!mobile&&railCollapsed?<div id="iv-tooltip" className="iv-tooltip" role="tooltip" style={{left:tip.x,top:tip.y}}>{tip.label}</div>:null}
 </div>;
}

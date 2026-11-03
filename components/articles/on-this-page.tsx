'use client';
import {useEffect,useLayoutEffect,useRef,useState} from 'react';

/** The nearest scrolling ancestor (the desktop window's content pane), or the page itself. */
function scroller(el:HTMLElement|null):HTMLElement|Window{
 for(let p=el?.parentElement;p;p=p.parentElement){const o=getComputedStyle(p).overflowY;if((o==='auto'||o==='scroll')&&p.scrollHeight>p.clientHeight)return p;}
 return window;
}
const OFFSET=96;

/**
 * "On this page": the article's sections on the right. A bar slides to the section being read; it always sits
 * exactly beside one item (never between two), and clicking an item scrolls there smoothly.
 */
export function OnThisPage({sections,topId}:{sections:{id:string;text:string}[];topId:string}){
 const items=[{id:topId,text:'Overview'},...sections];
 const [active,setActive]=useState(0);
 const nav=useRef<HTMLElement>(null);const links=useRef<(HTMLAnchorElement|null)[]>([]);
 const [bar,setBar]=useState<{top:number;height:number}|null>(null);

 useEffect(()=>{
  const root=scroller(nav.current);
  const top=()=>root instanceof Window?0:root.getBoundingClientRect().top;
  let frame=0;
  const update=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{
   let i=0;
   items.forEach((it,k)=>{const el=document.getElementById(it.id);if(el&&el.getBoundingClientRect().top-top()<=OFFSET)i=k;});
   const end=root instanceof Window?innerHeight+scrollY>=document.documentElement.scrollHeight-2:root.scrollTop+root.clientHeight>=root.scrollHeight-2;
   setActive(end?items.length-1:i);
  });};
  update();root.addEventListener('scroll',update,{passive:true});addEventListener('resize',update);
  return()=>{cancelAnimationFrame(frame);root.removeEventListener('scroll',update);removeEventListener('resize',update);};
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[sections.map(s=>s.id).join('|'),topId]);

 useLayoutEffect(()=>{const a=links.current[active];if(a)setBar({top:a.offsetTop,height:a.offsetHeight});},[active,sections.length]);

 if(!sections.length)return null;
 return <nav ref={nav} className="on-this-page" aria-label="On this page">
  <p>On this page</p>
  <div className="on-this-page-list">
   {bar?<span className="on-this-page-bar" aria-hidden="true" style={{transform:`translateY(${bar.top}px)`,height:bar.height}} />:null}
   {items.map((it,k)=><a key={it.id} ref={el=>{links.current[k]=el;}} href={`#${it.id}`} aria-current={k===active?'location':undefined}
     onClick={e=>{e.preventDefault();document.getElementById(it.id)?.scrollIntoView({behavior:'smooth',block:'start'});history.replaceState(null,'',`#${it.id}`);setActive(k);}}>{it.text}</a>)}
  </div>
 </nav>;
}

"use client";
import Link from 'next/link';
import {useEffect,useRef} from 'react';
import {DESKTOP_INTRODUCTION_COPY} from '@/lib/desktop-introduction';

/** Copy and arrow are independent of the image/renderer. */
export function DesktopIntroductionCue({label=DESKTOP_INTRODUCTION_COPY.invitation}:{label?:string}){
 const cue=useRef<HTMLAnchorElement>(null);
 useEffect(()=>{
  const el=cue.current,desktop=el?.closest('.desktop-os'),target=desktop?.querySelector<HTMLAnchorElement>('a[data-desktop-app="home"]');if(!el||!target)return;
  const place=()=>{const parent=el.parentElement!.getBoundingClientRect(),app=target.getBoundingClientRect();el.style.left=Math.max(8,Math.min(parent.width-el.offsetWidth-8,app.left+app.width*.5-parent.left-22))+'px'};
  place();if(typeof ResizeObserver==='undefined')return;const observer=new ResizeObserver(place);observer.observe(target);observer.observe(el.parentElement!);return()=>observer.disconnect();
 },[label]);
 return <Link ref={cue} prefetch={false} href="/#pivot" className="desktop-introduction-cue" aria-label={`${label}: open About Me`}>
  <svg viewBox="0 0 36 38" aria-hidden="true"><path d="M32 33C9 36 12 18 19 7M12 10L20 4L25 13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
  <span>{label}</span>
 </Link>;
}

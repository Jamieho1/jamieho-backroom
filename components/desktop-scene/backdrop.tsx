"use client";

import {useEffect,useRef,useState} from 'react';
import type {DesktopSceneController} from './runtime';
import {DESKTOP_WIDE_FIT} from './assets';

/** A still paints immediately. Graphics are deferred and never mount behind an app. */
export function DesktopBackdrop({covered}:{covered:boolean}){
 const root=useRef<HTMLDivElement>(null),frame=useRef<HTMLDivElement>(null),host=useRef<HTMLDivElement>(null),wide=useRef<HTMLDivElement>(null);
 const control=useRef<DesktopSceneController|null>(null),savedTime=useRef(0),nightRef=useRef(false);
 const [night,setNight]=useState(false),[reduced,setReduced]=useState(true),[enhanced,setEnhanced]=useState(false),[paused,setPaused]=useState(false),[unavailable,setUnavailable]=useState(false);
 const [phase,setPhase]=useState('still');
 useEffect(()=>{
  if(!window.matchMedia)return;
  const scheme=matchMedia('(prefers-color-scheme: dark)'),motion=matchMedia('(prefers-reduced-motion: reduce)');
  const sync=()=>{const value=document.documentElement.dataset.theme;const dark=value==='dark'||(!value&&scheme.matches);nightRef.current=dark;setNight(dark);setReduced(motion.matches)};
  sync();setEnhanced(true);scheme.addEventListener('change',sync);motion.addEventListener('change',sync);
  const observer=new MutationObserver(sync);observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  return()=>{scheme.removeEventListener('change',sync);motion.removeEventListener('change',sync);observer.disconnect()};
 },[]);
 useEffect(()=>{void control.current?.setNight(night)},[night]);
 useEffect(()=>{
  const el=root.current,art=frame.current;if(!el||!art)return;
  const resize=()=>{const {width:w,height:h}=el.getBoundingClientRect();if(!w||!h)return;const ratio=1672/941,contain=true;const width=Math.min(w,h*ratio),height=width/ratio;art.style.width=width+'px';art.style.height=height+'px';art.style.left=(w-width)/2+'px';art.style.top=(h-height)/2+'px';el.dataset.composition=contain?'contain':'cover';
   // The wide art continues the picture either side of the frame, lined up pixel for pixel (no blurred strips).
   const side=wide.current;if(side){side.style.width=width*DESKTOP_WIDE_FIT.width+'px';side.style.height=height+'px';side.style.left=(w-width)/2-width*DESKTOP_WIDE_FIT.left+'px';side.style.top=(h-height)/2+'px'}};
  resize();if(typeof ResizeObserver==='undefined'){window.addEventListener('resize',resize);return()=>window.removeEventListener('resize',resize)}
  const observer=new ResizeObserver(resize);observer.observe(el);return()=>observer.disconnect();
 },[]);
 useEffect(()=>{
  setPhase('still');if(covered||!enhanced||reduced||paused||unavailable)return;
  const node=host.current;if(!node||node.getBoundingClientRect().width<1)return;
  let cancelled=false,idle:number|undefined,instance:DesktopSceneController|undefined;
  const release=()=>{if(cancelled)return;cancelled=true;clearTimeout(delay);if(idle!==undefined)window.cancelIdleCallback(idle);if(instance){savedTime.current=instance.getTime();instance.dispose();if(control.current===instance)control.current=null;instance=undefined}};
  const start=()=>{if(cancelled)return;setPhase('loading');import('./runtime').then(({mountDesktopScene})=>{
   if(cancelled)return;instance=mountDesktopScene(node,{night:nightRef.current,initialTime:savedTime.current,onReady:()=>{if(!cancelled)setPhase('ready')},onLoading:()=>{if(!cancelled)setPhase('loading')},onFallback:reason=>{if(!cancelled){setPhase('still');if(reason==='unavailable')setUnavailable(true)}}});control.current=instance;
  }).catch(()=>{if(!cancelled){setUnavailable(true);setPhase('still')}})};
  const delay=window.setTimeout(()=>{if('requestIdleCallback' in window)idle=window.requestIdleCallback(start,{timeout:1000});else start()},250);
  const desktop=node.closest('.desktop-os');
  const leaving=(event:Event)=>{const click=event as MouseEvent;if(click.button!==0||click.metaKey||click.ctrlKey||click.shiftKey||click.altKey)return;const link=(event.target as Element).closest<HTMLAnchorElement>('a[href]');if(!link||link.target==='_blank'||link.hasAttribute('download'))return;const next=new URL(link.href,location.href);if(next.origin===location.origin&&next.pathname!==location.pathname){release();setPhase('still')}};
  desktop?.addEventListener('click',leaving,true);
  return()=>{desktop?.removeEventListener('click',leaving,true);release()};
 },[covered,enhanced,reduced,paused,unavailable]);
 return <>
  <div className="desktop-backdrop" ref={root} data-scene={unavailable?'unavailable':phase} data-night={night} aria-hidden="true">
   <div className="desktop-ambient" />
   <div className="desktop-wide" ref={wide} />
   <div className="desktop-art-frame" ref={frame}><div className="desktop-poster"/><div className="desktop-canvas" ref={host}/></div>
  </div>
  {!covered&&<div className="desktop-intro-tools">
   {enhanced&&!reduced&&!unavailable?<button type="button" className="desktop-motion" aria-label={paused?'Enable desktop motion':'Pause desktop motion'} aria-pressed={!paused} onClick={()=>setPaused(!paused)}>{paused?'◯':'◉'} Motion {paused?'off':'on'}</button>:<span className="desktop-motion-label">Still view</span>}
   <a className="desktop-intro-privacy" href="/privacy">Privacy</a>
  </div>}
 </>;
}

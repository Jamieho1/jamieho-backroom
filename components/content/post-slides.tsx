'use client';
import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {stepSlide} from '@/lib/post-view';

const FOCUSABLE='button:not([disabled]),[href],[tabindex]:not([tabindex="-1"])';

/** The carousel as a horizontal swipeable strip of 4:5 images. A click opens the viewer: a modal dialog with arrow keys, a focus trap and Escape, which returns focus to the slide that was opened. */
export function PostSlides({slides,title}:{slides:string[];title:string}){
 const [open,setOpen]=useState<number|null>(null);
 const opener=useRef<HTMLElement|null>(null);
 if(!slides.length)return null;
 return <section className="post-slides" aria-label="Carousel slides">
  <ul className="post-strip">{slides.map((src,i)=><li key={`${i}-${src}`}>
   <button type="button" className="post-slide" aria-haspopup="dialog" aria-label={`Open slide ${i+1} of ${slides.length}`} onClick={e=>{opener.current=e.currentTarget;setOpen(i);}}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={src} alt="" loading="lazy" referrerPolicy="no-referrer" draggable={false}/>
    <span className="post-slide-n" aria-hidden="true">{i+1}/{slides.length}</span>
   </button></li>)}</ul>
  {open!==null?<SlideViewer slides={slides} title={title} index={open} setIndex={setOpen} onClose={()=>setOpen(null)} opener={opener}/>:null}
 </section>;
}

function SlideViewer({slides,title,index,setIndex,onClose,opener}:{slides:string[];title:string;index:number;setIndex:(n:number)=>void;onClose:()=>void;opener:{current:HTMLElement|null}}){
 const box=useRef<HTMLDivElement>(null);
 const state=useRef({index,onClose,setIndex,count:slides.length});
 state.current={index,onClose,setIndex,count:slides.length};
 useEffect(()=>{
  const back=opener.current??(document.activeElement as HTMLElement|null);
  box.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus();
  const keys=(e:KeyboardEvent)=>{
   const s=state.current;
   if(e.key==='Escape'){e.preventDefault();s.onClose();}
   else if(e.key==='ArrowRight'){e.preventDefault();s.setIndex(stepSlide(s.index,1,s.count));}
   else if(e.key==='ArrowLeft'){e.preventDefault();s.setIndex(stepSlide(s.index,-1,s.count));}
   else if(e.key==='Tab'&&box.current){
    const items=[...box.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
    if(!items.length)return;
    const first=items[0],last=items[items.length-1],at=document.activeElement;
    if(!box.current.contains(at)){e.preventDefault();first.focus();}
    else if(e.shiftKey&&at===first){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&at===last){e.preventDefault();first.focus();}
   }
  };
  document.addEventListener('keydown',keys);
  return()=>{document.removeEventListener('keydown',keys);if(back&&back.isConnected)back.focus();};
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[]);
 const n=slides.length;
 return createPortal(<div className="post-viewer" role="dialog" aria-modal="true" aria-label={`${title}: carousel slides`} ref={box}>
  <div className="post-viewer-bg" onClick={onClose} aria-hidden="true"/>
  <button type="button" className="post-viewer-close" data-autofocus aria-label="Close slide viewer" onClick={onClose}>&times;</button>
  <div className="post-viewer-stage">
   <button type="button" className="post-viewer-nav" aria-label="Previous slide" onClick={()=>setIndex(stepSlide(index,-1,n))}>&#8249;</button>
   {/* eslint-disable-next-line @next/next/no-img-element */}
   <img className="post-viewer-img" src={slides[index]} alt={`Slide ${index+1} of ${n}`} referrerPolicy="no-referrer"/>
   <button type="button" className="post-viewer-nav" aria-label="Next slide" onClick={()=>setIndex(stepSlide(index,1,n))}>&#8250;</button>
  </div>
  <p className="post-viewer-count" aria-live="polite">{index+1} / {n}</p>
 </div>,document.body);
}

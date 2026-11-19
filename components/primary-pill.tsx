"use client";
import {useEffect,useRef} from "react";
import type {AnchorHTMLAttributes,ButtonHTMLAttributes,RefObject} from "react";
import {gsap} from "gsap";
/** One motion contract for primary links across Home, Story and project pages. */
export function PrimaryPill({children,strong=false,className="",...props}:AnchorHTMLAttributes<HTMLAnchorElement>&{strong?:boolean}){
 const ref=useRef<HTMLAnchorElement>(null);
 usePrimaryMotion(ref,strong);
 return <a {...props} ref={ref} className={`primary-pill ${strong?"primary-strong":""} ${className}`}><span className="primary-label">{children}</span><span className="primary-arrow" aria-hidden="true">{props.target==="_blank"?"↗":"→"}</span></a>;
}

function usePrimaryMotion<T extends HTMLElement>(ref:RefObject<T|null>,strong:boolean){
 useEffect(()=>{const node=ref.current;if(!node||typeof window.matchMedia!=="function"||typeof IntersectionObserver==="undefined")return;const media=window.matchMedia("(prefers-reduced-motion: reduce)");const ctx=gsap.context(()=>{});let x:ReturnType<typeof gsap.quickTo>|undefined,y:ReturnType<typeof gsap.quickTo>|undefined;
 const setup=()=>{ctx.revert();if(media.matches){gsap.set(node,{clearProps:"transform"});x=y=undefined;return;}ctx.add(()=>{x=gsap.quickTo(node,"x",{duration:.45,ease:"power3.out"});y=gsap.quickTo(node,"y",{duration:.45,ease:"power3.out"});});};setup();
 const enter=()=>{if(!media.matches)ctx.add(()=>{gsap.timeline().to(node,{scale:1.03,duration:.3,ease:"power2.out"}).fromTo(node.querySelector(".primary-arrow"),{x:0,opacity:1},{x:10,opacity:0,duration:.12}).fromTo(node.querySelector(".primary-arrow"),{x:-10,opacity:0},{x:0,opacity:1,duration:.2});});};
 const move=(event:PointerEvent)=>{if(media.matches||event.pointerType!=="mouse"||document.activeElement===node)return;const rect=node.getBoundingClientRect(),limit=strong?12:8;const dx=((event.clientX-rect.left)/rect.width-.5)*limit*2,dy=((event.clientY-rect.top)/rect.height-.5)*limit*1.2,factor=Math.min(1,limit/(Math.hypot(dx,dy)||1));x?.(dx*factor);y?.(dy*factor);};
 const reset=()=>{x?.(0);y?.(0);if(!media.matches)ctx.add(()=>{gsap.to(node,{scale:document.activeElement===node?1.03:1,duration:.45,ease:"power3.out"});});};
 const focus=()=>{x?.(0);y?.(0);if(!media.matches)ctx.add(()=>{gsap.killTweensOf([node,node.querySelector(".primary-arrow")]);gsap.set(node,{x:0,y:0,scale:1.03});gsap.set(node.querySelector(".primary-arrow"),{x:0,opacity:1});});};
 const observer=new IntersectionObserver(entries=>node.classList.toggle("primary-in-view",entries.some(e=>e.isIntersecting)));observer.observe(node);node.addEventListener("pointerenter",enter);node.addEventListener("pointermove",move);node.addEventListener("pointerleave",reset);node.addEventListener("focus",focus);node.addEventListener("blur",reset);media.addEventListener("change",setup);
 return()=>{observer.disconnect();node.removeEventListener("pointerenter",enter);node.removeEventListener("pointermove",move);node.removeEventListener("pointerleave",reset);node.removeEventListener("focus",focus);node.removeEventListener("blur",reset);media.removeEventListener("change",setup);ctx.revert();};},[strong]);
}
export function PrimaryButton({children,className="",...props}:ButtonHTMLAttributes<HTMLButtonElement>){const ref=useRef<HTMLButtonElement>(null);usePrimaryMotion(ref,false);return <button {...props} ref={ref} className={`primary-pill ${className}`}><span className="primary-label">{children}</span><span className="primary-arrow" aria-hidden="true">→</span></button>;}

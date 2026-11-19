"use client";
import {useActionState,useEffect,useId,useRef,useState} from "react";
import {BUDGETS,CONTACT_LIMITS,REASONS,NEEDS,TIMELINES,contactErrors,readContact,type ContactResult} from "@/lib/contact-fields";
import {PrimaryButton} from "./primary-pill";
type Action=(prev:ContactResult|null,form:FormData)=>Promise<ContactResult>;
export function ContactForm({action:send}:{action:Action}){
 const [state,action,pending]=useActionState(send,null);const [reason,setReason]=useState("");const [errors,setErrors]=useState<Record<string,string>>({});
 const [fields,setFields]=useState({name:"",email:"",need:""});const [selected,setSelected]=useState<Record<string,string[]>>({});
 const [phase,setPhase]=useState("form");const [email,setEmail]=useState("");const form=useRef<HTMLFormElement>(null);const done=useRef<HTMLDivElement>(null);const uid=useId();const project=reason==="project";const total=project?6:3;
 useEffect(()=>{if(!state?.ok)return;const reduced=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;setPhase(reduced?"sent":"folding");const timer=setTimeout(()=>{setPhase("sent");done.current?.focus({preventScroll:true});},reduced?0:500);return()=>clearTimeout(timer);},[state]);
 const clear=(key:string)=>setErrors(old=>{const next={...old};delete next[key];return next;});
 const error=(key:string)=>errors[key]?<p className="brief-error" id={`${uid}-${key}`} role="alert">// {errors[key]}</p>:null;
 const step=(n:number)=> <i aria-label={`Step ${n} of ${total}`}>{String(n).padStart(2,"0")} / {String(total).padStart(2,"0")}</i>;
 function choices(name:string,values:readonly string[]|Record<string,string>,multi=false){return <div className="brief-chips">{(Array.isArray(values)?values.map(v=>[v,v]):Object.entries(values)).map(([v,label])=><label className="brief-chip" key={v}><input type={multi?"checkbox":"radio"} name={name} value={v} required={!multi} checked={name==="reason"?reason===v:(selected[name]??[]).includes(v)} aria-invalid={!!errors[name]} onChange={event=>{clear(name);setSelected(old=>({...old,[name]:multi?(event.target.checked?[...(old[name]??[]),v]:(old[name]??[]).filter(x=>x!==v)):[v]}));if(name==="reason"){setReason(v);setErrors({});}}}/><span><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 6.5l2.6 2.6L10 3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>{label}</span></label>)}</div>}
 return <div className={`brief-card ${phase}`}>
 <form ref={form} action={action} className="contact-form brief-form" aria-label="Contact" noValidate hidden={phase==="sent"} onSubmit={e=>{const values=readContact(new FormData(e.currentTarget));const found=contactErrors(values);setErrors(found);if(Object.keys(found).length){e.preventDefault();const key=Object.keys(found)[0];e.currentTarget.querySelector<HTMLElement>(`[name="${key}"]`)?.focus();return;}setEmail(values.email);}}>
  <div className="brief-card-head"><span>BRIEF</span><span>{total} STEPS</span></div>
  <fieldset aria-describedby={`${uid}-reason`}><legend>Why are you getting in touch? {step(1)}</legend>{choices("reason",REASONS)}{error("reason")}</fieldset>
  <div className={`brief-project ${project?"is-open":""}`} aria-hidden={!project}><div>
   <fieldset disabled={!project} aria-describedby={`${uid}-needs`} aria-required="true"><legend>What do you need? {step(2)}</legend>{choices("needs",NEEDS,true)}{error("needs")}</fieldset>
   <fieldset disabled={!project} aria-describedby={`${uid}-budget`}><legend>Budget {step(3)}</legend>{choices("budget",BUDGETS)}{error("budget")}</fieldset>
   <fieldset disabled={!project} aria-describedby={`${uid}-timeline`}><legend>Timeline {step(4)}</legend>{choices("timeline",TIMELINES)}{error("timeline")}</fieldset>
  </div></div>
  <fieldset aria-describedby={`${uid}-need`}><legend><label htmlFor={`${uid}-message`}>Tell me about it (optional)</label> {step(project?5:2)}</legend><div className="brief-field"><textarea id={`${uid}-message`} name="need" rows={4} value={fields.need} maxLength={CONTACT_LIMITS.need} placeholder="What are you building, and where are you stuck?" onChange={e=>{setFields(old=>({...old,need:e.target.value}));clear("need");}}/></div>{error("need")}</fieldset>
  <fieldset className="brief-details"><legend>Your details {step(total)}</legend><div className="brief-two">{(["name","email"] as const).map(name=><div className="brief-field" key={name}><input id={`${uid}-${name}-input`} name={name} type={name==="email"?"email":"text"} autoComplete={name} required maxLength={CONTACT_LIMITS[name]} placeholder=" " value={fields[name]} aria-invalid={!!errors[name]} aria-describedby={`${uid}-${name}`} onChange={e=>{setFields(old=>({...old,[name]:e.target.value}));clear(name);}}/><label htmlFor={`${uid}-${name}-input`}>{name==="name"?"Name":"Email"}</label>{error(name)}</div>)}</div></fieldset>
  <div className="hp" aria-hidden="true"><label>Website <input name="website" tabIndex={-1} autoComplete="off"/></label></div>
  <PrimaryButton type="submit" disabled={pending}>{pending?"Sending…":state&&!state.ok?"Try again":"Send brief"}</PrimaryButton>
  {state&&!state.ok?<p role="alert" className="brief-error">{state.message}</p>:null}
  <p className="brief-fine">Your name, email and brief details are stored so I can reply. <a href="/privacy">Privacy policy</a>.</p>
 </form>
 {phase==="sent"?<div ref={done} tabIndex={-1} className="brief-done" role="status" aria-live="polite"><svg viewBox="0 0 96 96" aria-hidden="true"><circle className="ring" cx="48" cy="48" r="28" transform="rotate(-90 48 48)"/><path className="tick" d="M36 49l9 9 17-19"/></svg><h3>Brief sent.</h3><p>I’ll reply to <b>{email}</b>.</p><p>{state?.message}</p><button className="brief-again" type="button" onClick={()=>{setPhase("form");setReason("");setSelected({});setFields({name:"",email:"",need:""});setErrors({});requestAnimationFrame(()=>{form.current?.reset();form.current?.querySelector<HTMLInputElement>('input[name="reason"]')?.focus();});}}>Send another</button></div>:null}
 </div>;
}

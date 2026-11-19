"use client";
import {ContactForm} from "@/components/contact-form";
import {sendMessage} from "@/app/actions/contact";
import type {SocialLink} from "@/lib/social";
export function ContactBrief({socials=[],emailHref,draftChanged=false}:{socials?:SocialLink[];emailHref?:string;draftChanged?:boolean}){
 const linkedin=socials.find(s=>s.kind==="linkedin")?.href;
 return <section id="contact" className="contact-brief" aria-label="Contact" data-draft-changed={draftChanged||undefined}>
 <span id="home-contact" className="brief-anchor"/><span id="screen" className="brief-anchor"/><span id="desk" className="brief-anchor"/>
 <div className="brief-dots" aria-hidden="true"/><div className="brief-grain" aria-hidden="true"/>
 <header className="brief-opening"><p className="brief-eyebrow">CONTACT</p><h2 className="brief-heading">Have a project in mind?</h2></header><div className="brief-wrap"><div className="brief-left"><p className="brief-lede">Tell me what you need and I'll get back to you.</p>
 <ul className="brief-links">{<li><a href={emailHref??"#contact-form"} data-contact-jump={!emailHref||undefined}><span>Email</span><span aria-hidden="true">→</span></a></li>}{linkedin?<li><a href={linkedin} target="_blank" rel="noopener noreferrer"><span>LinkedIn</span><span aria-hidden="true">↗</span></a></li>:null}<li><a href="#contact-form" data-contact-jump><span>Schedule a call</span><span aria-hidden="true">→</span></a></li></ul>
 <div className="brief-next"><h3>What happens next</h3><ol>{["Send a short brief","I reply by email","A short call to scope it"].map((s,i)=><li key={s}><b>{String(i+1).padStart(2,"0")}</b>{s}</li>)}</ol></div><p className="brief-meta">LONDON · HONG KONG</p></div>
 <div id="contact-form"><ContactForm action={sendMessage}/></div></div></section>;
}

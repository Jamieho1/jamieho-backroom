"use client";
import {useActionState,useEffect,useId,useRef,useState,type ButtonHTMLAttributes} from 'react';
import {createPortal} from 'react-dom';
import {sendFeedback} from '@/app/actions/contact';
import {FEEDBACK_MESSAGE_LIMIT,FEEDBACK_LABELS,PAGE_LIMIT,type FeedbackResult} from '@/lib/feedback';
type FeedbackAction=(previous:FeedbackResult|null,form:FormData)=>Promise<FeedbackResult>;
type Props=Omit<ButtonHTMLAttributes<HTMLButtonElement>,'onClick'> & {dark?:boolean;onOpen?:()=>void;onDialogClose?:()=>void};
export function FeedbackButton({dark=false,onOpen,onDialogClose,children,...props}:Props){
 const [open,setOpen]=useState(false);const [page,setPage]=useState('');const trigger=useRef<HTMLButtonElement>(null);
 const close=()=>{setOpen(false);requestAnimationFrame(()=>{if(onDialogClose)onDialogClose();else trigger.current?.focus();});};
 return <><button {...props} ref={trigger} type="button" aria-haspopup="dialog" aria-label="Report a problem / Suggest an idea" title="Report a problem / Suggest an idea" onClick={()=>{setPage(window.location.pathname+window.location.hash);setOpen(true);onOpen?.();}}>{children??<FeedbackIcon/>}</button>{open?createPortal(<FeedbackDialog dark={dark} page={page} onClose={close}/>,document.body):null}</>;
}
function FeedbackIcon(){return <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 4h16v12H9l-5 4ZM8 8h8M8 12h5"/></svg>;}
export function FeedbackDialog({dark=false,page,onClose,action=sendFeedback}:{dark?:boolean;page:string;onClose:()=>void;action?:FeedbackAction}){
 const id=useId();const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const node=ref.current;if(!node)return;node.showModal();node.querySelector<HTMLSelectElement>('select')?.focus();return()=>{if(node.open)node.close();};},[]);
 return <dialog ref={ref} className={'feedback-dialog'+(dark?' is-dark':'')} aria-labelledby={id+'-title'} aria-describedby={id+'-description'} onCancel={event=>{event.preventDefault();onClose();}} onClose={onClose} onClick={event=>{if(event.target!==event.currentTarget)return;const r=event.currentTarget.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)onClose();}}>
 <header><h2 id={id+'-title'}>Report a problem / Suggest an idea</h2><button type="button" className="feedback-close" aria-label="Close feedback" onClick={onClose}>×</button></header><p id={id+'-description'}>Help improve the site. No name or email is needed.</p><FeedbackForm page={page} action={action}/>
 </dialog>;
}
export function FeedbackForm({page,action:send}:{page:string;action:FeedbackAction}){
 const [state,action,pending]=useActionState(send,null);const success=useRef<HTMLParagraphElement>(null);
 const [values,setValues]=useState({type:"problem",message:"",page});
 const patch=(field:keyof typeof values,value:string)=>setValues(previous=>({...previous,[field]:value}));
 useEffect(()=>{if(state?.ok)success.current?.focus();},[state?.ok]);
 if(state?.ok)return <p ref={success} tabIndex={-1} role="status">{state.message}</p>;
 // React resets action forms after responses; retain controlled fields until success/close.
 return <form action={action} onReset={event=>event.preventDefault()} aria-label="Website feedback"><fieldset disabled={pending}><label>Type<select name="type" required value={values.type} onChange={event=>patch("type",event.target.value)}><option value="problem">{FEEDBACK_LABELS.problem}</option><option value="idea">{FEEDBACK_LABELS.idea}</option></select></label><label>Message<textarea name="message" required rows={5} maxLength={FEEDBACK_MESSAGE_LIMIT} value={values.message} onChange={event=>patch("message",event.target.value)}/></label><label>Page (optional)<input name="page" maxLength={PAGE_LIMIT} value={values.page} onChange={event=>patch("page",event.target.value)}/></label><small>Local page path only; query parameters are omitted.</small><div className="feedback-hp" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off"/></label></div><button type="submit" className="feedback-submit">{pending?'Sending…':state?'Try again':'Send feedback'}</button></fieldset>{state&&!state.ok?<p role="alert">{state.message}</p>:null}<p className="feedback-privacy">Your message and page link are saved for review. <a href="/privacy">Privacy policy</a>.</p></form>;
}

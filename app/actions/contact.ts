"use server";
import {headers} from 'next/headers';
import {revalidatePath} from 'next/cache';
import {createClient} from '@supabase/supabase-js';
import {readSupabaseEnv} from '@/lib/env';
import {alertText,clientIp,hashIp,readContact,validateContact,type ContactInput,type ContactResult} from '@/lib/contact';
import {readFeedback,validateFeedback,feedbackAlert,FEEDBACK_LABELS,type FeedbackInput,type FeedbackResult} from '@/lib/feedback';
import {sendAlert} from '@/lib/resend';
const SAVED="Thanks, your message is in. I'll reply by email.";
const FEEDBACK_SAVED='Thanks, your feedback is in.';
type Submission=({kind:'contact';need:string|null}&Omit<ContactInput,'need'>)|{kind:'problem'|'idea';need:string;page_path:string|null};
/** Shared save-first transport: both forms hit the same DB guard and hourly counters. */
async function deliver(row:Submission,subject:string,text:string,replyTo?:string):Promise<string|null>{
 const env=readSupabaseEnv();if(!env)return "The form isn't connected yet. Please try again later.";
 try{
  const ip=clientIp((await headers()).get('x-forwarded-for'));
  const ip_hash=ip?hashIp(ip,process.env.IP_HASH_SALT||env.url):null;
  const sb=createClient(env.url,env.anonKey,{auth:{persistSession:false}});
  const {error}=await sb.from('messages').insert({...row,ip_hash});
  if(error){if(error.message.includes('rate_limited'))return "That's a lot of messages from here. Please try again in an hour.";if(error.message.includes('busy'))return 'The inbox is busy right now. Please try again later.';return "Couldn't send. Your message is still here, try again.";}
 }catch{return "Couldn't send. Your message is still here, try again.";}
 // These occur only after persistence; failures must never encourage a duplicate submission.
 try{await sendAlert(subject,text,replyTo);}catch{/* Best effort; Inbox has the message. */}
 try{revalidatePath('/settings');}catch{/* Owner refresh can reload the saved Inbox. */}
 return null;
}
function honeypot(form:FormData){return !!String(form.get('website')??'').trim();}
export async function sendMessage(_:ContactResult|null,form:FormData):Promise<ContactResult>{
 const values=readContact(form);if(honeypot(form))return {ok:true,message:SAVED};
 const invalid=validateContact(values);if(invalid)return {ok:false,message:invalid,values};
 const error=await deliver({...values,need:values.need||null,kind:'contact'},`New message from ${values.name}`,alertText(values),values.email);
 return error?{ok:false,message:error,values}:{ok:true,message:SAVED};
}
export async function sendFeedback(_:FeedbackResult|null,form:FormData):Promise<FeedbackResult>{
 const values:FeedbackInput=readFeedback(form);if(honeypot(form))return {ok:true,message:FEEDBACK_SAVED};
 const invalid=validateFeedback(values);if(invalid)return {ok:false,message:invalid,values};
 const error=await deliver({kind:values.type,need:values.message,page_path:values.page||null},`Website feedback: ${FEEDBACK_LABELS[values.type]}`,feedbackAlert(values));
 return error?{ok:false,message:error,values}:{ok:true,message:FEEDBACK_SAVED};
}

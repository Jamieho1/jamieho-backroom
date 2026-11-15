import {CONTACT_LIMITS,validateMessageText} from './contact-fields';
export const FEEDBACK_TYPES=['problem','idea'] as const;
export type FeedbackType=(typeof FEEDBACK_TYPES)[number];
export const FEEDBACK_LABELS={contact:'Contact',problem:'Problem',idea:'Idea'} as const;
export interface FeedbackInput{type:FeedbackType;message:string;page:string}
export interface FeedbackResult{ok:boolean;message:string;values?:FeedbackInput}
export const PAGE_LIMIT=2000;
/** Local paths/fragments only. Queries are deliberately excluded from captured page links. */
export function validFeedbackPage(page:string):boolean{return !page||(page.length<=PAGE_LIMIT&&page.startsWith('/')&&!page.startsWith('//')&&!/[\s\u0000-\u001f\u007f\\?]/.test(page)&&!/%(?:0[0-9a-f]|1[0-9a-f]|7f|5c|2f)/i.test(page));}
export function readFeedback(form:FormData):FeedbackInput {const get=(key:string)=>String(form.get(key)??'').trim();return {type:get('type') as FeedbackType,message:get('message'),page:get('page')};}
export function validateFeedback(input:FeedbackInput):string|null {
 if(!(FEEDBACK_TYPES as readonly string[]).includes(input.type))return 'Choose Problem or Idea.';
 const message=validateMessageText(input.message,'Please add a message.');if(message)return message;
 if(!validFeedbackPage(input.page))return 'Use a local page path without query parameters, or leave Page blank.';
 return null;
}
export const FEEDBACK_MESSAGE_LIMIT=CONTACT_LIMITS.need;
export function feedbackAlert(input:FeedbackInput):string{return [`Type: ${FEEDBACK_LABELS[input.type]}`,`Page: ${input.page||'(not supplied)'}`,'',input.message,'','Anonymous website feedback. All messages: /settings#inbox'].join('\n');}

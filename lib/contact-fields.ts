/** Browser-safe contact/feedback rules. UI and transport share the same enums. */
export const CONTACT_LIMITS = { name: 100, email: 200, need: 4000, budget: 60 } as const;
export const REASONS = {project:"Project", hiring:"Hiring / role", collaboration:"Collaboration", hello:"Just saying hi"} as const;
export const NEEDS = ["AI engineering","Production event systems","Cloud architecture","Full-stack & delivery","Machine learning & computer vision","Something else"] as const;
export const BUDGETS = ["Under £1k","£1k–£5k","£5k–£15k","£15k+","Not sure yet"] as const;
export const TIMELINES = ["As soon as possible","Within 1–3 months","Just exploring"] as const;
export interface ContactInput {name:string;email:string;need:string;reason:string;needs:string[]|null;budget:string|null;timeline:string|null}
export interface ContactResult {ok:boolean;message:string;values?:ContactInput}
const EMAIL=/^[^@\s]+@[^@\s]+\.[^@\s]+$/;
export function readContact(form:FormData):ContactInput{
 const get=(k:string)=>String(form.get(k)??"").trim();const reason=get("reason");
 return {name:get("name"),email:get("email").toLowerCase(),need:get("need"),reason,
 needs:reason==="project"?form.getAll("needs").map(String):null,budget:reason==="project"?get("budget"):null,timeline:reason==="project"?get("timeline"):null};
}
export function contactErrors(c:ContactInput):Partial<Record<keyof ContactInput,string>>{
 const errors:Partial<Record<keyof ContactInput,string>>={};
 if(!Object.hasOwn(REASONS,c.reason))errors.reason="Please choose why you're getting in touch.";
 if(c.reason==="project"){
  if(!Array.isArray(c.needs)||!c.needs.length||c.needs.length>NEEDS.length||new Set(c.needs).size!==c.needs.length||c.needs.some(n=>!(NEEDS as readonly string[]).includes(n)))errors.needs="Pick at least one of the listed services.";
  if(!(BUDGETS as readonly unknown[]).includes(c.budget))errors.budget='Please choose a budget ("Not sure yet" is fine).';
  if(!(TIMELINES as readonly unknown[]).includes(c.timeline))errors.timeline="Please choose a timeline.";
 }else if(c.needs!==null||c.budget!==null||c.timeline!==null)errors.reason="Project details must be empty for this reason.";
 if(c.need){const e=validateMessageText(c.need);if(e)errors.need=e;}
 if(!c.name)errors.name="Please add your name.";else if(c.name.length>CONTACT_LIMITS.name||c.name.includes('\0'))errors.name="Please use a name under 100 characters without NUL.";
 if(!EMAIL.test(c.email)||c.email.length>CONTACT_LIMITS.email||c.email.includes('\0'))errors.email="That doesn't look like an email address.";
 return errors;
}
export const validateContact=(c:ContactInput):string|null=>Object.values(contactErrors(c))[0]??null;
export function validateMessageText(message:string,emptyMessage="Tell me a little about what you need."):string|null{
 if(!message.trim())return emptyMessage;
 if(message.length>CONTACT_LIMITS.need)return `Please keep it under ${CONTACT_LIMITS.need} characters.`;
 if(message.includes('\0'))return 'Text cannot contain NUL.';
 return null;
}

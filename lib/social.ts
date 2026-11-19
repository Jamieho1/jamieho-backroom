/** Footer social links, read from the Contact section's Markdown links (no personal URLs in git). */
export type SocialKind='linkedin'|'instagram'|'youtube'|'xiaohongshu';
export const SOCIAL_LABEL:Record<SocialKind,string>={linkedin:'LinkedIn',instagram:'Instagram',youtube:'YouTube',xiaohongshu:'RedNote (小红书)'};
const HOSTS:[SocialKind,RegExp][]=[['linkedin',/(^|\.)linkedin\.com$/],['instagram',/(^|\.)instagram\.com$/],['youtube',/(^|\.)(youtube\.com|youtu\.be)$/],['xiaohongshu',/(^|\.)(xiaohongshu\.com|xhslink\.com)$/]];
export interface SocialLink{kind:SocialKind;href:string}
export function socialLinks(markdown:string):SocialLink[]{
 const out:SocialLink[]=[];
 for(const m of markdown.matchAll(/\]\((https:\/\/[^\s)]+)\)|(?<![(\w])(https:\/\/[^\s)<>\]]+)/g)){
  const href=m[1]??m[2];let host='';try{host=new URL(href).hostname.toLowerCase();}catch{continue;}
  const kind=HOSTS.find(([,re])=>re.test(host))?.[0];
  if(kind&&!out.some(l=>l.kind===kind))out.push({kind,href});
 }
 const order:SocialKind[]=['linkedin','youtube','instagram','xiaohongshu'];
 return out.sort((a,b)=>order.indexOf(a.kind)-order.indexOf(b.kind));
}

/** Reuse only the content-managed plain mailbox; reject mail headers and control characters. */
export function contactEmail(markdown:string):string|undefined{const email=markdown.match(/mailto:([^\s)<>?]+)/i)?.[1]??markdown.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/)?.[0];return email&&/^[^@\s\x00-\x1f]+@[^@\s\x00-\x1f]+\.[^@\s\x00-\x1f]+$/.test(email)?`mailto:${email}`:undefined;}

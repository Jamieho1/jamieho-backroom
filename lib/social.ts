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

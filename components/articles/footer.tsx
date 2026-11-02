import {SOCIAL_LABEL,type SocialLink} from '@/lib/social';
export function ArticlesFooter({socials}:{socials:SocialLink[]}){
 return <footer className="articles-footer"><span>Jamie Ho © {new Date().getFullYear()}</span>
  {socials.length?<nav aria-label="Jamie's channels" className="articles-socials">{socials.map(s=><a key={s.kind} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={SOCIAL_LABEL[s.kind]} title={SOCIAL_LABEL[s.kind]}>
   {/* eslint-disable-next-line @next/next/no-img-element */}
   <img src={`/social/${s.kind}.png`} alt="" width={24} height={24} /></a>)}</nav>:null}
 </footer>;
}

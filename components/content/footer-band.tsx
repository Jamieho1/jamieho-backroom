import type {SocialLink} from '@/lib/social';
/** "New posts every week. Follow along." with the Instagram and YouTube links from the Contact section. */
export function ContentFooterBand({socials}:{socials:SocialLink[]}){
 const insta=socials.find(s=>s.kind==='instagram'),yt=socials.find(s=>s.kind==='youtube');
 return <section className="hub-foot" aria-labelledby="hub-foot-h"><div className="hub-in hub-foot-in">
  <h2 id="hub-foot-h">New posts every week. <span>Follow along.</span></h2>
  {insta||yt?<div className="hub-foot-links">
   {insta?<a className="hub-btn" href={insta.href} target="_blank" rel="noopener noreferrer">Instagram ↗</a>:null}
   {yt?<a className={`hub-btn${insta?' is-ghost':''}`} href={yt.href} target="_blank" rel="noopener noreferrer">YouTube ↗</a>:null}
  </div>:null}
 </div></section>;
}

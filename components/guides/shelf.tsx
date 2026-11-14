import Link from 'next/link';
import {guideHref,type GuideCard} from '@/lib/guides';
/** Public guide cards for /resources and /guides. Whole card is one link; toolkit links live on the guide page. */
export function GuideShelf({guides,heading='Guides',showAll=false}:{guides:GuideCard[];heading?:string;showAll?:boolean}){
 return <section className="guide-shelf" aria-labelledby="guides-h">
  <div className="guide-shelf-head"><h2 id="guides-h">{heading}</h2>{showAll?<Link href="/guides" prefetch={false}>All guides</Link>:null}</div>
  <p className="muted">Free, in-depth guides with prompts, checklists and templates. Open to everyone.</p>
  {guides.length?<ul className="resource-grid guide-grid">{guides.map(g=><li key={g.id}><Link data-draft-changed={g.draftChanged||undefined} className="guide-card" href={guideHref(g.slug)} prefetch={false}>
   {/* eslint-disable-next-line @next/next/no-img-element */}
   {g.cover_url?<img src={g.cover_url} alt="" referrerPolicy="no-referrer" />:null}
   <h3>{g.title}</h3>{g.summary?<p>{g.summary}</p>:null}
   <span className="guide-card-meta">{[g.notion_url?'Notion toolkit':'',g.doc_url?'Google Doc':''].filter(Boolean).join(' · ')||'Guide'}</span>
  </Link></li>)}</ul>:<p>No guides published yet.</p>}
 </section>;
}
/** The toolkit links shown at the top of a guide. */
export function GuideToolkit({notion,doc}:{notion:string;doc:string}){
 if(!notion&&!doc)return null;
 return <div className="guide-toolkit" aria-label="Toolkit">
  {notion?<a className="btn" href={notion} target="_blank" rel="noopener noreferrer">Open the Notion toolkit ↗</a>:null}
  {doc?<a className="btn ghost" href={doc} target="_blank" rel="noopener noreferrer">Copy the Google Doc ↗</a>:null}
 </div>;
}

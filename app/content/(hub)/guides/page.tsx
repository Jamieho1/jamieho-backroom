import type {Metadata} from 'next';
import Link from 'next/link';
import {getHomePreview} from '@/lib/content-drafts/preview';
import {PagePreview} from '@/components/content-drafts/page-preview';
import {getHubData} from '@/lib/content-hub-data';
import {articleDate} from '@/lib/articles';
import {guideHref} from '@/lib/guides';

export const revalidate=3600;
export const metadata:Metadata={title:'Free guides · Jamie Ho',description:'Free, in-depth guides on practical AI, with prompts, checklists and templates.'};
/** Simple list until H4 builds the guide cards (facts, audience, highlights). Guide URLs are unchanged. */
export default async function GuidesPage(){
 const preview=await getHomePreview();
 const {guides}=await getHubData(preview);
 return <><PagePreview preview={preview} page="/content/guides"/><section aria-label="Free guides" className="hub-latest">
  <p className="hub-intro"><span><b>Free, long-lived references.</b> See what&apos;s inside before you open one.</span></p>
  {guides.length?<div className="hub-grid">{guides.map(g=><Link key={g.id} className="hub-card guide-card" href={guideHref(g.slug)} prefetch={false} data-draft-changed={g.draftChanged||undefined}>
   <span className="hub-card-body"><span className="hub-meta">Updated {articleDate(g.updated_at)}</span><h3 className="hub-card-title">{g.title}</h3>{g.summary?<span className="hub-take">{g.summary}</span>:null}<span className="hub-chips"><span className="hub-chip">{g.minutes} min read</span></span><span className="hub-chip is-gold">Read the guide →</span></span>
  </Link>)}</div>:<p className="hub-empty">No guides published yet.</p>}
 </section></>;
}

import type {Metadata} from 'next';
import {getHomePreview} from '@/lib/content-drafts/preview';
import {PagePreview} from '@/components/content-drafts/page-preview';
import {GuideCards} from '@/components/content/guide-cards';
import {getHubData} from '@/lib/content-hub-data';

export const revalidate=3600;
export const metadata:Metadata={title:'Free guides · Jamie Ho',description:'Free, in-depth guides on practical AI, with prompts, checklists and templates.'};
/** Guide cards: topic, updated date, facts, who it is for, up to three ticks and direct buttons. Guide URLs are unchanged. */
export default async function GuidesPage(){
 const preview=await getHomePreview();
 const {guides,series}=await getHubData(preview);
 return <><PagePreview preview={preview} page="/content/guides"/><section aria-label="Free guides" className="hub-latest">
  <p className="hub-intro"><span><b>Free, long-lived references.</b> See what&apos;s inside before you open one.</span></p>
  <GuideCards guides={guides} series={series}/>
 </section></>;
}

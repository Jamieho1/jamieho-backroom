import type {Metadata} from 'next';
import {getHomePreview} from '@/lib/content-drafts/preview';
import {PagePreview} from '@/components/content-drafts/page-preview';
import {getHubData} from '@/lib/content-hub-data';
import {visibleSeries} from '@/lib/content-hub';
import {SERIES_TOPIC_LABEL} from '@/lib/content-series-data';

export const revalidate=3600;
export const metadata:Metadata={title:'Series · Jamie Ho',description:'Topics you can read in order, start to finish.'};
/** Placeholder list until H3 builds the series cards and series pages. */
export default async function SeriesPage(){
 const preview=await getHomePreview();
 const data=await getHubData(preview);
 const series=visibleSeries(data.series,data.posts,data.guides);
 return <><PagePreview preview={preview} page="/content/series"/><section aria-label="Series" className="hub-latest">
  <p className="hub-intro"><span><b>Topics you can read in order, start to finish.</b></span></p>
  {series.length?<ul className="hub-plain">{series.map(s=>{const out=[...data.posts,...data.guides].filter(x=>x.series_id===s.id).length;
   return <li key={s.id}><span className="hub-chip is-gold">{SERIES_TOPIC_LABEL[s.topic]}</span><h3 className="hub-card-title">{s.title}</h3>{s.goal?<p>After this: {s.goal}</p>:null}<small className="hub-meta">{out} of {s.planned_parts} parts out</small></li>;})}</ul>
   :<p className="hub-empty">No series yet.</p>}
 </section></>;
}

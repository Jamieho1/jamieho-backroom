import type {Metadata} from 'next';
import {getHomePreview} from '@/lib/content-drafts/preview';
import {PagePreview} from '@/components/content-drafts/page-preview';
import {getHubData} from '@/lib/content-hub-data';
import {visibleSeries} from '@/lib/content-hub';
import {seriesViews} from '@/lib/content-series-view';
import {SeriesCards} from '@/components/content/series-views';

export const revalidate=3600;
export const metadata:Metadata={title:'Series · Jamie Ho',description:'Topics you can read in order, start to finish.'};
/** Series cards: progress is read from this browser after the page loads; the page itself is pre-rendered. */
export default async function SeriesPage(){
 const preview=await getHomePreview();
 const data=await getHubData(preview);
 const items=seriesViews(visibleSeries(data.series,data.posts,data.guides),data.posts,data.guides);
 return <><PagePreview preview={preview} page="/content/series"/><section aria-label="Series" className="hub-latest">
  <p className="hub-intro"><span><b>Topics you can read in order, start to finish.</b> Each one shows where you are and what to read next.</span></p>
  {items.length?<SeriesCards items={items}/>:<p className="hub-empty">No series yet.</p>}
 </section></>;
}

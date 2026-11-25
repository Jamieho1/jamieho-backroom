import type {Metadata} from 'next';
import {getHomePreview} from '@/lib/content-drafts/preview';
import {PagePreview} from '@/components/content-drafts/page-preview';
import {getHubData} from '@/lib/content-hub-data';
import {visibleSeries} from '@/lib/content-hub';
import {LatestView} from '@/components/content/latest';

export const revalidate=3600;
export const metadata:Metadata={title:'Content · Jamie Ho',description:'The long version of every post: articles from Instagram and YouTube, series and free guides on AI, career, productivity and building in public.'};
export default async function ContentPage(){
 const preview=await getHomePreview();
 const data=await getHubData(preview);
 return <><PagePreview preview={preview} page="/content"/><LatestView posts={data.posts} series={visibleSeries(data.series,data.posts,data.guides)} guide={data.guides[0]??null}/></>;
}

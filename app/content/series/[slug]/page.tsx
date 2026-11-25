import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getHomePreview} from '@/lib/content-drafts/preview';
import {PagePreview} from '@/components/content-drafts/page-preview';
import {HubFrame} from '@/components/content/hub-frame';
import {SeriesDetail} from '@/components/content/series-views';
import {getHubData} from '@/lib/content-hub-data';
import {visibleSeries} from '@/lib/content-hub';
import {seriesViews} from '@/lib/content-series-view';
import {getSections} from '@/lib/sections';
import {socialLinks} from '@/lib/social';

export const revalidate=3600;
/** Every published series with at least one published part is built ahead of time; a new one renders on first visit and is then cached. */
export async function generateStaticParams(){
 try{const d=await getHubData();return visibleSeries(d.series,d.posts,d.guides).map(s=>({slug:s.slug}));}catch{return [];}
}
async function load(slug:string){
 const preview=await getHomePreview();
 const data=await getHubData(preview);
 const s=visibleSeries(data.series,data.posts,data.guides).find(x=>x.slug===slug);
 return {preview,view:s?seriesViews([s],data.posts,data.guides)[0]:null};
}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 try{const {view}=await load((await params).slug);return view?{title:`${view.title} · Series · Jamie Ho`,description:view.goal||`${view.title}: a series to read in order.`}:{title:'Series not found · Jamie Ho',robots:{index:false}};}catch{return {title:'Series · Jamie Ho'};}
}
export default async function SeriesPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 const [{preview,view},sections]=await Promise.all([load(slug),getSections(await getHomePreview())]);
 if(!view)notFound();
 return <><PagePreview preview={preview} page={`/content/series/${encodeURIComponent(view.slug)}`}/>
  <HubFrame socials={socialLinks(sections.contact.body)}><SeriesDetail s={view}/></HubFrame></>;
}

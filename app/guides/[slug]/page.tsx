import {getHomePreview} from "@/lib/content-drafts/preview";
import {PagePreview} from "@/components/content-drafts/page-preview";
import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {HubFrame} from '@/components/content/hub-frame';
import {GuideDetail} from '@/components/content/guide-detail';
import {getPublicGuide} from '@/lib/guides-public';
import {getHubData} from '@/lib/content-hub-data';
import {guideTopic} from '@/lib/guide-view';
import {seriesParts} from '@/lib/content-series-view';
import {getSections} from '@/lib/sections';
import {socialLinks} from '@/lib/social';
import {guideHref} from '@/lib/guides';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 try{const g=await getPublicGuide((await params).slug,await getHomePreview());return g?{title:`${g.title} · Jamie Ho`,description:g.summary,openGraph:{title:g.title,description:g.summary,type:'article',...(g.cover_url?{images:[g.cover_url]}:{})}}:{title:'Guide not found · Jamie Ho',robots:{index:false}};}catch{return {title:'Guides · Jamie Ho'};}
}
export default async function GuidePage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 const preview=await getHomePreview();
 let guide;
 try{guide=await getPublicGuide(slug,preview);}catch{return <main className="page"><p role="alert">Can&apos;t load this guide right now.</p><a href={guideHref(slug)}>Try again</a></main>;}
 if(!guide)notFound();
 /* The series and the posts that link here are optional: if they cannot be read the guide still renders. */
 const [data,sections]=await Promise.all([getHubData(preview).catch(()=>null),getSections(preview)]);
 const series=data?.series.find(s=>s.id===guide.series_id);
 const posts=series&&data?seriesParts(series,data.posts,[]).filter(p=>p.kind==='post'):[];
 return <><PagePreview preview={preview} page={guide.published?`/guides/${guide.slug}`:"/content/guides"}/>
  <HubFrame socials={socialLinks(sections.contact.body)}><GuideDetail guide={guide} topic={guideTopic(guide,data?.series??[])} posts={posts} unpublished={!!guide.draftChanged&&!guide.published}/></HubFrame></>;
}

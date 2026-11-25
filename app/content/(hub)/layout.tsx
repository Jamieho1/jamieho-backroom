import type {ReactNode} from 'react';
import {getHomePreview} from '@/lib/content-drafts/preview';
import {getHubData} from '@/lib/content-hub-data';
import {buildSearchIndex,visibleSeries} from '@/lib/content-hub';
import {getSections} from '@/lib/sections';
import {socialLinks} from '@/lib/social';
import {HubSearch} from '@/components/content/hub-search';
import {HubTabs} from '@/components/content/hub-tabs';
import {HubFrame} from '@/components/content/hub-frame';

export const revalidate=3600;
/** The frame every hub page shares (Latest, Series, Free guides): heading, one search box, sticky tabs and the footer band. */
export default async function HubLayout({children}:{children:ReactNode}){
 const preview=await getHomePreview();
 const [data,sections]=await Promise.all([getHubData(preview),getSections(preview)]);
 const series=visibleSeries(data.series,data.posts,data.guides);
 return <HubFrame socials={socialLinks(sections.contact.body)} top={<>
   <header className="hub-in hub-head">
    <div><p className="sty-eyebrow">CONTENT</p><h1>Complete content <em>of</em> every post</h1>
     <p className="sty-lede">Written versions of my Instagram and YouTube posts, plus free guides.</p></div>
    <HubSearch index={buildSearchIndex({posts:data.posts,guides:data.guides,series})}/>
   </header>
   <HubTabs counts={{latest:data.posts.length,series:series.length,guides:data.guides.length}}/>
  </>}>{children}</HubFrame>;
}

import type {ReactNode} from 'react';
import {getHomePreview} from '@/lib/content-drafts/preview';
import {getHubData} from '@/lib/content-hub-data';
import {buildSearchIndex,visibleSeries} from '@/lib/content-hub';
import {getSections} from '@/lib/sections';
import {socialLinks} from '@/lib/social';
import {HubSearch} from '@/components/content/hub-search';
import {HubTabs} from '@/components/content/hub-tabs';
import {ContentFooterBand} from '@/components/content/footer-band';
import '../../page-scale.css';
import '../../about/story.css';
import '../content.css';

export const revalidate=3600;
/** The frame every hub page shares (Latest, Series, Free guides): heading, one search box, sticky tabs and the footer band. */
export default async function HubLayout({children}:{children:ReactNode}){
 const preview=await getHomePreview();
 const [data,sections]=await Promise.all([getHubData(preview),getSections(preview)]);
 const series=visibleSeries(data.series,data.posts,data.guides);
 return <>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin=""/>
  <link rel="stylesheet" precedence="default" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700&family=Inter:wght@400;500;600&display=swap"/>
  <main className="app-page hub-page" data-app="content"><div className="desktop-app-content app-page-content hub-scroll">
   <div className="sty hub">
    <div className="sty-layer sty-dots" aria-hidden="true"/>
    <header className="hub-in hub-head">
     <div><p className="sty-eyebrow">CONTENT</p><h1>The long version <em>of</em> every post</h1>
      <p className="sty-lede">Written versions of my Instagram and YouTube posts, plus free guides.</p></div>
     <HubSearch index={buildSearchIndex({posts:data.posts,guides:data.guides,series})}/>
    </header>
    <HubTabs counts={{latest:data.posts.length,series:series.length,guides:data.guides.length}}/>
    <div className="hub-in hub-content">{children}</div>
    <ContentFooterBand socials={socialLinks(sections.contact.body)}/>
   </div>
  </div></main>
 </>;
}

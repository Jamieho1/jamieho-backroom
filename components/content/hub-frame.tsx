import type {ReactNode} from 'react';
import {ContentFooterBand} from './footer-band';
import type {SocialLink} from '@/lib/social';
import '../../app/page-scale.css';
import '../../app/about/story.css';
import '../../app/content/content.css';
/** The page frame every /content page shares: story look, dot grid and the footer band. `top` is the heading and tabs (absent on a series page). */
export function HubFrame({top,socials,children}:{top?:ReactNode;socials:SocialLink[];children:ReactNode}){
 return <>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin=""/>
  <link rel="stylesheet" precedence="default" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700&family=Inter:wght@400;500;600&display=swap"/>
  <main className="app-page hub-page" data-app="content"><div className="desktop-app-content app-page-content hub-scroll">
   <div className="sty hub">
    <div className="sty-layer sty-dots" aria-hidden="true"/>
    {top}
    <div className="hub-in hub-content">{children}</div>
    <ContentFooterBand socials={socials}/>
   </div>
  </div></main>
 </>;
}

import type {Metadata} from "next";
import {getSections} from "@/lib/sections";
import {getHomePreview} from "@/lib/content-drafts/preview";
import {PagePreview} from "@/components/content-drafts/page-preview";
import {Story} from "@/components/story";
import "./story.css";

export const revalidate=86400;
export const metadata:Metadata={title:"My story · Jamie Ho"};
export default async function AboutPage(){
 const preview=await getHomePreview();
 const sections=await getSections(preview);
 const changed=!!preview?.operations.some(op=>op.table==="site_sections"&&(op.key==="story"||op.key==="about"));
 return <>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin=""/>
  <link rel="stylesheet" precedence="default" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700&family=Inter:wght@400;500;600&display=swap"/>
  <PagePreview preview={preview} page="/about"/>
  <main className="app-page story-page" data-app="story"><div className="desktop-app-content app-page-content story-scroll"><Story about={sections.about} story={sections.story} changed={changed}/></div></main>
 </>;
}

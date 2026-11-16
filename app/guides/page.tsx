import {getHomePreview} from "@/lib/content-drafts/preview";
import {PagePreview} from "@/components/content-drafts/page-preview";
import type {Metadata} from 'next';
import {GuidesShell} from '@/components/guides/library';
import {getPublicGuides} from '@/lib/guides-public';
import '../articles.css';
export const revalidate=3600;
export const metadata:Metadata={title:'Guides · Jamie Ho',description:'Free, in-depth guides on practical AI, with prompts, checklists and templates.'};
export default async function GuidesPage(){
 const preview=await getHomePreview();
 const guides=await getPublicGuides(preview).catch(()=>null);
 return <><PagePreview preview={preview} page="/guides"/><main className="app-page guides-page" data-app="resources"><div className="desktop-app-content app-page-content">{guides?<GuidesShell guides={guides} />:<p role="alert">Can&apos;t load guides right now. <a href="/guides">Try again</a></p>}</div></main></>;
}

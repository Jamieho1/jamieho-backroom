import {getHomePreview} from "@/lib/content-drafts/preview";
import {PagePreview} from "@/components/content-drafts/page-preview";
import type { Metadata } from "next";
import { GuidesShell } from "@/components/guides/library";
import "../articles.css";
import { getPublicGuides } from "@/lib/guides-public";
export const revalidate = 3600;
export const metadata: Metadata = { title: "Resources · Jamie Ho", description: "Free guides and practical references." };
export default async function ResourcesPage() {
  const preview=await getHomePreview();
  const guides = await getPublicGuides(preview).catch(() => []);
  return <><PagePreview preview={preview} page="/resources"/><main className="app-page guides-page" data-app="resources"><div className="desktop-app-content app-page-content"><GuidesShell guides={guides} /></div></main></>;
}

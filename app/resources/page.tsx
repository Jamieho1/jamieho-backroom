import {getHomePreview} from "@/lib/content-drafts/preview";
import {PagePreview} from "@/components/content-drafts/page-preview";
import type { Metadata } from "next";
import { ResourceCatalog } from "@/components/resource-catalog";
import { GuideShelf } from "@/components/guides/shelf";
import { getPublicGuides } from "@/lib/guides-public";
export const revalidate = 3600;
export const metadata: Metadata = { title: "Resources · Jamie Ho", description: "Free guides, notes, coding practice and interview preparation." };
export default async function ResourcesPage() {
  const preview=await getHomePreview();
  const guides = await getPublicGuides(preview).catch(() => []);
  return <><PagePreview preview={preview} page="/resources"/><main className="page resources-page"><h1>Resources</h1><p className="muted">Free guides, plus notes, practice and interview preparation for members.</p>
    <GuideShelf guides={guides} showAll />
    <h2 className="resource-section-heading">Member apps</h2><ResourceCatalog /></main></>;
}

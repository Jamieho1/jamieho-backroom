import type { Metadata } from "next";
import { ResourceCatalog } from "@/components/resource-catalog";
import { GuideShelf } from "@/components/guides/shelf";
import { getPublicGuides } from "@/lib/guides-public";
export const revalidate = 3600;
export const metadata: Metadata = { title: "Resources · Jamie Ho", description: "Free guides, notes, coding practice and interview preparation." };
export default async function ResourcesPage() {
  const guides = await getPublicGuides().catch(() => []);
  return <main className="page resources-page"><h1>Resources</h1><p className="muted">Free guides, plus notes, practice and interview preparation for members.</p>
    <GuideShelf guides={guides} showAll />
    <h2 className="resource-section-heading">Member apps</h2><ResourceCatalog /></main>;
}

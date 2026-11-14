import {getHomePreview} from "@/lib/content-drafts/preview";
import {PagePreview} from "@/components/content-drafts/page-preview";
import type { Metadata } from "next";
import { GuideShelf } from "@/components/guides/shelf";
import { getPublicGuides } from "@/lib/guides-public";
export const revalidate = 3600;
export const metadata: Metadata = { title: "Resources · Jamie Ho", description: "Free guides and practical references." };
export default async function ResourcesPage() {
  const preview=await getHomePreview();
  const guides = await getPublicGuides(preview).catch(() => []);
  return <><PagePreview preview={preview} page="/resources"/><main className="page resources-page"><h1>Resources</h1><p className="muted">Free guides and practical references.</p>
    <GuideShelf guides={guides} showAll />
</main></>;
}

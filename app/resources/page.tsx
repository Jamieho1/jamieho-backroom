import type { Metadata } from "next";
import { ResourceCatalog } from "@/components/resource-catalog";
export const metadata: Metadata = { title: "Resources · Jamie Ho", description: "Notes, coding practice and interview preparation." };
export default function ResourcesPage() { return <main className="page resources-page"><h1>Resources</h1><p className="muted">Notes, practice and interview preparation.</p><ResourceCatalog /></main>; }

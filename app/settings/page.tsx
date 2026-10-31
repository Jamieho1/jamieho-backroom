import type { Metadata } from "next";
import { SettingsContent } from "./content";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Settings · Jamie Ho", robots: { index: false } };

export default function SettingsPage() {
  return <main><SettingsContent /></main>;
}

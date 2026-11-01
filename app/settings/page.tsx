import { Desktop } from "@/components/desktop";
import { getDesktopApps } from "@/app/actions/desktop";
import type { Metadata } from "next";
import { SettingsContent } from "./content";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Settings · Jamie Ho", robots: { index: false } };

export default async function SettingsPage() {
  const content=await SettingsContent();
  const apps=await getDesktopApps();
  return <Desktop signedIn apps={apps} initialApp="settings" content={content} />;
}

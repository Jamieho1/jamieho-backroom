import { getViewer } from "@/lib/viewer";
import { supabaseServer } from "@/lib/supabase/server";
import { SignInButton } from "@/components/sign-in-button";
import { Desktop } from "@/components/desktop";
import type { AppRow } from "@/lib/apps";
import { SettingsContent } from "@/app/settings/content";
import { NotesContent } from "./notes-content";
import "../notes.css";

export const dynamic = "force-dynamic";

export default async function DesktopPage({ searchParams }: { searchParams: Promise<{ app?: string }> }) {
  const { app } = await searchParams;
  const viewer = await getViewer();
  const sb = await supabaseServer();
  if (viewer.role === "anonymous") return (
    <main className="page">
      <h1>Your desktop</h1>
      <p>Sign in with Google to open your apps.</p>
      {sb ? <SignInButton next={app ? `/desktop?app=${encodeURIComponent(app)}` : "/desktop"} /> : <p className="muted">Sign-in is not configured in this environment.</p>}
    </main>
  );
  const result = sb ? await sb.from("desktop_apps").select("*").order("sort").order("id") : null;
  if (!result || result.error) return <main className="page"><h1>Your desktop</h1><p role="alert">Can&apos;t reach the data right now.</p><a href="/desktop">Try again</a></main>;
  const apps = (result.data ?? []) as AppRow[];
  const settings = app === "settings" && apps.some((row) => row.id === "settings" && row.kind === "internal");
  const notes = app === "notes" && apps.some((row) => row.id === "notes" && row.kind === "internal");
  return <Desktop apps={apps} initialApp={app} content={settings ? <SettingsContent /> : notes ? <NotesContent /> : undefined} />;
}

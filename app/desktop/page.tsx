import { redirect } from "next/navigation";
import { getViewer } from "@/lib/viewer";
import { supabaseServer } from "@/lib/supabase/server";
import { SignInButton } from "@/components/sign-in-button";
import { Desktop } from "@/components/desktop";
import type { AppRow } from "@/lib/apps";
import { SettingsContent } from "@/app/settings/content";
import { NotesContent } from "./notes-content";
import "../notes.css";
import "../practice.css";
import "../behavioral.css";
import { BehavioralContent } from "./behavioral-content";
import { PracticeArena } from "@/components/practice/arena";

export const dynamic = "force-dynamic";

export default async function DesktopPage({ searchParams }: { searchParams: Promise<{ app?: string; problem?: string }> }) {
  const { app, problem } = await searchParams;
  if(app==="home")redirect("/");
  if(app==="projects")redirect("/projects");
  if(app==="privacy")redirect("/privacy");
  const viewer = await getViewer();
  const sb = await supabaseServer();
  if (viewer.role === "anonymous") return (
    <Desktop apps={[]} initialApp="signin" content={<div className="page">
      <h1>Your desktop</h1>
      <p>Sign in with Google to open your apps.</p>
      {sb ? <SignInButton next={app ? `/desktop?app=${encodeURIComponent(app)}${problem ? `&problem=${encodeURIComponent(problem)}` : ""}` : "/desktop"} /> : <p className="muted">Sign-in is not configured in this environment.</p>}
    </div>} />
  );
  const result = sb ? await sb.from("desktop_apps").select("*").order("sort").order("id") : null;
  if (!result || result.error) return <Desktop signedIn apps={[]} initialApp="signin" content={<div className="page"><h1>Your desktop</h1><p role="alert">Can&apos;t reach the data right now.</p><a href="/desktop">Try again</a></div>} />;
  const apps = (result.data ?? []) as AppRow[];
  const settings = app === "settings" && apps.some((row) => row.id === "settings" && row.kind === "internal");
  const notes = app === "notes" && apps.some((row) => row.id === "notes" && row.kind === "internal");
  const practice = app === "practice" && apps.some((row) => row.id === "practice" && row.kind === "internal");
  const behavioral = app === "behavioral" && apps.some((row) => row.id === "behavioral" && row.kind === "internal");
  return <Desktop signedIn apps={apps} initialApp={app} content={settings ? <SettingsContent /> : notes ? <NotesContent canEdit={viewer.role === "owner"} /> : practice ? <PracticeArena canEdit={viewer.role === "owner"} viewerKey={viewer.id!} initialProblem={Number(problem)} /> : behavioral ? <BehavioralContent canEdit={viewer.role === "owner"} /> : undefined} />;
}

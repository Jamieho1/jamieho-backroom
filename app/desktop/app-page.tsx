import { appHref,practiceHref } from "@/lib/desktop-pages";
import { getViewer } from "@/lib/viewer";
import { supabaseServer } from "@/lib/supabase/server";
import { ResourceGate } from "@/components/resource-gate";
import { RESOURCE_PAGES } from "@/lib/resources";
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

export async function AppPage({app,problem}:{app?:string;problem?:string}) {
  const next=app?appHref({id:app,kind:"internal",url:""}):"/resources";
  const returnTo=app==="practice"&&problem?practiceHref(problem):next;
  const viewer = await getViewer();
  const sb = await supabaseServer();
  if (viewer.role === "anonymous") return (
    <Desktop apps={[]} initialApp="signin" content={<ResourceGate app={app} next={returnTo} configured={!!sb} />} />
  );
  const result = sb ? await sb.from("desktop_apps").select("*").order("sort").order("id") : null;
  if (!result || result.error) return <Desktop signedIn apps={[]} initialApp="signin" content={<div className="page"><h1>Resources</h1><p role="alert">Can&apos;t reach the data right now.</p><a href={returnTo}>Try again</a></div>} />;
  const apps = (result.data ?? []) as AppRow[];
  if (RESOURCE_PAGES.some(resource => resource.id === app) && !apps.some(resource => resource.id === app)) {
    return <Desktop signedIn apps={apps} initialApp="signin" viewerId={viewer.id} content={<ResourceGate app={app} next={returnTo} configured={!!sb} signedIn />} />;
  }
  const settings = app === "settings" && apps.some((row) => row.id === "settings" && row.kind === "internal");
  const notes = app === "notes" && apps.some((row) => row.id === "notes" && row.kind === "internal");
  const practice = app === "practice" && apps.some((row) => row.id === "practice" && row.kind === "internal");
  const behavioral = app === "behavioral" && apps.some((row) => row.id === "behavioral" && row.kind === "internal");
  return <Desktop signedIn viewerId={viewer.id} apps={apps} initialApp={app} content={settings ? <SettingsContent /> : notes ? <NotesContent canEdit={viewer.role === "owner"} /> : practice ? <PracticeArena canEdit={viewer.role === "owner"} viewerKey={viewer.id!} initialProblem={Number(problem)} /> : behavioral ? <BehavioralContent canEdit={viewer.role === "owner"} /> : undefined} />;
}

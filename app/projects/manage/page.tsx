import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getViewer } from "@/lib/viewer";
import { supabaseServer } from "@/lib/supabase/server";
import { getDesktopApps } from "@/app/actions/desktop";
import { Desktop } from "@/components/desktop";
import { ProjectEditor } from "@/components/portfolio/editor";
import { PROJECT_SELECT, type Project } from "@/lib/portfolio";
import "../../articles.css";
import "../../projects.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Manage projects · Jamie Ho", robots: { index: false } };

/** TKT-86: owner-only project editor. Everyone else gets a 404; RLS also refuses their writes. */
export default async function ManageProjects({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const viewer = await getViewer();
  if (viewer.role !== "owner") notFound();
  const sb = await supabaseServer();
  if (!sb) notFound();
  const [{ data, error }, apps, { edit }] = await Promise.all([sb.from("projects").select(PROJECT_SELECT), getDesktopApps(), searchParams]);
  return <Desktop signedIn viewerId={viewer.id} apps={apps} initialApp="projects" content={error
    ? <div className="page"><p role="alert">Can&apos;t load your projects right now.</p><a href="/projects/manage">Try again</a></div>
    : <ProjectEditor initial={(data ?? []) as Project[]} startWith={edit} />} />;
}

import {getHomePreview} from "@/lib/content-drafts/preview";
import {PagePreview} from "@/components/content-drafts/page-preview";
import type { Metadata } from "next";
import { Desktop } from "@/components/desktop";
import { getPublicProjects } from "@/lib/portfolio";
import { toSummary } from "@/lib/project-view";
import { ProjectsIndex } from "@/components/projects/projects-index";
import "../projects.css";
import "../project-pages.css";

export const metadata: Metadata = { title: "Projects · Jamie Ho", description: "Things Jamie Ho has built." };
/** Pre-rendered; re-rendered when approvals or the editor save a project, or at least daily. The capability filter runs in the browser. */
export const revalidate = 86400;

/** Selected work: featured projects, then the full index. */
export default async function ProjectsPage() {
  // No try/catch: if Supabase is down the render fails and Next keeps serving the last good page.
  const preview=await getHomePreview();
  const projects = await getPublicProjects(preview);
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com"/>
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin=""/>
      <link rel="stylesheet" precedence="default" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700&family=Inter:wght@400;500;600&display=swap"/>
      <PagePreview preview={preview} page="/projects"/><Desktop apps={[]} initialApp="projects" discoverApps content={<ProjectsIndex projects={projects.map(toSummary)} />} />
    </>
  );
}

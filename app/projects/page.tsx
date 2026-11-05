import type { Metadata } from "next";
import { Desktop } from "@/components/desktop";
import { getPublicProjects } from "@/lib/portfolio";
import { ProjectList } from "@/components/portfolio/views";
import { ProjectManageLink } from "@/components/portfolio/manage-link";
import "../projects.css";

export const metadata: Metadata = { title: "Projects · Jamie Ho", description: "Things Jamie Ho has built." };
/** Pre-rendered; re-rendered when the owner saves a project (TKT-86), or at least daily. */
export const revalidate = 86400;

/** Home v1.1 (TKT-83): every public project, featured first. Each card opens the project's own page. */
export default async function ProjectsPage() {
  // No try/catch: if Supabase is down the render fails and Next keeps serving the last good page.
  const projects = await getPublicProjects();
  return (
    <Desktop apps={[]} initialApp="projects" discoverApps content={<div className="page projects-page">
      <header className="articles-heading"><h1>Projects</h1><ProjectManageLink /></header>
      <p className="muted">Things I&apos;ve built: what each one does, how it works and where to try it.</p>
      <ProjectList projects={projects} />
    </div>} />
  );
}

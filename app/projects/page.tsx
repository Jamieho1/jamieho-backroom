import type { Metadata } from "next";
import { getProjectApps } from "@/lib/projects";
import { ProjectGrid } from "@/components/project-grid";

export const metadata: Metadata = { title: "Projects · Jamie Ho", description: "Things Jamie Ho has built." };
export const revalidate = 86400;

export default async function ProjectsPage() {
  const apps = await getProjectApps();
  return (
    <main className="page">
      <h1>Projects</h1>
      <p className="muted">Each one is a small app. Some open for anyone; others need you to sign in, or an invite.</p>
      <ProjectGrid apps={apps} />
    </main>
  );
}

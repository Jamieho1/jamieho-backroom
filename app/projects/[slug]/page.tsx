import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Desktop } from "@/components/desktop";
import { getPublicProject, getPublicProjects } from "@/lib/portfolio";
import { ProjectDetail } from "@/components/portfolio/views";
import "../../projects.css";

/** Pre-rendered on first visit; re-rendered when the owner saves the project (TKT-86), or at least daily. */
export const revalidate = 86400;
/** Public projects are built ahead; a project published later renders on its first visit, then is cached. */
export const dynamicParams = true;
export async function generateStaticParams() {
  return (await getPublicProjects().catch(() => [])).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    const p = await getPublicProject((await params).slug);
    return p
      ? { title: `${p.name} · Projects · Jamie Ho`, description: p.tagline, openGraph: { title: p.name, description: p.tagline, ...(p.screenshots[0] ? { images: [p.screenshots[0]] } : {}) } }
      : { title: "Project not found · Jamie Ho", robots: { index: false } };
  } catch { return { title: "Projects · Jamie Ho" }; }
}

/** Home v1.1 (TKT-83): one project's case study. The website is an option on the page, not where the card goes. */
export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // No try/catch: if Supabase is down the render fails and Next keeps serving the last good page.
  const p = await getPublicProject(slug);
  if (!p) notFound();
  return <Desktop apps={[]} initialApp="projects" discoverApps content={<ProjectDetail p={p} />} />;
}

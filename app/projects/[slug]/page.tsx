import {getHomePreview} from "@/lib/content-drafts/preview";
import {PagePreview} from "@/components/content-drafts/page-preview";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Desktop } from "@/components/desktop";
import { getPublicProject, getPublicProjects } from "@/lib/portfolio";
import { toSummary } from "@/lib/project-view";
import { ProjectCaseStudy } from "@/components/projects/case-study";
import "../../projects.css";
import "../../page-scale.css";
import "../../project-pages.css";

/** Pre-rendered on first visit; re-rendered when the owner saves the project (TKT-86), or at least daily. */
export const revalidate = 86400;
/** Public projects are built ahead; a project published later renders on its first visit, then is cached. */
export const dynamicParams = true;
export async function generateStaticParams() {
  return (await getPublicProjects().catch(() => [])).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    const p = await getPublicProject((await params).slug,await getHomePreview());
    return p
      ? { title: `${p.name} · Projects · Jamie Ho`, description: p.tagline, openGraph: { title: p.name, description: p.tagline, ...(p.screenshots[0] ? { images: [p.screenshots[0]] } : {}) } }
      : { title: "Project not found · Jamie Ho", robots: { index: false } };
  } catch { return { title: "Projects · Jamie Ho" }; }
}

/** One project's case study. The website is an option on the page, not where the card goes. */
export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // No try/catch: if Supabase is down the render fails and Next keeps serving the last good page.
  const preview=await getHomePreview();
  const p = await getPublicProject(slug,preview);
  if (!p) notFound();
  // The numbered order and the next project come from the public list (featured first, then the owner's order).
  const all = await getPublicProjects(preview);
  const at = all.findIndex((x) => x.id === p.id);
  const index = at >= 0 ? at + 1 : all.length + 1, total = Math.max(all.length, index);
  const following = all.length > 1 && at >= 0 ? all[(at + 1) % all.length] : null;
  const next = following ? { ...toSummary(following), n: ((at + 1) % all.length) + 1 } : null;
  return <>
    <link rel="preconnect" href="https://fonts.googleapis.com"/>
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin=""/>
    <link rel="stylesheet" precedence="default" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700&family=Inter:wght@400;500;600&display=swap"/>
    <PagePreview preview={preview} page={p.public?`/projects/${p.slug}`:"/projects"}/><Desktop apps={[]} initialApp="projects" discoverApps content={<ProjectCaseStudy project={p} index={index} total={total} next={next} />} />
  </>;
}

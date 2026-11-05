import type { Metadata } from "next";
import { Journey } from "@/components/journey/journey";
import { HOME_CHAPTERS } from "@/lib/journey/chapters";
import { withContent } from "@/lib/journey/content";
import { getSections } from "@/lib/sections";
import { getPublicExperience } from "@/lib/experience";
import { getProjectApps } from "@/lib/projects";
import { projectTechnologies } from "@/lib/home";
import { getLatestMedia } from "@/lib/articles-public";
import "../journey.css";

/** Home v1 preview (TKT-74): not linked or indexed until TKT-79 moves it onto `/`. */
export const metadata: Metadata = { title: "Journey preview · Jamie Ho", robots: { index: false, follow: false } };

/** Pre-rendered like `/`; re-rendered when the owner saves a section or experience entry, or at least daily. */
export const revalidate = 86400;

/** Media lives outside git: `public/home-media/` locally (gitignored), the `home-media` bucket live (TKT-75). */
const MEDIA_BASE = (process.env.NEXT_PUBLIC_HOME_MEDIA_URL ?? "/home-media").replace(/\/$/, "");

export default async function JourneyPage() {
  const [sections, experience, apps, latest] = await Promise.all([getSections(), getPublicExperience(), getProjectApps(), getLatestMedia()]);
  const chapters = withContent(HOME_CHAPTERS, { sections, experience, latest, technologies: projectTechnologies(apps).map((t) => t.name) });
  return <main className="journey-page">
    {/* Journey typefaces (polish pass): wide display, mono labels, clean body. React hoists these into <head>. */}
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
    <link rel="stylesheet" precedence="default" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=JetBrains+Mono:wght@400;500&family=Unbounded:wght@500;600;700&display=swap" />
    <Journey chapters={chapters} base={MEDIA_BASE} />
  </main>;
}

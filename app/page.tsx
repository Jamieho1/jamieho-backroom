import { AuthErrorNotice } from "@/components/auth-error-notice";
import { socialLinks, contactEmail } from "@/lib/social";
import { Journey } from "@/components/journey/journey";
import { HOME_CHAPTERS } from "@/lib/journey/chapters";
import { withContent } from "@/lib/journey/content";
import {getAboutPhotos,getJourneyStops} from "@/lib/home-content";
import { getSections } from "@/lib/sections";
import { getPublicExperience } from "@/lib/experience";
import { getProjectApps } from "@/lib/projects";
import { projectTechnologies } from "@/lib/home";
import { getLatestMedia } from "@/lib/articles-public";
import { getPublicProjects } from "@/lib/portfolio";
import { getHomePreview } from "@/lib/content-drafts/preview";
import { ContentPreviewBar } from "@/components/content-drafts/preview-bar";
import "@/components/content-drafts/preview.css";
import "./journey.css";
import "./contact-brief.css";

/** Pre-rendered like `/`; re-rendered when the owner saves a section or experience entry, or at least daily. */
export const revalidate = 86400;

/** Media lives outside git: `public/home-media/` locally (gitignored), the `home-media` bucket live (TKT-75). */
const MEDIA_BASE = (process.env.NEXT_PUBLIC_HOME_MEDIA_URL ?? "/home-media").replace(/\/$/, "");

export default async function Home() {
  const preview = await getHomePreview();
  const [journeyStops, aboutPhotos, sections, experience, apps, latest, projects] = await Promise.all([getJourneyStops(preview), getAboutPhotos(preview), getSections(preview), getPublicExperience(preview), getProjectApps(), getLatestMedia(preview), getPublicProjects(preview)]);
  const chapters = withContent(HOME_CHAPTERS, { sections, experience, journeyStops, latest, projects, technologies: projectTechnologies(apps).map((t) => t.name) });
  return <main className="journey-page">
    {/* Journey typefaces (polish pass): wide display, mono labels, clean body. React hoists these into <head>. */}
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
    <link rel="stylesheet" precedence="default" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Inter:wght@400;500&family=JetBrains+Mono:wght@400;500&family=Unbounded:wght@500;600;700&display=swap" />
    <AuthErrorNotice />
    <Journey chapters={chapters} aboutPhotos={aboutPhotos} base={MEDIA_BASE} socials={socialLinks(sections.contact.body)} emailHref={contactEmail(sections.contact.body)} draftSections={preview ? [...new Set(preview.operations.filter(operation=>operation.table==="site_sections").map(operation => operation.key))] : []} />
    {preview ? <ContentPreviewBar id={preview.id} photoSlots={preview.photoSlots} summary={preview.summary} experience={!!preview.experience} targets={preview.targets} /> : null}
  </main>;
}

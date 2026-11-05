/**
 * TKT-77: fill the journey's placeholder panels with the site's existing content (no new content store, nothing
 * personal in git). Mapping agreed 2026-11-04:
 * - Sky: `hero` section (+ "Go straight to my desktop").
 * - Pivot (v1.1): `about` title as the statement, its first paragraph, and the first public education entry.
 * - Room (redesign 2026-11-05): `now` section, then "Latest" (newest YouTube post + newest other post) with a
 *   contact line built from the Contact section's social links.
 * Empty sections and missing entries simply drop their panel.
 */
import type { Item } from "@/lib/experience";
import type { Section, SectionKey } from "@/lib/sections";
import type { LatestItem } from "@/lib/articles-public";
import { articleHref } from "@/lib/articles";
import { SOCIAL_LABEL, socialLinks } from "@/lib/social";
import type { Chapter, Panel, PanelLink } from "./timeline";

/** Where "switch on the computer" leads. The desktop moves to /desktop when the journey takes over / (TKT-79). */
export const DESKTOP_HREF = "/";
/** The contact form on the existing site. */
export const CONTACT_HREF = "/about#home-contact";

export interface JourneyContent {
  sections: Record<SectionKey, Section>;
  experience: Item[];
  technologies: string[];
  latest?: { video: LatestItem | null; article: LatestItem | null };
}

/** Keep panels short: the first paragraph, cut at a word boundary. Markdown is kept (rendered safely). */
export function excerpt(markdown: string, max = 320): string {
  const first = markdown.trim().split(/\n\s*\n/)[0]?.trim() ?? "";
  if (first.length <= max) return first;
  const cut = first.slice(0, max);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), max - 40)).replace(/[\s,;:.-]+$/, "")}…`;
}

const meta = (i: Item) => [i.org, i.dates].map((s) => s.trim()).filter(Boolean).join(" · ");
/** "MEng Biomedical Engineering · Imperial College London · 2016–2020" from the education entry. */
export const educationLine = (i: Item) => [i.title, meta(i)].map((s) => s.trim()).filter(Boolean).join(" · ");
const plain = (s: string) => s.replace(/[*_`#>]/g, "").trim();

/** Spread `n` panels evenly over [from, to] with a small gap between them. */
export function spread(n: number, from: number, to: number, gap = 0.01): { from: number; to: number }[] {
  if (n <= 0) return [];
  const step = (to - from) / n;
  return Array.from({ length: n }, (_, k) => ({ from: from + k * step, to: from + (k + 1) * step - (k < n - 1 ? gap : 0) }));
}

export function withContent(chapters: readonly Chapter[], content: JourneyContent): Chapter[] {
  const s = content.sections;
  const education = content.experience.find((i) => i.kind === "education");

  return chapters.map((c) => {
    const panels: Panel[] = [];
    for (const p of c.panels ?? []) {
      const at = (patch: Partial<Panel>): Panel => ({ ...p, ...patch });
      switch (`${c.id}:${p.id}`) {
        case "sky:hero":
          panels.push(at({ title: s.hero.title || "Jamie Ho", body: excerpt(s.hero.body), md: true, cta: { label: "Go straight to my desktop", href: DESKTOP_HREF } }));
          break;
        case "room:now":
          if (plain(s.now.body)) panels.push(at({ title: s.now.title || p.title, body: excerpt(s.now.body), md: true }));
          break;
        case "room:latest": {
          const links: PanelLink[] = [];
          const { video, article } = content.latest ?? { video: null, article: null };
          if (video) links.push({ kicker: "Latest video", title: video.title, href: video.source_url, image: video.cover_url || undefined, external: true });
          if (article) links.push({ kicker: "Latest article", title: article.title, href: articleHref(article.slug), image: article.cover_url || undefined });
          const foot = [{ label: "Say hello", href: CONTACT_HREF }, ...socialLinks(s.contact.body).map((l) => ({ label: SOCIAL_LABEL[l.kind], href: l.href }))];
          panels.push(at({ links, foot }));
          break;
        }
        case "pivot:pivot":
          // The About title is the giant statement; the education line rides under it as meta.
          if (plain(s.about.body) || plain(s.about.title)) {
            panels.push(at({ title: s.about.title || p.title, body: excerpt(s.about.body), md: true, meta: education ? educationLine(education) : undefined }));
          }
          break;
        default:
          panels.push(p);
      }
    }
    return { ...c, panels };
  }).filter((c) => c.kind !== "section" || (c.panels?.length ?? 0) > 0); // an empty section is skipped entirely
}

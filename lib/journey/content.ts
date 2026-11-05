/**
 * TKT-77: fill the journey's placeholder panels with the site's existing content (no new content store, nothing
 * personal in git). Mapping agreed 2026-11-04:
 * - Sky: `hero` section (+ "Go straight to my desktop").
 * - Pivot (v1.1): `about` title as the statement, its first paragraph, and the first public education entry.
 * - Projects (v1.1): featured public projects (max 4) in the pinned showcase.
 * - Experience (v1.1): public roles in CV order, one per screen, ≤3 public bullets each.
 * - Creator (v1.1): `writing` pitch + Subscribe/Follow from `contact` links; latest YouTube / Instagram / article.
 * - Room: `now`, then the contact line (contact form + socials).
 * - Toolkit (v1.1): `technology` "## layer" blocks (fallback: project tags) + public certificate entries as badges.
 * - Room (redesign 2026-11-05): `now` section, then "Latest" (newest YouTube post + newest other post) with a
 *   contact line built from the Contact section's social links.
 * Empty sections and missing entries simply drop their panel.
 */
import type { Item } from "@/lib/experience";
import type { Section, SectionKey } from "@/lib/sections";
import type { LatestMedia } from "@/lib/articles-public";
import { featuredProjects, projectHref, type Project } from "@/lib/portfolio-core";
import { SHOWCASE_WIPE, showcaseScroll } from "./showcase";
import { firstHttps, parseToolkit, toolkitScroll } from "./toolkit";
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
  latest?: Partial<LatestMedia>;
  /** Public projects; the showcase keeps the featured ones (max 4). */
  projects?: Project[];
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

/** Scroll (screen heights) the Experience section gives each role, plus a short lead-in for its wipe. */
export const EXPERIENCE_PER_ROLE = 1;
export const EXPERIENCE_LEAD = 0.4;

export function withContent(chapters: readonly Chapter[], content: JourneyContent): Chapter[] {
  const s = content.sections;
  const education = content.experience.find((i) => i.kind === "education");

  const featured = featuredProjects(content.projects ?? []);
  const roles = content.experience.filter((i) => i.kind === "role" && i.public !== false);
  return chapters.map((c) => {
    if (c.id === "experience" && c.kind === "section") {
      // One screen per public role (in the owner's CV order), each with up to 3 public bullets as proof points.
      const scroll = EXPERIENCE_LEAD + Math.max(1, roles.length) * EXPERIENCE_PER_ROLE;
      const lead = EXPERIENCE_LEAD / scroll;
      const tpl = c.panels?.[0];
      const panels: Panel[] = tpl ? spread(roles.length, lead, 1).map((w, k) => {
        const r = roles[k];
        return {
          ...tpl, id: `r${k + 1}`, ...w, eyebrow: r.dates.trim() || "Role", title: r.title, meta: r.org.trim() || undefined,
          body: r.summary.trim() ? excerpt(r.summary, 220) : undefined, md: false,
          points: r.bullets.filter((b) => b.public && b.text.trim()).slice(0, 3).map((b) => b.text.trim()),
        };
      }) : [];
      return { ...c, scroll, wipe: Math.min(0.2, 0.25 / scroll), panels };
    }
    if (c.kind === "section" && c.toolkit) {
      // Layers from the Technology section's "## layer" blocks; without any, one layer of the projects' tags.
      let layers = parseToolkit(s.technology.body);
      const tags = [...new Set([...content.technologies, ...(content.projects ?? []).filter((p) => p.public).flatMap((p) => p.tags)])];
      if (!layers.length && tags.length) layers = [{ name: "Stack", how: plain(excerpt(s.technology.body, 160)), tools: tags.slice(0, 12) }];
      const certs = content.experience.filter((i) => i.kind === "certificate" && i.public !== false && i.title.trim())
        .map((i) => ({ title: i.title.trim(), org: i.org.trim(), href: firstHttps(i.summary) }));
      if (!layers.length) return { ...c, toolkit: { ...c.toolkit, layers: [], certs: [] } };
      const scroll = toolkitScroll(layers.length, certs.length);
      return { ...c, scroll, wipe: Math.min(0.2, 0.25 / scroll), toolkit: { title: s.technology.title.trim() || c.toolkit.title, layers, certs } };
    }
    if (c.kind === "section" && c.showcase) {
      // The showcase grows one screen of scroll per featured project; with none, the section is skipped below.
      const scroll = showcaseScroll(featured.length);
      return {
        ...c, scroll, wipe: SHOWCASE_WIPE / scroll,
        showcase: featured.map((p) => ({ slug: p.slug, name: p.name, tagline: p.tagline, tags: p.tags.slice(0, 3), href: projectHref(p.slug), shots: p.screenshots })),
      };
    }
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
        case "room:contact": {
          // The desk closes with one line: the contact form and every social link from the Contact section.
          const foot = [{ label: "Send a message", href: CONTACT_HREF }, ...socialLinks(s.contact.body).map((l) => ({ label: SOCIAL_LABEL[l.kind], href: l.href }))];
          panels.push(at({ foot }));
          break;
        }
        case "creator:pitch": {
          const socials = socialLinks(s.contact.body);
          const actions = [
            ...socials.filter((l) => l.kind === "youtube").map((l) => ({ label: "Subscribe on YouTube", href: l.href })),
            ...socials.filter((l) => l.kind === "instagram").map((l) => ({ label: "Follow on Instagram", href: l.href })),
          ];
          if (plain(s.writing.body) || actions.length) panels.push(at({ title: s.writing.title.trim() || p.title, body: excerpt(s.writing.body), md: true, actions }));
          break;
        }
        case "creator:latest": {
          const { video, instagram, article } = { video: null, instagram: null, article: null, ...content.latest };
          const links: PanelLink[] = [];
          if (video) links.push({ kicker: "Latest video", title: video.title, href: video.source_url, image: video.cover_url || undefined, external: true });
          if (instagram) links.push({ kicker: "Latest on Instagram", title: instagram.title, href: instagram.source_url, image: instagram.cover_url || undefined, external: true });
          if (article) links.push({ kicker: "Latest article", title: article.title, href: articleHref(article.slug), image: article.cover_url || undefined });
          if (links.length) panels.push(at({ links }));
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
  }).filter((c) => c.kind !== "section" || (c.panels?.length ?? 0) > 0 || (c.showcase?.length ?? 0) > 0 || (c.toolkit?.layers.length ?? 0) > 0); // an empty section is skipped entirely
}

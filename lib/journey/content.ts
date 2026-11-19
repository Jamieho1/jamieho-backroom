import {dialData,dialCount} from "./dial";
import type {ExperienceRow} from "@/lib/experience";
import type { Item } from "@/lib/experience";
import type { Section, SectionKey } from "@/lib/sections";
import type { LatestMedia } from "@/lib/articles-public";
import { type Project } from "@/lib/portfolio-core";
import {parseBuild} from "./build";
import { parseRotator, rotatorText } from "./motion";
import { articleHref, youtubeId } from "@/lib/articles";
import { SOCIAL_LABEL, socialLinks } from "@/lib/social";
import type { Chapter, Panel, PanelLink } from "./timeline";

/** The contact form on the existing site. */
export const CONTACT_HREF = "/#contact";

export interface JourneyContent {
  sections: Record<SectionKey, Section>;
  experience: Item[];
  journeyStops?: ExperienceRow[];
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
export const educationLine = (i: Item) => [i.title.replace(/\s*[–—-]\s*2:1\s+Upper Second Class\s*$/i, ""), meta(i)].map((s) => s.trim()).filter(Boolean).join(" · ");
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
    if(c.kind==="section"&&c.cta){const build=parseBuild(s.technology.body);return {...c,cta:{title:build.ctaTitle,label:build.ctaLabel}};}
    if(c.kind==="section"&&c.build){const build=parseBuild(s.technology.body);const title=s.technology.title.trim();return {...c,scroll:5.6,wipe:0,build:{...build,title:title&&!/^(Toolkit|Techstack)$/i.test(title)?title:build.title}};}
    const panels: Panel[] = [];
    for (const p of c.panels ?? []) {
      const at = (patch: Partial<Panel>): Panel => ({ ...p, ...patch });
      switch (`${c.id}:${p.id}`) {
        case "sky:hero":
        {
          // "I {build|ship|teach} …" in the Hero body cycles in the live journey; the still version reads the first option.
          const paragraphs = s.hero.body.trim().split(/\n\s*\n/);
          const role = paragraphs.length > 1 ? plain(paragraphs.shift()!) : undefined;
          const intro = excerpt(paragraphs.join("\n\n"));
          const rotator = parseRotator(intro) ?? undefined;
          panels.push(at({ title: s.hero.title || "Jamie Ho", body: rotator ? rotatorText(rotator) : intro, md: !rotator, rotator, meta: role, actions: (["youtube", "instagram", "linkedin"] as const).flatMap(kind => socialLinks(s.contact.body).filter(l => l.kind === kind).map(l => ({ label: SOCIAL_LABEL[kind], href: l.href, platform: kind }))), cta: undefined }));
        }
          break;
        case "creator:pitch": {
          // Brand-coloured YouTube / Instagram / LinkedIn buttons (icon + name), straight from the Contact section's links.
          const socials = socialLinks(s.contact.body);
          const actions = (["youtube", "instagram", "linkedin"] as const).flatMap((kind) =>
            socials.filter((l) => l.kind === kind).map((l) => ({ label: SOCIAL_LABEL[kind], href: l.href, platform: kind })));
          if (plain(s.writing.body) || actions.length) panels.push(at({ title: s.writing.title.trim() || p.title, body: excerpt(s.writing.body), md: true, actions }));
          break;
        }
        case "creator:latest": {
          // One card per platform: the newest post when there is one, otherwise a card pointing at the profile.
          const { video, instagram, rednote, article } = { video: null, instagram: null, rednote: null, article: null, ...content.latest };
          const profile = (kind: string) => socialLinks(s.contact.body).find((l) => l.kind === kind)?.href;
          const links: PanelLink[] = [];
          const yt = video ? youtubeId(video.source_url) : null;
          if (video) links.push({ platform: "youtube", kicker: "Latest video", title: video.title, href: video.source_url, external: true,
            image: video.cover_url || (yt ? `https://i.ytimg.com/vi/${yt}/hqdefault.jpg` : undefined) });
          else if (profile("youtube")) links.push({ platform: "youtube", placeholder: true, kicker: "YouTube", title: "10-minute AI builds, production-grade", href: profile("youtube")!, external: true });
          if (instagram) links.push({ platform: "instagram", kicker: "Instagram", title: instagram.title, href: instagram.source_url, image: instagram.cover_url || undefined, external: true });
          else if (profile("instagram")) links.push({ platform: "instagram", placeholder: true, kicker: "Instagram", title: "Latest posts", href: profile("instagram")!, external: true });
          if (rednote) links.push({ platform: "xiaohongshu", kicker: "RedNote", title: rednote.title, href: rednote.source_url, image: rednote.cover_url || undefined, external: true });
          else if (profile("xiaohongshu")) links.push({ platform: "xiaohongshu", placeholder: true, kicker: "RedNote", title: "Latest posts", href: profile("xiaohongshu")!, external: true });
          if (article) links.push({ platform: "article", kicker: "Latest article", title: article.title, href: articleHref(article.slug), image: article.cover_url || undefined });
          else if (links.length) links.push({ platform: "article", placeholder: true, kicker: "Articles", title: "Notes and references", href: "/articles" });
          if (links.length) panels.push(at({ links }));
          break;
        }
        case "about:about":
          // The About title is the giant statement; the education line rides under it as meta.
          if (plain(s.about.body) || plain(s.about.title)) {
            panels.push(at({ title: s.about.title || p.title, body: excerpt(s.about.body), md: true, meta: education ? educationLine(education) : undefined }));
          }
          break;
        default:
          panels.push(p);
      }
    }
    if(c.kind==="section"&&c.dial){const dial=dialData(content.journeyStops??[],content.projects??[]);return {...c,panels,dial,scroll:dialCount(dial)*1.35,wipe:0};}
    return { ...c, panels };
  }).filter((c) => c.kind !== "section" || (c.panels?.length ?? 0) > 0 || !!c.dial || !!c.build || !!c.cta); // an empty section is skipped entirely
}

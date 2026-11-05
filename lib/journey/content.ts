/**
 * TKT-77: fill the journey's placeholder panels with the site's existing content (no new content store, nothing
 * personal in git). Mapping agreed 2026-11-04:
 * - Sky: `hero` section.
 * - Imperial: the first public education entry (title · org · dates).
 * - Library: `about`, `interests`, `technology` (+ technologies used by public projects).
 * - Westminster: every other public experience entry, in order, stepping in one after another.
 * Empty sections and missing entries simply drop their panel.
 */
import type { Item } from "@/lib/experience";
import type { Section, SectionKey } from "@/lib/sections";
import type { Chapter, Panel } from "./timeline";

export interface JourneyContent {
  sections: Record<SectionKey, Section>;
  experience: Item[];
  technologies: string[];
}

/** Keep panels short: the first paragraph, cut at a word boundary. Markdown is kept (rendered safely). */
export function excerpt(markdown: string, max = 320): string {
  const first = markdown.trim().split(/\n\s*\n/)[0]?.trim() ?? "";
  if (first.length <= max) return first;
  const cut = first.slice(0, max);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), max - 40)).replace(/[\s,;:.-]+$/, "")}…`;
}

const meta = (i: Item) => [i.org, i.dates].map((s) => s.trim()).filter(Boolean).join(" · ");
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
  const journey = content.experience.filter((i) => i !== education && ["role", "project", "education", "other"].includes(i.kind));

  return chapters.map((c) => {
    const panels: Panel[] = [];
    for (const p of c.panels ?? []) {
      const at = (patch: Partial<Panel>): Panel => ({ ...p, ...patch });
      switch (`${c.id}:${p.id}`) {
        case "sky:hero":
          panels.push(at({ title: s.hero.title || "Jamie Ho", body: excerpt(s.hero.body), md: true }));
          break;
        case "imperial:imperial":
          if (education) panels.push(at({ eyebrow: "Where it started", title: education.title, meta: meta(education), body: excerpt(education.summary), md: false }));
          break;
        case "library:about":
        case "library:interests": {
          const sec = p.id === "about" ? s.about : s.interests;
          if (plain(sec.body)) panels.push(at({ eyebrow: undefined, title: sec.title || p.title, body: excerpt(sec.body), md: true }));
          break;
        }
        case "library:technology": {
          const body = excerpt(s.technology.body);
          if (plain(body) || content.technologies.length) panels.push(at({ eyebrow: undefined, title: s.technology.title || p.title, body, md: true, chips: content.technologies.slice(0, 12) }));
          break;
        }
        case "westminster:m1":
          spread(journey.length, 0.04, 0.7).forEach((w, k) => {
            const item = journey[k];
            panels.push({ ...p, id: `m${k + 1}`, ...w, eyebrow: item.dates || "Milestone", title: item.title, meta: item.org, body: excerpt(item.summary, 220), md: false });
          });
          break;
        case "westminster:m2":
        case "westminster:m3":
          break; // replaced by the generated milestones above
        default:
          panels.push(p);
      }
    }
    return { ...c, panels };
  });
}

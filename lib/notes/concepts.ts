/**
 * Concept sections of a coding note (Jamie 2026-10-26): every `### ` heading is a card; numbered ones (`### 3. …`) are
 * concepts. Each concept lists its NeetCode variations, so the Visuals tab can show those problems' visuals.
 */
import { NEETCODE_150 } from "./neetcode150";
import { Visual } from "./visual";


export interface ConceptSection {
  /** Heading text as written (e.g. "6. Prefix sum: …"). */
  title: string;
  /** Heading without the "N. " prefix; visuals use this as their `concept`. */
  name: string;
  id: string;
  numbered: boolean;
  body: string;
  when: string;
  badge: string;
  lcs: number[];
}

export const cardId = (title: string) => "sec-" + title.replace(/[*`]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const BY_TITLE = new Map(NEETCODE_150.map((a) => [a.title.toLowerCase(), a.lc]));

/** NeetCode problems named in the section's "Variations:" lines, in order, without repeats. */
export function variationLcs(body: string): number[] {
  const out: number[] = [];
  for (const line of body.split("\n")) {
    const m = /\*\*Variations\*\*:?\s*(.*)$/.exec(line);
    if (!m) continue;
    for (const raw of m[1].split(" · ")) {
      if (/\(LC \d+\)/.test(raw)) continue;
      const full = raw.replace(/[*`]/g, "").trim().toLowerCase();
      const name = full.replace(/\s*\(.*$/, "").trim();
      // Titles with brackets ("Implement Trie (Prefix Tree)", "Pow(x, n)") match whole; others drop a trailing note.
      const lc = BY_TITLE.get(full) ?? BY_TITLE.get(name);
      if (lc && !out.includes(lc)) out.push(lc);
    }
  }
  return out;
}

export function splitConcepts(md: string): { pre: string; sections: ConceptSection[] } {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const pre: string[] = [];
  const sections: ConceptSection[] = [];
  let cur: { title: string; body: string[] } | null = null;
  let fence = false;
  const flush = () => {
    if (!cur) return;
    const body = cur.body.join("\n").trim();
    const numbered = /^\d+\.\s/.test(cur.title);
    const when = /^\s*-\s*\*When\*:?\s*(.*)$/m.exec(body)?.[1] ?? "";
    const t = /\*\*Time\*\*[^O]{0,30}(O\([^)]*\))/.exec(body)?.[1];
    const s = /\*\*Space\*\*[^O]{0,30}(O\([^)]*\))/.exec(body)?.[1];
    sections.push({ title: cur.title, name: cur.title.replace(/^\d+\.\s*/, ""), id: cardId(cur.title), numbered, body, when, badge: t ? `${t}${s ? ` · ${s}` : ""}` : "", lcs: variationLcs(body) });
  };
  for (const line of lines) {
    if (/^```/.test(line)) fence = !fence;
    const h = !fence && /^###\s+(.*)$/.exec(line);
    if (h) {
      flush();
      cur = { title: h[1].trim(), body: [] };
    } else if (cur) cur.body.push(line);
    else pre.push(line);
  }
  flush();
  return { pre: pre.join("\n").trim(), sections };
}

export interface GalleryItem {
  key: string;
  short: string;
  visual: Visual;
  time: string;
  space: string;
}
export interface GalleryGroup {
  concept: string;
  items: GalleryItem[];
}

/** Group the visuals supplied by the database; problem-gallery visuals are supplied during the data copy. */
export function galleryGroups(md: string, stored: Visual[]): GalleryGroup[] {
  const { sections } = splitConcepts(md);
  const used = new Set<Visual>();
  const groups: GalleryGroup[] = [];
  for (const s of sections.filter((x) => x.numbered)) {
    const items: GalleryItem[] = [];
    stored
      .filter((v) => v.concept && v.concept.trim().toLowerCase() === s.name.toLowerCase())
      .forEach((v, i) => {
        used.add(v);
        items.push({ key: `c${s.id}-${i}`, short: v.title.split(" · ")[0], visual: v, time: v.time ?? "", space: v.space ?? "" });
      });
    if (items.length) groups.push({ concept: s.title, items });
  }
  const rest = stored.filter((v) => !used.has(v));
  if (rest.length) groups.push({ concept: "More", items: rest.map((v, i) => ({ key: `m${i}`, short: v.title.split(" · ")[0], visual: v, time: v.time ?? "", space: v.space ?? "" })) });
  return groups;
}

/**
 * Portfolio projects, pure parts (TKT-83/87): types, ordering and links. No Supabase import, so client code (the
 * journey) can use it without pulling the database client into the browser bundle.
 */
import { z } from "zod";

export interface Project {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  body: string;
  tags: string[];
  screenshots: string[];
  url: string;
  featured: boolean;
  public: boolean;
  sort: number;
  created_at: string;
}

export const PROJECT_SELECT = "id,slug,name,tagline,body,tags,screenshots,url,featured,public,sort,created_at";
/** The journey's showcase shows at most this many featured projects. */
export const FEATURED_LIMIT = 4;

export const projectHref = (slug: string) => `/projects/${encodeURIComponent(slug)}`;

/** Featured first, then the owner's sort order, then newest. */
export function sortProjects<T extends Pick<Project, "featured" | "sort" | "created_at">>(rows: T[]): T[] {
  return [...rows].sort((a, b) => Number(b.featured) - Number(a.featured) || a.sort - b.sort || b.created_at.localeCompare(a.created_at));
}

/** The showcase list: featured public projects only, in order, capped. */
export function featuredProjects<T extends Pick<Project, "featured" | "public" | "sort" | "created_at">>(rows: T[], limit = FEATURED_LIMIT): T[] {
  return sortProjects(rows.filter((p) => p.featured && p.public)).slice(0, limit);
}

/** "example.com" from a project's website, for the Visit button. */
export function siteHost(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return ""; }
}

/* ---- Owner editing (TKT-86) ---- */

export const PROJECT_LIMITS = { name: 80, tagline: 160, body: 50000, tags: 8, tag: 24, screenshots: 6 } as const;
export const RESERVED_SLUGS = ["new", "manage", "edit"];
const https = (s: string) => /^https:\/\/\S+$/.test(s) && s.length <= 2048;

/** Mirrors the database checks, so a bad draft is caught before it's sent. */
export const projectSchema = z.object({
  id: z.uuid(),
  slug: z.string().max(80).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).refine((s) => !RESERVED_SLUGS.includes(s)),
  name: z.string().trim().min(1).max(PROJECT_LIMITS.name),
  tagline: z.string().trim().max(PROJECT_LIMITS.tagline),
  body: z.string().max(PROJECT_LIMITS.body),
  tags: z.array(z.string().trim().min(1).max(PROJECT_LIMITS.tag)).max(PROJECT_LIMITS.tags),
  screenshots: z.array(z.string().refine(https)).max(PROJECT_LIMITS.screenshots),
  url: z.string().trim().refine((s) => s === "" || https(s)),
  featured: z.boolean(),
  public: z.boolean(),
  sort: z.number().int().min(-1000).max(1000),
});
export type ProjectEdit = z.infer<typeof projectSchema>;
export type ProjectSave = { ok: true; project: Project } | { ok: false; message: string };

export const emptyProject = (): ProjectEdit => ({
  id: crypto.randomUUID(), slug: "", name: "", tagline: "", body: "", tags: [], screenshots: [], url: "", featured: false, public: false, sort: 100,
});

/** "Next.js, Supabase,  ,next.js" → ["Next.js", "Supabase"] (trimmed, de-duplicated ignoring case). */
export function parseProjectTags(raw: string): string[] {
  const seen = new Set<string>();
  return raw.split(",").map((t) => t.trim()).filter((t) => t && !seen.has(t.toLowerCase()) && seen.add(t.toLowerCase()));
}

/** "Fin AI: Budget Coach!" → "fin-ai-budget-coach", a suggestion for a new project's slug. */
export function slugify(name: string): string {
  return name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

/** Move item `i` by `d` places (screenshot order); out-of-range moves are ignored. */
export function moveItem<T>(xs: T[], i: number, d: number): T[] {
  const j = i + d;
  if (j < 0 || j >= xs.length) return xs;
  const out = [...xs];
  [out[i], out[j]] = [out[j], out[i]];
  return out;
}

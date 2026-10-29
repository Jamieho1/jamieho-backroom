/**
 * Experience (TKT-55): roles, projects and education with bullets. Every item and bullet has a public flag;
 * new ones start hidden. The landing page reads with the public key, so the database only returns what's public.
 */
import { createClient } from "@supabase/supabase-js";
import { readSupabaseEnv } from "@/lib/env";

export const KINDS = ["role", "project", "education", "other"] as const;
export type Kind = (typeof KINDS)[number];
export const KIND_LABEL: Record<Kind, string> = { role: "Role", project: "Project", education: "Education", other: "Other" };

export interface Bullet {
  id?: string;
  text: string;
  public: boolean;
}
export interface Item {
  id?: string;
  kind: Kind;
  title: string;
  org: string;
  dates: string;
  location: string;
  summary: string;
  public: boolean;
  sort?: number;
  bullets: Bullet[];
}

export const LIMITS = { title: 160, org: 160, dates: 80, location: 80, summary: 2000, bullet: 1000 } as const;

export const emptyItem = (): Item => ({ kind: "role", title: "", org: "", dates: "", location: "", summary: "", public: false, bullets: [] });

interface Row {
  id: string;
  kind: Kind;
  title: string;
  org: string;
  dates: string;
  location: string;
  summary: string;
  public: boolean;
  sort: number;
  experience_bullets: { id: string; text: string; public: boolean; sort: number }[] | null;
}

export const SELECT = "id, kind, title, org, dates, location, summary, public, sort, experience_bullets(id, text, public, sort)";

export function fromRows(rows: Row[]): Item[] {
  return [...rows]
    .sort((a, b) => a.sort - b.sort)
    .map((r) => ({
      id: r.id,
      kind: r.kind,
      title: r.title,
      org: r.org,
      dates: r.dates,
      location: r.location,
      summary: r.summary,
      public: r.public,
      sort: r.sort,
      bullets: [...(r.experience_bullets ?? [])].sort((a, b) => a.sort - b.sort).map((b) => ({ id: b.id, text: b.text, public: b.public })),
    }));
}

/** Validation shared by the editor and the server action. Returns an error message or null. */
export function validateItem(item: Item): string | null {
  if (!KINDS.includes(item.kind)) return "Unknown type.";
  if (!item.title.trim()) return "Give it a title first.";
  for (const k of ["title", "org", "dates", "location", "summary"] as const) if (item[k].length > LIMITS[k]) return `The ${k} is too long.`;
  if (item.bullets.some((b) => b.text.length > LIMITS.bullet)) return "A bullet is too long.";
  return null;
}

/** For the pre-rendered landing page: only what the database lets anyone see. Throws if Supabase is down. */
export async function getPublicExperience(): Promise<Item[]> {
  const env = readSupabaseEnv();
  if (!env) return [];
  const sb = createClient(env.url, env.anonKey, { auth: { persistSession: false } });
  const { data, error } = await sb.from("experience_items").select(SELECT).order("sort");
  if (error) throw new Error(`experience: ${error.message}`);
  return fromRows((data ?? []) as Row[]).map((i) => ({ ...i, bullets: i.bullets.filter((b) => b.text.trim()) }));
}

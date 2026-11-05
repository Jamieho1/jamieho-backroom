/**
 * Portfolio projects (Home v1.1, TKT-83): the things Jamie built, separate from the apps registry (which stays the
 * desktop's launchers). Read with the public key and no cookies so the pages pre-render; RLS hides private rows.
 * Content lives only in public.projects, edited by the owner on the site (TKT-86). Nothing personal in git.
 */
import { createClient } from "@supabase/supabase-js";
import { readSupabaseEnv } from "@/lib/env";

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

function publicClient() {
  const env = readSupabaseEnv();
  return env ? createClient(env.url, env.anonKey, { auth: { persistSession: false } }) : null;
}

/** Public projects, featured first. Throws if Supabase is down so Next keeps serving the last good page. */
export async function getPublicProjects(): Promise<Project[]> {
  const sb = publicClient();
  if (!sb) return [];
  const { data, error } = await sb.from("projects").select(PROJECT_SELECT).eq("public", true);
  if (error) throw new Error("Projects unavailable");
  return sortProjects((data ?? []) as Project[]);
}

export async function getPublicProject(slug: string): Promise<Project | null> {
  const sb = publicClient();
  if (!sb) return null;
  const { data, error } = await sb.from("projects").select(PROJECT_SELECT).eq("slug", slug).eq("public", true).maybeSingle();
  if (error) throw new Error("Projects unavailable");
  return (data as Project | null) ?? null;
}

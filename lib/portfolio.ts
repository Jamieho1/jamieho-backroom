/**
 * Portfolio projects (Home v1.1, TKT-83): the things Jamie built, separate from the apps registry (which stays the
 * desktop's launchers). Read with the public key and no cookies so the pages pre-render; RLS hides private rows.
 * Content lives only in public.projects, edited by the owner on the site (TKT-86). Nothing personal in git.
 */
import { createClient } from "@supabase/supabase-js";
import { readSupabaseEnv } from "@/lib/env";
import { projectScreenshots } from "./project-art";
import { PROJECT_SELECT, sortProjects, type Project } from "./portfolio-core";
export * from "./portfolio-core";

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
  return sortProjects((data ?? []) as Project[]).map(p => ({ ...p, screenshots: projectScreenshots(p.slug, p.screenshots) }));
}

export async function getPublicProject(slug: string): Promise<Project | null> {
  const sb = publicClient();
  if (!sb) return null;
  const { data, error } = await sb.from("projects").select(PROJECT_SELECT).eq("slug", slug).eq("public", true).maybeSingle();
  if (error) throw new Error("Projects unavailable");
  return data ? { ...data as Project, screenshots: projectScreenshots(data.slug, data.screenshots) } : null;
}

/**
 * Portfolio projects, pure parts (TKT-83/87): types, ordering and links. No Supabase import, so client code (the
 * journey) can use it without pulling the database client into the browser bundle.
 */
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

/** Slim, serialisable project data for the index and the next-project card (no Markdown body). */
import type {Project} from "@/lib/portfolio-core";
import {normalizeCapabilities, type CapabilityId} from "@/lib/project-capabilities";

export interface ProjectSummary {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  tags: string[];
  screenshots: string[];
  url: string;
  featured: boolean;
  status: string;
  capabilities: CapabilityId[];
  draftChanged?: boolean;
}

export function toSummary(p: Project): ProjectSummary {
  return {id: p.id, slug: p.slug, name: p.name, tagline: p.tagline, tags: p.tags, screenshots: p.screenshots, url: p.url, featured: p.featured, status: p.status ?? "", capabilities: normalizeCapabilities(p.capabilities), ...(p.draftChanged ? {draftChanged: true} : {})};
}

export const pad2 = (n: number) => String(n).padStart(2, "0");
export const isVolunteer = (tag: string) => tag.trim().toLowerCase() === "volunteer";
/** "example.com" for the frame's address bar. */
export function hostOf(url: string): string {
  try {return new URL(url).hostname.replace(/^www\./, "");} catch {return "";}
}

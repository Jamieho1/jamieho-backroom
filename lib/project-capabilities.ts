/**
 * Project capabilities: the five "What I build" items, numbered 01-05. Pure helpers shared by the /projects filter,
 * the case-study meta grid, the Content Drafts allowlist and tests. Titles come from the approved default copy.
 */
import {z} from "zod";
import {DEFAULT_BUILD} from "@/lib/journey/build";

export const CAPABILITY_IDS = ["01", "02", "03", "04", "05"] as const;
export type CapabilityId = (typeof CAPABILITY_IDS)[number];
export const CAPABILITY_TITLES: Record<CapabilityId, string> = Object.fromEntries(CAPABILITY_IDS.map((id, i) => [id, DEFAULT_BUILD.items[i].title])) as Record<CapabilityId, string>;

/** Array of '01'..'05', unique, at most five. Mirrors private.valid_project_capabilities. */
export const capabilitiesSchema = z.array(z.enum(CAPABILITY_IDS)).max(5).refine(list => new Set(list).size === list.length, "Capabilities must be unique.");
/** Short optional status line (trimmed, up to 80 characters). */
export const statusSchema = z.string().trim().max(80).refine(value => !value.includes("\0"), "Text cannot contain NUL.");

export const isCapability = (value: unknown): value is CapabilityId => typeof value === "string" && (CAPABILITY_IDS as readonly string[]).includes(value);

/** Sorted, de-duplicated, valid ids only; tolerates a database that has not got the column yet. */
export function normalizeCapabilities(value: unknown): CapabilityId[] {
  if (!Array.isArray(value)) return [];
  return CAPABILITY_IDS.filter(id => value.includes(id));
}

/** The ?capability= value, or null for "All" (anything unknown is treated as All). */
export function parseCapabilityParam(raw: string | string[] | null | undefined): CapabilityId | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return isCapability(value) ? value : null;
}

/** Search string for the filter state: "" for All, "?capability=01" otherwise. */
export const capabilitySearch = (capability: CapabilityId | null) => (capability ? `?capability=${capability}` : "");

export function filterByCapability<T extends {capabilities?: readonly string[]}>(projects: readonly T[], capability: CapabilityId | null): T[] {
  return capability ? projects.filter(project => project.capabilities?.includes(capability)) : [...projects];
}

/** "01 · 04" */
export const capabilityNumbers = (capabilities: readonly string[] | undefined) => normalizeCapabilities(capabilities).join(" · ");

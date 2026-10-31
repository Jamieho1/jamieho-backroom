/**
 * Projects (TKT-56): cards built from the app registry (public.apps). Add a row → a new card, no code change.
 * Owner-only apps (Settings) never get a card.
 */
import { createClient } from "@supabase/supabase-js";
import { readSupabaseEnv } from "@/lib/env";
import type { AppRow } from "@/lib/apps";

/** The desktop shell is available (TKT-60). */
export const DESKTOP_READY = true;

export const CARD_LIMITS = { name: 60, description: 400, tags: 8, tag: 24, screenshots: 6 } as const;

/** Mirrors the seed rows; used only when Supabase isn't configured (local dev, CI). */
export const FALLBACK_APPS: AppRow[] = [
  { id: "notes", name: "Notes", icon: "notes", kind: "internal", url: "/desktop?app=notes", visibility: "signed_in", screenshots: [], tags: ["Next.js", "Supabase", "Markdown"], description: "Coding-interview notes: concept cards, step-by-step visuals and the problems for each pattern.", sort: 10, locked: false },
  { id: "practice", name: "Practice", icon: "code", kind: "internal", url: "/desktop?app=practice", visibility: "signed_in", screenshots: [], tags: ["Pyodide", "CodeMirror", "TypeScript"], description: "A LeetCode-style practice arena that runs Python in your browser, with solutions and visuals.", sort: 20, locked: false },
  { id: "behavioral", name: "Behavioral", icon: "chat", kind: "internal", url: "/desktop?app=behavioral", visibility: "invite_only", screenshots: [], tags: ["STAR", "Interview prep"], description: "Experience mapped to STAR stories and a behavioural question bank.", sort: 30, locked: false },
];

/** Pre-rendered pages read with the public key. Throws if Supabase is down so the last good page is kept. */
export async function getProjectApps(): Promise<AppRow[]> {
  const env = readSupabaseEnv();
  if (!env) return FALLBACK_APPS;
  const sb = createClient(env.url, env.anonKey, { auth: { persistSession: false } });
  const { data, error } = await sb.from("apps").select("*").neq("visibility", "owner_only").order("sort");
  if (error) throw new Error(`apps: ${error.message}`);
  return (data ?? []) as AppRow[];
}

export interface CardEdit {
  name: string;
  description: string;
  tags: string[];
  screenshots: string[];
}

export function parseTags(raw: string): string[] {
  return [...new Set(raw.split(",").map((t) => t.trim()).filter(Boolean))];
}
export function parseLines(raw: string): string[] {
  return raw.split("\n").map((l) => l.trim()).filter(Boolean);
}

/** Error message, or null when the card can be saved. Screenshots must be https links. */
export function validateCard(c: CardEdit): string | null {
  if (!c.name.trim()) return "Give it a name.";
  if (c.name.length > CARD_LIMITS.name) return "The name is too long.";
  if (c.description.length > CARD_LIMITS.description) return `Keep the description under ${CARD_LIMITS.description} characters.`;
  if (c.tags.length > CARD_LIMITS.tags) return `Up to ${CARD_LIMITS.tags} tags.`;
  if (c.tags.some((t) => t.length > CARD_LIMITS.tag)) return `Each tag up to ${CARD_LIMITS.tag} characters.`;
  if (c.screenshots.length > CARD_LIMITS.screenshots) return `Up to ${CARD_LIMITS.screenshots} screenshots.`;
  for (const s of c.screenshots) {
    try {
      if (new URL(s).protocol !== "https:") return "Screenshot links must start with https://";
    } catch {
      return `"${s}" isn't a link.`;
    }
  }
  return null;
}

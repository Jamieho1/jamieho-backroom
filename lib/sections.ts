/**
 * Landing-page sections (TKT-54). The words live in public.site_sections, never in git.
 * The page is pre-rendered from them and re-rendered on demand when the owner saves.
 */
import { createClient } from "@supabase/supabase-js";
import { readSupabaseEnv } from "@/lib/env";

export const SECTION_KEYS = ["hero", "about", "writing", "contact"] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];
export interface Section {
  key: SectionKey;
  title: string;
  body: string;
}

export const MAX_BODY = 20_000;
export const MAX_TITLE = 120;

/** Used only when Supabase isn't configured (local dev without keys, CI). Placeholders, no personal text. */
export const FALLBACK_SECTIONS: Record<SectionKey, Section> = {
  hero: { key: "hero", title: "Jamie Ho", body: "Software engineer in London." },
  about: { key: "about", title: "About", body: "*Write a short paragraph about yourself here.*" },
  writing: { key: "writing", title: "Writing & videos", body: "*Add links to your YouTube channel, articles or talks here.*" },
  contact: { key: "contact", title: "Contact", body: "*Say how people can reach you for work.*" },
};

export function isSectionKey(k: unknown): k is SectionKey {
  return typeof k === "string" && (SECTION_KEYS as readonly string[]).includes(k);
}

/**
 * Read with the public key and no cookies, so the page can be pre-rendered.
 * When Supabase is configured but unreachable this throws: Next then keeps serving the last good page.
 */
export async function getSections(): Promise<Record<SectionKey, Section>> {
  const env = readSupabaseEnv();
  if (!env) return FALLBACK_SECTIONS;
  const sb = createClient(env.url, env.anonKey, { auth: { persistSession: false } });
  const { data, error } = await sb.from("site_sections").select("key, title, body");
  if (error) throw new Error(`site_sections: ${error.message}`);
  const out = { ...FALLBACK_SECTIONS };
  for (const row of data ?? []) if (isSectionKey(row.key)) out[row.key] = { key: row.key, title: row.title ?? "", body: row.body ?? "" };
  return out;
}

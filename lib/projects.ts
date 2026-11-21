/**
 * Projects (TKT-56): cards built from the app registry (public.apps). Add a row → a new card, no code change.
 * Owner-only apps (Settings) never get a card.
 */
import { createClient } from "@supabase/supabase-js";
import { readSupabaseEnv } from "@/lib/env";
import type { AppRow } from "@/lib/apps";

/** Mirrors the seed rows; used only when Supabase isn't configured (local dev, CI). */
export const FALLBACK_APPS: AppRow[] = [
  { id: "notes", name: "Notes", icon: "notes", kind: "internal", url: "/notes", visibility: "signed_in", screenshots: [], tags: ["Next.js", "Supabase", "Markdown"], description: "Coding-interview notes: concept cards, step-by-step visuals and the problems for each pattern.", sort: 10, locked: false },
  { id: "practice", name: "Practice", icon: "code", kind: "internal", url: "/practices", visibility: "signed_in", screenshots: [], tags: ["Pyodide", "CodeMirror", "TypeScript"], description: "A LeetCode-style practice arena that runs Python in your browser, with solutions and visuals.", sort: 20, locked: false },
  { id: "behavioral", name: "Behavioral", icon: "chat", kind: "internal", url: "/behavioral", visibility: "invite_only", screenshots: [], tags: ["STAR", "Interview prep"], description: "Experience mapped to STAR stories and a behavioural question bank.", sort: 30, locked: false },
  { id:"articles",name:"Articles",icon:"articles",kind:"internal",url:"/articles",visibility:"public",screenshots:[],tags:["References","Writing"],description:"Extra references and reading for videos and posts.",sort:35,locked:true },
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

/**
 * Projects (TKT-56): cards built from the app registry (public.apps). Add a row → a new card, no code change.
 * Owner-only apps (Settings) never get a card.
 */
import { createClient } from "@supabase/supabase-js";
import { readSupabaseEnv } from "@/lib/env";
import type { AppRow } from "@/lib/apps";

/** Mirrors the seed row for the page that still exists here; used only when Supabase isn't configured (local dev, CI). Notes, Practice and Behavioral moved to PassLoop. */
export const FALLBACK_APPS: AppRow[] = [
  { id:"articles",name:"Articles",icon:"articles",kind:"internal",url:"/content",visibility:"public",screenshots:[],tags:["References","Writing"],description:"Extra references and reading for videos and posts.",sort:35,locked:true },
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

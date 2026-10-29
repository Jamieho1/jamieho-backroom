/**
 * Health check (TKT-51): proves the deployed app can reach Supabase with a real round-trip to its Auth
 * health endpoint. Needs no tables, so it works before any schema exists.
 */
import type { SupabaseEnv } from "./env";

export type SupabaseStatus = "ok" | "unconfigured" | "unreachable";

export interface Health {
  ok: boolean;
  app: "jamieho-backroom";
  supabase: SupabaseStatus;
  latencyMs?: number;
  checkedAt: string;
}

type Fetch = (input: string, init?: RequestInit) => Promise<Response>;

export async function checkHealth(env: SupabaseEnv | null, fetchImpl: Fetch = fetch, now: () => number = Date.now): Promise<Health> {
  const base = { app: "jamieho-backroom" as const, checkedAt: new Date(now()).toISOString() };
  if (!env) return { ...base, ok: false, supabase: "unconfigured" };
  const start = now();
  try {
    const res = await fetchImpl(`${env.url}/auth/v1/health`, {
      headers: { apikey: env.anonKey },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    const latencyMs = now() - start;
    return res.ok ? { ...base, ok: true, supabase: "ok", latencyMs } : { ...base, ok: false, supabase: "unreachable", latencyMs };
  } catch {
    return { ...base, ok: false, supabase: "unreachable" };
  }
}

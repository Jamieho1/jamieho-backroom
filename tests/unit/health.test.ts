import { describe, it, expect } from "vitest";
import { readSupabaseEnv } from "@/lib/env";
import { checkHealth } from "@/lib/health";

const env = { url: "https://abc.supabase.co", anonKey: "public-anon-key" };
const clock = () => 1_000;

describe("readSupabaseEnv", () => {
  it("is null until both public values are set", () => {
    expect(readSupabaseEnv({})).toBeNull();
    expect(readSupabaseEnv({ NEXT_PUBLIC_SUPABASE_URL: "https://abc.supabase.co" })).toBeNull();
  });
  it("trims and drops a trailing slash", () => {
    expect(readSupabaseEnv({ NEXT_PUBLIC_SUPABASE_URL: " https://abc.supabase.co/ ", NEXT_PUBLIC_SUPABASE_ANON_KEY: " k " })).toEqual({ url: "https://abc.supabase.co", anonKey: "k" });
  });
});

describe("checkHealth", () => {
  it("reports unconfigured without calling anything", async () => {
    let called = false;
    const h = await checkHealth(null, async () => ((called = true), new Response()), clock);
    expect(h).toMatchObject({ ok: false, supabase: "unconfigured" });
    expect(called).toBe(false);
  });
  it("calls the Auth health endpoint with the public key and reports ok", async () => {
    let seen: { url: string; key?: string } | null = null;
    const h = await checkHealth(env, async (url, init) => {
      seen = { url, key: (init?.headers as Record<string, string>).apikey };
      return new Response("{}", { status: 200 });
    }, clock);
    expect(seen).toEqual({ url: "https://abc.supabase.co/auth/v1/health", key: "public-anon-key" });
    expect(h).toMatchObject({ ok: true, supabase: "ok", app: "jamieho-backroom" });
  });
  it("reports unreachable on an error status or a network failure", async () => {
    expect(await checkHealth(env, async () => new Response("", { status: 500 }), clock)).toMatchObject({ ok: false, supabase: "unreachable" });
    expect(await checkHealth(env, async () => { throw new Error("offline"); }, clock)).toMatchObject({ ok: false, supabase: "unreachable" });
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";

const select = vi.fn();
vi.mock("@supabase/supabase-js", () => ({ createClient: () => ({ from: () => ({ select }) }) }));
import { getSections, FALLBACK_SECTIONS } from "@/lib/sections";

const ENV = { NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co", NEXT_PUBLIC_SUPABASE_ANON_KEY: "k" };

describe("getSections", () => {
  beforeEach(() => {
    select.mockReset();
    for (const k of Object.keys(ENV)) delete process.env[k];
  });
  it("uses placeholders when Supabase isn't configured (CI, local dev)", async () => {
    expect(await getSections()).toEqual(FALLBACK_SECTIONS);
    expect(select).not.toHaveBeenCalled();
  });
  it("uses the database rows, keeping placeholders for missing keys and ignoring unknown ones", async () => {
    Object.assign(process.env, ENV);
    select.mockResolvedValue({ data: [{ key: "about", title: "About me", body: "Hi" }, { key: "cv", title: "x", body: "y" }], error: null });
    const s = await getSections();
    expect(s.about).toEqual({ key: "about", title: "About me", body: "Hi" });
    expect(s.hero).toEqual(FALLBACK_SECTIONS.hero);
    expect(Object.keys(s)).toEqual(["hero", "about", "writing", "contact"]);
  });
  it("throws when Supabase is down, so Next keeps serving the last good page instead of placeholders", async () => {
    Object.assign(process.env, ENV);
    select.mockResolvedValue({ data: null, error: { message: "fetch failed" } });
    await expect(getSections()).rejects.toThrow(/fetch failed/);
  });
});

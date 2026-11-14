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
    expect(Object.keys(s)).toEqual(["hero", "now", "about", "interests", "technology", "writing", "contact"]);
    expect(s.interests.body).toBe("");
    expect(s.technology.body).toBe("");
  });
  it("overlays only the explicit owner-validated preview context and leaves public reads unchanged", async () => {
    const preview = { id: "draft", summary: "Hero edit", operations: [{ op: "update" as const, table: "site_sections" as const, key: "hero" as const, fields: { title: "Owner preview" } }] };
    expect((await getSections(preview)).hero.title).toBe("Owner preview");
    expect((await getSections()).hero.title).toBe("Jamie Ho");
    Object.assign(process.env, ENV);
    select.mockResolvedValue({ data: [{key:"hero",title:"Live heading",body:"Live body"}],error:null });
    expect((await getSections(preview)).hero).toEqual({key:"hero",title:"Owner preview",body:"Live body"});
    expect((await getSections()).hero.title).toBe("Live heading");
  });
  it("throws when Supabase is down, so Next keeps serving the last good page instead of placeholders", async () => {
    Object.assign(process.env, ENV);
    select.mockResolvedValue({ data: null, error: { message: "fetch failed" } });
    await expect(getSections()).rejects.toThrow(/fetch failed/);
  });
});

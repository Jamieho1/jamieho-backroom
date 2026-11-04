import { describe, expect, it } from "vitest";
import { HOME_CHAPTERS } from "@/lib/journey/chapters";
import { excerpt, spread, withContent } from "@/lib/journey/content";
import { FALLBACK_SECTIONS } from "@/lib/sections";
import type { Item } from "@/lib/experience";

const item = (over: Partial<Item>): Item => ({ kind: "role", title: "T", org: "O", dates: "2024", location: "", summary: "S", public: true, bullets: [], ...over });
const sections = {
  ...FALLBACK_SECTIONS,
  hero: { key: "hero" as const, title: "Test Name", body: "First line.\n\nSecond paragraph." },
  about: { key: "about" as const, title: "About", body: "About text." },
  interests: { key: "interests" as const, title: "Interests", body: "" },
  technology: { key: "technology" as const, title: "Technology", body: "" },
};
const panelsOf = (chapters: ReturnType<typeof withContent>, id: string) => chapters.find((c) => c.id === id)?.panels ?? [];

describe("journey content (TKT-77)", () => {
  it("keeps panels short", () => {
    expect(excerpt("One.\n\nTwo.")).toBe("One.");
    const long = excerpt("word ".repeat(200), 50);
    expect(long.length).toBeLessThanOrEqual(51);
    expect(long.endsWith("…")).toBe(true);
  });

  it("spreads milestones evenly without overlap", () => {
    const w = spread(3, 0, 0.6);
    expect(w).toHaveLength(3);
    expect(w[0].from).toBe(0);
    expect(w[2].to).toBeCloseTo(0.6);
    for (let i = 1; i < w.length; i++) expect(w[i].from).toBeGreaterThan(w[i - 1].to);
    expect(spread(0, 0, 1)).toEqual([]);
  });

  it("maps sections and experience onto the chapters, dropping empty ones", () => {
    const experience = [
      item({ kind: "education", title: "MEng", org: "Uni", dates: "2016–2020" }),
      item({ title: "Intern", org: "A" }),
      item({ title: "Engineer", org: "B" }),
    ];
    const out = withContent(HOME_CHAPTERS, { sections, experience, technologies: ["TypeScript", "Supabase"] });
    expect(panelsOf(out, "sky")[0]).toMatchObject({ title: "Test Name", body: "First line.", md: true });
    expect(panelsOf(out, "imperial")[0]).toMatchObject({ title: "MEng", meta: "Uni · 2016–2020" });
    const lib = panelsOf(out, "library");
    expect(lib.map((p) => p.id)).toEqual(["about", "technology"]); // empty interests dropped
    expect(lib[1].chips).toEqual(["TypeScript", "Supabase"]);
    const w = panelsOf(out, "westminster");
    expect(w.map((p) => p.title)).toEqual(["Intern", "Engineer"]);
    expect(w.map((p) => p.id)).toEqual(["m1", "m2"]);
  });

  it("drops the Imperial and Westminster panels when there is no public experience", () => {
    const out = withContent(HOME_CHAPTERS, { sections, experience: [], technologies: [] });
    expect(panelsOf(out, "imperial")).toEqual([]);
    expect(panelsOf(out, "westminster")).toEqual([]);
    expect(panelsOf(out, "library").map((p) => p.id)).toEqual(["about"]);
  });
});

import { describe, expect, it } from "vitest";
import { FEATURED_LIMIT, featuredProjects, projectHref, siteHost, sortProjects } from "@/lib/portfolio";
import { emptyProject, moveItem, parseProjectTags, projectSchema, slugify } from "@/lib/portfolio-core";

const p = (slug: string, over: Partial<{ featured: boolean; public: boolean; sort: number; created_at: string }> = {}) =>
  ({ slug, featured: false, public: true, sort: 100, created_at: "2026-11-01T00:00:00Z", ...over });

describe("portfolio projects (TKT-83)", () => {
  it("lists featured first, then by sort, then newest", () => {
    const rows = [
      p("old", { created_at: "2026-01-01T00:00:00Z" }),
      p("new", { created_at: "2026-11-01T00:00:00Z" }),
      p("pinned", { sort: 1 }),
      p("star", { featured: true, sort: 50 }),
    ];
    expect(sortProjects(rows).map((r) => r.slug)).toEqual(["star", "pinned", "new", "old"]);
  });

  it("showcases featured public projects only, capped at four", () => {
    const rows = [
      ...Array.from({ length: 6 }, (_, k) => p(`f${k}`, { featured: true, sort: k })),
      p("hidden-star", { featured: true, public: false, sort: -1 }),
      p("plain"),
    ];
    const shown = featuredProjects(rows).map((r) => r.slug);
    expect(shown).toEqual(["f0", "f1", "f2", "f3"]);
    expect(shown).toHaveLength(FEATURED_LIMIT);
    expect(featuredProjects([p("plain")])).toEqual([]);
  });

  it("builds safe links and a readable host", () => {
    expect(projectHref("fin-ai")).toBe("/projects/fin-ai");
    expect(siteHost("https://www.example.com/app")).toBe("example.com");
    expect(siteHost("not a url")).toBe("");
  });
});


describe("project editing (TKT-86)", () => {
  const ok = { ...emptyProject(), slug: "fin-ai", name: "FinAI" };
  it("accepts a minimal hidden, unfeatured project without a website", () => {
    expect(projectSchema.safeParse(ok).success).toBe(true);
    expect(ok.public).toBe(false);
    expect(ok.featured).toBe(false);
  });
  it("rejects what the database would reject", () => {
    for (const bad of [
      { slug: "manage" }, { slug: "Bad Slug" }, { name: " " }, { url: "http://example.com" }, { url: "javascript:alert(1)" },
      { screenshots: ["http://example.com/a.png"] }, { screenshots: Array(7).fill("https://a/b.png") },
      { tags: Array(9).fill("x") }, { tags: ["x".repeat(25)] }, { tagline: "x".repeat(161) }, { sort: 1.5 },
    ]) expect(projectSchema.safeParse({ ...ok, ...bad }).success, JSON.stringify(bad)).toBe(false);
  });
  it("cleans tags, suggests slugs and reorders screenshots", () => {
    expect(parseProjectTags("Next.js, Supabase,  ,next.js")).toEqual(["Next.js", "Supabase"]);
    expect(slugify("Fin AI: Budget Coach!")).toBe("fin-ai-budget-coach");
    expect(moveItem(["a", "b", "c"], 2, -1)).toEqual(["a", "c", "b"]);
    expect(moveItem(["a", "b"], 0, -1)).toEqual(["a", "b"]);
  });
});

import { describe, expect, it } from "vitest";
import { FEATURED_LIMIT, featuredProjects, projectHref, siteHost, sortProjects } from "@/lib/portfolio";

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

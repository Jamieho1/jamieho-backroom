import { describe, it, expect } from "vitest";
import { journeyPosition, projectTechnologies } from "@/lib/home";
import { FALLBACK_APPS } from "@/lib/projects";

describe("Home project technology evidence", () => {
  it("uses actual project tags, deduplicates shared tools and excludes owner-only cards and topic tags", () => {
    const cards = [FALLBACK_APPS[0], { ...FALLBACK_APPS[1], tags: ["Next.js", "next.js", "Unknown claim", "TypeScript"] }, { ...FALLBACK_APPS[2], visibility: "owner_only" as const, tags: ["AWS"] }];
    const tools = projectTechnologies(cards);
    expect(tools.map(tool => tool.name)).toEqual(["Next.js", "Supabase", "Markdown", "TypeScript"]);
    expect(tools[0].projects.map(project => project.id)).toEqual(["notes", "practice"]);
    expect(projectTechnologies([])).toEqual([]);
  });
});

describe("Home camera reading holds", () => {
  const tops = [0, 700, 2500, 3200, 4100];
  it("holds the camera through a long section, then moves near the next section", () => {
    expect(journeyPosition(tops, 700, 700)).toEqual({ time: 1, hold: true });
    expect(journeyPosition(tops, 1800, 700)).toEqual({ time: 1, hold: true });
    const moving = journeyPosition(tops, 2350, 700);
    expect(moving.time).toBeGreaterThan(1); expect(moving.time).toBeLessThan(2); expect(moving.hold).toBe(false);
    expect(journeyPosition(tops, 2500, 700)).toEqual({ time: 2, hold: true });
  });
  it("supports restored anchors, missing optional stops and overscroll without an extra camera leg", () => {
    expect(journeyPosition([0, 700, 3200], 3200, 700)).toEqual({ time: 2, hold: true });
    expect(journeyPosition(tops, 9000, 700)).toEqual({ time: 4, hold: true });
    expect(journeyPosition(tops, -50, 700)).toEqual({ time: 0, hold: true });
    expect(journeyPosition([], 40, 700)).toEqual({ time: 0, hold: true });
    expect(journeyPosition([0, 700.4, 1800.6], 1800, 700)).toEqual({ time: 2, hold: true });
  });
});

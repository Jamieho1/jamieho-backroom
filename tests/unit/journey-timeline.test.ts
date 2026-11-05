import { describe, expect, it } from "vitest";
import { HOME_CHAPTERS } from "@/lib/journey/chapters";
import {
  type Chapter, alignAt, displayOpacity, wordReveal, approach, joinOpacity, layout, locate, mapKeys, panelOpacity, progressOf, validateKeys,
} from "@/lib/journey/timeline";

const demo: Chapter[] = [
  { id: "a", label: "A", kind: "video", src: "a", scroll: 2 },
  { id: "b", label: "B", kind: "fade", color: "#000", scroll: 1 },
  { id: "c", label: "C", kind: "video", src: "c", scroll: 1, join: 0.1, align: { scale: 1.1, x: -0.04, y: 0, span: 0.5 } },
];

describe("journey timeline", () => {
  it("maps scroll to media time through the keys, slow while reading then faster", () => {
    const keys = [[0, 0], [0.4, 0.2], [1, 1]] as const;
    expect(mapKeys(keys, 0)).toBe(0);
    expect(mapKeys(keys, 0.2)).toBeCloseTo(0.1);
    expect(mapKeys(keys, 0.4)).toBeCloseTo(0.2);
    expect(mapKeys(keys, 0.7)).toBeCloseTo(0.6);
    expect(mapKeys(keys, 1)).toBe(1);
    expect(mapKeys(keys, 2)).toBe(1);
    expect(mapKeys(undefined, 0.3)).toBe(0.3);
  });

  it("finds the chapter and local progress, including both ends and reverse", () => {
    const lay = layout(demo);
    expect(lay).toEqual({ starts: [0, 2, 3], total: 4 });
    expect(locate(demo, 0)).toEqual({ index: 0, local: 0 });
    expect(locate(demo, 0.25)).toEqual({ index: 0, local: 0.5 });
    expect(locate(demo, 0.625)).toEqual({ index: 1, local: 0.5 });
    expect(locate(demo, 1)).toEqual({ index: 2, local: 1 });
    expect(locate(demo, -1)).toEqual({ index: 0, local: 0 });
    expect(progressOf(demo, "c")).toBe(0.75);
    expect(progressOf(demo, "missing")).toBe(0);
  });

  it("fades panels in and out inside their window only", () => {
    const p = { from: 0.2, to: 0.6 };
    expect(panelOpacity(p, 0.1)).toBe(0);
    expect(panelOpacity(p, 0.4)).toBe(1);
    expect(panelOpacity(p, 0.21)).toBeGreaterThan(0);
    expect(panelOpacity(p, 0.21)).toBeLessThan(1);
    expect(panelOpacity(p, 0.7)).toBe(0);
    expect(panelOpacity({ from: 0, to: 0.3 }, 0)).toBe(1);
    expect(panelOpacity({ from: 0.8, to: 1 }, 1)).toBe(1);
  });

  it("joins and aligns the incoming clip, then settles to identity", () => {
    const c = demo[2] as Extract<Chapter, { kind: "video" }>;
    expect(joinOpacity(c, 0)).toBe(0);
    expect(joinOpacity(c, 0.1)).toBe(1);
    expect(joinOpacity(demo[0], 0)).toBe(1);
    expect(alignAt(c, 0)).toEqual({ scale: 1.1, x: -0.04, y: 0 });
    expect(alignAt(c, 0.6)).toEqual({ scale: 1, x: 0, y: 0 });
  });

  it("eases toward the target independent of frame rate and snaps when close", () => {
    const a = approach(0, 1, 90);
    expect(a).toBeCloseTo(0.5);
    const twoSteps = approach(approach(0, 1, 45), 1, 45);
    expect(twoSteps).toBeCloseTo(a, 5);
    expect(approach(0.999999, 1, 16)).toBe(1);
  });

  it("shows the giant chapter word only as the chapter begins", () => {
    expect(displayOpacity(0)).toBe(1);
    expect(displayOpacity(0.05)).toBe(1);
    expect(displayOpacity(0.25)).toBe(0);
  });

  it("reveals words one after another, all visible at full opacity", () => {
    expect(wordReveal(0.2, 0, 4)).toBeGreaterThan(wordReveal(0.2, 3, 4));
    expect(wordReveal(1, 3, 4)).toBe(1);
    expect(wordReveal(0, 0, 4)).toBe(0);
    expect(wordReveal(0.5, 0, 1)).toBe(0.5);
  });

  it("ships valid chapter data", () => {
    const ids = new Set<string>();
    for (const c of HOME_CHAPTERS) {
      expect(ids.has(c.id), `duplicate ${c.id}`).toBe(false); ids.add(c.id);
      expect(c.scroll).toBeGreaterThan(0);
      if (c.kind === "video" && c.keys) expect(() => validateKeys(c.keys!)).not.toThrow();
      for (const p of c.panels ?? []) expect(p.from).toBeLessThan(p.to);
    }
    expect(ids.has("desk")).toBe(true);
    expect(HOME_CHAPTERS[0].panels?.[0].title).toBeTruthy();
  });
});

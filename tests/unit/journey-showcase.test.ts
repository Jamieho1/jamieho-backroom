import { describe, expect, it } from "vitest";
import { itemOpacity, shotState, showcaseScroll, showcaseState, SHOWCASE_INTRO } from "@/lib/journey/showcase";

describe("projects showcase (TKT-87)", () => {
  it("gives each project one screen of scroll after a short intro", () => {
    expect(showcaseScroll(3)).toBe(SHOWCASE_INTRO + 3);
    expect(showcaseScroll(0)).toBe(SHOWCASE_INTRO + 1);
  });

  it("steps through projects and fills one line per project", () => {
    const n = 3, intro = SHOWCASE_INTRO / showcaseScroll(n);
    expect(showcaseState(0, n)).toEqual({ index: 0, within: 0, lines: [0, 0, 0] });
    const mid = showcaseState(intro + (1 - intro) * 0.5, n); // halfway through project 2
    expect(mid.index).toBe(1);
    expect(mid.within).toBeCloseTo(0.5);
    expect(mid.lines[0]).toBe(1);
    expect(mid.lines[1]).toBeCloseTo(0.5);
    expect(mid.lines[2]).toBe(0);
    expect(showcaseState(1, n)).toEqual({ index: 2, within: 1, lines: [1, 1, 1] });
    expect(showcaseState(0.5, 0)).toEqual({ index: 0, within: 0, lines: [] });
  });

  it("hands text over between projects but holds the first and last at the ends", () => {
    const at = (index: number, within: number) => ({ index, within, lines: [] });
    expect(itemOpacity(at(0, 0), 0, 3)).toBe(1);
    expect(itemOpacity(at(0, 0.5), 1, 3)).toBe(0);
    expect(itemOpacity(at(1, 0.02), 1, 3)).toBeLessThan(1);
    expect(itemOpacity(at(1, 0.5), 1, 3)).toBe(1);
    expect(itemOpacity(at(1, 0.98), 1, 3)).toBeLessThan(1);
    expect(itemOpacity(at(2, 1), 2, 3)).toBe(1);
  });

  it("cross-fades screenshots and pans a single tall one", () => {
    expect(shotState(0.3, 1)).toEqual({ shot: 0, mix: 0, pan: 0.3 });
    expect(shotState(0.1, 2)).toMatchObject({ shot: 0, mix: 0 });
    expect(shotState(0.49, 2).mix).toBeGreaterThan(0.5);
    expect(shotState(0.75, 2)).toMatchObject({ shot: 1, mix: 0 });
    expect(shotState(1, 3).shot).toBe(2);
  });
});

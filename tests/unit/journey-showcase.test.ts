import { describe, expect, it } from "vitest";
import { itemOpacity, screenshotOffset, screenshotWithin, showcaseShotLocal, showcaseScroll, showcaseState, SHOWCASE_INTRO } from "@/lib/journey/showcase";

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

  it("scrubs screenshots reversibly while single-image projects remain still",()=>{
    expect(screenshotOffset(.1,2)).toBe(0);expect(screenshotOffset(.88,2)).toBe(1);expect(screenshotOffset(.5,2)).toBeCloseTo(.5);
    for(const within of [0,.2,.5,.8,1])expect(screenshotOffset(within,1)).toBe(0);
    for(const count of [2,3,6])for(let i=0;i<count;i++)expect(screenshotOffset(screenshotWithin(i,count),count)).toBeCloseTo(i/(count-1));
  });
  it("dot shortcuts target the matching project and screenshot on the shared clock",()=>{
    for(const projects of [1,2,4])for(let p=0;p<projects;p++)for(const shot of [0,1]){
      const state=showcaseState(showcaseShotLocal(p,shot,2,projects),projects);expect(state.index).toBe(p);expect(screenshotOffset(state.within,2)).toBeCloseTo(shot);
    }
  });
});

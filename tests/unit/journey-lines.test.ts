import { describe, expect, it } from "vitest";
import { GRID, gridSegments, lerpInto, lineState, shapePoints, type Shape } from "@/lib/journey/lines";

const chapters = [
  { id: "sky", kind: "video" }, { id: "pivot", kind: "section" }, { id: "projects", kind: "section" },
  { id: "toolkit", kind: "section" }, { id: "creator", kind: "section" },
];

describe("line shapes (TKT-95)", () => {
  it("gives every shape the same grid of finite points, roughly within the unit sphere", () => {
    for (const s of ["sphere", "torus", "wave", "helix"] as Shape[]) {
      const p = shapePoints(s);
      expect(p.length).toBe(GRID.u * GRID.v * 3);
      for (const n of p) { expect(Number.isFinite(n)).toBe(true); expect(Math.abs(n)).toBeLessThanOrEqual(1.25); }
    }
  });

  it("joins points along the grid with in-range index pairs", () => {
    const seg = gridSegments(4, 3);
    expect(seg.length % 2).toBe(0);
    expect(Math.max(...seg)).toBeLessThan(12);
    expect([...seg.slice(0, 2)]).toEqual([0, 1]);
  });

  it("morphs by straight interpolation", () => {
    const a = new Float32Array([0, 0, 0]), b = new Float32Array([2, 4, -2]);
    expect([...lerpInto(new Float32Array(3), a, b, 0.5)]).toEqual([1, 2, -1]);
  });

  it("fades in after footage, morphs between sections, and hides where no shape is set", () => {
    const first = lineState(chapters, 1, 0);
    expect(first).toMatchObject({ shape: "sphere", from: "sphere", opacity: 0 });
    expect(lineState(chapters, 1, 0.5).opacity).toBe(1);
    const mid = lineState(chapters, 2, 0.15);
    expect(mid.from).toBe("sphere");
    expect(mid.shape).toBe("torus");
    expect(mid.morph).toBeGreaterThan(0);
    expect(mid.morph).toBeLessThan(1);
    expect(lineState(chapters, 3, 0.5)).toMatchObject({ shape: null, opacity: 0 });
    expect(lineState(chapters, 4, 0.1).from).toBe("helix"); // after the Toolkit (no shape) it fades in, not morphs
    expect(lineState(chapters, 0, 0.5).shape).toBeNull();
    expect(lineState(chapters, 1, 0.9, 1).opacity).toBe(0); // gone once the photo has grown over the screen
  });
});

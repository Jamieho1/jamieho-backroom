import { describe, expect, it } from "vitest";
import { SHAPE_BY_CHAPTER, GRID, gridSegments, lerpInto, lineState, shapePoints, type Shape } from "@/lib/journey/lines";

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

  it("keeps Creator's helix while the dial and Toolkit own their visuals",()=>{
    expect(SHAPE_BY_CHAPTER).toEqual({creator:'helix'});
    for(const id of ['about','pivot','experience','projects','toolkit'])expect(lineState([{id,kind:'section'}],0,.5)).toMatchObject({shape:null,opacity:0});
    expect(lineState([{id:'creator',kind:'section'}],0,.5)).toMatchObject({shape:'helix',opacity:1});
  });
});

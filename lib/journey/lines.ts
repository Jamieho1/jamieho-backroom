/**
 * Home v1.2 (TKT-95): the wireframe that morphs behind section titles. Pure geometry and scroll maths, unit-tested;
 * the three.js drawing lives in components/journey/line-shape.tsx.
 *
 * Every shape is the same U×V grid of points (a parametric surface), so a morph is a straight per-point lerp and
 * the line topology never changes. Closed shapes repeat their first row/column, so the grid needs no wrapping.
 */
import { clamp01, smoothstep } from "./timeline";

export type Shape = "sphere" | "torus" | "wave" | "helix";
export const GRID = { u: 48, v: 24 } as const;

/** Which shape each section shows. Sections not listed (the Toolkit has its own 3D stack) show none. */
export const SHAPE_BY_CHAPTER: Readonly<Record<string, Shape>> = { pivot: "sphere", projects: "torus", experience: "wave", creator: "helix" };

const TAU = Math.PI * 2;

/** One point of a shape at (s, t) in [0, 1]², roughly inside the unit sphere. */
export function shapePoint(shape: Shape, s: number, t: number): [number, number, number] {
  switch (shape) {
    case "sphere": {
      const th = s * TAU, ph = t * Math.PI;
      return [Math.sin(ph) * Math.cos(th), Math.cos(ph), Math.sin(ph) * Math.sin(th)];
    }
    case "torus": {
      const th = s * TAU, ph = t * TAU, R = 0.68, r = 0.3;
      return [(R + r * Math.cos(ph)) * Math.cos(th), r * Math.sin(ph), (R + r * Math.cos(ph)) * Math.sin(th)];
    }
    case "wave": {
      const x = s * 2 - 1, z = t * 2 - 1;
      return [x, 0.22 * Math.sin(x * 4.2) * Math.cos(z * 3.1), z];
    }
    case "helix": {
      // A twisted ribbon tube: a strand that climbs while its cross-section turns.
      const th = s * TAU * 1.25, ph = t * TAU, r = 0.2;
      const cx = 0.5 * Math.cos(th), cz = 0.5 * Math.sin(th), y = s * 1.3 - 0.65;
      return [cx + r * Math.cos(ph) * Math.cos(th), y + r * Math.sin(ph), cz + r * Math.cos(ph) * Math.sin(th)];
    }
  }
}

/** All U×V points of a shape, flattened xyz. */
export function shapePoints(shape: Shape, u: number = GRID.u, v: number = GRID.v): Float32Array {
  const out = new Float32Array(u * v * 3);
  for (let i = 0; i < u; i++) for (let j = 0; j < v; j++) {
    const p = shapePoint(shape, i / (u - 1), j / (v - 1));
    out.set(p, (i * v + j) * 3);
  }
  return out;
}

/** Line segments (index pairs) along both grid directions. */
export function gridSegments(u: number = GRID.u, v: number = GRID.v): Uint16Array {
  const pairs: number[] = [];
  for (let i = 0; i < u; i++) for (let j = 0; j < v; j++) {
    const k = i * v + j;
    if (j + 1 < v) pairs.push(k, k + 1);
    if (i + 1 < u && j % 2 === 0) pairs.push(k, k + v); // every other ring: lighter, reads as lines not a mesh
  }
  return new Uint16Array(pairs);
}

/** out = a + (b - a)·t, per component. */
export function lerpInto(out: Float32Array, a: Float32Array, b: Float32Array, t: number): Float32Array {
  for (let k = 0; k < out.length; k++) out[k] = a[k] + (b[k] - a[k]) * t;
  return out;
}

export interface LineState { shape: Shape | null; from: Shape | null; morph: number; opacity: number }

/**
 * What the wireframe shows at a point of the journey. A section with a shape morphs into it from the previous
 * section's shape while it wipes in (or fades in if it came after footage), and fades out as its image grows.
 */
export function lineState(chapters: readonly { id: string; kind: string }[], index: number, local: number, grow = 0): LineState {
  const c = chapters[index];
  const shape = c && c.kind === "section" ? SHAPE_BY_CHAPTER[c.id] ?? null : null;
  if (!shape) return { shape: null, from: null, morph: 1, opacity: 0 };
  const prev = chapters[index - 1];
  const from = prev && prev.kind === "section" ? SHAPE_BY_CHAPTER[prev.id] ?? null : null;
  const morph = smoothstep(0, 0.3, local);
  const opacity = (from ? 1 : morph) * (1 - clamp01(grow));
  return { shape, from: from ?? shape, morph: from ? morph : 1, opacity };
}

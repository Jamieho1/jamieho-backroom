/**
 * Step-by-step visuals for coding notes (Jamie 2026-10-20: "I'm a visual learner"). Claude traces the worked example
 * as frames over one of three pictures: an array (pointers, a window, highlighted cells), a grid (DP tables,
 * matrices) or a graph/tree (current and visited nodes). Stored as a JSON string on the note.
 */
import { z } from "zod";

const Val = z.union([z.string(), z.number(), z.boolean(), z.null()]).transform((v) => (v === null ? "∅" : String(v)));
const Frame = z.object({
  caption: z.string().min(1).max(220),
  /** array: {name, index}; graph: {name, node}. */
  pointers: z.array(z.object({ name: z.string().min(1).max(8), index: z.number().int().optional(), node: z.string().optional() })).max(4).default([]),
  /** array: inclusive [l, r] window. */
  range: z.array(z.number().int()).length(2).nullable().default(null),
  /** array: indexes; grid: "r,c" strings; graph: node ids. */
  highlight: z.array(z.union([z.number(), z.string()])).max(30).default([]),
  /** Done/visited cells or nodes (same addressing as highlight). */
  done: z.array(z.union([z.number(), z.string()])).max(60).default([]),
  /** array/grid values that changed in this frame (replaces the whole row set when given). */
  values: z.array(Val).max(40).nullable().default(null),
  cells: z.array(z.object({ at: z.string().regex(/^\d+,\d+$/), value: Val })).max(40).default([]),
  /** Side state: hash maps, stacks, counters, the answer so far. */
  vars: z.array(z.object({ name: z.string().min(1).max(20), value: z.string().max(80) })).max(6).default([]),
});
export const Visual = z.object({
  kind: z.enum(["array", "grid", "graph"]),
  title: z.string().min(1).max(80),
  values: z.array(Val).max(16).default([]),
  rows: z.array(z.array(Val).max(10)).max(10).default([]),
  rowLabels: z.array(z.string()).max(10).default([]),
  colLabels: z.array(z.string()).max(10).default([]),
  nodes: z.array(z.object({ id: z.string().min(1).max(12), label: z.string().max(12) })).max(14).default([]),
  edges: z.array(z.object({ from: z.string(), to: z.string(), label: z.string().max(8).default("") })).max(24).default([]),
  directed: z.boolean().default(false),
  frames: z.array(Frame).min(2).max(14),
  /** Summary gallery (2026-10-26): the `### N.` concept it belongs to, and its cost. */
  concept: z.string().max(120).optional(),
  time: z.string().max(120).optional(),
  space: z.string().max(120).optional(),
});
export type Visual = z.infer<typeof Visual>;
export type VFrame = Visual["frames"][number];

export function visualIssues(v: Visual): string[] {
  const out: string[] = [];
  if (v.kind === "array" && !v.values.length) out.push("an array visual needs values");
  if (v.kind === "grid" && !v.rows.length) out.push("a grid visual needs rows");
  if (v.kind === "graph") {
    if (v.nodes.length < 2) out.push("a graph visual needs nodes");
    const ids = new Set(v.nodes.map((n) => n.id));
    for (const e of v.edges) if (!ids.has(e.from) || !ids.has(e.to)) out.push(`visual edge ${e.from}-${e.to} uses an unknown node`);
  }
  return out;
}

/** The array values shown at frame i (a frame may replace them; later frames keep the last replacement). */
export function valuesAt(v: Visual, i: number): string[] {
  let vals = v.values as string[];
  for (let k = 0; k <= i; k++) if (v.frames[k]?.values) vals = v.frames[k].values as string[];
  return vals;
}
/** Grid rows at frame i with cell updates applied cumulatively. */
export function rowsAt(v: Visual, i: number): string[][] {
  const rows = (v.rows as string[][]).map((r) => [...r]);
  for (let k = 0; k <= i; k++)
    for (const c of v.frames[k]?.cells ?? []) {
      const [r, col] = c.at.split(",").map(Number);
      if (rows[r] && col < 10) rows[r][col] = c.value as string;
    }
  return rows;
}


/**
 * Step-by-step visuals for coding notes (Jamie 2026-10-20: "I'm a visual learner"). Claude traces the worked example
 * as frames over one of four pictures: an array (pointers, a window, highlighted cells), a grid (DP tables,
 * matrices), a graph/tree (current and visited nodes) or, for SQL, a few tables. Stored as JSON on the note.
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
const ClassicVisual = z.object({
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

/**
 * "tables" (Q5, 2026-11-24): small SQL tables side by side. Input tables are fully shown; a table with `result: true`
 * starts empty and reveals rows as frames advance. Per frame: `show` {tableId: n} reveals the first n rows of that
 * table (sticky until changed) and `replace` {tableId: rows} swaps that table's rows from this frame on (all replaced
 * rows are shown unless the same frame also gives `show`). Cells are addressed {table, row?, col?}: row is a 0-based
 * row index, col a 0-based index or a column name; row only = whole row, col only = whole column, both = one cell.
 */
const TableId = z.string().regex(/^[A-Za-z][A-Za-z0-9_]*$/).max(16);
const TableRow = z.array(Val).max(8);
const Addr = z.object({ table: TableId, row: z.number().int().min(0).max(9).optional(), col: z.union([z.number().int().min(0).max(7), z.string().min(1).max(24)]).optional() }).strict();
const TableFrame = z
  .object({
    caption: z.string().min(1).max(220),
    highlight: z.array(Addr).max(30).default([]),
    done: z.array(Addr).max(60).default([]),
    show: z.record(TableId, z.number().int().min(0).max(10)).refine((o) => Object.keys(o).length <= 3, "show names at most 3 tables").default({}),
    replace: z.record(TableId, z.array(TableRow).max(10)).refine((o) => Object.keys(o).length <= 3, "replace names at most 3 tables").default({}),
    vars: z.array(z.object({ name: z.string().min(1).max(20), value: z.string().max(80) })).max(6).default([]),
  })
  .strict();
const SqlTable = z
  .object({
    id: TableId,
    name: z.string().min(1).max(40),
    columns: z.array(z.string().min(1).max(24)).min(1).max(8),
    rows: z.array(TableRow).max(10).default([]),
    result: z.boolean().default(false),
  })
  .strict();
const TablesVisual = z
  .object({
    kind: z.literal("tables"),
    title: z.string().min(1).max(80),
    tables: z.array(SqlTable).min(1).max(3),
    frames: z.array(TableFrame).min(2).max(14),
    concept: z.string().max(120).optional(),
    time: z.string().max(120).optional(),
    space: z.string().max(120).optional(),
  })
  .strict();
export const Visual = z.discriminatedUnion("kind", [ClassicVisual, TablesVisual]);
export type ClassicVisual = z.infer<typeof ClassicVisual>;
export type TablesVisual = z.infer<typeof TablesVisual>;
export type Visual = z.infer<typeof Visual>;
export type VFrame = ClassicVisual["frames"][number];
export type TableAddr = z.infer<typeof Addr>;

export interface TableState {
  id: string;
  name: string;
  columns: string[];
  result: boolean;
  rows: string[][];
  /** Rows revealed so far (the first `shown` of `rows`). */
  shown: number;
}
/** Every table as it looks at frame i: replacements and reveal counts apply cumulatively. */
export function tablesAt(v: TablesVisual, i: number): TableState[] {
  const state: TableState[] = v.tables.map((t) => ({ id: t.id, name: t.name, columns: t.columns, result: t.result, rows: t.rows as string[][], shown: t.result ? 0 : t.rows.length }));
  for (let k = 0; k <= i; k++) {
    const f = v.frames[k];
    if (!f) break;
    for (const [id, rows] of Object.entries(f.replace)) {
      const s = state.find((x) => x.id === id);
      if (s) ((s.rows = rows as string[][]), (s.shown = rows.length));
    }
    for (const [id, n] of Object.entries(f.show)) {
      const s = state.find((x) => x.id === id);
      if (s) s.shown = Math.min(n, s.rows.length);
    }
  }
  return state;
}
/** Resolve a column address to an index (undefined when it does not exist; -1 when the address has no column). */
export function colIndex(t: { columns: string[] }, col: number | string | undefined): number | undefined {
  if (col === undefined) return -1;
  const k = typeof col === "number" ? col : t.columns.indexOf(col);
  return k >= 0 && k < t.columns.length ? k : undefined;
}

function tablesIssues(v: TablesVisual): string[] {
  const out: string[] = [];
  const ids = new Set<string>();
  for (const t of v.tables) {
    if (ids.has(t.id)) out.push(`visual table id "${t.id}" is used twice`);
    ids.add(t.id);
    t.rows.forEach((r, k) => r.length !== t.columns.length && out.push(`table "${t.id}" row ${k} has ${r.length} cells, expected ${t.columns.length}`));
  }
  v.frames.forEach((f, fi) => {
    const at = `frame ${fi + 1}`;
    for (const [id, rows] of Object.entries(f.replace)) {
      const t = v.tables.find((x) => x.id === id);
      if (!t) out.push(`${at}: replace names unknown table "${id}"`);
      else rows.forEach((r, k) => r.length !== t.columns.length && out.push(`${at}: replace row ${k} of "${id}" has ${r.length} cells, expected ${t.columns.length}`));
    }
    const state = tablesAt(v, fi);
    for (const [id, n] of Object.entries(f.show)) {
      const s = state.find((x) => x.id === id);
      if (!s) out.push(`${at}: show names unknown table "${id}"`);
      else if (n > s.rows.length) out.push(`${at}: show ${n} rows of "${id}", which has ${s.rows.length}`);
    }
    for (const [field, list] of [["highlight", f.highlight], ["done", f.done]] as const)
      list.forEach((a) => {
        const s = state.find((x) => x.id === a.table);
        if (!s) return void out.push(`${at}: ${field} uses unknown table "${a.table}"`);
        if (a.row !== undefined && a.row >= s.rows.length) out.push(`${at}: ${field} row ${a.row} does not exist in "${a.table}"`);
        else if (a.row !== undefined && a.row >= s.shown) out.push(`${at}: ${field} row ${a.row} of "${a.table}" is not revealed yet`);
        if (colIndex(s, a.col) === undefined) out.push(`${at}: ${field} column ${JSON.stringify(a.col)} does not exist in "${a.table}"`);
      });
  });
  return out;
}

export function visualIssues(v: Visual): string[] {
  if (v.kind === "tables") return tablesIssues(v);
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
export function valuesAt(v: ClassicVisual, i: number): string[] {
  let vals = v.values as string[];
  for (let k = 0; k <= i; k++) if (v.frames[k]?.values) vals = v.frames[k].values as string[];
  return vals;
}
/** Grid rows at frame i with cell updates applied cumulatively. */
export function rowsAt(v: ClassicVisual, i: number): string[][] {
  const rows = (v.rows as string[][]).map((r) => [...r]);
  for (let k = 0; k <= i; k++)
    for (const c of v.frames[k]?.cells ?? []) {
      const [r, col] = c.at.split(",").map(Number);
      if (rows[r] && col < 10) rows[r][col] = c.value as string;
    }
  return rows;
}


/** Draft field check for notes.visual: a JSON array (or one object) of valid visuals, small enough for the editor. */
export const VISUAL_FIELD_LIMIT = 200000;
export function visualFieldIssues(value: unknown): string[] {
  if (value === null || typeof value !== "object") return ["visual must be a JSON array of visuals (or one visual object)."];
  let json: string;
  try {
    json = JSON.stringify(value);
  } catch {
    return ["visual must be plain JSON."];
  }
  if (json.length > VISUAL_FIELD_LIMIT) return [`visual exceeds ${VISUAL_FIELD_LIMIT} characters.`];
  if (json.includes("\\u0000")) return ["visual cannot contain NUL."];
  const items = Array.isArray(value) ? value : [value];
  if (items.length > 40) return ["visual holds at most 40 visuals."];
  const out: string[] = [];
  items.forEach((item, k) => {
    const parsed = Visual.safeParse(item);
    if (!parsed.success) out.push(`visual ${k + 1}: ${parsed.error.issues.slice(0, 3).map((i) => `${i.path.join(".") || "kind"}: ${i.message}`).join("; ")}`);
    else out.push(...visualIssues(parsed.data).map((m) => `visual ${k + 1}: ${m}`));
  });
  return out;
}

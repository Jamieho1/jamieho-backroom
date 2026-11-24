// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { TraceVisual } from "@/components/notes/trace-visual";
import { NotesReader } from "@/components/notes/reader";
import { Visual, visualIssues, tablesAt, visualFieldIssues } from "@/lib/notes/visual";
import { parseVisuals, type NoteRow } from "@/lib/notes";
import { validateOperations } from "@/lib/content-drafts/allowlist";
import { overlayApp } from "@/lib/content-drafts/app-overlay";
import { noteComingSoon } from "@/lib/interview/content";

/** The same small LEFT JOIN as docs/content-drafts.md. */
const leftJoin = {
  kind: "tables",
  title: "LEFT JOIN keeps every customer",
  concept: "Joins",
  tables: [
    { id: "customers", name: "customers", columns: ["id", "name"], rows: [[1, "Asha"], [2, "Ben"], [3, "Chloe"]] },
    { id: "orders", name: "orders", columns: ["id", "customer_id", "total"], rows: [[10, 1, 40], [11, 1, 15], [12, 3, 22]] },
    { id: "result", name: "result", columns: ["name", "total"], result: true, rows: [["Asha", 40], ["Asha", 15], ["Ben", null], ["Chloe", 22]] },
  ],
  frames: [
    { caption: "Start with every customer. The result is empty." },
    { caption: "Asha matches two orders.", highlight: [{ table: "customers", row: 0 }, { table: "orders", row: 0 }, { table: "orders", row: 1 }], show: { result: 2 } },
    { caption: "Ben has no order, so his total is NULL.", highlight: [{ table: "customers", row: 1 }], show: { result: 3 } },
    { caption: "Chloe matches order 12.", highlight: [{ table: "customers", row: 2 }, { table: "orders", row: 2, col: "total" }], done: [{ table: "customers", row: 0 }], show: { result: 4 }, vars: [{ name: "rows", value: "4" }] },
  ],
};
const clone = () => structuredClone(leftJoin) as Record<string, any>;
const issues = (v: unknown) => { const p = Visual.safeParse(v); return p.success ? visualIssues(p.data) : ["schema:" + p.error.issues[0].message]; };
afterEach(cleanup);

it("parses a tables visual, shows NULL as ∅ and defaults the optional parts", () => {
  const v = Visual.parse(leftJoin);
  expect(v.kind).toBe("tables");
  if (v.kind !== "tables") return;
  expect(v.tables[2].rows[2]).toEqual(["Ben", "∅"]);
  expect(v.tables[0].result).toBe(false);
  expect(v.frames[0]).toMatchObject({ highlight: [], done: [], show: {}, replace: {}, vars: [] });
  expect(visualIssues(v)).toEqual([]);
});
it("leaves array, grid and graph visuals parsing exactly as before", () => {
  const arr = Visual.parse({ kind: "array", title: "A", values: [1, null], frames: [{ caption: "a" }, { caption: "b", highlight: [0] }] });
  expect(arr).toMatchObject({ kind: "array", values: ["1", "∅"], rows: [], nodes: [], directed: false });
  expect(Visual.safeParse({ kind: "grid", title: "G", rows: [[1]], frames: [{ caption: "a" }, { caption: "b" }] }).success).toBe(true);
  expect(Visual.safeParse({ kind: "graph", title: "T", nodes: [{ id: "a", label: "a" }, { id: "b", label: "b" }], edges: [{ from: "a", to: "z" }], frames: [{ caption: "a" }, { caption: "b" }] }).success).toBe(true);
  expect(visualIssues(Visual.parse({ kind: "graph", title: "T", nodes: [{ id: "a", label: "a" }, { id: "b", label: "b" }], edges: [{ from: "a", to: "z" }], frames: [{ caption: "a" }, { caption: "b" }] }))[0]).toMatch(/unknown node/);
  expect(Visual.safeParse({ kind: "chart", title: "x", frames: [{ caption: "a" }, { caption: "b" }] }).success).toBe(false);
});
it("enforces the schema limits and rejects unknown keys", () => {
  const bad = (edit: (v: Record<string, any>) => void) => { const v = clone(); edit(v); return Visual.safeParse(v).success; };
  expect(bad(() => {})).toBe(true);
  expect(bad((v) => v.tables.push({ id: "t4", name: "t4", columns: ["a"], rows: [] }))).toBe(false);
  expect(bad((v) => (v.tables[0].columns = Array.from({ length: 9 }, (_, k) => `c${k}`)))).toBe(false);
  expect(bad((v) => (v.tables[0].columns = Array.from({ length: 8 }, (_, k) => `c${k}`)))).toBe(true);
  expect(bad((v) => (v.tables[0].columns = []))).toBe(false);
  expect(bad((v) => (v.tables[1].rows = Array.from({ length: 11 }, () => [1, 1, 1])))).toBe(false);
  expect(bad((v) => (v.tables[1].rows = Array.from({ length: 10 }, () => [1, 1, 1])))).toBe(true);
  expect(bad((v) => (v.frames = v.frames.slice(0, 1)))).toBe(false);
  expect(bad((v) => (v.frames = Array.from({ length: 15 }, () => ({ caption: "x" }))))).toBe(false);
  expect(bad((v) => (v.frames = Array.from({ length: 14 }, () => ({ caption: "x" }))))).toBe(true);
  expect(bad((v) => (v.tables = []))).toBe(false);
  expect(bad((v) => (v.tables[0].id = "1bad id"))).toBe(false);
  expect(bad((v) => (v.frames[1].highlights = []))).toBe(false);
  expect(bad((v) => (v.frames[1].highlight[0].extra = 1))).toBe(false);
  expect(bad((v) => (v.extra = 1))).toBe(false);
  expect(bad((v) => (v.frames[1].show = { a: 1, b: 1, c: 1, d: 1 }))).toBe(false);
  expect(bad((v) => (v.frames[1].show = { result: 11 }))).toBe(false);
  expect(bad((v) => (v.frames[1].caption = ""))).toBe(false);
});
it("flags bad table addresses and shapes through visualIssues", () => {
  const edit = (f: (v: Record<string, any>) => void) => { const v = clone(); f(v); return issues(v).join(" | "); };
  expect(issues(leftJoin)).toEqual([]);
  expect(edit((v) => (v.frames[1].highlight = [{ table: "nope", row: 0 }]))).toMatch(/unknown table "nope"/);
  expect(edit((v) => (v.frames[1].highlight = [{ table: "orders", row: 3 }]))).toMatch(/row 3 does not exist in "orders"/);
  expect(edit((v) => (v.frames[1].highlight = [{ table: "result", row: 2 }]))).toMatch(/not revealed yet/);
  expect(edit((v) => (v.frames[1].highlight = [{ table: "orders", col: "price" }]))).toMatch(/column "price" does not exist/);
  expect(edit((v) => (v.frames[1].highlight = [{ table: "customers", col: 2 }]))).toMatch(/column 2 does not exist/);
  expect(edit((v) => (v.frames[1].done = [{ table: "customers", row: 5 }]))).toMatch(/done row 5/);
  expect(edit((v) => (v.frames[1].show = { ghost: 1 }))).toMatch(/show names unknown table "ghost"/);
  expect(edit((v) => (v.frames[1].show = { result: 5 }))).toMatch(/show 5 rows of "result", which has 4/);
  expect(edit((v) => (v.frames[1].replace = { nope: [[1]] }))).toMatch(/replace names unknown table/);
  expect(edit((v) => (v.frames[1].replace = { result: [["a"]] }))).toMatch(/replace row 0 of "result" has 1 cells, expected 2/);
  expect(edit((v) => (v.tables[2].id = "orders"))).toMatch(/"orders" is used twice/);
  expect(edit((v) => (v.tables[0].rows[1] = [2]))).toMatch(/row 1 has 1 cells, expected 2/);
  expect(issues({ ...leftJoin, tables: [] })[0]).toMatch(/^schema:/);
});
it("tablesAt reveals rows cumulatively and applies replacement rows", () => {
  const v = clone();
  v.frames[2].replace = { result: [["Asha", "∅"], ["Ben", "∅"]] };
  v.frames[3].show = { result: 1 };
  const p = Visual.parse(v);
  if (p.kind !== "tables") throw Error();
  const at = (i: number) => tablesAt(p, i).map((t) => t.shown);
  expect(at(0)).toEqual([3, 3, 0]);
  expect(at(1)).toEqual([3, 3, 2]);
  expect(at(2)).toEqual([3, 3, 2]); // replaced rows are all shown unless the frame also says show
  expect(tablesAt(p, 2)[2].rows).toEqual([["Asha", "∅"], ["Ben", "∅"]]);
  expect(at(3)).toEqual([3, 3, 1]);
  expect(tablesAt(p, 1)[2].rows).toHaveLength(4);
});
it("supports GROUP BY collapse and window columns through replacement rows", () => {
  const v = Visual.parse({
    kind: "tables", title: "GROUP BY collapse",
    tables: [{ id: "sales", name: "sales", columns: ["shop", "amount"], rows: [["a", 5], ["a", 7], ["b", 1]] }, { id: "out", name: "out", columns: ["shop", "total", "rank"], result: true }],
    frames: [
      { caption: "Rows" },
      { caption: "Collapse per shop", highlight: [{ table: "sales", col: "shop" }], replace: { out: [["a", 12, null], ["b", 1, null]] } },
      { caption: "Window column filled", replace: { out: [["a", 12, 1], ["b", 1, 2]] }, highlight: [{ table: "out", col: "rank" }] },
    ],
  });
  expect(visualIssues(v)).toEqual([]);
  if (v.kind !== "tables") throw Error();
  expect(tablesAt(v, 1)[1]).toMatchObject({ shown: 2, rows: [["a", "12", "∅"], ["b", "1", "∅"]] });
  expect(tablesAt(v, 2)[1].rows[0]).toEqual(["a", "12", "1"]);
});

const tables = () => screen.getAllByRole("table");
it("renders real tables with captions, and reveals result rows as frames advance", () => {
  render(<TraceVisual visual={Visual.parse(leftJoin)} />);
  expect(screen.getByRole("table", { name: /customers/ })).toBeTruthy();
  expect(screen.getByRole("table", { name: /orders/ })).toBeTruthy();
  const result = () => screen.getByRole("table", { name: /result/ });
  expect(within(result()).queryAllByRole("row").filter((r) => !r.hasAttribute("aria-hidden"))).toHaveLength(1); // header only
  expect(within(result()).getByText(/result, 0 rows/)).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Next frame" }));
  expect(screen.getByText("Asha matches two orders.")).toBeTruthy();
  expect(within(result()).getAllByText("Asha")).toHaveLength(2);
  expect(within(result()).getByText(/result, 2 rows/)).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Next frame" }));
  const ben = within(result()).getByText("Ben").closest("tr")!;
  expect(within(ben).getByText("NULL")).toBeTruthy();
  expect(ben.querySelector("td[data-null]")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Previous frame" }));
  expect(within(result()).queryByText("Ben")).toBeNull();
  expect(tables()).toHaveLength(3);
});
it("marks highlights with an outline hook, a visible marker and hidden text (not colour alone)", () => {
  render(<TraceVisual visual={Visual.parse(leftJoin)} />);
  fireEvent.click(screen.getByRole("button", { name: "Next frame" }));
  const customers = screen.getByRole("table", { name: /customers/ });
  const row = within(customers).getByText("Asha").closest("tr")!;
  expect(row.getAttribute("data-hl")).toBe("true");
  expect(row.querySelector("th.tv-gutter")?.textContent).toContain("▸");
  expect(within(row as HTMLElement).getByText("highlighted row")).toBeTruthy();
  expect(within(customers).getByText("Ben").closest("tr")!.hasAttribute("data-hl")).toBe(false);
  for (let k = 0; k < 2; k++) fireEvent.click(screen.getByRole("button", { name: "Next frame" }));
  const cell = within(screen.getByRole("table", { name: /orders/ })).getByText("22").closest("td")!;
  expect(cell.getAttribute("data-hl")).toBe("true");
  expect(cell.textContent).toContain("◆");
  expect(within(cell).getByText(/highlighted/)).toBeTruthy();
  expect(screen.getByText("rows")).toBeTruthy(); // vars still render
  const asha = within(screen.getByRole("table", { name: /customers/ })).getByText("Asha").closest("tr")!;
  expect(asha.getAttribute("data-done")).toBe("true");
});
it("has no animation under prefers-reduced-motion and keeps a table region keyboard-scrollable", () => {
  const css = readFileSync("app/notes.css", "utf8");
  const block = /@media \(prefers-reduced-motion: reduce\)\s*\{[^}]*\.tv-sqlt tr\.tv-new\s*\{\s*animation:\s*none;/.exec(css);
  expect(block).toBeTruthy();
  render(<TraceVisual visual={Visual.parse(leftJoin)} />);
  for (const g of screen.getAllByRole("group")) expect(g.getAttribute("tabindex")).toBe("0");
});
it("renders existing kinds unchanged next to the new one", () => {
  render(<TraceVisual visual={Visual.parse({ kind: "array", title: "Walk", values: [2, 4], frames: [{ caption: "Start", pointers: [{ name: "i", index: 0 }] }, { caption: "Move" }] })} />);
  expect(screen.getByText("Start")).toBeTruthy();
  expect(screen.queryByRole("table")).toBeNull();
  expect(document.querySelector(".tv-pic-tables")).toBeNull();
});

const note = (extra: Partial<NoteRow> = {}): NoteRow => ({ id: "sql-basics", title: "SQL basics", body: "Intro\n\n### 1. Joins\nBody", free: "", visual: [leftJoin], sort: 9001, updated_at: "2026-01-01T00:00:00Z", ...extra });
it("groups a tables visual by concept in the notes Visuals panel", () => {
  expect(parseVisuals([leftJoin])).toMatchObject({ invalid: false, visuals: [{ kind: "tables" }] });
  expect(parseVisuals([{ ...leftJoin, frames: [{ caption: "x", highlight: [{ table: "zz" }] }, { caption: "y" }] }]).invalid).toBe(true);
  render(<NotesReader notes={[note()]} />);
  expect(screen.getByRole("table", { name: /customers/ })).toBeTruthy();
  expect(screen.getByText("Start with every customer. The result is empty.")).toBeTruthy();
});
it("a draft that changes only visual marks the Visuals panel as changed", () => {
  const rows = overlayApp("notes", [note({ visual: [] })], parse([op({ visual: [leftJoin] })]));
  render(<NotesReader notes={rows} />);
  expect(document.querySelector(".notes-visuals[data-draft-changed='true']")).toBeTruthy();
  expect(screen.getByRole("table", { name: /orders/ })).toBeTruthy();
});

const op = (fields: unknown, key = "sql-basics", table = "notes", action = "update") => ({ table, op: action, key, fields });
const parse = (operations: unknown) => { const r = validateOperations(operations); if (!r.ok) throw Error(r.message); return r.operations; };
it("note drafts accept a valid tables visual (array or single object) and keep the raw JSON", () => {
  for (const visual of [[leftJoin], leftJoin]) {
    const [o] = parse([op({ visual })]);
    expect((o.fields as { visual: unknown }).visual).toEqual(visual); // null stays null, numbers stay numbers
  }
  expect(validateOperations([op({ body: "Text", visual: [leftJoin, { kind: "array", title: "A", values: [1], frames: [{ caption: "a" }, { caption: "b" }] }] })]).ok).toBe(true);
  expect(validateOperations([op({ visual: [] })]).ok).toBe(true);
});
it("note drafts reject bad visuals and still reject title and sort", () => {
  const bad = (visual: unknown) => validateOperations([op({ visual })]);
  expect(bad([{ ...leftJoin, kind: "chart" }]).ok).toBe(false);
  expect(bad([{ ...leftJoin, tables: [] }]).ok).toBe(false);
  const badAddress = clone();
  badAddress.frames[1].highlight = [{ table: "orders", row: 9 }];
  const r = bad([badAddress]);
  expect(r.ok).toBe(false);
  expect(!r.ok && r.message).toMatch(/does not exist in "orders"/);
  for (const v of ["text", 5, null, true]) expect(bad(v).ok).toBe(false);
  expect(bad([leftJoin, 5]).ok).toBe(false);
  expect(bad(Array.from({ length: 41 }, () => leftJoin)).ok).toBe(false);
  expect(bad([{ ...leftJoin, extra: 1 }]).ok).toBe(false);
  const big = clone();
  big.frames = Array.from({ length: 14 }, () => ({ caption: "x".repeat(220), vars: Array.from({ length: 6 }, () => ({ name: "n", value: "v".repeat(80) })) }));
  expect(visualFieldIssues(Array.from({ length: 40 }, () => big)).join()).toMatch(/exceeds/);
  const nul = clone();
  nul.title = "a\0b";
  expect(bad([nul]).ok).toBe(false);
  expect(validateOperations([op({ title: "X" })]).ok).toBe(false);
  expect(validateOperations([op({ sort: 1 })]).ok).toBe(false);
  expect(validateOperations([op({ visual: [leftJoin], title: "X" })]).ok).toBe(false);
  expect(validateOperations([op({ visual: [leftJoin] }, "sql-basics", "notes", "insert")]).ok).toBe(false);
  expect(validateOperations([op({ visual: [leftJoin] }, "sql-basics", "question_notes", "update")]).ok).toBe(false);
});
it("the overlay revalidates the visual, flags the change and keeps other fields", () => {
  const live = note({ visual: [] });
  const [row] = overlayApp("notes", [live], parse([op({ visual: [leftJoin] })]));
  expect(row).toMatchObject({ id: "sql-basics", title: "SQL basics", body: live.body, draftChanged: true, visualChanged: true, visual: [leftJoin] });
  expect(live.visual).toEqual([]);
  const [body] = overlayApp("notes", [live], parse([op({ body: "New" })]));
  expect(body.visualChanged).toBeUndefined();
  // Bypassing the allowlist still cannot get a bad visual into a preview.
  expect(() => overlayApp("notes", [live], [{ table: "notes", op: "update", key: "sql-basics", fields: { visual: [{ kind: "tables" }] } } as never])).toThrow(/Invalid note visual/);
});
it("an empty body stays Coming soon even when the note has visuals", () => {
  expect(noteComingSoon({ body: "", free: "", visual: [leftJoin] } as never)).toBe(true);
  expect(noteComingSoon({ body: "x", free: "" })).toBe(false);
});

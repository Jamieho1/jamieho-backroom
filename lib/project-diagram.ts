/**
 * Optional "How it works" diagram for a project: validated nodes/edges data plus a deterministic layout that
 * produces the same shape tree format as the What I build diagrams, so one component draws both.
 * Mirrors private.valid_project_diagram in SQL; keep the two in step.
 */
import {z} from "zod";

const text = (max: number) => z.string().min(1).refine(s => Array.from(s).length <= max, `Text must be ${max} characters or fewer.`).refine(s => !s.includes("\0"), "Text cannot contain NUL.").refine(s => s === s.trim(), "Text cannot start or end with spaces.");
const nodeId = z.string().regex(/^[a-z0-9][a-z0-9-]{0,39}$/, "Node ids use lowercase letters, numbers and hyphens (up to 40).");
export const DIAGRAM_LIMITS = {nodes: 12, edges: 24, lines: 3, title: 80, line: 60, heading: 120, caption: 400} as const;

export const diagramSchema = z.object({
  title: text(DIAGRAM_LIMITS.heading),
  caption: z.string().max(DIAGRAM_LIMITS.caption).refine(s => !s.includes("\0"), "Text cannot contain NUL.").optional(),
  nodes: z.array(z.object({id: nodeId, title: text(DIAGRAM_LIMITS.title), lines: z.array(text(DIAGRAM_LIMITS.line)).max(DIAGRAM_LIMITS.lines).optional(), highlight: z.boolean().optional()}).strict()).min(1).max(DIAGRAM_LIMITS.nodes),
  edges: z.array(z.object({from: nodeId, to: nodeId, highlight: z.boolean().optional()}).strict()).max(DIAGRAM_LIMITS.edges),
}).strict().superRefine((diagram, ctx) => {
  const ids = new Set<string>();
  diagram.nodes.forEach((node, i) => {if (ids.has(node.id)) ctx.addIssue({code: "custom", path: ["nodes", i, "id"], message: "Node ids must be unique."}); ids.add(node.id);});
  const pairs = new Set<string>();
  diagram.edges.forEach((edge, i) => {
    if (!ids.has(edge.from) || !ids.has(edge.to)) ctx.addIssue({code: "custom", path: ["edges", i], message: "Edges must connect existing nodes."});
    if (edge.from === edge.to) ctx.addIssue({code: "custom", path: ["edges", i], message: "An edge cannot connect a node to itself."});
    const pair = `${edge.from}>${edge.to}`;
    if (pairs.has(pair)) ctx.addIssue({code: "custom", path: ["edges", i], message: "Duplicate edge."});
    pairs.add(pair);
  });
});
export type ProjectDiagram = z.infer<typeof diagramSchema>;
/** Null when absent or invalid, so a bad stored value can never break a public page. */
export function parseDiagram(value: unknown): ProjectDiagram | null {
  const parsed = diagramSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

/** Same tree format as lib/journey/build-diagrams.json; rendered by components/diagram.tsx. */
export interface Shape {tag: string; props: Record<string, unknown>; children: (Shape | string)[]}
export interface DiagramLayout {viewBox: string; width: number; height: number; svg: Shape}

const S = (tag: string, props: Record<string, unknown>, ...children: (Shape | string)[]): Shape => ({tag, props, children});
const TITLE_CHAR = 7.4, SUB_CHAR = 6.6, LINE = 17, PAD = 18;
const num = (n: number) => String(Math.round(n * 10) / 10);

/** Greedy word wrap by character budget; a word longer than the budget stays on its own line. */
export function wrapText(value: string, maxChars: number): string[] {
  const lines: string[] = [];
  let current = "";
  for (const word of value.split(/\s+/).filter(Boolean)) {
    if (current && Array.from(`${current} ${word}`).length > maxChars) {lines.push(current); current = word;} else current = current ? `${current} ${word}` : word;
  }
  if (current) lines.push(current);
  return lines.length ? lines : [value];
}

interface Placed {id: string; x: number; y: number; w: number; h: number; row: number; title: string[]; sub: string[]; hi: boolean}

function nodeShapes(nodes: Placed[], index: Map<string, number>): Shape[] {
  return nodes.map(n => {
    const lines = n.title.length + n.sub.length, top = n.y + (n.h - lines * LINE) / 2 + 12, cx = n.x + n.w / 2;
    let line = 0;
    const at = () => num(top + line++ * LINE);
    const tspans = [...n.title.map(t => S("tspan", {x: num(cx), y: at(), className: "tt"}, t)), ...n.sub.map(t => S("tspan", {x: num(cx), y: at(), className: "sub"}, t))];
    return S("g", {className: `nd${n.hi ? " hi" : ""}`, style: {"--i": String((index.get(n.id) ?? 0) * 2 + 1)}}, S("rect", {className: "d", x: num(n.x), y: num(n.y), width: num(n.w), height: num(n.h), rx: "8", pathLength: "1"}), S("text", {textAnchor: "middle"}, ...tspans));
  });
}

function edgeShapes(diagram: ProjectDiagram, byId: Map<string, Placed>, route: (a: Placed, b: Placed) => string): Shape[] {
  return diagram.edges.map((edge, i) => {
    const a = byId.get(edge.from)!, b = byId.get(edge.to)!;
    return S("g", {className: `ed${edge.highlight ? " g" : ""}`, style: {"--i": String(i * 2 + 2)}}, S("path", {className: "d", pathLength: "1", d: route(a, b), markerEnd: `url(#mk-${edge.highlight ? "g" : "w"})`}));
  });
}

function root(viewBox: string, label: string, children: Shape[]): Shape {
  return S("svg", {viewBox, role: "img", "aria-label": label, fill: "none", strokeLinecap: "round", strokeLinejoin: "round"}, ...children);
}

/** Accessible description of the flow, derived from the data (never from free-form HTML). */
export function diagramLabel(diagram: ProjectDiagram): string {
  const names = new Map(diagram.nodes.map(n => [n.id, [n.title, ...(n.lines ?? [])].join(", ")]));
  const flow = diagram.edges.map(e => `${names.get(e.from)} goes to ${names.get(e.to)}`).join(". ");
  return `${diagram.title}. ${flow || diagram.nodes.map(n => names.get(n.id)).join(". ")}.`;
}

/** Wide layout: nodes flow left to right in rows of up to four, each row filling the width; wrapped edges drop and run back. */
export function layoutDesktop(diagram: ProjectDiagram, perRow = 4): DiagramLayout {
  const W = 920, GAP_X = 56, GAP_Y = 94, TOP = 20, BOTTOM = 10;
  const rows: ProjectDiagram["nodes"][] = [];
  diagram.nodes.forEach((node, i) => {if (i % perRow === 0) rows.push([]); rows[rows.length - 1].push(node);});
  const placed: Placed[] = [];
  let y = TOP;
  rows.forEach((row, r) => {
    const natural = row.map(n => Math.min(300, Math.max(140, PAD * 2 + Math.max(Math.min(Array.from(n.title).length, 20) * TITLE_CHAR, ...(n.lines ?? []).map(l => Array.from(l).length * SUB_CHAR)))));
    const avail = W - GAP_X * (row.length - 1), scale = avail / natural.reduce((s, v) => s + v, 0);
    const widths = natural.map(v => v * scale);
    const built = row.map((n, k) => {
      const w = widths[k], title = wrapText(n.title, Math.max(8, Math.floor((w - PAD * 2) / TITLE_CHAR))), sub = (n.lines ?? []).flatMap(l => wrapText(l, Math.max(8, Math.floor((w - PAD * 2) / SUB_CHAR))));
      return {n, w, title, sub};
    });
    const h = Math.max(72, ...built.map(b => (b.title.length + b.sub.length) * LINE + 40));
    let x = 0;
    built.forEach(b => {placed.push({id: b.n.id, x, y, w: b.w, h, row: r, title: b.title, sub: b.sub, hi: !!b.n.highlight}); x += b.w + GAP_X;});
    y += h + GAP_Y;
  });
  const height = y - GAP_Y + BOTTOM, byId = new Map(placed.map(p => [p.id, p])), index = new Map(diagram.nodes.map((n, i) => [n.id, i]));
  const route = (a: Placed, b: Placed) => {
    const ay = a.y + a.h / 2;
    if (a.row === b.row && b.x > a.x) return `M${num(a.x + a.w)} ${num(ay)}H${num(b.x)}`;
    if (a.row === b.row) {const t = a.y - 12; return `M${num(a.x + a.w / 2)} ${num(a.y)}V${num(t)}H${num(b.x + b.w / 2)}V${num(b.y)}`;}
    if (b.row > a.row) {const gap = a.y + a.h + GAP_Y / 2; return `M${num(a.x + a.w / 2)} ${num(a.y + a.h)}V${num(gap)}H${num(b.x + b.w / 2)}V${num(b.y)}`;}
    const gap = a.y - GAP_Y / 2; return `M${num(a.x + a.w / 2)} ${num(a.y)}V${num(gap)}H${num(b.x + b.w / 2)}V${num(b.y + b.h)}`;
  };
  const viewBox = `0 0 ${W} ${num(height)}`;
  return {viewBox, width: W, height, svg: root(viewBox, diagramLabel(diagram), [...nodeShapes(placed, index), ...edgeShapes(diagram, byId, route)])};
}

/** Narrow layout: one column; non-adjacent edges run down the right margin. */
export function layoutMobile(diagram: ProjectDiagram): DiagramLayout {
  const W = 360, X = 30, NW = 300, GAP = 34, TOP = 8;
  const placed: Placed[] = [];
  let y = TOP;
  diagram.nodes.forEach((n, i) => {
    const title = wrapText(n.title, Math.floor((NW - PAD * 2) / TITLE_CHAR)), sub = (n.lines ?? []).flatMap(l => wrapText(l, Math.floor((NW - PAD * 2) / SUB_CHAR)));
    const h = Math.max(54, (title.length + sub.length) * LINE + 28);
    placed.push({id: n.id, x: X, y, w: NW, h, row: i, title, sub, hi: !!n.highlight});
    y += h + GAP;
  });
  const height = y - GAP + TOP, byId = new Map(placed.map(p => [p.id, p])), index = new Map(diagram.nodes.map((n, i) => [n.id, i]));
  const route = (a: Placed, b: Placed) => {
    if (b.row === a.row + 1) return `M${num(a.x + a.w / 2)} ${num(a.y + a.h)}V${num(b.y)}`;
    const ay = a.y + a.h / 2, by = b.y + b.h / 2;
    return `M${num(a.x + a.w)} ${num(ay)}H${W - 14}V${num(by)}H${num(b.x + b.w)}`;
  };
  const viewBox = `0 0 ${W} ${num(height)}`;
  return {viewBox, width: W, height, svg: root(viewBox, diagramLabel(diagram), [...nodeShapes(placed, index), ...edgeShapes(diagram, byId, route)])};
}

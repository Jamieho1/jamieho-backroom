"use client";
/** Step-by-step visual of a worked example (arrays, DP grids, graphs/trees, SQL tables), with play/step controls. */
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { colIndex, rowsAt, tablesAt, valuesAt, type ClassicVisual, type TableAddr, type TablesVisual, type Visual } from "@/lib/notes/visual";

const has = (xs: (string | number)[], v: string | number) => xs.some((x) => String(x) === String(v));

function ArrayView({ v, i }: { v: ClassicVisual; i: number }) {
  const f = v.frames[i];
  const vals = valuesAt(v, i);
  const range = f.range;
  return (
    <div className="tv-array" style={{ ["--n" as string]: Math.max(1, vals.length) }}>
      {vals.map((val, idx) => {
        const inRange = range ? idx >= Math.min(range[0], range[1]) && idx <= Math.max(range[0], range[1]) : false;
        const ptrs = f.pointers.filter((p) => p.index === idx);
        return (
          <div key={idx} className="tv-col">
            <div className={`tv-cell${has(f.highlight, idx) ? " hl" : ""}${inRange ? " win" : ""}${has(f.done, idx) ? " done" : ""}`}>{val}</div>
            <div className="tv-idx">{idx}</div>
            <div className="tv-ptrs">
              {ptrs.map((p) => (
                <span key={p.name} className="tv-ptr">
                  ↑{p.name}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function GridView({ v, i }: { v: ClassicVisual; i: number }) {
  const f = v.frames[i];
  const rows = rowsAt(v, i);
  const cols = Math.max(...rows.map((r) => r.length));
  return (
    <table className="tv-grid">
      {v.colLabels.length ? (
        <thead>
          <tr>
            {v.rowLabels.length ? <th /> : null}
            {Array.from({ length: cols }, (_, c) => (
              <th key={c}>{v.colLabels[c] ?? c}</th>
            ))}
          </tr>
        </thead>
      ) : null}
      <tbody>
        {rows.map((r, ri) => (
          <tr key={ri}>
            {v.rowLabels.length ? <th>{v.rowLabels[ri] ?? ri}</th> : null}
            {Array.from({ length: cols }, (_, c) => {
              const at = `${ri},${c}`;
              return (
                <td key={c} className={`${has(f.highlight, at) ? "hl" : ""}${has(f.done, at) ? " done" : ""}`}>
                  {r[c] ?? ""}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Top-down layered layout from the first node (trees read naturally; graphs come out as BFS levels). */
function layoutGraph(v: ClassicVisual) {
  const adj = new Map<string, string[]>(v.nodes.map((n) => [n.id, []]));
  for (const e of v.edges) {
    adj.get(e.from)?.push(e.to);
    if (!v.directed) adj.get(e.to)?.push(e.from);
  }
  const level = new Map<string, number>();
  const order: string[] = [];
  for (const root of v.nodes.map((n) => n.id)) {
    if (level.has(root)) continue;
    level.set(root, 0);
    const q = [root];
    while (q.length) {
      const x = q.shift()!;
      order.push(x);
      for (const y of adj.get(x) ?? []) if (!level.has(y)) (level.set(y, level.get(x)! + 1), q.push(y));
    }
  }
  const byLevel = new Map<number, string[]>();
  for (const id of order) byLevel.set(level.get(id)!, [...(byLevel.get(level.get(id)!) ?? []), id]);
  const widest = Math.max(...[...byLevel.values()].map((l) => l.length));
  const W = Math.max(320, widest * 80);
  const pos = new Map<string, [number, number]>();
  for (const [l, ids] of byLevel) ids.forEach((id, k) => pos.set(id, [((k + 1) * W) / (ids.length + 1), 34 + l * 74]));
  return { pos, W, H: 34 + (byLevel.size - 1) * 74 + 40 };
}

function GraphView({ v, i }: { v: ClassicVisual; i: number }) {
  const f = v.frames[i];
  const { pos, W, H } = useMemo(() => layoutGraph(v), [v]);
  const R = 18;
  return (
    <svg className="tv-graph" viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label={v.title}>
      <defs>
        <marker id="tv-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0 0 L10 5 L0 10z" className="tv-arrowhead" />
        </marker>
      </defs>
      {v.edges.map((e, k) => {
        const a = pos.get(e.from);
        const b = pos.get(e.to);
        if (!a || !b) return null;
        const dx = b[0] - a[0];
        const dy = b[1] - a[1];
        const d = Math.hypot(dx, dy) || 1;
        const [x1, y1, x2, y2] = [a[0] + (dx / d) * R, a[1] + (dy / d) * R, b[0] - (dx / d) * (R + 2), b[1] - (dy / d) * (R + 2)];
        return (
          <g key={k} className="tv-edge">
            <line x1={x1} y1={y1} x2={x2} y2={y2} markerEnd={v.directed ? "url(#tv-arrow)" : undefined} />
            {e.label ? (
              <text x={(x1 + x2) / 2 + 6} y={(y1 + y2) / 2 - 4}>
                {e.label}
              </text>
            ) : null}
          </g>
        );
      })}
      {v.nodes.map((n) => {
        const p = pos.get(n.id)!;
        const ptrs = f.pointers.filter((x) => x.node === n.id);
        return (
          <g key={n.id} className={`tv-node${has(f.highlight, n.id) ? " hl" : ""}${has(f.done, n.id) ? " done" : ""}`}>
            <circle cx={p[0]} cy={p[1]} r={R} />
            <text x={p[0]} y={p[1] + 4} textAnchor="middle">
              {n.label || n.id}
            </text>
            {ptrs.length ? (
              <text x={p[0] + R + 4} y={p[1] - R + 4} className="tv-gptr">
                {ptrs.map((x) => x.name).join(",")}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

/** Which parts of one table an address list touches: whole table, rows, columns and single cells. */
function marks(list: TableAddr[], id: string, columns: string[]) {
  const m = { table: false, rows: new Set<number>(), cols: new Set<number>(), cells: new Set<string>() };
  for (const a of list) {
    if (a.table !== id) continue;
    const c = colIndex({ columns }, a.col);
    if (c === undefined) continue;
    if (a.row === undefined && c < 0) m.table = true;
    else if (c < 0) m.rows.add(a.row!);
    else if (a.row === undefined) m.cols.add(c);
    else m.cells.add(`${a.row},${c}`);
  }
  return m;
}

/** SQL tables side by side. Highlight = outline plus a marker (and hidden text); NULL (∅) is styled and labelled. */
function TablesView({ v, i }: { v: TablesVisual; i: number }) {
  const f = v.frames[i];
  const now = useMemo(() => tablesAt(v, i), [v, i]);
  const before = useMemo(() => (i > 0 ? tablesAt(v, i - 1) : null), [v, i]);
  return (
    <div className="tv-tables">
      {now.map((t, ti) => {
        const hl = marks(f.highlight, t.id, t.columns);
        const dn = marks(f.done, t.id, t.columns);
        const prevShown = before ? before[ti].shown : t.result ? 0 : t.shown;
        const gone = t.rows.length - t.shown;
        const cols = t.columns.length;
        return (
          <figure key={t.id} className="tv-sqlt" data-table={t.id} data-hl={hl.table || undefined}>
            <div className="tv-scroll" tabIndex={0} role="group" aria-label={`${t.name}, scrollable`}>
              <table>
                <caption>
                  {hl.table ? <span aria-hidden="true">◆ </span> : null}
                  {t.name}
                  {t.result ? <span className="tv-rescount"> · result, {t.shown} {t.shown === 1 ? "row" : "rows"}</span> : null}
                  {hl.table ? <span className="sr-only"> (highlighted)</span> : null}
                </caption>
                <thead>
                  <tr>
                    <td className="tv-gutter" />
                    {t.columns.map((c, ci) => (
                      <th key={ci} scope="col" data-hl={hl.cols.has(ci) || undefined}>
                        {hl.cols.has(ci) ? <span aria-hidden="true">▾ </span> : null}
                        {c}
                        {hl.cols.has(ci) ? <span className="sr-only"> (highlighted column)</span> : null}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {t.rows.slice(0, t.shown).map((r, ri) => {
                    const rowHl = hl.rows.has(ri);
                    const rowDone = dn.rows.has(ri);
                    return (
                      <tr key={ri} data-hl={rowHl || undefined} data-done={rowDone || undefined} className={t.result && ri >= prevShown ? "tv-new" : undefined}>
                        <th scope="row" className="tv-gutter">
                          {rowHl ? (
                            <>
                              <span aria-hidden="true">▸</span>
                              <span className="sr-only">highlighted row</span>
                            </>
                          ) : rowDone ? (
                            <>
                              <span aria-hidden="true">✓</span>
                              <span className="sr-only">done row</span>
                            </>
                          ) : (
                            <span className="sr-only">row {ri + 1}</span>
                          )}
                        </th>
                        {Array.from({ length: cols }, (_, ci) => {
                          const val = r[ci] ?? "";
                          const cell = hl.cells.has(`${ri},${ci}`);
                          const cdone = dn.cells.has(`${ri},${ci}`) || dn.cols.has(ci);
                          return (
                            <td key={ci} data-hl={cell || hl.cols.has(ci) || undefined} data-done={cdone || undefined} data-null={val === "∅" || undefined} className="mono">
                              {cell ? <span aria-hidden="true" className="tv-mark">◆</span> : null}
                              {val === "∅" ? (
                                <>
                                  <span aria-hidden="true">∅</span>
                                  <span className="sr-only">NULL</span>
                                </>
                              ) : (
                                val
                              )}
                              {cell ? <span className="sr-only"> (highlighted)</span> : null}
                              {cdone && !cell ? <span className="sr-only"> (done)</span> : null}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                  {Array.from({ length: Math.max(0, gone) }, (_, k) => (
                    <tr key={`g${k}`} className="tv-ghost" aria-hidden="true">
                      <th className="tv-gutter" />
                      {t.columns.map((_, ci) => (
                        <td key={ci}>&nbsp;</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </figure>
        );
      })}
    </div>
  );
}

export function TraceVisual({ visual, side }: { visual: Visual; side?: ReactNode }) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const n = visual.frames.length;
  useEffect(() => {
    if (!playing) return;
    if (i >= n - 1) return setPlaying(false);
    const t = setTimeout(() => setI((x) => x + 1), 1400);
    return () => clearTimeout(t);
  }, [playing, i, n]);
  const f = visual.frames[i];
  return (
    <div className="tv">
      <div className="dg-controls">
        <strong>{visual.title}</strong>
        <div className="actions">
          <button type="button" className="btn ghost small" onClick={() => (setPlaying(false), setI((x) => Math.max(0, x - 1)))} disabled={i === 0} aria-label="Previous frame">
            ◀
          </button>
          <span className="hint" aria-live="polite">
            {i + 1} / {n}
          </span>
          <button type="button" className="btn ghost small" onClick={() => (setPlaying(false), setI((x) => Math.min(n - 1, x + 1)))} disabled={i >= n - 1} aria-label="Next frame">
            ▶
          </button>
          <button type="button" className="btn ghost small"
           
            onClick={() => {
              if (i >= n - 1) setI(0);
              setPlaying((p) => !p);
            }}
          >
            {playing ? "Pause" : "Play"}
          </button>
        </div>
      </div>
      <div className="tv-stage">
        <div className={`tv-pic${visual.kind === "tables" ? " tv-pic-tables" : ""}`}>{visual.kind === "tables" ? <TablesView v={visual} i={i} /> : visual.kind === "array" ? <ArrayView v={visual} i={i} /> : visual.kind === "grid" ? <GridView v={visual} i={i} /> : <GraphView v={visual} i={i} />}</div>
        {f.vars.length ? (
          <dl className="tv-vars">
            {f.vars.map((x) => (
              <div key={x.name}>
                <dt>{x.name}</dt>
                <dd className="mono">{x.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        {side}
      </div>
      <p className="dg-caption" aria-live="polite">
        <strong>Step {i + 1}.</strong> {f.caption}
      </p>
    </div>
  );
}

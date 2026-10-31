"use client";
/**
 * Visuals tab (Jamie 2026-10-26): every visual for a topic, grouped by concept, beside the note. A concept dropdown
 * and a ‹ n / m › stepper replace the long row of name buttons; time and space sit on the side of the picture.
 */
import { useEffect, useMemo, useState } from "react";
import { TraceVisual } from "./trace-visual";
import { MdInline } from "./markdown";
import type { GalleryGroup } from "@/lib/notes/concepts";

export function VisualsTab({ groups, focus }: { groups: GalleryGroup[]; focus?: { concept: string; tick: number } }) {
  const [g, setG] = useState(0);
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!focus) return;
    const k = groups.findIndex((x) => x.concept === focus.concept);
    if (k >= 0) {
      setG(k);
      setI(0);
    }
  }, [focus, groups]);
  const flat = useMemo(() => groups.flatMap((grp, gi) => grp.items.map((_, ii) => [gi, ii] as const)), [groups]);
  if (!groups.length) return <p className="hint panel">No visuals for this topic yet.</p>;
  const grp = groups[Math.min(g, groups.length - 1)];
  const item = grp.items[Math.min(i, grp.items.length - 1)];
  const pos = flat.findIndex(([a, b]) => a === groups.indexOf(grp) && b === grp.items.indexOf(item));
  const step = (d: number) => {
    const [a, b] = flat[(pos + d + flat.length) % flat.length];
    setG(a);
    setI(b);
  };
  return (
    <section className="panel vg" aria-label="Visuals">
      <label className="vg-concept">
        <span className="sr-only">Concept</span>
        <select value={groups.indexOf(grp)} onChange={(e) => (setG(Number(e.target.value)), setI(0))} aria-label="Concept">
          {groups.map((x, k) => (
            <option key={x.concept} value={k}>
              {x.concept.replace(/`/g, "")} ({x.items.length})
            </option>
          ))}
        </select>
      </label>
      <div className="vg-step">
        <button type="button" className="mbtn" aria-label="Previous visual" onClick={() => step(-1)}>
          ‹
        </button>
        <div className="vg-name">
          <strong>{item.short}</strong>
          <span className="hint">
            {grp.items.indexOf(item) + 1} / {grp.items.length}
            {" · "}
            Concept
          </span>
        </div>
        <button type="button" className="mbtn" aria-label="Next visual" onClick={() => step(1)}>
          ›
        </button>
      </div>
      {grp.items.length > 1 ? (
        <div className="vg-dots" role="tablist" aria-label="Visuals in this concept">
          {grp.items.map((x, k) => (
            <button key={x.key} type="button" role="tab" aria-selected={x === item} aria-label={x.short} title={x.short} onClick={() => setI(k)} />
          ))}
        </div>
      ) : null}
      <TraceVisual
        key={item.key}
        visual={item.visual}
        side={
          item.time || item.space ? (
            <dl className="tv-vars vg-cost">
              {item.time ? (
                <div>
                  <dt>Time</dt>
                  <dd>
                    <MdInline text={item.time} />
                  </dd>
                </div>
              ) : null}
              {item.space ? (
                <div>
                  <dt>Space</dt>
                  <dd>
                    <MdInline text={item.space} />
                  </dd>
                </div>
              ) : null}

            </dl>
          ) : null
        }
      />
    </section>
  );
}

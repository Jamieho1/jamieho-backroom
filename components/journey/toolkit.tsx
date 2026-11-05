"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import type { SectionChapter } from "@/lib/journey/timeline";
import { layerZ, toolkitState } from "@/lib/journey/toolkit";

export interface ToolkitHandle { setProgress(local: number): void }
type Data = NonNullable<SectionChapter["toolkit"]>;

/**
 * TKT-88: the one layered scene (BMW "04"-style), done in CSS 3D. Tilted planes lie stacked, then lift apart one by
 * one as you scroll; the text beside them explains the lit layer. Certification badges close the section.
 * Only transform and opacity change (the planes' heights go through a CSS variable into translateZ).
 */
export const Toolkit = forwardRef<ToolkitHandle, { data: Data }>(function Toolkit({ data }, ref) {
  const planes = useRef<(HTMLDivElement | null)[]>([]);
  const texts = useRef<(HTMLDivElement | null)[]>([]);
  const certs = useRef<HTMLDivElement>(null);
  const L = data.layers.length;

  useImperativeHandle(ref, () => ({
    setProgress(local) {
      const s = toolkitState(local, L, data.certs.length);
      data.layers.forEach((_, k) => {
        const plane = planes.current[k];
        if (plane) {
          plane.style.setProperty("--z", layerZ(k, s.lift).toFixed(1));
          plane.dataset.on = String(k === s.active && s.certs < 0.5);
        }
        const text = texts.current[k];
        if (text) {
          const o = k === s.active ? 1 - s.certs : 0;
          text.style.opacity = o.toFixed(3);
          text.style.visibility = o > 0 ? "visible" : "hidden";
          text.style.transform = `translate3d(0, ${((1 - o) * 14).toFixed(1)}px, 0)`;
        }
      });
      const c = certs.current;
      if (c) { c.style.opacity = s.certs.toFixed(3); c.style.visibility = s.certs > 0 ? "visible" : "hidden"; c.style.pointerEvents = s.certs > 0.6 ? "auto" : "none"; }
    },
  }), [data, L]);

  return (
    <div className="journey-toolkit">
      <div className="journey-toolkit-text">
        <p className="journey-eyebrow">{data.title}</p>
        <div className="journey-toolkit-items">
          {data.layers.map((l, k) => (
            <div key={l.name} ref={(el) => { texts.current[k] = el; }} className="journey-toolkit-item" style={{ opacity: k ? 0 : 1, visibility: k ? "hidden" : "visible" }}>
              <p className="journey-toolkit-n">{String(k + 1).padStart(2, "0")} / {String(L).padStart(2, "0")}</p>
              <h2 className="journey-title">{l.name}</h2>
              {l.how ? <p className="journey-body">{l.how}</p> : null}
              {l.tools.length ? <ul className="journey-chips" aria-label={`${l.name} tools`}>{l.tools.map((t) => <li key={t}>{t}</li>)}</ul> : null}
            </div>
          ))}
          {data.certs.length ? (
            <div ref={certs} className="journey-toolkit-certs" style={{ opacity: 0, visibility: "hidden" }}>
              <h2 className="journey-title">Certified</h2>
              <ul>
                {data.certs.map((c) => (
                  <li key={c.title}>
                    {c.href ? <a href={c.href} target="_blank" rel="noopener noreferrer"><Badge c={c} /> <span className="journey-toolkit-verify">Verify ↗</span></a> : <Badge c={c} />}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
      <div className="journey-toolkit-stage" aria-hidden="true">
        <div className="journey-toolkit-stack">
          {data.layers.map((l, k) => (
            <div key={l.name} ref={(el) => { planes.current[k] = el; }} className="journey-toolkit-plane" style={{ ["--k" as string]: k, ["--z" as string]: k * 14 }}>
              <span className="journey-toolkit-label">{l.name}</span>
              <span className="journey-toolkit-grid">{l.tools.slice(0, 6).map((t) => <i key={t}>{t}</i>)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

function Badge({ c }: { c: Data["certs"][number] }) {
  return <span className="journey-toolkit-badge"><span className="journey-toolkit-seal" aria-hidden="true">✓</span><span><strong>{c.title}</strong>{c.org ? <small>{c.org}</small> : null}</span></span>;
}

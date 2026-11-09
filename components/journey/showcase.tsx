"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import type { ShowcaseItem } from "@/lib/journey/timeline";
import { itemOpacity, shotState, showcaseState } from "@/lib/journey/showcase";

export interface ShowcaseHandle { setProgress(local: number): void }

/**
 * TKT-87: the pinned projects showcase. Left: the current project's number, name, tagline, tags and a link to its
 * case study. Right: a browser frame whose screenshots cross-fade as you scroll (a tall full-page shot pans down).
 * Bottom-left: one line per project; the current one fills. Driven by the journey's single rAF loop.
 */
export const Showcase = forwardRef<ShowcaseHandle, { items: ShowcaseItem[] }>(function Showcase({ items }, ref) {
  const texts = useRef<(HTMLDivElement | null)[]>([]);
  const frames = useRef<(HTMLDivElement | null)[]>([]);
  const shots = useRef<(HTMLImageElement | null)[][]>([]);
  const lines = useRef<(HTMLSpanElement | null)[]>([]);
  const count = useRef<HTMLSpanElement>(null);
  const n = items.length;

  useImperativeHandle(ref, () => ({
    setProgress(local) {
      const s = showcaseState(local, n);
      items.forEach((item, k) => {
        const o = itemOpacity(s, k, n);
        const text = texts.current[k];
        if (text) {
          text.style.opacity = o.toFixed(3);
          text.style.visibility = o > 0 ? "visible" : "hidden";
          text.style.transform = `translate3d(0, ${((1 - o) * 18).toFixed(1)}px, 0)`;
        }
        const frame = frames.current[k];
        if (frame) { frame.style.opacity = k === s.index ? "1" : "0"; frame.style.visibility = k === s.index ? "visible" : "hidden"; }
        if (k !== s.index) return;
        const imgs = shots.current[k] ?? [];
        const { shot, mix, pan } = shotState(s.within, imgs.length);
        imgs.forEach((img, j) => {
          if (!img) return;
          img.style.opacity = j === shot ? String(1 - mix) : j === shot + 1 ? String(mix) : "0";
          // A full-page screenshot (much taller than the frame) slides up as if someone scrolls the site.
          const box = img.parentElement;
          const tall = img.dataset.fit !== "contain" && box && img.naturalWidth ? img.naturalHeight / img.naturalWidth - box.clientHeight / box.clientWidth : 0;
          img.style.transform = tall > 0.15 && j === shot ? `translate3d(0, ${(-pan * 100 * (1 - (box!.clientHeight / box!.clientWidth) / (img.naturalHeight / img.naturalWidth))).toFixed(2)}%, 0)` : "";
        });
      });
      lines.current.forEach((l, k) => { if (l) l.style.transform = `scaleX(${s.lines[k].toFixed(3)})`; });
      if (count.current) count.current.textContent = String(s.index + 1).padStart(2, "0");
    },
  }), [items, n]);

  return (
    <div className="journey-showcase">
      <div className="journey-showcase-text">
        <p className="journey-eyebrow">Selected work · <span ref={count}>01</span> / {String(n).padStart(2, "0")}</p>
        <div className="journey-showcase-items">
          {items.map((it, k) => (
            <div key={it.slug} ref={(el) => { texts.current[k] = el; }} className="journey-showcase-item journey-reading-card" style={{ opacity: k ? 0 : 1, visibility: k ? "hidden" : "visible" }}>
              <h2 className="journey-title">{it.name}</h2>
              {it.tagline ? <p className="journey-body">{it.tagline}</p> : null}
              {it.tags.length ? <ul className="journey-chips" aria-label="Built with">{it.tags.map((t) => <li key={t}>{t}</li>)}</ul> : null}
              <a className="journey-cta-link" href={it.href}>Read the case study <span>→</span></a>
            </div>
          ))}
        </div>
        <div className="journey-showcase-foot">
          <ol className="journey-showcase-lines" aria-label={`${n} featured projects`}>
            {items.map((it, k) => <li key={it.slug} title={it.name}><span ref={(el) => { lines.current[k] = el; }} /></li>)}
          </ol>
          <a className="journey-showcase-all" href="/projects">All projects <span>→</span></a>
        </div>
      </div>
      <div className="journey-showcase-frame" aria-hidden="true">
        <div className="journey-showcase-bar"><i /><i /><i /></div>
        <div className="journey-showcase-screen">
          {items.map((it, k) => (
            <div key={it.slug} ref={(el) => { frames.current[k] = el; }} className="journey-showcase-shots" style={{ opacity: k ? 0 : 1, visibility: k ? "hidden" : "visible" }}>
              {it.shots.length ? it.shots.map((src, j) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={src} data-fit={it.slug === "cyterly" ? "contain" : undefined} ref={(el) => { (shots.current[k] ??= [])[j] = el; }} src={src} alt="" loading="lazy" style={{ opacity: j ? 0 : 1 }} />
              )) : <div className="journey-showcase-blank"><span>{it.name}</span></div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

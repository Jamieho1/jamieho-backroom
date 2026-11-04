"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import {
  type Chapter, type VideoChapter, alignAt, approach, fadeCover, joinOpacity, layout, locate, mapKeys, panelOpacity, progressOf,
} from "@/lib/journey/timeline";
import { LibraryScene, type LibrarySceneHandle } from "./library-scene";
import { Markdown } from "@/components/markdown";
import type { Panel } from "@/lib/journey/timeline";

/**
 * Home v1 scroll engine (TKT-74). One scroll owner: Lenis smooths native scroll, ScrollTrigger reports progress over
 * one tall track, and a single rAF loop eases toward it and draws the active chapter (video time, layered scene or
 * fade). Only transform/opacity are animated (scroll-craft hard rules). All text is real HTML; without JavaScript
 * or with reduced motion the server-rendered still-frame version is shown instead.
 */
export function Journey({ chapters, base }: { chapters: Chapter[]; base: string }) {
  const lay = useMemo(() => layout(chapters), [chapters]);
  const track = useRef<HTMLDivElement>(null);
  const layers = useRef<(HTMLElement | null)[]>([]);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const panels = useRef<Map<string, HTMLElement>>(new Map());
  const library = useRef<LibrarySceneHandle>(null);
  const fadeEl = useRef<HTMLDivElement>(null);
  const hud = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [debug, setDebug] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    setMobile(window.matchMedia("(max-width: 768px)").matches);
    setDebug(new URLSearchParams(window.location.search).has("debug"));
    setLive(!reduce.matches);
    const onChange = () => setLive(!reduce.matches);
    reduce.addEventListener("change", onChange);
    return () => reduce.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!live || !track.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    let target = 0;
    const st = ScrollTrigger.create({ trigger: track.current, start: "top top", end: "bottom bottom", onUpdate: (s) => { target = s.progress; } });
    target = st.progress;
    let shown = target, last = performance.now(), raf = 0;

    // Jump straight to the desk for /journey#desk (no forced tour).
    if (window.location.hash === "#desk") {
      const y = st.start + (st.end - st.start) * progressOf(chapters, "desk", lay) + 1;
      lenis.scrollTo(y, { immediate: true }); target = shown = progressOf(chapters, "desk", lay);
    }

    const draw = () => {
      const now = performance.now();
      shown = approach(shown, target, now - last);
      last = now;
      const { index, local } = locate(chapters, shown, lay);
      const active = chapters[index];
      chapters.forEach((c, i) => {
        const el = layers.current[i];
        if (!el) return;
        // Visible: the active chapter, the one beneath it while it joins in, and both sides of a fade.
        let opacity = 0;
        if (i === index) opacity = active.kind === "fade" ? 1 : joinOpacity(c, local);
        else if (i === index - 1 && (active.kind === "fade" ? local < 0.5 : joinOpacity(active, local) < 1)) opacity = 1;
        else if (active.kind === "fade" && i === index + 1 && local >= 0.5) opacity = 1;
        el.style.opacity = String(opacity);
        el.style.visibility = opacity > 0 ? "visible" : "hidden";
        const at = i === index ? local : i < index ? 1 : 0;
        if (c.kind === "video") drawVideo(c, videos.current[i], el, at);
        if (c.kind === "layers" && opacity > 0) library.current?.setProgress(at);
        for (const p of c.panels ?? []) {
          const node = panels.current.get(`${c.id}:${p.id}`);
          if (!node) continue;
          const o = i === index ? panelOpacity(p, local) : 0;
          node.style.opacity = String(o);
          node.style.transform = `translate3d(0, ${(1 - o) * (local > (p.from + p.to) / 2 ? -28 : 28)}px, 0)`;
          node.style.visibility = o > 0 ? "visible" : "hidden";
        }
      });
      if (fadeEl.current) {
        fadeEl.current.style.opacity = active.kind === "fade" ? String(fadeCover(local)) : "0";
        if (active.kind === "fade") fadeEl.current.style.background = active.color;
      }
      if (hud.current) hud.current.textContent = `${(shown * 100).toFixed(1)}% · ${active.id} ${(local * 100).toFixed(0)}%`;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); st.kill(); gsap.ticker.remove(tick); lenis.destroy(); };
  }, [live, chapters, lay]);

  return (
    <div className={`journey${live ? " journey-live" : ""}`}>
      {live ? (
        <div ref={track} className="journey-track" style={{ height: `${lay.total * 100 + 100}vh` }}>
          <div className="journey-stage">
            {chapters.map((c, i) => (
              <div key={c.id} ref={(el) => { layers.current[i] = el; }} className={`journey-chapter${c.kind === "fade" ? ` journey-over journey-tone-${c.tone ?? "dark"}` : ""}`} data-chapter={c.id}>
                {c.kind === "video" ? (
                  <div className="journey-frame">
                    <video ref={(el) => { videos.current[i] = el; }} className="journey-video" muted playsInline preload="auto"
                      poster={`${base}/${c.src}-first.jpg`} src={`${base}/${c.src}-${mobile ? "mobile" : "desktop"}.mp4`} />
                  </div>
                ) : c.kind === "layers" ? <LibraryScene ref={library} base={base} /> : null}
                {(c.panels ?? []).map((p) => (
                  <section key={p.id} ref={(el) => { if (el) panels.current.set(`${c.id}:${p.id}`, el); }}
                    className={`journey-panel journey-panel-${p.side ?? "left"}`} aria-label={p.title}>
                    <PanelBody p={p} heading={c.id === "sky" ? "h1" : "h2"} />
                  </section>
                ))}
              </div>
            ))}
            <div ref={fadeEl} className="journey-fade" />
            {debug ? <div ref={hud} className="journey-hud" /> : null}
          </div>
        </div>
      ) : (
        <StillJourney chapters={chapters} base={base} />
      )}
    </div>
  );
}

function drawVideo(c: VideoChapter, v: HTMLVideoElement | null | undefined, el: HTMLElement, local: number) {
  if (!v) return;
  const a = alignAt(c, local);
  const frame = el.firstElementChild as HTMLElement | null;
  if (frame) frame.style.transform = a.scale === 1 && !a.x && !a.y ? "" : `translate3d(${a.x * 100}%, ${a.y * 100}%, 0) scale(${a.scale})`;
  if (!v.duration || v.seeking) return;
  const t = mapKeys(c.keys, local) * Math.max(0, v.duration - 0.05);
  if (Math.abs(v.currentTime - t) > 1 / 60) v.currentTime = t;
}

/** No JavaScript, reduced motion or before hydration: every chapter as a sharp still with its text, in order. */
export function StillJourney({ chapters, base }: { chapters: Chapter[]; base: string }) {
  return (
    <ol className="journey-stills">
      {chapters.filter((c) => c.kind !== "fade").map((c) => (
        <li key={c.id} id={c.id === "desk" ? "desk" : undefined} className="journey-still">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={c.kind === "video" ? `${base}/${c.src}-${c.id === "sky" ? "first" : "last"}.jpg` : `${base}/lib-plate.jpg`} alt="" loading={c.id === "sky" ? "eager" : "lazy"} />
          {(c.panels ?? []).map((p) => (
            <section key={p.id} className="journey-still-panel" aria-label={p.title}>
              <PanelBody p={p} heading={c.id === "sky" ? "h1" : "h2"} />
            </section>
          ))}
        </li>
      ))}
    </ol>
  );
}

function PanelBody({ p, heading }: { p: Panel; heading: "h1" | "h2" }) {
  const H = heading;
  return <>
    {p.eyebrow ? <p className="journey-eyebrow">{p.eyebrow}</p> : null}
    <H>{p.title}</H>
    {p.meta ? <p className="journey-meta">{p.meta}</p> : null}
    {p.body ? (p.md ? <div className="journey-md"><Markdown text={p.body} /></div> : <p>{p.body}</p>) : null}
    {p.chips?.length ? <ul className="journey-chips" aria-label="Technologies">{p.chips.map((t) => <li key={t}>{t}</li>)}</ul> : null}
  </>;
}

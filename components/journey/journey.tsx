"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import {
  type Chapter, type Panel, type VideoChapter, alignAt, approach, displayOpacity, fadeCover, joinOpacity, layout, locate,
  ctaOpacity, mapKeys, panelOpacity, progressOf, wordReveal,
} from "@/lib/journey/timeline";
import { LibraryScene, type LibrarySceneHandle } from "./library-scene";
import { Motes, type MotesHandle } from "./motes";
import { ScreenCta, type ScreenCtaHandle } from "./screen-cta";
import { StartScreen } from "./start-screen";
import { registerMediaCache, shouldSkipVideo, startPreloader, type Preloader } from "./preloader";
import { mediaUrl, preloadOrder, startProgress, stillFor } from "@/lib/journey/media";
import { DESKTOP_HREF } from "@/lib/journey/content";
import { Markdown } from "@/components/markdown";

/**
 * Home v1 scroll engine (TKT-74, polish pass 2026-11-05). One scroll owner: Lenis smooths native scroll,
 * ScrollTrigger reports progress over one tall track, and a single rAF loop eases toward it and draws the active
 * chapter (video time, layered scene or fade), the giant chapter words, word-by-word panel reveals, the progress
 * bar and the chapter menu. Only transform/opacity animate (scroll-craft hard rules). All text is real HTML;
 * without JavaScript or with reduced motion the server-rendered still-frame version is shown instead.
 */

export function Journey({ chapters, base }: { chapters: Chapter[]; base: string }) {
  const lay = useMemo(() => layout(chapters), [chapters]);
  const navItems = useMemo(() => chapters.map((c, i) => ({ c, i })).filter(({ c }) => c.nav), [chapters]);
  const track = useRef<HTMLDivElement>(null);
  const layers = useRef<(HTMLElement | null)[]>([]);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const displays = useRef<(HTMLElement | null)[]>([]);
  const panels = useRef<Map<string, HTMLElement>>(new Map());
  const library = useRef<LibrarySceneHandle>(null);
  const motes = useRef<MotesHandle>(null);
  const cta = useRef<ScreenCtaHandle>(null);
  const fadeEl = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const navRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const hud = useRef<HTMLDivElement>(null);
  const jump = useRef<(id: string) => void>(() => {});
  const skip = useRef<() => void>(() => {});
  const lenisRef = useRef<Lenis | null>(null);
  const ready = useRef<boolean[]>([]);
  const preloader = useRef<Preloader | null>(null);
  const [live, setLive] = useState(false);
  const [entered, setEntered] = useState(false);
  const [startShown, setStartShown] = useState(true);
  const [ring, setRing] = useState(0);
  const [mobile, setMobile] = useState(false);
  const [debug, setDebug] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    setMobile(window.matchMedia("(max-width: 768px)").matches);
    setDebug(new URLSearchParams(window.location.search).has("debug"));
    setLive(!reduce.matches);
    if (window.location.hash === "#desk") { setEntered(true); setStartShown(false); } // deep link: straight to the desk
    const onChange = () => setLive(!reduce.matches);
    reduce.addEventListener("change", onChange);
    return () => reduce.removeEventListener("change", onChange);
  }, []);

  // TKT-76: download the clips whole, in chapter order, and swap each chapter from its still to its video as it lands.
  useEffect(() => {
    if (!live) return;
    registerMediaCache();
    const variant = mobile ? "mobile" : "desktop";
    const items = preloadOrder(chapters, variant, window.location.hash === "#desk" ? "c7b" : undefined);
    if (shouldSkipVideo()) { setRing(1); return; }
    const loaded: Record<string, number> = {};
    let shownRing = 0;
    preloader.current = startPreloader(items, (i) => mediaUrl(base, i.file), {
      progress(src, bytes) {
        loaded[src] = bytes;
        const r = Math.floor(startProgress(items, loaded) * 100) / 100;
        if (r !== shownRing) { shownRing = r; setRing(r); }
      },
      ready(src, blobUrl) {
        chapters.forEach((c, i) => {
          const v = videos.current[i];
          if (c.kind !== "video" || c.src !== src || !v) return;
          v.addEventListener("loadeddata", () => { ready.current[i] = true; }, { once: true });
          v.src = blobUrl;
          // iOS only lets a video seek smoothly once it has played; it's muted and inline, so this is allowed.
          void v.play().then(() => v.pause()).catch(() => {});
        });
      },
    });
    return () => { preloader.current?.dispose(); preloader.current = null; ready.current = []; };
  }, [live, mobile, chapters, base]);

  const enter = () => {
    // Inside the tap: let every clip that has already arrived play once, so iOS lets it scrub.
    videos.current.forEach((v) => { if (v?.src) void v.play().then(() => v.pause()).catch(() => {}); });
    setEntered(true);
  };

  useEffect(() => {
    if (!live || !track.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.9 });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    let target = 0;
    const st = ScrollTrigger.create({ trigger: track.current, start: "top top", end: "bottom bottom", onUpdate: (s) => { target = s.progress; } });
    target = st.progress;
    let shown = target, last = performance.now(), raf = 0;
    // The computer is the very end of the track (where "Switch on" appears); other chapters jump to their start.
    const yOf = (id: string) => id === "screen" ? st.end : st.start + (st.end - st.start) * progressOf(chapters, id, lay) + 1;
    jump.current = (id) => lenis.scrollTo(yOf(id), { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 3) });

    // Straight to the switched-off computer for /journey#desk links (no forced tour).
    skip.current = () => { lenis.start(); lenis.scrollTo(st.end, { immediate: true, force: true }); target = shown = 1; };
    if (window.location.hash === "#desk") skip.current();

    // Word spans per panel, cached once.
    const words = new Map<string, HTMLElement[]>();
    panels.current.forEach((node, key) => words.set(key, [...node.querySelectorAll<HTMLElement>(".journey-w")]));

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
        if (c.kind === "video") drawVideo(c, videos.current[i], el, at, !!ready.current[i], base);
        if (c.kind === "layers" && opacity > 0) library.current?.setProgress(at);
        const d = displays.current[i];
        if (d) {
          const o = i === index ? displayOpacity(local) : 0;
          d.style.opacity = String(o);
          d.style.transform = `translate3d(-50%, -50%, 0) scale(${1 + (1 - o) * 0.08})`;
          d.style.letterSpacing = `${0.02 + (1 - o) * 0.12}em`;
        }
        for (const p of c.panels ?? []) {
          const key = `${c.id}:${p.id}`;
          const node = panels.current.get(key);
          if (!node) continue;
          const o = i === index ? panelOpacity(p, local, 0.08) : 0;
          const leaving = local > (p.from + p.to) / 2;
          node.style.opacity = o > 0 ? "1" : "0";
          node.style.visibility = o > 0 ? "visible" : "hidden";
          node.style.setProperty("--o", o.toFixed(3));
          const ws = words.get(key) ?? [];
          ws.forEach((w, k) => {
            const r = leaving ? o : wordReveal(o, k, ws.length);
            w.style.opacity = r.toFixed(3);
            w.style.transform = `translate3d(0, ${((1 - r) * (leaving ? -0.4 : 0.6)).toFixed(3)}em, 0)`;
          });
        }
      });
      // Hotspots are cut from the clip's last frame, so only show them once the video has actually landed there
      // (a seek can trail the scroll), otherwise the glow sits over the wrong picture.
      // "Switch on" appears once the push-in has (nearly) filled the frame with the monitor.
      const cv = active.id === "screen" ? videos.current[index] : null;
      const filled = !!cv && (!ready.current[index] || (cv.duration > 0 && !cv.seeking && cv.currentTime >= cv.duration * 0.8));
      cta.current?.setOpacity(filled ? ctaOpacity(local) : 0);
      motes.current?.setIntensity(active.kind === "fade" ? 0 : active.motes ?? 0);
      if (fadeEl.current) {
        fadeEl.current.style.opacity = active.kind === "fade" ? String(fadeCover(local)) : "0";
        if (active.kind === "fade") fadeEl.current.style.background = active.color;
      }
      if (bar.current) bar.current.style.transform = `scaleX(${shown.toFixed(4)})`;
      // Chapter menu: the current item is the last listed chapter at or before the active one.
      let current = -1;
      navItems.forEach(({ i }, k) => { if (i <= index) current = k; });
      navRefs.current.forEach((b, k) => { if (b) b.ariaCurrent = k === current ? "step" : null; });
      if (hud.current) hud.current.textContent = `${(shown * 100).toFixed(1)}% · ${active.id} ${(local * 100).toFixed(0)}%`;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf); st.kill(); gsap.ticker.remove(tick); lenis.destroy();
      lenisRef.current = null; jump.current = () => {}; skip.current = () => {};
    };
  }, [live, chapters, lay, navItems, base]);

  // Declared after the engine so Lenis exists. The start screen holds the page still until the visitor enters (or skips to the desk).
  useEffect(() => {
    if (!live || entered) return;
    const html = document.documentElement;
    html.style.overflow = "hidden";
    lenisRef.current?.stop();
    return () => { html.style.overflow = ""; lenisRef.current?.start(); };
  }, [live, entered]);

  return (
    <div className={`journey${live ? " journey-live" : ""}`}>
      {live ? (
        <div ref={track} className="journey-track" style={{ height: `${lay.total * 100 + 100}vh` }}>
          <div className="journey-stage">
            {chapters.map((c, i) => (
              <div key={c.id} ref={(el) => { layers.current[i] = el; }} className={`journey-chapter${c.kind === "fade" ? ` journey-over journey-tone-${c.tone ?? "dark"}` : ""}`} data-chapter={c.id}>
                {c.kind === "video" ? (
                  <div className="journey-frame">
                    {/* No src until the whole clip has downloaded (TKT-76); until then the poster is the chapter's still. */}
                    <video ref={(el) => { videos.current[i] = el; }} className="journey-video" muted playsInline preload="none"
                      poster={mediaUrl(base, stillFor(c.src, 0))} data-still={stillFor(c.src, 0)} />
                  </div>
                ) : c.kind === "layers" ? <LibraryScene ref={library} base={base} /> : null}
                {c.display ? <p ref={(el) => { displays.current[i] = el; }} className="journey-display" aria-hidden="true">{c.display}</p> : null}
                {(c.panels ?? []).map((p) => (
                  <section key={p.id} ref={(el) => { if (el) panels.current.set(`${c.id}:${p.id}`, el); }}
                    className={`journey-panel journey-panel-${p.side ?? "left"}`} aria-label={p.title}>
                    <PanelBody p={p} heading={c.id === "sky" ? "h1" : "h2"} split />
                  </section>
                ))}
              </div>
            ))}
            <div className="journey-vignette" aria-hidden="true" />
            <ScreenCta ref={cta} href={DESKTOP_HREF} />
            <Motes ref={motes} />
            <div className="journey-grain" aria-hidden="true" />
            <div ref={fadeEl} className="journey-fade" />
            <div className="journey-progress" aria-hidden="true"><div ref={bar} /></div>
            {navItems.length ? (
              <nav className="journey-nav" aria-label="Journey chapters">
                {navItems.map(({ c }, k) => (
                  <button key={c.id} type="button" ref={(el) => { navRefs.current[k] = el; }} onClick={() => jump.current(c.id)}>
                    <span className="journey-nav-n">{String(k + 1).padStart(2, "0")}</span>{c.nav}
                  </button>
                ))}
              </nav>
            ) : null}
            {debug ? <div ref={hud} className="journey-hud" /> : null}
            {startShown ? (
              <StartScreen still={mediaUrl(base, "c1-first.jpg")} hero={chapters[0]?.panels?.[0]} progress={ring}
                desktopHref={DESKTOP_HREF} onEnter={enter} onGone={() => setStartShown(false)} />
            ) : null}
          </div>
        </div>
      ) : (
        <StillJourney chapters={chapters} base={base} />
      )}
    </div>
  );
}

function drawVideo(c: VideoChapter, v: HTMLVideoElement | null | undefined, el: HTMLElement, local: number, ready: boolean, base: string) {
  if (!v) return;
  const a = alignAt(c, local);
  const frame = el.firstElementChild as HTMLElement | null;
  if (frame) frame.style.transform = a.scale === 1 && !a.x && !a.y ? "" : `translate3d(${a.x * 100}%, ${a.y * 100}%, 0) scale(${a.scale})`;
  if (!ready) {
    // Clip still downloading: show the approved still for this part of the chapter, never a frozen half-loaded frame.
    const still = stillFor(c.src, local);
    if (v.dataset.still !== still) { v.dataset.still = still; v.poster = mediaUrl(base, still); }
    return;
  }
  if (!v.duration || v.seeking) return;
  const t = mapKeys(c.keys, local) * Math.max(0, v.duration - 0.05);
  if (Math.abs(v.currentTime - t) > 1 / 60) v.currentTime = t;
}

/** No JavaScript, reduced motion or before hydration: every chapter as a sharp still with its text, in order. */
export function StillJourney({ chapters, base }: { chapters: Chapter[]; base: string }) {
  return (
    <ol className="journey-stills">
      {chapters.filter((c) => c.kind !== "fade").map((c) => (
        <li key={c.id} id={c.id === "room" ? "desk" : undefined} className="journey-still">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mediaUrl(base, c.kind === "video" ? `${c.src}-${c.id === "sky" ? "first" : "last"}.jpg` : "lib-plate.jpg")} alt="" loading={c.id === "sky" ? "eager" : "lazy"} />
          {(c.panels ?? []).map((p) => (
            <section key={p.id} className="journey-still-panel" aria-label={p.title}>
              <PanelBody p={p} heading={c.id === "sky" ? "h1" : "h2"} />
            </section>
          ))}
          {c.id === "screen" ? (
            <nav className="journey-still-panel" aria-label="The computer">
              <a className="journey-cta-link" href={DESKTOP_HREF}>Switch on the computer <span>→</span></a>
            </nav>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

function Words({ text }: { text: string }) {
  return <>{text.split(/(\s+)/).map((w, k) => (/^\s+$/.test(w) ? w : <span key={k} className="journey-w">{w}</span>))}</>;
}

function PanelBody({ p, heading, split = false }: { p: Panel; heading: "h1" | "h2"; split?: boolean }) {
  const H = heading;
  return <>
    {p.eyebrow ? <p className="journey-eyebrow">{p.eyebrow}</p> : null}
    <H className="journey-title">{split ? <Words text={p.title} /> : p.title}</H>
    {p.meta ? <p className="journey-meta">{p.meta}</p> : null}
    {p.body ? (p.md ? <div className="journey-md"><Markdown text={p.body} /></div> : <p className="journey-body">{p.body}</p>) : null}
    {p.chips?.length ? <ul className="journey-chips" aria-label="Technologies">{p.chips.map((t) => <li key={t}>{t}</li>)}</ul> : null}
    {p.links?.length ? (
      <ul className="journey-links">
        {p.links.map((l) => (
          <li key={l.href}>
            <a href={l.href} {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {l.image ? <img src={l.image} alt="" loading="lazy" /> : <span className="journey-link-blank" aria-hidden="true" />}
              <span><span className="journey-link-kicker">{l.kicker}</span><span className="journey-link-title">{l.title}</span></span>
              <span className="journey-link-go" aria-hidden="true">{l.external ? "↗" : "→"}</span>
            </a>
          </li>
        ))}
      </ul>
    ) : null}
    {p.foot?.length ? (
      <p className="journey-foot">{p.foot.map((f, k) => (
        <a key={f.href} href={f.href} {...(/^https?:/.test(f.href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className={k === 0 ? "is-primary" : undefined}>{f.label}</a>
      ))}</p>
    ) : null}
    {p.cta ? <a className="journey-cta-link" href={p.cta.href}>{p.cta.label} <span>→</span></a> : null}
  </>;
}

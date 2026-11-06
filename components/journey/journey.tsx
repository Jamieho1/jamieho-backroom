"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import {
  type Chapter, type Panel, type VideoChapter, alignAt, approach, displayOpacity, fadeCover, joinOpacity, layout, locate,
  ctaOpacity, landingOf, mapKeys, panelOpacity, stillDrift, wipeOffset, wordReveal,
} from "@/lib/journey/timeline";
import { Motes, type MotesHandle } from "./motes";
import { LineShape, type LineShapeHandle } from "./line-shape";
import { lineState } from "@/lib/journey/lines";
import { ScreenCta, type ScreenCtaHandle } from "./screen-cta";
import { Showcase, type ShowcaseHandle } from "./showcase";
import { Toolkit, type ToolkitHandle } from "./toolkit";
import { BrandIcon } from "./brand-icon";
import { StartScreen } from "./start-screen";
import { registerMediaCache, shouldSkipVideo, startPreloader, type Preloader } from "./preloader";
import { mediaUrl, preloadOrder, startProgress, stillFor } from "@/lib/journey/media";
import { DESKTOP_HREF } from "@/lib/journey/content";
import { Markdown } from "@/components/markdown";
import { keyTokens, stripKeys, growAt, growTransform } from "@/lib/journey/motion";
import { PHONE_QUERY, PHONE_STILLS, phoneChapters } from "@/lib/journey/phone";
import { DESKTOP_ASSETS, DESKTOP_PORTRAIT } from "@/components/desktop-scene/assets";

/**
 * Home v1 scroll engine (TKT-74, polish pass 2026-11-05). One scroll owner: Lenis smooths native scroll,
 * ScrollTrigger reports progress over one tall track, and a single rAF loop eases toward it and draws the active
 * chapter (video time, layered scene or fade), the giant chapter words, word-by-word panel reveals, the progress
 * bar and the chapter menu. Only transform/opacity animate (scroll-craft hard rules). All text is real HTML;
 * without JavaScript or with reduced motion the server-rendered still-frame version is shown instead.
 */

export function Journey({ chapters: all, base }: { chapters: Chapter[]; base: string }) {
  const [mobile, setMobile] = useState(false);
  const [dark, setDark] = useState(false);
  // TKT-96: phones run the journey on stills only (no clip downloads), with the desk timing adjusted to match.
  const chapters = useMemo(() => (mobile ? phoneChapters(all) : all), [all, mobile]);
  const lay = useMemo(() => layout(chapters), [chapters]);
  const navItems = useMemo(() => chapters.map((c, i) => ({ c, i })).filter(({ c }) => c.nav), [chapters]);
  const track = useRef<HTMLDivElement>(null);
  const layers = useRef<(HTMLElement | null)[]>([]);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const displays = useRef<(HTMLElement | null)[]>([]);
  const panels = useRef<Map<string, HTMLElement>>(new Map());
  const stills = useRef<(HTMLImageElement | null)[]>([]);
  const showcases = useRef<(ShowcaseHandle | null)[]>([]);
  const toolkits = useRef<(ToolkitHandle | null)[]>([]);
  const dots = useRef<(HTMLOListElement | null)[]>([]);
  const vignette = useRef<HTMLDivElement>(null);
  const motes = useRef<MotesHandle>(null);
  const lineShape = useRef<LineShapeHandle>(null);
  const cta = useRef<ScreenCtaHandle>(null);
  const fadeEl = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const navRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const hud = useRef<HTMLDivElement>(null);
  const cue = useRef<HTMLDivElement>(null);
  const jump = useRef<(id: string) => void>(() => {});
  const skip = useRef<() => void>(() => {});
  const lenisRef = useRef<Lenis | null>(null);
  const ready = useRef<boolean[]>([]);
  const preloader = useRef<Preloader | null>(null);
  const [live, setLive] = useState(false);
  const [entered, setEntered] = useState(false);
  const [startShown, setStartShown] = useState(true);
  const [ring, setRing] = useState(0);
  const [debug, setDebug] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    setMobile(window.matchMedia(PHONE_QUERY).matches);
    setDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
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
    if (mobile || shouldSkipVideo()) { setRing(1); return; } // phones: stills only, nothing to download
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

  const wallpaper = dark ? DESKTOP_ASSETS.nightPortrait : DESKTOP_ASSETS.dayPortrait;
  const phoneStill = useCallback((src: string): PhoneStill | undefined => {
    if (!mobile) return undefined;
    const f = PHONE_STILLS[src];
    if (!f) return undefined;
    return f === "wallpaper"
      ? { url: wallpaper, fit: "portrait", fill: dark ? DESKTOP_PORTRAIT.nightTop : DESKTOP_PORTRAIT.dayTop }
      : { url: mediaUrl(base, f), fit: "cover" };
  }, [mobile, dark, wallpaper, base]);

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
    let shown = target, last = performance.now(), raf = 0, lastNav = -1;
    // The computer is the very end of the track (where "Switch on" appears); other chapters jump to their start.
    const yOf = (id: string) => id === "screen" ? st.end : st.start + (st.end - st.start) * landingOf(chapters, id, lay) + 1;
    jump.current = (id) => lenis.scrollTo(yOf(id), { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 3) });

    // Straight to the switched-off computer for /journey#desk links (no forced tour).
    skip.current = () => { lenis.start(); lenis.scrollTo(st.end, { immediate: true, force: true }); target = shown = 1; };
    if (window.location.hash === "#desk") skip.current();

    // Word spans per panel, cached once.
    const words = new Map<string, HTMLElement[]>();
    panels.current.forEach((node, key) => words.set(key, [...node.querySelectorAll<HTMLElement>(".journey-w")]));
    // Keywords (TKT-92): title **keys** and bold words in the copy light up one after another while the panel reads.
    const keys = new Map<string, HTMLElement[]>();
    panels.current.forEach((node, key) => keys.set(key, [...node.querySelectorAll<HTMLElement>(".journey-key, .journey-md strong, .journey-points strong")]));

    // TKT-93: each section's framed image (still or showcase browser) grows to fill the screen as the section ends.
    // Layout boxes (offset*, unaffected by transforms) are measured once and re-measured after a resize.
    const boxes = new Map<number, { el: HTMLElement; x: number; y: number; w: number; h: number } | null>();
    const growBox = (i: number) => {
      if (boxes.has(i)) return boxes.get(i)!;
      const layer = layers.current[i];
      const el = layer?.querySelector<HTMLElement>(".journey-section-still, .journey-showcase-frame") ?? null;
      let box = null;
      if (layer && el && el.offsetWidth > 0) {
        let x = 0, y = 0, n: HTMLElement | null = el;
        while (n && n !== layer) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent as HTMLElement | null; }
        box = { el, x, y, w: el.offsetWidth, h: el.offsetHeight };
      }
      boxes.set(i, box);
      return box;
    };
    const remeasure = () => boxes.clear();
    window.addEventListener("resize", remeasure);

    let prevNow = performance.now();
    const draw = () => {
      const now = performance.now();
      shown = approach(shown, target, now - last);
      last = now;
      const { index, local } = locate(chapters, shown, lay);
      const active = chapters[index];
      // A solid section wipes up over whatever came before it (BMW-style), then holds flat.
      const wipeIn = active.kind === "section" ? wipeOffset(local, active.wipe) : 0;
      let activeGrow = 0;
      chapters.forEach((c, i) => {
        const el = layers.current[i];
        if (!el) return;
        // Visible: the active chapter, the one beneath it while it joins in, and both sides of a fade.
        let opacity = 0;
        if (i === index) opacity = active.kind === "video" ? joinOpacity(c, local) : 1;
        else if (i === index - 1 && (active.kind === "fade" ? local < 0.5 : active.kind === "section" ? wipeIn > 0 : joinOpacity(active, local) < 1)) opacity = 1;
        else if (active.kind === "fade" && i === index + 1 && local >= 0.5) opacity = 1;
        el.style.opacity = String(opacity);
        el.style.visibility = opacity > 0 ? "visible" : "hidden";
        const at = i === index ? local : i < index ? 1 : 0;
        if (c.kind === "video") drawVideo(c, videos.current[i], el, at, !!ready.current[i], base, phoneStill(c.src));
        if (c.kind === "section") {
          el.style.transform = i === index && wipeIn > 0 ? `translate3d(0, ${(wipeIn * 100).toFixed(2)}%, 0)` : "";
          const img = stills.current[i];
          if (img && opacity > 0) img.style.transform = `translate3d(0, ${(stillDrift(at) * 100).toFixed(2)}%, 0) scale(1.14)`;
          if (opacity > 0) { showcases.current[i]?.setProgress(at); toolkits.current[i]?.setProgress(at); }
          const grows = !c.toolkit?.layers.length && (!!c.showcase?.length || !!c.still);
          const box = grows && (opacity > 0 || el.dataset.grow) ? growBox(i) : null;
          const g = box && opacity > 0 ? growAt(at) : 0;
          if (box) {
            if (g > 0) {
              // A touch past "cover" so the frame's rounded corners leave the screen.
              const t = growTransform(box, el.clientWidth, el.clientHeight, g);
              const sc = t.scale * (1 + 0.06 * g);
              box.el.style.transform = `translate3d(${t.dx.toFixed(1)}px, ${t.dy.toFixed(1)}px, 0) scale(${sc.toFixed(4)})`;
              el.dataset.grow = "1";
            } else { box.el.style.transform = ""; delete el.dataset.grow; }
          }
          el.style.setProperty("--grow", g.toFixed(3));
          if (i === index) activeGrow = g;
          const ol = dots.current[i];
          if (ol && opacity > 0) {
            // Timeline: light the dot of the entry being read (the last one whose window has started).
            let on = 0;
            (c.panels ?? []).forEach((p, k) => { if (at >= p.from) on = k; });
            ol.querySelectorAll("li").forEach((li, k) => { li.dataset.on = k === on ? "true" : k < on ? "past" : "false"; });
          }
        }
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
          const fade = c.kind === "section" && o > 0 ? 1 - Number(el.style.getPropertyValue("--grow") || 0) : 1;
          node.style.opacity = o > 0 ? fade.toFixed(3) : "0";
          node.style.visibility = o > 0 ? "visible" : "hidden";
          node.style.setProperty("--o", o.toFixed(3));
          const ks = keys.get(key) ?? [];
          if (ks.length) {
            const q = o > 0 ? (local - p.from) / Math.max(0.01, p.to - p.from) : -1;
            ks.forEach((k, n) => { const on = q >= 0.12 + n * 0.06 ? "1" : "0"; if (k.dataset.on !== on) k.dataset.on = on; });
          }
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
      // TKT-95: the wireframe behind the titles (desktop only; a no-op until three.js has loaded).
      lineShape.current?.frame(layers.current[index], lineState(chapters, index, local, activeGrow), active.kind === "section" ? active.tone : "dark", now - prevNow);
      prevNow = now;
      motes.current?.setIntensity(active.kind === "video" ? active.motes ?? 0 : 0);
      // The film vignette belongs to the footage; it lifts off as a flat section covers the screen.
      if (vignette.current) vignette.current.style.opacity = active.kind === "section" ? wipeIn.toFixed(3) : "1";
      if (fadeEl.current) {
        fadeEl.current.style.opacity = active.kind === "fade" ? String(fadeCover(local)) : "0";
        if (active.kind === "fade") fadeEl.current.style.background = active.color;
      }
      if (bar.current) bar.current.style.transform = `scaleX(${shown.toFixed(4)})`;
      // "Scroll to discover" (TKT-92): only on the opening screen, gone as soon as the journey moves.
      if (cue.current) { const o = Math.max(0, 1 - shown * 60); cue.current.style.opacity = o.toFixed(3); cue.current.style.visibility = o > 0 ? "visible" : "hidden"; }
      // Chapter menu: the current item is the last listed chapter at or before the active one.
      let current = -1;
      navItems.forEach(({ i }, k) => { if (i <= index) current = k; });
      navRefs.current.forEach((b, k) => { if (b) b.ariaCurrent = k === current ? "step" : null; });
      // Phones: the menu scrolls sideways, so keep the current chapter centred in it.
      if (current !== lastNav) {
        lastNav = current;
        const btn = navRefs.current[current], nav = btn?.parentElement;
        if (btn && nav && nav.scrollWidth > nav.clientWidth) nav.scrollTo({ left: btn.offsetLeft - (nav.clientWidth - btn.offsetWidth) / 2, behavior: "smooth" });
      }
      if (hud.current) hud.current.textContent = `${(shown * 100).toFixed(1)}% · ${active.id} ${(local * 100).toFixed(0)}%`;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener("resize", remeasure);
      cancelAnimationFrame(raf); st.kill(); gsap.ticker.remove(tick); lenis.destroy();
      lenisRef.current = null; jump.current = () => {}; skip.current = () => {};
    };
  }, [live, chapters, lay, navItems, base, phoneStill]);

  // Declared after the engine so Lenis exists. The start screen holds the page still until the visitor enters (or skips to the desk).
  useEffect(() => {
    if (!live || entered) return;
    const html = document.documentElement;
    html.style.overflow = "hidden";
    lenisRef.current?.stop();
    return () => { html.style.overflow = ""; lenisRef.current?.start(); };
  }, [live, entered]);

  return (
    <div className={`journey${live ? " journey-live" : ""}${mobile ? " journey-phone" : ""}`}>
      {live ? (
        <div ref={track} className="journey-track" style={{ height: `${lay.total * 100 + 100}vh` }}>
          <div className="journey-stage">
            {chapters.map((c, i) => (
              <div key={c.id} ref={(el) => { layers.current[i] = el; }} className={`journey-chapter${c.kind === "fade" ? ` journey-over journey-tone-${c.tone ?? "dark"}` : c.kind === "section" ? ` journey-section journey-section-${c.tone}` : ""}`} data-chapter={c.id}>
                {c.kind === "video" ? (
                  <div className="journey-frame">
                    {/* No src until the whole clip has downloaded (TKT-76); until then the poster is the chapter's still. */}
                    <video ref={(el) => { videos.current[i] = el; }} className="journey-video" muted playsInline preload="none"
                      poster={mediaUrl(base, stillFor(c.src, 0))} data-still={stillFor(c.src, 0)} />
                  </div>
                ) : c.kind === "section" && c.toolkit?.layers.length ? (
                  <Toolkit ref={(h) => { toolkits.current[i] = h; }} data={c.toolkit} />
                ) : c.kind === "section" && c.showcase?.length ? (
                  <Showcase ref={(h) => { showcases.current[i] = h; }} items={c.showcase} />
                ) : c.kind === "section" && c.still ? (
                  <figure className={`journey-section-still is-${c.still.side}`} aria-hidden="true">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img ref={(el) => { stills.current[i] = el; }} src={mediaUrl(base, c.still.file)} alt="" loading="lazy" />
                  </figure>
                ) : null}
                {c.kind === "section" && c.timeline && (c.panels?.length ?? 0) > 1 ? (
                  <ol ref={(el) => { dots.current[i] = el; }} className="journey-timeline" aria-hidden="true">
                    {(c.panels ?? []).map((p) => <li key={p.id}><span>{p.eyebrow}</span></li>)}
                  </ol>
                ) : null}
                {c.display ? <p ref={(el) => { displays.current[i] = el; }} className="journey-display" aria-hidden="true">{c.display}</p> : null}
                {(c.panels ?? []).map((p) => (
                  <section key={p.id} ref={(el) => { if (el) panels.current.set(`${c.id}:${p.id}`, el); }}
                    className={`journey-panel journey-panel-${p.side ?? "left"}${p.look ? ` journey-look-${p.look}` : ""}`} aria-label={stripKeys(p.title)}>
                    <PanelBody p={p} heading={c.id === "sky" ? "h1" : "h2"} split />
                  </section>
                ))}
              </div>
            ))}
            <div ref={vignette} className="journey-vignette" aria-hidden="true" />
            <div ref={cue} className="journey-cue" aria-hidden="true"><span>Scroll to discover</span><i /></div>
            <ScreenCta ref={cta} href={DESKTOP_HREF} />
            <Motes ref={motes} />
            <LineShape ref={lineShape} />
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
              <StartScreen still={mobile ? wallpaper : mediaUrl(base, "c1-first.jpg")} hero={chapters[0]?.panels?.[0]} progress={ring}
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

interface PhoneStill { url: string; fit: "cover" | "portrait"; fill?: string }

function drawVideo(c: VideoChapter, v: HTMLVideoElement | null | undefined, el: HTMLElement, local: number, ready: boolean, base: string, fixed?: PhoneStill) {
  if (!v) return;
  if (fixed) {
    // Phone mode: one still for the whole chapter, no camera moves. On screens taller than 9:16 the wallpaper sits on
    // the bottom edge and its sky colour fills the space above, so nothing is cropped off the sides (see journey.css).
    if (v.dataset.still !== fixed.url) {
      v.dataset.still = fixed.url;
      v.poster = fixed.url;
      v.dataset.fit = fixed.fit;
      v.style.background = fixed.fill ?? "";
      const frame = el.firstElementChild as HTMLElement | null;
      if (frame) frame.style.transform = "";
    }
    return;
  }
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
        <li key={c.id} id={c.id === "room" ? "desk" : undefined}
          className={c.kind === "section" ? `journey-still journey-still-section journey-section-${c.tone}` : "journey-still"}>
          {c.kind === "video" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mediaUrl(base, `${c.src}-${c.id === "sky" ? "first" : "last"}.jpg`)} alt="" loading={c.id === "sky" ? "eager" : "lazy"} />
          ) : c.kind === "section" && c.still ? (
            <figure className={`journey-section-still is-${c.still.side}`} aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mediaUrl(base, c.still.file)} alt="" loading="lazy" />
            </figure>
          ) : null}
          {c.kind === "section" && c.toolkit?.layers.length ? (
            <section className="journey-still-toolkit" aria-label={c.toolkit.title}>
              <p className="journey-eyebrow">{c.toolkit.title}</p>
              {c.toolkit.layers.map((l) => (
                <div key={l.name}>
                  <h2 className="journey-title">{l.name}</h2>
                  {l.how ? <p className="journey-body">{l.how}</p> : null}
                  {l.tools.length ? <ul className="journey-chips">{l.tools.map((t) => <li key={t}>{t}</li>)}</ul> : null}
                </div>
              ))}
              {c.toolkit.certs.length ? <ul className="journey-points">{c.toolkit.certs.map((x) => (
                <li key={x.title}>{/* eslint-disable-next-line @next/next/no-img-element */}{x.badge ? <img className="journey-toolkit-badge-img" src={x.badge} alt="" width={56} height={56} /> : null}{x.href ? <a href={x.href} target="_blank" rel="noopener noreferrer">{x.title}</a> : x.title}{x.org ? ` · ${x.org}` : ""}</li>
              ))}</ul> : null}
            </section>
          ) : null}
          {c.kind === "section" && c.showcase?.length ? (
            <section className="journey-still-showcase" aria-label="Selected work">
              <p className="journey-eyebrow">Selected work</p>
              <ul>
                {c.showcase.map((it) => (
                  <li key={it.slug}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {it.shots[0] ? <img src={it.shots[0]} alt="" loading="lazy" /> : null}
                    <h2 className="journey-title">{it.name}</h2>
                    {it.tagline ? <p className="journey-body">{it.tagline}</p> : null}
                    <a className="journey-cta-link" href={it.href}>Read the case study <span>→</span></a>
                  </li>
                ))}
              </ul>
              <a className="journey-cta-link" href="/projects">All projects <span>→</span></a>
            </section>
          ) : null}
          {(c.panels ?? []).map((p) => (
            <section key={p.id} className={`journey-still-panel${p.look ? ` journey-look-${p.look}` : ""}`} aria-label={stripKeys(p.title)}>
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
  return <>{keyTokens(text).map((t, k) => (/^\s+$/.test(t.text) ? t.text : <span key={k} className={t.key ? "journey-w journey-key" : "journey-w"}>{t.text}</span>))}</>;
}

/** `**word**` inside short text (proof points) → <strong>, which lights up like the title keywords. */
function Inline({ text }: { text: string }) {
  return <>{text.split(/(\*\*[^*]+\*\*)/).map((part, k) => /^\*\*[^*]+\*\*$/.test(part) ? <strong key={k}>{part.slice(2, -2)}</strong> : part)}</>;
}

/** TKT-92: "I {build|ship|teach} …": the options sit in one grid cell (width of the longest) and take turns (CSS only). */
function RotatorLine({ r }: { r: NonNullable<Panel["rotator"]> }) {
  const n = r.words.length;
  return (
    <p className="journey-body journey-rotator" aria-label={`${r.before}${r.words.join(", ")}${r.after}`}>
      <span aria-hidden="true">{r.before}<span className="journey-rotate" style={{ ["--n" as string]: n }}>
        {r.words.map((w, k) => <span key={w} style={{ ["--i" as string]: k }}>{w}</span>)}
      </span>{r.after}</span>
    </p>
  );
}

function PanelBody({ p, heading, split = false }: { p: Panel; heading: "h1" | "h2"; split?: boolean }) {
  const H = heading;
  return <>
    {p.eyebrow ? <p className="journey-eyebrow">{p.eyebrow}</p> : null}
    <H className="journey-title">{split ? <Words text={p.title} /> : stripKeys(p.title)}</H>
    {p.meta ? <p className="journey-meta">{p.meta}</p> : null}
    {split && p.rotator ? <RotatorLine r={p.rotator} />
      : p.body ? (p.md ? <div className="journey-md"><Markdown text={p.body} /></div> : <p className="journey-body">{p.body}</p>) : null}
    {p.points?.length ? <ul className="journey-points">{p.points.map((t) => <li key={t}><Inline text={t} /></li>)}</ul> : null}
    {p.chips?.length ? <ul className="journey-chips" aria-label="Technologies">{p.chips.map((t) => <li key={t}>{t}</li>)}</ul> : null}
    {p.links?.some((l) => l.platform) ? (
      <ul className="journey-media">
        {p.links.map((l) => (
          <li key={l.platform + l.href} className={`journey-media-${l.platform}${l.placeholder ? " is-placeholder" : ""}`}>
            <a href={l.href} {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
              <span className="journey-media-thumb">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {l.image ? <img src={l.image} alt="" loading="lazy" /> : <BrandIcon platform={l.platform!} size={l.platform === "youtube" ? 40 : 28} />}
                {l.platform === "youtube" && l.image ? <span className="journey-media-play" aria-hidden="true"><BrandIcon platform="youtube" size={44} /></span> : null}
              </span>
              <span className="journey-media-text">
                <span className="journey-link-kicker"><BrandIcon platform={l.platform!} size={13} /> {l.kicker}</span>
                <span className="journey-link-title">{l.title}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    ) : p.links?.length ? (
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
    {p.actions?.length ? (
      <p className="journey-actions">{p.actions.map((a) => (
        <a key={a.href + a.label} className={a.platform ? `journey-brand journey-brand-${a.platform}` : "journey-cta-link"} href={a.href} target="_blank" rel="noopener noreferrer">
          {a.platform ? <BrandIcon platform={a.platform} size={20} /> : null}{a.label}{a.platform ? null : <span> ↗</span>}
        </a>
      ))}</p>
    ) : null}
    {p.cta ? <a className="journey-cta-link" href={p.cta.href}>{p.cta.label} <span>→</span></a> : null}
  </>;
}

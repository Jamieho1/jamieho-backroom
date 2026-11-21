"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import {
  type Chapter, type Panel, type VideoChapter, alignAt, approach, displayOpacity, fadeCover, joinOpacity, layout, locate,
  canonicalChapterId, enterProgress, landingOf, mapKeys, panelOpacity, smoothstep, stillDrift, wipeOffset, wordReveal,
} from "@/lib/journey/timeline";
import { Motes, type MotesHandle } from "./motes";
import { LineShape, type LineShapeHandle } from "./line-shape";
import { lineState } from "@/lib/journey/lines";
import {ContactBrief} from "./contact-brief";
import type { SocialLink } from "@/lib/social";
import { HomeDial, type HomeDialHandle } from "./home-dial";
import {dialAnchorStep,dialCount} from "@/lib/journey/dial";
import {WhatIBuild,type BuildHandle} from "./what-i-build";
import type { SectionKey } from "@/lib/sections";
import { draftChapterChanged } from "@/lib/content-drafts/overlay";
import {PrimaryPill} from "@/components/primary-pill";
import { BrandIcon } from "./brand-icon";
import type {AboutPhoto} from "@/lib/home-content-schema";
import { HeroArtwork } from "./hero-artwork";
import { JourneyNavigation } from "./navigation";
import { registerMediaCache, shouldSkipVideo, startPreloader, type Preloader } from "./preloader";
import { mediaUrl, preloadOrder, stillFor } from "@/lib/journey/media";
import { Markdown } from "@/components/markdown";
import { keyTokens, stripKeys } from "@/lib/journey/motion";
import { PHONE_QUERY, PHONE_STILLS, phoneChapters } from "@/lib/journey/phone";
import { DESKTOP_ASSETS, DESKTOP_PORTRAIT } from "@/components/desktop-scene/assets";

/**
 * Home v1 scroll engine (TKT-74, polish pass 2026-11-05). One scroll owner: Lenis smooths native scroll,
 * ScrollTrigger reports progress over one tall track, and a single rAF loop eases toward it and draws the active
 * chapter (video time, layered scene or fade), the giant chapter words, word-by-word panel reveals, the progress
 * bar and the chapter menu. Only transform/opacity animate (scroll-craft hard rules). All text is real HTML;
 * without JavaScript or with reduced motion the server-rendered still-frame version is shown instead.
 */

export function Journey({ chapters: all, base, emailHref, socials = [], draftSections = [], aboutPhotos = [] }: { chapters: Chapter[]; base: string; emailHref?:string; socials?: SocialLink[]; draftSections?: SectionKey[]; aboutPhotos?:AboutPhoto[] }) {
  const [mobile, setMobile] = useState(false);
  const [dark, setDark] = useState(false);
  // TKT-96: phones run the journey on stills only (no clip downloads), using the approved hero artwork.
  const [compactDial,setCompactDial]=useState(false);
  const [dialHeight,setDialHeight]=useState(0);
  const [buildHeight,setBuildHeight]=useState(0);
  const compactBuild=useRef<HTMLDivElement>(null);
  const chapters=useMemo(()=>(mobile?phoneChapters(all):all).map(c=>compactDial&&c.kind==="section"&&c.dial?{...c,scroll:dialHeight||dialCount(c.dial)*1.3,wipe:0,fadeIn:0}:compactDial&&c.kind==="section"&&c.build?{...c,scroll:buildHeight||3,wipe:0}:c),[all,mobile,compactDial,dialHeight,buildHeight]);
  const lay = useMemo(() => layout(chapters), [chapters]);
  const navItems = useMemo(() => chapters.map((c, i) => ({ c, i })).filter(({ c }) => c.nav).concat([{c:{id:"contact",label:"Contact",nav:"Contact",kind:"section",tone:"dark",scroll:0},i:chapters.length}]), [chapters]);
  const track = useRef<HTMLDivElement>(null);
  const layers = useRef<(HTMLElement | null)[]>([]);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const displays = useRef<(HTMLElement | null)[]>([]);
  const panels = useRef<Map<string, HTMLElement>>(new Map());
  const dial=useRef<HomeDialHandle>(null);
  const compact=useRef<HTMLDivElement>(null);
  const seekDial=useRef<(chapter:number,local:number)=>void>(()=>{});
  const stills = useRef<(HTMLImageElement | null)[]>([]);
  const builds = useRef<(BuildHandle | null)[]>([]);
  const dots = useRef<(HTMLOListElement | null)[]>([]);
  const vignette = useRef<HTMLDivElement>(null);
  const motes = useRef<MotesHandle>(null);
  const lineShape = useRef<LineShapeHandle>(null);
  const contactRoot=useRef<HTMLDivElement>(null);
  const fadeEl = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const navRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const hud = useRef<HTMLDivElement>(null);
  const cue = useRef<HTMLAnchorElement>(null);
  const jump = useRef<(id: string) => void>(() => {});
  const navigationIntent=useRef<string|null>(null);
  const initialHashHandled=useRef(false);
  const skip = useRef<() => void>(() => {});
  const lenisRef = useRef<Lenis | null>(null);
  const navigation = useRef<HTMLElement>(null);
  const ready = useRef<boolean[]>([]);
  const preloader = useRef<Preloader | null>(null);
  const [live, setLive] = useState(false);
  const [debug, setDebug] = useState(false);

  const returningToSky = useRef(false);
  const resetSky = useRef(() => window.scrollTo({top:0, behavior:"instant"}));

  // Mark only this history entry when leaving Home; explicit incoming chapter links stay intact.
  useEffect(() => {
    const returnToSky = () => {
      if (!history.state?.journeyReturnToSky) return;
      const state = {...history.state};
      delete state.journeyReturnToSky;
      history.replaceState(state, "", location.pathname + location.search);
      returningToSky.current = true;
      resetSky.current();
      // App Router restores its saved scroll after mounting the incoming page.
      requestAnimationFrame(() => requestAnimationFrame(() => {
        resetSky.current();
        returningToSky.current = false;
      }));
    };
    const leave = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element).closest<HTMLAnchorElement>('a[href]');
      if (!anchor || anchor.target || anchor.hasAttribute('download')) return;
      const url = new URL(anchor.href, location.href);
      if (url.origin === location.origin && url.pathname !== location.pathname)
        history.replaceState({...history.state, journeyReturnToSky:true}, "");
    };
    returnToSky();
    document.addEventListener("click", leave, true);
    window.addEventListener("pageshow", returnToSky);
    return () => {document.removeEventListener("click", leave, true);window.removeEventListener("pageshow", returnToSky);};
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const phone = window.matchMedia(PHONE_QUERY);
    const syncPhone = () => setMobile(phone.matches);
    syncPhone(); phone.addEventListener("change", syncPhone);
    const dialQuery=window.matchMedia("(max-width:900px)");const syncDial=()=>setCompactDial(dialQuery.matches);syncDial();dialQuery.addEventListener("change",syncDial);
    const scheme = window.matchMedia("(prefers-color-scheme: dark)");
    const syncTheme = () => setDark(document.documentElement.dataset.theme === "dark" || (!document.documentElement.dataset.theme && scheme.matches));
    syncTheme();
    scheme.addEventListener("change", syncTheme);
    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    setDebug(new URLSearchParams(window.location.search).has("debug"));
    setLive(!reduce.matches);
    const onChange = () => setLive(!reduce.matches);
    reduce.addEventListener("change", onChange);
    return () => { reduce.removeEventListener("change", onChange); scheme.removeEventListener("change", syncTheme); observer.disconnect(); phone.removeEventListener("change", syncPhone);dialQuery.removeEventListener("change",syncDial); };
  }, []);

  useEffect(()=>{
    const node=compact.current;if(!live||!compactDial||!node)return;
    const measure=()=>{const value=node.getBoundingClientRect().height/innerHeight;setDialHeight(old=>Math.abs(old-value)<.005?old:value);};
    measure();const observer=new ResizeObserver(measure);observer.observe(node);window.addEventListener("resize",measure);
    return()=>{observer.disconnect();window.removeEventListener("resize",measure);};
  },[live,compactDial]);

  useEffect(()=>{
    const node=compactBuild.current;if(!live||!compactDial||!node)return;
    const measure=()=>{const height=node.getBoundingClientRect().height/innerHeight;setBuildHeight(old=>Math.abs(old-height)<.005?old:height);};
    // Wait for the accordion height transition to settle, avoiding a scroll-engine rebuild on every animation frame.
    let pending:ReturnType<typeof setTimeout>;const schedule=()=>{clearTimeout(pending);pending=setTimeout(measure,90);};
    measure();const observer=new ResizeObserver(schedule);observer.observe(node);window.addEventListener("resize",schedule);
    return()=>{clearTimeout(pending);observer.disconnect();window.removeEventListener("resize",schedule);};
  },[live,compactDial]);

  // TKT-76: download the clips whole, in chapter order, and swap each chapter from its still to its video as it lands.
  useEffect(() => {
    if (!live) return;
    registerMediaCache();
    const variant = mobile ? "mobile" : "desktop";
    const items = preloadOrder(chapters, variant);
    if (mobile || shouldSkipVideo()) return; // phones: stills only, nothing to download
    preloader.current = startPreloader(items, (i) => mediaUrl(base, i.file), {
      progress() {},
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
  // Artwork changes must not restart Lenis or replay the initial chapter hash.
  const phoneStillRef = useRef(phoneStill);
  useEffect(() => { phoneStillRef.current = phoneStill; }, [phoneStill]);

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
    // Contact is natural-flow content after the pinned journey.
    const dialIndex=chapters.findIndex(c=>c.kind==="section"&&c.dial);
    const yOf=(id:string)=>{
      if(["contact","screen","desk","home-contact","contact-form"].includes(id)){const node=contactRoot.current?.querySelector<HTMLElement>("#contact-form");return node?window.scrollY+node.getBoundingClientRect().top-(navigation.current?.getBoundingClientRect().bottom??100)-24:st.end;}
      if(compactDial&&id==="toolkit"){const index=chapters.findIndex(c=>c.id==="toolkit");if(index>=0)return st.start+lay.starts[index]*innerHeight+2;}
      const c=chapters[dialIndex];
      if(compactDial&&c?.kind==="section"&&c.dial&&["about","background","pivot","experience","projects","work"].includes(id)){
        const step=dialAnchorStep(id,c.dial),node=compact.current?.querySelector<HTMLElement>(`[data-dial-step="${step}"]`);
        const start=st.start+lay.starts[dialIndex]*innerHeight;
        return Math.max(start+2,start+(node?.offsetTop??0)-(navigation.current?.getBoundingClientRect().bottom??100)-24);
      }
      return st.start+(st.end-st.start)*landingOf(chapters,id,lay)+1;
    };
    jump.current=(id)=>{navigationIntent.current=id;lenis.scrollTo(yOf(id),{duration:1.2,easing:t=>1-Math.pow(1-t,3)});};
    seekDial.current=(index,local)=>{navigationIntent.current=null;const ch=chapters[index],floor=ch.kind==="section"&&ch.fadeIn?ch.fadeIn+0.005:0,progress=(lay.starts[index]+ch.scroll*Math.max(local,floor))/lay.total;lenis.scrollTo(st.start+(st.end-st.start)*progress,{duration:.8,easing:t=>1-Math.pow(1-t,3)});};

    // Legacy ending links and new Contact links reach the same brief form.
    skip.current = () => { navigationIntent.current="contact";lenis.start(); const y=yOf("contact"); lenis.scrollTo(y, { immediate: true, force: true }); /* a native #fragment jump can desync Lenis, which then ignores a scroll to the position it believes it is at */ if(Math.abs(window.scrollY-y)>1)window.scrollTo(0,y); target = shown = 1; };
    const followHash = () => {
      if (["#contact", "#contact-form", "#desk", "#screen", "#home-contact"].includes(window.location.hash)) skip.current();
      else if (window.location.hash) {
        const id = canonicalChapterId(window.location.hash.slice(1));
        if (chapters.some(c => c.id === id) || ["experience","projects"].includes(id)&&dialIndex>=0) jump.current(id);
      }
    };
    resetSky.current = () => {
      navigationIntent.current="sky";
      lenis.scrollTo(0, {immediate:true, force:true});
      target = shown = 0;
    };
    // Resize/accordion measurements rebuild this clock. Resume the explicit destination,
    // never replay a stale arrival hash after the visitor has navigated or scrolled elsewhere.
    if (returningToSky.current) {initialHashHandled.current=true;resetSky.current();}
    else if(navigationIntent.current==="contact")skip.current();
    else if(navigationIntent.current)jump.current(navigationIntent.current);
    else if(!initialHashHandled.current){initialHashHandled.current=true;followHash();}
    const clearIntent=()=>{navigationIntent.current=null;};
    const keyScroll=(event:KeyboardEvent)=>{if(["ArrowUp","ArrowDown","PageUp","PageDown","Home","End"," "].includes(event.key))clearIntent();};
    window.addEventListener("wheel",clearIntent,{passive:true});window.addEventListener("touchstart",clearIntent,{passive:true});window.addEventListener("keydown",keyScroll);
    window.addEventListener("hashchange", followHash);

    // Word spans per panel, cached once.
    const words = new Map<string, HTMLElement[]>();
    panels.current.forEach((node, key) => words.set(key, [...node.querySelectorAll<HTMLElement>(".journey-w")]));
    // Keywords (TKT-92): title **keys** and bold words in the copy light up one after another while the panel reads.
    const keys = new Map<string, HTMLElement[]>();
    panels.current.forEach((node, key) => keys.set(key, [...node.querySelectorAll<HTMLElement>(".journey-key, .journey-md strong, .journey-points strong")]));

    let prevNow = performance.now();
    const draw = () => {
      const now = performance.now();
      shown = approach(shown, target, now - last);
      last = now;
      const { index, local } = locate(chapters, shown, lay);
      const active = chapters[index];
      // A solid section wipes up over whatever came before it (BMW-style), then holds flat.
      const wipeIn = active.kind === "section" ? wipeOffset(local, active.wipe, active.linear) : 0;
      const activeGrow = 0;
      // A section with fadeIn dissolves in over the previous chapter instead of cutting (1 = fully entered).
      const enter = active.kind === "section" ? enterProgress(active, local) : 1;
      if (navigation.current) navigation.current.dataset.floating = index > 0 ? "true" : "false";
      chapters.forEach((c, i) => {
        const el = layers.current[i];
        if (!el) return;
        // Visible: the active chapter, the one beneath it while it joins in, and both sides of a fade.
        let opacity = 0;
        if (i === index) opacity = active.kind === "video" ? joinOpacity(c, local) : enter;
        else if (i === index - 1 && (active.kind === "fade" ? local < 0.5 : active.kind === "section" ? wipeIn > 0 || enter < 1 : joinOpacity(active, local) < 1)) opacity = 1;
        else if (active.kind === "fade" && i === index + 1 && local >= 0.5) opacity = 1;
        el.inert = i !== index;
        el.style.opacity = String(opacity);
        el.style.visibility = opacity > 0 ? "visible" : "hidden";
        const at = i === index ? local : i < index ? 1 : 0;
        if (c.kind === "video") drawVideo(c, videos.current[i], el, at, !!ready.current[i], base, phoneStillRef.current(c.src));
        if (c.kind === "section") {
          el.style.transform = i === index && wipeIn > 0 ? `translate3d(0, ${(wipeIn * 100).toFixed(2)}%, 0)` : "";
          const img = stills.current[i];
          if (img && opacity > 0) img.style.transform = `translate3d(0, ${(stillDrift(at) * 100).toFixed(2)}%, 0) scale(1.14)`;
          if(c.dial && opacity > 0)dial.current?.setProgress(at, i === index ? enter : 1);
          if (opacity > 0) { builds.current[i]?.setProgress(at); }
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
          // The previous chapter's text fades and lifts out while the next section dissolves in.
          const outgoing = i === index - 1 && active.kind === "section" && enter < 1;
          const o = i === index ? panelOpacity(p, local, 0.08) : outgoing ? 1 - smoothstep(0, 0.75, enter) : 0;
          const leaving = outgoing || local > (p.from + p.to) / 2;
          const fade = 1;
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
      if(contactRoot.current&&contactRoot.current.getBoundingClientRect().top<innerHeight*.5)current=navItems.length-1;
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
      window.removeEventListener("hashchange", followHash);
      window.removeEventListener("wheel",clearIntent);window.removeEventListener("touchstart",clearIntent);window.removeEventListener("keydown",keyScroll);
      cancelAnimationFrame(raf); st.kill(); gsap.ticker.remove(tick); lenis.destroy();
      resetSky.current = () => window.scrollTo({top:0, behavior:"instant"});
      seekDial.current=()=>{};
      lenisRef.current = null; jump.current = () => {}; skip.current = () => {};
    };
  }, [live, chapters, lay, navItems, base, mobile, compactDial]);

  return (
    <div className={`journey${live ? " journey-live" : ""}${mobile ? " journey-phone" : ""}`} onClick={event => {
      if (live && (event.target as Element).closest('[data-contact-jump]')) {
        event.preventDefault(); skip.current();
      }
    }}>
      <JourneyNavigation ref={navigation} items={navItems} navRefs={navRefs} live={live} onJump={(id) => jump.current(id)} />
      {live ? (
        <div ref={track} className="journey-track" style={{ height: `${lay.total * 100 + 100}vh` }}>
          <div className="journey-stage">
            {chapters.map((c, i) => (
              <div key={c.id} ref={(el) => { layers.current[i] = el; }} className={`journey-chapter${c.kind === "fade" ? ` journey-over journey-tone-${c.tone ?? "dark"}` : c.kind === "section" ? ` journey-section journey-section-${c.tone}` : ""}`} data-chapter={c.id} data-draft-changed={c.id === "toolkit" && draftChapterChanged(c.id, draftSections) || undefined} inert>
                {c.id === "sky" ? <HeroArtwork /> : c.kind === "video" ? (
                  <div className="journey-frame">
                    {/* No src until the whole clip has downloaded (TKT-76); until then the poster is the chapter's still. */}
                    <video ref={(el) => { videos.current[i] = el; }} className="journey-video" muted playsInline preload="none"
                      poster={mediaUrl(base, stillFor(c.src, 0))} data-still={stillFor(c.src, 0)} />
                  </div>
                ) : c.kind === "section" && c.build ? (
                  !compactDial?<WhatIBuild ref={(h) => { builds.current[i] = h; }} data={c.build} onSeek={local=>seekDial.current(i,local)}/>:null
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
                {c.kind==="section"&&c.dial&&!compactDial?<HomeDial ref={dial} data={c.dial} panel={c.panels?.[0]??{id:"about",title:"Background",from:0,to:1}} photos={aboutPhotos} base={base} changed={draftChapterChanged(c.id,draftSections)} onSeek={local=>seekDial.current(i,local)}/>:null}
                {(c.id === "about" ? [] : c.panels ?? []).map((p) => (
                  <section key={p.id} ref={(el) => { if (el) panels.current.set(`${c.id}:${p.id}`, el); }}
                    data-draft-changed={(p.draftChanged || c.id !== "sky" && draftChapterChanged(c.id, draftSections)) || undefined} className={`journey-panel journey-panel-${p.side ?? "left"}${p.look ? ` journey-look-${p.look}` : ""}${["about", "experience", "creator"].includes(c.id) && p.side !== "right" ? " journey-reading-card" : ""}`} aria-label={stripKeys(p.title)}>
                    {c.id === "sky" ? <HeroCopy p={p} split draftChanged={draftSections.includes("hero")} contactChanged={draftSections.includes("contact")} /> : <PanelBody p={p} heading="h2" split disableLinks={c.id === "about"} />}
                  </section>
                ))}
              </div>
            ))}
            <div ref={vignette} className="journey-vignette" aria-hidden="true" />
            <a ref={cue} className="journey-cue" href={chapters.some(c=>c.id==="creator")?"#creator":"#about"} onClick={event => { event.preventDefault(); jump.current(chapters.some(c=>c.id==="creator")?"creator":"about"); }}><span>Scroll to discover</span><span aria-hidden="true">↓</span></a>
            <Motes ref={motes} />
            <LineShape ref={lineShape} />
            <div className="journey-grain" aria-hidden="true" />
            <div ref={fadeEl} className="journey-fade" />
            <div className="journey-progress" aria-hidden="true"><div ref={bar} /></div>
            {debug ? <div ref={hud} className="journey-hud" /> : null}
          </div>
          {compactDial?chapters.map((c,i)=>c.kind==="section"&&c.dial?<div key={c.id} ref={compact} className="journey-compact-dial" style={{top:`${lay.starts[i]*100}vh`}}><HomeDial data={c.dial} panel={c.panels?.[0]??{id:"about",title:"Background",from:0,to:1}} photos={aboutPhotos} base={base} still changed={draftChapterChanged(c.id,draftSections)}/></div>:null):null}
          {compactDial?chapters.map((c,i)=>c.kind==="section"&&c.build?<div key={c.id} ref={compactBuild} className="journey-compact-build" data-draft-changed={draftChapterChanged(c.id,draftSections)||undefined} style={{top:`${lay.starts[i]*100}vh`}}><WhatIBuild data={c.build} accordion/></div>:null):null}
        </div>
      ) : (
        <StillJourney chapters={chapters} aboutPhotos={aboutPhotos} base={base} socials={socials} draftSections={draftSections} />
      )}
      <div ref={contactRoot}><ContactBrief socials={socials} emailHref={emailHref} draftChanged={draftSections.includes("contact")}/></div>
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
export function StillJourney({ chapters, base, socials = [], draftSections = [], aboutPhotos = [] }: { chapters: Chapter[]; base: string; socials?: SocialLink[]; draftSections?: SectionKey[]; aboutPhotos?:AboutPhoto[] }) {
  return (
    <ol className="journey-stills">
      {chapters.filter((c) => c.kind !== "fade").map((c) => (
        <li key={c.id} data-draft-changed={c.id === "toolkit" && draftChapterChanged(c.id, draftSections) || undefined} id={c.id}
          className={c.kind === "section" ? `journey-still journey-still-section journey-section-${c.tone}` : "journey-still"}>
          {c.id === "about" ? <><span id="background" className="journey-anchor-alias" aria-hidden="true"/><span id="pivot" className="journey-anchor-alias" aria-hidden="true" /></> : null}
          {c.id === "sky" ? <HeroArtwork /> : c.kind === "video" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mediaUrl(base, `${c.src}-${c.id === "sky" ? "first" : "last"}.jpg`)} alt="" loading={c.id === "sky" ? "eager" : "lazy"} />
          ) : c.kind === "section" && c.still ? (
            <figure className={`journey-section-still is-${c.still.side}`} aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mediaUrl(base, c.still.file)} alt="" loading="lazy" />
            </figure>
          ) : null}
          {c.kind==="section"&&c.build?<WhatIBuild data={c.build} still/>:null}
          {c.kind==="section"&&c.dial?<HomeDial data={c.dial} panel={c.panels?.[0]??{id:"about",title:"Background",from:0,to:1}} photos={aboutPhotos} base={base} still changed={draftChapterChanged(c.id,draftSections)}/>:null}
          {(c.id === "about" ? [] : c.panels ?? []).map((p) => (
            <section key={p.id} data-draft-changed={(p.draftChanged || c.id !== "sky" && draftChapterChanged(c.id, draftSections)) || undefined} className={`journey-still-panel${p.look ? ` journey-look-${p.look}` : ""}`} aria-label={stripKeys(p.title)}>
              {c.id === "sky" ? <HeroCopy p={p} draftChanged={draftSections.includes("hero")} contactChanged={draftSections.includes("contact")} /> : <PanelBody p={p} heading="h2" disableLinks={c.id === "about"} />}
            </section>
          ))}
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

function HeroCopy({ p, split = false, draftChanged = false, contactChanged = false }: { p: Panel; split?: boolean; draftChanged?: boolean; contactChanged?: boolean }) {
  const title = p.title.replace(/\.(?=\s*$)/, "");
  return <>
    <div className="journey-hero-heading" data-draft-changed={draftChanged || undefined}>
      {p.eyebrow ? <p className="journey-eyebrow journey-welcome">{p.eyebrow}</p> : null}
      <h1 className="journey-title">{split ? <Words text={title} /> : stripKeys(title)}</h1>
    </div>
    <div className="journey-hero-intro">
      <div className="journey-hero-glass" data-draft-changed={draftChanged || contactChanged || undefined}>
        <PanelBody p={{ ...p, eyebrow: undefined, title: "", meta: undefined, body: "Building systems. Exploring AI. Sharing what works.", md: false, rotator: undefined }} heading="h2" scheduleCall />
      </div>
    </div>
  </>;
}

function PanelBody({ p, heading, split = false, scheduleCall = false, disableLinks = false }: { p: Panel; heading: "h1" | "h2"; split?: boolean; scheduleCall?: boolean; disableLinks?: boolean }) {
  const H = heading;
  return <>
    {p.eyebrow ? <p className={`journey-eyebrow${heading === "h1" ? " journey-welcome" : ""}`}>{p.eyebrow}</p> : null}
    {p.title ? <H className="journey-title">{split ? <Words text={p.title} /> : stripKeys(p.title)}</H> : null}
    {p.meta ? <p className="journey-meta">{p.meta}</p> : null}
    {split && p.rotator ? <RotatorLine r={p.rotator} />
      : p.body ? (p.md ? <div className="journey-md"><Markdown text={p.body} disableLinks={disableLinks} /></div> : <p className="journey-body">{p.body}</p>) : null}
    {p.points?.length ? <ul className="journey-points">{p.points.map((t,index) => <li data-draft-changed={p.draftPoints?.[index]||undefined} key={t}><Inline text={t} /></li>)}</ul> : null}
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
    {p.actions?.length || scheduleCall ? (
      <p className="journey-actions">{p.actions?.map((a) => (
        <a key={a.href + a.label} className={a.platform ? `journey-brand journey-brand-${a.platform}` : "journey-cta-link"} href={a.href} target="_blank" rel="noopener noreferrer">
          {a.platform ? <BrandIcon platform={a.platform} size={20} /> : null}{a.label}{a.platform ? null : <span> ↗</span>}
        </a>
      ))}{scheduleCall ? <a className="journey-brand journey-schedule" href="#contact" data-contact-jump>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4m10-4v4M3 11h18m-13 4h3m3 0h2" /></svg>
        Schedule a call
      </a> : null}</p>
    ) : null}
    {p.cta ? <PrimaryPill href={p.cta.href}>{p.cta.label}</PrimaryPill> : null}
  </>;
}

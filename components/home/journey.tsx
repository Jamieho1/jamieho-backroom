"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/** The HTML is pre-rendered. London is a lazy, optional enhancement of the Home app only. */
export function HomeJourney({ intro, about, children }: { intro: ReactNode; about: ReactNode; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const [motion, setMotion] = useState(false);
  const [ready, setReady] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [enhanced, setEnhanced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setMotion(!media.matches);
    change(); setEnhanced(true); media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);

  useEffect(() => {
    const el = root.current, pane = el?.closest<HTMLElement>(".desktop-app-content");
    if (!el || !pane) return;
    const size = () => el.style.setProperty("--home-view", `${pane.clientHeight}px`);
    size(); const observer = new ResizeObserver(size); observer.observe(pane);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setReady(false);
    if (!motion || unavailable) return;
    let cancelled = false; let dispose: (() => void) | undefined;
    let idle: number | undefined;
    const el = host.current, pane = root.current?.closest<HTMLElement>(".desktop-app-content"), waypoint = aboutRef.current;
    if (!el || !pane || !waypoint) return;
    const whenIdle = (work: () => void) => {
      if ("requestIdleCallback" in window) idle = window.requestIdleCallback(work, { timeout: 1500 });
      else work();
    };
    // Let the first paint and an immediate app-navigation click finish before optional graphics work.
    const delay = window.setTimeout(() => whenIdle(() => {
      if (cancelled) return;
      import("./london-scene").then(({ mountLondonScene }) => {
        if (cancelled) return;
        whenIdle(() => {
          if (!cancelled) dispose = mountLondonScene(el, pane, waypoint, () => { if (!cancelled) setReady(true); }, () => { if (!cancelled) setUnavailable(true); });
        });
      }).catch(() => { if (!cancelled) setUnavailable(true); });
    }), 600);
    const release = () => {
      cancelled = true; window.clearTimeout(delay);
      if (idle !== undefined) window.cancelIdleCallback(idle);
      const cleanup = dispose; dispose = undefined; cleanup?.();
    };
    const desktop = root.current?.closest(".desktop-os");
    const leaving = (event: Event) => {
      const click = event as MouseEvent;
      if (click.button !== 0 || click.ctrlKey || click.metaKey || click.shiftKey || click.altKey) return;
      const link = (event.target as Element).closest<HTMLAnchorElement>("a[href]");
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
      const next = new URL(link.href, location.href);
      if (next.origin === location.origin && next.pathname !== location.pathname) {
        // A Next route can still be fetching while Home is mounted. Stop graphics at navigation intent.
        release(); setReady(false); setMotion(false);
      }
    };
    desktop?.addEventListener("click", leaving, true);
    return () => { desktop?.removeEventListener("click", leaving, true); release(); };
  }, [motion, unavailable]);

  return (
    <div className="page landing home-journey" ref={root} data-scene={unavailable ? "unavailable" : ready ? "ready" : "still"}>
      <div className="home-stage" aria-hidden="true">
        <picture className="home-poster">
          <source media="(max-width: 650px)" srcSet="/home/london-phone.jpg" />
          {/* An original still of the same scene, also used for no-JS/WebGL and reduced motion. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/home/london.jpg" alt="" width="1600" height="1000" fetchPriority="high" />
        </picture>
        <div className="home-canvas" ref={host} />
        <div className="home-copy-ground" />
        <div className="home-grain" />
      </div>
      <div className="home-story">
        <div className="home-wayfinding">
          <span className="home-scene-label"><span className="home-location-dot" /> A London journey</span>
          <nav aria-label="On this page">
            <a href="#home-about">About</a><a href="#home-work">Work</a><a href="#home-contact">Contact <span aria-hidden="true">↗</span></a>
          </nav>
          {unavailable || !enhanced ? <span className="home-motion-label">Still view</span> : (
            <button type="button" className="home-motion" aria-label={motion ? "Pause London motion" : "Enable London motion"} aria-pressed={motion} onClick={() => setMotion(!motion)}>
              <span aria-hidden="true">{motion ? "◉" : "○"}</span> Motion {motion ? "on" : "off"}
            </button>
          )}
        </div>
        <div className="home-intro">
          <div className="home-intro-copy">
            <p className="home-eyebrow">London, after hours</p>
            {intro}
            <div className="home-actions">
              <a className="home-primary" href="#home-work">Explore my work <span aria-hidden="true">↗</span></a>
              <a className="home-secondary" href="#home-contact">Get in touch <span aria-hidden="true">↗</span></a>
            </div>
          </div>
        </div>
        <div id="home-about" className="home-about" ref={aboutRef} tabIndex={-1}>
          <div className="home-about-copy">{about}</div>
        </div>
        <div className="home-rest">{children}</div>
      </div>
    </div>
  );
}

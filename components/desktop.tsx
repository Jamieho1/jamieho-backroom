"use client";

import Link from "next/link";
import { useEffect, useState, useId, type ReactNode,type CSSProperties } from "react";
import type { AppRow } from "@/lib/apps";
import {DESKTOP_ASSETS} from "./desktop-scene/assets";
import {DESKTOP_INTRODUCTION_COPY} from "@/lib/desktop-introduction";
import {DesktopBackdrop} from "./desktop-scene/backdrop";
import {DesktopIntroductionCue} from "./desktop-introduction-cue";
import {Markdown} from "./markdown";
import { logDesktopOpen } from "@/app/actions/desktop";
import { SiteNavigation } from "./site-navigation";

import { useDesktopApps } from './desktop-apps-provider';
import { DESKTOP_PAGES,PRIVACY_WINDOW,SIGNIN_WINDOW } from '@/lib/desktop-pages';

const PLACEHOLDERS: Record<string, string> = {
  notes: "Your coding notes will be here once the Notes app is ported.",
  practice: "The practice arena will be here once it is ported.",
  behavioral: "Your experience, stories and interview questions will be here once Behavioral is ported.",
};

export function Desktop({ apps, initialApp, content,discoverApps=false,signedIn=false,viewerId,notice }: { apps: AppRow[]; initialApp?: string; content?: ReactNode;discoverApps?:boolean;signedIn?:boolean;viewerId?:string;notice?:ReactNode }) {
  const windowTitle=useId();
  const {apps:cachedApps,loadError,seed}=useDesktopApps();
  useEffect(()=>{if(viewerId)seed(viewerId,apps);},[viewerId,apps,seed]);
  const registry=discoverApps?cachedApps:apps;
  const launchers=[...DESKTOP_PAGES.map(page=>registry.find(a=>a.id===page.id)??page),...registry.filter(a=>!DESKTOP_PAGES.some(p=>p.id===a.id))];
  const active = [...launchers,PRIVACY_WINDOW,SIGNIN_WINDOW].find((a) => a.id === initialApp && a.kind === "internal");
  const [maximised, setMaximised] = useState(false);
  const tracked=!!active&&registry.some(a=>a.id===active.id);
  useEffect(() => {
    if (active&&tracked) void logDesktopOpen(active.id);
  }, [active?.id,tracked]); // A deep link counts as opening an app, too.

  // These routes are full pages beneath the shared site header, rather than desktop windows.
  if (initialApp && ["privacy", "projects", "articles", "notes", "practice", "behavioral", "signin"].includes(initialApp)) {
    return <main className="app-page" data-app={initialApp} aria-label={active?.name}>
      <div className="desktop-app-content app-page-content">
        {notice}
        {loadError ? <p className="desktop-notice" role="status">Can&apos;t load your apps. <a href="/resources">Try again</a></p> : null}
        {!active ? <p className="desktop-notice" role="status">This app is unavailable or you don&apos;t have access to it.</p>
          : content ?? <div className="desktop-placeholder"><h1>{active.name}</h1><p>{PLACEHOLDERS[active.id] ?? "This app’s content is not available yet."}</p></div>}
      </div>
    </main>;
  }

  return (
    <div data-app={initialApp} className={`desktop-os${maximised && active ? " is-maximised" : ""}`} style={{"--desktop-day":`url("${DESKTOP_ASSETS.day}")`,"--desktop-night":`url("${DESKTOP_ASSETS.night}")`,"--desktop-day-wide":`url("${DESKTOP_ASSETS.dayWide}")`,"--desktop-night-wide":`url("${DESKTOP_ASSETS.nightWide}")`,"--desktop-day-portrait":`url("${DESKTOP_ASSETS.dayPortrait}")`,"--desktop-night-portrait":`url("${DESKTOP_ASSETS.nightPortrait}")`} as CSSProperties}>
      <SiteNavigation embedded />
      <main className="desktop-workspace">
        <DesktopBackdrop covered={!!active}/>
        {!initialApp&&<section className="desktop-introduction" aria-labelledby="desktop-introduction-title">
          <h1 id="desktop-introduction-title">{DESKTOP_INTRODUCTION_COPY.title}</h1>
          <div className="desktop-introduction-copy"><Markdown text={DESKTOP_INTRODUCTION_COPY.body}/></div>
        </section>}
        {!initialApp&&<DesktopIntroductionCue/>}
        {notice?<div className="desktop-notice-layer">{notice}</div>:null}
        {initialApp && !active ? <p className="desktop-notice" role="status">This app is unavailable or you don&apos;t have access to it. Choose an app below.</p> : null}
        {loadError?<p className="desktop-notice" role="status">Can&apos;t load your apps. <a href="/resources">Try again</a></p>:null}
        {!launchers.length ? <p className="desktop-notice">No apps are available for your account yet.</p> : null}
        {active ? (
          <section className="desktop-window" aria-labelledby={windowTitle}>
            <div className="desktop-titlebar">
              <span />
              <h2 id={windowTitle}>{active.name}</h2>
              <div className="desktop-controls">
                <button type="button" onClick={() => setMaximised(!maximised)} aria-label={maximised ? "Restore window" : "Maximise window"}>{maximised ? "⧉" : "□"}</button>
                <Link href="/resources" aria-label="Close window">×</Link>
              </div>
            </div>
            {content ? <div className="desktop-app-content">{content}</div> : PLACEHOLDERS[active.id] ? <div className="desktop-placeholder"><h2>{active.name}</h2><p>{PLACEHOLDERS[active.id]}</p></div> : (
              active.url.startsWith("/") && !active.url.startsWith("//") && !/^\/desktop(?:[/?#]|$)/.test(active.url)
                ? <iframe className="desktop-frame" src={active.url} title={active.name} />
                : <div className="desktop-placeholder"><p>This app&apos;s content is not available yet.</p></div>
            )}
          </section>
        ) : null}
      </main>
    </div>
  );
}

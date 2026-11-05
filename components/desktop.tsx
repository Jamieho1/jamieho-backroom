"use client";

import Link from "next/link";
import { useEffect, useState, useId, type ReactNode,type CSSProperties } from "react";
import type { AppRow } from "@/lib/apps";
import {DESKTOP_ASSETS} from "./desktop-scene/assets";
import {DESKTOP_INTRODUCTION_COPY} from "@/lib/desktop-introduction";
import {DesktopBackdrop} from "./desktop-scene/backdrop";
import {DesktopIntroductionCue} from "./desktop-introduction-cue";
import {Markdown} from "./markdown";
import { ICONS, AppMark } from "./desktop-icons";
import { logDesktopOpen } from "@/app/actions/desktop";
import { ThemeToggle } from "./theme-toggle";

import { useDesktopApps } from './desktop-apps-provider';
import { appHref } from '@/lib/desktop-pages';
import { useViewer } from './viewer-provider';
import { SignInButton } from './sign-in-button';
import { DESKTOP_PAGES,PRIVACY_WINDOW,SIGNIN_WINDOW } from '@/lib/desktop-pages';

const ICON_KEY: Record<string, string> = { code: "practice", chat: "behavioral", gear: "settings" };
const PLACEHOLDERS: Record<string, string> = {
  notes: "Your coding notes will be here once the Notes app is ported.",
  practice: "The practice arena will be here once it is ported.",
  behavioral: "Your experience, stories and interview questions will be here once Behavioral is ported.",
};

export function Desktop({ apps, initialApp, content,discoverApps=false,signedIn=false,viewerId,notice }: { apps: AppRow[]; initialApp?: string; content?: ReactNode;discoverApps?:boolean;signedIn?:boolean;viewerId?:string;notice?:ReactNode }) {
  const windowTitle=useId();
  const {viewer,configured,editing,setEditing}=useViewer();
  const {apps:cachedApps,loadError,loading,seed}=useDesktopApps();
  useEffect(()=>{if(viewerId)seed(viewerId,apps);},[viewerId,apps,seed]);
  const registry=discoverApps?cachedApps:apps;
  const launchers=[...DESKTOP_PAGES.map(page=>registry.find(a=>a.id===page.id)??page),...registry.filter(a=>!DESKTOP_PAGES.some(p=>p.id===a.id))];
  const loadingApps=discoverApps&&loading;
  const leftLaunchers=launchers.filter(app=>app.id!=="settings");
  const settingsLauncher=launchers.find(app=>app.id==="settings");
  const active = [...launchers,PRIVACY_WINDOW,SIGNIN_WINDOW].find((a) => a.id === initialApp && a.kind === "internal");
  const authenticated=signedIn||viewer.status==='member'||viewer.status==='owner';
  const [maximised, setMaximised] = useState(false);
  const [clock, setClock] = useState("");
  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }));
    tick();
    const timer = setInterval(tick, 15000);
    return () => clearInterval(timer);
  }, []);
  const tracked=!!active&&registry.some(a=>a.id===active.id);
  useEffect(() => {
    if (active&&tracked) void logDesktopOpen(active.id);
  }, [active?.id,tracked]); // A deep link counts as opening an app, too.

  function appLink(app: AppRow, icon: boolean) {
    const content = <>{icon ? (ICONS[ICON_KEY[app.icon] ?? app.icon] ?? ICONS.notes) : null}<span>{app.name}{app.kind === "external" ? " ↗" : ""}</span></>;
    const props = { className: "desktop-menu-link", "data-desktop-app":app.id, "aria-current": active?.id === app.id ? "page" as const : undefined };
    if (app.kind === "external") {
      // Registry rows are owner-edited, but only web links are launchable.
      if (!/^https?:\/\//i.test(app.url)) return null;
      return <a key={app.id} {...props} href={app.url} target="_blank" rel="noopener noreferrer" onClick={() => void logDesktopOpen(app.id)}>{content}</a>;
    }
    return <Link key={app.id} {...props} prefetch={false} href={appHref(app)}>{content}</Link>;
  }

  return (
    <div className={`desktop-os${maximised && active ? " is-maximised" : ""}`} style={{"--desktop-day":`url("${DESKTOP_ASSETS.day}")`,"--desktop-night":`url("${DESKTOP_ASSETS.night}")`,"--desktop-day-wide":`url("${DESKTOP_ASSETS.dayWide}")`,"--desktop-night-wide":`url("${DESKTOP_ASSETS.nightWide}")`} as CSSProperties}>
      <header className="desktop-menubar">
        <Link href="/" className="desktop-brand"><AppMark /> Jamie Ho</Link>
        <nav className="desktop-launchers" aria-label="Desktop apps" aria-busy={loadingApps}>
          {loadingApps?<span className="desktop-apps-loading" role="status">Loading apps…</span>:<><div className="desktop-launcher">{leftLaunchers.map(app=>appLink(app,true))}</div>{settingsLauncher?<div className="desktop-launcher-right">{appLink(settingsLauncher,true)}</div>:null}</>}
        </nav>
        <noscript><nav className="desktop-noscript-nav" aria-label="Public pages"><a href="/about">Open About Me</a><a href="/projects">Open Projects</a><a href="/articles">Open Articles</a></nav></noscript>
        <div className="desktop-session">
          {viewer.status==='owner'&&(active?.id==='home'||active?.id==='projects')?<button type="button" className="desktop-menu-link" aria-pressed={editing} onClick={()=>setEditing(!editing)}>{editing?'Done editing':'Edit site'}</button>:null}
          <ThemeToggle />
          {authenticated?<form action="/auth/signout" method="post"><button className="desktop-menu-link" type="submit">Sign out</button></form>:viewer.status==='anonymous'&&configured?<SignInButton className="desktop-menu-link" />:null}
        </div>
        <time className="desktop-clock">{clock}</time>
      </header>
      <main className="desktop-workspace">
        <DesktopBackdrop covered={!!active}/>
        {!initialApp&&<section className="desktop-introduction" aria-labelledby="desktop-introduction-title">
          <h1 id="desktop-introduction-title">{DESKTOP_INTRODUCTION_COPY.title}</h1>
          <div className="desktop-introduction-copy"><Markdown text={DESKTOP_INTRODUCTION_COPY.body}/></div>
        </section>}
        {!initialApp&&<DesktopIntroductionCue/>}
        {notice?<div className="desktop-notice-layer">{notice}</div>:null}
        {initialApp && !active ? <p className="desktop-notice" role="status">This app is unavailable or you don&apos;t have access to it. Choose an app below.</p> : null}
        {loadError?<p className="desktop-notice" role="status">Can&apos;t load your apps. <a href="/desktop">Try again</a></p>:null}
        {!launchers.length ? <p className="desktop-notice">No apps are available for your account yet.</p> : null}
        {active ? (
          <section className="desktop-window" aria-labelledby={windowTitle}>
            <div className="desktop-titlebar">
              <span />
              <h2 id={windowTitle}>{active.name}</h2>
              <div className="desktop-controls">
                <button type="button" onClick={() => setMaximised(!maximised)} aria-label={maximised ? "Restore window" : "Maximise window"}>{maximised ? "⧉" : "□"}</button>
                <Link href="/" aria-label="Close window">×</Link>
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

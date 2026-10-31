"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode, type CSSProperties } from "react";
import type { AppRow } from "@/lib/apps";
import { WALL_IMAGES } from "@/lib/desktop-wallpaper";
import { ICONS, AppMark } from "./desktop-icons";
import { logDesktopOpen } from "@/app/actions/desktop";
import { ThemeToggle } from "./theme-toggle";

const ICON_KEY: Record<string, string> = { code: "practice", chat: "behavioral", gear: "settings" };
const PLACEHOLDERS: Record<string, string> = {
  notes: "Your coding notes will be here once the Notes app is ported.",
  practice: "The practice arena will be here once it is ported.",
  behavioral: "Your experience, stories and interview questions will be here once Behavioral is ported.",
};

export function Desktop({ apps, initialApp, content }: { apps: AppRow[]; initialApp?: string; content?: ReactNode }) {
  const active = apps.find((a) => a.id === initialApp && a.kind === "internal");
  const [maximised, setMaximised] = useState(false);
  const [clock, setClock] = useState("");
  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }));
    tick();
    const timer = setInterval(tick, 15000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (active) void logDesktopOpen(active.id);
  }, [active?.id]); // A deep link counts as opening an app, too.

  function appLink(app: AppRow, icon: boolean) {
    const content = <>{icon ? (ICONS[ICON_KEY[app.icon] ?? app.icon] ?? ICONS.notes) : null}<span>{app.name}{app.kind === "external" ? " ↗" : ""}</span></>;
    const props = { className: icon ? "desktop-icon" : "desktop-menu-link", "aria-current": active?.id === app.id ? "page" as const : undefined };
    if (app.kind === "external") {
      // Registry rows are owner-edited, but only web links are launchable.
      if (!/^https?:\/\//i.test(app.url)) return null;
      return <a key={app.id} {...props} href={app.url} target="_blank" rel="noopener noreferrer" onClick={() => void logDesktopOpen(app.id)}>{content}</a>;
    }
    return <Link key={app.id} {...props} prefetch={false} href={`/desktop?app=${encodeURIComponent(app.id)}`}>{content}</Link>;
  }

  return (
    <main className={`desktop-os${maximised && active ? " is-maximised" : ""}`} style={{ "--wall-hills": WALL_IMAGES.hills, "--wall-night": WALL_IMAGES.night } as CSSProperties}>
      <header className="desktop-menubar">
        <Link href="/desktop" className="desktop-brand"><AppMark /> My desktop</Link>
        <nav aria-label="App menu">{apps.map((app) => appLink(app, false))}</nav>
        <Link href="/" className="desktop-home-link">Home</Link>
        <ThemeToggle />
        <form action="/auth/signout" method="post"><button className="desktop-menu-link" type="submit">Sign out</button></form>
        <time className="desktop-clock">{clock}</time>
      </header>
      <div className="desktop-workspace">
        <nav className="desktop-launcher" aria-label="Desktop apps">{apps.map((app) => appLink(app, true))}</nav>
        {initialApp && !active ? <p className="desktop-notice" role="status">This app is unavailable or you don&apos;t have access to it. Choose an app below.</p> : null}
        {!apps.length ? <p className="desktop-notice">No apps are available for your account yet.</p> : null}
        {active ? (
          <section className="desktop-window" aria-labelledby="desktop-window-title">
            <div className="desktop-titlebar">
              <span />
              <h1 id="desktop-window-title">{active.name}</h1>
              <div className="desktop-controls">
                <button type="button" onClick={() => setMaximised(!maximised)} aria-label={maximised ? "Restore window" : "Maximise window"}>{maximised ? "⧉" : "□"}</button>
                <Link href="/desktop" aria-label="Close window">×</Link>
              </div>
            </div>
            {content ? <div className="desktop-app-content">{content}</div> : PLACEHOLDERS[active.id] ? <div className="desktop-placeholder"><h2>{active.name}</h2><p>{PLACEHOLDERS[active.id]}</p></div> : (
              active.url.startsWith("/") && !active.url.startsWith("//") && !/^\/desktop(?:[/?#]|$)/.test(active.url)
                ? <iframe className="desktop-frame" src={active.url} title={active.name} />
                : <div className="desktop-placeholder"><p>This app&apos;s content is not available yet.</p></div>
            )}
          </section>
        ) : !initialApp && apps.length ? <div className="desktop-welcome"><h1>Your desktop</h1><p>Choose an app to get started.</p></div> : null}
      </div>
    </main>
  );
}

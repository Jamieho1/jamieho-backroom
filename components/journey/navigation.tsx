"use client";
import { forwardRef, useEffect, useRef, type MutableRefObject } from "react";
import type { Chapter } from "@/lib/journey/timeline";
import { AppMark } from "@/components/desktop-icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { SignInButton } from "@/components/sign-in-button";
import { useViewer } from "@/components/viewer-provider";

interface Props {
  items: { c: Chapter; i: number }[];
  navRefs: MutableRefObject<(HTMLButtonElement | null)[]>;
  live: boolean;
  onJump: (id: string) => void;
}

export const JourneyNavigation = forwardRef<HTMLDivElement, Props>(function JourneyNavigation({ items, navRefs, live, onJump }, ref) {
  const { viewer, configured } = useViewer();
  const local = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (live) return;
    const sync = () => { if (local.current) local.current.dataset.floating = window.scrollY >= window.innerHeight * 0.7 ? "true" : "false"; };
    sync(); window.addEventListener("scroll", sync, { passive: true });
    return () => window.removeEventListener("scroll", sync);
  }, [live]);
  const go = (id: string) => {
    if (live) onJump(id);
    else if (id === "sky") window.scrollTo({ top: 0, behavior: "smooth" });
    else document.getElementById(id === "room" ? "desk" : id)?.scrollIntoView({ behavior: "smooth" });
  };
  return <div role="banner" className="journey-navigation" data-floating="false" ref={node => {
    local.current = node;
    if (typeof ref === "function") ref(node); else if (ref) ref.current = node;
  }}>
    <a href="#sky" className="journey-logo" aria-label="Jamie Ho — back to the top" onClick={event => { if (live) { event.preventDefault(); go("sky"); } }}><AppMark /></a>
    <nav className="journey-nav" aria-label="Journey chapters">
      {items.map(({ c }, k) => !live ? <a key={c.id} href={`#${c.id === "room" ? "desk" : c.id}`}><span className="journey-nav-n">{String(k + 1).padStart(2, "0")}</span>{c.nav}</a> : <button key={c.id} type="button" ref={node => { navRefs.current[k] = node; }} onClick={() => go(c.id)}>
        <span className="journey-nav-n">{String(k + 1).padStart(2, "0")}</span>{c.nav}
      </button>)}
    </nav>
    <div className="journey-account">
      <a href="/articles">Articles</a><a href="/privacy">Privacy</a>
      <ThemeToggle />
      {viewer.status === "anonymous" && configured ? <SignInButton next="/" /> : null}
      {viewer.status === "owner" ? <a href="/settings">Settings</a> : null}
      {viewer.status === "member" || viewer.status === "owner" ? <form action="/auth/signout" method="post"><button type="submit">Sign out</button></form> : null}
    </div>
  </div>;
});

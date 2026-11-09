"use client";
import Link from "next/link";
import { forwardRef, useEffect, useRef, type MutableRefObject } from "react";
import { AppMark } from "./desktop-icons";
import { ThemeToggle } from "./theme-toggle";
import { SignInButton } from "./sign-in-button";
import { useViewer } from "./viewer-provider";

export const JOURNEY_LINKS = [
  { id: "pivot", label: "About" }, { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" }, { id: "toolkit", label: "TechStack" },
  { id: "creator", label: "Creator" }, { id: "screen", label: "Contact Us" },
];
interface Props {
  items?: typeof JOURNEY_LINKS;
  onJump?: (id: string) => void;
  navRefs?: MutableRefObject<(HTMLButtonElement | null)[]>;
  journey?: boolean;
  embedded?: boolean;
}
export const SiteNavigation = forwardRef<HTMLElement, Props>(function SiteNavigation({ items = JOURNEY_LINKS, onJump, navRefs, journey = false, embedded = false }, ref) {
  const { viewer, configured } = useViewer();
  const menu = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const close = (event: PointerEvent) => { if (!menu.current?.contains(event.target as Node)) menu.current?.removeAttribute("open"); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape" && menu.current?.open) { menu.current.removeAttribute("open"); menu.current.querySelector("summary")?.focus(); } };
    document.addEventListener("pointerdown", close); document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", close); document.removeEventListener("keydown", escape); };
  }, []);
  return <header role="banner" ref={ref} className={`site-navigation${journey ? " is-journey" : ""}${embedded ? " is-embedded" : ""}`} data-floating="false">
    <Link href={journey ? "#sky" : "/"} className="site-navigation-logo" aria-label="Jamie Ho — back to the top" onClick={event => { if (onJump) { event.preventDefault(); onJump("sky"); } }}><AppMark /></Link>
    <nav className="site-navigation-links" aria-label="Site">
      <details ref={menu} className="journey-menu">
        <summary>Journey <span aria-hidden="true">⌄</span></summary>
        <nav className="journey-chapter-list" aria-label="Journey chapters">
          {items.map((item, k) => onJump ? <button type="button" key={item.id} ref={node => { if (navRefs) navRefs.current[k] = node; }} onClick={() => { onJump(item.id); menu.current?.removeAttribute("open"); }}>{item.label}</button> : <Link key={item.id} prefetch={false} href={`${journey ? "" : "/"}#${item.id}`} onClick={() => menu.current?.removeAttribute("open")}>{item.label}</Link>)}
        </nav>
      </details>
      <Link href="/articles">Articles</Link><Link href="/resources">Resources</Link><Link href="/privacy">Privacy</Link>
    </nav>
    <div className="site-navigation-account">
      <ThemeToggle />
      {viewer.status === "anonymous" && configured ? <SignInButton label="Sign in" next={journey ? "/" : undefined} className="site-auth-button" /> : null}
      {viewer.status === "member" || viewer.status === "owner" ? <form action="/auth/signout" method="post"><button type="submit" className="site-auth-button">Sign out</button></form> : null}
    </div>
  </header>;
});

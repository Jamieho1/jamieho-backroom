"use client";
import Link from "next/link";
import {FeedbackButton} from "./feedback-button";
import { forwardRef, useEffect, useRef, useId, type ReactNode, type MutableRefObject } from "react";
import { ContentReviewBadge } from "./content-drafts/review-badge";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { SignInButton } from "./sign-in-button";
import { useViewer } from "./viewer-provider";

export const JOURNEY_LINKS = [
  { id: "creator", label: "Creator" },
  { id: "about", label: "Background" }, { id: "experience", label: "Experience" },
  { id: "projects", label: "Work" }, { id: "toolkit", label: "What I build" },
  { id: "contact", label: "Contact" },
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
  const menuGroup = useId();
  const pathname = usePathname() ?? "";
  const navLink=(label:string,href:string,close:()=>void)=><Link href={href} onClick={close} aria-current={pathname===href||pathname.startsWith(href+"/")?"page":undefined}>{label}</Link>;
  return <header role="banner" ref={ref} className={`site-navigation${journey ? " is-journey" : ""}${embedded ? " is-embedded" : ""}`} data-floating="false">
    <Link href={journey ? "#sky" : "/"} className="site-navigation-logo" aria-label="Jamie Ho — back to the top" onClick={event => { if (onJump) { event.preventDefault(); onJump("sky"); } }}><img src="/brand/jh-mark.svg" width="412" height="220" alt=""/></Link>
    <nav className="site-navigation-links" aria-label="Site">
      <NavigationMenu label="Journey" group={menuGroup}>
        {closeMenu=><nav className="journey-chapter-list" aria-label="Journey chapters">
          {items.map((item, k) => onJump ? <button type="button" key={item.id} ref={node => { if (navRefs) navRefs.current[k] = node; }} onClick={() => { onJump(item.id); closeMenu(); }}>{item.label}</button> : <Link key={item.id} prefetch={false} href={`${journey ? "" : "/"}#${item.id}`} onClick={closeMenu}>{item.label}</Link>)}
        </nav>}
      </NavigationMenu>
      <NavigationMenu label="My story" group={menuGroup}>{close=><nav className="journey-chapter-list" aria-label="My story pages">{navLink("About","/about",close)}{navLink("Projects","/projects",close)}</nav>}</NavigationMenu>
      <NavigationMenu label="Content" group={menuGroup}>{close=><nav className="journey-chapter-list" aria-label="Content pages">{navLink("Articles","/articles",close)}{navLink("Resources","/resources",close)}</nav>}</NavigationMenu>
      <Link href="/interview" aria-current={pathname.startsWith("/interview")?"page":undefined}>Interview Prep</Link>
    </nav>
    <div className="site-navigation-account">
      <FeedbackButton className="site-feedback-button"/>
      <ContentReviewBadge />
      <ThemeToggle />
      {viewer.status === "anonymous" && configured ? <SignInButton label="Sign in" next={journey ? "/" : undefined} className="site-auth-button" /> : null}
      {viewer.status === "member" || viewer.status === "owner" ? <form action="/auth/signout" method="post"><button type="submit" className="site-auth-button">Sign out</button></form> : null}
    </div>
  </header>;
});


/** The Journey disclosure supports hover, click, keyboard and outside dismissal. */
function NavigationMenu({label,group,children}:{label:string;group:string;children:(close:()=>void)=>ReactNode}){
  const menu = useRef<HTMLDetailsElement>(null);
  const pinned = useRef(false);
  const closeMenu = () => { pinned.current = false; menu.current?.removeAttribute("open"); };
  useEffect(() => {
    const close = (event: PointerEvent) => { if (!menu.current?.contains(event.target as Node)) closeMenu(); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape" && menu.current?.open) { closeMenu(); menu.current.querySelector("summary")?.focus(); } };
    document.addEventListener("pointerdown", close); document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", close); document.removeEventListener("keydown", escape); };
  }, []);
  return <details ref={menu} name={group} data-menu={label.toLowerCase()} className="journey-menu"
    onToggle={event=>{if(!event.currentTarget.open)pinned.current=false;}}
    onPointerEnter={event=>{if(event.pointerType==="mouse")menu.current?.setAttribute("open","");}}
    onPointerLeave={event=>{if(event.pointerType==="mouse"&&!pinned.current&&!menu.current?.contains(document.activeElement))closeMenu();}}
    onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node|null))closeMenu();}}>
    <summary onClick={event=>{event.preventDefault();if(pinned.current)closeMenu();else{pinned.current=true;menu.current?.setAttribute("open","");}}}>{label} <svg className="journey-menu-chevron" width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></summary>
    {children(closeMenu)}
  </details>;
}

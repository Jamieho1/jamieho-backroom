"use client";
import { forwardRef, useEffect, useRef, type MutableRefObject } from "react";
import type { Chapter } from "@/lib/journey/timeline";
import { JOURNEY_LINKS, SiteNavigation } from "@/components/site-navigation";
interface Props { items: { c: Chapter; i: number }[]; navRefs: MutableRefObject<(HTMLButtonElement | null)[]>; live: boolean; onJump: (id: string) => void }
export const JourneyNavigation = forwardRef<HTMLElement, Props>(function JourneyNavigation({ items, navRefs, live, onJump }, ref) {
  const local = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (live) return;
    const sync = () => { if (local.current) local.current.dataset.floating = window.scrollY >= window.innerHeight * .7 ? "true" : "false"; };
    sync(); window.addEventListener("scroll", sync, { passive: true });
    return () => window.removeEventListener("scroll", sync);
  }, [live]);
  return <SiteNavigation journey items={items.map(({ c }) => ({ id: c.id, label: JOURNEY_LINKS.find(item => item.id === c.id)?.label ?? c.nav! }))} navRefs={navRefs} onJump={live ? onJump : undefined} ref={node => {
    local.current = node; if (typeof ref === "function") ref(node); else if (ref) ref.current = node;
  }} />;
});

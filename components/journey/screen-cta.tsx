"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { useRouter } from "next/navigation";

export interface ScreenCtaHandle { setOpacity(o: number): void }

/**
 * The journey's last beat (redesign 2026-11-05, BMW-style): the camera has pushed into the monitor until it fills
 * the frame; the whole screen becomes one button, "Switch on", which opens the desktop with all the apps.
 */
export const ScreenCta = forwardRef<ScreenCtaHandle, { href: string }>(function ScreenCta({ href }, ref) {
  const root = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useImperativeHandle(ref, () => ({
    setOpacity: (o) => {
      const el = root.current;
      if (!el) return;
      el.style.opacity = String(o);
      el.style.visibility = o > 0 ? "visible" : "hidden";
      el.style.pointerEvents = o > 0.6 ? "auto" : "none";
    },
  }), []);

  const go = () => {
    root.current?.classList.add("is-on");
    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
    window.setTimeout(() => {
      if (doc.startViewTransition) doc.startViewTransition(() => router.push(href));
      else router.push(href);
    }, 380); // let the screen "power on" glow play first
  };

  return (
    <div ref={root} className="journey-cta" style={{ opacity: 0, visibility: "hidden", pointerEvents: "none" }}>
      <button type="button" className="journey-cta-screen" onClick={go} aria-label="Switch on the computer: open my desktop">
        <span className="journey-cta-power" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M12 3v8" /><path d="M6.3 7.2a8 8 0 1 0 11.4 0" /></svg>
        </span>
        <span className="journey-cta-label">Switch on</span>
        <span className="journey-cta-sub">Open my desktop · projects, notes, practice and more</span>
      </button>
    </div>
  );
});

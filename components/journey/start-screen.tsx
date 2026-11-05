"use client";

import { useEffect, useRef, useState } from "react";
import type { Panel } from "@/lib/journey/timeline";

const R = 34;
const C = 2 * Math.PI * R;

/**
 * TKT-76 first screen (BMW-style): the opening art as one instant image, the name, an "Enter the journey" button
 * ringed by the real download progress of the first two clips, and "Straight to my desktop" for visitors who want
 * the apps, not the film. Entering early is fine: any
 * clip still downloading shows its still until it lands. The tap on Enter is also what lets iOS scrub video.
 */
export function StartScreen({ still, hero, progress, desktopHref, onEnter, onGone }: {
  still: string; hero?: Panel; progress: number; desktopHref: string; onEnter(): void; onGone(): void;
}) {
  const [leaving, setLeaving] = useState(false);
  const enterBtn = useRef<HTMLButtonElement>(null);
  useEffect(() => { enterBtn.current?.focus({ preventScroll: true }); }, []);

  const leave = (then: () => void) => {
    if (leaving) return;
    setLeaving(true);
    then(); // runs inside the tap (iOS video unlock), the fade-out follows
    window.setTimeout(onGone, 650);
  };
  const pct = Math.round(progress * 100);

  return (
    <div className={`journey-start${leaving ? " is-leaving" : ""}`} role="dialog" aria-modal="true" aria-label="Welcome">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="journey-start-art" src={still} alt="" fetchPriority="high" />
      <div className="journey-start-copy">
        {hero?.eyebrow ? <p className="journey-eyebrow">{hero.eyebrow}</p> : null}
        <p className="journey-start-name">{hero?.title ?? "Jamie Ho"}</p>
        <div className="journey-start-actions">
          <button ref={enterBtn} type="button" className="journey-start-enter" onClick={() => leave(onEnter)}
            aria-describedby="journey-start-pct">
            <svg viewBox="0 0 80 80" aria-hidden="true">
              <circle cx="40" cy="40" r={R} className="journey-start-track" />
              <circle cx="40" cy="40" r={R} className="journey-start-ring"
                style={{ strokeDasharray: C, strokeDashoffset: C * (1 - progress) }} />
            </svg>
            <span>Enter the journey</span>
          </button>
          <a className="journey-start-skip" href={desktopHref}>Straight to my desktop <span>→</span></a>
        </div>
        <p id="journey-start-pct" className="journey-start-pct" aria-live="polite">{pct >= 100 ? "Ready" : `Loading ${pct}%`}</p>
      </div>
    </div>
  );
}

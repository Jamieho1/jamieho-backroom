"use client";

import { useEffect, useState } from "react";

/** mm:ss, or h:mm:ss from one hour. */
export function formatElapsed(ms: number): string {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600), m = Math.floor((total % 3600) / 60), s = total % 60;
  const mm = String(m).padStart(2, "0"), ss = String(s).padStart(2, "0");
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/**
 * Stopwatch for one problem (Jamie 2026-11-03): starts and pauses only when the user clicks; Reset sets it to 0.
 * Elapsed time comes from timestamps, so a throttled background tab doesn't drift. Opening another problem starts fresh.
 */
export function PracticeTimer({ title }: { title: string }) {
  const [banked, setBanked] = useState(0); // ms from earlier runs
  const [since, setSince] = useState<number | null>(null); // start of the current run
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (since === null) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [since]);
  const running = since !== null;
  const elapsed = banked + (running ? Math.max(0, now - since) : 0);
  const toggle = () => {
    const t = Date.now();
    if (running) { setBanked(banked + (t - since)); setSince(null); }
    else { setSince(t); setNow(t); }
  };
  const reset = () => { setBanked(0); setSince(null); };
  return <div className="practice-timer" role="group" aria-label={`Timer for ${title}`}>
    <span className={`practice-timer-time${running ? " running" : ""}`} role="timer" aria-live="off">{formatElapsed(elapsed)}</span>
    <button type="button" className="btn ghost small" aria-pressed={running} onClick={toggle}>{running ? "Pause" : elapsed ? "Resume" : "Start timer"}</button>
    {elapsed || running ? <button type="button" className="btn ghost small" onClick={reset}>Reset</button> : null}
  </div>;
}

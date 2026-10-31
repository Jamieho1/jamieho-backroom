import type { ReactNode } from "react";
/* ---------- original two-tone icons (40 px) ---------- */
const S = { fill: "none", stroke: "var(--secondary)", strokeWidth: 1.75, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const tint = (c: string) => ({ fill: c, opacity: 0.35 });
export const ICONS: Record<string, ReactNode> = {
  practice: (
    <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">
      <rect x="5" y="8" width="30" height="24" rx="4" style={tint("var(--cta-face)")} />
      <rect x="5" y="8" width="30" height="24" rx="4" {...S} />
      <path d="M5 14h30" {...S} />
      <path d="M15 19l-4 4 4 4M25 19l4 4-4 4M22 18l-4 10" {...S} />
    </svg>
  ),
  history: (
    <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">
      <circle cx="20" cy="20" r="14" style={tint("var(--blue)")} />
      <circle cx="20" cy="20" r="14" {...S} />
      <path d="M20 11v9l6 4" {...S} />
    </svg>
  ),
  notes: (
    <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">
      <rect x="9" y="6" width="23" height="29" rx="3" style={tint("var(--green)")} />
      <rect x="9" y="6" width="23" height="29" rx="3" {...S} />
      <path d="M9 12H6M9 20H6M9 28H6" {...S} />
      <path d="M15 14l2 2 4-4M15 23l2 2 4-4M24 15h4M24 24h4" {...S} />
    </svg>
  ),
  plan: (
    <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">
      <rect x="6" y="9" width="28" height="25" rx="3" style={tint("var(--yellow-text)")} />
      <rect x="6" y="9" width="28" height="25" rx="3" {...S} />
      <path d="M6 16h28M13 6v6M27 6v6" {...S} />
      <path d="M12 22h4M18 22h4M24 22h4M12 28h4M18 28h4" {...S} />
    </svg>
  ),
  behavioral: (
    <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">
      <path d="M6 9h20a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H15l-6 5v-5H6a3 3 0 0 1-3-3v-9a3 3 0 0 1 3-3z" style={tint("var(--blue)")} />
      <path d="M6 9h20a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H15l-6 5v-5H6a3 3 0 0 1-3-3v-9a3 3 0 0 1 3-3z" {...S} />
      <path d="M29 15h5a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-2v4l-5-4h-6a3 3 0 0 1-3-3v-2" {...S} />
      <path d="M10 15h12M10 19h8" {...S} />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">
      <circle cx="20" cy="20" r="11" style={tint("var(--muted)")} />
      <path d="M20 5v5M20 30v5M5 20h5M30 20h5M9.4 9.4l3.5 3.5M27.1 27.1l3.5 3.5M9.4 30.6l3.5-3.5M27.1 12.9l3.5-3.5" {...S} />
      <circle cx="20" cy="20" r="9" {...S} />
      <circle cx="20" cy="20" r="3.5" {...S} />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">
      <path d="M20 34s-13-7.5-13-17a7 7 0 0 1 13-3.6A7 7 0 0 1 33 17c0 9.5-13 17-13 17z" style={tint("var(--red)")} />
      <path d="M20 34s-13-7.5-13-17a7 7 0 0 1 13-3.6A7 7 0 0 1 33 17c0 9.5-13 17-13 17z" {...S} />
      <path d="M10 20h5l2-4 3 8 2-4h8" {...S} />
    </svg>
  ),
};
export const AppMark = () => (
  <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
    <rect x="1.5" y="1.5" width="17" height="17" rx="4" fill="var(--heading)" />
    <path d="M6 7l3 3-3 3M10.5 13.5h4" fill="none" stroke="var(--bg)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);


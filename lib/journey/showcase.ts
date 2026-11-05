/**
 * Home v1.1 projects showcase (TKT-87): pure scroll maths for the pinned section. After a short intro, each featured
 * project gets an equal slice of the section's scroll; inside its slice the screenshots cross-fade (and a tall,
 * full-page screenshot pans down), and one line per project fills to show how many are left.
 */
import { clamp01, smoothstep } from "./timeline";

/** Scroll (in screen heights) for the intro and for each project. */
export const SHOWCASE_INTRO = 0.6;
export const SHOWCASE_PER_PROJECT = 1;
/** Absolute scroll (screen heights) the colour wipe takes, so it feels the same however many projects there are. */
export const SHOWCASE_WIPE = 0.25;

export function showcaseScroll(n: number): number {
  return SHOWCASE_INTRO + Math.max(1, n) * SHOWCASE_PER_PROJECT;
}

export interface ShowcaseState {
  /** The project on screen. */
  index: number;
  /** How far through that project's slice (0..1). */
  within: number;
  /** Fill (0..1) of each project's line. */
  lines: number[];
}

export function showcaseState(local: number, n: number): ShowcaseState {
  if (n <= 0) return { index: 0, within: 0, lines: [] };
  const intro = SHOWCASE_INTRO / showcaseScroll(n);
  const t = clamp01((local - intro) / (1 - intro)) * n;
  const index = Math.min(n - 1, Math.floor(t));
  const within = clamp01(t - index);
  return { index, within, lines: Array.from({ length: n }, (_, k) => (k < index ? 1 : k > index ? 0 : within)) };
}

/** Opacity of project k's text: the current one is shown; it hands over to the next near the end of its slice. */
export function itemOpacity(state: ShowcaseState, k: number, n: number, edge = 0.1): number {
  if (k !== state.index) return 0;
  const fadeIn = k === 0 ? 1 : smoothstep(0, edge, state.within);
  const fadeOut = k === n - 1 ? 1 : 1 - smoothstep(1 - edge, 1, state.within);
  return Math.min(fadeIn, fadeOut);
}

/**
 * The screenshot stack inside one project's slice: which shot is on top, its cross-fade, and how far a tall shot
 * has panned (0 = top, 1 = bottom). Each shot holds most of its share, then fades into the next.
 */
export function shotState(within: number, m: number, fade = 0.25): { shot: number; mix: number; pan: number } {
  if (m <= 1) return { shot: 0, mix: 0, pan: clamp01(within) };
  const t = clamp01(within) * m;
  const shot = Math.min(m - 1, Math.floor(t));
  const f = t - shot;
  return { shot, mix: shot === m - 1 ? 0 : smoothstep(1 - fade, 1, f), pan: f };
}

/**
 * Home v1.1 projects showcase (TKT-87): pure scroll maths for the pinned section. After a short intro, each featured
 * project gets an equal slice of the section's scroll; inside its slice screenshots travel horizontally, and one line per project fills to show how many are left.
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

/** Hold the first/last screenshot briefly; all intermediate travel is reversible and linear. */
export function screenshotOffset(within:number,count:number){return count<2?0:clamp01((within-.12)/.76);}
export function screenshotWithin(index:number,count:number){return count<2?.5:.12+.76*clamp01(index/(count-1));}
/** Inverse of the project clock, used by clickable position dots. */
export function showcaseShotLocal(project:number,shot:number,shots:number,projects:number){
 return (SHOWCASE_INTRO+project+screenshotWithin(shot,shots))/showcaseScroll(projects);
}

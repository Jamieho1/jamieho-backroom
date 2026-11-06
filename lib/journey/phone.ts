/**
 * Home v1.2 phone mode (TKT-96, 2026-11-06): on phones the journey downloads no video. The opening is Jamie's 9:16
 * wallpaper (day or night), the whole desk chapter holds on the desk still, and scrolling on goes straight to the
 * monitor still with "Switch on". Pure, unit-tested.
 */
import type { Chapter } from "./timeline";

/** Width at or below which the journey runs in phone mode (same breakpoint as the mobile clips). */
export const PHONE_QUERY = "(max-width: 768px)";

/** Which still each video chapter holds on a phone. `wallpaper` is the theme's 9:16 art. */
export const PHONE_STILLS: Readonly<Record<string, "wallpaper" | string>> = { c1: "wallpaper", c7a: "c7a-last.jpg", c7b: "c7b-last.jpg" };

/**
 * The chapters as a phone runs them. Without the push-in footage the desk's panels start right away (the first half
 * of the chapter used to be the camera walking to the desk), and the monitor is a short cross-fade to the CTA.
 */
export function phoneChapters(chapters: Chapter[]): Chapter[] {
  return chapters.map((c) => {
    if (c.kind !== "video") return c;
    if (c.src === "c7a") {
      return {
        ...c, scroll: 1.8, keys: [[0, 1], [1, 1]],
        panels: (c.panels ?? []).map((p) => ({ ...p, from: remap(p.from), to: remap(p.to) })),
      };
    }
    if (c.src === "c7b") return { ...c, scroll: 0.9, join: 0.25 };
    return c;
  });
}

/** Desk panels: the old 0.5..1 window becomes 0.14..1. */
const remap = (t: number) => Math.round((0.14 + (Math.max(0.5, t) - 0.5) / 0.5 * 0.86) * 1000) / 1000;

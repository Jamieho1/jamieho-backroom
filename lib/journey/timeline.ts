/**
 * Home v1 journey (TKT-74): pure scroll maths. One scroll position drives the whole journey; these functions turn it
 * into "which chapter, how far through it, and which video time / panel state". No DOM, so it is unit-tested.
 */

/** [scroll fraction, media fraction] pairs, both 0..1, strictly increasing in scroll. Slow reading = shallow slope. */
export type Keys = readonly (readonly [number, number])[];

export interface PanelLink { kicker: string; title: string; href: string; image?: string; external?: boolean }

export interface Panel {
  id: string;
  /** Visible between these local scroll fractions (fades in/out over `fade`). */
  from: number;
  to: number;
  side?: "left" | "right" | "center";
  eyebrow?: string;
  title: string;
  /** Small line under the title (e.g. organisation · dates). */
  meta?: string;
  body?: string;
  /** Render `body` as safe Markdown (site sections) rather than plain text. */
  md?: boolean;
  /** Short tags shown under the body (e.g. technologies). */
  chips?: string[];
  /** Link cards (the desk's "Latest" panel): kicker, title, where it goes, optional cover image. */
  links?: PanelLink[];
  /** A row of small inline links under everything else (e.g. "Say hello" + socials). */
  foot?: { label: string; href: string }[];
  /** One call-to-action button (e.g. the hero's "Go straight to my desktop"). */
  cta?: { label: string; href: string };
  /** A row of pill buttons (e.g. the Creator section's Subscribe / Follow); http(s) links open in a new tab. */
  actions?: { label: string; href: string }[];
  /** "statement": the title is a giant BMW-style line; "role": one experience entry (section chapters). */
  look?: "statement" | "role";
  /** Short proof points under the body (an experience entry's public bullets). */
  points?: string[];
}

interface Base {
  id: string;
  label: string;
  /** Scroll length in viewport heights. */
  scroll: number;
  panels?: Panel[];
  /** Fraction of this chapter's scroll used to cross-fade in from the previous chapter's last frame. */
  join?: number;
  /** Giant chapter word shown as the chapter begins (BMW-style), e.g. "IMPERIAL". */
  display?: string;
  /** Short label in the bottom chapter menu; chapters without one are not listed. */
  nav?: string;
  /** Floating light motes over the scene (0 = none, 1 = full). */
  motes?: number;
}
export interface VideoChapter extends Base {
  kind: "video";
  /** Media id: files are `${base}/${src}-desktop.mp4`, `-mobile.mp4`, `-first.jpg`, `-last.jpg`. */
  src: string;
  keys?: Keys;
  /**
   * Corrects a small framing mismatch at the join: the incoming first frame is drawn scaled/shifted to match the
   * outgoing last frame, then eases to identity over `span` of this chapter. Values measured offline (ECC).
   */
  align?: { scale: number; x: number; y: number; span: number };
}
/**
 * Home v1.1: a BMW-style solid section (no video). It wipes up over the previous chapter, holds its text on a flat
 * colour, and can show one framed still beside the text with a light parallax.
 */
export interface SectionChapter extends Base {
  kind: "section";
  /** light = warm off-white with dark ink, dark = warm near-black with light ink. */
  tone: "light" | "dark";
  /** Optional framed picture beside the text (a media file, e.g. "still-imperial.jpg"). */
  still?: { file: string; side: "left" | "right" };
  /** Fraction of the section's scroll used to wipe it in (default 0.14). */
  wipe?: number;
  /** TKT-85: show one timeline dot per panel (the current one lit), labelled with each panel's eyebrow. */
  timeline?: boolean;
  /** TKT-88: the exploded architecture stack (layers from the Technology section, badges from certificates). */
  toolkit?: { title: string; layers: { name: string; how: string; tools: string[] }[]; certs: { title: string; org: string; href?: string }[] };
  /** TKT-87: the pinned projects showcase (featured projects, filled from the database). */
  showcase?: ShowcaseItem[];
}

export interface ShowcaseItem {
  slug: string;
  name: string;
  tagline: string;
  tags: string[];
  /** The project's own page (the case study), never the website directly. */
  href: string;
  shots: string[];
}
export interface FadeChapter extends Base {
  kind: "fade";
  /** Colour the screen passes through between the previous and next chapter (BMW-style white-out or black). */
  color: string;
  /** Text colour scheme for panels shown over the colour. */
  tone?: "light" | "dark";
}
export type Chapter = VideoChapter | SectionChapter | FadeChapter;

export const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
export const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** Piecewise-linear interpolation through `keys` (defaults to the identity). */
export function mapKeys(keys: Keys | undefined, p: number): number {
  const x = clamp01(p);
  if (!keys || keys.length < 2) return x;
  if (x <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [x1, y1] = keys[i];
    if (x <= x1) {
      const [x0, y0] = keys[i - 1];
      return x1 === x0 ? y1 : y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);
    }
  }
  return keys[keys.length - 1][1];
}

/** Throws on data mistakes, so a bad chapter file fails a test instead of the page. */
export function validateKeys(keys: Keys) {
  if (keys[0][0] !== 0 || keys[0][1] !== 0) throw new Error("keys must start at [0, 0]");
  const last = keys[keys.length - 1];
  if (last[0] !== 1 || last[1] !== 1) throw new Error("keys must end at [1, 1]");
  for (let i = 1; i < keys.length; i++) {
    if (!(keys[i][0] > keys[i - 1][0])) throw new Error("scroll fractions must increase");
    if (keys[i][1] < keys[i - 1][1]) throw new Error("media fractions must not go backwards");
  }
}

export interface Layout { starts: number[]; total: number }
/** Chapter start offsets (in viewport heights) and the total journey length. */
export function layout(chapters: readonly Chapter[]): Layout {
  const starts: number[] = [];
  let total = 0;
  for (const c of chapters) { starts.push(total); total += c.scroll; }
  return { starts, total };
}

export interface Position { index: number; local: number }
/** Which chapter a global progress (0..1 over the whole track) falls in, and how far through it. */
export function locate(chapters: readonly Chapter[], progress: number, lay = layout(chapters)): Position {
  const at = clamp01(progress) * lay.total;
  for (let i = chapters.length - 1; i >= 0; i--) {
    if (at >= lay.starts[i]) {
      const local = chapters[i].scroll ? (at - lay.starts[i]) / chapters[i].scroll : 1;
      return { index: i, local: clamp01(local) };
    }
  }
  return { index: 0, local: 0 };
}

/** Global progress at which a chapter starts: used for chapter navigation and `/journey#desk`. */
export function progressOf(chapters: readonly Chapter[], id: string, lay = layout(chapters)): number {
  const i = chapters.findIndex((c) => c.id === id);
  return i < 0 || !lay.total ? 0 : lay.starts[i] / lay.total;
}

/** Panel opacity (0..1) at a local chapter fraction: fades over `fade` at both ends. */
export function panelOpacity(panel: Pick<Panel, "from" | "to">, local: number, fade = 0.05): number {
  if (local < panel.from || local > panel.to) return 0;
  const f = Math.min(fade, (panel.to - panel.from) / 2);
  // A panel that starts (or ends) at the chapter edge is already showing there, e.g. the name on the first screen.
  const fadeIn = panel.from <= 0 ? 1 : smoothstep(panel.from, panel.from + f, local);
  const fadeOut = panel.to >= 1 ? 1 : 1 - smoothstep(panel.to - f, panel.to, local);
  return Math.min(fadeIn, fadeOut);
}

/** Opacity of an incoming chapter over the previous one's last frame. */
export function joinOpacity(chapter: Pick<Base, "join">, local: number): number {
  const j = chapter.join ?? 0;
  return j <= 0 ? 1 : smoothstep(0, j, local);
}

/** The join-alignment transform at this point of the chapter (identity once past `span`). */
export function alignAt(chapter: VideoChapter, local: number) {
  const a = chapter.align;
  if (!a) return { scale: 1, x: 0, y: 0 };
  const k = 1 - smoothstep(0, a.span, local);
  return { scale: 1 + (a.scale - 1) * k, x: a.x * k + 0, y: a.y * k + 0 };
}

/** Frame-rate-independent exponential ease toward a target (the "weighted" scrub). */
export function approach(current: number, target: number, dtMs: number, halfLifeMs = 90): number {
  const k = 1 - Math.pow(0.5, dtMs / halfLifeMs);
  const next = current + (target - current) * k;
  return Math.abs(target - next) < 1e-5 ? target : next;
}

/** Fade-chapter cover opacity: rises over the first `edge`, holds (panel reads on the colour), clears over the last. */
export function fadeCover(local: number, edge = 0.25): number {
  return Math.min(smoothstep(0, edge, local), 1 - smoothstep(1 - edge, 1, local));
}

/** Giant chapter word: in fully at the start, holds briefly, gone by ~18% of the chapter. */
export function displayOpacity(local: number): number {
  return 1 - smoothstep(0.06, 0.18, local);
}

/** Per-word reveal (0..1) for word `i` of `n`, given the panel's overall opacity `o`. */
export function wordReveal(o: number, i: number, n: number, spreadAmt = 0.5): number {
  if (n <= 1) return o;
  const start = (i / (n - 1)) * spreadAmt;
  return clamp01((o - start) / (1 - spreadAmt));
}

/** The end-of-journey "Switch on" button: fades in over the last stretch of the push-in (smoothstep). */
export function ctaOpacity(local: number, at = 0.82): number {
  const t = (local - at) / (1 - at) * 2;
  return t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);
}

export const SECTION_WIPE = 0.14;
/** How far (0..1 of the screen height) a section still sits below its resting place while it wipes in. */
export function wipeOffset(local: number, wipe = SECTION_WIPE): number {
  return 1 - smoothstep(0, wipe, local);
}

/** Light parallax for a section's framed still: drifts from +amp to -amp (fraction of its height) over the section. */
export function stillDrift(local: number, amp = 0.06): number {
  return (0.5 - clamp01(local)) * 2 * amp;
}

/**
 * Where the chapter menu lands for a chapter (global progress). Video chapters start at their first frame; a solid
 * section lands just after its wipe, once its first panel is readable, so a menu jump never shows a blank screen.
 */
export function landingOf(chapters: readonly Chapter[], id: string, lay = layout(chapters)): number {
  const i = chapters.findIndex((c) => c.id === id);
  if (i < 0 || !lay.total) return 0;
  const c = chapters[i];
  const settle = c.kind === "section" ? Math.min(0.9, Math.max(c.wipe ?? SECTION_WIPE, c.panels?.[0]?.from ?? 0) + 0.06) : 0;
  return (lay.starts[i] + c.scroll * settle) / lay.total;
}

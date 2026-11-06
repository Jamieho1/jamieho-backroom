/**
 * Home v1.2 text motion (TKT-92), pure helpers.
 * - A cycling phrase: the owner writes `I {build|ship|teach} production AI` in the Hero body; the braces cycle.
 * - Keywords: `**word**` in a statement title is a keyword that lights up amber as you scroll past it.
 */
export interface Rotator { before: string; words: string[]; after: string }

const plainMd = (s: string) => s.replace(/\*\*|__|`/g, "").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");

/** The first `{a|b|c}` group in the text (2–6 options). Text around it becomes plain lead-in / tail. */
export function parseRotator(text: string): Rotator | null {
  const m = /\{([^{}|]+(?:\|[^{}|]+){1,5})\}/.exec(text);
  if (!m) return null;
  const words = m[1].split("|").map((w) => w.trim()).filter(Boolean);
  if (words.length < 2) return null;
  return { before: plainMd(text.slice(0, m.index)), words, after: plainMd(text.slice(m.index + m[0].length)) };
}

/** The same text with the group replaced by its first option (the still version and screen readers). */
export function rotatorText(r: Rotator): string {
  return `${r.before}${r.words[0]}${r.after}`.trim();
}

export interface Token { text: string; key: boolean }
/** "From **biomedical** engineering" → tokens; `key` marks the highlighted words (spaces kept as their own tokens). */
export function keyTokens(title: string): Token[] {
  const out: Token[] = [];
  title.split(/(\*\*[^*]+\*\*)/).forEach((part) => {
    if (!part) return;
    const key = /^\*\*[^*]+\*\*$/.test(part);
    const inner = key ? part.slice(2, -2) : part;
    for (const t of inner.split(/(\s+)/)) if (t) out.push({ text: t, key: key && !/^\s+$/.test(t) });
  });
  return out;
}

/** Title without the `**` marks (aria labels, metadata). */
export const stripKeys = (title: string) => title.replace(/\*\*([^*]+)\*\*/g, "$1");

/* ---- TKT-93: an image grows to fill the screen at the end of its section ---- */
/** The last fraction of a section over which its framed image grows to full screen. */
export const GROW = 0.16;

/** How far through the grow (0..1) at a section's local progress. */
export function growAt(local: number, grow = GROW): number {
  const t = (local - (1 - grow)) / grow;
  const c = t < 0 ? 0 : t > 1 ? 1 : t;
  return c * c * (3 - 2 * c);
}

/**
 * Transform that takes a box (x, y, w, h in screen px) to cover the whole screen (vw × vh), `t` of the way.
 * Uniform scale from the box centre (transform-origin: centre), so the picture never distorts.
 */
export function growTransform(box: { x: number; y: number; w: number; h: number }, vw: number, vh: number, t: number) {
  const s = Math.max(vw / box.w, vh / box.h);
  return { dx: (vw / 2 - (box.x + box.w / 2)) * t, dy: (vh / 2 - (box.y + box.h / 2)) * t, scale: 1 + (s - 1) * t };
}

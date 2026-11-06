/**
 * Home v1.1 Toolkit (TKT-88): the exploded architecture stack. Pure parsing and scroll maths, unit-tested.
 *
 * The owner writes the Technology section as one block per layer:
 *   ## Cloud
 *   Event-driven systems on AWS at Global Relay.
 *   - AWS
 *   - Lambda, SQS
 * The heading is the layer, the first plain line is "how I use it", and the bullets are the tools.
 */
import { clamp01, smoothstep } from "./timeline";

export interface Layer { name: string; how: string; tools: string[] }
export interface Cert { title: string; org: string; href?: string; badge?: string }

export const TOOLKIT_LIMITS = { layers: 6, tools: 12 } as const;

const clean = (s: string) => s.replace(/\*\*|__|`/g, "").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").trim();

export function parseToolkit(markdown: string): Layer[] {
  const layers: Layer[] = [];
  let cur: Layer | null = null;
  for (const raw of markdown.split(/\r?\n/)) {
    const line = raw.trim();
    const h = /^#{2,3}\s+(.+)$/.exec(line);
    if (h) { cur = { name: clean(h[1]), how: "", tools: [] }; layers.push(cur); continue; }
    if (!cur || !line) continue;
    const item = /^[-*+]\s+(.+)$/.exec(line);
    if (item) {
      for (const t of item[1].split(",").map(clean).filter(Boolean)) if (!cur.tools.includes(t)) cur.tools.push(t);
    } else if (!cur.how) cur.how = clean(line);
  }
  return layers.filter((l) => l.name).slice(0, TOOLKIT_LIMITS.layers).map((l) => ({ ...l, tools: l.tools.slice(0, TOOLKIT_LIMITS.tools) }));
}

/** The first https link in a CV entry's summary (Markdown link or bare URL): the Credly badge. */
export function firstHttps(text: string): string | undefined {
  const m = /\]\((https:\/\/[^\s)]+)\)|(?<![(\w])(https:\/\/[^\s)<>\]]+)/.exec(text);
  return m ? (m[1] ?? m[2]) : undefined;
}

/** Scroll (screen heights): a lead-in, one step per layer, and a beat for the badges. */
export const TOOLKIT_LEAD = 0.5;
export const TOOLKIT_PER_LAYER = 0.7;
export const TOOLKIT_CERTS = 0.6;
export function toolkitScroll(layers: number, certs: number): number {
  return TOOLKIT_LEAD + Math.max(1, layers) * TOOLKIT_PER_LAYER + (certs ? TOOLKIT_CERTS : 0);
}

export interface ToolkitState {
  /** The layer being explained (its text is shown, its plane lit). */
  active: number;
  /** How far each layer has lifted off the one below (0 = stacked tight, 1 = fully separated). */
  lift: number[];
  /** Badges fade in once every layer is out. */
  certs: number;
}

export function toolkitState(local: number, layers: number, certs: number): ToolkitState {
  const total = toolkitScroll(layers, certs);
  const lead = TOOLKIT_LEAD / total, step = TOOLKIT_PER_LAYER / total;
  const lift = Array.from({ length: layers }, (_, k) => smoothstep(lead + step * (k - 0.6), lead + step * k, local));
  let active = 0;
  for (let k = 0; k < layers; k++) if (local >= lead + step * (k - 0.3)) active = k;
  const certsAt = lead + step * layers;
  return { active, lift, certs: certs ? smoothstep(certsAt, certsAt + Math.min(0.08, TOOLKIT_CERTS / total / 2), local) : 0 };
}

/** Height (px, before perspective) of layer k above the base: tight when stacked, spread when exploded. */
export function layerZ(k: number, lift: number[], tight = 14, open = 96): number {
  let z = 0;
  for (let j = 1; j <= k; j++) z += tight + (open - tight) * clamp01(lift[j] ?? 0);
  return z;
}

/** Official badge art (public/badges) for certifications Jamie holds, matched loosely on the title. */
export const CERT_BADGES: readonly { match: RegExp; src: string }[] = [
  { match: /machine learning/i, src: "/badges/aws-ml-specialty-d33720a3e719.webp" },
  { match: /solutions? architect/i, src: "/badges/aws-sa-pro-eae67aa33207.webp" },
];
export function certBadge(title: string, org = ""): string | undefined {
  if (!/aws|amazon/i.test(`${title} ${org}`)) return undefined;
  return CERT_BADGES.find((b) => b.match.test(title))?.src;
}

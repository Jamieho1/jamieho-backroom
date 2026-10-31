/**
 * Original illustrated wallpapers (Jamie 2026-10-19: warmer, PostHog-like feel, but none of PostHog's art).
 * Calm landscapes drawn as SVG and inlined as data URIs: rolling hills, sun or moon, clouds, a few trees.
 */
interface Palette {
  sky: [string, string, string];
  sun: string;
  glow: string;
  cloud: string;
  hills: [string, string, string, string];
  trees: string;
  path: string;
  night?: boolean;
}

const PALETTES: Record<"hills" | "sunset" | "hills-night", Palette> = {
  hills: { sky: ["#F9DDB5", "#FCEBD2", "#FBF4E6"], sun: "#F6C567", glow: "#FBE0A6", cloud: "#FFFDF7", hills: ["#E3DCB4", "#C9CF9C", "#A9BC86", "#8CA874"], trees: "#6F8F5C", path: "#F1E4C2" },
  sunset: { sky: ["#F4B48E", "#F8CDA8", "#FBE6CC"], sun: "#F28C5B", glow: "#F9C3A0", cloud: "#FFF4E8", hills: ["#E8C39A", "#D9A77E", "#B98763", "#93694C"], trees: "#6E5140", path: "#F3D9B8" },
  "hills-night": { sky: ["#151A2A", "#1F2638", "#2A3048"], sun: "#F1E4C3", glow: "#3A4160", cloud: "#2E3550", hills: ["#2B3448", "#2A3A3A", "#2F4239", "#344A3C"], trees: "#22312A", path: "#3B4658", night: true },
};

function svg(p: Palette): string {
  const stars = p.night
    ? Array.from({ length: 40 }, (_, i) => {
        const x = (i * 397) % 1600;
        const y = (i * 173) % 430;
        const r = i % 5 === 0 ? 1.8 : 1.1;
        return `<circle cx="${x}" cy="${y + 20}" r="${r}" fill="#F4EEDD" opacity="${0.35 + (i % 4) * 0.15}"/>`;
      }).join("")
    : "";
  const cloud = (x: number, y: number, s: number) =>
    `<g transform="translate(${x} ${y}) scale(${s})" fill="${p.cloud}" opacity="${p.night ? 0.5 : 0.85}"><ellipse cx="0" cy="0" rx="70" ry="22"/><ellipse cx="-38" cy="-6" rx="34" ry="24"/><ellipse cx="22" cy="-18" rx="42" ry="30"/><ellipse cx="62" cy="-2" rx="30" ry="18"/></g>`;
  const tree = (x: number, y: number, s: number) =>
    `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-3" y="0" width="6" height="26" rx="2" fill="${p.trees}" opacity=".8"/><ellipse cx="0" cy="-8" rx="18" ry="24" fill="${p.trees}"/></g>`;
  const birds = p.night
    ? ""
    : `<g fill="none" stroke="${p.trees}" stroke-width="2.4" stroke-linecap="round" opacity=".55"><path d="M420 210 q10 -10 20 0 q10 -10 20 0"/><path d="M470 180 q8 -8 16 0 q8 -8 16 0"/><path d="M380 250 q7 -7 14 0 q7 -7 14 0"/></g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.sky[0]}"/><stop offset=".55" stop-color="${p.sky[1]}"/><stop offset="1" stop-color="${p.sky[2]}"/></linearGradient>
<radialGradient id="g"><stop offset="0" stop-color="${p.glow}" stop-opacity=".9"/><stop offset="1" stop-color="${p.glow}" stop-opacity="0"/></radialGradient></defs>
<rect width="1600" height="1000" fill="url(#s)"/>${stars}
<circle cx="1210" cy="250" r="190" fill="url(#g)"/><circle cx="1210" cy="250" r="${p.night ? 52 : 74}" fill="${p.sun}"/>
${p.night ? `<circle cx="1228" cy="238" r="52" fill="${p.sky[1]}"/>` : ""}
${cloud(330, 170, 1)}${cloud(860, 120, 0.8)}${cloud(1450, 380, 0.7)}${birds}
<path d="M0 620 C 220 520 420 560 640 600 S 1060 520 1300 560 S 1520 600 1600 580 V1000 H0Z" fill="${p.hills[0]}"/>
<path d="M0 700 C 260 620 520 650 760 700 S 1180 640 1420 690 S 1560 700 1600 690 V1000 H0Z" fill="${p.hills[1]}"/>
${tree(1180, 640, 1)}${tree(1220, 652, 0.8)}${tree(300, 668, 0.9)}
<path d="M0 790 C 300 730 560 770 820 800 S 1260 750 1600 790 V1000 H0Z" fill="${p.hills[2]}"/>
<path d="M760 1000 C 800 930 860 880 980 850 S 1120 812 1180 800" fill="none" stroke="${p.path}" stroke-width="26" stroke-linecap="round" opacity=".9"/>
${tree(560, 770, 1.2)}${tree(610, 784, 0.9)}${tree(1460, 760, 1.1)}
<path d="M0 880 C 340 840 640 880 900 900 S 1340 860 1600 880 V1000 H0Z" fill="${p.hills[3]}"/>
</svg>`;
}

const uri = (s: string) => `url("data:image/svg+xml,${encodeURIComponent(s.replace(/\n/g, ""))}")`;
export const WALL_IMAGES = {
  hills: uri(svg(PALETTES.hills)),
  sunset: uri(svg(PALETTES.sunset)),
  night: uri(svg(PALETTES["hills-night"])),
};

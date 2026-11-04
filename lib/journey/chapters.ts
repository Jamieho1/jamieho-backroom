/**
 * Home v1 journey chapters (TKT-74). Order, scroll length and pacing for each clip/scene. Panel copy here is
 * placeholder only: TKT-77 binds the real text from the database (no personal content in git).
 *
 * Pacing notes (measured on the 4 Nov clips, 7.92 s each unless noted):
 * - c3a: an extra sign appears on the door canopy at ~5.2–6.4 s (0.66–0.81), so that range gets very little scroll.
 * - c7a: the generator slipped in a ~0.7 s dissolve at ~3.5–4.2 s (0.44–0.53), passed over quickly the same way.
 * - c3b: its first frame is framed ~7% tighter than c3a's last frame; `align` (ECC-measured) hides the jump.
 */
import type { Chapter } from "./timeline";

const PLACEHOLDER = "Placeholder: TKT-77 fills this panel from the existing site content.";

export const HOME_CHAPTERS: Chapter[] = [
  {
    id: "sky", label: "Hello", kind: "video", src: "c1", scroll: 1.6,
    keys: [[0, 0], [0.35, 0.12], [1, 1]],
    panels: [{ id: "hero", from: 0, to: 0.32, side: "left", eyebrow: "Welcome", title: "Jamie Ho", body: PLACEHOLDER }],
  },
  { id: "descent", label: "Descent", kind: "video", src: "c2", scroll: 1.3, join: 0.03 },
  {
    id: "imperial", label: "Imperial", kind: "video", src: "c3a", scroll: 2.2,
    keys: [[0, 0], [0.4, 0.3], [0.7, 0.65], [0.74, 0.81], [1, 1]],
    panels: [{ id: "imperial", from: 0.04, to: 0.4, side: "left", eyebrow: "Chapter 1", title: "Imperial College London", body: PLACEHOLDER }],
  },
  {
    id: "atrium", label: "Atrium", kind: "video", src: "c3b", scroll: 1.4, join: 0.05,
    align: { scale: 1.069, x: -0.041, y: -0.038, span: 0.3 },
  },
  {
    id: "library", label: "Library", kind: "layers", scene: "library", scroll: 3, join: 0.06,
    panels: [
      { id: "about", from: 0.06, to: 0.36, side: "left", eyebrow: "About", title: "Background", body: PLACEHOLDER },
      { id: "interests", from: 0.38, to: 0.66, side: "right", eyebrow: "Interests", title: "What I care about", body: PLACEHOLDER },
      { id: "technology", from: 0.68, to: 0.96, side: "left", eyebrow: "Technology", title: "Tools I use", body: PLACEHOLDER },
    ],
  },
  // C4 in code (Jamie 2026-11-04, BMW-style): the window light blooms to white, chapter text rises, then clears.
  {
    id: "to-westminster", label: "Westminster", kind: "fade", color: "#f6f3ee", tone: "dark", scroll: 1.2,
    panels: [{ id: "experience", from: 0.25, to: 0.75, side: "left", eyebrow: "Chapter 2", title: "Experience", body: PLACEHOLDER }],
  },
  // C5a / C5b (Westminster walk + under the arch) slot in here once Jamie renders them:
  // { id: "westminster", label: "Westminster", kind: "video", src: "c5a", scroll: 2, ... },
  // { id: "arch", label: "Under the bridge", kind: "video", src: "c5b", scroll: 1.4, join: 0.03 },
  // C6 in code: through black into the room.
  { id: "to-room", label: "Home", kind: "fade", color: "#050403", tone: "light", scroll: 0.8 },
  {
    id: "room", label: "Room", kind: "video", src: "c7a", scroll: 1.6,
    keys: [[0, 0], [0.42, 0.44], [0.46, 0.54], [1, 1]],
  },
  {
    id: "desk", label: "Desk", kind: "video", src: "c7b", scroll: 1.6, join: 0.02,
    panels: [{ id: "monitor", from: 0.9, to: 1.01, side: "left", eyebrow: "Desk", title: "Projects · Articles · Practice · Contact", body: "Placeholder: TKT-78 puts the launcher on the monitor." }],
  },
];

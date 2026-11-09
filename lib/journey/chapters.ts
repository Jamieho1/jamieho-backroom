/**
 * Home v1.1 journey chapters (grill 2026-11-05). Video only at the two ends: the cloud hero (c1) and the room
 * (c7a) pushing into the monitor (c7b). Between them sit BMW-style solid sections that carry the information:
 * Pivot here (TKT-82); Projects, Experience, Toolkit and Creator follow in TKT-83–89. Panel copy here is
 * placeholder only: `withContent` binds the real text from the database (no personal content in git).
 *
 * Pacing notes:
 * - c7a: the generator slipped in a ~0.7 s dissolve at ~3.5–4.2 s (0.44–0.53), passed over quickly via its keys.
 */
import type { Chapter } from "./timeline";

const PLACEHOLDER = "Placeholder: filled from the existing site content.";

export const HOME_CHAPTERS: Chapter[] = [
  {
    id: "sky", label: "Hello", kind: "video", src: "c1", scroll: 0.65, motes: 0.6,
    keys: [[0, 0], [0.35, 0.12], [1, 1]],
    panels: [{ id: "hero", from: 0, to: 0.85, side: "center", eyebrow: "Welcome", title: "Jamie Ho", body: PLACEHOLDER }],
  },
  // The pivot: one giant statement on off-white, the education line, and the Imperial entrance framed beside it.
  {
    id: "pivot", label: "About", nav: "About", kind: "section", tone: "light", scroll: 1.5,
    still: { file: "still-imperial.jpg", side: "right" },
    panels: [{ id: "pivot", from: 0.1, to: 1, side: "left", look: "statement", eyebrow: "About", title: "From biomedical engineering to production systems", body: PLACEHOLDER }],
  },
  // Selected work (TKT-87): featured projects in a pinned showcase. Filled (and sized) from the database.
  { id: "projects", label: "Projects", nav: "Projects", kind: "section", tone: "dark", scroll: 1.6, showcase: [] },
  // Experience (TKT-85): public CV roles, one per screen, with a timeline dot each and Westminster framed beside them.
  {
    id: "experience", label: "Experience", nav: "Experience", kind: "section", tone: "light", scroll: 1.4, timeline: true,
    still: { file: "still-westminster.jpg", side: "right" },
    panels: [{ id: "r1", from: 0.1, to: 1, side: "left", look: "role", eyebrow: "Role", title: "Experience", body: PLACEHOLDER }],
  },
  // Toolkit (TKT-88): the one layered scene. An exploded architecture stack, then the certification badges.
  { id: "toolkit", label: "Techstack", nav: "Techstack", kind: "section", tone: "dark", scroll: 2, toolkit: { title: "Techstack", layers: [], certs: [] } },
  // Creator (TKT-89): YouTube & Instagram. The channel pitch with Subscribe / Follow, and the latest posts beside it.
  {
    id: "creator", label: "Creator", nav: "Creator", kind: "section", tone: "light", scroll: 1.6,
    panels: [
      { id: "pitch", from: 0.12, to: 1, side: "left", look: "statement", eyebrow: "YouTube & Instagram", title: "I teach this", body: PLACEHOLDER },
      { id: "latest", from: 0.2, to: 1, side: "right", eyebrow: "Latest", title: "Fresh off the desk" },
    ],
  },
  // The final journey arrives in the room and pushes into the contact screen.
  { id: "to-room", label: "Contact Us", kind: "fade", color: "#050403", tone: "light", scroll: 0.8 },
  {
    id: "room", label: "Room", display: "Contact Us", kind: "video", src: "c7a", scroll: 3, motes: 0.3,
    keys: [[0, 0], [0.24, 0.44], [0.27, 0.54], [0.5, 1], [1, 1]],
  },
  { id: "screen", label: "Contact Us", nav: "Contact Us", kind: "video", src: "c7b", scroll: 1.4, join: 0.08 },
];

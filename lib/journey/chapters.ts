/** Home v1.3: Hello → About → Experience → Work → Techstack → Creator → Contact Us.
 * Placeholder copy is replaced by withContent; personal content remains in the database.
 * Room footage passes its generated dissolve quickly through the existing camera keys.
 */
import type { Chapter } from "./timeline";

const PLACEHOLDER = "Placeholder: filled from the existing site content.";

export const HOME_CHAPTERS: Chapter[] = [
  {
    id: "sky", label: "Hello", kind: "video", src: "c1", scroll: 0.65, motes: 0.6,
    keys: [[0, 0], [0.35, 0.12], [1, 1]],
    panels: [{ id: "hero", from: 0, to: 0.85, side: "center", eyebrow: "Welcome", title: "Jamie Ho", body: PLACEHOLDER }],
  },
  {id:"about",label:"Background",nav:"Background",kind:"section",tone:"dark",scroll:6,wipe:0,
    panels:[{id:"about",from:0,to:1,side:"left",title:"Background",body:PLACEHOLDER}],dial:{experiences:[],projects:[]}},
  // Toolkit (TKT-88): the one layered scene. An exploded architecture stack, then the certification badges.
  { id: "toolkit", label: "Techstack", nav: "What I build", kind: "section", tone: "dark", scroll: 2, toolkit: { title: "Techstack", layers: [], certs: [] } },
  // Creator (TKT-89): YouTube & Instagram. The channel pitch with Subscribe / Follow, and the latest posts beside it.
  {
    id: "creator", label: "Creator", nav: "Creator", kind: "section", tone: "light", scroll: 1.6,
    panels: [
      { id: "pitch", from: 0.12, to: 1, side: "left", look: "statement", eyebrow: "YouTube & Instagram", title: "I teach this", body: PLACEHOLDER },
      { id: "latest", from: 0.2, to: 1, side: "right", eyebrow: "Latest", title: "Fresh off the desk" },
    ],
  },
  // The final journey arrives in the room and pushes into the contact screen.
  { id: "to-room", label: "Contact", kind: "fade", color: "#050403", tone: "light", scroll: 0.4 },
  {
    id: "room", label: "Room", display: "Contact", kind: "video", src: "c7a", scroll: 1.4, motes: 0.3,
    keys: [[0, 0], [0.24, 0.44], [0.27, 0.54], [1, 1]],
  },
  { id: "screen", label: "Contact Us", nav: "Contact", kind: "video", src: "c7b", scroll: 0.8, join: 0.08 },
];

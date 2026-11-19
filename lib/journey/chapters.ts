import {DEFAULT_BUILD} from "./build";
/** Home: artwork, Creator, editorial dial and capabilities; Contact follows in normal flow. */
import type { Chapter } from "./timeline";

const PLACEHOLDER = "Placeholder: filled from the existing site content.";

export const HOME_CHAPTERS: Chapter[] = [
  {
    id: "sky", label: "Hello", kind: "video", src: "c1", scroll: 0.65, motes: 0.6,
    keys: [[0, 0], [0.35, 0.12], [1, 1]],
    panels: [{ id: "hero", from: 0, to: 0.85, side: "center", eyebrow: "Welcome", title: "Jamie Ho", body: PLACEHOLDER }],
  },
  // Creator (TKT-89): YouTube & Instagram. The channel pitch with Subscribe / Follow, and the latest posts beside it.
  {
    id: "creator", label: "Creator", nav: "Creator", kind: "section", tone: "light", scroll: 1.6, wipe: 0.625, linear: true,
    panels: [
      { id: "pitch", from: 0.12, to: 1, side: "left", look: "statement", eyebrow: "YouTube & Instagram", title: "I teach this", body: PLACEHOLDER },
      { id: "latest", from: 0.2, to: 1, side: "right", eyebrow: "Latest", title: "Fresh off the desk" },
    ],
  },
  {id:"about",label:"Background",nav:"Background",kind:"section",tone:"dark",scroll:6,wipe:0,
    panels:[{id:"about",from:0,to:1,side:"left",title:"Background",body:PLACEHOLDER}],dial:{experiences:[],projects:[]}},
  // What I build: five capabilities; one existing journey scroll clock.
  { id: "toolkit", label: "What I build", nav: "What I build", kind: "section", tone: "dark", scroll: 5.6, build: DEFAULT_BUILD },
];

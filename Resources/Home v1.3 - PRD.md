# Home v1.3 — About constellation, Experience journey, My story

Status: draft for sign-off (2026-11-14). Settled in the grill-me session of 2026-11-14 (decision log: Claude project doc `claude/personal-website-content-drafts-home-v1.3-grill.md`). Builds **after** Content Drafts (`Resources/Content Drafts - PRD.md`, gate TKT-108); all new content is entered through Content Drafts, so this build adds no editor screens.

**Problem:** About is a heading, a paragraph and a sliding 3-photo strip; Experience is one role per screen beside a Westminster photo. Neither tells Jamie's story (biomedical engineering → ML → production systems and AI) the way the Delta Cafés homepage tells theirs. There is also no place for the longer story behind the move.

**Outcome and completion:** The homepage reads Hello → About → Experience → Work → Techstack → Creator → Contact Us. About is a Delta-style constellation of Jamie's photos with a "Read my story" link to a new My story page at `/about`. Experience is a curved journey through Imperial → KOLN3D → Global Relay → Projects, with Jamie's mascot walking along it, handing into Work. Done when it is live, works on desktop, 390 px phones and reduced motion, and Jamie confirms it.

## Scope

**In:**
1. **Order and navigation.** Homepage order Hello → About → Experience → Work → Techstack → Creator → Contact Us; the Journey dropdown follows it and uses `#` jumps. Top bar: Journey · **My story** (`/about`) · Projects · Articles · Resources · Privacy. Homepage About anchor becomes `#about`; `#pivot` keeps working.
2. **About (Delta "Since 1961" structure, site's current light colours; recolour later).**
   - Title (database): "From BioEngineering to AI Engineering", shown narrow all-caps with the connector word small and italic (FROM BIOENGINEERING *to* AI ENGINEERING), styling done in code.
   - About 3 lines of text: the current first About paragraph trimmed; the second paragraph moves to My story.
   - Pill button "Read my story" with a round arrow → `/about`.
   - Constellation: the Imperial-entrance graduation photo in the centre; the others slightly tilted around it, each joined to the centre by a thin curved line, inside one faint large circle; slight drift with mouse and scroll; hovering a photo shows its caption tag.
   - Any number of photos: 5–12 = full constellation, placed evenly; fewer than 5 = simpler layout (centre photo + short row); more than 12 = first 12 by order.
   - Photos come from a new **About photos** list in the database (image path, caption, alt text, order, "centre" flag on exactly one, public), managed through Content Drafts. The current three photos move into it.
3. **Experience (Delta "journey of coffee" structure, holds still while scrolling).**
   - One thin continuous line drawn through large outlined stop circles, each with a built-in line icon and a short label. The line draws as you scroll; the current stop lights up and a card below shows title, organisation, dates and up to 3 public bullets (from the CV).
   - Stops = CV entries with a new **"Show on journey"** flag and **icon** choice, oldest → newest, then a fixed **Projects** stop (rocket) whose card says "See the work ↓" and leads into Work. Layout computed for 3–6 stops; over 6, the newest 5 ticked entries + Projects. An entry whose dates end "present" gets a gently pulsing ring.
   - Current stops: Imperial (graduation cap) → KOLN3D (neural network) → Global Relay (three incoming lines merging into one node with a plug: ingestion + MCP) → Projects (rocket). Built-in icon set of about 8 line icons; no logos.
   - DataKind UK stays public on the CV but off the curve.
   - Background: generated art in the hero style with Jamie's mascot, in **two layers**: a path scene (clouds on the left down into London on the right, path in the lower third, calm middle, no text/icons/stops) and a transparent **mascot cut-out** walking, which moves along with the line's progress so it reaches each stop as it lights; background drifts slightly. GSAP, no video. Day only for now. Until the art exists, a plain section background is used.
4. **Work:** featured projects only = Cyterly AI and DataKind UK (volunteer project with a "Volunteer" tag); FinAI unfeatured. The content changes happen through Content Drafts (TKT-108); this build only checks the Work section shows them correctly.
5. **My story page `/about`** (replaces today's redirect to the homepage).
   - Editorial single column (~680 px), large title in the About display style, chapters from `##` headings, full-width captioned photos, occasional pull quote, ends "Get in touch →" to the contact form. Plain page, site colours, follows the theme.
   - Content: a new homepage section key **story** (Markdown), entered through Content Drafts.
   - Before Jamie writes it: About heading + both current About paragraphs + "More of the story is on its way."
   - Suggested outline for Jamie (guidance only): What sparked it → Learning to build → Production → What I want to build next → Outside work.
6. **Retired:** About 3-photo strip, Experience Westminster still and timeline dots, the three.js wireframe behind About and Experience (it stays behind Work and Creator).
7. **Phones (390 px) and reduced motion.**
   - About on phones: heading and text, centre photo, then a swipeable row of tilted prints with captions shown under each.
   - Experience on phones: the curve runs vertically, each stop's card under it, no holding still; the mascot phone still (9:16) at the top.
   - Reduced motion / no JavaScript: finished state everywhere (no drift, line fully drawn, all cards visible, mascot mid-path). Nothing needs hover or scrolling to be readable.

**Later:** night versions of the Experience art and a site-wide recolour; redoing the old editors (TKT-99).

**Reuse:** journey engine (`components/journey/journey.tsx`, `lib/journey/chapters.ts`, `content.ts`, `phone.ts`), GSAP + Lenis, existing CV data (`lib/experience.ts`), `home-media` bucket + media manifest/service worker, contact form, site navigation, Content Drafts allowlist/preview for every new field.

## Canonical locations/data

- Code: this repo. Spec: this file. Prompts: `Resources/Prompts - Home v1.3.md` (build prompts + 3 image prompts). Tickets: Notion Tickets data source, project `40858664-d2d2-8191-b83d-f677a1e28165`; map in `Resources/Tickets - Dependency Map.md`.
- Database (one new migration): About photos table (public read of public rows, owner-only write); `experience_items` gains show-on-journey flag + icon (limited to the built-in icon names); `site_sections` gains the `story` key. Content Drafts allowlist entries for all of these.
- Media: About photos in the `home-media` bucket; Experience art (background, mascot cut-out, phone still) as approved public artwork in `home-media` with manifest hashes (not Git). Raw files in `Personal Website/Media/`.

## Constraints

- Personal copy and photos live in the database/Storage, never Git; Claude never invents personal claims.
- Only the owner changes content, through Content Drafts or existing editors; RLS enforces it.
- Copy Delta's layout and motion ideas only — no Delta copy, images, icons or code.
- Animate transform/opacity only; keep the homepage pre-rendered; preserve pause/reverse scrolling and fallbacks; no new runtime dependencies beyond what is installed (GSAP, Lenis, three.js).
- Migration tested locally and applied live only after Jamie says "apply it". Jamie pushes; ChatGPT builds from per-ticket prompts following `AGENTS.md` and `docs/`.
- Image generation is done by Jamie in ChatGPT from Claude's prompts; Claude checks each file before it is used.

## Build plan

1. **Gate:** Content Drafts live and verified (TKT-108).
2. **Data:** one migration (About photos table, journey flag + icon, `story` key) with policy tests, plus Content Drafts allowlist and preview entries for them. *Gate: "apply it".* Then Claude drafts the content sets (About title/text, journey flags/icons, existing three photos into About photos with captions, starter story) for Jamie to approve.
3. **Order, anchors and navigation:** new section order, `#about` (+ `#pivot` alias), Journey dropdown order, My story link in the top and floating bars, retirements (photo strip, Westminster still, timeline dots, wireframe on About/Experience).
4. **About constellation** (desktop, phone row, reduced motion) reading About photos.
5. **Experience journey** (curve, stops, cards, line drawing, hold while scrolling, Projects hand-off; vertical phone layout; reduced motion) with a plain background placeholder.
6. **Mascot art** (parallel, any time): Jamie generates the 3 images from the prompts; Claude checks them; they are uploaded to `home-media` and added to the media manifest.
7. **Mascot integration:** background + walking mascot synced to stops; phone still; reduced-motion placement.
8. **My story page** at `/about` (editorial layout, starter state, "Get in touch").
9. **Verification and launch:** desktop + 390 px + reduced motion checks, Jamie's live review.

## Verification and handoff

- Database policy tests for the migration; unit tests for stop layout (3–6 stops, >6 rule, present ring), constellation placement (counts 1, 4, 5, 12, 13) and centre-photo choice.
- Browser tests at desktop and 390 px: no sideways scroll; About caption tags (hover on desktop, visible under photos on phones); "Read my story" reaches `/about`; every Experience stop card readable; keyboard focus reaches each stop and the button; Projects stop leads to Work; `#pivot` and `#about` both land on About; top bar shows My story.
- Reduced-motion run shows the finished state; static/ISR assertions unchanged; typecheck, full suite and production build per `docs/operations.md`.
- Update `docs/journey.md`, `docs/architecture.md`, `docs/status.md`, `MEMORY.md`. Record migration applied/pending.
- Rollback: the section order and components are code; reverting the deploy restores the previous homepage. Database additions are additive.

## Open questions

- None blocking. Exact component, table and column names are left to the build tickets.

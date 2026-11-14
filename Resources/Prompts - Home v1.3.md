# Prompts — Home v1.3

Two kinds of prompt here:
- **Image prompts (TKT-109):** paste into ChatGPT image generation. You can do these now.
- **Build prompts (TKT-110 → 116):** paste into ChatGPT with repo access, one at a time, only after Content Drafts is live (TKT-108). Order: **110 and 111** (either order) → **112, 113, 114** (any order) → **115** (needs 113 and the art) → **116**. Tell Claude when each lands.

---

## Image prompts (TKT-109)

For all three, attach two reference images in the same chat:
1. **Your mascot** (the MCP 101 slide, `slide-05.png`).
2. **The day hero art** (the cloud scene with your character and the creatures, from `Media/` or the live site).

Save what you keep into `Personal Website/Media/Experience-art/` as `experience-bg.png`, `experience-mascot.png` and `experience-phone.png`, then tell Claude to check them.

### 1. Background (no character)

```
Create a wide landscape illustration in exactly the same art style, lighting and colour palette as the second attached image (the cloud scene): warm, soft, painterly 3D, golden late-afternoon sunlight from the upper left, fluffy cream-and-peach clouds, blue sky.

Scene: a gentle winding path that starts high among the clouds on the far left and curves down and to the right into a softly detailed miniature London skyline on the far right (Thames, bridges, a few recognisable rooftops, low detail). The path is a soft glowing cream ribbon, like a walkway made of light, running mostly through the LOWER THIRD of the image.

Composition rules:
- No people, no characters, no animals, no creatures.
- No text, letters, numbers, signs, logos, icons or markers anywhere.
- Keep the MIDDLE band of the image calm and low-detail (soft sky and thin clouds), because text and a thin line will be drawn on top of it later.
- Keep important details away from the top and bottom 10% of the image; it will be cropped to 16:9.
- Make it as wide as possible (landscape).
```

### 2. Mascot cut-out (transparent)

```
Using the first attached image as the exact character reference, create the same young man character: messy dark-brown hair, pink-tinted rimless sunglasses, cream padded jacket with snap buttons over a black hoodie, black loose trousers, white trainers, friendly confident expression.

Pose: full body, walking to the RIGHT in a relaxed mid-stride, three-quarter view, arms swinging naturally, no objects in his hands.

Style: match the soft painterly 3D style and warm golden late-afternoon light from the upper left of the second attached image, so he fits into that world.

Output: transparent background (PNG with alpha), nothing else in the image: no ground, no shadow, no props, no text. Character fills most of the height with a little margin all round. Portrait orientation.
```

### 3. Phone still (9:16, character in scene)

```
Create a tall portrait illustration (as close to 9:16 as possible) in exactly the same art style, lighting and colours as the second attached image: warm painterly 3D, golden late-afternoon light from the upper left, fluffy cream-and-peach clouds, blue sky.

Scene: the same glowing cream winding path from clouds down into a soft miniature London skyline, arranged vertically: clouds and sky in the upper part, the path winding down through the middle, London at the bottom.

Place the character from the first attached image (exact same look: messy dark-brown hair, pink-tinted sunglasses, cream jacket over black hoodie, black trousers, white trainers) walking along the path in the lower-middle of the image, small enough that the scene reads as a journey (about a quarter of the image height).

Rules: no text, letters, numbers, signs, logos, icons or markers. Keep the top third calm and simple (soft sky) because a title will sit there. No other characters or creatures.
```

---

## TKT-110 — Data: About photos list, journey flag + icon, story section

```
You are working in the jamieho-backroom repo (Next.js App Router + Supabase). First read AGENTS.md, docs/README.md, docs/status.md, docs/security.md, docs/journey.md and docs/operations.md, and follow them (Jamie pushes; never push; new migrations only; never apply a migration live until Jamie says "apply it"; Jamie handles secrets; update docs/ and MEMORY.md after the change). Specs: Resources/Home v1.3 - PRD.md (this work) and Resources/Content Drafts - PRD.md (already built). Ticket: TKT-110.

Build:
1. One migration:
   - New About photos table: id, path (file in the home-media bucket), caption, alt, sort, centre boolean, public boolean, timestamps. RLS: anyone can read public rows; only the owner (existing owner check) can insert/update/delete. Enforce at most one centre=true row (partial unique index).
   - experience_items: add a show-on-journey boolean (default false) and a journey icon text column limited (check constraint) to the built-in icon names: graduation-cap, microscope, neural-network, streams-plug, code, heart-hands, rocket, briefcase.
   - site_sections: extend the key check constraint and lib/sections.ts SECTION_KEYS with 'story' (fallback title "My story", empty body).
   - Database policy tests for all of the above in tests/db.
2. Loaders: a public About photos loader (public rows, by sort, centre first) and a journey-stops loader (public experience items with show-on-journey, oldest → newest by their dates/sort, with up to 3 public bullets each).
3. Content Drafts: add the About photos table, the two new experience_items fields and the 'story' key to lib/content-drafts/allowlist.ts and the SQL apply function's allowlist, with preview overlay support in the new loaders.

Do not change the homepage layout yet, the existing About photo strip, or any live data.

Done when:
- Policy tests pass (public read of public photos only; owner-only writes; one centre max; invalid icon refused).
- Loader unit tests pass (ordering, centre first, oldest → newest stops, ≤3 bullets).
- Content Drafts can draft and preview the new fields (tests).
- Typecheck, full suite, build and static assertions pass.
- docs/security.md, docs/architecture.md, docs/status.md, MEMORY.md updated; migration recorded as NOT applied. Stop and ask Jamie before applying it.

Report: files changed, migration name, checks actually run and results.
```

---

## TKT-111 — New order, #about anchor, My story link, retirements

```
You are working in the jamieho-backroom repo. First read AGENTS.md, docs/README.md, docs/status.md, docs/journey.md and docs/architecture.md and follow them. Spec: Resources/Home v1.3 - PRD.md. Ticket: TKT-111.

Build:
1. lib/journey/chapters.ts: order Hello (sky) → About → Experience → Work (projects) → Techstack → Creator → Contact Us. Rename the About chapter's id/anchor to "about" and keep "#pivot" working as an alias (scroll handling, nav jumps, static fallback ids, legacy redirects that point to /#pivot).
2. Journey dropdown (components/site-navigation.tsx JOURNEY items) in the same order, all # jumps.
3. Top bar and floating bar: Journey · My story (/about) · Projects · Articles · Resources · Privacy. /about may 404 or keep its redirect until TKT-114 lands; the link must exist now.
4. Retire: the About photo strip (components/journey/about-photos.tsx usage), the Experience Westminster still and timeline dots, and the three.js wireframe on About and Experience (lib/journey/lines.ts SHAPE_BY_CHAPTER keeps only Work and Creator). Leave the About and Experience text panels working until TKT-112/113 replace them.

Do not change Hero, Work showcase, Techstack, Creator or Contact Us behaviour.

Done when:
- Homepage, phone mode and the reduced-motion still version show the new order.
- /#about and /#pivot both land on About; dropdown order matches.
- My story link visible in both bars at desktop and 390 px with no overflow.
- Retired elements are gone; Work/Creator wireframe unchanged.
- Typecheck, unit tests, build, static assertions and journey browser tests pass (update tests that assumed the old order).
- docs/journey.md, docs/architecture.md, docs/status.md, MEMORY.md updated.

Report: files changed, checks actually run and results.
```

---

## TKT-112 — About constellation

```
You are working in the jamieho-backroom repo. First read AGENTS.md, docs/README.md, docs/status.md and docs/journey.md and follow them. Spec: Resources/Home v1.3 - PRD.md (section "About"). Ticket: TKT-112. Requires TKT-110 and TKT-111.

Reference (layout and motion only; do not copy any text, images or code): the "Since 1961, coffee that awakens stories" section on deltacafes.com/en. It shows a huge narrow all-caps heading with one small italic connector word, a pill button with a round arrow, a short paragraph, and below it one large central photo inside a faint giant circle with about 12 smaller items around it, each slightly tilted and joined to the centre by a thin curved line, drifting slightly with mouse and scroll, with a small dark caption tag on hover.

Build the About section in the site's current light colours:
1. Heading from site_sections.about title, rendered in a narrow display face, all caps, with the connector word "to" small and italic (generic rule: style a lone lowercase connector word such as to/of/that/and between capitalised words). Body: first paragraph of site_sections.about (~3 lines). Pill button "Read my story" with a round arrow → /about.
2. Constellation from the About photos loader: centre photo large in the middle; others placed evenly around a faint circle by a pure, unit-tested layout function (input: count, viewport size → positions, tilt −6°..6°); thin curved SVG lines from each photo to the centre; slight drift with mouse and scroll (GSAP, transform only); caption tag on hover/focus. Counts: 5–12 full layout; <5 simpler layout (centre photo + short row); >12 use the first 12.
3. Phones (≤768 px): heading and text, centre photo, then a horizontal swipeable row of tilted prints with captions under each.
4. Reduced motion / no JS: same layout, no drift, captions visible on focus/under photos.
5. Images use the existing home-media URL + manifest/versioning approach with alt text from the database.

Done when:
- Unit tests for the layout function with 1, 4, 5, 12 and 13 photos and centre selection.
- Browser tests at desktop and 390 px: no sideways scroll; caption on hover (desktop) and visible (phone); "Read my story" reaches /about; keyboard focus reaches each photo and the button.
- Reduced-motion run shows the finished layout; static assertions unchanged.
- docs/journey.md, docs/status.md, MEMORY.md updated.

Report: files changed, checks actually run and results.
```

---

## TKT-113 — Experience journey curve

```
You are working in the jamieho-backroom repo. First read AGENTS.md, docs/README.md, docs/status.md and docs/journey.md and follow them. Spec: Resources/Home v1.3 - PRD.md (section "Experience"). Ticket: TKT-113. Requires TKT-110 and TKT-111.

Reference (layout and motion idea only; no copying): "The journey of coffee" section on deltacafes.com/en — one thin continuous line snaking down and up through four large outlined circles, each holding a line-art icon with a short label underneath.

Build the Experience chapter:
1. Stops from the journey-stops loader (oldest → newest) plus a fixed final "Projects" stop (rocket icon). A pure, unit-tested layout function places 3–6 stops along a wave and returns the SVG path; with more than 6 entries use the newest 5 + Projects.
2. Built-in line-icon set (inline SVG components, one stroke style): graduation-cap, microscope, neural-network, streams-plug (three incoming lines merging into one node with a plug on the outgoing side), code, heart-hands, rocket, briefcase. Icon comes from the entry's journey icon field.
3. The chapter holds still while scrolling. The line draws progressively (stroke-dashoffset, scroll-driven, reversible). The current stop lights up (accent colour) and a card below shows title, org, dates and up to 3 public bullets. An entry whose dates end in "present" (case-insensitive) gets a gently pulsing ring. The Projects card reads "See the work ↓" and links to #projects (Work).
4. Plain section background for now (TKT-115 adds the art); keep a layer ready behind the curve for it.
5. Phones (≤768 px): vertical curve snaking down, each card directly under its stop, no holding still. Reduced motion / no JS: line fully drawn, all cards visible.

Done when:
- Unit tests for stop layout with 3, 4, 6 and 7 entries and the present ring.
- Browser tests at desktop and 390 px: every card readable, keyboard focus reaches each stop, Projects stop leads to Work, no sideways scroll, scrolling up reverses cleanly.
- Reduced-motion finished state; static assertions unchanged.
- docs/journey.md, docs/status.md, MEMORY.md updated.

Report: files changed, checks actually run and results.
```

---

## TKT-114 — My story page at /about

```
You are working in the jamieho-backroom repo. First read AGENTS.md, docs/README.md, docs/status.md and docs/architecture.md and follow them. Spec: Resources/Home v1.3 - PRD.md (section "My story page"). Ticket: TKT-114. Requires TKT-110 and TKT-111.

Build:
1. Replace the /about redirect with a pre-rendered page (revalidated on approve via Content Drafts' route list) using the shared site navigation and plain app-page shell, site colours, following the theme.
2. Editorial layout: single centred column (~680 px), large title in the same narrow display style as the homepage About heading, chapters from ## headings in site_sections.story (Markdown via the existing renderer), full-width images with captions, blockquotes styled as pull quotes, ending with "Get in touch →" linking to the homepage contact form anchor.
3. Starter state when the story body is empty: the About title, both current About paragraphs, then "More of the story is on its way."
4. Metadata: title "My story · Jamie Ho".

Do not change the homepage About section (TKT-112) or the contact form.

Done when:
- /about renders the story or starter state at desktop and 390 px with no sideways scroll.
- "Get in touch" reaches the contact form.
- A story change approved through Content Drafts updates /about without a redeploy.
- Static assertions include /about; typecheck, suite, build and browser tests pass.
- docs/architecture.md, docs/status.md, MEMORY.md updated.

Report: files changed, checks actually run and results.
```

---

## TKT-115 — Mascot walks the journey

```
You are working in the jamieho-backroom repo. First read AGENTS.md, docs/README.md, docs/status.md and docs/journey.md and follow them. Spec: Resources/Home v1.3 - PRD.md (Experience background). Ticket: TKT-115. Requires TKT-113 and the approved art from TKT-109 (experience-bg, experience-mascot, experience-phone in the home-media bucket and the media manifest; ask Jamie for the exact file names if they are not in lib/journey/media-manifest.json).

Build:
1. Behind the Experience curve: the background image covering the section with a slight scroll drift (transform only).
2. The transparent mascot moves along a guide path derived from the stop layout, in step with the line's progress, arriving at each stop as it lights up; forwards and backwards. Optional subtle bob while moving. Transform/opacity only.
3. Phones: the 9:16 still at the top of the section, no moving layers, no clip downloads. Reduced motion / no JS: background plus mascot placed mid-path, no movement.
4. Use the existing media URL + manifest hashing and service worker; preload sensibly so the section never shows a blank background.

Done when:
- Mascot reaches each stop as its card lights, in both scroll directions (browser test with stop positions).
- Phone shows the still with no extra downloads; reduced motion is static.
- No layout shift or sideways scroll; static assertions unchanged.
- docs/journey.md, docs/status.md, MEMORY.md updated.

Report: files changed, checks actually run and results.
```

---

## TKT-116 — Gate: verify and launch

```
You are working in the jamieho-backroom repo. First read AGENTS.md, docs/README.md, docs/status.md and docs/operations.md and follow them. Spec: Resources/Home v1.3 - PRD.md. Ticket: TKT-116.

Run the full verification for Home v1.3 and fix only genuine defects you find (no new features):
- Typecheck, full unit/database suite, production build, static assertions, full browser suite at desktop and 390 px.
- Reduced-motion and no-JavaScript runs of / and /about.
- Work section shows exactly the featured projects (Cyterly AI and DataKind UK with its Volunteer tag).
- /#about, /#pivot, /about, Journey dropdown and the My story link all behave as specified.
Update docs/journey.md, docs/architecture.md, docs/status.md and MEMORY.md to the final state, and list every check with its actual result. Then stop: Jamie pushes and reviews live.
```

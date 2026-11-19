# Prompts — Home v1.3

Updated 2026-11-16 for the current site (Interview Prep nav, Privacy out of nav, Content Drafts live, art already uploaded).

- **Image prompts (TKT-109): done.** Art is in the home-media bucket as `experience-bg.webp`, `experience-mascot.webp`, `experience-phone.webp` (raw files in `Personal Website/Media/Experience-art/`).
- **Build prompts:** paste into ChatGPT one at a time, strictly in this order (they share journey files): **110 → (Jamie: "apply it") → 110b → 111 → 112 → 113 → 114 → 115 → 116**. Tell Claude when each lands for review.
- ChatGPT does all execution, including live content drafts. Claude plans and reviews only.

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
You are working in the jamieho-backroom repo (Next.js App Router + Supabase). First read AGENTS.md, docs/README.md, docs/status.md, docs/security.md, docs/journey.md and docs/operations.md, and follow them (Jamie pushes; never push; new migrations only; never apply a migration live until Jamie says "apply it"; Jamie handles secrets; update docs/ and MEMORY.md after the change). Specs: Resources/Home v1.3 - PRD.md (this work) and docs/content-drafts.md (already built). Ticket: TKT-110.

Build:
1. One migration:
   - New About photos table: id, path (file in the home-media bucket), caption, alt, sort, centre boolean, public boolean, timestamps. RLS: anyone can read public rows; only the owner (existing owner check) can insert/update/delete. Enforce at most one centre=true row (partial unique index).
   - experience_items: add a show-on-journey boolean (default false) and a journey icon text column limited (check constraint) to the built-in icon names: graduation-cap, microscope, neural-network, streams-plug, code, heart-hands, rocket, briefcase.
   - site_sections: extend the key check constraint and lib/sections.ts SECTION_KEYS with 'story' (fallback title "My story", empty body).
   - Database policy tests for all of the above in tests/db.
2. Loaders: a public About photos loader (public rows, by sort, centre first) and a journey-stops loader (public experience items with show-on-journey, oldest → newest by their dates/sort, with up to 3 public bullets each).
3. Content Drafts: add the About photos table (insert/update/delete), the two new experience_items fields and the 'story' key to lib/content-drafts/allowlist.ts and the SQL apply function's allowlist, with preview overlay support in the new loaders.
4. Photo slots: extend the existing TKT-107 photo-slot support (lib/content-drafts/photo-slots.ts + private.apply_draft_photos) with a second target: bucket home-media → a new About photos row (slot carries caption/alt/sort; path written on approve). Same file rules, exact-filename check, drafts/<set id>/<slot>/ upload prefix and approve-blocked-until-filled behaviour. Keep the canonical URL prefix logic shared between TS and SQL.

Do not change the homepage layout yet, the existing About photo strip, or any live data. Existing About images in home-media: about-imperial-graduation.jpg, about-graduation-hall.jpg, about-jungfraujoch.jpg.

Done when:
- Policy tests pass (public read of public photos only; owner-only writes; one centre max; invalid icon refused).
- Loader unit tests pass (ordering, centre first, oldest → newest stops, ≤3 bullets).
- Content Drafts can draft and preview the new fields, and a home-media About-photo slot blocks approve until filled, then creates the row (tests).
- Typecheck, full suite, build and static assertions pass.
- docs/security.md, docs/architecture.md, docs/status.md, MEMORY.md updated; migration recorded as NOT applied. Stop and ask Jamie before applying it.

Report: files changed, migration name, checks actually run and results.
```

---

## TKT-110b — Starter content drafts (only after Jamie says "apply it" for TKT-110 and it is applied)

```
You are working in the jamieho-backroom repo. Read AGENTS.md, docs/README.md, docs/status.md and docs/content-drafts.md first. Spec: Resources/Home v1.3 - PRD.md. Ticket: TKT-110 (content step). The TKT-110 migration must already be applied live; if not, stop.

Create live Content Drafts change sets (content_changes rows with summary + operations only; never set status, approved_at or approved_by; Jamie approves on /manage/review). One set per item so Jamie can approve them separately:
1. "About photos: move the current three into the new list" — insert About photos rows for about-imperial-graduation.jpg (centre=true, sort 0), about-graduation-hall.jpg (sort 1), about-jungfraujoch.jpg (sort 2), public=true. Captions/alt: short and literal from what each image shows; no invented claims (Jamie corrects by asking).
2. "Experience journey stops" — on experience_items set show-on-journey + icon: Imperial → graduation-cap, KOLN3D → neural-network, Global Relay → streams-plug. DataKind UK stays off the journey. Look the rows up by org; do not change any other field.
3. "About text trimmed to ~3 lines" — update site_sections key about body to the current first paragraph trimmed to about three lines, keeping Jamie's wording (cut, don't rewrite). Title unchanged.
Leave site_sections story empty (the page shows its starter state).

Before inserting, read back the live rows you reference. After inserting, read back each set's id/summary/status = draft. No other live change. Update docs/status.md and MEMORY.md (one line). Report: set ids and summaries, read-back results.
```

---

## TKT-111 — New order, #about anchor, My story link, retirements

```
You are working in the jamieho-backroom repo. First read AGENTS.md, docs/README.md, docs/status.md, docs/journey.md and docs/architecture.md and follow them. Spec: Resources/Home v1.3 - PRD.md. Ticket: TKT-111.

Build:
1. lib/journey/chapters.ts: order Hello (sky) → About → Experience → Work (projects) → Techstack → Creator → Contact Us. Rename the About chapter's id/anchor to "about" and keep "#pivot" working as an alias (scroll handling, nav jumps, static fallback ids, legacy redirects that point to /#pivot).
2. Journey dropdown (components/site-navigation.tsx JOURNEY items) in the same order, all # jumps.
3. Top bar and floating bar: Journey · My story (/about) · Projects · Interview Prep · Articles · Resources (Privacy stays out of navigation, in the Contact form only; keep the icon theme switch and review badge). /about may keep its redirect until TKT-114 lands; the link must exist now.
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
You are working in the jamieho-backroom repo. First read AGENTS.md, docs/README.md, docs/status.md and docs/journey.md and follow them. Spec: Resources/Home v1.3 - PRD.md (Experience background). Ticket: TKT-115. Requires TKT-113. Approved art is already in the home-media bucket: experience-bg.webp (background), experience-mascot.webp (transparent walking mascot), experience-phone.webp (9:16 phone still). Add them to the media manifest with hashes; raw originals are in Personal Website/Media/Experience-art/ (not Git).

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
- Content Drafts preview still outlines About photos, journey stops and story changes on / and /about.
- /#about, /#pivot, /about, Journey dropdown and the My story link all behave as specified.
Update docs/journey.md, docs/architecture.md, docs/status.md and MEMORY.md to the final state, and list every check with its actual result. Then stop: Jamie pushes and reviews live.
```

---

## About polish 1 — Photos: two uni-activity About photos + one DataKind UK screenshot (Content Drafts photo slots)

```
You are working in the jamieho-backroom repo. Read AGENTS.md, docs/README.md, docs/status.md and docs/content-drafts.md (photo slots, About photos) first. No code change in this step.

Jamie has attached three photos:
- the Google Developer Student Clubs "DevFest on Campus 2023" group photo (JPG) → About photo
- IMG_4362.HEIC → About photo
- IMG_5308.HEIC → DataKind UK project screenshot (NOT an About photo)

1. Save the originals unchanged: About ones in "Personal Website/Media/Uploads/2026-11-17-about-uni-activities/", IMG_5308 in "Personal Website/Media/Uploads/2026-11-17-datakind-uk-screenshot-2/" (outside the repo, never Git).
2. Web copies beside each original: JPG, longest side 1600 px, under 1 MB, EXIF/GPS stripped, orientation applied, no cropping. Names: about-gdsc-devfest-2023.jpg; about-<short-literal-subject>.jpg for IMG_4362; datakind-uk-2.jpg for IMG_5308. Show Jamie the names.
3. Create two live Content Drafts sets (summary + photo_slots only; never set status/approval fields; read each back as draft):
   a. "About photos: two university activities" — two home-media About-photo slots, sort 3 and 4, public, not centre. Caption/alt short and literal (DevFest: "Google Developer Student Clubs · DevFest on Campus 2023"); never invent roles or claims.
   b. "DataKind UK: second screenshot" — one project-media slot appending to projects.screenshots of slug datakind-uk (keeps datakind-uk-1.png first).
4. Tell Jamie: open /manage/review, drop each file into its slot, preview, approve. After he approves, verify read-only: about_photos has five public rows; DataKind UK has two screenshots in order. Report.
Add one MEMORY.md line.
```

---

## About polish 2 — Background preview ONLY (standalone HTML, no website change)

```
You are working in the jamieho-backroom repo. Read AGENTS.md, docs/README.md and docs/journey.md first. Do NOT change any repo file in this step.

Goal: show Jamie what the About background will look like before touching the site. Build ONE self-contained HTML file at "Personal Website/Media/Previews/about-background-preview.html" (outside the repo). Inline CSS/JS; GSAP from a CDN is fine for the preview. Recreate the current About section faithfully: eyebrow ABOUT, heading "FROM BIOENGINEERING to AI ENGINEERING" in the same narrow display face and sizes, the About paragraph, the "Read my story" pill, warm off-white background, and the photo constellation with FIVE photos (the three current About photos from the public home-media URLs and the two new web copies from Media/Uploads/2026-11-17-about-uni-activities/ by relative path; Imperial graduation in the centre). Use the eyebrow BACKGROUND (renamed from About).

Add the two background layers:
A. Orbit rings: replace the single tiny circle with 2–3 concentric rings centred on the centre photo — inner ring solid hairline, outer rings dotted — sized so the ring is clearly larger than the centre photo and the side photos sit on/near the outer ring. About 12–18% ink opacity. Keep the thin curved connector lines.
B. Story line: ONE continuous ink line in the empty areas only (never behind the heading, paragraph, button or photos): starts bottom-left as a small DNA double helix, flows into a circuit trace (right angles + solder dots), ends as a small neural-network cluster (5–8 nodes) on the right. ~6–10% opacity, 1–1.5 px stroke, same ink colour as the text. Draws itself once (stroke-dashoffset) when the section scrolls into view, then holds still.

Controls at the top of the preview (not part of the design): toggles A on/off, B on/off, opacity slider for each, desktop/390 px width switch, reduced-motion switch (shows line fully drawn), replay draw button. Day theme only.

Then stop and send Jamie the file path. Report what you built; no checks claimed for the website.
```

---

## About polish 3 — Background section: rings + a real background (preview v2, then apply)

```
You are working in the jamieho-backroom repo. Read AGENTS.md, docs/README.md, docs/status.md and docs/journey.md first and follow them (Jamie pushes; update docs/ + MEMORY.md after). Two phases; STOP between them.

The Background section sits between two illustrated sky scenes (hero clouds and the Experience cloud-to-London art), so it must contrast with them: no sky blues or cloud gradients. Jamie's decisions from the first preview: orbit rings ON at 30% opacity; story line REMOVED. His main problem: the section background is flat off-white and looks unfinished.

PHASE 1 — preview v2 (no repo change). Update "Personal Website/Media/Previews/about-background-preview.html" (keep the faithful Background section with the 5 live photos and rings at 30%; delete the story line and its controls). Add a "Background" preset switcher:
- P1 Linen: flat warm cream (≈#F1E9DC), slightly deeper at the edges (soft vignette), no sky colours.
- P2 Warm sand + glow: sand base (≈#EFE6D6) with two large blurred colour fields — soft gold behind the heading, soft terracotta/rose behind the photo constellation (no sky blue) — drifting very slowly (transform only; still under reduced motion).
- P3 Ink editorial: deep navy (the top-bar navy) with light text, photos as white prints, rings in light ink, gold accent on the eyebrow and button.
Independent overlay toggles usable with any preset: fine film grain (SVG noise, 3–6%), faint dot grid fading to the edges, a huge outlined watermark word "BACKGROUND" behind the photos (≈4% opacity, never behind the paragraph).
Show the sections above and below (the hero cloud bottom edge and the start of Experience) as plain bands so Jamie can judge the transitions. Desktop / 390 px / reduced-motion switches as before. Keep text contrast ≥ 4.5:1 in every preset (show the measured ratio in the control panel). Then STOP and send Jamie the path.

PHASE 2 — only after Jamie replies with his pick ("P_ + overlays"). Port exactly that into the homepage Background section and /about (same background family, quieter): rings at 30% from the pure layout function (unit-tested for 1, 4, 5, 12 photos) replacing the single circle; chosen preset and overlays as CSS/inline SVG only (no images, no new dependencies); night theme gets a matching dark variant; seamless transitions into the hero above and Experience below; reduced motion = no drift. Done when: browser tests at desktop and 390 px show no overlap of decorations with heading/paragraph/button, no sideways scroll, contrast checks pass; typecheck, suite, build and static assertions pass; docs/journey.md, docs/status.md, MEMORY.md updated. Report checks actually run.
```

---

## Home polish 4 — Navigation regroup, "Background" label, JH favicon, PassLoop logo, Work screenshot carousel

```
You are working in the jamieho-backroom repo. Read AGENTS.md, docs/README.md, docs/status.md, docs/journey.md, docs/architecture.md and docs/interview.md first and follow them (Jamie pushes; update docs/ + MEMORY.md after). No schema or live data change.

Jamie has attached two logo images: the JH monogram (white "JH" between < > on navy) and the PassLoop logo (white infinity loop + green check, wordmark "Pass" white / "Loop" green, on navy).

1. Brand files: save the originals unchanged in "Personal Website/Media/Brand/" (outside the repo). Recreate both as clean, hand-built SVGs that match the images (flat shapes, no raster tracing noise): jh-mark.svg, passloop-mark.svg (loop + check only) and passloop-wordmark.svg. These are Jamie's own public brand marks, so the SVGs may be committed in the repo (e.g. public/brand/). Note the exception in docs/security.md.
2. Favicon: the site tab uses the JH mark on navy (Next app/icon.svg + apple-icon PNG 180×180 and a 32×32 fallback). Make sure it reads at 16 px. /interview pages use the PassLoop mark as their tab icon instead (route-level icon metadata).
2b. Top-bar logo button (shared and floating bars, left end): replace the yellow terminal icon with the JH mark, same button size and home link, readable in light/dark/Auto.
3. PassLoop logo: in the /interview rail, the brand shows passloop-mark + wordmark when expanded and the mark only when collapsed; keep the home link, tooltip and document titles. Dark theme only, as today.
4. Homepage section rename: the About section is now called "Background" — eyebrow text, Journey dropdown label, chapter label and static fallback. Keep the anchors #about and #pivot working and add #background as an alias. The heading text from the database is unchanged.
5. Top bar and floating bar, in this order: Journey ▾ (unchanged list, About renamed Background) · My story ▾ (About → /about, Projects → /projects) · Content ▾ (Articles → /articles, Resources → /resources) · Interview Prep (→ /interview). Reuse the existing Journey dropdown component/behaviour (hover + click, keyboard, Escape, SVG chevron) for both new dropdowns; feedback, theme, review badge and sign-in controls unchanged. Phone menu gets the same grouping. Active-page highlighting still works for /about, /projects, /articles, /resources.
6. Work section: when a featured project has more than one screenshot, show them as a horizontal carousel (swipe/drag on touch, arrow buttons + dots on desktop, scroll-snap, keyboard arrows) instead of the current vertical pan. One screenshot = static image as now. Same carousel on /projects/[slug] if it currently pans vertically. Transform/scroll-snap only; no new dependency; reduced motion = no animated slide.

Done when: top-bar logo button shows JH; favicon shows JH on / and PassLoop on /interview (check generated <link rel="icon"> tags); rail shows the PassLoop logo expanded/collapsed; nav order/dropdowns work by mouse, keyboard and on a 390 px phone with no overflow; #background, #about and #pivot all land on the section; DataKind UK's two screenshots scroll left↔right in Work at desktop and 390 px; typecheck, full suite, build, static assertions and browser tests pass (update tests that assumed the old nav); docs/journey.md, docs/architecture.md, docs/interview.md, docs/status.md, MEMORY.md updated. Report checks actually run.
```

---

## Home polish 5 — Work screenshots: scroll-driven sideways, frame fits the image, real traffic lights

```
You are working in the jamieho-backroom repo. Read AGENTS.md, docs/README.md, docs/status.md and docs/journey.md first and follow them (Jamie pushes; update docs/ + MEMORY.md after). Follows Home polish 4. No schema or live data change.

Jamie's feedback on the Work section's browser-window screenshot frame:
1. Scroll drives it. While the Work chapter is pinned, the page's vertical scroll moves a multi-screenshot project's images left → right (scrubbed, reversible on scroll up), the same way the old vertical pan was scroll-driven. Clicking must not be required. Keep the dots as a position indicator (and clickable as a shortcut); remove or de-emphasise the arrow buttons on desktop. Single-screenshot projects stay static. Phones (≤768 px, no pinning): native horizontal swipe with scroll-snap and dots. Reduced motion / no JS: images in a swipeable row, no scrubbing.
2. Frame fits the image — no empty bands. Today Cyterly AI shows navy bands above and below the app, and DataKind UK shows dark bands left and right. The frame's content area must take the screenshot's own aspect ratio (read natural width/height on load, with a stored/assumed aspect fallback so there is no layout shift), so the image fills it edge to edge with object-fit: cover and nothing cropped meaningfully. When a project's screenshots share an aspect ratio (DataKind UK's two do), the frame stays that size while sliding. If they differ, size to the first image and contain the rest. First check whether Cyterly's bands are CSS letterboxing or baked into the bundled image; if baked in, trim the uniform border from that approved bundled asset (keep the original pixels otherwise) and note it in docs/journey.md. Cap the frame height to the viewport so it never overflows; keep it centred.
3. Window controls: the three dots top-left become macOS traffic lights — red #FF5F57, yellow #FEBC2B, green #28C840 — with a subtle darker ring, in light and dark themes.
Apply 2 and 3 everywhere this window frame is used (homepage Work and /projects/[slug] if it uses the same frame).

Done when: browser tests at desktop show DataKind UK moving from image 1 to image 2 purely by scrolling down, and back on scroll up; frame bounding box matches the image box (no bands) for Cyterly AI and DataKind UK at desktop and 390 px; traffic lights render in all three colours; no sideways page scroll; reduced-motion state passes; typecheck, full suite, build and static assertions pass; docs/journey.md, docs/status.md, MEMORY.md updated. Report checks actually run.
```

---

## Home polish 6 — Logos from the originals, PassLoop rail spacing

```
You are working in the jamieho-backroom repo. Read AGENTS.md, docs/README.md, docs/status.md and docs/interview.md first and follow them (Jamie pushes; update docs/ + MEMORY.md after). Follows Home polish 4/5. No schema or live data change.

1. Logos must come from Jamie's originals, not redrawn. The current JH SVG changed the shape (e.g. the gap to the right of the H is gone). Replace jh-mark.svg and the PassLoop SVGs with versions generated from the original images saved in "Personal Website/Media/Brand/":
   - Crop tightly to the mark, threshold the white (and the PassLoop green) shapes off the navy background, and auto-trace them (potrace or equivalent, already-installed tool or a dev-only one-off; no new runtime dependency) so the geometry is the original's. No manual redrawing or "cleaning up" of shapes; keep every gap and angle.
   - Prove fidelity: render the traced SVG at the original's size, overlay it on the original mark and report the pixel difference (target < 2% of mark pixels). Save the overlay PNG next to the originals for Jamie.
   - If the original is too low-resolution to trace cleanly, stop and ask Jamie for a larger original instead of guessing.
   - Regenerate the favicons (JH for the site, PassLoop mark for /interview) and the top-bar logo button from the traced files. In the round top-bar button the JH mark is wide, so size it by width (about 70% of the button's inner width), centred, not squeezed.
2. PassLoop rail, expanded: the wordmark is currently cut off ("PassLoo") by the collapse button. Lay the brand row out so the full PassLoop logo always shows: logo and collapse button side by side with a fixed gap, the logo scaled to the space left (never clipped or overlapped).
3. PassLoop rail, collapsed: the mark and the expand button currently overlap. Make the collapsed rail slightly wider (Jamie is fine with that) and stack them: the PassLoop mark on top, fully visible, and the expand button below it (or on the rail's outer edge), never covering the mark. Keep the stored collapse preference, tooltips, keyboard focus and the phone drawer unchanged.

Done when: the overlay diff for the JH and PassLoop marks is reported and under target; favicons and the top-bar button show the traced JH mark; browser tests at desktop check the expanded brand row shows the whole logo (bounding box inside the rail, no overlap with the collapse button) and the collapsed mark and expand button don't intersect; 390 px drawer unchanged; typecheck, suite, build and static assertions pass; docs/interview.md, docs/status.md, MEMORY.md updated. Report checks actually run.
```

---

## Home polish 7 — Dial: Background → Experience → Selected Work (replaces About polish 3, the Work section, the curve and the mascot)

```
You are working in the jamieho-backroom repo. Read AGENTS.md, docs/README.md, docs/status.md, docs/journey.md and docs/content-drafts.md first and follow them (Jamie pushes; update docs/ + MEMORY.md + docs/decisions.md after). About polish 3 is cancelled.

Approved design: "Personal Website/Media/Previews/home-dial-build-work.html" (the dial part, from the BACKGROUND eyebrow through the DataKind UK stop). Open it, scroll it at desktop and 390 px, and match it closely. Build it as ONE pinned homepage chapter replacing the current Background (About), Experience and Work chapters:
1. Look: navy ink editorial, off-white text, gold accents, film grain, fading dot grid, outlined "JAMIE HO" watermark behind the dial (never behind text), 30% rings with ticks, coordinate label, gold tags on leader lines, left index rail, divider, corner metadata "LONDON · HONG KONG" and "SECTION 02 / …". CSS + inline SVG only; no new dependencies (use the existing GSAP ScrollTrigger + Lenis setup for pinning/scrub).
2. Step 0 Background: heading/paragraph/Read my story left; photo constellation right (About photos loader, centre photo, others on the ring, tags from captions).
3. Experience stops from the journey-stops loader (Content Drafts editable): side photos slide out and fade, eyebrow EXPERIENCE, dial rotates per stop, centre = graduation photo for the education entry and the existing built-in line icons (drawn on scroll) for the others, text card with org/title/dates · location/up to 3 public bullets, gold index node, per-stop coordinates (Imperial 51.4988° N · 0.1749° W, Hong Kong 22.3193° N · 114.1694° E, London 51.5072° N · 0.1276° W), pulsing ring for a "present" entry.
4. Selected Work stops = the featured projects from the projects table (Content Drafts editable), in their sort order; eyebrow SELECTED WORK. Centre = the browser-window frame (macOS traffic lights #FF5F57 #FEBC2B #28C840; the frame's content area takes the screenshot's own aspect ratio so there are no empty bands — trim Cyterly's bundled image border if the bands are baked in; about 30% larger than in the mockup so it fills the inner ring). Multiple screenshots scroll left → right with the page scroll (scrubbed, dots as indicator). Text card: name, tagline, up to 3 short lines (add an optional "highlights" text list to projects via a migration if needed, allowlisted in Content Drafts — never derive from body automatically), status line if present, tags, capability links (e.g. "→ 01 AI engineering"), Visit ↗ (if url) and Case study →. "All projects →" after the last project. Index rail lists every stop, so new jobs and projects extend it automatically (layout tested for 3–8 stops).
5. Phones ≤900 px and reduced motion / no JS: no pinning, stacked steps fully drawn, swipeable screenshot carousel with dots; no sideways scroll.
6. Anchors: #background/#about/#pivot → step 0, #experience → first job stop, #work/#projects → first project stop. Journey dropdown: Background, Experience, Work, What I build, Creator, Contact.
7. Retire completely: the old Work showcase chapter, the Experience curve/stop layout, the walking mascot, mascot background and phone still (code, CSS, tests, media-manifest entries) and the old single-circle constellation. Delete the mascot art: Storage objects experience-bg.webp, experience-mascot.webp, experience-phone.webp in home-media (list first, confirm unreferenced, then delete) and the local folder "Personal Website/Media/Experience-art/".
8. Content Drafts (live sets, summary + operations only; Jamie approves): About photo about-ufl-participant.jpg caption → "Imperial College Investment Society · Investment pitch at The Shard"; and, if you add highlights, Cyterly AI highlights exactly as in the mockup and DataKind UK's one line from the mockup.

Done when: browser tests at desktop scroll through every step forwards/backwards with correct text, centre visual and gold index node; DataKind screenshots advance with scroll; no text overlaps the dial (bounding boxes); anchors land correctly; 390 px and reduced-motion layouts pass with no sideways scroll; grep shows no references to removed files; migration (if any) has policy tests and is NOT applied until Jamie says "apply it"; typecheck, full suite, build and static assertions pass; docs updated. Report checks actually run and every deleted file/object.
```

---

## Home polish 8 — "What I build" (replaces Techstack) + button motion

```
You are working in the jamieho-backroom repo. Read AGENTS.md, docs/README.md, docs/status.md, docs/journey.md and docs/content-drafts.md first and follow them (Jamie pushes; update docs/ + MEMORY.md + docs/decisions.md after). Runs after Home polish 7.

Approved design: the "WHAT I BUILD" section and the button/chip hover behaviour in "Personal Website/Media/Previews/home-dial-build-work.html" (latest version). Replace the Techstack chapter (stacked cards and cert badges) with it, right after the dial and before Creator. Match the mockup exactly — titles, descriptions, chips, captions and diagrams:
01 AI engineering — Agentic RAG diagram (orchestrator, router, hybrid retrieval, reranker, relevance grader with query-rewrite loop, MCP server tools, LLM generation, guardrails + RAGAS eval, memory).
02 Production event systems — "Example design" (devices/apps → gateway → Kafka → stream consumers → MongoDB; failure bin DLQ with replay; analytics fan-out; Grafana + Prometheus alerts).
03 Cloud architecture — "Reference design" incl. KMS encryption and the access lane (Corporate SSO → IAM Identity Center → IAM roles, least privilege); the two certification badge tiles sit in the diagram's bottom-left and link to Credly in a new tab: Solutions Architect – Professional → CREDLY_SA_PRO_URL, Machine Learning – Specialty → CREDLY_ML_SPEC_URL (stored as editable content; if a URL is empty the badge renders as a plain, non-clickable tile — never guess a URL; Jamie adds them later through Content Drafts).
04 Full-stack & delivery — microservices runtime lane + delivery lane (Git → Jenkins CI → SonarQube → Xray CVE scan → container registry → Kubernetes); languages row first.
05 Machine learning & computer vision — ETL lane + Segment Anything (SAM) → masks lane, no employer/organisation names.
CONFIDENTIALITY: never name any CRM or employer system in this section (no Salesforce, Wealthbox, Single Event API, Normalizer, reconciliation ID). Add a unit test that fails if those strings appear in the What I build content or diagram components.

1. Behaviour: desktop pinned, scroll advances 01→05 ("0N / 05"), active row expands, diagram draws (inline SVG, stroke-dashoffset); click a row to jump. Phones ≤900 px: accordion, diagrams pan inside their panel (no page sideways scroll). Reduced motion: all open and drawn.
2. Chips (here and on the dial's project tags): hover/focus turns them gold (border, text, faint fill, 150 ms); they are not links and show no pointer cursor.
3. Button motion with the existing GSAP (quickTo / timelines): "Start a conversation →", "Read my story", "Case study →", "Visit ↗", "All projects →" and other primary pill buttons site-wide — magnetic pull (≤8 px, ≤12 px for Start a conversation), gold fill sweeping in from the left with text turning navy, arrow slides out and back in, scale 1.03, smooth return; keyboard focus shows the end state; Start a conversation is the strongest (larger pill, gold outline pulsing once every few seconds while in view). Reduced motion: colour change only. Put this in one reusable component/hook.
4. Content: titles, descriptions, chips and captions are editable content (reuse the technology site section or a small new table, allowlisted in Content Drafts); diagrams are data-driven SVG components (nodes/edges in one place). Migrate the old Toolkit content; certification names + Credly URLs stored as content.
5. CTA "Have a project in mind?" + "Start a conversation →" to the Contact form anchor.
6. Retire the old Techstack/toolkit components, CSS, tests and any images only they used.
7. Content Drafts set (live, summary + operations only; Jamie approves): Global Relay CV bullets — remove employer system and CRM names. Proposed text (Jamie may edit before approving): bullet 1 "Own three production services on Kafka, processing GBs of events a day for regulated financial firms."; bullet 3 "Built a Python MCP server giving our internal AI agent controlled access to business systems." Leave bullet 2 unchanged unless Jamie says otherwise.

Done when: browser tests step through 01–05 by scrolling, each diagram has no label overlaps (bounding-box check), badge links open Credly when a URL is set (and render non-clickable when empty), chips change colour on hover and are not interactive, button hover/focus end states render, CTA reaches Contact; 390 px and reduced-motion pass with no page sideways scroll; confidentiality test passes; any migration has policy tests and waits for "apply it"; typecheck, full suite, build and static assertions pass; docs updated. Report checks actually run.
```

---

## Media cleanup — remove unused and duplicate images (after Home polish 7)

```
You are working in the jamieho-backroom repo. Read AGENTS.md, docs/README.md, docs/status.md and docs/journey.md first.

Goal: remove images and media that are no longer used or are duplicated, across three places: the repo's public/ folder (and any other committed assets), the local "Personal Website/Media/" folder (not in Git), and Supabase Storage buckets (home-media, project-media, article-images).
1. Inventory every file with size. Find references: grep the repo (code, CSS, docs, media manifest, service worker), and read the live tables that store image paths/URLs (about_photos, projects.screenshots, articles/guides bodies and covers, site_sections bodies, content_changes photo_slots for approved sets). Detect duplicates by content hash.
2. Produce a table: path · size · referenced by (or "unused") · duplicate of · proposed action (keep / delete / move). Rules: keep originals Jamie uploaded under Media/Uploads/ and Media/Brand/ unless a byte-identical copy exists elsewhere; never delete something referenced by live data; old London journey clips/stills, retired Desktop art and anything only referenced by retired features are candidates.
3. Delete in Git (public/ and committed assets) directly — Git history keeps them. For the local Media folder and Supabase Storage, show Jamie the table and wait for his "delete" before removing them (these deletions are not recoverable). Organise what remains in Media/ into: Brand/, Uploads/<date-subject>/, Previews/ and a short Media/README.md describing the layout.
4. Update the media manifest/service worker and docs (journey.md, operations.md), add one MEMORY.md line. Typecheck, build, static assertions and the Home browser tests must still pass. Report totals freed per location.
```

---

## Credly links (after Home polish 8; do with Media cleanup)

```
Read AGENTS.md and docs/content-drafts.md. Create one live Content Drafts set "Certification Credly links" (summary + operations only) setting the Credly URLs for the two certifications in the What I build content: Solutions Architect – Professional → https://www.credly.com/badges/bc496e1f-c499-433c-92e0-935d37a6b3a9/public_url; Machine Learning – Specialty → https://www.credly.com/badges/79ea94dc-e655-4709-aeb7-76139f3c4e76/public_url. https-only. Tell Jamie to approve, then verify read-only that both badges link correctly. One MEMORY.md line.
```

---

## Home polish 9 — Dial fixes: photo layout, ghost photos, icon draw-in, stop order, CTA banner

```
You are working in the jamieho-backroom repo. Read AGENTS.md, docs/README.md, docs/status.md, docs/journey.md and docs/content-drafts.md first and follow them (Jamie pushes; update docs/ + MEMORY.md + docs/decisions.md after). Reference design: "Personal Website/Media/Previews/home-dial-build-work.html" (match it where noted).

1. Background step photo layout: the live constellation stacks/overlaps the photos so gold captions sit on top of other photos (e.g. "INSID…" hidden, "GRADUATION AT IMPERIAL COLLEGE LONDON" crossing the DevFest print). Restore the mockup layout: centre photo in the middle, the others evenly on the ring at the mockup's positions/sizes, tags above each photo on short leader lines, nothing overlapping (photo boxes and tag boxes must not intersect each other — add a bounding-box browser test at 1440×900 and 1280×800). Shorten/wrap long tags rather than letting them run under another photo.
2. Ghost photos on Experience stops ONLY: during the job/education stops the four side photos stay visible as dimmed ghosts (~20% opacity, slightly desaturated) at the ring's outer edge, exactly as in the mockup; they fade out completely when the Selected Work stops begin. Reuse the About photos for now.
3. Centre icon draw-in: when each Experience stop becomes active, its centre line icon draws itself (GSAP stroke-dashoffset on every path/circle with pathLength="1", edges first then nodes popping in, ~1.2 s, scrubbed with scroll so it reverses on scroll up). Applies to every built-in icon (graduation-cap, neural-network, streams-plug, etc.). Reduced motion: fully drawn, no animation.
4. Replace the built-in neural-network icon with "Personal Website/Media/Previews/icons/neural-network.svg" (3-3-2 feed-forward network; keep its pathLength attributes, use currentColor). See neural-network-preview.html for the intended draw-in timing.
5. Stop order: jobs newest first. Order the dial's Experience stops by an explicit order field rather than by dates: 01 Imperial College London (education), 02 Global Relay, 03 KOLN3D — i.e. Global Relay before KOLN3D. Use experience_items.sort (Content Drafts editable); create a live Content Drafts set "Experience stop order" (summary + operations only) setting the sort values to produce this order, and tell Jamie to approve. Index rail numbering and per-stop coordinates follow the new order.
6. "Have a project in mind?" becomes its own full-width banner section AFTER the What I build section (not inside its pinned area): generous height (~70–90vh desktop), huge condensed heading "HAVE A PROJECT IN MIND?", one short supporting line ("Tell me what you're building — I'll reply within a few days." only if Jamie approves; otherwise no supporting line), and a much bigger "Start a conversation →" pill (≈2× current size) using the shared magnetic/gold-sweep hover from Home polish 8 plus the periodic gold pulse while in view; links to the Contact form. Same navy family with grain, subtle radial gold glow behind the button. Phones: full-width button. Reduced motion: no pulse/magnet.

Done when: browser tests show no photo/tag overlaps on the Background step; ghost photos present on Experience stops and absent on Selected Work stops; icons animate forward and reverse with scroll; dial order is Background → Imperial → Global Relay → KOLN3D → Cyterly AI → DataKind UK after the draft is approved; CTA banner renders as its own section with the larger button and reaches Contact; 390 px and reduced-motion pass with no sideways scroll; typecheck, full suite, build and static assertions pass; docs updated. Report checks actually run.
```

---

## Contact redesign — project brief (replaces the room/monitor contact scene)

```
You are working in the jamieho-backroom repo. Read AGENTS.md, docs/README.md, docs/status.md, docs/journey.md, docs/security.md and docs/operations.md first and follow them (Jamie pushes; new migration only, NOT applied until Jamie says "apply it"; update docs/ + MEMORY.md + docs/decisions.md after; privacy policy must stay accurate).

Approved design: "Personal Website/Media/Previews/contact-brief.html" (open it; match its layout, styling, chips, link rows, "What happens next" rail, Send brief pill with the shared magnetic gold-sweep hover from Home polish 8, validation messages and the fold → drawn-check success state). Build it as the homepage's final Contact section, directly after Creator, in the navy editorial system.

1. Retire the old ending: the black join, room video and monitor contact scene (chapters, components, CSS, tests) and remove their six room/contact video/poster files from the media manifest. List the matching Storage objects in home-media and the local files, confirm nothing references them, then show Jamie the list and wait for his "delete" before deleting Storage/local files (Git files can be deleted directly). #contact and every "Contact"/"Schedule a call"/"Start a conversation" link must land on the new section's form.
2. Left column: heading "LET'S BUILD SOMETHING", line "Tell me what you need and I'll get back to you.", link rows Email / LinkedIn / Schedule a call — reuse the email and LinkedIn URLs already stored in the site's contact/social content; "Schedule a call" scrolls to the form for now (Jamie may add a booking link later as content). Drop the small hint labels next to the links. "What happens next" rail: 01 Send a short brief · 02 I reply by email · 03 A short call to scope it. Corner "LONDON · HONG KONG".
3. The brief (right card), in this order:
   a. "Why are you getting in touch?" — single-select, REQUIRED: Project · Hiring / role · Collaboration · Just saying hi.
   b. Only when Reason = Project (revealed with a smooth height/opacity transition; hidden groups are not submitted or validated):
      - "What do you need?" — multi-select, REQUIRED, at least one: AI engineering · Production event systems · Cloud architecture · Full-stack & delivery · Machine learning & computer vision · Something else.
      - "Budget" — single-select, REQUIRED: Under £1k · £1k–£5k · £5k–£15k · £15k+ · Not sure yet. ("Free consultation" is removed.)
      - "Timeline" — single-select, REQUIRED: As soon as possible · Within 1–3 months · Just exploring.
   c. "Tell me about it (optional)" — textarea, NOT required.
   d. Name and Email — REQUIRED.
   Step labels count only visible groups (e.g. 01 / 03 or 01 / 06). Chips are real radio/checkbox inputs in fieldsets with legends; keyboard accessible.
4. Server: extend the existing contact action/validation (lib/contact-fields.ts, lib/contact.ts) — reason enum; needs (array of the enum), budget and timeline required only when reason = project and must be null otherwise; message optional (keep max length). Keep the honeypot, rate limit, email alert and Settings inbox; show reason/needs/budget/timeline in the alert email and in the inbox list. One new migration: add reason, needs text[], timeline columns (with check constraints matching the enums), make message nullable, update the budget check to the new list (existing rows keep their old values — allow them via the constraint or migrate "Free consultation" → "Not sure yet"; say which). Policy/DB tests for the new constraints; RLS unchanged. Update the privacy policy text for the new fields.
5. Phones: stacked, chips wrap, full-width Send brief; no sideways scroll. Reduced motion: no magnet/fold/draw.

Done when: unit + DB tests cover validation (project vs non-project, optional message, enums), the migration is tested locally and recorded NOT applied; browser tests at desktop and 390 px submit a Project brief and a "Just saying hi" brief against the local test setup, check required errors, the conditional reveal and the success state; old room/monitor code and manifest entries are gone (grep); typecheck, full suite, build and static assertions pass; docs and privacy updated. Report checks actually run, the migration name, and the Storage/local media list awaiting Jamie's "delete".
```

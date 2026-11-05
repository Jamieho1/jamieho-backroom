# PRD: Home v1, cinematic London journey

_Status: **draft for Jamie's sign-off** (4 Nov 2026). Source: the grill-me session of 4 Nov 2026 in Claude (Cowork). Creative pack (master copy): `JH OS/workstations/Social Media HQ/06 Website HQ/01 Reference/Home Redesign Handoff 2026-11-04/`, holding the 4 handoff docs and `Home v1 - Scene Prompts.md`. This PRD replaces the Three.js "one continuous world" Home approach in `PRD.md` (2026-11-01 entry) and the earlier Codex Home plans in `Resources/`._

## Home v1, cinematic London journey

**Problem**

The homepage is still the illustrated desktop metaphor with a separate About Me. Jamie wants a premium first impression for recruiters and clients equally: a continuous, scroll-driven journey through London that introduces him, his background and his experience, then lands at a desk where his real apps and contact form live. The earlier preview used photo pan/zoom, which doesn't read as real camera travel. AI video trials (Kling, Canva) on 4 Nov showed that chained, generated clips can.

**Outcome and completion**

Done means:

1. **Journey.** `/` plays a 4-chapter journey driven by scroll: **Sky → Imperial + library → Westminster → Room**. It stops and reverses at any point, slows while text is readable and speeds up between panels. There's no forced snap and no autoplay.
2. **Start screen.** The first screen is Jamie's original day art as an instant image, with his name and an **"Enter the journey"** button ringed by a real progress indicator, plus a **"Skip to desk"** link.
3. **Content.** Text comes from the existing database content and is real HTML:
   - Sky: `hero`.
   - Imperial + library: `about`, `interests`, `technology` (and project technologies).
   - Westminster: the **full** public experience timeline, with milestones stepping in on screen one after another while the camera stays slow.
4. **Monitor.** The final room frame has an HTML panel aligned over the monitor screen with **Projects, Articles, Practice** (Notes, Practice and Behavioral grouped together) and **Contact** (the existing form, working on the monitor). Opening an app zooms into the screen (View Transitions API) and lands on its existing page, which shows a **"← Back to desk"** link. The floating nav and `/#desk` jump straight to the room.
5. **No lag.**
   - Each clip is downloaded fully into memory before its chapter, and the clips load in order ahead of the visitor.
   - If the visitor outruns the download, the chapter shows its approved still with the same panel.
   - Files have version-stamped names, are cached permanently and are kept by a service worker, so repeat visits are instant.
6. **Phones and fallbacks.**
   - At 390 px: 720p clips, panels stacked at the bottom, no horizontal overflow.
   - Low power, stuttering, reduced motion or no JavaScript all get the still-frame version with every piece of text and link reachable.
7. **Old desktop retired.** The homepage desktop windows and side icons are removed in the same release. Existing routes keep working.
8. **Verified.** `npm run check` and the relevant e2e tests pass, plus the media checks in the verification section. Then Jamie reviews live and pushes himself.

**Scope**

- **In v1:**
  - The 4 chapters above, with stills S1, S2b, S2c, S3a–S3c, S4–S6 and 10 chained clips (C1, C2, C3a–C3d, C4–C7) (see Scene Prompts).
  - The start screen and preloader.
  - The monitor launcher and contact form.
  - The zoom transition and "Back to desk".
  - Retiring the homepage desktop.
  - Phone and fallback versions.
- **Later (v2):**
  - St Paul's / One New Change, which will hold projects.
  - Canary Wharf Elizabeth line + train, which will hold articles and socials.
  - Client logos.
  - Redesigning the apps themselves.
  - Pitch-black text sections in the BMW style, if wanted. GSAP covers them.
- **Out:**
  - Day/night switching (day art only).
  - Three.js and HyperFrames.
  - Running whole apps inside the monitor.
  - New analytics.
  - New content stores or hardcoded personal copy.
- **Reused:**
  - The `sections` content (hero, about, interests, technology, writing, contact).
  - Public experience entries and project apps.
  - The existing contact form and its server action.
  - App routes, permissions, sign-in and app-open logging.
  - The Articles social links.
  - The Cloud & Ink UI tokens (UI only; never recolour the art).

**Canonical locations/data**

| What | Where |
|---|---|
| Creative pack and scene prompts (master copy) | Website HQ → `01 Reference/Home Redesign Handoff 2026-11-04/` |
| This PRD and its tickets | repo `Resources/Home v1 - PRD.md`; `PRD.md` points here |
| Code | `~/Documents/Developer/Personal Website/jamieho-backroom` |
| Raw media (trials, downloads, stills) | `~/Documents/Developer/Personal Website/Media/`, outside Git |
| Final encoded clips and stills | Supabase Storage, new public bucket `home-media` (owner-only write, public read) |
| Page copy | existing database tables (`sections`, experience, projects) |
| Superseded plans | the repo's `Resources/Claude Handoff 2026-11-04/` and older `Home - …md` plans move to Website HQ `99 Archive/`. `Resources/Home - Redesign Plan.md` stays as a pointer to this PRD |

**Constraints**

- **Media generation is done by Jamie manually** (Kling paid for production; Canva/Kling for trials). Agents never generate, upload to providers or spend credits. **No Higgsfield tools unless Jamie explicitly says so.**
- **Look:**
  - Every outdoor scene is in bright, clear late-morning sun with a deep blue sky and soft white clouds, in a premium photographic finish.
  - The room is a warm, dark evening interior.
  - No weather or lighting change within a clip.
- **Frame shape:** 16:9 for every still and clip (decided 4 Nov). Cloud scene 1 is remade at 16:9.
- **Media budget:** about 25 MB total on desktop and 12 MB on phones; about 6 MB before the first moving frame.
- **Encoding (tutorial method):**
  - Desktop: H.264 at CRF about 20, a keyframe every 8 frames, scene-cut keyframes off, no audio, faststart.
  - Phone: 720p with a keyframe every 4 frames.
  - The poster is the first frame of the encoded clip.
- **Original art:** the day art is clip C1's exact start frame and resting state. Slight redrawing once the camera moves away is accepted.
- **Rights:** stock or watermarked photos (Alamy, Shutterstock) are references only and never appear on the site. Only Jamie's art and the generated stills and clips are published.
- **Repo rules apply:**
  - Personal content stays in the database, never in Git.
  - Access is enforced with RLS and tests.
  - Only the owner writes.
  - No new callable database functions.
  - Jamie handles all secrets and pushes himself.
  - Ask before starting each ticket.
  - The `home-media` bucket needs a migration and Jamie's explicit approval before it's applied live.
- **Tools:** GSAP + ScrollTrigger, scroll-craft (read its skill first) and Lenis. Free tiers only: £0/month.

**Build plan**

Media work (Jamie) and code work run in parallel; the code uses placeholders until media lands.

1. **M: Media production (Jamie, manual, tracked).** Following `Home v1 - Scene Prompts.md`, in order:
   1. **Stills S2–S6:** Imperial entrance, library window, sunny Westminster, room at an angle, monitor straight-on. Review each and fix single details.
   2. **Clips C1–C7** at the final quality, 10 s each:
      - C1 is done: `Cloud scene 1.mp4`. It only needs a final 10 s, top-quality render.
      - C2 starts from C1's last frame and C6 from C5's last frame. Claude extracts those PNGs.
   3. **Save to** `Media/<id>-v<n>`.

   _Gate:_ Claude checks each clip (sampled frames, the trial-lessons table) before encoding it.
2. **Ticket 1: Scroll engine and chapter data model.**
   - GSAP ScrollTrigger + Lenis controller.
   - Chapters defined as data (clip, still, reading ranges, panels).
   - Eased video scrubbing.
   - Uses the existing trial clips as placeholders.
3. **Ticket 2: Media pipeline.**
   - An encode script (desktop and phone settings, poster, version-stamped names).
   - The `home-media` bucket migration and its tests. _Gate:_ Jamie approves before it's applied live.
   - Upload done by Jamie or an owner-only script.
4. **Ticket 3: Start screen and preloader.**
   - Instant art image, the Enter button with a real progress ring, Skip to desk.
   - In-order full downloads (blob URLs).
   - Swap to the still when the visitor outruns the download.
   - Service-worker cache.
5. **Ticket 4: Chapter panels and content.**
   - Panels bound to the database sections and experience.
   - Glass panels entering and leaving with GSAP.
   - The Westminster timeline steps in one milestone at a time.
6. **Ticket 5: Room monitor.**
   - A screen-aligned HTML panel that stays aligned across window sizes.
   - Launcher and the contact form on the monitor.
   - View Transition zoom into apps, "Back to desk", `/#desk`, floating-nav direct actions.
7. **Ticket 6: Retire the homepage desktop and finish the nav.** Remove the desktop windows and icons from `/`, keep the existing routes, and finalise the floating bar (chapters, apps, account, Settings, Privacy).
8. **Ticket 7: Phone and fallback versions.** 720p, bottom panels, the still-frame mode (low power, reduced motion, no JS), 390 px checks.
9. **Ticket 8: Swap in final media and polish.** Replace the placeholders with the approved clips, tune the reading ranges, and verify everything.

   _Gate:_ Jamie reviews, pushes and checks live.
10. **Housekeeping (in Ticket 6 or separate):** archive the superseded plans as listed above and update `PRD.md` and MEMORY.md to point here.

**Verification and handoff**

- **Media checks per clip:**
  - Frames sampled at 0, 25, 50, 75 and 100%.
  - Stable landmarks and characters; no ghosts, statues, duplicates or warping; constant weather.
  - 16:9 frame; the joins match the previous clip's last frame.
- **Web checks:**
  - `npm run check`, plus e2e for `/`, the monitor launcher, the contact submission and `/#desk`.
  - Slow and fast scroll, stop and reverse inside a join.
  - A cold-cache first load and a warm repeat visit.
  - A missing clip falls back to its still.
  - Desktop and 390 px, keyboard and focus order, text contrast over the video.
  - Reduced motion and no JavaScript.
- **Report** what was tested and what wasn't: headless phone tests don't prove real iPhone or Low Power Mode behaviour. Jamie checks on his own phone.
- **Rollback:** the redesign ships behind its own route components, and the previous home stays recoverable from Git until Jamie confirms live.
- **Not applied yet:** no migration, no bucket, no code. This PRD authorizes nothing until signed off, and each ticket still needs Jamie's go-ahead.

**Open questions**

- Final public copy for each panel: the existing sections may need tightening to 2–4 lines.
- Supabase free-tier bandwidth is enough for the expected traffic (confirm before launch).
- Lenis + GSAP smoothness on a real iPhone (checked in Ticket 7).
- Domain purchase before the public launch (TKT-71 reminder).

---

## Home v1.1, shorter journey with BMW-style sections

_Status: **signed off by Jamie (5 Nov 2026)**. Source: the grill-me session of 5 Nov 2026 in Claude (Cowork); its decisions are logged in the Claude project doc `claude/personal-website-grill-decisions.md` (section "Home v1.1"). Where this section conflicts with Home v1 above, this section wins._

**Problem**

The v1 journey is almost all video: Sky → Imperial → library → Westminster → room. Each long chapter carries only one short panel of text, so it reads as "a student showing AI clips" rather than a premium portfolio. The middle clips are also most of the weight (about 19 of 26 MB), and C3a still has a sign glitch. Jamie wants BMW's style instead:
- solid colour backgrounds with large type;
- static pictures beside the text;
- one layered scroll scene;
- a pinned project showcase with a progress line per project.

Each section should deliver real information and a message.

**Outcome and completion**

Done means:

1. **Shape.** `/journey` runs: **Hello (video C1) → Pivot → Projects → Experience → Toolkit → Creator → Desk (video C7a + C7b)**. Only the two ends are video. C2, C3a, C3b, C5a, C5b and the library layers are no longer loaded.
2. **Hello.** The existing start screen (Enter the journey / Straight to my desktop) and the hero panel with "Go straight to my desktop". The progress ring tracks C1 only.
3. **Pivot.** A solid section with a giant statement (the About section's title), its first paragraph, and the education meta line (title · org · dates from the first public education entry). A framed Imperial still sits on one side with light parallax.
4. **Projects.** A pinned showcase of **featured projects only, at most 4**, about one screen of scroll each:
   - Left: number, name, tagline, up to 3 tags, and "Read the case study →" linking to `/projects/<slug>`.
   - Right: a browser-frame mockup of the project's screenshots, cross-fading through the project's scroll; full-page (tall) screenshots pan downwards.
   - Bottom-left: one short line per project; the current one fills as you scroll.
   - After the last project: "All projects →" to `/projects`.
5. **Projects pages.** These read from a new owner-edited `projects` table, separate from `apps`:
   - `/projects` lists every public project, featured first. It replaces today's app-card grid.
   - `/projects/<slug>` shows the Markdown write-up, screenshots and tags, with "Visit website" when a URL exists and "Website coming soon" when it doesn't.
   - The owner adds and edits projects in the existing Edit mode, including screenshot upload.
6. **Experience.** Public CV roles, newest first, one role per screen:
   - role · org · dates as a big line;
   - up to 3 public bullets as proof points;
   - a timeline dot for each role, and a framed Westminster still with light parallax.
7. **Toolkit.** The one layered scene, built with CSS 3D and GSAP (no three.js):
   - An exploded architecture stack whose layers separate one by one as you scroll. Each layer shows its tools and a one-line "how I use it".
   - Layer data comes from the Technology section: each `## heading` is a layer, the first line under it is the "how", and the bullets are the tools. With no headings, it falls back to the technology tags from public projects.
   - It ends with certification badges taken from public `certificate` CV entries, each linking to the first `https` URL in its summary (the Credly link).
8. **Creator (YouTube & Instagram).**
   - The Writing section's title and body as the channel pitch.
   - Subscribe and Follow buttons built from the Contact section's YouTube and Instagram links.
   - Cards for the latest published YouTube post, the latest Instagram post and the latest other article.
9. **Desk.** C7a walks to the desk and shows the **Now** panel (the `now` section) and the contact line ("Say hello" + socials). The **Latest** panel moves to Creator. Scrolling continues through C7b into the monitor, where "Switch on" opens the desktop (`DESKTOP_HREF`).
10. **Look.**
    - Sections alternate warm off-white `#f6f3ee` and warm near-black `#0f0c09`, with the amber accent `#f2b45c`.
    - Type: Unbounded for statements, Inter for body, JetBrains Mono for labels.
    - Handovers between sections are a clean colour wipe.
    - Chapter menu: 01 Hello · 02 Pivot · 03 Projects · 04 Experience · 05 Toolkit · 06 Creator · 07 Desk.
11. **Phones and fallbacks.**
    - On phones nothing pins: sections stack, the Toolkit layers lie flat, and videos use the phone encodes.
    - With reduced motion or no JavaScript, every section is plain readable HTML and stills replace both videos.
    - Empty sections are skipped automatically.
12. **Content gate before `/`.** The journey stays on `/journey` and does **not** replace `/` (TKT-79) until every section has real content. Claude drafts all copy in a doc; Jamie edits it and enters it himself in the site editors.
13. **Verified.** Unit, DB and e2e tests pass, plus the visual checks below. Jamie reviews and pushes himself.

**Scope**

- **In v1.1:**
  - The section engine and all sections above.
  - The `projects` table with its RLS, tests and editor, plus `/projects` and `/projects/<slug>`.
  - Two graded web stills (Imperial and Westminster) made from Jamie's approved stills.
  - Removal of the middle clips from the journey and preloader.
  - The copy draft doc.
- **Already built and kept:**
  - Scroll engine (TKT-74).
  - `home-media` bucket and versioned media (TKT-75/76).
  - Start screen, preloader and media service worker (TKT-76).
  - The room → monitor → "Switch on" ending.
  - The `now` section (migration awaiting approval).
  - Content mapping helpers (TKT-77).
- **Out:**
  - three.js / WebGL.
  - Interests as a section.
  - New videos.
  - Running sites in iframes.
  - Live links for FinAI and Cyterly (they start as "Website coming soon").
  - Retiring the desktop: it is the destination of "Switch on".
- **Superseded from v1:**
  - The Imperial / library / Westminster video chapters and the library layer scene.
  - TKT-77's library and Westminster mapping.
  - TKT-78's clickable room objects (already removed).

**Canonical locations/data**

| What | Where |
|---|---|
| This PRD | repo `Resources/Home v1 - PRD.md`, this section |
| Decision log | Claude project doc `claude/personal-website-grill-decisions.md` |
| Code | `~/Documents/Developer/Personal Website/jamieho-backroom` (`lib/journey`, `components/journey`, `app/journey`, `app/projects`) |
| Projects | new `public.projects` table (anyone reads public rows, only the owner writes); screenshots in Supabase Storage |
| Page copy | `site_sections` (`hero`, `now`, `about`, `technology`, `writing`, `contact`), experience items and bullets, articles |
| Media | `home-media` bucket: C1, C7a, C7b, the two new stills, and the manifest in `lib/journey/media-manifest.json` |
| Copy draft | a Claude Doc Jamie edits; nothing personal in git |

**Constraints**

- **Content:** personal content lives only in the database, never in git, and only the owner writes it. Visibility is enforced by RLS with tests.
- **Migrations:** the `projects` migration, its storage policies and the `now` section migration each need Jamie's explicit "apply it" before going live.
- **Media and secrets:** Jamie makes media himself; agents spend no credits and use no Higgsfield. Jamie handles all secrets and pushes himself.
- **Motion:** animate only transform and opacity, with one rAF loop and GSAP ScrollTrigger + Lenis (scroll-craft rules). Toolkit uses CSS 3D only.
- **Cost:** free tiers only. The journey's video download stays at or under about 6 MB on desktop.
- **Process:** ask before each ticket.

**Build plan**

1. **Section engine.**
   - Extend the chapter model with a `section` kind: solid colour, layout, optional side still.
   - Pinned segments, the colour-wipe handover, the new chapter menu.
   - Remove the middle clips and the library scene from `HOME_CHAPTERS`.
   - Preloader loads only C1, C7a and C7b; the ring tracks C1.
2. **Pivot and Experience sections.**
   - Content mapping (About + education → Pivot; public roles + ≤3 public bullets → Experience).
   - The two graded web stills with parallax frames, and the timeline dots.
3. **Projects data.** `projects` table migration, RLS and DB tests, and a screenshot storage path. _Gate:_ Jamie approves the migration before it's applied live.
4. **Projects pages and editor.**
   - `/projects` list and `/projects/<slug>` detail with Visit website / coming soon.
   - Owner Edit mode with screenshot upload.
   - The desktop's Projects app follows the new list.
5. **Projects showcase.** Pinned, featured (max 4), cross-fading and panning browser frame, line indicators, "All projects"; stacked on phones.
6. **Toolkit stack.**
   - Technology heading parser and project-tag fallback.
   - CSS 3D exploded layers and certification badges from public certificate entries; flat on phones.
7. **Creator section.** Writing pitch, Subscribe/Follow, and latest YouTube, Instagram and article cards. Trim the Desk to Now + contact line.
8. **Phones and fallbacks.** 390 px stacking, the reduced-motion / no-JS still version for every section, empty-section skipping.
9. **Copy draft.** A doc with draft copy for every section and the first projects (FinAI, Cyterly). Jamie edits it and enters it himself.
10. **Content gate → TKT-79.** When every section is filled, move the journey to `/` and the desktop to `/desktop`, set `DESKTOP_HREF`, and delete the unused clips from the bucket.

**Verification and handoff**

- Unit tests:
  - content mapping, including empty sections;
  - the Technology heading parser;
  - featured cap and ordering;
  - certificate link extraction.
- DB tests for `projects`: public read, owner-only write, hidden rows invisible to anon.
- e2e tests:
  - start screen and Straight to my desktop;
  - each section renders and skips when empty;
  - showcase line indicators and links;
  - `/projects` and `/projects/<slug>` (with and without a URL);
  - Switch on;
  - reduced motion.
- Visual checks at 1440 px and 390 px for each section: pinned states at 0/50/100% and the Toolkit stack mid-separation.
- Report what wasn't tested: real iPhone smoothness and Low Power Mode are checked by Jamie.
- Rollback: everything stays on `/journey` until the content gate; `/` is unchanged.

**Open questions**

- Where project screenshots are stored: a new `project-media` bucket, or a folder in an existing bucket. Settle this in step 3 after checking how app screenshots are stored today.
- Whether the old `apps.screenshots` cards stay anywhere once `/projects` switches to the new table.

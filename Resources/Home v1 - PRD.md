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
  - The 4 chapters above, with 7 stills (S1, S2a, S2c, S3–S6) and 8 chained clips (C1, C2, C3a, C3b, C4–C7) (see Scene Prompts).
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

# Home landing-page redesign

Approved: 2026-11-01. First review slice ready locally, 2026-11-02: London opening,
About camera transition, direct Work/Contact links and separately composed phone view. Local validation passed.
No database changes or deployment for this redesign.

## User brief

- Make Home an appealing personal landing page inside the existing desktop experience.
- Use Three.js, GSAP and https://github.com/nateherkai/scroll-craft.
- Supplied reference notes describe a layered London scene: Elizabeth Tower, London Eye, Tower Bridge,
  Thames water, foreground details, atmosphere and scroll/pointer depth.
- Include personal information, passions, tech stack, projects, clients, work experience and contact form.
- Discuss and agree a step-by-step plan first, then Codex can handle implementation for Jamie to review.
- Retain the other apps' layouts and existing access controls.

Scroll Craft was read through its published SKILL.md and design references. It is an agent design/build
workflow plus an optional runtime, not a third npm animation library. Use its brief, narrative, depth,
mobile and visual-verification approach with the requested Three.js/GSAP implementation.

## Direction confirmed in chat

- Audience: clients and recruiters equally.
- Art direction: cinematic, moody and realistic London.
- Content: use existing public information; client material comes later.
- Personal interest details were supplied in chat. Refine them later for an exploration/passion section;
  do not duplicate personal content in git or present interests as professional experience.

Jamie chose one continuous London journey throughout Home. Use one coherent 3D world with readable
content waypoints, not a hero followed by unrelated visual sections. Primary contact action is
provisionally a neutral invitation to get in touch, suitable for both audiences. No supplied visual
asset collection has been identified yet; source or model lawful assets during the prototype stage.

## Continuous-world design proposal

Home remains a full-width desktop app. Proposed art direction is blue-hour London, warm architectural
lights, restrained Thames reflections and light fog. Landmark detail, materials, scale and consistent
lighting should support the requested realistic feel. Use one persistent 3D stage throughout Home,
with camera waypoints and HTML content/controls. Camera movement settles while visitors read or
interact. The desktop menu and other apps retain their own design and functionality.

Proposed waypoints:
1. Arrival on the Thames: name, clear positioning and contact/project actions over the London opening.
2. Riverside introduction: about and passions, with personal interests framed as exploration rather
   than unverified professional experience. Actual copy remains in database/chat, never this file.
3. Engineering detail: technology groups connected to genuine examples of what was built.
4. Selected work: substantial project examples in readable, clickable HTML panels within the same world.
   A possible signature interaction connects bridge/river lines to technologies and project evidence.
5. Work experience: existing public Experience data, with a calm camera position and readable timeline.
6. Contact: the world comes to rest; existing form, Inbox/Resend flow and Privacy remain usable.

Clients/collaborations are reserved in the design but not published until Jamie supplies approved
material. Do not add an empty flight leg or fake proof for this deferred section. Writing/Articles/social
links can support the introduction and interests without distracting from the two primary audiences.
Provide direct waypoint links so visitors can reach work or contact without traversing every scene.

Proposed visitor progression: curiosity (London), connection (person/interests), understanding
(technology), confidence (projects), trust (experience), clarity (contact). The opening and one
purposeful transition should carry the strongest visual moment; motion does not need to accelerate
through dense reading or form interaction.

## Work stages and review points

1. Record the agreed brief and settle the storyboard: opening, each waypoint, one signature transition,
   primary contact action and asset inventory. Use existing public information; refine passion copy
   later and hold client content unpublished.
2. Design desktop and phone compositions before final assets. Establish the city route, lighting,
   text-safe areas, layer order, camera stops and a normal/reduced-motion reading presentation.
3. Build the first technical/visual slice inside the existing Next.js app: London opening plus the
   first content waypoint. Prove the real Home scroll container, persistent stage, responsive canvas,
   resize/maximise and navigation cleanup. First review: opening, mid-scroll and phone composition.
4. Build the complete continuous Home journey and content layout: about/passions, technology,
   projects, experience and contact, with the client slot ready for later. Reuse the current public
   database information, Experience, project registry and contact delivery. Add owner-editable fields
   where needed; any migration requires Jamie's approval before live application. No invented claims.
5. Finish models, materials and choreography. Three.js owns the 3D scene; GSAP owns container-aware
   camera/HTML animation. Scroll Craft supplies its continuous-world design and visual-verification
   workflow. Keep the world coherent, make content readable, and avoid unnecessary empty travel.
6. Optimise and complete fallbacks. Lazy-load Home-only graphics, cap render resolution, pause hidden
   work and dispose graphics/animations on navigation. Provide a complete static/reading mode for
   reduced motion, WebGL failure and slow loading. Recompose phones rather than shrinking desktop.
7. Verify and hand back: rendered opening/midpoint/final states, compact/390 px phones, contrast,
   keyboard/waypoint navigation, links, forms, static rendering and desktop-app regressions. Jamie
   checks the finished Home himself and pushes; no automatic commit/push/deployment by Codex.

With this plan agreed, Codex can handle the implementation stages and bring the first slice and
finished Home back for review, without asking about routine reversible choices. Live migrations still
require explicit approval under AGENTS.md.

## Existing architecture and integration risks

- Home scrolls inside .desktop-app-content, not the document. GSAP ScrollTrigger supports a custom
  scroller. Scroll Craft's current stock engine reads global scrollY/innerHeight and styles document
  globals, so it is not a drop-in runtime here. Verify the integration before importing it or its CSS;
  the design/verification skill can be used independently. Avoid two engines controlling one property.
- Keep Home pre-rendered, with actual HTML text and existing anonymous/cookie-free public data reads.
  Browser-only Three.js enhances that content after load. Other apps should not download/run its scene.
- Scope any design tokens/styles to Home. Keep desktop chrome, permission cache and app routes intact.
- Reuse the existing colour-mode control where it fits the selected scene. Mouse parallax is optional;
  touch and keyboard must not depend on it. No pointer lock or real-browser/computer control.
- The scene is continuous inside Home only. Keep real semantic content and a complete linear reading
  presentation available; scene overlays must not trap focus or make lengthy content unreadable.
- Rendering budget is a measured target, not a guaranteed 2 MB claim. Procedural geometry or licensed,
  compressed models can avoid large downloads; choose based on the agreed visual direction.
- The supplied guide's separate Vite project is adapted into this existing Next.js repository.
- PRD previously deferred Three.js/GSAP. This new user request opens a Home-only design phase; record
  the approved scope change when the brief is agreed. No new site runtime AI calls are needed.

## References inspected

- Skill: https://github.com/nateherkai/scroll-craft/blob/main/plugins/nateherk-design/skills/scroll-craft/SKILL.md
- Continuous-world reference: https://github.com/nateherkai/scroll-craft/blob/main/plugins/nateherk-design/skills/scroll-craft/references/worldflight.md
- Hero depth: https://github.com/nateherkai/scroll-craft/blob/main/plugins/nateherk-design/skills/scroll-craft/references/hero-depth.md
- Approved collection: https://github.com/nateherkai/scroll-craft/blob/main/plugins/nateherk-design/skills/scroll-craft/references/approved-collection.md
- Runtime compatibility: https://github.com/nateherkai/scroll-craft/blob/main/plugins/nateherk-design/skills/scroll-craft/engine/scrollcraft.js
- ScrollTrigger custom containers: https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- Three.js responsive rendering: https://threejs.org/manual/pages/responsive.html

## First-slice implementation

- Pinned Three.js 0.187.0, @types/three 0.187.0 and GSAP 3.15.0. Scroll Craft reviewed at
  75d81f74e83692add18cd7a8a8e078b8a887a579; workflow source remains upstream, no global engine/CSS imported.
- Original architectural study: Elizabeth Tower's clock dials, Gothic stone detail, Eye, Westminster Bridge,
  far bank, near railing/lantern, shader sky and rippled planar reflections. No downloaded models, paid
  assets, external font services or runtime AI. This is the first visual prototype; final landmark/model
  fidelity and the rest of the camera route remain later work, subject to Jamie's first-slice review.
- One paused GSAP score is driven by the actual desktop app pane, with measured intro/About distance.
  The lantern crosses the view as the tower moves from right to left. Camera rests for the later HTML
  content. No added empty pinned travel or scroll hijacking; normal anchor links work without JavaScript.
- Real public database content and existing owner editors are reused. No personal copy/client claims
  added to git. No schema or privacy collection changes. Technology/passions/client editing is not yet
  added; the client section remains unpublished.
- Graphics load lazily only in Home, render on demand, cap pixel ratio and reflection size, and dispose
  renderer/geometry/materials/textures/render target/listeners/timeline on navigation or pause. Context
  loss uses the still view. Resizing/maximising recomputes the camera composition and pane height.
  Startup is deferred until after initial paint/idle; shaders are prepared asynchronously for both
  reflection and main passes. Internal route-link intent cancels pending graphics before routing completes.
- Exact-scene desktop/phone posters support loading, reduced motion, no WebGL and no JavaScript.
  `scripts/capture-home.mjs` regenerates them from a local server and records actual opening/turn/
  transition/About frames and painted camera poses at desktop, 390 px and compact 360 px sizes.
- Scroll Craft's temporary preflight copy excludes credential scanning to obey the project no-secrets
  rule. Node, ffmpeg, Playwright, headless Chrome and workspace checks passed; optional WebP encoder
  was absent (no video encoding needed), and no asset-generation key was accessed. Temporary brief,
  score/layer contract and fingerprint registry live in /private/tmp/jamie-home-design. Registry was empty.

Validation: 415 unit/database tests; build/typecheck/static assertions passed. Full desktop/phone headless
suite: 80 passed, 2 existing duplicate runtime cases skipped. Final Home-only rerun: 10 passed. Checked
real pane-scroll states (opening, 30%, 60%, About) at desktop, 390 px and compact 360 px, plus reduced motion.
Decorative captions were removed after failing intermediate-state contrast; remaining 48 sampled
text/frame combinations passed with minimum 7.08:1. Local frames and measurement records are in
/private/tmp/jamie-home-preview. Physical-phone rendering/performance and live-site sign-off remain for Jamie.

First review should assess the opening, camera movement and phone composition. Remaining complete-page
storytelling/content refinement is intentionally the next slice of the approved plan, after that review.

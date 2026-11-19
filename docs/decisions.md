# Decisions

One line each: date · decision · source. Newest last. Full reasoning lives in the source spec or grill log.

- 2026-11-11 · Plain app pages (no window chrome) with one shared top bar; only Settings keeps window controls · Jamie
- 2026-11-11 · Article pins and Guides are per-user/public tables under RLS · Guides spec
- 2026-11-14 · Claude drafts content as change sets; Jamie approves on the real site (Content Drafts, option B) · Content Drafts PRD
- 2026-11-14 · Preview on the real page with gold outlines; no undo/out-of-date checks, Jamie asks Claude for corrections · Content Drafts PRD
- 2026-11-14 · Delete on projects/articles/guides = unpublish, never row removal · Content Drafts PRD
- 2026-11-14 · Photos: Jamie uploads in chat; Claude renames into a dedicated folder per change; article images in `article-images/post<N>-<slug>/` · Jamie
- 2026-11-14 · Work features Cyterly AI and DataKind UK (Volunteer); FinAI unfeatured · Home v1.3 grill
- 2026-11-14 · About = Delta-style photo constellation + "Read my story" → `/about` editorial page · Home v1.3 PRD
- 2026-11-14 · Experience = curved journey (Imperial → KOLN3D → Global Relay → Projects) with two-layer mascot art, GSAP, day only · Home v1.3 PRD
- 2026-11-14 · Phone Experience/hero use a static image; desktop motion always on, no still-view option · Jamie
- 2026-11-14 · Interview workspace: sidebar like TechPrep, each section opens on Practice, Notes via switch · Interview PRD
- 2026-11-14 · Interview open to all; each user's progress/resume/answers private; owner edits shared content but never reads users' data · Interview PRD
- 2026-11-14 · Resume: Jamie's CV only as an anonymised template (Company A…), real certificates/skills kept · Interview PRD
- 2026-11-14 · Behavioral is question-based (themes, guide, private STAR answers, custom questions); CV-bullet story mapping retired · Interview PRD
- 2026-11-14 · Membership gate kept in code for future courses, unused by Interview · Interview PRD
- 2026-11-15 · Old `/notes`, `/practices`, `/behavioral` deprecated after the new design; redirect choice at the end · Jamie
- 2026-11-16 · Site nav label "Interview Prep"; workspace brand "PassLoop" · Jamie
- 2026-11-16 · Build order: Home v1.3 → Articles (TKT-117 + redesign) → PassLoop · Jamie
- 2026-11-16 · ChatGPT's Articles/Resources design options rejected; redesign to be grilled with Claude · Jamie
- 2026-11-16 · No changelogs in docs: status is a snapshot, MEMORY is ~10 lines, git keeps history · Jamie
- 2026-11-16 · Claude plans, specs and reviews; ChatGPT executes everything (code, migrations after "apply it", live content drafts, tests) from Claude's prompts · Jamie
- 2026-11-16 · Photo-slot live test: Jamie uploads/previews/approves; agent prepares local files and verifies live read-only after confirmation · Prompts - Small fixes.md
- 2026-11-16 · Superseded planning and handoff documents are deleted; use git history instead of keeping archive copies · Docs cleanup prompt

- 2026-11-16 · Home photo slots create hidden/non-centre rows unless explicitly marked public/centre; centre uniqueness includes hidden rows · TKT-110 data contract

- 2026-11-16 · Canonical About anchor is #about with #pivot compatibility; My story/Articles/Resources are direct nav links, About/Experience old visuals retired · TKT-111 prompt

- 2026-11-16 · About constellation: public centre-first photos capped at twelve; sparse centre/row, desktop ring, phone swipe row, finished static/reduced-motion layout · TKT-112 prompt

- 2026-11-16 · Experience uses opted-in chronological stops (newest five plus Projects at most), a reversible pinned desktop curve, natural-flow phone cards and complete static fallbacks; art follows in TKT-115 · TKT-113 prompt

- 2026-11-16 · /about is an ISR My story editorial page; empty Story uses the full public About copy, shared Markdown, and the existing Contact anchor/owner approval invalidation · TKT-114 prompt

- 2026-11-16 · Experience uses the approved Storage background/whole mascot on the shared SVG guide; phones fetch only the portrait still and reduced motion/no JS use its midpoint · TKT-115 prompt

- 2026-11-16 · Desktop Experience pins header/curve/art, reduces mascot height to 88px and scrolls only long cards; About background redesign remains a separate review · Jamie / TKT-116

- 2026-11-17 · About uses a quiet gold/blue CSS atmosphere; browser Back from another page returns Home to clouds while explicit chapter links remain supported; university changes go through owner review · Jamie

- 2026-11-17 · Activating an Experience stop scrolls the existing desktop clock to the role so mascot, path and card stay synchronized; phones/static views retain natural flow · Jamie

- 2026-11-17 · About polish photo slots await owner upload/approval; orbit/story-line design remains an external preview only; Background aliases, grouped nav, public JH/PassLoop marks and horizontal Work screenshots are approved code scope · Jamie’s three polish prompts

- 2026-11-17 · Desktop Work screenshots scrub sideways from the existing scroll clock; dots seek it, phone Work stays unpinned, and shared browser frames fit the first image with macOS traffic lights; Cyterly’s asset has no baked border and remains unchanged · Home polish 5

- 2026-11-17 · JH/PassLoop geometry must be auto-traced from original images with <2% thresholded-mask difference; expanded branding fits beside its control and the 92px collapsed rail stacks mark/expand without overlap · Home polish 6
- 2026-11-17 · Home polish 7 supersedes About polish 3, the Experience curve/mascot and standalone Work: one navy editorial dial, all public opted-in jobs/featured projects, compact/static stacks at ≤900px; highlights are explicit owner-approved data; Storage art deletion waits for replacement deployment · approved dial prompt
- 2026-11-17 · Jamie approved the project-highlights migration only; content proposals remain drafts and Storage retirement waits for replacement deployment · Jamie

- 2026-11-17 · Home polish 8 replaces Toolkit with the approved five-capability What I build scene; editable copy/empty Credly URLs reuse Technology, SVG geometry stays in code, primary links share bounded/reduced-motion-safe GSAP effects, and CV bullet edits remain owner-reviewed drafts · approved prompt

- 2026-11-18 · Fit complete capability SVGs in both desktop axes, place Cloud certifications below its tags, retain reusable editors/gates, and require explicit “delete” for the reviewed external Media/Storage cleanup plan after deployment · Jamie’s diagram fixes and Media cleanup prompt

- 2026-11-18 · Dial Experience stops are ordered by experience_items.sort (ascending), not dates; the order changes only through an approved Content Drafts set · Home polish 9

- 2026-11-18 · The contact CTA is its own full-width banner section after What I build, not part of its pinned scene, with no supporting line until Jamie approves one · Home polish 9

- 2026-11-18 · Jamie explicitly approved the reviewed delete/move plan; local cleanup is complete, and Storage removal waits for deployment/API access without requiring repeat approval · Jamie: delete

- 2026-11-19 · Contact uses the approved editorial project brief directly after Creator; project-only groups, optional message and shared pill motion replace room/monitor footage. Preserve legacy message budgets/transport during rollout; new six-file media retirement needs separate delete approval · Contact redesign and Jamie’s apply approval

- 2026-11-19 · Jamie approved the six-file Contact media retirement: local files removed with verified hashes; Storage copies wait for redesign deployment/API access without repeat approval · Jamie: delete

- 2026-11-19 · Contact redesign items 6–7 supersede the standalone banner: Creator follows Hero; Contact follows What I build with the large heading/gold glow above the brief, no extra CTA button or pinned hold · Jamie’s approved prompt

- 2026-11-19 · Shared top/floating navigation uses a gold circular logo background with a dark JH silhouette for contrast against navy; preserve its size and layout · Jamie’s logo request

- 2026-11-19 · Feedback and Auto/Day/Night controls in both shared bars match the logo’s gold circle, with navy icons and lighter-gold hover; preserve focus and behaviour · Jamie’s request

- 2026-11-19 · Supersedes filled navigation circles: JH, feedback and colour-mode controls use gold borders and transparent interiors, preserving the white JH mark and gold control icons · Jamie’s clarification

- 2026-11-19 · /projects is “Selected Work”: capability filter chips (All + the five What I build items, single-select, state in `?capability=` via the browser so the page stays pre-rendered), Featured block, numbered list with a desktop-only cursor preview, and an ending band; /projects/[slug] is a case-study template with sticky mini-index from `##` headings, optional diagram, Next project card · Jamie’s approved mockups

- 2026-11-19 · Project capabilities/status/diagram are Content-Draft-editable (not in the project editor); their migration stays unapplied and the draft sets stay uninserted until Jamie says “apply it” · Jamie’s instruction

- 2026-11-19 · What I build and project diagrams share one renderer (`components/diagram.tsx`) and the same shape format · Jamie’s prompt
- 2026-11-19 · /about is a chapter reader (rail + progress, photo prints, pull quotes, principle cards) driven only by the story Markdown; the headline is the About title, and an empty story shows only hero, About text and the starter line, never placeholders · Jamie’s prompt

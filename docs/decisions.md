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

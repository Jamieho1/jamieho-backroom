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
- 2026-11-21 · Journey stops may carry an optional `journey_photo` (Content-Draft-editable): white print in the dial centre, line icon becomes a gold ring badge; migration unapplied, draft set uninserted · Jamie’s request
- 2026-11-21 · Creator → Background is a reversible opacity/transform cross-fade (`fadeIn` on the dial chapter), never a cut; Background photos are ~28% larger on a 43% ring · Jamie’s request
- 2026-11-21 · /about, /projects and case studies share one type/spacing scale (`app/page-scale.css`, real step-downs: heroes 60/56/48px, body 15px); photos and screenshots are shown whole, never cropped or zoomed; dial journey photos carry the gold caption tag derived from org and location · Jamie’s feedback

- 2026-11-23 · PassLoop P1 uses section/topic-ordered navigation, a modal question drawer, split code/console and account-guarded debounced autosave; collapsed rail has no logo; legacy Practice and P2–P4 scope remain unchanged · approved P1 prompt

- 2026-11-23 · PassLoop P2 keeps custom test inputs in separate own-user storage, runs Python per case with a five-second deadline and grades only known expectations; LRU Cache retains ID 146 under LLD; Submit uses catalogue tests only · approved P2 prompt

- 2026-11-23 · PassLoop P3 stores typed complexity independently and immutable own-user Submit snapshots; compares authored expected complexity without grading, and confirms before loading code; console toggle is icon-only with no repeated heading/ready label · approved P3 prompt and Jamie's feedback

- 2026-11-23 · Jamie approved live P2/P3 application; remote versions 20261123110809/20261123110824 create only own-user cases/complexity/submission storage, preserving legacy practice data; frontend push/live review remain Jamie’s step · explicit “apply it”

- 2026-11-23 · P4 requires authored follow-ups and multiple complete approaches for every catalogue question; one marked optimum drives Expected complexity, and related questions follow Notes concepts/topic then the same section without inventing LLD neighbors · approved P4 prompt

- 2026-11-23 · The practice panel toggle shows “Console” beside its chevron in both expanded/collapsed states; the redundant panel heading and Python ready label remain removed · Jamie’s clarification

- 2026-11-23 · Inline code nested inside Markdown highlights uses white text on its dark grey chip; surrounding highlighted prose keeps its readable yellow/black treatment · Jamie’s readability feedback

- 2026-11-23 · P5 keeps one section home per question and links homes through existing Notes-topic concepts/prerequisites; related links can cross homes while lists/drawer/arrows cannot; problem controls share one header row and class-design displays Low Level Design · approved P5 prompt and Jamie’s layout request

- 2026-11-23 · Companies is public, owner-authored through Content Drafts, with optional home-media logos/monograms and parent-filtered public question counts; company drafts unpublish instead of removing rows, anonymous experiences have no author · approved C1 prompt

- 2026-11-23 · C1 schema application approved and confirmed as remote 20261123125602; company content remains unseeded and Jamie pushes/reviews frontend separately · Jamie’s “apply it”
- 2026-11-23 · System design workspace: no AI hints/feedback for now ("Compare with model answer" checklist instead); @excalidraw/excalidraw approved for the whiteboard route only · Jamie

- 2026-11-23 · C2 company tabs reuse the shell topic-column collapse/sheet and existing per-user problem flags/passed-submit completion; note references retain Notes access and have no new progress model; experience details remain C3 · approved C2 prompt

- 2026-11-23 · Published company experiences use anonymous article pages and level-filtered lists; related stories cap at three same-company and five same-level other-company items, with shared owner-only draft previews and no votes/comments/premium controls · approved C3 prompt

- 2026-11-23 · Experience “What to prepare” uses `prep_links` (note/question/behavioral_theme) plus `[[kind:ref]]` chips; role notes reuse id-prefix section assignment (full-stack-, fde-, data-science-, ml-) and role pages stay Soon until a readable note exists · C4 spec

- 2026-11-23 · System-design questions live in one owner-managed `system_design_questions` table (Markdown solution, quiz JSON, S3 step JSON) with own-row quiz attempts and flag/done tables; `/interview/system-design/<slug>` is resolved inside the existing `[section]/[mode]` route (practice/notes are reserved slugs); the score is recomputed server-side and visitors' attempts stay in localStorage · S1 spec

- 2026-11-23 · Whiteboard: `/interview/system-design/<slug>/whiteboard` with Excalidraw 0.18.1 (exact pin) loaded only via next/dynamic ssr:false; template and frames generated in code from question data; boards autosave per account (`system_design_whiteboards`, own-row RLS) or to visitors' localStorage; fonts self-hosted; phones get a note plus preview · S2 spec
- 2026-11-23 · Interview steps (S3): step shape is validated in TS and SQL (id/title required, optional category/question/instruction/minutes/frame/how_to_answer/model_answer/checklist/clarifying); voice is browser Web Speech only and hidden when unsupported; in-progress answers autosave in the browser only, "Finish attempt" snapshots go to own-row `system_design_attempts` (visitors: last 3 in localStorage) · S3 spec

- 2026-11-23 · System-design solution diagrams own their full scoped styles, render immediately and adapt to reading-column width; shared geometry is reused with optional obstacle-avoiding edges while project defaults stay unchanged · Jamie’s Tiny URL diagram feedback

- 2026-11-23 · System-design related Notes is directly accessible in the main question tab row, linking the selected note or Notes overview; the second column stays for questions · Jamie’s tab-placement request

- 2026-11-23 · SQL practice: Postgres dialect via @electric-sql/pglite in the browser (runtime dependency, SQL routes only, Web Worker); SQL 50 list from LeetCode, all content own words · Jamie

- 2026-11-23 · SQL practice runner: PGlite 0.5.13 (exact pin, now a runtime dependency) runs only in a dedicated Web Worker on `/interview/sql/problems/[lc]`; PGlite ignores statement_timeout so the 2 s limit terminates the worker; one SELECT/WITH statement in a READ ONLY transaction, 1,000-row cap; SQL numbers live in their own catalogue and `practice_submissions.language` allows `SQL` (migration 20261123230000) · Q1 build

- 2026-11-24 · SQL notes (Q4): three fixed notes `sql-basics`, `sql-tackling`, `sql-postgres-mysql` on `/interview/sql/notes` (order fixed in code, Coming soon until drafted); the SQL notes migration seeds them empty because notes drafts are update-only; SQL numbers are valid question chips/prep links next to DSA numbers; notes render and validate note/question chips · Jamie's Q4 ticket

# Recent work

Current state: [docs/status.md](docs/status.md). Selective context: [docs/README.md](docs/README.md).
Earlier dated history is preserved in [docs/archive/memory-through-2026-11-05.md](docs/archive/memory-through-2026-11-05.md); do not read routinely.

## 2026-11-06
- Replaced the outdated agent briefing with a sub-300-word entry point and focused docs for status, architecture, journey, security, operations and workflow. Archived previous MEMORY verbatim; shortened Claude's entry point.
- Reconciled current local code through b62d47a: Home v1.2 preview remains /journey; phone journey uses stills without video downloads. No application, migration or live changes. Documentation checks recorded in docs/status.md; no app tests rerun.

- Homepage change authorized 2026-11-06: journey moved to / with /journey redirect; no entry gate; supplied day/night hero artwork, subtle light animation, yellow display Welcome, top-to-floating navigation and separate site-logo home link; About/Techstack renames; removed desktop shortcut and fullscreen image growth. See docs/journey.md and docs/status.md. Switch on and app Close target /desktop. No migration/live change, commit or push. 517 unit/database tests and build/static checks passed; isolated desktop/390px E2E 121 passed, 3 existing skips with installed Chromium override. Previous docs edits retained.
- Final framing pass retained all hero characters on narrow desktops. Final build/static checks and focused browser rerun: 33 passed, 1 skip. Repeated full run had one intermittent pre-existing /about WebGL re-enable timeout, passing on focused rerun; documented in docs/status.md.
- Shortened hero-to-About scroll by about 59% (1.6 → 0.65 viewport heights), kept hero copy visible to 85% of the chapter to remove the empty tail. See docs/journey.md; no migration, deployment, commit or push.
- Timing follow-up validation: typecheck and 25 journey unit tests passed; whitespace clean.
- Hero readability discussion: proposed reserved top sky + compact glass description/social panel and clearer glass scroll cue; layout choice pending. Diagnosed local prerendered Cyterly shots list as empty; local PNG is not an uploaded public project screenshot. No code/content/media/database changes; docs updated, whitespace checked.
- Implemented approved top-sky glass hero, role/description parsing, Contact-derived YouTube/Instagram buttons and clickable glass scroll cue. Approved hero title/body updated live via MCP and verified; Contact links already matched. No schema migration. Cyterly live screenshots confirmed empty; supplied public image bundled as fallback, overridden by database screenshots, with no Storage upload/project-row write. Layout/image require deployment. Typecheck, 520 unit/DB tests, build/static checks and isolated desktop/390px suite passed (123 passed, 3 skips); docs/status.md records current state.
- Corrected the hero per Jamie's clarification: artwork covers the full viewport, heading remains top, description/social glass sits below characters over the city. Applied focused UI UX Pro Max glass/contrast guidance; fixed CSS prefix ordering so standard backdrop blur survives the build, and prevented scroll-pill wrapping. No new database/content/migration changes; original public art unchanged. Current checks recorded in docs/status.md.
- Final full-background validation: 520 unit/DB tests, typecheck and build/static checks passed; focused browser suite 23 passed, 1 skip. One unrelated /about WebGL re-enable timeout remains intermittent in the broader run. Corrected glass samples exceed 4.5:1 in reviewed day/night states; no claim for untested states. Docs updated; no push/commit/deployment.

2026-11-06: Refined homepage introduction and scroll cue into coordinated navy glass with fine borders, muted gold and outline socials; full-background art/placement retained. Check passed (520 tests); focused browser checks 23 passed/1 existing skip. Local day/night desktop/phone previews reviewed. No database/migration changes; uncommitted, Jamie deploys/verifies.

2026-11-06: Added existing Contact LinkedIn link to homepage introduction with matching icon. Typecheck, content tests and build passed; no database/migration changes.

2026-11-06: Moved hero Welcome/name below the hands above introduction; removed displayed trailing period. Full-screen art retained, phone social spacing tightened. Typecheck/build passed; no database changes.

2026-11-06: Hero socials now use platform colours; fixed shared YouTube glyph white-on-white play triangle. Typecheck/build passed; no database/migration change.

2026-11-06: Raised hero heading halfway between fingertips and glass panel using responsive anchors. Build passed; no database/migration change.

2026-11-06: About grade hidden only in journey, text contrast strengthened and heading reduced; phone paragraph unclamped. 12 content tests/typecheck passed. Role wording live SQL rejected by automatic approval review; await explicit approval. Shorter heading choice pending; no database change.

2026-11-06: Jamie chose original About heading at reduced size and explicitly approved live role wording. Applied/verified slash removal in site_sections.about. No migration; cached page refresh/deploy needed.

2026-11-06: Enlarged hero Welcome/name and added local feathered navy contrast backdrop. Cyterly screenshot contains full dashboard with pan disabled, including still fallback. Typecheck/16 focused tests/build passed. No database changes.

2026-11-06: Softened daytime hero via reversible CSS colour grade; day heading navy/teal with pale halo, night light/gold on navy. Build passed; local responsive previews reviewed. Original media and database unchanged.

2026-11-06: Corrected overly pale day treatment: restored colour/depth with mild CSS grade and reduced heading halo. Night unchanged. Production build passed.

2026-11-06: Installed approved softer 1920×1080 landscape day hero as hashed WebP; removed CSS image grade. Portrait/night assets retained. Check passed (521 tests/build/static assertions); local previews reviewed. No database changes; uncommitted.

2026-11-06: Generated/installed matching 1920×1080 day/night landscape hero pair with extended detailed sky and larger aligned characters. Yellow/white editable heading restored above characters; lower intro unchanged. Existing phone portraits retained. Check passed (521 tests/build/static); focused browser checks 23 passed/1 existing skip, including updated artwork-selection check. No database/migration change.

2026-11-07: Added gold Schedule a call placeholder immediately after LinkedIn in hero (disabled; functionality deferred). Typecheck/build passed. No database change; uncommitted.

2026-11-08: Added subtle reading surfaces behind About/Projects/Experience/Creator pitch text, retaining geometry. Strong paragraph colour and no extra copy fade; responsive inset and reduced-transparency fallback. Local section previews checked; typecheck and final production build passed. No database changes.

2026-11-08: Replaced final Switch on CTA and desk copy with Contact Us monitor, social logos and existing contact form/action. Contact Us nav/direct anchors go to form; static fallback included. Check passed (521 tests/build/static), monitor previews fit desktop/phone; focused browser checks 23 passed/1 existing skip, including honeypot submission without inbox/email writes. No database/migration change.

2026-11-08: Retired /about and /desktop via redirects; shared Journey dropdown/Articles/Resources/Privacy navigation, visible Auto/Day/Night and gold auth buttons. Resources has generic blurred previews and existing-permission unlocks for Notes/Practice/Behavioral; app windows close there. No billing/DB change. Final check passed (517 tests/build/static); full E2E 115 passed/3 skips plus 10 final cross-page/theme/resource checks.

2026-11-09: Reduced Creator pitch heading across desktop/phone and static fallback; proposed “AI engineering, explained” awaits wording/live-content approval. No database/migration change. Production build and whitespace checks passed; no new browser-suite run.

2026-11-09: With explicit approval, saved Creator title “AI engineering, explained” live in site_sections.writing; database readback verified. Title only; no schema migration. Public cache refresh/rebuild needed; compact typography remains a local change.

2026-11-10: Left-aligned full top-bar links; centred floating bar retained, Journey hover/click and SVG chevron. Hero glass replaced with compact approved tagline/local scrim, buttons retained. Articles cover links/full-height sidebar, Cloud & Ink app palette, compact Notes/Practice/Resume sizing and sticky desktop Notes visuals. No database/migration change. Check passed (518 tests/build/static); final build and 38 affected desktop/phone browser checks passed. Docs updated; uncommitted, Jamie deploys/verifies.

2026-11-10: Raised hero tagline/buttons into the cloud bank and lowered Welcome/name toward the characters, with smaller phone offsets. Artwork unchanged. Production build/whitespace and local desktop/390px previews passed; no database/migration change or new full-suite run. Docs updated; Jamie deploys/verifies.

2026-11-11: Privacy, Articles, Notes, Practice, Resume & Stories and resource gates now use plain full-width pages under the root top bar, without window controls/backdrop. Privacy shares Resources Cloud & Ink; existing content, access checks/logging and internal scrolling retained. Projects/Settings remain windows. Also clipped an existing static-hero scrim overflow and updated obsolete hero tests. Check passed (518 tests/build/static); full browser run 124 passed/3 skips with remaining stale hero assertion corrected and both focused hero checks passing. Docs updated; no database/migration/deployment, commit or push.

2026-11-11 CI recheck: supplied failures match committed legacy glass-card assertions and pre-fix phone overflow. Verified pending local fixes against a full isolated browser rerun: 125 passed, 3 existing skips. No new code changes; docs updated. Fixes still need Jamie’s commit/push before CI can run them.

2026-11-11: Projects list/detail/manage now share the plain Resources-style shell/palette. Added direct Projects link to top/floating bars; Journey showcase renamed Work, preserving #projects and project content. Typecheck, 518 unit/DB tests (maxWorkers=2 after local setup timeouts), build/static and full browser suite (125 passed/3 existing skips) passed. No database/migration/deployment, commit or push. Docs updated.

2026-11-11: Fixed Articles index hiding the sidebar post list behind currentId. Latest posts now shows on index and detail pages with existing filters/newest-first data/eight-at-a-time paging. Typecheck, 13 article UI tests, build and 8 Articles desktop/phone checks passed. No database/migration change; docs updated, uncommitted.

2026-11-11: Matched Projects/Articles cards to Resources using shared surface/radius/border, 24px bodies, 22px titles and gold action footers. Removed project card window decoration, retained covers/tags/Featured/detail links. Typecheck, 13 UI tests, build and 20 Articles/Projects desktop/phone browser checks passed; light/dark previews fit. No database/migration change; docs updated, uncommitted.

2026-11-11: Made each article card one accessible native link covering image, content, footer and padding; removed nested links. Typecheck, 13 article UI tests, build and 10 Articles desktop/phone browser checks passed, including blank-space navigation. Docs updated; no database/migration change, uncommitted.

2026-11-11: Articles desktop sidebar/reading panes now scroll independently; only near-bottom sidebar scroll auto-loads more latest posts. Typecheck/build and 11 browser checks passed, 1 phone skip. Personal pins remain requested/pending storage choice (account-sync vs browser-only); no pin code/migration or live changes. Docs updated; uncommitted.

2026-11-11: Implemented account-synced personal article pins (Pin/Unpin and Pinned posts) with authenticated server actions, account-isolated client state and retry handling. Prepared 20261111180819_article_pins.sql via CLI; local RLS tests prove own-only access, published/app-access insertion, no anonymous/UPDATE access and cascade cleanup. Migration NOT applied live; approval needed before deployment. Privacy/export coverage updated. Typecheck, 530 tests/build/static passed; full browser run 129 passed/4 skips with one existing intermittent contact failure passing focused rerun (2 passed); pin flows passed desktop/phone. Final grant tightening passed all 5 pin DB tests. Docs updated; uncommitted, no push.

2026-11-11: With explicit approval, applied local 20261111180819_article_pins.sql through Supabase MCP to lhacrrnwddvpawsreamk; remote version 20261111181807 (article_pins). Verified RLS enabled, all 3 self-only policies, no anonymous or authenticated UPDATE access, backup SELECT and cascading account/article FKs. Advisors had no article-pins finding (existing record_signin/password advisories remain). No live test records created. Frontend/privacy/export code still needs Jamie’s push/deployment. Docs updated; whitespace check passed.

- 2026-11-11: Added Guides (public resource pages separate from articles) locally; migration applied live (remote 20261111224113); frontend needs deploy. See docs/status.md.


## 2026-11-13 — About photos and click isolation
Replaced the Imperial still with three supplied portraits driven by chapter scroll, plus manual reduced-motion fallback. Disabled About Markdown navigation and made inactive chapters inert to stop invisible project links intercepting clicks. Kept existing title/body; suggested shorter copy in chat. Jamie chose Storage, not Git: optimized ignored about-*.jpg files need his upload to home-media before deployment. No database/live update. Typecheck, 540 tests, isolated build/static checks and 19 journey browser checks passed (one phone-only test skipped on desktop); inspected local desktop/390px layouts.

## 2026-11-14 — Status sync
Production verified on cf9b3c3 (all work through 2026-11-13 deployed). About photos still missing from home-media Storage; flagged in docs/status.md. No code change.
About photos confirmed uploaded to home-media later the same day; status updated.

## 2026-11-14 — Content Drafts planned
Grilled, specced and ticketed "Claude drafts, Jamie approves" (Resources/Content Drafts - PRD.md, TKT-98–108; TKT-99/100 later). Build prompts in Resources/Prompts - Content Drafts.md. Builds before Home v1.3 (homepage redesign, decisions agreed same day; spec next). No code change.
Home v1.3 specced and ticketed (Resources/Home v1.3 - PRD.md, TKT-109–116; build + image prompts in Resources/Prompts - Home v1.3.md). Starts after TKT-108; TKT-109 mascot art startable now.


## 2026-11-14 — Experience artwork
Generated the requested landscape, transparent walking mascot and portrait still in sibling Media/Experience-art/, with prompt notes. Verified dimensions/alpha and exact saved copies. Assets only; no code, database, upload or deployment change.


## 2026-11-14 — TKT-98 content drafts
Built the site_sections-only review/approve/discard slice at /manage/review. Private owner-checked SQL trigger applies the whole set atomically without exposing a new RPC; TypeScript and SQL allowlists reject unsupported operations and fields. Existing editors/rendering/navigation untouched. Migration 20261114020933_content_changes.sql NOT applied live; wait for Jamie’s explicit “apply it”. No live data, secrets, dependencies, commit or push. Passed: typecheck, all 604 unit/database tests, isolated production build/static assertions and 4 desktop/phone review browser checks. Additional real Next/PGlite approval→homepage ISR, discard, audit, visitor 404 and private/no-store headers verified; temporary servers stopped. Scope/contract and file inventory are in docs/content-drafts.md and docs/status.md. Pending explicit live migration approval and Jamie’s later live verification.


## 2026-11-14 — TKT-98 migration applied live
Jamie explicitly said “apply it”. Applied local 20261114020933_content_changes.sql through Supabase MCP as remote 20261114101016 (content_changes). Verified RLS, owner policy, denied anon CRUD/private function execution, export-only service role, trigger hardening and record_signin-only public RPCs. No draft rows created; site_sections fingerprint unchanged. No new feature-related advisor findings. Docs updated; frontend deployment and Jamie’s live verification still pending. No commit/push.

## 2026-11-14 — Article image folders
Jamie renamed article-images folders to post<N>-<slug> (post1-3-personal-ai-agents, post2-stop-copy-pasting-into-claude) and wants this convention for future posts. With his "apply", Claude rewrote both articles' cover_url/body links to the new folders (23 links, all verified to exist). The article editor still uploads to <slug>/ folders; changing it is a pending small ticket. Renaming folders breaks links: update links in the same step.


## 2026-11-14 — TKT-101 homepage preview
Implemented owner-only Draft Mode + httpOnly set-id cookie, immutable section overlays, preview-only gold markers and bottom approval/discard/exit bar. Existing engine and public rendering/motion preserved. Passed typecheck, 618 unit/DB tests, build/static assertions, 23 journey/review browser checks (one existing desktop skip), and 14 real Next/local PGlite preview browser checks including copied cookies with signed-out/member sessions. No schema/live data changes, secrets, commit or push; needs deployment and Jamie’s live verification. TKT-98 fixture typing fix already present and reverified. Details/file inventory in docs/status.md; cookie/test workflow in docs/content-drafts.md.


## 2026-11-14 — Owner draft-count badge
Added a gold N to review link to shared top/floating navigation, visible only for owners with positive draft counts. Owner-checked server HEAD count retains existing RLS; zero/errors/non-owners render nothing and account switches reject stale replies. Refreshes on navigation/focus and successful reviews. Passed typecheck, all 625 unit/DB tests, build/static assertions and 22 desktop/390px browser checks including visibility/zero/overflow. Docs updated; no migration, live data change, commit or push. Jamie deploys/verifies live.

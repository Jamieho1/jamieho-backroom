# Current state

Updated 2026-11-14. Jamie pushes and verifies production.

- Deployment (checked 2026-11-14 via Vercel MCP): production is READY on cf9b3c3 (About photos), so everything listed below through 2026-11-13 is committed, pushed and deployed. Pins and Guides migrations are applied live.
- About photos: the three about-*.jpg files are in the home-media bucket (verified 2026-11-14), so the deployed About strip has its images.

- Home journey is /. /journey redirects home; retired /about redirects to /#pivot, /desktop to /resources. Legacy desktop app queries redirect to canonical app routes.
- Shared arrival/floating/app navigation: Journey dropdown, Projects, Interview, Articles, Resources, Privacy, visible Auto/Day/Night and gold sign-in/out buttons. Auto follows system preference; explicit overrides persist in jb.theme. Privacy/Projects/Articles/Notes/Practice/Resume & Stories use plain pages; only Settings retains window controls. Owner Settings/edit controls are available there.
- Resources now lists only public Guides (TKT-118). Interview is an additive placeholder shell at /interview. Notes (/notes), Practice (/practices) and Resume & Stories (/behavioral) retain existing server/RLS access checks; membership-gate components remain available for future courses. Payment integration is not implemented.
- Hero uses matching generated 1920×1080 day/night landscapes with extended sky and aligned larger characters. Yellow/white editable heading sits above them; existing phone portraits remain. No CSS colour grading/pale halo. Welcome/name sit closer to the characters; compact tagline and social buttons are raised toward the lower cloud bank over a soft local scrim; the large glass card is removed. Schedule a call remains disabled.
- Reading cards behind About/Projects/Experience/Creator copy retain geometry. About keeps its original smaller heading, full-opacity paragraph and untruncated phone text; grade omitted only from journey display.
- Contact Us ending removes desk copy/page-opening CTA. Monitor holds social logos and the existing contact form/action; static fallback included. Contact anchors navigate to the form.
- Cyterly uses the approved bundled image only when database screenshots are empty; preview contains the full screenshot without pan. Owner screenshots take precedence.
- Live content previously verified: approved hero copy, About slash removal and supplied Contact social URLs. Direct database edits need ISR refresh/rebuild for cached public copy.
- Canonical apps/auth/RLS/editors retained. Phones download no journey clips; desktop keeps room/monitor clips. No schema/migration/dependency/deployment change. Historical migration status and outstanding domain/subdomain SSO sign-offs remain unverified.

- Creator pitch heading reduced to 28–44px desktop / 22–28px phone, including static fallback. Approved Creator title “AI engineering, explained” saved live and verified on 2026-11-09; title-only content update, no schema migration. Cached public copy needs ISR refresh/rebuild; smaller typography still requires deployment.

- Top-bar links now group left; floating bar remains centred. Journey supports hover/click with an SVG chevron. App surfaces match Resources in light/dark/Auto. Articles sidebar stretches full height and covers open slug pages. Notes visuals stay sticky on desktop; compact Notes/Practice/Resume typography and spacing applied. No database/schema/dependency changes.

- Plain app layout (2026-11-11): removed window chrome/backdrop from Privacy, Articles, Notes, Practice, Resume & Stories and locked resource screens. One shared root top bar, Resources Cloud & Ink palette including Privacy. Existing protected server content/access checks, app-open logging, scrolling and resizers retained. No policy copy, data/schema or dependency change.

- Projects follow-up: catalogue, case studies and management use the plain shared app shell and Cloud & Ink palette. Direct Projects link in top/floating navigation; Journey showcase renamed Work with existing #projects anchor preserved. Typecheck, all 518 unit/database tests (local maxWorkers=2), production build/static assertions and full browser suite (125 passed, 3 existing skips) passed.

- Articles sidebar follow-up: Latest posts now appears on index and detail views; filters, newest-first published data and pagination retained. No database change.

- Projects/Articles cards now share Resources surfaces, rounded border, body spacing and gold action-footer treatment. Project card window decoration removed; images, Featured/tags and detail-page links retained.

- Articles scroll follow-up: sidebar remains stationary while the right reading pane scrolls. Only sidebar/list scroll near the end auto-loads more latest posts; Show more remains. Personal pins are implemented for account sync with private RLS, error/retry handling and a Pinned posts sidebar. Migration 20261111180819_article_pins.sql applied live with approval on 2026-11-11; remote version 20261111181807 (article_pins). Catalogue verification confirmed RLS, own-only policies, denied anonymous/UPDATE access, backup reads and cascading foreign keys. Frontend deployment remains Jamie’s step.

- Guides (2026-11-11, local, uncommitted): new public Guides resource (table public.guides, /guides, /guides/[slug], /guides/manage, Resources shelf). Migration 20261111220000_guides.sql applied live with Jamie's approval on 2026-11-11 as remote 20261111224113. Content: unpublished guide `mcp` created (body moved from the former article draft); that article draft became the unpublished post article `stop-copy-pasting-into-claude`. Frontend requires deployment. Typecheck, full unit/database suite (537 tests, maxWorkers=2) and production build + static assertion passed (build run without Supabase env). Browser/e2e checks not run.

## Validation

Account pins (2026-11-11): typecheck, 530 unit/database tests (maxWorkers=2), production build/static assertions passed. Full desktop/390px browser run: 129 passed, 4 skips; one previously intermittent desktop contact honeypot submission failed, then passed on a focused desktop/phone rerun (2 passed). Pin/unpin, failed-save retry, independent sidebar pagination, app access and account-switch isolation checks passed. Approved migration 20261111180819_article_pins.sql is applied live as remote 20261111181807; RLS/grants/policies/constraints verified through MCP. Security advisors reported no article-pins finding. Privacy updated and article_pins added to encrypted exports. Final explicit grant tightening passed the 5 pin database tests. No dependencies changed, no commit/push/deployment.


- About photos (2026-11-13, local): three supplied portraits replace Imperial still in a reversible scroll-driven strip; reduced-motion/no-JS supports manual horizontal scroll. Inactive chapters are inert, fixing invisible project links intercepting About; About Markdown links display without navigation. Title/body unchanged pending Jamie’s wording choice. Jamie chose Storage: upload the three about-*.jpg files listed in journey.md before deploying; photos remain ignored/outside Git. No schema, live content, dependency or production change. Validation: typecheck, 540 unit/database tests, isolated production build/static assertions and journey browser checks (19 passed, one desktop skip for a phone-only test) passed. Local desktop/390px screenshots inspected; phone portraits fit fully beneath navigation.


Experience artwork (2026-11-14): generated Media/Experience-art/experience-bg.png (1672×941), experience-mascot.png (1024×1536, genuine alpha) and experience-phone.png (941×1672). Warm cloud-to-London path; separate walking mascot and composed phone scene. References/prompts/dimensions in that folder’s generation-notes.md. Assets remain outside Git; no website integration, Storage upload or deployment. Visual review, dimensions, transparency and saved-copy hashes checked; runtime tests not applicable.


## TKT-98 — content draft first slice (2026-11-14)

Local implementation: site_sections title/body update proposals, strict allowlist, atomic owner-checked private SQL trigger, audited approval, status-only discard and owner-only dynamic /manage/review with current/proposed values. Fixed sections cannot be inserted/deleted through drafts. Existing editors/rendering/navigation and live data unchanged. Migration 20261114020933_content_changes.sql was applied live with Jamie’s explicit approval on 2026-11-14 as remote 20261114101016 (content_changes). Backend is ready; frontend still requires Jamie’s deployment. No commit or push. Public RPC restriction preserved. content_changes included in encrypted exports. Validation complete: npm run typecheck; full unit/database suite (80 files, 604 tests, maxWorkers=2); isolated production build and static assertions; new desktop/390px browser suite (4 passed). Real Next server-action verification against disposable local PGlite also passed: current/proposed review, approval audit, homepage ISR without rebuild, discard unchanged and visitor 404. Owner/visitor response headers verified private/no-cache/no-store. Local review screenshot inspected. git diff --check passed. No production browser or live database used. See content-drafts.md for scope. Ticket is not Done pending Jamie’s live verification.


TKT-98 file inventory:
- supabase/migrations/20261114020933_content_changes.sql
- app/actions/content-drafts.ts; app/manage/review/page.tsx and review.css
- components/content-drafts/review-list.tsx
- lib/content-drafts/allowlist.ts, review.ts, types.ts
- tests/db/content-drafts.test.ts; tests/e2e/content-drafts.spec.ts
- tests/unit/content-drafts.test.ts, content-drafts-actions.test.ts, content-drafts-review.test.ts
- scripts/export-tables.json
- docs/content-drafts.md, README.md, architecture.md, security.md, status.md; MEMORY.md


TKT-98 live migration verification (2026-11-14): Supabase MCP applied the reviewed SQL as remote 20261114101016. Verified RLS/owner-only ALL policy; anon has no CRUD privileges; authenticated CRUD remains owner-filtered; service_role has export SELECT only. Private approval trigger is SECURITY DEFINER with an empty search_path and no API EXECUTE grants. record_signin remains the only public API-callable function. No draft sets were created; site_sections fingerprint matched before/after. Security advisors showed no content_changes finding; existing record_signin/password-protection advisories are unchanged. No website/browser visit, content edits, commit, push or deployment. Ticket remains pending Jamie’s live frontend verification.


## TKT-101 — owner homepage preview (2026-11-14)

Implemented locally: per-set Preview on page; owner-verified Next Draft Mode plus an httpOnly UUID cookie; immutable site_sections overlays; gold changed-block markers; fixed Approve/Discard/Back to list bar. TKT-98 approval rules, journey design/motion, other pages and public static rendering retained. No migration or live data change; no commit/push/deployment. Pending Jamie’s live verification.

Checks: typecheck and full unit/DB suite passed (82 files, 618 tests); production build and unchanged static assertions passed, including /. Journey/review browser suite: 23 passed, one existing phone-only test skipped on desktop. Dedicated real Next/local PGlite preview suite: 14 passed across desktop/390px, including owner hero/About overlays and outlines, approve→live without rebuild, discard, exit, reduced motion, stale selections, forged URLs and copied valid owner cookies in signed-out/member sessions. Preview responses verified no-store/private; unauthorized HTML contains no draft values/summary. Local desktop and 390px screenshots inspected; toolbar fits both viewports and gold markers do not change layout. The reported TKT-98 removed-row type fix is present in this checkout; typecheck and all 34 content-draft DB tests were rechecked successfully.

Files: app/page.tsx; app/actions/content-preview.ts; lib/sections.ts; lib/content-drafts/{preview,overlay,types}.ts; components/content-drafts/{review-list,preview-bar}.tsx and preview.css; components/journey/{journey,screen-contact}.tsx; tests/unit/{content-preview,content-preview-actions,sections}.test.ts; tests/e2e/{content-preview,content-drafts}.spec.ts; tests/content-preview.playwright.config.ts; tests/support/content-preview-api.cjs; docs/journey.md, security.md, content-drafts.md, architecture.md, status.md; MEMORY.md.


## Owner review count badge (2026-11-14)

Implemented locally: small gold “N to review” link to /manage/review in shared top/floating navigation for signed-in owners with pending drafts. Zero, errors and non-owner states show nothing. Count uses an owner-checked server action plus existing RLS, returns only an exact draft count, and refreshes after navigation/focus/review. Existing navigation layout/items/theme controls are preserved. No migration, live data changes, commit, push or deployment; pending Jamie’s live verification.

Checks passed: npm run typecheck; full unit/database suite (84 files, 625 tests, maxWorkers=2); isolated production build and unchanged static assertions; 22 desktop/390px browser checks across badge, shared navigation and existing Settings window behavior. Badge checks cover 2/0 drafts, visitors/non-owners, both bar states and no horizontal overflow. Unit tests cover server owner gate, query status filter/HEAD count, account changes, stale responses, zero/error handling and refresh events. git diff --check passed.

Changed files: app/actions/content-draft-count.ts; components/content-drafts/review-badge.tsx and review-list.tsx; components/site-navigation.tsx; app/globals.css; tests/unit/content-draft-count.test.ts and content-review-badge.test.tsx; tests/e2e/content-review-badge.spec.ts and desktop-window.spec.ts; docs/architecture.md, content-drafts.md, status.md; MEMORY.md.

## TKT-104 — experience content drafts (2026-11-14)

Implemented locally: experience_items insert/update and experience_bullets insert/update/delete in the shared strict allowlist and private SQL transaction. CV editor field limits/normalization, UUID parents, integer sorting and hidden insert defaults are enforced independently in TypeScript/SQL. Approval retains complete previous rows, including deleted bullets; a failed later operation rolls back earlier writes and audit/status. Existing editor UI/direct deletion remains unchanged, as Jamie confirmed.

Owner preview supports Home Experience and /behavioral CV, with entry/bullet gold outlines, Home publication filtering before client serialization and a read-only CV preview. Review offers Home/CV previews; the bottom bar switches views and reuses approve/discard/exit. Preview controls wait for hydration, fixing a phone click-before-handler race found in local testing. Approval revalidates /, /journey, /about and /behavioral. No journey design, motion, navigation, other-table rules or live content changed.

Migration: 20261114110327_content_drafts_experience.sql — **applied live with Jamie’s explicit approval on 2026-11-14**, remote version 20261114114045 (content_drafts_experience). TKT-98's applied SQL is untouched. No commit/push/deployment; ticket remains pending frontend deployment and Jamie’s live verification.

Checks actually run: npm run typecheck passed; full unit/database suite passed (87 files, 706 tests, maxWorkers=2); isolated production builds and unchanged static assertions passed (/, /resources, /privacy, /projects, /articles remain pre-rendered). Relevant journey/CV/review browser checks: 33 passed, one existing phone-only check skipped on desktop. Real Next/PGlite preview integration: final 20 passed at desktop/390px, including approval/discard, deleted history, private/no-store responses, visitor/member copied-cookie isolation and no phone overflow. An earlier phone approval failed before hydration; fixed and the entire integration suite reran successfully. Local preview screenshots inspected. git diff --check passed. No production browser or live database used.

Changed files:
- supabase/migrations/20261114110327_content_drafts_experience.sql
- lib/content-drafts/{allowlist,experience-overlay,overlay,preview,review,types}.ts
- app/actions/content-preview.ts; app/page.tsx; app/desktop/behavioral-content.tsx
- components/content-drafts/{review-list,preview-bar}.tsx and preview.css; components/behavioral/resume.tsx
- lib/experience.ts; lib/journey/{content,timeline}.ts; components/journey/journey.tsx (preview markers only)
- tests/db/experience-drafts.test.ts; tests/unit/{experience-drafts,content-preview-bar,behavioral-content,content-drafts-actions,content-drafts-review,content-preview-actions,content-preview}.test.ts[x]
- tests/e2e/experience-preview.spec.ts; tests/content-preview.playwright.config.ts; tests/support/content-preview-api.cjs
- docs/content-drafts.md, architecture.md, security.md, journey.md, status.md; MEMORY.md


TKT-104 live application (2026-11-14): Supabase MCP applied the unchanged reviewed migration as remote 20261114114045. Read-only verification confirmed both function bodies exactly match local SQL, SECURITY DEFINER/empty search_path, no anon/authenticated/service_role EXECUTE, owner-only content_changes policy and enabled RLS on all three tables. record_signin remains the only public API-callable function. Before/after fingerprints matched for experience_items, experience_bullets, content_changes and site_sections; no test rows or content approvals were made. Security advisors reported no TKT-104 finding; existing record_signin/password-protection warnings remain. Topic docs and MEMORY updated; git diff --check passed. No website visit, commit, push or frontend deployment.

## TKT-105 — projects, articles and guides drafts (2026-11-14)

Implemented locally: editor-derived publishing allowlists and complete merged-row validation in TypeScript/SQL, hidden insert defaults, atomic cross-table approval and full prior-row history. Delete proposals unpublish only; new sets can republish retained rows. Slug revalidation uses committed audit values plus proposed slugs, covering old/new/intermediate paths and all aggregate consumers. Draft links require literal valid HTTPS ASCII hosts (IDNs use punycode), with shared host/port checks; no editor rule is relaxed.

Owner preview covers /projects and details, Home Work, /articles and details, /guides and details, Resources Guides shelf and existing Home latest-media bindings. Gold markers identify changed cards/details/Work items. Lists/Home filter unpublished records; changed unpublished detail rows remain owner-inspectable and labelled. Guide preview timestamps simulate approval ordering; review preserves structured array values. Metadata/new draft slugs have the same owner gate, not cookie-only access. Editors, card designs, navigation and journey motion are unchanged.

Migration: 20261114120122_content_drafts_publishing.sql — **applied live with Jamie’s explicit TKT-105 approval on 2026-11-14**, remote version 20261114125201 (content_drafts_publishing). It adds hardened private URL/publishing helpers and extends the existing trigger; no new public RPC, table RLS/grant or live content changes. Prior applied SQL untouched. No agent commit/push/frontend deployment; frontend deployment and Jamie’s live verification remain pending, so ticket is not Done.

Checks actually run: npm run typecheck passed; full unit/database suite passed (89 files, 826 tests, maxWorkers=2); isolated production build and unchanged static assertions passed. Public /, /resources, /privacy, /projects and /articles remain pre-rendered. Relevant Projects/Articles/journey/review browser checks: 48 passed, 2 existing skips. Real Next/PGlite preview integration: final clean run 30 passed across desktop/390px, including new featured-project publication without rebuild, article/guide previews and discard, unpublish-only deletes, old/new slug HTTP results, new unpublished-slug 404/metadata privacy, stolen-cookie isolation and no phone overflow. Local screenshots inspected. A reused fixture/cache mismatch caused an earlier rerun to fail; clean isolated .next plus fresh disposable database resolved it, and that requirement is documented. Syntax/diff checks passed. No production browser or live Supabase used.

Changed files:
- supabase/migrations/20261114120122_content_drafts_publishing.sql
- lib/content-drafts/{allowlist,publishing-overlay,preview,review,types}.ts; app/actions/{content-drafts,content-preview}.ts
- app/page.tsx; app/projects/{page,[slug]/page}.tsx; app/articles/{page,[slug]/page}.tsx; app/guides/{page,[slug]/page}.tsx; app/resources/page.tsx
- lib/{portfolio-core,portfolio,articles,articles-public,guides,guides-public}.ts; lib/journey/{content,timeline}.ts
- components/content-drafts/{page-preview,preview-bar,review-list}.tsx and preview.css
- components/portfolio/views.tsx; components/articles/library.tsx; components/guides/shelf.tsx; components/journey/{journey,showcase}.tsx (markers only)
- tests/unit/publishing-drafts.test.ts; tests/db/publishing-drafts.test.ts; tests/e2e/publishing-preview.spec.ts
- tests/unit/{content-drafts-actions,content-preview}.test.ts; tests/content-preview.playwright.config.ts; tests/support/content-preview-api.cjs
- docs/content-drafts.md, architecture.md, security.md, journey.md, status.md; MEMORY.md

About copy request (2026-11-14): created pending site_sections/about body draft ecc6ecb3-1e8c-47bf-a04a-1bb0e1aca1f4 for the requested phrase emphasis and generalized employer wording. Preserved the remaining live text/title. Read-back confirmed exact proposed values, draft status and unchanged live body. Existing Markdown rendering supports the emphasis; the first paragraph still fits the existing excerpt limit. Await Jamie’s approval at /manage/review. No code, schema, live-content publication, deployment or browser change; documentation diff check passed.


TKT-105 live application (2026-11-14): Supabase MCP applied the unchanged reviewed SQL as remote 20261114125201. Verified all three function bodies match local SQL, empty search_path, revoked anon/authenticated/service_role EXECUTE, owner-only content_changes policy and enabled RLS on all seven affected/read tables. record_signin remains the sole public API-callable function. Valid HTTPS/IPv6 and rejected HTTP/invalid-host queries passed. Before/after fingerprints matched for projects, articles, guides, content_changes, site_sections, experience_items and experience_bullets; no content approvals or test rows were created. Security advisors showed no TKT-105 finding; existing record_signin/password-protection warnings remain. About wording approval was not part of this migration. Docs/MEMORY and diff checked; no website visit, commit, push or frontend deployment.


## TKT-106 — private app drafts (2026-11-14)

Implemented locally: strict editor-derived draft fields for notes, question_notes, practice_code, practice_stars, behavioral_stories and behavioral_answers; atomic owner-checked SQL approval with complete prior rows, validated catalogue/question IDs, foreign keys and editor limits. Notes metadata stays unchanged; star deletion unstars with history. No catalogue, attempts, editor UI, journey design or RLS changes.

Owner-only gold previews work on Notes, Practice/problem routes and Resume & Stories, including changed-entry selection and read-only controls. Practice preview bypasses live async replacement, disables execution/saves and leaves browser code untouched. Members with app access and visitors cannot see draft values with copied owner cookies. Approval refreshes affected app/problem routes.

Migration **20261114151936_content_drafts_apps.sql — applied live with Jamie’s explicit approval on 2026-11-14**, remote version 20261114155720 (content_drafts_apps). No content, secret, dependency, commit, push or frontend deployment change. Jamie’s frontend deployment/live verification remains pending before the ticket is Done.

Checks actually run: npm run typecheck passed; full unit/database suite 908 tests / 91 files passed (maxWorkers=2); final isolated production build and unchanged static assertions passed for /, /resources, /privacy, /projects and /articles. Real Next/PGlite preview integration: 36 passed at desktop/390px, including previous ticket regressions; existing Notes/Practice/Behavioral UI checks: 28 passed. A test-only unsupported locator option initially failed typechecking; corrected and final typecheck/build plus its 7 focused unit tests passed. Initial browser selector mismatch corrected before the complete successful run. Local phone preview screenshot inspected. git diff --check passed. Tests use synthetic data and local headless Chromium only; no live website/Supabase access.

Changed files:
- supabase/migrations/20261114151936_content_drafts_apps.sql
- lib/content-drafts/{app-allowlist,app-overlay,allowlist,preview,review,types}.ts; app/actions/content-drafts.ts
- app/desktop/{app-page,notes-content,practice-content,behavioral-content}.tsx
- components/notes/reader.tsx; components/practice/{arena,question-notes}.tsx and use-saved-practice.ts; components/behavioral/{questions,workspace}.tsx
- lib/notes.ts, lib/behavioral.ts, lib/behavioral/answers.ts (optional preview markers only)
- tests/db/app-drafts.test.ts; tests/unit/app-drafts.test.ts; tests/e2e/app-preview.spec.ts; tests/content-preview.playwright.config.ts; tests/support/content-preview-api.cjs
- tests/unit/{app-routes,notes-content,practice-owner-ui}.test.tsx; tests/unit/{content-drafts-actions,content-preview}.test.ts
- docs/content-drafts.md, architecture.md, security.md, status.md; MEMORY.md


TKT-106 live verification (2026-11-14): Supabase MCP applied the unchanged tested SQL as remote 20261114155720. All three function source hashes match local SQL; empty search_path and revoked anon/authenticated/service_role EXECUTE confirmed. RLS remains enabled on six app tables and content_changes; owner-only draft policy retained. record_signin is still the only API-callable public function. Catalogue validator accepts the 145 code IDs and rejects unknown IDs. Before/after fingerprints and counts matched across all 13 app/content/draft tables; no test rows or content approvals were created. Security advisors show no new finding; existing record_signin/password-protection warnings remain. Documentation and git diff --check updated; no browser visit, commit, push or frontend deployment. No application tests rerun for this unchanged migration/documentation step; prior test results above remain the implementation evidence.


## TKT-107 — photo slots (2026-11-14)

Implemented locally: strict caption/filename/bucket/target/path slots for project-media → projects.screenshots; drag-and-drop/choose upload in review and preview bar using makeUploader and existing file rules. Unique draft folders, exact filenames, owner/session/Storage metadata checks and compare-and-set path recording. Missing slots disable Approve; filled slots overlay existing project previews. SQL independently verifies uploaded object ownership/type/size and atomically appends screenshot URLs after ordinary operations, retaining full previous rows. Photo-only sets are supported; late failures roll back everything. Bucket policies/editors/card designs/public static rendering unchanged. Existing public bucket URLs remain directly readable if known, but unapproved objects never appear on public pages.

Migration **20261114161231_content_drafts_photos.sql — applied live with Jamie’s explicit approval on 2026-11-14**, remote version 20261114220519 (content_drafts_photos). No production upload/content, secret, dependency, commit, push or frontend deployment changes. Jamie’s frontend deployment/live verification remains pending before Done.

Checks actually run: npm run typecheck passed; full unit/database suite passed (934 tests / 94 files, maxWorkers=2); final isolated production build and unchanged static assertions passed. Final real Next/PGlite/Storage preview suite: 40 passed across desktop/390px, including uploaded-slot approval/discard, wrong files, exact filenames and visitor/member isolation. Existing Projects/Articles/review browser regressions: 29 passed, one existing skip. An old component-only review fixture initially bundled the new server action; its mock was updated and the entire regression set passed. After the final cache-refresh handling change, the four owner-upload action tests passed again. Phone inspection prompted a filename contrast correction; full preview browser checks passed afterward. git diff --check passed. All data/media are synthetic and services/browser checks local; no live website or Supabase access for this ticket.

Changed files:
- supabase/migrations/20261114161231_content_drafts_photos.sql
- lib/content-drafts/{photo-slots,photo-server,preview,review,types}.ts
- app/actions/{content-photo,content-drafts}.ts; app/page.tsx (preview props only)
- components/content-drafts/{photo-slots,review-list,preview-bar,page-preview}.tsx; preview.css
- tests/unit/{photo-slots,content-photo-actions}.test.ts; tests/db/{photo-drafts.test,content-drafts.test,harness}.ts; tests/e2e/{photo-preview,content-drafts}.spec.ts
- tests/content-preview.playwright.config.ts; tests/support/content-preview-api.cjs and storage-bootstrap.sql
- docs/content-drafts.md, architecture.md, security.md, status.md; MEMORY.md


TKT-107 live application (2026-11-14): Supabase MCP applied the unchanged tested SQL as remote 20261114220519. Both function source hashes match local SQL; SECURITY DEFINER, empty search_path and revoked anon/authenticated/service_role EXECUTE verified. content_changes/projects/Storage RLS remains enabled, owner draft and project-media policies unchanged, and record_signin is still the sole API-callable public function. project-media stays public-read, owner-write, 5 MB, PNG/JPG/WebP. All 13 content/draft table fingerprints and project-media object metadata/count matched before/after; no test records, uploads or approvals created. Security advisors show no new finding; existing record_signin/password-protection warnings remain. Docs/MEMORY and git diff --check updated; no application tests rerun for this unchanged migration/documentation step. Frontend deployment and Jamie’s live verification remain pending.


## TKT-118 — Interview shell (2026-11-14)

Implemented locally: dark-only three-column /interview layout with no site top bar; grouped section rail, original coloured line SVGs, DSA/LLD topic taxonomy and Soon placeholder routes. Independent browser-persisted rail/topics collapse, keyboard/hover tooltips, responsive modal drawer with focus trap/Escape return, Topics dropdown and reduced-motion support. DSA Notes/Practice mode links preserve topic; real content/access changes remain later tickets. Class-design now uses a real topic colour.

Shared top/floating navigation includes Interview between Projects and Articles. Resources shows Guides only; membership components are retained. Canonical Notes/Practice/Behavioral routes and their permissions/editors remain unchanged. New interview.md documents structure/routes/icons/preferences and is linked in docs/README.md. No migration, dependency, live data, production visit, commit, push or deployment; Jamie must deploy and verify live before Done.

Checks actually run: npm run typecheck passed; final full unit/database suite passed (939 tests / 95 files, maxWorkers=2); isolated credential-free production build and unchanged static assertions passed for /, /resources, /privacy, /projects and /articles. Interview/Home/desktop/smoke browser checks: final 57 passed, 3 intentional viewport-specific skips across desktop and 390px. Coverage includes persistence, tooltips/focus, drawer trapping/Escape, phone preference overrides, topic links, Guides-only Resources, top/floating navigation and existing gated routes. An initial test selector matched two heading levels; fixed. Browser testing found Escape focus restoration attempted before the inert background cleared; fixed and the complete set passed. Desktop/phone screenshots inspected; no sideways overflow. git diff --check passed.

Changed files:
- app/interview/layout.tsx, page.tsx, interview.css, [section]/page.tsx, [section]/[mode]/[[...topic]]/page.tsx
- components/interview/{shell,icons,placeholder}.tsx; lib/interview/navigation.ts; lib/notes/topics.ts
- components/site-header.tsx, site-navigation.tsx; app/resources/page.tsx
- tests/unit/interview.test.tsx; tests/e2e/interview.spec.ts, home.spec.ts, desktop.spec.ts
- docs/interview.md, README.md, architecture.md, security.md, status.md; MEMORY.md


Interview compact controls (2026-11-14): rail collapse/expand is now icon-only, aligned to the right of the Interview logo. Removed the separate labelled collapse row; renamed the content expand control Topics. Scoped navigation typography/icons, column widths, row gaps and placeholder spacing reduced. Complete rail and all 17 DSA topics fit at 1280×720; smaller screens retain independent scrolling and phone touch targets. No route, permission, data or migration change. Typecheck, five focused unit tests, isolated production build/static assertions and 11 desktop/390px browser checks passed (three viewport-specific skips). Browser assertions cover no vertical list scrolling at 720px, logo/toggle alignment, stored states, tooltips and phone controls. Desktop screenshot inspected; diff checked. No commit/push/deployment.

Interview control alignment (2026-11-14): collapsed rail expand button replaces the logo and centres over navigation icons. Rail toggle, topic collapse and Topics expand share a 32px control height and vertical centre. Updated browser geometry assertions; typecheck, five focused unit tests, isolated production build/static assertions and 11 desktop/390px browser tests passed (three viewport-specific skips). No migration, live change, push or deployment; Jamie verifies live.

## TKT-119 — Interview content routes (2026-11-14)

Implemented locally, awaiting Jamie’s deployment/live verification: section Practice overviews/topic question lists with search, difficulty/collection tags and empty read-only flag/completion icons; /interview/problems/[id] runs the existing Python workspace without a second question list and defaults topics to collapsed. Notes mode preserves topic, renders the existing reader/visuals/editor and has a placeholder overview. Code assignment routes sd-* to System Design, class-design to LLD, finance-* / ai-* to their sections; DSA keeps its 17 fixed topics. Accessible new notes appear automatically. Finance/AI remain Soon while empty; non-DSA Practice is disabled with the no-questions message.

Content Drafts note/problem destinations now use Interview addresses; owner-only overlays, read-only previews and legacy revalidation remain. Public practice and existing Notes app discovery/RLS/saved-data ownership checks are preserved. No notes.section column, migration, dependency, live change, push or deployment. Legacy routes retain their behavior. The right-hand divider now follows the collapsed rail’s first divider without shifting controls/content.

Checks actually run on isolated copies excluding credentials: final typecheck passed; full unit/database suite 941 tests / 96 files passed; production build and unchanged static assertions passed for /, /resources, /privacy, /projects, /articles. Interview + legacy Practice UI/real Pyodide browser checks: 36 passed, six intentional viewport skips. Disposable PGlite owner/member app-preview checks: eight passed across desktop/390px, including note destinations, section assignment, Approve/Discard, private/no-store response and copied-cookie isolation on new/legacy routes. Total 44 browser passes. Initial preview test setup used an unsupported dependency symlink; replaced with a local copy. Fixed test navigation/hydration waits before the final pass. git diff --check passed. No live browser visit or private test data.

Files changed:
- app/interview/layout.tsx, interview.css, [section]/[mode]/[[...topic]]/page.tsx; new problems/[id]/page.tsx
- components/interview/shell.tsx; new questions.tsx; lib/interview/navigation.ts; new content.ts and notes.ts
- app/desktop/practice-content.tsx; components/notes/reader.tsx; components/practice/arena.tsx
- lib/content-drafts/allowlist.ts, app-overlay.ts
- tests/e2e/interview.spec.ts, app-preview.spec.ts; tests/unit/app-drafts.test.ts; new interview-content.test.ts; tests/support/content-preview-api.cjs
- docs/interview.md, architecture.md, content-drafts.md, security.md, status.md; MEMORY.md

## TKT-120 — Per-user practice (2026-11-15)

Migration 20261115000906_per_user_practice.sql applied live through Supabase MCP with Jamie’s explicit approval on 2026-11-15 as remote 20261115005816. Retains practice_stars/practice_code/practice_attempts; adds auth user IDs, account-scoped primary keys, account-delete cascade and own-row CRUD RLS with no owner read/write bypass. Anon grants are revoked. Legacy rows retain their values/timestamps/IDs and are assigned to the unique owner profile; ambiguous or missing ownership with populated tables aborts. Live verification confirmed preservation and owner assignment without returning private content. Frontend deployment remains pending; Jamie pushes and verifies live before Done.

Signed-in users sync only their own flags, explicit saved code and run/submit history. Completion derives from nonempty fully passed submits, with paged history reads. Visitors keep local code and see no flag/completion controls. Shared question notes remain owner-edited; legacy route access and code-catalogue/browser runner remain unchanged. Account-keyed state and PracticeSession prevent stale account content during logout/switches. Draft TypeScript validation/review/preview and SQL approval explicitly scope practice snapshots/writes to Jamie’s user ID; identity injection is refused. Existing encrypted export tables include the new columns/all accounts, with composite-key paging; privacy updated.

Checks actually run: typecheck passed; final full unit/database suite 960 tests / 98 files passed; isolated credential-free production build and unchanged static assertions passed for /, /resources, /privacy, /projects, /articles. Desktop/390px Interview + legacy Practice UI + real Pyodide checks: 36 passed, six intentional viewport skips. Disposable PGlite owner/member app-preview + practice flows: ten passed, including private flags/code, real passed submission → completion, reload persistence, copied-preview-cookie isolation, owner approval/discard and visitor controls. Total 46 browser passes. Tests prove owner cannot access member rows, own CRUD/reassignment prevention/account cascade, migration row preservation/fail-closed ownership, draft collisions/identity rejection, long-history completions and encrypted per-user backup round-trip. Fixed old owner-only test fixtures, a missing owner-ID approval call and test-adapter CORS support before final passing runs. git diff --check passed. No production browser use, dependency change, push or deployment.

Files changed:
- supabase/migrations/20261115000906_per_user_practice.sql (applied live as remote 20261115005816)
- app/actions/practice.ts, practice-stars.ts, content-drafts.ts; new practice-progress.ts; app/desktop/practice-content.tsx; app/interview/interview.css; app/privacy/page.tsx
- components/interview/questions.tsx; components/practice/arena.tsx, use-practice-stars.ts; new session.tsx; new lib/practice/progress.ts
- lib/content-drafts/app-allowlist.ts, app-overlay.ts, preview.ts, review.ts; scripts/ops.mjs (existing export manifest retained)
- tests/db/harness.ts, app-drafts.test.ts, practice-data.test.ts, practice-stars.test.ts; new practice-migration.test.ts
- tests/unit/app-drafts.test.ts, content-drafts-actions.test.ts, ops.test.ts, practice-actions.test.ts, practice-star-actions.test.ts; new practice-progress.test.ts
- tests/e2e/interview.spec.ts, app-preview.spec.ts; new practice-progress.spec.ts; tests/content-preview.playwright.config.ts; tests/support/content-preview-api.cjs
- docs/security.md, interview.md, content-drafts.md, architecture.md, operations.md, status.md; MEMORY.md

TKT-120 live application (2026-11-15): unchanged tested SQL applied successfully. Private apply helper source hash matches local SQL; owner-only entry check, SECURITY DEFINER/empty search_path and revoked API EXECUTE confirmed. Sole own-user CRUD policies/RLS, composite keys, cascade FKs, no anon grants and backup read access verified. All migrated rows assigned to Jamie; read-only authenticated role assertions verified owner visibility and non-owner exclusion. Counts and normalized fingerprints across all 14 checked tables match before/after; no content loss/edits, approvals or live test records. record_signin remains the sole public API-callable function; security advisors show no new finding. Documentation/MEMORY and diff checks updated. Application tests were not rerun for this unchanged-SQL application step; the implementation check results above remain the latest. No push or frontend deployment; Jamie verifies UI after deployment before Done.

## TKT-121 — Private Interview Resume (2026-11-15)

Migration 20261115011458_user_resumes.sql applied live with Jamie’s explicit approval on 2026-11-15 as remote 20261115105347. Frontend deployment and Jamie’s live verification remain pending. user_resumes has one private, validated JSON entry/bullet document per user, own-row CRUD with no owner bypass, auth-user cascade and revision checks. Certificates/skills are explicit entry kinds. resume_templates is a public singleton with owner-only writes, seeded empty. No live CV data was read, copied or seeded. Existing experience/public journey and /behavioral editor remain unchanged. Shared guide → Start from template/Start blank → add/edit/reorder/remove entries/bullets/certificates/skills → atomic save with success, error/retry and conflict messages. Signed-out users get only the read-only guide/sign-in prompt; account changes hide stale private editor state.

Content Drafts supports only title/content updates to the singleton template, never private resumes. TS/SQL independently validate shape, types, nested UUID uniqueness and limits. Owner preview is read-only with a gold guide outline; approval records previous values atomically and refreshes /interview/resume without changing any copied private resume. Privacy policy and encrypted export manifest/paging cover both new tables. No dependency change, push or deployment. Live schema applied with approval; frontend deployment/live UI verification remain pending before Done.

Checks actually run: typecheck passed; final complete unit/database suite 989 tests / 103 files passed, including unchanged legacy CV editor tests. Isolated production build and unchanged static assertions passed for /, /resources, /privacy, /projects, /articles. Desktop/390px Resume checks: four passed, covering public guide, both start modes, editing, failed-save retry without data loss, reload persistence, ordering/removal, owner/member isolation and template preview/approval/copied-cookie isolation. Interview/legacy Practice UI/real Python runner checks: 36 passed, six intentional viewport skips. Existing app draft/per-user practice integration checks: ten passed. Total 50 browser passes. DB tests cover own-row CRUD/identity reassignment denial including owner, anon denial, public-template owner-only writes, account cascade, nested validation/UTF-16 limits, transactional draft rollback and unchanged populated legacy CV. Initial full runs hit timeouts in existing Python/migration checks; the final complete rerun passed. Browser test selectors were narrowed to the Resume alert and Kind combobox; existing Behavioral editor tests were retained in their original file, with new Interview tests separate. git diff --check passed. No production browser/control or private fixtures.

Files changed:
- new supabase/migrations/20261115011458_user_resumes.sql (applied live; remote 20261115105347)
- new app/interview/resume/page.tsx, app/actions/resume.ts, components/interview/resume-editor.tsx, lib/resume.ts
- lib/content-drafts/allowlist.ts, preview.ts, review.ts, types.ts; new resume-template.ts; app/actions/content-drafts.ts
- app/interview/interview.css; app/privacy/page.tsx; scripts/export-tables.json, ops.mjs
- new tests/db/resume.test.ts, resume-migration.test.ts; new tests/unit/resume.test.ts, resume-actions.test.ts, interview-resume-editor.test.tsx; new tests/e2e/resume.spec.ts
- tests/e2e/interview.spec.ts; tests/content-preview.playwright.config.ts; tests/support/content-preview-api.cjs
- docs/interview.md, security.md, content-drafts.md, architecture.md, operations.md, status.md; MEMORY.md


Live TKT-121 verification: all four private function source hashes match the tested migration; empty search_path, definer settings and revoked API execution confirmed. Both tables have enabled RLS; user_resumes has only own-user USING/WITH CHECK, no anon grants and auth-user cascade; template is public-read/owner-write. Empty guide and zero private resumes confirmed; read-only anon/member role checks passed. All 22 existing public-table counts/content fingerprints unchanged. record_signin remains the only API-callable public function; security advisors show no new finding. No live test records, CV import or content approval. Application suites were not rerun for this unchanged-SQL application; prior implementation checks remain the latest.

## TKT-122 — Behavioral Playbook (2026-11-15)

Implemented after Jamie confirmed nine themes and 18 starter questions; migration applied with approval below. /interview/behavioral now has Playbook and Course (Soon), theme navigation with coloured original icons/progress, searchable question lists and answered/not-answered filters. Question pages show the six shared guide fields and a signed-in user’s private STAR editor with save/retry and optional own-resume role. Users can create private questions; visitors see only guides/sign-in. Account switches hide stale private content. Answered means all four saved STAR fields are nonblank.

New shared interview_behavioral_themes/questions support public reads and owner-managed Content Drafts inserts/updates, strict TS/SQL validation, review comparisons, owner-only on-page preview/gold outlines and transactional approval/history. Private interview_behavioral_custom_questions/answers have own-row CRUD RLS with no owner bypass; triggers validate question ownership/own-resume role and retain immutable imported source detail. Old stories/answers are copied to the unique owner’s private workspace, retaining every source field/link/timestamp; original tables, policies and /behavioral keep working unchanged. No CV-bullet mapping/coverage strip on the new pages. Privacy and encrypted export/paging cover all four tables.

Migration 20261115111230_behavioral_playbook.sql applied live with Jamie’s explicit approval on 2026-11-15 as remote 20261115114339. Frontend deployment and Jamie’s live verification remain pending. It seeds the confirmed starter prompts and one pending Content Drafts set for all 18 guides, with generic fictional samples. Until Jamie approves that set, public guide fields say they await review. Schema and starter catalogue applied with approval; guide content approval remains a separate step at /manage/review. No private imports in Git, guide approval, dependency changes, commit, push or deployment. Jamie verifies live before Done.

Checks actually run: npm run typecheck passed; full unit/database suite 1,008 tests / 108 files passed. Credential-free isolated production build and static assertions passed for /, /resources, /privacy, /projects and /articles. Synthetic-config production build passed. New Playbook desktop/390px browser checks: four passed (public guide/sign-in, phone Topics/theme navigation, search/status/progress, failed-save retry retaining text, persistence, private custom question/404 to another account, owner/member answer isolation, owner-only guide preview/copied-cookie isolation/approval). Interview shell/legacy-route/real Python runner checks: 14 passed, four intentional viewport skips. Existing Resume/per-user Practice/home/app draft browser checks: 28 passed. Total 46 browser passes, four skips. Policy/migration tests prove private CRUD isolation including owner, public guide/owner writes, foreign question/role refusal, validation/atomic rollback/history, all 18 proposed guides approving together, helper hardening, account cascade and exact preservation of populated synthetic legacy sources. Initial browser navigation/locator timing assertions were corrected; final runs passed. git diff --check passed. No production browser or user-computer control.

Files changed:
- new supabase/migrations/20261115111230_behavioral_playbook.sql (applied live as remote 20261115114339)
- new app/interview/behavioral/[[...path]]/page.tsx; app/interview/layout.tsx, interview.css; new app/actions/interview-behavioral.ts
- new components/interview/behavioral.tsx; components/interview/shell.tsx, icons.tsx; new lib/interview/behavioral.ts, behavioral-data.ts
- new lib/content-drafts/behavioral-guides.ts; lib/content-drafts/allowlist.ts, preview.ts, review.ts, types.ts; app/actions/content-drafts.ts
- app/privacy/page.tsx; scripts/export-tables.json, ops.mjs
- new tests/db/interview-behavioral.test.ts, interview-behavioral-migration.test.ts; new tests/unit/interview-behavioral.test.ts, interview-behavioral-actions.test.ts, interview-behavioral-editor.test.tsx; new tests/e2e/interview-behavioral.spec.ts
- tests/db/content-drafts.test.ts (scope count to its fixture); tests/e2e/interview.spec.ts (Behavioral no longer Soon); tests/content-preview.playwright.config.ts; tests/support/content-preview-api.cjs
- docs/README.md, interview.md, content-drafts.md, security.md, architecture.md, operations.md, status.md; MEMORY.md

Live TKT-122 verification: five private function source hashes exactly match reviewed local SQL; empty search_path, correct definer settings and revoked anon/authenticated/service_role EXECUTE confirmed. All four tables have RLS, public shared reads/owner writes, own-row private USING/WITH CHECK without owner bypass, no anonymous private grants and auth-user cascades. Read-only anon/owner/member role checks passed. Nine themes/18 published prompts exist; guide fields remain empty, with one draft containing 18 guide operations awaiting Jamie’s approval. All existing rows across 24 public tables retain their counts/fingerprints when excluding this new seeded draft; the previous ten drafts are unchanged. Legacy story/answer tables were empty before application, so no private source rows required copying. record_signin remains the sole API-callable public function; no new security advisory. No live test records or guide approvals. Application suites were not rerun for unchanged tested SQL; prior implementation checks remain the latest. No push/deployment; Jamie verifies frontend live before Done.

## TKT-123 — Report a problem / Suggest an idea (2026-11-15)

Implemented locally: bottom Interview rail replaces the Soon stub; shared site navigation adds an accessible feedback icon in both top/floating states. A small native modal provides Problem/Idea, message and optional pre-filled local page path/fragment, with queries excluded. Public anonymous submission needs no name/email/account; close/Escape/backdrop and focus restoration work across desktop/collapsed rail/phone drawer. Controlled in-memory fields survive errors for retry. Public-page static rendering is unchanged.

Both contact and feedback share server transport, message validation, honeypot, keyed IP hash, unchanged five-per-sender/30-global hourly DB guard and save-first optional Resend alerts. Feedback has no reply_to; contact identity/budget/reply-to remain intact. Settings Inbox shows Contact/Problem/Idea and safe page links, retaining owner-only read/mark/delete controls. Existing messages exports automatically include metadata; privacy disclosure updated.

Migration 20261115115900_message_feedback.sql is NOT applied live. Adds kind/page_path, permits null name/email only for feedback through a conditional check, and grants INSERT on new columns only. Existing contacts default to kind=contact/page=null; every original value, RLS policy and guard stays intact. Await Jamie’s explicit “apply it” before application/deployment; no live query, data submission, email, dependency change, commit, push or deployment. Jamie verifies live before Done.

Checks actually run: npm run typecheck passed; full unit/database suite 1,025 tests / 113 files passed. Credential-free production build and synthetic-config build passed. Static assertions passed unchanged for /, /resources, /privacy, /projects, /articles. New feedback desktop/390px tests: four passed, proving both entry points land in owner Inbox with correct metadata/no identity, modal/Escape/focus behavior, omitted query parameters, validation and retry field retention, honeypot drops and hourly cap. Interview/journey/smoke/contact/legacy-route regressions: 55 passed, five intentional viewport skips. Total 59 browser passes. DB tests prove owner-only Inbox permissions, contact shape preservation, feedback validation, shared per-IP/global limits and unchanged guard/source records. Action tests cover honeypot/invalid no-writes, same IP hashing, save-before-alert, safe failures and email/cache failure after persistence. An automatic form-reset issue found by the dialog test was fixed; final full suite passed. git diff --check passed. All browser/data/email tests were isolated and synthetic; no production browser/control.

Files changed:
- new supabase/migrations/20261115115900_message_feedback.sql (NOT applied live)
- new components/feedback-button.tsx; components/site-navigation.tsx, interview/shell.tsx, contact-form.tsx; app/globals.css
- new lib/contact-fields.ts, lib/feedback.ts; lib/contact.ts, resend.ts; app/actions/contact.ts
- app/settings/content.tsx; app/privacy/page.tsx
- new tests/unit/feedback.test.ts, feedback-actions.test.ts, feedback-dialog.test.tsx; new tests/db/feedback.test.ts, feedback-migration.test.ts; new tests/e2e/feedback.spec.ts
- tests/support/content-preview-api.cjs; tests/content-preview.playwright.config.ts
- docs/architecture.md, security.md, interview.md, operations.md, status.md; MEMORY.md

## CI navigation fixture fix (2026-11-15)

Fixed the reported content-review-badge failures: Interview increased the Site navigation from four to five links. The fixture now asserts the explicit ordered Projects/Interview/Articles/Resources/Privacy labels and hrefs, retaining badge access/session, theme/auth and overflow checks for top/floating bars. Both badge and desktop-window standalone esbuild fixtures mock the feedback server action so server-only imports do not enter browser bundles; the second missing mock was found by the full rerun. No application code, dependency, migration or live data change in this fix; TKT-123 migration remains NOT applied live.

Checks actually run: typecheck passed. Full CI-style Playwright run against the existing credential-free TKT-123 production build, two workers, desktop/390px: 158 passed, 62 conditional integration/viewport skips, zero failures (220 total). All six badge checks and both desktop-window checks passed. Used an installed local Chromium/temporary config; CI settings unchanged. git diff --check passed. Build/unit suite not rerun for this test-only change. Updated tests/e2e/content-review-badge.spec.ts, desktop-window.spec.ts, docs/operations.md, status.md and MEMORY.md. No push/deployment.

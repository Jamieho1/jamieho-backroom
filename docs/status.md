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

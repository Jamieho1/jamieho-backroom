# Current state

Updated 2026-11-14. Jamie pushes and verifies production.

- Deployment (checked 2026-11-14 via Vercel MCP): production is READY on cf9b3c3 (About photos), so everything listed below through 2026-11-13 is committed, pushed and deployed. Pins and Guides migrations are applied live.
- About photos: the three about-*.jpg files are in the home-media bucket (verified 2026-11-14), so the deployed About strip has its images.

- Home journey is /. /journey redirects home; retired /about redirects to /#pivot, /desktop to /resources. Legacy desktop app queries redirect to canonical app routes.
- Shared arrival/floating/app navigation: Journey dropdown, Projects, Articles, Resources, Privacy, visible Auto/Day/Night and gold sign-in/out buttons. Auto follows system preference; explicit overrides persist in jb.theme. Privacy/Projects/Articles/Notes/Practice/Resume & Stories use plain pages; only Settings retains window controls. Owner Settings/edit controls are available there.
- Resources lists Notes (/notes), Practice (/practices) and Resume & Stories (/behavioral). Locked previews contain generic blurred placeholders only. Existing server-filtered discovery and server/RLS checks determine unlocks; missing access gets a membership gate. Payment integration is not implemented.
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

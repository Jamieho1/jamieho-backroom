# Current state

Updated 2026-11-11. Changes remain local/uncommitted unless stated as live. Jamie pushes and verifies production.

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

## Validation

Account pins (2026-11-11): typecheck, 530 unit/database tests (maxWorkers=2), production build/static assertions passed. Full desktop/390px browser run: 129 passed, 4 skips; one previously intermittent desktop contact honeypot submission failed, then passed on a focused desktop/phone rerun (2 passed). Pin/unpin, failed-save retry, independent sidebar pagination, app access and account-switch isolation checks passed. Approved migration 20261111180819_article_pins.sql is applied live as remote 20261111181807; RLS/grants/policies/constraints verified through MCP. Security advisors reported no article-pins finding. Privacy updated and article_pins added to encrypted exports. Final explicit grant tightening passed the 5 pin database tests. No dependencies changed, no commit/push/deployment.

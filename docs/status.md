# Current state

Updated 2026-11-08. Changes remain local/uncommitted unless stated as live. Jamie pushes and verifies production.

- Home journey is /. /journey redirects home; retired /about redirects to /#pivot, /desktop to /resources. Legacy desktop app queries redirect to canonical app routes.
- Shared arrival/floating/app navigation: Journey dropdown, Articles, Resources, Privacy, visible Auto/Day/Night and gold sign-in/out buttons. Auto follows system preference; explicit overrides persist in jb.theme. App windows close to Resources. Owner Settings/edit controls are available there.
- Resources lists Notes (/notes), Practice (/practices) and Resume & Stories (/behavioral). Locked previews contain generic blurred placeholders only. Existing server-filtered discovery and server/RLS checks determine unlocks; missing access gets a membership gate. Payment integration is not implemented.
- Hero uses matching generated 1920×1080 day/night landscapes with extended sky and aligned larger characters. Yellow/white editable heading sits above them; existing phone portraits remain. No CSS colour grading/pale halo. Lower navy panel holds social links and disabled Schedule a call placeholder.
- Reading cards behind About/Projects/Experience/Creator copy retain geometry. About keeps its original smaller heading, full-opacity paragraph and untruncated phone text; grade omitted only from journey display.
- Contact Us ending removes desk copy/page-opening CTA. Monitor holds social logos and the existing contact form/action; static fallback included. Contact anchors navigate to the form.
- Cyterly uses the approved bundled image only when database screenshots are empty; preview contains the full screenshot without pan. Owner screenshots take precedence.
- Live content previously verified: approved hero copy, About slash removal and supplied Contact social URLs. Direct database edits need ISR refresh/rebuild for cached public copy.
- Canonical apps/auth/RLS/editors retained. Phones download no journey clips; desktop keeps room/monitor clips. No schema/migration/dependency/deployment change. Historical migration status and outstanding domain/subdomain SSO sign-offs remain unverified.

## Validation

Latest npm run check passed: typecheck, 517 unit/database tests, production build and static assertions for /, /resources, /privacy, /projects and /articles. Full updated browser run: 115 passed, 3 existing skips. Final theme/resource/cross-page Journey checks: 10 passed. Local configured desktop/390px arrival, floating controls and Resources previews reviewed without horizontal overflow. Contact submission was previously exercised through the no-write/no-email honeypot path.

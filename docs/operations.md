# Operations and checks

Work in ~/Documents/Developer/Personal Website/jamieho-backroom, never the parent directory. Old Claude Cowork paths are stale. Jamie commits/pushes; agent commits, if requested, use Jamie Ho <shinghimho@gmail.com>.

- npm ci: install pinned dependencies.
- npm run check: typecheck, unit/database tests, build, static assertion.
- npm run test:e2e: Playwright desktop and390px checks.
- git diff --check: whitespace validation.
- Documentation-only: validate word counts, references and diff; no runtime test claim.

CI uses Node22 and ubuntu-24.04 because pinned Playwright1.56.1 cannot install browsers on newer runners. Use package.json for current exact pins; do not duplicate version lists across docs. Verify relevant behavior first; use full required checks for release changes. Jamie verifies live; no browser/computer control unless requested.

Pyodide assets are copied by predev/prebuild into ignored public/pyodide/. Track worker/harness and lockfile; not generated runtime files.

Infrastructure:
- GitHub: Jamieho1/jamieho-backroom.
- Vercel: jamieho1s-projects / jamieho-backroom, lhr1; production jamieho-backroom.vercel.app.
- Supabase: lhacrrnwddvpawsreamk, eu-west-2.
- Resend: onboarding sender until domain verification; alerts are optional, Inbox saves independently.
- Ops: daily database ping, Sunday encrypted exports; status/banner in Settings. Service-role key belongs only in GitHub Actions secrets, entered by Jamie.

Public health: /api/health. Manual service setup remains in README.md. Journey media hash/upload process is in journey.md; do not regenerate or upload media as part of unrelated changes. New subdomain apps follow Resources/Subdomain Apps - Playbook.md after domain purchase.

Local browser verification may use an installed Chromium via a temporary config if the pinned executable is absent. Keep repository CI pins unchanged. Use an isolated copy excluding .env files for tests that assume unconfigured placeholder content.

Practice export (TKT-120): retained practice_code/practice_stars/practice_attempts entries in export-tables.json include every account’s user_id and data through the existing encrypted service-role export. scripts/ops.mjs pages these tables in user_id plus problem/id order; do not apply per-viewer filters to backups. Account deletion cascades live progress; encrypted retention stays 90 days. Migration 20261115000906_per_user_practice.sql applied live with Jamie’s explicit approval on 2026-11-15 as remote 20261115005816; legacy values, owner assignment and access rules verified. Frontend deployment remains pending.

Resume export (TKT-121): export-tables.json includes user_resumes (all accounts’ validated JSON/revision/timestamps) and resume_templates. scripts/ops.mjs orders them by user_id/key before existing encrypted pagination; backups remain encrypted with the same 90-day retention. No live CV import/seed. Migration 20261115011458_user_resumes.sql applied live with Jamie’s explicit approval on 2026-11-15 as remote 20261115105347.

Behavioral export (TKT-122): export-tables.json adds interview_behavioral_themes/questions/custom_questions/answers, including private source archives and role/account IDs. Stable pagination uses id for shared tables, user_id/id for custom questions and user_id/question_id for answers. Existing encrypted backups retain 90 days; no authenticated-owner read bypass. Migration 20261115111230_behavioral_playbook.sql applied live with Jamie’s explicit approval on 2026-11-15 as remote 20261115114339. Review/approve the seeded starter-guide change set at /manage/review separately. Never seed shared guides from personal answers.

Feedback (TKT-123): messages exports already use select(*), so kind/page_path and nullable anonymous sender fields need no new export table. Existing encrypted retention and contact/feedback hourly counters are shared. Resend remains optional; anonymous feedback alerts omit reply_to, contact alerts retain it. No new key/secret/provider configuration. Migration 20261115115900_message_feedback.sql applied live with Jamie’s explicit approval on 2026-11-15 as remote 20261115124743. Existing contacts/guard/RLS are preserved.

Navigation fixture checks (2026-11-15): content-review-badge.spec.ts asserts direct Projects/Interview links plus the Content disclosure containing Articles/Resources in top/floating bars. Standalone badge/window esbuild fixtures stub the feedback server action, as Next’s server-action transform does not run there; feedback behavior has its own integration tests. No app/schema change.


TKT-124 rollout: 20261115212120_interview_public_access.sql applied live with Jamie’s explicit approval on 2026-11-15 as remote 20261115220149. Do not substitute a Settings-only visibility change: legacy private Behavioral/CV read protections must change atomically with public registry visibility. No new export table is required; the existing encrypted manifest covers all actual public tables, including private Interview records/archives, with stable per-user paging. No production export or secret access is needed to verify manifest/encryption locally. Migration approval/application is complete; Jamie pushes and verifies the deployed UI.


TKT-125 verification procedure (2026-11-15): verified secret-free copies of baseline 85aa9dc using npm run typecheck, npm test -- --maxWorkers=2, npm run build and node scripts/assert-static.mjs. Built again with synthetic NEXT_PUBLIC_SUPABASE_URL pointing only to 127.0.0.1 and a dummy public key. Full main Playwright run uses two workers and the installed Chromium via a temporary config preserving repository tests/viewports; the complete tests/content-preview.playwright.config.ts run uses one worker and the disposable tests/support/content-preview-api.cjs (real migration chain, synthetic accounts/Storage). Results: 1,031 unit/DB passes; both builds/static checks pass; 162 main browser passes/66 conditional-viewport skips; all 60 integration cases pass. No CI pin/config, real secret, live database or mail change. Exact commands, coverage and remaining live review: status.md / interview.md.

Home v1.3 exports: about_photos joins export-tables.json, using existing id-ordered encrypted paging. No photo bytes or Storage credentials enter the export manifest. Migration 20261116165138_home_v13_data.sql is applied with Jamie’s approval as remote 20261116171034; starter photo/journey content remains a separate TKT-110b step.

## Dial rollout and verification

Home polish 7 migration `20261117183223_project_highlights.sql` is applied live with Jamie’s explicit approval on 2026-11-17 (remote version `20261117220033`). Deploy the new review/allowlist code before approving the highlights proposal. Public project reads tolerate the absent column during rollout. Jamie pushes and verifies live.

Keep the disposable Content Preview API running from the synthetic build through the integration suite: replacing its in-memory database after building leaves ISR output from a different fixture state. Start from a clean disposable .next directory after replacing/resetting the adapter; otherwise old prerendered fixture values can survive a build. Build and run the app against the same loopback URL/database, using dummy public configuration only.

The retired local Experience-art folder and ignored WebPs are removed. Retain the three named home-media Experience objects until the replacement is deployed and live references are clear; list before deletion and use the Storage API, never SQL catalogue deletion. The current deletion inventory is in the handoff report; no Storage object has been removed yet.

## Media cleanup contract

The current inventory is `../Media/Previews/media-cleanup-2026-11-18/{README.md,inventory.csv,pending-actions.json}` outside Git. It records sizes, SHA-256 duplicates, code/dynamic URL references and live image/path-field references, including pending/approved photo proposals. Audit only image/path fields and extracted public image URLs; never serialize private full-row content for cleanup.

Tracked unused assets can be removed through Git. Local Media, ignored generated files and Storage require Jamie’s explicit “delete” for the reviewed plan; do not infer it from “continue”. Retain live/proposal references and original Brand/Uploads sources. Recheck hashes/live references immediately before deletion, deploy the cleanup code first, then use the Storage API for approved object removals. Jamie approved the plan: 10 ignored repo files and 17 Media files are deleted, and 21 retained originals moved under Brand/Uploads with matching hashes. execution-results.json records completion. Storage is unchanged: the deployed worker still lacks v2/retained-file controls, and the available Supabase MCP has no Storage removal API. After deployment, use an authenticated Storage API without reading Jamie’s secrets; do not repeat the deletion-approval question for this plan. The Media README records the current organisation.

`scripts/home-media/manifest.mjs` refreshes only existing retained manifest entries unless filenames are explicitly supplied; it synchronizes the worker allowlist. Encoding produces desktop MP4 plus first/last posters; phones use stills. `home-media-v2` activation clears old media cache namespaces; retired filenames bypass caching. Current room/contact timings and the active desktop runtime remain.

Contact brief rollout: local migration `20261119090000_contact_briefs.sql` is applied as remote `20261119150051` under Jamie’s explicit approval. Existing contact rows/budgets, RLS and spam-guard hashes are unchanged; legacy delivery remains valid until Jamie deploys the new form. messages already exports all columns with existing encryption/retention. No secret configuration changed. The public-email change set is reviewed separately at /manage/review.

Jamie approved the six-file Contact retirement list: local encodings/posters are deleted with matching hashes; see `../Media/Previews/contact-redesign-2026-11-19/execution-results.json`. Keep raw room masters. The deployed public worker still lists room media, so Storage removal remains approved but pending Contact redesign deployment and authenticated Storage API access. Do not repeat approval or delete Storage catalogue rows through SQL. This list is distinct from the earlier 23-object cleanup.

Practice test-case rollout: `20261123002717_practice_custom_cases.sql` applied live with Jamie’s explicit approval on 2026-11-23 as remote `20261123110809`. Jamie pushes and reviews the deployed UI. `practice_cases` joins the encrypted export manifest with stable `(user_id,problem)` paging, all accounts included under service-role backup access, existing 90-day retention. No public/owner read bypass or secret change. On sync failure, the UI retains local inputs and reports the error. Validate with local synthetic policies and two-account browser checks; never submit production test data.

P3 rollout: `20261123010711_practice_submissions.sql` applied live with Jamie’s explicit approval on 2026-11-23 as remote `20261123110824`. It adds private complexity drafts and immutable submission snapshots, preserving saved code/attempts/completion. The export manifest includes `practice_complexities` ordered by user_id/problem and `practice_submissions` by user_id/id, with unchanged encryption/90-day retention. P2 is also applied; deploy both features through Jamie’s normal push/review. Local policies/adapter use only synthetic data; do not create live test submissions. Jamie pushes/reviews after approved application.

C1 Companies rollout: `20261123123946_passloop_companies.sql` is prepared and **NOT applied live**. Jamie's “apply it” is required before application; no production seeds/test rows were created. Deploy directory/draft code after application, then Jamie reviews. The three shared tables use existing ID-ordered encrypted exports/retention. Local tests use only synthetic companies/accounts in PGlite and the loopback preview adapter; no third-party logo requests or secrets. Company detail pages are C2, so C1 card destinations are prepared links rather than implemented detail tabs.

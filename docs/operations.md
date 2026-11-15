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

Resume export (TKT-121): export-tables.json includes user_resumes (all accounts’ validated JSON/revision/timestamps) and resume_templates. scripts/ops.mjs orders them by user_id/key before existing encrypted pagination; backups remain encrypted with the same 90-day retention. No live CV import/seed. Migration 20261115011458_user_resumes.sql applied live with Jamie’s explicit approval on 2026-11-15 as remote 20261115105347. Frontend deployment and Jamie’s live verification remain pending.

Behavioral export (TKT-122): export-tables.json adds interview_behavioral_themes/questions/custom_questions/answers, including private source archives and role/account IDs. Stable pagination uses id for shared tables, user_id/id for custom questions and user_id/question_id for answers. Existing encrypted backups retain 90 days; no authenticated-owner read bypass. Migration 20261115111230_behavioral_playbook.sql applied live with Jamie’s explicit approval on 2026-11-15 as remote 20261115114339. Frontend deployment and Jamie’s live verification remain pending. Review/approve the seeded starter-guide change set at /manage/review separately. Never seed shared guides from personal answers.

Feedback (TKT-123): messages exports already use select(*), so kind/page_path and nullable anonymous sender fields need no new export table. Existing encrypted retention and contact/feedback hourly counters are shared. Resend remains optional; anonymous feedback alerts omit reply_to, contact alerts retain it. No new key/secret/provider configuration. Migration 20261115115900_message_feedback.sql applied live with Jamie’s explicit approval on 2026-11-15 as remote 20261115124743. Frontend deployment and Jamie’s live verification remain pending. Existing contacts/guard/RLS are preserved.

Navigation fixture checks (2026-11-15): content-review-badge.spec.ts asserts direct Projects/Interview/Privacy links plus the Content disclosure containing Articles/Resources in top/floating bars. Standalone badge/window esbuild fixtures stub the feedback server action, as Next’s server-action transform does not run there; feedback behavior has its own integration tests. No app/schema change.


TKT-124 rollout: 20261115212120_interview_public_access.sql applied live with Jamie’s explicit approval on 2026-11-15 as remote 20261115220149. Do not substitute a Settings-only visibility change: legacy private Behavioral/CV read protections must change atomically with public registry visibility. No new export table is required; the existing encrypted manifest covers all 28 actual public tables, including private Interview records/archives, with stable per-user paging. No production export or secret access is needed to verify manifest/encryption locally. Migration approval/application is complete; Jamie pushes and verifies the deployed UI.

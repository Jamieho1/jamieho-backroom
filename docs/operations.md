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

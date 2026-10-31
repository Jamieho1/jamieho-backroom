# AGENTS.md: jamieho-backroom (for Codex and any other coding agent)

Read these first, in order. They are the source of truth and apply to every agent, not just Claude:
1. `CLAUDE.md`: goal and project rules.
2. `MEMORY.md`: status log. **Add a dated entry for everything you do** (what changed, what's applied live, what's still open).
3. `PRD.md`: scope and release plan (R1–R4).
4. `Resources/Tickets - Dependency Map.md` and the Notion "Tickets" database (TKT-51…TKT-71).
5. `README.md`: setup steps Jamie does himself (Google, Resend, Ops secrets).

## Where things stand (2026-10-31)
- **R1 done:** TKT-51…59 (skeleton, Google sign-in, app registry + Settings, landing sections, experience, projects,
  contact form + Inbox + Resend, analytics + Visitors, ops ping/export/banner). All live and verified by Jamie.
- **R2 in progress:** TKT-60 (/desktop shell) is done; TKT-61 (Notes read view) is in progress. Then TKT-62…63; R3 = TKT-64…66; R4 = TKT-67…70; TKT-71 = domain + subdomain SSO.
- Notion: Tickets data source `collection://1ff804d9-463a-49b6-8221-217e5552c790`. Set a ticket In Progress when you start
  and Done only after Jamie confirms it works live.

## The predecessor app (Interview Prep artifact)
- **Code:** `../../Interview Prep/artifact/` (its own git repo; latest commit da5e0a7). Port look and behaviour from here:
  desktop shell, wallpaper and icons in `src/ui/`, notes rendering, the arena editor, `code-highlight.tsx` for colours.
- **Data:** Jamie's notes, progress and Behavioral stories live inside the published Claude artifact, not in this code.
  Other agents can't open it. **Skip the data-copy tickets TKT-63, TKT-66, TKT-69 and the cut-over TKT-70: leave them to Claude.**

## Working agreement with Jamie
- **Ask before starting each ticket**: say which ticket and what it will change, then wait for his go-ahead.
- **Verification and integrations:** prefer APIs/MCP and local checks. Jamie checks the live website himself; do not visit it or control his browser/computer unless he explicitly asks.
- **Jamie pushes to GitHub himself.** Never push. Commit as `Jamie Ho <shinghimho@gmail.com>`.
- **Jamie handles every secret** (Supabase keys, Google OAuth, Resend, GitHub Action secrets). Never read, print or ask for them.
- **Database changes:** write a new file in `supabase/migrations/` (never edit an applied one), test it, then ask Jamie
  before applying it to the live project (`lhacrrnwddvpawsreamk`, eu-west-2). Note "applied / not applied" in MEMORY.md.

## Hard rules (tests enforce most of them)
- **Security:**
  - Access is enforced by Supabase **RLS**, with a PGlite test for every policy (`tests/db/`, see `tests/db/README.md`).
  - Only the owner writes.
  - New data tables enable RLS and guard reads with `rls.can_view_app('<app id>')`.
- **No API-callable functions:**
  - The only `public` function anon/authenticated may execute is `record_signin`. `ops_usage` is service-role only.
  - RLS helpers live in the `rls` schema, trigger functions in `private`. `tests/db/app-registry.test.ts` checks this.
- **Static pages:** `/`, `/privacy` and `/projects` must stay pre-rendered (`scripts/assert-static.mjs` runs in CI).
  Signed-in state is client-side; public reads use the anon key without cookies.
- **Privacy:** `/privacy` must match what the code collects. Update it in the same change as any new data collection.
- **Content:**
  - CV and personal content live only in the database, never in git.
  - Problem content in our own words, no LeetCode text, no scraping.
  - No AI/LLM calls in v1.
  - No server-side code execution; Python runs only in the browser Pyodide worker.
- **Vercel env:**
  - `NEXT_PUBLIC_*` = type Config (public by design).
  - Real secrets are unprefixed and Sensitive.
  - Never put the Supabase service_role key or Google client secret in Vercel.
- **Repo:** this folder is the only git repo. Never run git in the parent `Personal Website/` folder.

## Commands
- `npm ci`
- `npm run check`: typecheck + unit/DB tests + build + static assertion.
- `npm run test:e2e`: Playwright, desktop + 390 px phone.
- Versions are pinned exactly.
  - Playwright 1.56.1, so CI runs on `ubuntu-24.04` (newer runners break the browser install).
  - Next 16 (`proxy.ts` replaces middleware), React 19, Vitest 5, PGlite for DB tests.

## Infra
- **GitHub:** Jamieho1/jamieho-backroom. Workflows: CI on push; **Ops** (daily ping, Sunday encrypted export).
- **Vercel:** team jamieho1s-projects, project jamieho-backroom, functions in lhr1. Production: https://jamieho-backroom.vercel.app
- **Supabase:** project `lhacrrnwddvpawsreamk`. The owner email is seeded in `private.settings` (not in git).
- **Resend:** alerts from `onboarding@resend.dev` to Jamie's Resend login email until the domain is verified (TKT-71).

## Open follow-ups
- Remind Jamie to **buy the domain** before the first subdomain app or the public launch (TKT-71).
- Experience tables: split the owner `for all` policy into insert/update/delete next time they change (perf advisor).
- Desktop wallpaper stays the artifact's for v1; redesign later with Jamie.

## Handing back
Before you stop, leave the work in a state another agent can pick up:
- tests green;
- MEMORY.md updated (done, not done, migrations applied or not, questions for Jamie);
- uncommitted work either committed (as Jamie) or listed clearly in MEMORY.md.

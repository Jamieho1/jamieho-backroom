# AGENTS.md: jamieho-backroom (for Codex and any other coding agent)

Read these first, in order. They are the source of truth and apply to every agent, not just Claude:
1. `CLAUDE.md`: goal and project rules.
2. `MEMORY.md`: status log. **Add a dated entry for everything you do** (what changed, what's applied live, what's still open).
3. `PRD.md`: scope and release plan (R1–R4).
4. `Resources/Tickets - Dependency Map.md` and the Notion "Tickets" database (TKT-51…TKT-71).
5. `README.md`: setup steps Jamie does himself (Google, Resend, Ops secrets).

## Where things stand (2026-11-01)
- **R1 done:** TKT-51…59 (skeleton, Google sign-in, app registry + Settings, landing sections, experience, projects,
  contact form + Inbox + Resend, analytics + Visitors, ops ping/export/banner). All live and verified by Jamie.
- **R2 in progress:** TKT-60 (/desktop shell) is done; TKT-61 (Notes read view) is done; TKT-62 (owner editor) is in progress. TKT-63 data copy stays with Claude; R3: TKT-64 Practice awaits explicit live sign-off; TKT-65 owner saving/Notes is implemented locally (migration applied live; deployment/review pending); TKT-66 data copy stays with Claude; R4: TKT-67 Behavioral CV/stories Done (Jamie verified live); TKT-68 question bank implemented (migration applied live; deployment/review pending); imports/cut-over stay with Claude; TKT-71 = domain + subdomain SSO.
- Notion: Tickets data source `collection://1ff804d9-463a-49b6-8221-217e5552c790`. Set a ticket In Progress when you start
  and Done only after Jamie confirms it works live.

- Public site UI follow-up: Home (`/`), Projects and Privacy now use the shared viewport-height desktop shell. They stay pre-rendered/public; signed-in registry icons load separately through RLS-filtered server reads. Global footer removed; Privacy links from Home. No new migration. Local implementation awaits Jamie's push/live review.

- Canonical app URLs: `/notes`, `/practices`, `/practices/<problem>` and `/behavioral`; old desktop query URLs redirect. Permitted launcher icons persist in shared client state and revalidate on navigation/account changes. This route/cache follow-up is local, awaiting Jamie's push/review; no migration.

- Practice UI follow-up: difficulty/NeetCode tags, search styling and private owner starred review list implemented locally. Migration `20261101142129_practice_stars.sql` was applied live on 2026-11-01; awaiting Jamie's push/live UI review.

- New authorized follow-up: Practice collapse/resize and CI Retry fix implemented locally. Public Articles app with owner drafts/publishing implemented; migration `20261101145851_articles.sql` was approved/applied live on 2026-11-01; deployment/live review pending. `/articles` is pre-rendered; `/articles/manage` is owner-only.

- Home London redesign: Jamie approved the first prototype on 2026-11-02 (commit `85a21d3`) and authorized the complete journey. Full camera route, responsive reading panels and project-linked technology list implemented locally. Migration `20261102005510_home_journey_sections.sql` adds empty Interests/Technology rows to existing `site_sections`; **APPLIED live** on 2026-11-02 after Jamie's approval (remote version `20261102081107`). Existing RLS/privileges remain unchanged. Personal copy and client material have not been seeded; empty Interests stay hidden. Awaiting Jamie's commit/push and full-journey live review. Public routes remain pre-rendered. See MEMORY.md and Resources/Home - Redesign Plan.md for checks/review state.

- Desktop introduction follow-up (2026-11-03): Jamie approved the composition with final fixes and authorized website integration. Removed the middle ship, grouped all robots, made the Eye clearly rotate, implemented long bird passes and sharp purple cloud lightning. Approved public artwork can be committed as an explicit content-rule exception. No new migration; public routes remain pre-rendered. Full local validation and current state are in MEMORY.md.

## The predecessor app (Interview Prep artifact): retired
- Everything worth keeping has been copied (Notes incl. system-design notes, CV). Arena/mocks/study plan were not migrated by
  Jamie's choice (a new practice app will be built from scratch). Its local source folder was removed on 2026-11-02.
- Full raw backup of its data: `../imports/2026-11-02/artifact-export.json` (outside git, personal data).

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
  - **Explicit exception approved by Jamie on 2026-11-03:** the approved public illustrated London wallpaper assets may be versioned in `public/desktop-art/`. Jamie's follow-up also permits the public desktop title/short-intro/invitation UI copy in `lib/desktop-introduction.ts`, editable independently of the artwork. This does not allow CV, resume, notes or other private content in git.
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
- New projects and TKT-71 follow `Resources/Subdomain Apps - Playbook.md`.
- Experience owner write policies were split into INSERT/UPDATE/DELETE by the TKT-67 migration, applied live 2026-11-01.
- Desktop introduction: the approved London art is now integrated locally; `/` shows the introduction, About Me opens at `/about`, and all allowed app icons are in the top bar (phone grid). Awaiting Jamie's commit/push and live verification. See `Resources/Desktop - Introduction Art Direction.md`.

## Handing back
Before you stop, leave the work in a state another agent can pick up:
- tests green;
- MEMORY.md updated (done, not done, migrations applied or not, questions for Jamie);
- uncommitted work either committed (as Jamie) or listed clearly in MEMORY.md.

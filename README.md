# jamieho-backroom

Jamie Ho's personal website. It has three parts:
- a public portfolio;
- a Google-sign-in desktop of apps (Notes, practice arena, Behavioral);
- a hub for later projects on subdomains.

The plan is in `PRD.md`, working rules in `CLAUDE.md`, status in `MEMORY.md`, and the ticket order in `Resources/Tickets - Dependency Map.md`. Tickets live in Notion (TKT-51 to TKT-71).

**This folder is the repo root.** Run every git command here, never in the parent `Personal Website` folder.

**Stack:** Next.js (App Router) on Vercel, with Supabase (Postgres, Auth, row-level security).

## Run locally
```bash
npm ci
cp .env.example .env.local     # fill in the two public Supabase values
npm run dev                    # http://localhost:3000
npm run check                  # typecheck + unit tests + build
npm run test:e2e               # Playwright, desktop + 390 px phone
```

`/api/health` returns `{ ok, app, supabase }`, where `supabase` is `ok`, `unconfigured` or `unreachable`. It makes a real round-trip to Supabase Auth's health endpoint, so it needs no tables.

## One-time setup (Jamie)
1. **GitHub:** create the empty private repo `jamieho-backroom`, then push this folder:
   `git remote add origin git@github.com:<you>/jamieho-backroom.git && git push -u origin main`.
2. **Supabase:** create a project named `jamieho-backroom` (London region, free plan). From *Project Settings → API*, copy the **Project URL** and the **anon/publishable key**.
3. **Vercel:**
   1. *Add New → Project*, then import `jamieho-backroom` from GitHub (the framework preset is Next.js).
   2. Under *Environment Variables*, add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for Production and Preview.
   3. Deploy.
4. **Check:** open `https://<project>.vercel.app/api/health`. It should show `"ok": true, "supabase": "ok"`.

## Google sign-in setup (Jamie, TKT-52)
1. **Google Cloud Console:**
   1. Create a project, open *APIs & Services → OAuth consent screen*, choose External, add your app name and email, and publish.
   2. Under *Credentials → Create credentials → OAuth client ID*, choose type **Web application**.
   3. Set the authorised redirect URI to `https://lhacrrnwddvpawsreamk.supabase.co/auth/v1/callback`.
2. **Supabase → Authentication → Sign In / Providers → Google:** turn it on and paste the Client ID and Client Secret.
3. **Supabase → Authentication → URL Configuration:**
   - Site URL: `https://jamieho-backroom.vercel.app`.
   - Redirect URLs: `https://jamieho-backroom.vercel.app/auth/callback`, `http://localhost:3000/auth/callback` and `https://jamieho-backroom-*-jamieho1s-projects.vercel.app/auth/callback`.

The owner is whoever signs in with the email stored in `private.settings` (seeded with SQL, not in git).

## Contact form email alert (Jamie, TKT-57)

Messages are always saved to the Inbox (Settings). The email alert is optional:

1. Sign up at resend.com with the email you want alerts sent to. Until you verify a domain (TKT-71), Resend only
   delivers from `onboarding@resend.dev` to your own account email, which is all the alert needs.
2. Resend → API Keys → Create, permission **Sending access**. Copy it.
3. Vercel → Settings → Environment Variables, Production + Preview:
   - `RESEND_API_KEY` = the key, **Sensitive**
   - `CONTACT_ALERT_TO` = your Resend account email
   - `IP_HASH_SALT` = a long random string you make yourself (e.g. `openssl rand -hex 32`), **Sensitive**
4. Redeploy. Send yourself a test message from the home page.

## Ops: daily ping, weekly encrypted export (Jamie, TKT-59)

The **Ops** GitHub workflow pings the database every day (a free Supabase project pauses after 7 quiet days) and
exports every table each Sunday. Results show in Settings → Ops; problems show as a banner at the top of Settings.

1. Supabase → Project Settings → API Keys: copy the **service_role** (or a new **secret**) key. Keep it out of Vercel.
2. GitHub → repo → Settings → Secrets and variables → Actions → **New repository secret**, three times:
   - `SUPABASE_URL` = your project URL
   - `SUPABASE_SERVICE_ROLE_KEY` = that key
   - `EXPORT_PASSPHRASE` = a long passphrase you make up (16+ characters). Save it in your password manager:
     without it the exports can't be opened.
3. GitHub → Actions → **Ops** → Run workflow → `ping`, then again with `export`. Settings → Ops should show both.
4. To open an export: download it from the run's page (Artifacts), unzip, then
   `npm run decrypt-export -- ~/Downloads/backroom-export-YYYY-MM-DD.json.enc` and type the passphrase.

GitHub pauses scheduled workflows after 60 days with no commits; Settings warns when the ping goes stale.
To see the banner on purpose, set `FREE_TIER_WARN_AT=0.0001` in Vercel, redeploy, then remove it.

## Database
- Migrations live in `supabase/migrations`.
- `npm test` runs the row-level security (RLS) tests on an in-process Postgres (PGlite) with Supabase's roles, so they need no secrets.
- Every table in `public` must have RLS enabled; a test fails otherwise.

Never put a secret in this repo. Only `.env.example` (empty values) is committed. The service-role key is never used by the app.

## Signed-in desktop (TKT-60)

Before deploying this version, apply `supabase/migrations/20261031090000_desktop_apps.sql`
in the Supabase SQL editor after the earlier migrations. This adds the read-only `desktop_apps`
view, which uses the current caller's RLS access checks without exposing invite emails or policy helpers.
Applied to production with Jamie's approval on 31 October 2026.

`/desktop` asks anonymous visitors to sign in. Registry apps launch inside the desktop; external apps
open in a new tab. Notes, Practice and Behavioral render inside the desktop.
Launches use the existing `app_opens` log (one entry per person, app and day), shown in Settings → Visitors.
After deployment, check a member, an invited member and the owner; the owner alone should see Settings.

## Notes read view (TKT-61)

Apply `supabase/migrations/20261031150000_notes.sql` before deploying this version. It creates an empty,
RLS-protected `notes` table; applied to production through Supabase MCP with Jamie's approval on 31 October 2026. Open Notes from `/desktop` to read it.
The import format for Claude's TKT-63 copy is in `Resources/Notes - Import Contract.md`.
No personal note content is included in the repository or seeded by this migration.

## Notes owner editor (TKT-62)

Apply `supabase/migrations/20261031151127_notes_free.sql` before deploying this version. It adds the empty
`free` text column to notes and keeps the existing RLS policies. Applied to production through Supabase MCP with Jamie's approval on 31 October 2026.
The owner sees **Edit note** on an existing note and can save its body and free notes. Failed saves keep both
draft fields with **Retry**. Cancel discards the draft; readers have no editing controls. Notes must be imported
before the editor is visible; this ticket creates no sample content.

## Practice arena (TKT-64)

Open Practice from `/desktop`, or link to a problem with `/desktop?app=practice&problem=217`.
The 143 prewritten problems, tests, reference solutions, visuals and pitfalls are ported from the artifact's
own-words source. No LeetCode statements, saved attempts or personal question notes were imported.

Run checks visible cases; Submit checks all local tests. Python runs only in a fresh browser Web Worker;
there is no code-execution API or server execution. Runs stop after five seconds. If Python cannot load,
Run/Submit stay disabled with Retry Python, while the statement and Solution remain readable.

Code is stored in localStorage per signed-in viewer and problem. It survives reloads in the same browser;
visitor code is not sent to Supabase. Clearing site data clears this browser's code.

TKT-65 adds owner-only **Save code** to sync the current problem between devices. The saved database
version loads first; **Restore browser draft** can recover a different local draft. Owner Run/Submit
automatically saves a private attempt snapshot and result; failed saves offer Retry. Retrying an old
attempt never replaces the separately saved code. Visitors keep browser-only code and attempts.
The per-question Notes tab is shared with people allowed to open Practice; only the owner edits it.
Notes problem links open the corresponding Practice problem. The privacy page describes this storage.

TKT-65 migration `supabase/migrations/20261101005242_practice_owner_data.sql` was approved and applied live on 2026-11-01.
It adds owner-only `practice_code` / `practice_attempts` and shared `question_notes`, all protected by RLS.
Remote migration version: `20261101080700`. Claude handles the TKT-66 import using
`Resources/Practice - Import Contract.md`; no personal code, attempts or question notes belong in git.

`predev` and `prebuild` copy the pinned Pyodide package into ignored `public/pyodide/`; commit the package
lock and `scripts/copy-pyodide.mjs`, not generated runtime assets. The worker and Python harness in
`public/runner/` are tracked. Runtime source/license notices are generated alongside Pyodide.
No database migration is needed for TKT-64.

Tests validate all 143 reference solutions with the local test harness. Headless browser tests exercise real
Pyodide, network restrictions, worker failure, CodeMirror, local code persistence, five-second termination
and the 390 px layout. Their UI bundle is test-only; it does not create a public fixture route.

## Behavioral CV and stories (TKT-67)

Open Behavioral from `/desktop?app=behavioral`. It reuses Experience roles/projects/education and all
of their bullets, including hidden bullets, for people permitted to open Behavioral. The registry starts
Invite-only; Settings remains the place to change access. Public landing-page reads stay unchanged.

Each CV bullet shows a story count and opens its linked STAR stories. The owner can Add story, select
its CV bullet, and edit Situation, Task, Action, Result, Skills and Numbers. Invitees read only.
Save/Retry retains the draft on failure; Cancel discards it. Removing an Experience bullet keeps its
stories with no linked bullet, accessible under All stories. Story text is stored in Supabase, not localStorage.

`supabase/migrations/20261101104828_behavioral_stories.sql` was approved and **applied live** on
2026-11-01 (remote version `20261101105507`). It adds RLS-protected `behavioral_stories` and splits the existing Experience
owner write policies into INSERT/UPDATE/DELETE without changing public read rules. No data is imported.
Claude handles TKT-69 using `Resources/Behavioral - Import Contract.md`; personal CV and story text
must never be committed. The question bank/coverage strip is implemented in TKT-68 below.

## Behavioral question bank (TKT-68)

Behavioral → Questions has 37 generic prompts grouped under Conflict, Failure, Leadership, Ambiguity,
Ownership, Impact and Customer, with General/Palantir/Balyasny/JPMorgan set filters and search.
Company sets are practice prompts, not an official list of interview questions.

The owner maps up to two different stories to each question and edits its answer outline/follow-ups.
Save updates coverage immediately; failed Save/Retry keeps the draft and locks filters/view switching.
Invitees read the saved preparation and can open its linked STAR stories. Coverage counts mapped
questions with an existing linked story, once per question; outlines alone do not count. Theme totals
always cover the complete bank, independently of filters. Clearing links removes coverage; deleting a
story clears its database links without deleting answer text.

Migration `supabase/migrations/20261101110015_behavioral_answers.sql` was approved and **applied live**
on 2026-11-01 (remote version `20261101110756`). It creates RLS-protected `behavioral_answers`;
Behavioral app access controls reads and only the owner writes. Generic prompts stay in code;
personal preparation stays in Supabase and encrypted exports. Claude handles the TKT-69 import.

## Shared public desktop and window sizing

Home (`/`) opens first as a desktop app, with Projects (`/projects`) in the same shell. Privacy
(`/privacy`) also uses the shell and is linked from the bottom of Home; there is no global footer
under the desktop. All three public routes remain pre-rendered and need no sign-in. Home and Projects
icons appear in every desktop launcher. Home content fills the available window width within its 24 px
side padding; there is no redundant Open my desktop link. Notes and Practice retain their own layouts.
Owner Edit site and sign-in/theme controls remain in the menu bar.

On public pages, signed-in registry icons load client-side from the server's RLS-filtered desktop view.
Guests see only the public page icons. Protected app content remains behind `/desktop` authentication
and database RLS. Public page navigation is not logged as a registry app launch; existing private/app
launch logging stays intact. `/desktop?app=home`, `projects` and `privacy` redirect to canonical public routes.

The shell fills the viewport; open windows stretch to its bottom regardless of content length. Long
content scrolls inside the window rather than extending the document. Phone launchers stay a grid
with their own scroll limit so the active page remains usable at 390 px. Settings' standalone owner
route and sign-in/unavailable desktop states also use the shell. No database migration is needed.

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

`/desktop` asks anonymous visitors to sign in. Registry apps launch inside the desktop; external apps
open in a new tab. Notes, Practice and Behavioral are placeholders pending their content tickets.
Launches use the existing `app_opens` log (one entry per person, app and day), shown in Settings → Visitors.
After deployment, check a member, an invited member and the owner; the owner alone should see Settings.

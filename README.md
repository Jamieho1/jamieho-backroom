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

## Database
- Migrations live in `supabase/migrations`.
- `npm test` runs the row-level security (RLS) tests on an in-process Postgres (PGlite) with Supabase's roles, so they need no secrets.
- Every table in `public` must have RLS enabled; a test fails otherwise.

Never put a secret in this repo. Only `.env.example` (empty values) is committed. The service-role key is never used by the app.

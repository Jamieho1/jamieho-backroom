# MEMORY.md: Personal Website

## Status
- 2026-10-29: plan grilled and every branch resolved. PRD signed off by Jamie.
- Nothing is built yet.

## Key Context
- **Stack:** Next.js on Vercel Hobby + Supabase (Postgres, Auth with Google, RLS) + Resend + Vercel Web Analytics.
- **Access:**
  - Public: landing, Projects.
  - Google sign-in, open to anyone: desktop, Notes, arena.
  - Invite-only: Behavioral.
  - The owner (Jamie) edits everything.
- **Microservices:** future projects get their own repo and Vercel deployment on a subdomain, a shared Supabase login (cookie on `.<domain>`), and a row in the `apps` registry.
- **Domain:** v1 runs on `*.vercel.app`; the domain is needed before the first subdomain app or public launch.
- **No AI in v1. System design app later.**
- **Data copy:**
  - From: the artifact https://claude.ai/artifact/KC72SrU4UmVEG6KddUpqot.
  - Method: export JSON, then load through the Supabase connector.
  - CV bullets start hidden.

## Working Notes
- Name: jamieho-backroom (repo, Vercel and Supabase project).
- Desktop wallpaper: keep the current one for v1; redesign later together with Jamie.
- 2026-10-29: 21 tickets cut (TKT-51…TKT-71) in Notion Tickets, project row "Personal Website (jamieho-backroom)"; map in Resources/Tickets - Dependency Map.md. Startable now: TKT-51 (needs Jamie's repo, Vercel and Supabase projects, secrets).
- 2026-10-29: the first push went from the parent `Personal Website` folder (README-only repo), so Vercel deployed nothing. Fixed by moving the PRD, CLAUDE.md, MEMORY.md and Resources into the repo root; the parent's stray `.git` and README were moved to `_to_delete/`.
- 2026-10-29: TKT-51 done. /api/health returns ok on Vercel, with the Supabase round-trip passing.
- 2026-10-29: TKT-52 code done:
  - auth_roles migration applied to Supabase project `lhacrrnwddvpawsreamk` (eu-west-2); owner email seeded in private.settings.
  - Functions region pinned to lhr1 (vercel.json).
  - Security advisor flags is_owner()/record_signin() as callable by authenticated users. This is intended.
  - `public.rls_auto_enable()` is Supabase-created, not ours; anon can call it. Tell Jamie and offer to revoke.
- 2026-10-29: Google won't publish the OAuth app without a privacy policy link, and checks site ownership. Added a public `/privacy` page and a footer link.
  - Optional env: `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` (adds the Search Console meta tag) and `NEXT_PUBLIC_CONTACT_EMAIL` (shown on /privacy).
  - Keep /privacy true to what the code collects; update it whenever a ticket adds data collection (contact form, analytics).
- 2026-10-29: bug found in testing. Supabase inserts an OAuth user and only then sets email_confirmed_at, so the owner landed as a member.
  - Fix: migration owner_role_on_confirm, which recomputes the role on email/confirmation updates and fixed existing rows. Applied to Supabase.
  - The PGlite tests now copy the insert-then-confirm order.
- Vercel env naming: `NEXT_PUBLIC_*` variables are type Config, not Sensitive (Vercel forbids it). Real secrets (Resend key etc.) are unprefixed and Sensitive.
- 2026-10-29: blocked API access to Supabase's `public.rls_auto_enable()` (migration lock_rls_auto_enable, applied).
- 2026-10-29: TKT-53 built:
  - `apps` + `invites` tables with RLS, 4 seeded apps (Settings locked to owner-only).
  - `/settings` (owner-only, 404 for others): change app visibility, manage invites.
  - New data tables guard reads with `rls.can_view_app('<app>')`.
  - Migration `rls_helpers_out_of_api` (moves the helpers out of `public`) is written and tested. It is NOT yet applied: Jamie's approval timed out.
- 2026-10-29: TKT-53 done.
- 2026-10-29: TKT-54 built:
  - `site_sections` table (hero / about / writing / contact) with RLS: anyone reads, the owner edits. Applied.
  - `/` is pre-rendered again: the header and viewer state are client-side, and the landing is read with the public key and no cookies.
  - Saving runs `revalidatePath('/')`; there is also a daily fallback.
  - `scripts/assert-static.mjs` fails CI if `/` or `/privacy` stop being pre-rendered.
  - When Supabase is down, `getSections()` throws, so Next keeps the last good page.
  - The proxy skips the Supabase call when there is no session cookie.
  - Light/dark toggle persists in localStorage, with a boot script to avoid a flash of the wrong theme.
- 2026-10-29: TKT-54 done. Fixed a flaky CI test (wait for the Retry button, not just the message).
- 2026-10-29: TKT-55 built:
  - `experience_items` + `experience_bullets` with a public flag on each; new rows default to hidden. Applied.
  - Reads: public rows for everyone; the whole CV for whoever can open Behavioral (`rls.can_view_app('behavioral')`). Writes: owner only.
  - Landing shows the public Experience list; in Edit site mode the owner gets an editor (add, edit, reorder, delete, tick public).
  - Perf advisor: the owner `for all` policy overlaps the select policy. Harmless at this size; split it into insert/update/delete policies next time these tables change.

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

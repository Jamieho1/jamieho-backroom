# CLAUDE.md: Personal Website

## Goal
Jamie's personal website is live with four parts:
- a public landing/portfolio page;
- a Google-sign-in desktop hosting Notes, the practice arena and Behavioral;
- an app registry that later projects plug into as subdomain apps;
- all of it at £0/month on free tiers.

## Linked project
- `01_Projects/Interview Prep` (the Claude artifact) is the predecessor. Its Notes, arena and Behavioral are being ported here.
- The artifact keeps running until R4 is done; then its Notes and Behavioral become read-only.

## Source of truth
- `PRD.md`: scope, constraints, build plan (R1–R4).
- The decision log is the project doc `claude/personal-website-grill-decisions.md` in the Job Application Tracker Claude project.

## Project-Specific Workflow
1. Work release by release (R1 → R4), following the tickets from /to-tickets.
2. **Tell Jamie before starting any coding ticket** (which ticket, what it builds) and wait for his go-ahead.
3. Each release ends with unit + end-to-end tests passing, then Jamie's review. Jamie pushes to GitHub himself.

## Repo layout
- `01_Projects/Personal Website/jamieho-backroom/` is the git repo root. It holds the code plus `PRD.md`, `CLAUDE.md`, `MEMORY.md` and `Resources/`.
- Nothing else in `Personal Website/` is tracked. Never run `git init` or other git commands in the parent folder.
- GitHub: https://github.com/Jamieho1/jamieho-backroom · Vercel: jamieho1s-projects/jamieho-backroom.

## Project-Specific Rules
- **Secrets:** Jamie enters every secret (Supabase, Google OAuth, Resend) himself. Never read, print or handle them.
- **No AI in v1:** no LLM calls anywhere.
- **Personal content:** CV and personal content live only in the database, never in git.
- **Problem content:** own words only. No LeetCode text, no scraping.
- **No server-side code execution:** Python runs only in the browser Pyodide worker.
- **Access control:** visibility is enforced by Supabase RLS (with tests), not just the UI. Only the owner writes.
- **Privacy by default:** copied CV bullets start hidden; Behavioral starts Invite-only.
- **Domain reminder:** remind Jamie to buy the domain before the first subdomain app or public launch.
- **Before changing content:** say what will change before changing Jamie's notes or content.

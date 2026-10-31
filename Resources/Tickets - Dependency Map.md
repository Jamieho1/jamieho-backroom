# Tickets — Dependency Map (Personal Website / jamieho-backroom)

_Source: `PRD.md` (signed off 2026-10-29). Tickets live in Notion → Jamie Ho — Cowork OS → Tickets (project row "Personal Website (jamieho-backroom)"). IDs match Notion. Check this before starting work; only pick tickets whose blockers are Done, and tell Jamie before starting any coding ticket._

## Current position (2026-10-31)

- **R1 (TKT-51–59): Done**, live and verified by Jamie.
- **TKT-60: Done** — desktop and Settings fix deployed; desktop migration applied live. Jamie authorized continuing.
- **TKT-61: Done** — Jamie confirmed the live Notes empty state.
- **TKT-62: In Progress** — owner editor implemented/tested locally; free-notes migration applied live; awaiting Jamie's push and live review.
- **TKT-63 data copy stays with Claude.**

## Order

```
TKT-51 Skeleton
└─ TKT-52 Google sign-in + roles + RLS tests
   ├─ TKT-53 App registry + visibility + invites
   │  ├─ TKT-56 Projects page
   │  └─ TKT-60 /desktop shell
   │     ├─ TKT-61 Notes read view
   │     │  ├─ TKT-62 Notes owner editing ──┐
   │     │  └─ TKT-63 Data copy: notes      │
   │     ├─ TKT-64 Arena (Pyodide, Solution)│
   │     │  └─ TKT-65 Arena owner saving + Notes panel (also needs TKT-62)
   │     │     └─ TKT-66 Data copy: arena code + question notes
   │     └─ TKT-67 Behavioral CV view (also needs TKT-55)
   │        └─ TKT-68 Question bank + coverage strip
   │           └─ TKT-69 Data copy: CV, stories, answers
   ├─ TKT-54 Landing + Edit site
   │  └─ TKT-55 Experience (public/hidden bullets)
   ├─ TKT-57 Contact form + Inbox + Resend
   ├─ TKT-58 Analytics + sign-in list
   ├─ TKT-59 Ops: keep-alive, weekly export, banner
   └─ TKT-71 [Later] Domain + cross-subdomain sign-in

TKT-70 Artifact cut-over ← TKT-63 + TKT-66 + TKT-69
```

## All tickets

| ID | Ticket | P | Blocked by | Blocks |
|---|---|---|---|---|
| TKT-51 | [R1] Skeleton: Next.js on Vercel + Supabase, deployed hello page | P0 | — | TKT-52 |
| TKT-52 | [R1] Google sign-in, owner role and sign-in log (with RLS tests) | P0 | TKT-51 | TKT-53, TKT-54, TKT-57, TKT-58, TKT-59, TKT-71 |
| TKT-53 | [R1] App registry, per-app visibility and invite list | P0 | TKT-52 | TKT-56, TKT-60 |
| TKT-54 | [R1] Landing page from the database + owner Edit site mode | P0 | TKT-52 | TKT-55 |
| TKT-55 | [R1] Experience section with public/hidden bullets | P0 | TKT-54 | TKT-67 |
| TKT-56 | [R1] Projects page from the registry | P1 | TKT-53 | — |
| TKT-57 | [R1] Contact form, Inbox and Resend alert | P1 | TKT-52 | — |
| TKT-58 | [R1] Vercel Web Analytics + sign-in list in Settings | P1 | TKT-52 | — |
| TKT-59 | [R1] Ops: keep-alive ping, weekly JSON export, free-tier banner | P1 | TKT-52 | — |
| TKT-60 | [R2] /desktop shell ported from the artifact | P0 | TKT-53 | TKT-61, TKT-64, TKT-67 |
| TKT-61 | [R2] Notes app, read view | P0 | TKT-60 | TKT-62, TKT-63 |
| TKT-62 | [R2] Notes owner editing | P0 | TKT-61 | TKT-65 |
| TKT-63 | [R2] Data copy: coding notes from the artifact | P0 | TKT-61 | TKT-70 |
| TKT-64 | [R3] Practice arena: problems, Run/Submit in the browser, Solution | P1 | TKT-60 | TKT-65 |
| TKT-65 | [R3] Arena owner saving + per-question Notes panel | P1 | TKT-64, TKT-62 | TKT-66 |
| TKT-66 | [R3] Data copy: latest arena code + per-question notes | P1 | TKT-65 | TKT-70 |
| TKT-67 | [R4] Behavioral: CV view with STAR stories | P1 | TKT-55, TKT-60 | TKT-68 |
| TKT-68 | [R4] Behavioral: question bank by theme + coverage strip | P1 | TKT-67 | TKT-69 |
| TKT-69 | [R4] Data copy: CV, stories and Behavioral answers | P1 | TKT-68 | TKT-70 |
| TKT-70 | [R4] Artifact cut-over: Notes and Behavioral read-only | P1 | TKT-63, TKT-66, TKT-69 | — |
| TKT-71 | [Later] Own domain + cross-subdomain sign-in (remind Jamie) | P2 | TKT-52 | — |

## Parallel lanes once TKT-52 is Done

- TKT-53, TKT-54, TKT-57, TKT-58, TKT-59 can run side by side.
- After TKT-60: Notes (61→62/63), Arena (64→65→66) and Behavioral (67→68→69, also needs TKT-55) are separate lanes.

## Reminder

- TKT-71: remind Jamie to buy the domain before the first external subdomain app or the public launch.

# Build prompts — Split PassLoop into its own project

Decisions (2026-11-24, Jamie):
- PassLoop becomes a **separate Next.js project** in `~/Documents/Developer/PassLoop`, deployed as a **new Vercel project** on `*.vercel.app` (custom domain later).
- **Same Supabase project for now** (auth, owner role, tables and data stay where they are; split later). No table is dropped or renamed in this work.
- Start by **copying this repo, stripping everything that isn't PassLoop, then reskinning** with the Loop · Lime design (dark + light). Mockup: `~/Documents/Developer/Personal Website/PassLoop design mockups/9-loop-lime-dark-light.html`.
- **Everything currently under `/interview` moves to PassLoop** (DSA, System Design, LLD, SQL, notes shelves, Behavioral, Resume, Companies, Applications, etc.). The personal site's **older desktop apps (Notes, Practice, Behavioral) are deleted**, not moved.
- The personal site keeps a **button/link to PassLoop** and redirects old `/interview/*` URLs to the matching PassLoop URL.

Paste in order: **PL1 → PL2 → PL3 → PL4 → PL5**. Shared rules: read AGENTS.md, docs/README.md, docs/status.md, docs/security.md first (in whichever repo the ticket works in) and follow them. Jamie pushes; never push. New migrations only, applied live only after Jamie says "apply it". No runtime AI calls. Desktop + 390 px + reduced motion. Update docs/ + MEMORY.md + docs/decisions.md after each ticket.

---

## PL1 — Create the PassLoop repo (copy + strip, no redesign yet)

```
Ticket PL1. Source: ~/Documents/Developer/Personal Website/jamieho-backroom (read its AGENTS.md, docs/README.md, docs/status.md, docs/interview.md, docs/security.md, docs/content-drafts.md). Target: ~/Documents/Developer/PassLoop (empty folder).

1. Copy the source working tree into the target (exclude .git, node_modules, .next, test-results, tsconfig.tsbuildinfo, public assets used only by the personal site, and every .env*). `git init` a fresh repo there (no history). Rename the package to "passloop"; new README/AGENTS.md/CLAUDE.md/MEMORY.md and docs/ describing PassLoop only (carry over the rules that still apply: Jamie pushes, migrations applied only on "apply it", Content Drafts, no runtime AI, privacy/export).
2. Routes: PassLoop lives at the site root. Move app/interview/** to app/** so /interview/X becomes /X (dashboard at /). Keep /auth/*, /api/health, /privacy (PassLoop version), /settings if PassLoop needs it, and /manage/review (owner Content Drafts review, PassLoop tables only for now — see PL3). Update every internal href, helper (modeHref, sdHref, companyHref, interviewProblemHref, etc.), redirect and test. Add a redirect so /interview/:path* → /:path* inside PassLoop too.
3. Delete everything that is not PassLoop: home/journey/about/projects/articles/guides/resources/contact/desktop and its apps (Notes/Practice/Behavioral desktop apps), portfolio/story components, their lib/, CSS, tests, scripts and public assets. Remove dependencies nothing uses any more (gsap/lenis etc. if unused). Keep pyodide, pglite, excalidraw, codemirror and their copy/assert scripts.
4. Supabase: same project. Keep the existing migrations folder as history but add a README note that the live schema is shared with the personal site and migrations must be coordinated (one migration folder is the source of truth: keep authoring new migrations in PassLoop only for PassLoop tables; the personal site keeps its own). Do not apply anything.
5. Data export and privacy page: PassLoop's export covers only PassLoop tables; privacy text names PassLoop as the service.
6. Site identity: title "PassLoop", favicon/OG from the Loop ring mark (simple SVG, no external art).
Done when: `npm ci`, typecheck, full unit + DB suite, build, static + bundle assertions all pass in the new repo; a route map (old /interview URL → new URL) is written to docs/routes.md (PL4 uses it for redirects); report exact checks. Do NOT touch the personal site repo in this ticket. Do NOT push.
```

---

## PL2 — Content Drafts per site

```
Ticket PL2. Both repos share public.content_changes. Without a split, each site's /manage/review would list and apply the other site's drafts.
1. NEW migration (author it in PassLoop; Jamie applies once): add `site text not null default 'personal' check (site in ('personal','passloop'))` to public.content_changes, backfill: rows whose operations only touch PassLoop tables (notes, question_notes, practice_*, interview_*, companies, company_questions, interview_experiences, system_design_*, behavioral_* , resume_templates — confirm the exact list from the apply functions) → 'passloop'; everything else stays 'personal'. Keep private.apply_content_change unchanged except: reject a set whose operations mix tables of both sites.
2. Each app's review list, preview overlay, draft counter and approval filter by its own site; inserts set site explicitly. Same change in the personal-site repo (small, in PL4) — write it as a patch note in docs/content-drafts.md of both repos.
3. Claude's draft-writing instructions in docs/content-drafts.md: always set `site`.
Done when: DB tests (backfill, mixed-site rejection, filtering), unit tests, typecheck, suite, build. Do NOT apply.
```

---

## PL3 — Deploy PassLoop (Jamie + Claude)

```
1. Jamie: create an empty GitHub repo `passloop`, add it as origin, push PL1+PL2.
2. Claude (Vercel MCP): create Vercel project "passloop" from that repo, copy the required env vars from jamieho-backroom (Supabase URL/keys, owner id, analytics) — never print secrets — and deploy. Check passloop.vercel.app is free; otherwise pick the closest available name with Jamie.
3. Jamie (Supabase dashboard → Auth → URL configuration): add https://passloop.vercel.app/** to redirect URLs (and the OAuth provider's callback list if one is used). Claude verifies sign-in and owner access on the live site with Chrome.
4. Claude applies the PL2 migration after Jamie says "apply it".
```

---

## PL4 — Remove PassLoop and the old apps from the personal site; add the PassLoop button

```
Ticket PL4. Repo: jamieho-backroom. Requires PL3 live (passloop URL known: set NEXT_PUBLIC_PASSLOOP_URL).
1. Delete app/interview/**, components/interview/**, components/practice/**, components/notes/**, components/behavioral/** and the desktop apps Notes, Practice and Behavioral (app/notes, app/practices, app/behavioral, app/desktop/*-content.tsx, lib/apps.ts entries, desktop icons), plus their lib/, CSS, tests, scripts (copy-pyodide/excalidraw/pglite and bundle assertions) and dependencies that become unused (pyodide, @electric-sql/pglite, @excalidraw/excalidraw, codemirror, …). Keep anything the remaining personal pages still use (check imports; e.g. shared markdown, diagram).
2. Redirects (next.config or proxy): /interview and /interview/:path* → `${PASSLOOP_URL}/:path*` (308); /notes, /practices/*, /behavioral → PassLoop's matching section (notes shelf, DSA practice, behavioral).
3. PassLoop button: replace the "Interview Prep" nav link with an external "PassLoop ↗" link, and add a PassLoop card to What I build / Projects (title, one-line description, link). Opens in the same tab; clearly marked as a separate site.
4. Content Drafts: personal site filters to site='personal' (PL2), its allowlist drops PassLoop tables.
5. Privacy page and data export: remove PassLoop tables and say PassLoop is a separate service with its own privacy page (link). Do NOT drop or alter any database table.
Done when: typecheck, suite, build, static assertions pass; grep shows no remaining imports of removed modules; browser check of the nav link and a redirect; report checks.
```

---

## PL5 — PassLoop redesign foundation: Loop · Lime shell (dark + light)

```
Ticket PL5. Repo: PassLoop. Requires PL1. Design reference: ~/Documents/Developer/Personal Website/PassLoop design mockups/9-loop-lime-dark-light.html (copy it into PassLoop/docs/design/).
1. Design tokens as CSS variables for dark and light (bg #141318/#f7f7f3, card #1c1b21/#fff, border #2b2a31/#e6e6df, text #f2f2f3/#16161a, muted #9b9aa3/#66666e, lime fill #c6f24e both, accent text #c6f24e/#4d7c0f, ring #c6f24e/#9ccc1f). Theme: follows the device by default; a sun/moon toggle overrides it and is remembered per browser (localStorage, guarded); no flash on load.
2. Shell: slim icon rail (Today, Coding: DSA + SQL, Design: System + LLD, Behavioural, Companies, Mock) with tooltips and an Applications/Resume entry at the bottom; top bar with ⌘K search across questions, notes and companies (client-side index, no AI); streak; phone layout with a bottom tab bar.
3. Home (/): the Loop dashboard from the mockup with real data where it exists (progress per track from existing tables, recent activity heatmap from submissions/attempts, companies list); "Today's loop" picks 3 items: a coding question to redo (last failed submission) or next unsolved, the next system-design step, and a behavioural theme without a story — deterministic, no AI.
4. Restyle every existing page to use the tokens (no layout changes yet beyond the shell); section-by-section redesign comes in later tickets.
Done when: unit tests (theme resolution, Today's loop selection, search index), browser tests desktop + 390 px in both themes, contrast check of text tokens (WCAG AA), typecheck, suite, build, assertions. Report checks.
```

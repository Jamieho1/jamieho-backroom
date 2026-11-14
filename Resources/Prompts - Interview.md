# Build prompts — Interview

Spec: `Resources/Interview - PRD.md` (signed off 2026-11-14). Paste **one at a time, in this order**: **118 → 119 → 120 → 121 → 122 → 123 → 124 → 125**. Several tickets add migrations or touch the same layout files, so do not run them in parallel. Start after TKT-107 lands and TKT-108 is closed. Tell Claude when each lands; Claude checks migrations before you say "apply it".

Every prompt starts with the same preamble so each can be pasted on its own.

---

## TKT-118 — Shell: /interview sidebar workspace

```
You are working in the jamieho-backroom repo (Next.js App Router + Supabase). First read AGENTS.md, docs/README.md, docs/status.md, docs/architecture.md, docs/security.md and docs/operations.md and follow them (Jamie pushes; never push; new migrations only and never apply live before Jamie says "apply it"; Jamie handles secrets; update docs/ and MEMORY.md after the change). Spec: Resources/Interview - PRD.md (Scope §1, §2, §4 placeholders). Ticket: TKT-118.

Build the Interview shell:
1. Routes under app/interview with a layout that has NO site top bar: three columns — section rail, topic list, content. Dark theme only (define its own tokens; light mode later).
2. Section rail (expanded): logo linking to /, Dashboard (/interview); group "Interview Skills": Data Structures & Algorithms (/interview/dsa/practice), System Design, Low Level Design, Finance, AI Engineering; group "Career": Resume (/interview/resume), Behavioral (/interview/behavioral); group "Tools": Companies, Roadmaps, Application Tracker; bottom: Feedback (stub button for TKT-123), "Back to site" (/), and the existing sign-in/account control. Collapsed: icons only, names in tooltips (hover and keyboard focus).
3. Topic-list column with a collapse button; collapsed it disappears completely leaving a small expand button at the top-left of the content. Remember both collapse states per browser (localStorage wrapped in try/catch).
4. Phones (≤768 px): rail becomes a slide-in drawer from a menu button; topic list sits behind a "Topics ▾" button above the content; content full width; no horizontal overflow at 390 px.
5. Our own coloured line-icon set (inline SVG components, one stroke style): one per section and one per DSA topic, coloured from lib/notes/topics.ts dot colours (give class-design a real colour). Do not copy TechPrep's icons.
6. "Soon" placeholder pages (short message + tag) for Dashboard, Finance, AI Engineering, Companies, Roadmaps, Application Tracker. Resume and Behavioral routes can be placeholders for now (built in later tickets).
7. Site top bar (components/site-navigation.tsx): add Interview between Projects and Articles, linking to /interview. Resources page (/resources): keep only the Guides shelf; remove the Notes/Practice/Resume & Stories app cards and locked previews from the page, but keep the membership-gate components/code in the codebase for future courses.
8. Old routes /notes, /practices, /practices/[problem], /behavioral keep working unchanged.

Done when:
- /interview renders the shell; both collapse modes work and persist; tooltips in collapsed mode; keyboard navigation works.
- Desktop and 390 px browser tests: no sideways scroll, drawer and Topics button work.
- Top bar shows Interview; /resources shows Guides only; old routes still work; static assertions unchanged.
- Typecheck, unit suite, build pass. Create docs/interview.md (structure, routes, icons, collapse behaviour), link it from docs/README.md, update docs/architecture.md, docs/status.md and MEMORY.md.

Report: files changed, checks actually run and results.
```

---

## TKT-119 — Sections: DSA, System Design, Low Level Design

```
You are working in the jamieho-backroom repo. First read AGENTS.md, docs/README.md, docs/status.md, docs/interview.md, docs/architecture.md and docs/content-drafts.md and follow them. Spec: Resources/Interview - PRD.md (Scope §1, §3). Ticket: TKT-119. Requires TKT-118.

Build:
1. Sections dsa, system-design, low-level-design, finance, ai-engineering. Each opens on Practice: /interview/<section>/practice (section practice overview) and /interview/<section>/practice/<topic>.
2. Practice topic page: searchable list of that topic's questions from lib/practice (catalogue stays in code) showing name, tags/difficulty, a flag icon and a complete tick. Flag and tick are read-only/empty for now (TKT-120 makes them real). Clicking a question opens /interview/problems/<id>, which renders the existing practice workspace full width inside the Interview layout (topic list collapsed by default there).
3. A "Notes" button at the top of the topic list switches to /interview/<section>/notes/<topic> for the same topic (reads "Practice" while in Notes, and switches back to the same topic). /interview/<section>/notes is a placeholder main page ("designed later"). The topic note page reuses the existing note reader.
4. Section membership: DSA = the 17 coding topics; System Design = notes whose id starts with sd-; Low Level Design = the class-design note as its first topic. Implement a section assignment so future notes land in the right section (prefer a small code mapping plus an optional notes.section column only if needed — if you add a column, it is a migration: stop for Jamie's "apply it" and add it to the Content Drafts allowlist). Finance and AI Engineering show "Soon" until they have notes. Sections without practice questions show Practice greyed with "No practice questions yet".
5. Content Drafts: preview destinations for notes and practice resolve to the new /interview addresses.
6. Old routes keep working.

Done when:
- /interview/dsa/practice/arrays-hashing lists its questions; search filters; a click opens /interview/problems/<id> and the workspace runs code as before.
- Notes switch keeps the selected topic both ways; Class design appears under Low Level Design; sd-* notes under System Design.
- Content Drafts "Preview on page" for a note opens the new address.
- Desktop and 390 px browser tests, no sideways scroll; typecheck, suite, build, static assertions pass; docs/interview.md, docs/status.md, MEMORY.md updated.

Report: files changed, any migration (not applied), checks actually run and results.
```

---

## TKT-120 — Per-user progress: flags, completions, saved code

```
You are working in the jamieho-backroom repo. First read AGENTS.md, docs/README.md, docs/status.md, docs/security.md, docs/interview.md and docs/content-drafts.md and follow them. Spec: Resources/Interview - PRD.md (Scope §4, §5). Ticket: TKT-120. Requires TKT-119.

Today practice_stars, practice_attempts and practice_code are owner-only with no user column. Make progress per user:
1. New migration: per-user flags, attempts/completions and saved code keyed by auth user id (follow the article_pins pattern). RLS: each user can select/insert/update/delete only their own rows; anon nothing; the owner has NO read access to other users' rows (do not use rls.is_owner() to widen reads). Migrate Jamie's existing stars, attempts and saved code into rows for his user id. Keep or retire the old tables only as the spec allows; no data loss.
2. Database policy tests: user A cannot read/write user B's rows; the owner cannot read other users' rows; anon nothing; Jamie's migrated data visible to him.
3. Wire the Practice lists and workspace: signed-in users see and toggle their own flag; complete = a passed submit; their code saves per problem. Signed-out visitors keep browser-only code and see no flags/ticks.
4. Content Drafts: update the practice_* allowlist entries so drafts only ever touch Jamie's own rows in the new tables (SQL function and TypeScript), with tests.
5. Update the privacy policy wording and the encrypted export to cover per-user practice data.

Stop after preparing the migration and tests: report it to Jamie and do not apply it live until he says "apply it".

Done when:
- Policy tests and a two-account browser test (owner + test user) prove isolation; Jamie's progress is intact.
- Typecheck, suite, build, static assertions pass; docs/security.md, docs/interview.md, docs/status.md, MEMORY.md updated; migration recorded as not applied (or applied after Jamie's approval).

Report: files changed, migration name, checks actually run and results.
```

---

## TKT-121 — Resume: per-user workspace with anonymised template

```
You are working in the jamieho-backroom repo. First read AGENTS.md, docs/README.md, docs/status.md, docs/security.md, docs/interview.md and docs/content-drafts.md and follow them. Spec: Resources/Interview - PRD.md (Scope §6). Ticket: TKT-121. Requires TKT-118.

Build Career > Resume at /interview/resume:
1. New migration: a private per-user resume (entries with kind/title/org/dates/location/summary/sort, bullets, certificates, skills) with own-row RLS (owner cannot read others), and a shared resume template record readable by everyone and writable only by the owner. Add the template table to the Content Drafts allowlist (TypeScript + SQL) so Claude can draft it for Jamie's approval. Do NOT seed the template from Jamie's live CV; leave it empty or with neutral placeholders — Claude will draft the real template through Content Drafts.
2. Page for a signed-in user with no resume yet: the template shown read-only as a guide, with "Start from template" (copies the template structure into their own resume) and "Start blank". Afterwards: their own resume editor (add/edit/reorder entries and bullets, certificates, skills), single column, plain labels, saves with clear success/error and retry.
3. Signed-out visitors see the template read-only and a "Sign in to build your own" prompt.
4. Jamie's real CV (experience_items/bullets) stays as is; the homepage and journey keep reading his public entries. The old /behavioral resume view keeps working until deprecation.
5. Policy tests (own-row only; template public read, owner write); two-account browser test; privacy policy and encrypted export cover the new tables.

Stop after preparing the migration and tests for Jamie's "apply it".

Done when: the flows above work at desktop and 390 px without sideways scroll; typecheck, suite, build, static assertions pass; docs/interview.md, docs/security.md, docs/status.md, MEMORY.md updated.

Report: files changed, migration name, checks actually run and results.
```

---

## TKT-122 — Behavioral Playbook

```
You are working in the jamieho-backroom repo. First read AGENTS.md, docs/README.md, docs/status.md, docs/security.md, docs/interview.md and docs/content-drafts.md and follow them. Spec: Resources/Interview - PRD.md (Scope §7). Ticket: TKT-122. Requires TKT-118 (and TKT-121 for optional role tagging). Before building, confirm the theme list and starter questions in the ticket thread with Jamie (Claude will propose them).

Build Career > Behavioral at /interview/behavioral with two tabs: Playbook (built) and Course ("Soon").
1. Playbook: themes in the topic list with coloured icons; questions searchable with an answered/not-answered filter; "answered X of Y" per theme.
2. Question page: Jamie's guide — what interviewers are looking for, what you might talk about, a STAR structure, common mistakes, likely follow-ups, and a generic sample answer — plus the signed-in user's private STAR answer (Situation, Task, Action, Result) with save/retry, optionally tagged to a role from their own resume. Users can create their own questions (private). Signed-out visitors see guides only with a sign-in prompt.
3. New migration: shared guide content (themes, questions, guide fields; public read, owner-only write; add to the Content Drafts allowlist in TypeScript + SQL) and per-user answers and custom questions (own-row RLS; owner cannot read others). Move Jamie's existing behavioral_stories/behavioral_answers into his own per-user answers so nothing is lost and nothing becomes visible to others.
4. Retire the CV-bullet → story mapping and the coverage strip from the new pages. The old /behavioral page keeps working until deprecation.
5. Policy tests, two-account browser test, privacy policy and export updates.

Stop after preparing the migration and tests for Jamie's "apply it".

Done when: flows work at desktop and 390 px; typecheck, suite, build, static assertions pass; docs updated.

Report: files changed, migration name, checks actually run and results.
```

---

## TKT-123 — Feedback

```
You are working in the jamieho-backroom repo. First read AGENTS.md, docs/README.md, docs/status.md, docs/architecture.md and docs/security.md and follow them. Spec: Resources/Interview - PRD.md (Scope §8). Ticket: TKT-123. Requires TKT-118.

Build "Report a problem / Suggest an idea": an entry at the bottom of the Interview rail (replace the TKT-118 stub) and in the site top bar. A small dialog: type (Problem / Idea), message, and the current page link auto-filled. Reuse the existing contact pipeline (validation, honeypot, rate limit, messages inbox, email alert) with a feedback type; the Settings inbox shows the type and page link. If the messages table needs a new column/value, that is a migration: stop for Jamie's "apply it".

Done when: submissions from both places land in the inbox tagged with type and page; honeypot and rate limit still apply; desktop and 390 px; typecheck, suite, build pass; docs/architecture.md, docs/status.md, MEMORY.md updated.

Report: files changed, any migration, checks actually run and results.
```

---

## TKT-124 — Access: open apps, Notes sign-in prompt, privacy and exports

```
You are working in the jamieho-backroom repo. First read AGENTS.md, docs/README.md, docs/status.md, docs/security.md and docs/interview.md and follow them. Spec: Resources/Interview - PRD.md (Scope §4). Ticket: TKT-124. Requires TKT-120, TKT-121 and TKT-122.

1. Make Notes, Practice and Behavioral open to everyone (apps registry visibility; prepare the change as a migration or tell Jamie the exact Settings change — do not change live data yourself). Keep the membership-gate code for future courses.
2. Opening any Notes page while signed out shows a sign-in prompt using the existing Google sign-in (Practice, Resume template and Behavioral guides stay viewable).
3. Final privacy policy wording for per-user progress, resumes and behavioral answers; confirm the encrypted export covers every new table.

Done when: signed-out and signed-in browser checks match the spec at desktop and 390 px; tests/build pass; docs/security.md, docs/status.md, MEMORY.md updated.

Report: files changed, any migration or Settings change needed, checks actually run and results.
```

---

## TKT-125 — Gate: verify and launch

```
You are working in the jamieho-backroom repo. First read AGENTS.md, docs/README.md, docs/status.md, docs/interview.md and docs/operations.md and follow them. Spec: Resources/Interview - PRD.md. Ticket: TKT-125.

Run the full verification for the Interview area and fix only genuine defects (no new features): typecheck, full unit/database suite, production build, static assertions, full browser suite at desktop and 390 px; rail and topic-list collapse; Notes/Practice switch; search; per-user flags, ticks and code; Resume template flow; Behavioral answers and custom questions; Feedback; locks and Soon items; reduced motion. Prove isolation with two accounts (owner + test user) both ways. Update docs/interview.md, architecture, security, status and MEMORY.md with every check and its actual result, then stop: Jamie pushes and reviews live.
```

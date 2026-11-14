# Build prompts — Content Drafts (Claude drafts, Jamie approves)

Paste one prompt at a time into ChatGPT (with repo access to `jamieho-backroom`), in this order: **TKT-98 → TKT-101 → TKT-102 → TKT-104 → TKT-105 → TKT-106 → TKT-107**. TKT-102 can run any time after TKT-98; TKT-104/105/106 can run in parallel after TKT-101. TKT-103 (skill + docs) is done by Claude, and TKT-108 is the live check with Jamie. After each ticket lands, tell Claude so it can check the result.

Every prompt assumes the shared preamble below; it is repeated at the top of each prompt so each one can be pasted on its own.

---

## TKT-98 — Tracer: change-set table, approve engine and review list (homepage sections)

```
You are working in the jamieho-backroom repo (Next.js App Router + Supabase). Before anything else read AGENTS.md, docs/README.md, docs/status.md, docs/security.md and docs/operations.md, and follow them (Jamie pushes; never push; new migrations only; never apply a migration live without Jamie saying "apply it"; Jamie handles all secrets; update docs/ + MEMORY.md after the change).

Spec: Resources/Content Drafts - PRD.md (signed off). Ticket: TKT-98. Build the thinnest end-to-end slice of "Claude drafts, Jamie approves", for the site_sections table only.

Build:
1. A new migration creating an owner-only change-set table (suggested name content_changes): id, summary text, status ('draft'|'approved'|'discarded'), operations jsonb (list of {op: 'insert'|'update'|'delete', table, key, fields}), photo_slots jsonb (empty for now), previous jsonb (filled on approve), created_at, approved_at, approved_by. RLS enabled; every operation allowed only when public.is_owner() / the existing owner check is true. Revoke from anon. Add database policy tests in tests/db proving anonymous and non-owner signed-in users cannot select/insert/update/delete, and the owner can.
2. lib/content-drafts/allowlist.ts: one entry per table → editable fields → a zod rule per field → routes to revalidate. Only site_sections for now (title, body; key must be an existing SECTION_KEYS value; sensible max lengths). Unknown tables/fields must fail validation.
3. Apply engine: an owner-only server action (app/actions/content-drafts.ts) that loads the set, re-checks the owner session, validates every operation against the allowlist, then applies all operations in ONE database transaction through an owner-checked SQL function (security definer, checks is_owner(), also enforces the same table/field allowlist server-side). It records previous values in `previous`, sets status, approved_at, approved_by, then calls revalidatePath for each affected route. Discard action sets status 'discarded' and changes nothing else.
4. /manage/review (owner only, 404 for everyone else like /settings; plain app-page layout, Cloud & Ink palette): list of draft sets newest first; each shows its summary and a table of field / current live value / proposed value; Approve and Discard buttons with clear success/error messages. Never publicly cached.

Do not touch: existing editors, homepage rendering, other tables, navigation, any live data.

Done when:
- Policy tests pass (anon and non-owner blocked; owner allowed).
- Inserting a set directly in the local database (e.g. change site_sections hero title) shows correct before/after on /manage/review; Approve updates the row and the homepage shows it without a redeploy; Discard leaves data unchanged.
- Unknown table/field, over-length value, or a non-owner approve is refused with a clear message and changes nothing (unit + DB tests).
- A set whose second operation fails leaves the first unapplied (transaction test).
- Typecheck, full unit/DB suite, production build and static assertions pass; browser test for owner review list + visitor 404.
- docs/security.md, docs/architecture.md, docs/status.md and MEMORY.md updated; migration recorded as NOT applied live. Stop and ask Jamie before applying it.

Report: files changed, migration name, checks actually run and their results.
```

---

## TKT-101 — Preview on page (homepage)

```
You are working in the jamieho-backroom repo. Read AGENTS.md, docs/README.md, docs/status.md, docs/journey.md and docs/security.md first and follow them. Spec: Resources/Content Drafts - PRD.md. Ticket: TKT-101. Requires TKT-98 (content_changes table, allowlist, approve/discard actions, /manage/review).

Build "Preview on page" for the homepage:
1. On /manage/review add a "Preview on page" button per set. It enables an owner-only preview mode (Next.js draftMode plus the set id in an httpOnly cookie) and opens the page the set affects (for site_sections: /).
2. In preview mode only, and only after confirming the viewer is the owner, the homepage content loaders (getSections and anything else the set touches) overlay the set's proposed values onto the live data. Changed blocks get data-draft-changed="true" and a gold outline (use the existing gold accent token).
3. A fixed bottom bar in preview mode: "Previewing: <summary>" · Approve · Discard · Back to list. Approve/Discard reuse the TKT-98 actions, then exit preview mode.
4. Visitors and non-owners must never see draft values, even if they have the cookie or the URL. Preview responses must not be cached; the public homepage must stay pre-rendered (static assertions unchanged).

Do not change the journey design, motion, other pages or the approve engine's rules.

Done when:
- Owner previewing a hero/About title change sees it applied and outlined on /, desktop and 390 px, and Approve/Discard from the bar work.
- Signed-out and non-owner browser tests with the preview cookie see only live content.
- Leaving preview returns to the normal page.
- Typecheck, unit/DB suite, build, static assertions and the journey browser tests pass.
- docs/journey.md (preview note), docs/security.md, docs/status.md, MEMORY.md updated.

Report: files changed, checks actually run and results.
```

---

## TKT-102 — "N to review" badge

```
You are working in the jamieho-backroom repo. Read AGENTS.md, docs/README.md, docs/status.md and docs/architecture.md first and follow them. Spec: Resources/Content Drafts - PRD.md. Ticket: TKT-102. Requires TKT-98.

Build: when the owner is signed in and there are change sets with status 'draft', show a small gold badge "N to review" in the shared top bar and the floating bar (components/site-navigation.tsx), linking to /manage/review. The count comes from an owner-only query on the client side or an owner-only server call; nothing renders for visitors and public pages remain static/ISR.

Do not change other navigation items, layout or theme controls.

Done when:
- Owner with 2 draft sets sees "2 to review" linking to /manage/review; 0 shows nothing.
- Visitors and non-owners never see it (browser tests, desktop and 390 px; no horizontal overflow).
- Static/ISR assertions for public pages unchanged; typecheck, tests, build pass.
- docs/architecture.md, docs/status.md, MEMORY.md updated.

Report: files changed, checks actually run and results.
```

---

## TKT-104 — CV entries and bullets

```
You are working in the jamieho-backroom repo. Read AGENTS.md, docs/README.md, docs/status.md, docs/security.md first and follow them. Spec: Resources/Content Drafts - PRD.md. Ticket: TKT-104. Requires TKT-98 and TKT-101.

Build:
1. Add experience_items and experience_bullets to lib/content-drafts/allowlist.ts: all content fields Jamie edits today (kind, title, org, dates, location, summary, sort, public; bullet text, sort, public, item_id), with rules matching the existing CV editor/validation. Operations: insert, update, and delete (bullets only) — delete keeps the old row in `previous`.
2. Extend the SQL apply function's server-side allowlist accordingly.
3. Preview overlay for the homepage Experience section and the Resume & Stories CV view (/behavioral resume area), with gold outlines on changed entries/bullets.
4. Revalidate every route that shows CV data on approve.

Do not change CV editor UI, journey design or other tables.

Done when:
- A set that adds a bullet, edits an entry and hides another previews correctly on / and the CV view, and applies in one transaction.
- A bullet can only be deleted through an approved set; its old values are stored.
- Invalid values are refused (unit/DB tests per operation).
- Typecheck, suite, build, relevant browser tests pass; docs/status.md and MEMORY.md updated.

Report: files changed, checks actually run and results.
```

---

## TKT-105 — Projects, Articles and Guides

```
You are working in the jamieho-backroom repo. Read AGENTS.md, docs/README.md, docs/status.md, docs/architecture.md and docs/security.md first and follow them. Spec: Resources/Content Drafts - PRD.md. Ticket: TKT-105. Requires TKT-98 and TKT-101.

Build:
1. Add projects, articles and guides to the allowlist, reusing their existing zod schemas/constraints (lib/portfolio-core.ts, articles and guides schemas, https-only links, tag limits, slug rules) so a draft can never store anything their editors would refuse. Extend the SQL apply function's allowlist.
2. "Delete" for these three = unpublish (projects.public=false / articles.published=false / guides.published=false), never row removal, so it is restorable by a new set.
3. Preview overlay on /projects, /projects/[slug], the homepage Work section, /articles/[slug], /guides and /guides/[slug], and the Resources Guides shelf, with gold outlines on changed items.
4. On approve, revalidate every affected route, including both the old and new slug when a slug changes.

Do not change the editors (/projects/manage, /guides/manage, article management) or card designs.

Done when:
- A set "add project DataKind UK, featured" previews on /projects, its project page and the homepage Work section, and goes live on Approve.
- Drafts breaking existing schema rules are refused.
- Delete proposals only unpublish.
- Slug change revalidates both slugs (test).
- Typecheck, suite, build, static assertions and Projects/Articles/Guides browser tests pass; docs/architecture.md, docs/status.md, MEMORY.md updated.

Report: files changed, checks actually run and results.
```

---

## TKT-106 — Private material: Notes, Practice notes/code/stars, Resume & Stories

```
You are working in the jamieho-backroom repo. Read AGENTS.md, docs/README.md, docs/status.md and docs/security.md first and follow them. Spec: Resources/Content Drafts - PRD.md. Ticket: TKT-106. Requires TKT-98 and TKT-101.

Build:
1. Add notes, question_notes, practice_code, practice_stars, behavioral_stories and behavioral_answers to the allowlist, restricted to rows owned by the owner, with rules matching their existing editors/actions. Extend the SQL apply function's allowlist. The practice problem catalogue (lib/practice/problems) stays in code and must not be draftable.
2. Preview overlay on /notes, /practices (incl. problem pages) and /behavioral, owner only, with gold outlines.
3. Approve revalidates/refreshes those pages.

Privacy: draft values must never be visible to members or visitors who can open those apps; no private content in Git, logs or test fixtures beyond synthetic data.

Done when:
- Drafts for a note, a practice question note and a story preview on their pages and apply on Approve.
- A non-owner account with app access never sees draft values (browser test).
- Typecheck, suite, build and app browser tests pass; docs/security.md, docs/status.md, MEMORY.md updated.

Report: files changed, checks actually run and results.
```

---

## TKT-107 — Photo slots on the review page

```
You are working in the jamieho-backroom repo. Read AGENTS.md, docs/README.md, docs/status.md and docs/security.md first and follow them. Spec: Resources/Content Drafts - PRD.md. Ticket: TKT-107. Requires TKT-98, TKT-101 and TKT-105.

Build:
1. A set's photo_slots: each {slot, expected_filename, bucket, target (table + key + field), caption, path|null}.
2. On /manage/review (and in the preview bar) show each slot with its caption and the exact expected filename, plus a drag-and-drop upload that reuses the existing uploader (components/articles/image-upload.tsx makeUploader(bucket)) and its file rules. On upload, store the path in the slot so the preview shows the image.
3. Approve is disabled until every slot has a path; on approve the path is written into the target field (e.g. append to projects.screenshots).
4. Prove it with a project screenshot slot (project-media bucket).

Do not change bucket policies beyond what the existing uploader needs; visitors must not be able to upload or see unapproved images on public pages.

Done when:
- A set with a screenshot slot cannot be approved until the file is dropped in; after upload the preview shows it; Approve writes the path into the project.
- Wrong type/oversize files are refused by existing rules.
- Typecheck, suite, build and a browser test of the slot flow pass; docs/status.md and MEMORY.md updated.

Report: files changed, checks actually run and results.
```

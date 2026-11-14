# Content Drafts — Claude drafts, Jamie approves on the real site

Status: draft for sign-off (2026-11-14). Settled in the grill-me session of 2026-11-14. Builds **before** Home v1.3 (`Resources/Home v1.3 - PRD.md`), which uses it for all of its content.

**Problem:** Every content change today means Jamie editing by hand in heavy editors (Edit site opens every section and CV field at once), or giving Claude a change and trusting a direct database write he never sees rendered. He wants to say "change X" in chat, then see exactly how it will look on his real site and approve it with one click, for every managed content type (homepage, CV, projects, articles, guides, notes, practice notes, stories) and future ones too.

**Outcome and completion:** Claude turns a request into a pending **change set** and replies with a review link. Jamie opens `/manage/review`, sees the fields before → after, opens **Preview on page** to see the real page with the change applied and outlined, fills any photo slots, and clicks **Approve** (live immediately) or **Discard**. Done when:
- a change set for each table on the allowlist can be drafted, previewed on its real page, approved and seen live without a redeploy;
- visitors never see drafts, previews or the review page;
- a draft that breaks a rule (field not on the allowlist, wrong type, too long, bad link) is refused on approve with a clear message and changes nothing;
- the Claude procedure is saved as a reusable skill so any session follows it the same way.

## Scope

**In:**
- **Change sets.** One request = one set, applied all-or-nothing. A set holds a plain summary ("Add project: DataKind UK"), its operations (insert / update / soft delete) and any photo slots.
- **Allowlist v1** (tables and the fields Claude may draft):
  - Public: `site_sections` (title, body; every key), `experience_items` + `experience_bullets` (all content fields, public/hidden; the Home v1.3 journey tick and icon once they exist), `projects` (all fields incl. featured, public, sort), `articles` (all fields incl. published), `guides` (all fields incl. published).
  - Jamie's own material: `notes`, `question_notes`, `practice_code`, `practice_stars`, `behavioral_stories`, `behavioral_answers`.
  - Home v1.3 adds its About photos table with one allowlist entry when it ships.
  - Adding a future table = one allowlist entry plus its field rules and preview route.
- **Never on the allowlist:** `apps`/`desktop_apps` (registry and visibility), `invites`, `profiles`, `signins`, `messages` (inbox), `app_opens`, `ops_status`, `article_pins` (visitor data). The practice **problem catalogue** lives in code (`lib/practice/problems`), so changing it is a code task, not a draft.
- **Deletes:** proposals only, for projects, articles, guides, bullets and (later) About photos. Projects/articles/guides are unpublished, not removed, so they stay restorable; bullets and photos are removed with their previous values kept in the set.
- **Review page `/manage/review`** (owner only): waiting sets newest first, each with its summary, a before → after field table (current live value vs proposed), photo slots, **Preview on page**, **Approve**, **Discard**.
- **Preview on page:** the real page rendered with the set applied, changed parts outlined in gold, and a fixed bottom bar: **Approve · Discard · Back to list**. Owner only, never cached publicly.
- **Photos:** Jamie attaches photos in chat. Claude renames each to its slot's filename (e.g. `about-03-jungfraujoch.jpg`) and saves them in a dedicated folder per set: `Personal Website/Media/Uploads/<YYYY-MM-DD>-<short-name>/`. Each slot on the review page shows the exact filename it expects; Jamie drags that file in (existing uploader, correct bucket). Approve stays disabled until every slot is filled.
- **Badge:** when Jamie is signed in, a gold "N to review" badge in the top bar links to `/manage/review`. Visitors never see it.
- **Quiet history:** an approved set keeps who approved it, when, and the values it replaced (no Undo button). If Jamie wants something put back, Claude drafts the reverse from that record.
- **Claude procedure skill:** read current rows → draft the set (never write live tables) → rename and file photos → reply with the review link and a short summary → after approval, read back and confirm.

**Later (not in this build):** redo the old editors in the new simple style (kept as a backup ticket so Jamie can check details by hand); layout improvements for Notes, Practice and Resume & Stories.

**Explicitly not wanted (Jamie, 2026-11-14):** Undo button; out-of-date check on approve (Jamie asks Claude for a fix instead).

**Reuse:** existing Supabase owner check (`public.is_owner()` / `rls.is_owner()`), existing zod schemas for projects/guides/articles where present, `makeUploader(bucket)` for photo slots, existing `revalidatePath` patterns in `app/actions/`, the shared top bar (`components/site-navigation.tsx`), plain app-page layout and Cloud & Ink palette.

## Canonical locations/data

- Code: `~/Documents/Developer/Personal Website/jamieho-backroom` (this repo). Plan: this file in `Resources/`, alongside `Home v1 - PRD.md`; the repo's `docs/` topics are updated as it lands.
- Database: Supabase project `lhacrrnwddvpawsreamk`. New table for change sets (proposed name `content_changes`), owner-only.
- Photo inbox on Jamie's computer: `Personal Website/Media/Uploads/<date>-<name>/` (outside Git).
- Tickets: Notion Tickets data source `collection://1ff804d9-463a-49b6-8221-217e5552c790`, project `40858664-d2d2-8191-b83d-f677a1e28165`; dependency map `Resources/Tickets - Dependency Map.md`.

## Constraints

- Claude only ever **proposes**: drafts are rows in the change-set table; live tables change only through Approve by the signed-in owner.
- Owner-only RLS on the change-set table (all operations). The approve step re-checks on the server: owner session, every table/field on the allowlist, every value passes its field rule, no unknown columns. A failing set changes nothing and shows why.
- All operations in a set apply in one database transaction, so a page is never half-updated.
- Preview and review responses are never publicly cached; ISR pages for visitors are unchanged until Approve, which revalidates the affected routes immediately.
- Jamie handles secrets; Claude never uses his credentials to upload to Storage, which is why photos go through slots.
- Private material (notes, practice records, stories) stays out of Git and visible only to the owner, including in drafts and previews.
- New migration only; tested locally (database policy tests) and applied live only after Jamie says "apply it".
- No runtime AI calls on the site. Claude drafts from chat sessions via the database connection; nothing on the site calls a model.
- Jamie pushes; ChatGPT builds from per-ticket prompts (`Resources/Prompts - Content Drafts.md`) following `AGENTS.md` and `docs/`.

## Build plan

1. **Change-set table and rules** (migration). Table with id, summary, status (draft / approved / discarded), operations (JSON list: op, table, row key, proposed fields; previous values filled on approve), photo slots (slot, expected filename, bucket, path, caption, filled), created/approved timestamps and approver. Owner-only RLS for every operation; policy tests prove visitors and other signed-in users can't read or write it. *Gate: Jamie approves applying the migration.*
2. **Allowlist and apply engine.** One allowlist module (table → editable fields → field rules → routes to refresh). An owner-only server action that validates the whole set, applies it in one transaction (an owner-checked database function that also enforces the allowlist), stores previous values, marks it approved and revalidates the routes. Soft delete = unpublish for projects/articles/guides. Unit and database tests for: happy path per table, unknown field refused, bad value refused, non-owner refused, partial failure leaves nothing changed.
3. **Review page `/manage/review`** with summary, before → after table, photo slots (filename shown, drag-in upload, Approve blocked until filled), Approve / Discard, and the owner-only "N to review" badge in the top bar.
4. **Preview on page.** Owner-only preview mode (Next.js draft mode plus the set id) that makes the existing content loaders overlay the set's values, outlines changed blocks in gold, and shows the fixed Approve · Discard · Back bar. Covers the homepage, `/projects` + project pages, article and guide pages, Notes, Practice and Resume & Stories. Never cached; visitors unaffected.
5. **Claude procedure skill** saved via the skill card, plus a short `docs/` topic on drafting content (allowlist, how sets are written, photo folder convention).
6. **End-to-end proof:** draft one real set per content area (e.g. DataKind project, a CV bullet, a guide edit, a note edit), preview each, approve each, confirm live; confirm the visitor view never showed drafts. *Gate: Jamie verifies live, then Home v1.3 starts.*

## Verification and handoff

- Database policy tests for the change-set table; unit tests for the allowlist and apply engine; browser tests for review, preview (desktop and 390 px), photo-slot blocking, approve → live, discard, badge visibility (owner yes, visitor no).
- Typecheck, full unit/database suite, production build and static assertions per `docs/operations.md`; report only checks actually run.
- Migration recorded as applied/pending in `docs/status.md`; `docs/security.md` and `docs/architecture.md` updated; MEMORY.md entry.
- Rollback: the feature is additive. Disabling the review route and badge leaves the site and old editors working; approved changes are ordinary rows and can be reversed by a new set.
- Known limits: previews cover the routes listed in step 4; a new content type needs its allowlist entry and preview route before it can be drafted.

## Open questions

- None blocking. Exact table/column names are left to the build ticket.

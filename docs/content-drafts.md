# Content drafts — TKT-98 through TKT-122

Pending owner changes for site_sections, experience_items, experience_bullets, projects, articles, guides and the six app tables listed below. Administrative tooling inserts a draft into public.content_changes; Jamie reviews it at /manage/review. No runtime AI or draft-creation UI. Existing editors and navigation remain unchanged; homepage preview adds an owner-only overlay to its existing rendering.

## Contract

summary is plain text (1–500 characters). operations is a JSON array (up to 100; empty only for a valid photo-only set); each operation has op, table, key and fields. site_sections permits updates only: key must be a SECTION_KEYS value; title allows 120 Unicode code points, body 20,000. Empty strings clear these fields.

experience_items permits insert/update by explicit UUID key: kind, title, org, dates, location, summary, sort, public, show_on_journey, journey_icon. experience_bullets permits insert/update/delete by UUID: item_id, text, sort, public. Item inserts require title; bullet inserts require text and an existing parent (or an item inserted earlier in the set). Other insert defaults match the tables, including public=false. Updates need at least one field; bullet deletes accept omitted/empty fields only. No item deletes.

CV text follows the editor's UTF-16 limits: title/org 160, dates/location 80, summary 2,000, bullet text 1,000; text is trimmed, title/bullet text cannot be blank. kind uses the six existing values; sort is a signed 32-bit integer, public is boolean. Unknown fields/properties, wrong types and NUL fail. photo_slots follows the TKT-107 contract below; publishing records follow their contract below; unsupported upload targets remain later slices. Private content must never be put in fixtures or Git.

lib/content-drafts/allowlist.ts defines field rules and affected routes; the migration mirrors them in SQL. Extend both and their parity tests for a future content type. Inserts/deletes are intentionally refused for fixed site sections, consistent with the PRD’s delete scope.

## Review and apply

/manage/review is force-dynamic, owner-only (others get 404) and reads directly through the request-scoped Supabase client. It lists drafts newest first and displays current live values against final proposed values, collapsing repeated field edits. Invalid proposals show a validation error, disable Approve and remain discardable. Text is escaped, not rendered as HTML.

app/actions/content-drafts.ts verifies the owner, loads/validates the set and re-checks the session before submitting one conditional status update. The pending set and its operations must still match. This protects the proposal from a concurrent edit; it does not compare against or reject changed live content.

That UPDATE locks the draft row and invokes private.apply_content_change(), a SECURITY DEFINER trigger with an empty search_path and no API EXECUTE grants. It independently checks the verified owner and validates the same allowlist. No public RPC or new secret is required; record_signin remains the sole public API-callable function. The trigger applies every operation, captures prior values per operation (complete experience rows; null for inserts), and fills previous, approved_at and approved_by (a historical UUID retained independently of account deletion) in the same transaction. Any exception rolls everything back. Inserts must start as draft; finalized sets cannot be reapproved or edited. RLS restricts all API table operations to the owner. Administrative draft insertion does not require pretending to be Jamie; administrative approval without his authenticated session is refused.

Successful approval revalidates /, /journey, /about and /manage/review; experience operations also revalidate /behavioral. Cache-refresh failures are reported separately from committed database writes. Discard updates status only and never changes managed content or approval history. The encrypted export includes content_changes; it contains owner audit data, not new visitor tracking.

## State and verification

Migration: 20261114020933_content_changes.sql — applied live through Supabase MCP on 2026-11-14 after Jamie said “apply it”. Remote version: 20261114101016 (content_changes); MCP timestamps differ from local filenames, so retain the applied local file unchanged. Verified live RLS/owner policy, table/function grants, hardened trigger, no new public RPC and unchanged site_sections fingerprint. No live test data was created. Frontend deployment and Jamie’s live review remain pending.

Policy/transaction tests use disposable PGlite; browser owner fixtures exercise the same SQL engine. An additional real Next build was tested against a loopback Supabase HTTP adapter backed by PGlite: owner session, review before/after, real server-action approval, history, homepage refresh without rebuilding, discard and visitor 404 passed. No production browser or live Supabase was used.

## How Claude drafts (TKT-103)

Claude follows the saved `site-content-drafts` skill: read the live rows and `lib/content-drafts/allowlist.ts`; insert one `content_changes` row per request (summary + operations only, status left as draft); never write live tables, set status, or fill approval fields; reply with a one-line summary and the `/manage/review` link; after Jamie approves, read back the set and the live row. Requests for tables or operations not yet in the allowlist are declined with the ticket that adds them. To reverse an approved set, Claude drafts a new set from its `previous` values. Photo slots (TKT-107): Claude renames Jamie's attached photos to the slot filename and saves them in `Personal Website/Media/Uploads/<YYYY-MM-DD>-<short-name>/`, outside Git.


## Owner page previews — TKT-101 / TKT-105

Preview on page opens / in the same tab after a successful owner-verified server action. loadOwnerPreview checks ownership, draft status and the TKT-98 allowlist; getHomePreview calls it only when Next Draft Mode is enabled and the httpOnly jb.content-preview UUID cookie exists. getSections applies the validated operations to a copy of current live sections. Experience sets also offer Preview CV at /behavioral; the bottom bar links between the two views. Publishing routes also receive an explicit owner-validated context (see below); management routes use normal loaders. No query-string enablement or caller-controlled redirect. Proposed contact links also feed existing homepage social bindings; currently unused section fields remain unused.

ContentPreviewBar shows the summary with Approve/Discard/Back to list. Mutations derive the set from verified server preview state, call the existing TKT-98 actions and exit only on success; failures keep preview open with an error. Normal browser navigation after cookie clearing avoids stale client router content. Invalid/finalized/missing sets fail closed to live content.

Implementation: app/actions/content-preview.ts; lib/content-drafts/preview.ts and overlay.ts; components/content-drafts/preview-bar.tsx and preview.css. Homepage and journey markup receive preview-only changed markers; default layout/motion and approval rules remain unchanged. TKT-101 needs no migration; TKT-98’s applied migration is unchanged.

Verification: tests/unit/content-preview*.test.ts and sections.test.ts cover guards, immutable overlays, entry/exit and reuse of actions. tests/e2e/content-preview.spec.ts includes a normal forged-cookie browser check plus real owner/member cases using tests/support/content-preview-api.cjs (disposable PGlite, loopback only, no production credentials). Run that adapter from an isolated checkout, build/start Next with NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:3208 and NEXT_PUBLIC_SUPABASE_ANON_KEY=local-preview-test-key, then run tests/content-preview.playwright.config.ts with CONTENT_PREVIEW_TEST_API=http://127.0.0.1:3208 and CONTENT_PREVIEW_TEST_APP=http://127.0.0.1:3209. CONTENT_PREVIEW_CHROMIUM can select an installed executable. The dedicated config runs both viewports sequentially; normal e2e skips the adapter-dependent cases when its API flag is absent. Start each rebuilt-app run with fresh disposable database state and a clean isolated .next directory; reusing mutated fixtures with retained ISR/fetch caches gives mismatched baseline content. Never point these checks at live services.


## Owner review badge

Shared top/floating navigation loads an exact pending-set count after the client viewer resolves to owner. The request-scoped count action checks the server session and existing table RLS; it returns no draft content. A positive count links to /manage/review in a compact gold pill. Zero/error/visitor/member/loading states render nothing. Account changes hide stale values immediately; navigation, visible-tab focus and successful review refresh the count. No public-page dynamic reads, policy changes or new migration.


## Experience preview — TKT-104

loadOwnerPreview fetches the complete owner CV snapshot only for experience sets, then experience-overlay.ts applies operations sequentially to cloned rows. Missing targets, duplicate inserts or absent parents refuse preview. Home filters public entries/bullets after overlay, before sending data to the client; hidden content is not serialized into its preview. Existing Home role/education/certificate bindings and display limits remain. /behavioral retains its normal access checks, displays the overlaid CV with changed entry/bullet outlines and disables editing only during preview. Normal editor behavior, including direct bullet deletion, remains unchanged by Jamie's explicit choice. Draft deletion occurs only on approval and retains the full old bullet in previous; existing foreign-key effects are preserved.

Migration 20261114110327_content_drafts_experience.sql extends the private approval trigger with an owner-checked, non-API-callable helper. Applied live through Supabase MCP after Jamie’s explicit approval on 2026-11-14 as remote 20261114114045; local SQL remains unchanged. No new public RPC, table RLS/grant or live content changes. TKT-98's applied migration stays unchanged.

Coverage: tests/unit/experience-drafts.test.ts, tests/db/experience-drafts.test.ts and tests/e2e/experience-preview.spec.ts; the last runs with the same disposable adapter/dedicated configuration above. It covers Home/CV overlays, hidden filtering, read-only preview, full delete history, real approve/discard, cache bypass and visitor/member cookie isolation at desktop/390px. Current check totals and pending deployment are in status.md.

Live TKT-104 verification: both private function bodies match local SQL exactly; hardened settings, revoked API execution and owner policy/RLS confirmed. Content/draft fingerprints unchanged; no test records or approvals created.


## Publishing records — TKT-105

projects/articles/guides permit insert/update/delete by explicit UUID key. Fields come from each existing editor schema with id excluded; timestamps/unknown properties cannot be drafted. Insert requires slug plus name/title; other fields use table defaults, including public/published=false. Updates require at least one field. Delete accepts no fields and only sets public/published=false, retaining the row and its complete previous values. A new set can republish it. Existing editor actions/UI, including their normal deletion behavior, remain unchanged.

Project name/tagline/body, tag/screenshot counts and lengths, slug/reserved names, sort range and booleans reuse projectSchema. Article and guide text, platform/category/project relation, slug and link rules reuse articleSchema/guideSchema. Review renders arrays as structured JSON, preserving tag and screenshot boundaries. Preview timestamps simulate approval ordering on the Guides shelf. Partial edits are validated against the complete merged owner row before preview/approval; SQL independently validates the merged row, foreign keys and uniqueness. Draft links additionally require literal HTTPS, no whitespace/backslashes, valid ASCII host/IPv4/IPv6 and port; IDNs must use ASCII/punycode. This is shared in TypeScript/SQL, including project URL UTF-16 limits and other text code-point limits. No editor rule is relaxed.

publishing-overlay.ts clones only touched owner collections and composes operations sequentially. Normal loaders remain cookie-free; explicit verified preview context enables overlays on /projects and detail pages, Home Work, /articles and detail pages, /guides and detail pages, and Resources Guides shelf. Home latest-article bindings use the same preview context. Lists/Home exclude unpublished rows before serialization. Changed unpublished detail rows remain inspectable only by the owner and are labelled unpublished; finishing approval there returns to the catalogue. Gold attributes outline changed cards/details/Work items, preserving designs and motion. Review/bar links expose only validated local destinations. Metadata uses the same owner gate; copied cookies and new unpublished slugs disclose nothing to visitors/members. Public static/ISR assertions remain unchanged.

Approval selects the committed previous audit with the status update, then refreshes affected catalogues/Home/Resources plus proposed and previous slug paths, including intermediate edits. This avoids depending on an earlier slug read. No live-content drift check or new public RPC. Existing section/experience approval paths are preserved.

Migration 20261114120122_content_drafts_publishing.sql applied live through Supabase MCP with Jamie’s explicit TKT-105 approval on 2026-11-14 as remote 20261114125201. It adds private.draft_https and owner-checked private.apply_publishing_draft, and extends the existing private trigger; function EXECUTE is revoked from API roles, search_path is empty. Applied migrations remain untouched.

Coverage: publishing-drafts unit/DB tests, approval/preview guard tests and publishing-preview.spec.ts using the existing disposable loopback adapter/config. Tests include full-schema parity, limits/links, duplicate/missing rows, cross-table rollback, unpublish/restore, old/new slug refresh, new draft slug privacy and all required preview surfaces at desktop/390px. Current results/file inventory are in status.md.

Live TKT-105 verification confirmed exact function-source parity, hardened settings/API revocations, owner draft policy/RLS, valid/invalid URL behavior and unchanged content/draft fingerprints. No new public RPC or TKT-105 security advisory; no content approvals or test records created.


## Private app drafts — TKT-106

app-allowlist.ts reuses existing editor fields/constraints; app-overlay.ts clones owner-validated snapshots. Notes/question notes/stories/answers remain owner-managed. TKT-120 adds per-user ownership to practice_code/practice_stars, retaining their table names and draft keys. These draft entries have owner-user scope: review/preview/approval snapshots require the verified owner ID and filter by user_id; the private SQL apply helper independently binds all practice reads/writes to auth.uid(). Identity fields cannot be supplied or reassigned. Attempts remain outside the allowlist.

| Table | Operations | Editable fields |
| --- | --- | --- |
| notes | update | body, free |
| question_notes | insert/update | body |
| practice_code | insert/update | code |
| practice_stars | insert/delete | none; key identifies the problem |
| behavioral_stories | insert/update | bullet_id, title, situation, task, action, result, skills, numbers |
| behavioral_answers | insert/update | primary_story_id, secondary_story_id, outline, followups |

Practice keys must be existing numeric catalogue IDs; behavioral answer keys must match the question bank. Notes preserve imported metadata/visuals. Limits match existing editors, including UTF-16 notes/code limits and Zod code-point story/answer limits. Story references retain foreign-key checks; duplicate answer mappings fail. SQL independently validates complete merged rows; all edits/status/history remain one transaction. Unstarring retains the full previous row. No attempts, problem catalogue or app-registry edits.

Review compares current/proposed app values and supplies validated app/problem preview destinations. TKT-119 routes note previews to /interview/<assigned-section>/notes/<id> and practice previews to /interview/problems/<id>; behavioral destinations stay unchanged. New readers preserve the same owner-only overlays and read-only preview controls. Approval invalidates the new note/problem route plus legacy addresses; no allowlist fields or SQL rules change. /notes, /practices and /practices/[problem], /behavioral keep normal access checks and apply overlays only after owner verification. Changed content is gold outlined; changed note/story/answer/problem is initially selected. Preview editors are read-only. Practice loads the full owner note/code/star snapshot, bypasses async live replacement, disables execution/saves and never stores proposed code in browser storage. Approval refreshes affected app routes and exact practice problem paths. Normal editors and shared live reads remain unchanged.

Migration 20261114151936_content_drafts_apps.sql was **applied live with Jamie’s explicit approval on 2026-11-14**, remote version 20261114155720 (content_drafts_apps). It adds hardened private helpers and extends the approval trigger; no new public RPC or table grants/policies. Code-catalogue changes must update the SQL identifier validation in a new migration; parity tests enforce this. Deployment and Jamie’s live verification remain pending. App unit/DB tests and app-preview.spec.ts use synthetic data and the disposable loopback adapter only.

Live TKT-106 verification: all three function bodies exactly match tested local SQL; empty search_path/revoked API execution, enabled RLS and sole public record_signin execution confirmed. Catalogue validation passed. All 13 content/app/draft fingerprints matched before/after; no live test rows or content approvals. Security advisors report no new finding.


## Photo slots — TKT-107

DataKind UK live photo-slot flow is verified: set `153609c9-3cda-4aeb-b2be-1c17c6dec054` is approved and project `44d8082a-bfda-4328-bcbb-d0c2a909a057` has exactly one screenshot at `project-media/drafts/153609c9-3cda-4aeb-b2be-1c17c6dec054/datakind-shot-1/datakind-uk-1.png`. Storage reports `image/png`, 3,254,783 bytes. Jamie performed the upload/preview/approval; agent verification was read-only. The byte-identical original and metadata-free 2000×1500 upload remain outside Git under `Personal Website/Media/Uploads/2026-11-16-datakind-uk-screenshot/`. TKT-107/108 has no remaining live-check item.

Each slot has slot, expected_filename, bucket, target {table,key,field}, caption and path (object key or null). Supported targets: project-media → projects.screenshots appends; home-media → a new about_photos UUID row writes its object path. Other targets are rejected. Home slots require caption, alt and signed-integer sort; optional centre/public flags default false, matching the table. At most six slots, unique slot names and canonical lowercase PNG/JPG/WebP filenames (basename up to 60 characters). A photo-only set may have no ordinary operations; a completely empty set remains invalid.

Review and preview bar both show captions, exact filenames and accessible choose/drop upload controls. The existing makeUploader(bucket), imageProblem and 5 MB rules are reused; GIF is rejected to match the existing project-media bucket. Files must have the exact expected name. Uploads use drafts/<set UUID>/<slot>/<filename>, never the live project's slug folder. saveContentPhoto verifies owner/session, slot identity and Storage metadata, then compares-and-sets pending photo_slots. It changes no live content. Refreshing the preview applies filled slots and leaves missing slots uploadable; Approve stays disabled until every path is present.

Approval independently checks all paths, file ownership, Storage metadata/type/size and target constraints in SQL. After ordinary operations, it appends slot URLs in slot order, retaining existing screenshots, enforcing the six-image limit and auditing complete previous project rows. Any late failure rolls back all content/status/history. TypeScript previews compose the same post-operation screenshot values. Approval compares both operations and photo_slots and invalidates aggregate plus audited slug routes.

The canonical Storage deployment prefix is defined in home-content-schema.ts and private.draft_media_url; DB parity tests cover both supported buckets. Changing deployment requires updating both through a new migration. Existing public-read bucket/owner-only write policies are unchanged. Unapproved objects are unlinked from public pages; a known public-bucket URL remains directly readable. Discard leaves uploads unlinked rather than deleting Storage objects. No private photos enter Git.

Migration 20261114161231_content_drafts_photos.sql applied live with Jamie’s explicit approval on 2026-11-14 as remote 20261114220519 (content_drafts_photos). It adds private.apply_draft_photos and extends the existing approval trigger; no public RPC or bucket/policy changes. Local tests use synthetic photos, a minimal disposable Storage catalogue with the real migrated RLS policies, and the existing loopback API/browser harness.

Live TKT-107 checks confirmed exact function-source parity, hardened permissions/search_path, unchanged owner Storage/draft policies and record_signin-only public execution. All 13 content/draft fingerprints and project-media metadata/count were unchanged. No new security finding, uploads, approvals or test records.


TKT-120 migration 20261115000906_per_user_practice.sql applied live with Jamie’s explicit approval on 2026-11-15 as remote 20261115005816. It preserves existing owner rows while adding per-user keys/policies; only the owner’s code/flags can enter an owner-reviewed change set. Other users’ rows cannot be read, audited, updated or deleted by the draft engine even with colliding problem keys. Prior values retain the owner user_id. No new draft fields or public RPC. Live helper source/permissions, RLS and unchanged content fingerprints verified. Frontend deployment remains pending; older applied migrations remain untouched.


## Resume template — TKT-121

resume_templates supports update only for key default, fields title/content. content uses lib/resume.ts’s strict complete-document schema; private user_resumes is not on the allowlist. Migration seeds only an empty template; Claude drafts the anonymised guide through ordinary change sets, never by importing the live CV. Review compares structured JSON; loadTemplatePreview composes owner-verified operations and exposes /interview/resume as the preview target. The guide is read-only/gold outlined in preview and never copies unapproved content into personal resumes. Approve revalidates /interview/resume; existing copied resumes stay independent.

The SQL approval trigger delegates to private.apply_resume_template_draft, enforcing owner, singleton key, operation/field rules and the same nested validators before recording full prior values. Later operation failures roll back all template/content/status/history changes. No new public RPC or private-resume access. Migration 20261115011458_user_resumes.sql applied live with Jamie’s explicit approval on 2026-11-15 as remote 20261115105347. Existing applied SQL remains unchanged.

## Behavioral guides — TKT-122

interview_behavioral_themes permits insert/update: slug-like id key, title (100), hex colour and nonnegative sort (≤10,000). interview_behavioral_questions permits insert/update by UUID: theme_id, prompt (400), looking_for/talk_about/star/mistakes/followups (6,000 each), sample (12,000), sort and published. Both TS and private.apply_playbook_draft reject unknown fields/types, unsupported operations and invalid merged values; SQL constraints/triggers enforce UTF-16 lengths, relationships and required text. Private questions/STAR answers are excluded. No new public RPC or changes to earlier draft rules.

Review displays current/proposed values. Owner-verified previews compose request-local guides, link to /interview/behavioral/questions/<uuid> and mark changed questions gold; cookies never authorize access. Approval remains one transaction with full prior shared rows in previous; a later failure rolls back every edit/status/audit entry. Revalidation covers Playbook and affected question URLs; all Behavioral pages are dynamic. The migration seeds approved starter prompts and one pending set containing the 18 fictional guide proposals; guide content remains unpublished until Jamie approves that set. Migration 20261115111230_behavioral_playbook.sql applied live with Jamie’s explicit approval on 2026-11-15 as remote 20261115114339.

## Home data proposals

about_photos permits insert/update/delete by UUID; fields path, caption, alt, sort, centre and public follow home-content-schema.ts. Inserts require path/alt; optional fields use table defaults (hidden, non-centre, sort 100, empty caption). Deletes retain full old rows in previous. Centre uniqueness includes hidden rows; clear an existing centre before assigning another within a set. Story is an update-only fixed section key. Experience journey_icon accepts only the eight built-in names; `journey_photo` (experience_items only) accepts `''` or a home-media path with the About photo rule (≤240 characters, `.png/.jpg/.webp`), is checked again in SQL and previews in the owner overlay. It needs migration `20261121120000_journey_photos.sql`, which is **NOT applied live**; its pending set (KOLN3D `journey-koln3d.jpg`, Global Relay `journey-global-relay.jpg`) is **not inserted** and lives in `Media/Previews/journey-photos-pending.sql`, to run only after Jamie says “apply it” and uploads the two files to home-media; show_on_journey is boolean.

Review shows photo fields and slot metadata. Owner previews compose immutable photos and experience snapshots; the new public loaders filter publication after overlay. Filled home slots create new photo rows in the preview, and approval inserts them atomically after normal operations, with no object-byte copy. The homepage dial consumes these public photo/journey collections through the same owner-verified preview boundary. Paths remain object keys for home photos; project screenshots remain canonical URLs.

Home data schema and approval helpers are applied live via 20261116165138_home_v13_data.sql (remote 20261116171034). TKT-110b’s three starter sets are approved. Current public photo paths and publication state remain database-managed.

About polish upload proposals (now approved): 3197e5d2-c515-454c-9354-7cf0de76abab contains two non-centre public home-media slots at sort 3/4; 4bdf7587-8deb-479b-91b4-8d9ba57463bf appends datakind-uk-2.jpg after DataKind UK’s existing first screenshot. Original files and metadata-free 1600px JPEGs remain in the two named 2026-11-17 Media/Uploads folders. Read-only verification now confirms five public photos and two project images.

My story /about renders Story proposals through the same owner-verified getHomePreview/getSections overlay and PagePreview controls. Public responses use the existing cookie-free sections loader and ISR; approving any site_sections change already revalidates /about. Empty Story uses About’s full body, so About edits invalidate its starter state too. No additional allowlist or approval-engine rule is needed.

## Selected Work highlights

Projects accept optional highlights: at most three trimmed nonempty strings of 400 Unicode characters, no NUL. The project schema supplies the TypeScript allowlist; the private publishing helper validates the merged list, preserves old values and participates in the existing approval transaction. No automatic body extraction or editor UI change. `20261117183223_project_highlights.sql` is applied live with Jamie’s explicit approval on 2026-11-17 (remote version `20261117220033`); deploy the new review code before approving highlights proposals. Public reads tolerate the field being absent.

Pending Home polish 7 sets: caption correction `478f314b-52dd-46b1-8202-5130a894d305`; exact approved mockup highlights `37b47db8-2872-4b2d-a5bd-c9c5b25e553a`. Both were inserted with summary/operations only, read back as draft, never approved by the agent. Photo upload sets from About polish are now approved: read-only verification confirms five public photos and two DataKind screenshots.


## Project case studies

Projects also accept `capabilities` (unique '01'–'05'), `status` (trimmed, ≤80 characters) and `diagram` (strict nodes/edges object, or null to clear); TypeScript uses projectSchema/diagramSchema and `private.apply_publishing_draft` independently validates the merged row and audits previous values. Requires migration `20261119180000_project_case_studies.sql`, which is NOT applied: a draft that references these fields cannot be approved until it is. The prepared sets (capabilities for five projects, Cyterly AI status, FinAI diagram) are not inserted; their SQL is in `Media/Previews/projects-drafts-pending.sql`, to run only after Jamie says “apply it”.

## Capability copy

What I build reuses the existing owner-only `site_sections` allowlist entry (`technology`, title/body); there is no new migration or approval-engine exception. `lib/journey/build.ts` defines the version-1 structured body and safe legacy fallback. The JSON carries five ordered capabilities and two certification names/URLs; empty URLs stay non-clickable and only HTTPS Credly destinations become links. The defaults in `lib/journey/build-content.json` carry both Credly URLs (tiles are `a.cred`, pointer cursor); a live structured Technology body replaces them, so its certification URLs must be set too. Copy renders as escaped React text, while diagram geometry remains trusted code data. Existing Technology previews mark the complete section gold on Home, including the compact/static views. Public pages retain cookie-free static/ISR loaders.

Pending Home polish 8 proposals: `84c50b3d-2c18-4efd-90ac-cc18281ef9da` converts the old Toolkit body into approved capability copy with empty Credly URLs; `a2ba8b2f-0ebe-4e8f-9134-45b0bd7f5f07` updates only the first and third Global Relay bullets. Both contain summary/operations only, were verified as drafts and are not agent-approved. Bullet 2 and all live content remain unchanged. Deploy the new reader before approving the structured Technology body. Proposal `84c50b3d…` still has empty certificate URLs: approving it as drafted makes the tiles plain again until URLs are added to it or a further reviewed edit sets them.

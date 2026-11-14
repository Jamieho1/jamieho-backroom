# Content drafts — TKT-98 / TKT-101 / TKT-104 / TKT-105

Pending owner changes for site_sections, experience_items, experience_bullets, projects, articles and guides. Administrative tooling inserts a draft into public.content_changes; Jamie reviews it at /manage/review. No runtime AI or draft-creation UI. Existing editors and navigation remain unchanged; homepage preview adds an owner-only overlay to its existing rendering.

## Contract

summary is plain text (1–500 characters). operations is a JSON array (1–100 on approval); each operation has op, table, key and fields. site_sections permits updates only: key must be a SECTION_KEYS value; title allows 120 Unicode code points, body 20,000. Empty strings clear these fields.

experience_items permits insert/update by explicit UUID key: kind, title, org, dates, location, summary, sort, public. experience_bullets permits insert/update/delete by UUID: item_id, text, sort, public. Item inserts require title; bullet inserts require text and an existing parent (or an item inserted earlier in the set). Other insert defaults match the tables, including public=false. Updates need at least one field; bullet deletes accept omitted/empty fields only. No item deletes.

CV text follows the editor's UTF-16 limits: title/org 160, dates/location 80, summary 2,000, bullet text 1,000; text is trimmed, title/bullet text cannot be blank. kind uses the six existing values; sort is a signed 32-bit integer, public is boolean. Unknown fields/properties, wrong types and NUL fail. photo_slots must be empty; publishing records follow the contract below; uploads and other tables remain later slices. Private content must never be put in fixtures or Git.

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

Live TKT-104 verification: both private function bodies match local SQL exactly; hardened settings, revoked API execution and owner policy/RLS confirmed. Content/draft fingerprints unchanged; no test records or approvals created. Frontend deployment and Jamie’s live verification remain pending.


## Publishing records — TKT-105

projects/articles/guides permit insert/update/delete by explicit UUID key. Fields come from each existing editor schema with id excluded; timestamps/unknown properties cannot be drafted. Insert requires slug plus name/title; other fields use table defaults, including public/published=false. Updates require at least one field. Delete accepts no fields and only sets public/published=false, retaining the row and its complete previous values. A new set can republish it. Existing editor actions/UI, including their normal deletion behavior, remain unchanged.

Project name/tagline/body, tag/screenshot counts and lengths, slug/reserved names, sort range and booleans reuse projectSchema. Article and guide text, platform/category/project relation, slug and link rules reuse articleSchema/guideSchema. Review renders arrays as structured JSON, preserving tag and screenshot boundaries. Preview timestamps simulate approval ordering on the Guides shelf. Partial edits are validated against the complete merged owner row before preview/approval; SQL independently validates the merged row, foreign keys and uniqueness. Draft links additionally require literal HTTPS, no whitespace/backslashes, valid ASCII host/IPv4/IPv6 and port; IDNs must use ASCII/punycode. This is shared in TypeScript/SQL, including project URL UTF-16 limits and other text code-point limits. No editor rule is relaxed.

publishing-overlay.ts clones only touched owner collections and composes operations sequentially. Normal loaders remain cookie-free; explicit verified preview context enables overlays on /projects and detail pages, Home Work, /articles and detail pages, /guides and detail pages, and Resources Guides shelf. Home latest-article bindings use the same preview context. Lists/Home exclude unpublished rows before serialization. Changed unpublished detail rows remain inspectable only by the owner and are labelled unpublished; finishing approval there returns to the catalogue. Gold attributes outline changed cards/details/Work items, preserving designs and motion. Review/bar links expose only validated local destinations. Metadata uses the same owner gate; copied cookies and new unpublished slugs disclose nothing to visitors/members. Public static/ISR assertions remain unchanged.

Approval selects the committed previous audit with the status update, then refreshes affected catalogues/Home/Resources plus proposed and previous slug paths, including intermediate edits. This avoids depending on an earlier slug read. No live-content drift check or new public RPC. Existing section/experience approval paths are preserved.

Migration 20261114120122_content_drafts_publishing.sql applied live through Supabase MCP with Jamie’s explicit TKT-105 approval on 2026-11-14 as remote 20261114125201. It adds private.draft_https and owner-checked private.apply_publishing_draft, and extends the existing private trigger; function EXECUTE is revoked from API roles, search_path is empty. Applied migrations remain untouched. Frontend deployment and Jamie’s live verification remain pending.

Coverage: publishing-drafts unit/DB tests, approval/preview guard tests and publishing-preview.spec.ts using the existing disposable loopback adapter/config. Tests include full-schema parity, limits/links, duplicate/missing rows, cross-table rollback, unpublish/restore, old/new slug refresh, new draft slug privacy and all required preview surfaces at desktop/390px. Current results/file inventory are in status.md.

Live TKT-105 verification confirmed exact function-source parity, hardened settings/API revocations, owner draft policy/RLS, valid/invalid URL behavior and unchanged content/draft fingerprints. No new public RPC or TKT-105 security advisory; no content approvals or test records created.

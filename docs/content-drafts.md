# Content drafts — TKT-98

First slice: pending owner changes for site_sections only. Administrative tooling inserts a draft into public.content_changes; Jamie reviews it at /manage/review. No runtime AI or draft-creation UI. Existing editors, homepage renderer and navigation are unchanged.

## Contract

summary is plain text (1–500 characters). operations is a JSON array (1–100 on approval); each operation has op, table, key and fields. Only update/site_sections is supported. key must be a SECTION_KEYS value; fields may contain title (120 Unicode code points) and/or body (20,000). Empty strings clear fields. Unknown properties, non-text values and NUL are rejected. photo_slots must be empty to approve; preview, uploads, badges and other tables are later slices. Private content must never be put in fixtures or Git.

lib/content-drafts/allowlist.ts defines field rules and affected routes; the migration mirrors them in SQL. Extend both and their parity tests for a future content type. Inserts/deletes are intentionally refused for fixed site sections, consistent with the PRD’s delete scope.

## Review and apply

/manage/review is force-dynamic, owner-only (others get 404) and reads directly through the request-scoped Supabase client. It lists drafts newest first and displays current live values against final proposed values, collapsing repeated field edits. Invalid proposals show a validation error, disable Approve and remain discardable. Text is escaped, not rendered as HTML.

app/actions/content-drafts.ts verifies the owner, loads/validates the set and re-checks the session before submitting one conditional status update. The pending set and its operations must still match. This protects the proposal from a concurrent edit; it does not compare against or reject changed live content.

That UPDATE locks the draft row and invokes private.apply_content_change(), a SECURITY DEFINER trigger with an empty search_path and no API EXECUTE grants. It independently checks the verified owner and validates the same allowlist. No public RPC or new secret is required; record_signin remains the sole public API-callable function. The trigger applies every operation, captures prior section values per operation, and fills previous, approved_at and approved_by (a historical UUID retained independently of account deletion) in the same transaction. Any exception rolls everything back. Inserts must start as draft; finalized sets cannot be reapproved or edited. RLS restricts all API table operations to the owner. Administrative draft insertion does not require pretending to be Jamie; administrative approval without his authenticated session is refused.

Successful approval revalidates /, /journey, /about and /manage/review. Cache-refresh failures are reported separately from committed database writes. Discard updates status only and never changes site_sections or approval history. The encrypted export includes content_changes; it contains owner audit data, not new visitor tracking.

## State and verification

Migration: 20261114020933_content_changes.sql — applied live through Supabase MCP on 2026-11-14 after Jamie said “apply it”. Remote version: 20261114101016 (content_changes); MCP timestamps differ from local filenames, so retain the applied local file unchanged. Verified live RLS/owner policy, table/function grants, hardened trigger, no new public RPC and unchanged site_sections fingerprint. No live test data was created. Frontend deployment and Jamie’s live review remain pending.

Policy/transaction tests use disposable PGlite; browser owner fixtures exercise the same SQL engine. An additional real Next build was tested against a loopback Supabase HTTP adapter backed by PGlite: owner session, review before/after, real server-action approval, history, homepage refresh without rebuilding, discard and visitor 404 passed. No production browser or live Supabase was used.

## How Claude drafts (TKT-103)

Claude follows the saved `site-content-drafts` skill: read the live rows and `lib/content-drafts/allowlist.ts`; insert one `content_changes` row per request (summary + operations only, status left as draft); never write live tables, set status, or fill approval fields; reply with a one-line summary and the `/manage/review` link; after Jamie approves, read back the set and the live row. Requests for tables or operations not yet in the allowlist are declined with the ticket that adds them. To reverse an approved set, Claude drafts a new set from its `previous` values. Photo slots (TKT-107): Claude renames Jamie's attached photos to the slot filename and saves them in `Personal Website/Media/Uploads/<YYYY-MM-DD>-<short-name>/`, outside Git.

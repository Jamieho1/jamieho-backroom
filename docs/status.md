# Current state

## Implementation

H1 (Content hub data model, editors, drafts) is implemented locally and not committed, pushed or deployed. H2-H5 (hub pages, series, guides, post page) are not started. PL4 (PassLoop moved to its own repo) is also still local and uncommitted.

- Migration `20261125100000_content_hub.sql` adds `content_series`, series/code/takeaway/slides on articles, series/audience/highlights/exercises on guides, the cross-table part-uniqueness trigger, series detach on delete, and replaces `private.apply_publishing_draft` and `private.apply_content_change` (see content-drafts.md, security.md).
- Owner editors: /articles/manage and /guides/manage have the new fields; /content/series/manage lists, creates, edits and publishes series. Shared zod schemas live in lib/articles.ts, lib/guides.ts and lib/content-series-data.ts; read time and chapter count are computed helpers.
- Content Drafts: content_series and the new fields are in the TS allowlist, overlay, review and revalidation (/content, /content/series, /content/series/<slug>, /content/guides). Export manifest lists 19 personal-site tables.
- Public pages are unchanged: detail reads keep the original columns and default the new fields, so they work before the migration is applied.

## Database and deployment

`20261125100000_content_hub.sql` is NOT applied live; apply only after Jamie says "apply it", and only after the PL2 migration (PassLoop repo, `content_changes.site`) is live because it replaces the PL2 approval trigger. Apply the migration before deploying the new editors (owner pages select the new columns). Earlier local migrations (S1-S3, C4, SQL, notes visuals) remain NOT applied and belong to PassLoop's sequence. The PL4 deploy-order note still stands: PL2 applied and PassLoop live before deploying.

## Verification (Linux copy, secret-free)

Typecheck passed. Full suite: 104 files, 1,083 tests passed, including the new DB file (110 tests: RLS, constraints, cross-table part uniqueness, cascade, draft approval/rollback parity, site tagging, hardening), unit and editor UI tests. Production build (Google Fonts stubbed through Next's mock env, Linux copy only) and `node scripts/assert-static.mjs` passed.

Test changes to know: the DB harness now creates PassLoop's PL2 pieces (tests/support/content-changes-site.sql) before this migration, and three app-drafts tests were split so no approval mixes PassLoop and personal tables (PL2 rejects mixed sets).

**Not run:** browser specs (no browser needed for H1; Chromium is unavailable in the sandbox), anything against the live Supabase database.

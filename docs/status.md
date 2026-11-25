# Current state

## Implementation

H1 (Content hub data model, editors, drafts) and H2 (Content hub shell and Latest) are implemented locally and not committed, pushed or deployed. H3-H5 (series pages, guide pages, post page) are not started. PL4 (PassLoop moved to its own repo) is also still local and uncommitted.

- H1: owner editors (/articles/manage, /guides/manage, /content/series/manage), shared zod schemas, Content Drafts support for content_series and the new fields, 19-table export manifest.
- H2: /content (Latest), /content/series and /content/guides share one frame (heading, one search box that also takes a post code, sticky tabs with counts, footer band). Latest has Topic and Platform dropdowns kept in the URL, guide band, month groups, Cards/List, 12 at a time, NEW and Read badges (Read is per browser). /p/<code> short links; /articles, /resources and /guides are 308 redirects; the Content menu lists Latest, Series, Free guides. /articles/<slug> and /guides/<slug> are unchanged apart from marking a post read. Public article/guide reads now select every column.
- /content/series and /content/guides are plain placeholder lists until H3/H4; series search results link to /content/series until the series pages exist.

## Database and deployment

`20261125100000_content_hub.sql` is applied live (2026-11-25, remote version 20261125130615, with Jamie's approval): RLS on content_series with 4 policies, no rows changed, no new security advisor findings. It replaced `private.apply_content_change`, so keep it consistent with the PL2 migration (PassLoop repo, `content_changes.site`), which must be live for Content Drafts. Earlier local migrations (S1-S3, C4, SQL, notes visuals) remain NOT applied and belong to PassLoop's sequence. H2 adds no migration. Deploy PL4 only after PL2 is applied and PassLoop is live.

## Verification (Linux copy, secret-free)

H2: typecheck passed. Full suite: 106 files, 1,126 tests passed (new: 26 hub logic, route and redirect tests, 17 component tests for filters, dropdown keyboard, Cards/List, Show more, search and code, tabs, footer). `next build` passed; /content, /content/series and /content/guides are pre-rendered; `node scripts/assert-static.mjs` passed. A `next start` smoke check confirmed the 308 redirects, `/p/<unknown>` 307 and the pages answer 200.

**Not run:** browser specs (Chromium is unavailable in the sandbox). tests/e2e/content-hub.spec.ts is new (desktop and 390 px, dark and light) and the existing articles, desktop, home, publishing-preview, review-badge and feedback specs were edited for the new routes; all type-check and list under `playwright test --list` but were not executed. Nothing was run against the live database in H2.

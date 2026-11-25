# Current state

## Implementation

H1 (Content hub data model, editors, drafts), H2 (Content hub shell and Latest) and H3 (series index and series pages) are implemented locally (H1+H2 committed as 9f5b104; H3 uncommitted), not pushed or deployed. H4-H5 (guide pages, post page) are not started. PL4 (PassLoop moved to its own repo) is also still local and uncommitted.

- H1: owner editors (/articles/manage, /guides/manage, /content/series/manage), shared zod schemas, Content Drafts support for content_series and the new fields, 19-table export manifest.
- H2: /content (Latest), /content/series and /content/guides share one frame (heading, one search box that also takes a post code, sticky tabs with counts, footer band). Latest has Topic and Platform dropdowns kept in the URL, guide band, month groups, Cards/List, 12 at a time, NEW and Read badges (Read is per browser). /p/<code> short links; /articles, /resources and /guides are 308 redirects; the Content menu lists Latest, Series, Free guides. /articles/<slug> and /guides/<slug> are unchanged apart from marking a post read. Public article/guide reads now select every column.
- /content/guides is a plain placeholder list until H4.
- H3: /content/series shows series cards (progress ring, After this, first four parts with tick/Next/Soon, footer, Start/Continue); /content/series/[slug] is the series page (sticky info column, ordered parts on a vertical line, dashed coming slots from planned_parts). Both pre-rendered; progress is per browser. Series search results open the series page. Saving a post or guide revalidates its series page(s); drafts for series preview the series page.

## Database and deployment

`20261125100000_content_hub.sql` is applied live (2026-11-25, remote version 20261125130615, with Jamie's approval): RLS on content_series with 4 policies, no rows changed, no new security advisor findings. It replaced `private.apply_content_change`, so keep it consistent with the PL2 migration (PassLoop repo, `content_changes.site`), which must be live for Content Drafts. Earlier local migrations (S1-S3, C4, SQL, notes visuals) remain NOT applied and belong to PassLoop's sequence. H2 adds no migration. Deploy PL4 only after PL2 is applied and PassLoop is live.

## Verification (Linux copy, secret-free)

H2: typecheck passed. Full suite: 106 files, 1,126 tests passed (new: 26 hub logic, route and redirect tests, 17 component tests for filters, dropdown keyboard, Cards/List, Show more, search and code, tabs, footer). `next build` passed; /content, /content/series and /content/guides are pre-rendered; `node scripts/assert-static.mjs` passed. A `next start` smoke check confirmed the 308 redirects, `/p/<unknown>` 307 and the pages answer 200.

**Not run:** browser specs (Chromium is unavailable in the sandbox). tests/e2e/content-hub.spec.ts is new (desktop and 390 px, dark and light) and the existing articles, desktop, home, publishing-preview, review-badge and feedback specs were edited for the new routes; all type-check and list under `playwright test --list` but were not executed. Nothing was run against the live database in H2.

H3: typecheck passed. Full suite: 109 files, 1,156 tests passed (new: 19 logic tests for part ordering across articles and guides, coming slots, next-part logic, card rows and search link; 6 component tests for cards and the series page including blocked storage; 5 for series revalidation on save and draft preview targets). `next build` passed (/content/series pre-rendered, /content/series/[slug] SSG); `node scripts/assert-static.mjs` passed. **Not run:** tests/e2e/content-series.spec.ts (desktop and 390 px, dark and light; type-checks and lists, 10 tests, Chromium unavailable). No database calls and no migration in H3.

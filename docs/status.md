# Current state

## Implementation

PassLoop S1 is implemented locally: `/interview/system-design/<slug>?tab=solution|quiz|whiteboard` shows an owner-managed question with the PassLoop rail, a collapsible question column ("← All system design", done ticks, current highlighted; phone "Questions" sheet), icon/title with flag and Mark-as-done for signed-in users, a sticky "On this page" TOC with scroll highlight and back-to-top (collapsible on phones), Markdown solutions with ```table-schema cards and ```diagram blocks (existing diagram component), and a quiz (1–4 keys, explanations, Don't know = wrong, score review, attempts: account rows or visitor localStorage, no AI hint). The Whiteboard tab is a placeholder for S2; no question content is seeded (Tiny URL is S4). C1–C4 remain intact. Jamie pushes/reviews before Done.

## Database and pending content

**S1 migration `20261123200000_system_design_questions.sql` is NOT applied live**: three tables (questions, own-row quiz attempts, own-row flag/done), the draft apply function and a replacement `apply_content_change`. Readers tolerate the missing table (no questions). **C4 migration `20261123180000_interview_prep_links.sql` is also NOT applied.** Applied earlier: C1 `20261123123946` (remote `20261123125602`), P2/P3 `20261123110809`/`20261123110824`, Journey photos `20261121120427`, Project case studies `20261119233658`, Contact briefs `20261119150051`.

Pending reviews: email `78b3b527-19bb-41e3-ae94-7d6e355f7827`; Experience `9b27d9e7-c440-44c7-85ce-73c7c5f4d47e`; Technology `84c50b3d-2c18-4efd-90ac-cc18281ef9da`; CV `a2ba8b2f-0ebe-4e8f-9134-45b0bd7f5f07`; captions/highlights `478f314b-52dd-46b1-8202-5130a894d305`, `37b47db8-2872-4b2d-a5bd-c9c5b25e553a`. Six Contact copies and 23 earlier Storage objects remain approved for deletion, pending deployment/authenticated API access.

## Verification (S1, Linux sandbox copy with a fresh npm ci)

Typecheck clean. Unit tests 907 passed / 103 files; database/policy tests 549 passed / 41 files (18 new PGlite policy tests run against the real migration chain). One production build against the disposable loopback API passed, static assertions passed (/, /about, /resources, /privacy, /projects, /articles). SSR smoke against that API: question page 200 with heading ids, table-schema card and diagram; hidden/unknown slug 404; list shows only public questions; `practice`/`notes` unchanged. jsdom component tests cover the quiz flow, attempts, TOC highlight, tabs, flag/done.

**Not run:** the new Playwright spec `tests/e2e/system-design.spec.ts` (desktop and 390px) and the existing browser specs — no browser could be installed in the sandbox. Run it on the Mac with the usual Playwright setup. No live database operation, secret access, commit or push.

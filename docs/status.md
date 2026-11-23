# Current state

## Implementation

PassLoop Q1 (SQL practice) is implemented: SQL is a practice section with `/interview/sql/practice[/<topic>]` (seven SQL 50 topics, done ticks, flags, per-list progress count), `/interview/sql/notes` and question pages at `/interview/sql/problems/<lc>`. Strict SQL problem schema, three own-words seeds (1757, 1378, 620), the shared practice workspace with a SQL editor, and an in-browser Postgres runner: PGlite 0.5.13 (exact pin, now a runtime dependency) in a dedicated Web Worker, one SELECT/WITH statement in a READ ONLY transaction, 1,000-row cap, 2 s limit enforced by terminating the worker (PGlite ignores statement_timeout), result diff (multiset or ordered). S1–S3 system design, C1–C4 and P-series work remain as before. Jamie pushes/reviews live before Done.

PassLoop Q2 (SQL 50 content part 1) adds 19 own-words questions to the three Q1 seeds: Select 5 (1757, 584, 595, 1148, 1683), Basic Joins 9 (1378, 1068, 1581, 197, 1661, 577, 1280, 570, 1934) and Basic Aggregate Functions 8 (620, 1251, 1075, 1633, 1211, 1193, 1174, 550), 22 in all, each with 5-6 tests, 2-3 approaches (one optimal), hints, clarifying Q&A, a follow-up and a MySQL note where it differs. The other four topics stay empty for Q3.

## Recorded database and pending content

New local migration `20261123230000_practice_submissions_sql.sql` (allows `practice_submissions.language = 'SQL'`) is NOT applied; it waits for "apply it". Prior recorded state unchanged: S1 `20261123200000`, S2 `20261123210000`, S3 `20261123220000` and C4 `20261123180000` NOT applied; C1 applied remote `20261123125602`, P2/P3 `20261123110809`/`20261123110824`, Journey photos `20261121120427`, Project case studies `20261119233658`, Contact briefs `20261119150051`. No live database/content operation was made. Pending reviews and approved deletions from the earlier snapshot are unchanged.

## Verification

Linux copy of the repo (secret-free): **typecheck passed; full unit + database suite 160 files, 1,577 tests passed** (new: SQL guard, compare, engine, runner with scripted and real PGlite ports, every seeded solution and approach through PGlite with mutation checks, navigation/validation, console components, SQL submission migration). One production build passed; static assertion (six pages), Excalidraw bundle assertion and the new PGlite assertion passed (3 PGlite chunks plus one loader, first-loaded only by the SQL question route; negative run fails as intended). No Next advisory appeared.

**Not run:** `tests/e2e/sql-practice.spec.ts` (4 cases: lists/topics, Run/Submit wrong then right with diff at desktop and 390 px, time-limit recovery, signed-in progress) was written and attempted once; Chromium is not installable in the sandbox. The Web Worker was therefore not exercised in a real browser: PGlite initialisation with the self-hosted wasm/data was verified in Node, and SSR of all SQL routes was checked with `next start`.

SQL 50 plan numbers/titles could not be re-verified against leetcode.com from the sandbox; the table in the prompt file was used. Turbopack also emits unused hashed copies of PGlite's wasm/data under .next/static/media (about 15 MB). No live changes, secret access, commit or push.

Q2 verification (Linux copy): typecheck passed; full unit + database suite 160 files, 1,672 tests passed (the SQL suite now runs every solution and approach of all 22 questions through Node PGlite and four deliberately wrong queries per question, each failing at least one test); one production build passed with assert-static, assert-excalidraw-bundle and assert-pglite-bundle. `tests/unit/sql-problems.test.ts` now treats an all-NULL single row as the empty case for aggregate-only questions (1174, 550). Not run: browser specs (no Chromium); no LeetCode re-verification of titles (no network to leetcode.com), numbers and titles from the plan table and memory. No migration, dependency, live change, commit or push.

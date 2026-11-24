# Build prompts — PassLoop SQL (SQL 50 practice + SQL notes)

Paste in order: **Q1 → Q2 → Q3 → Q4**. Shared rules for every ticket: read AGENTS.md, docs/README.md, docs/status.md, docs/interview.md and docs/security.md first and follow them (Jamie pushes; never push; new migrations only, applied live only after Jamie says "apply it"; **no runtime AI calls**; desktop + 390 px + reduced motion; update docs/ + MEMORY.md + docs/decisions.md after).

**Content rule:** the problem list follows LeetCode's public "SQL 50" study plan (numbers and titles only, linked to LeetCode). Every statement, table description, sample row, test case, solution and explanation is written in our own words and our own data. No copied text, tables or examples.

**Dialect (decision 2026-11-23, Jamie):** answers run on **Postgres** in the browser through `@electric-sql/pglite` (already pinned in the repo for tests). It moves to a runtime dependency, loaded only on SQL practice routes (dynamic import inside a Web Worker), never in other bundles. Where LeetCode's default MySQL differs, solutions use Postgres and the notes explain the MySQL equivalent.

## The SQL 50 list (7 topics, 50 questions)

Verify numbers and titles against https://leetcode.com/studyplan/top-sql-50/ before writing content; if the plan differs, follow the plan and report the change.

| Topic | Questions |
|---|---|
| Select | 1757, 584, 595, 1148, 1683 |
| Basic Joins | 1378, 1068, 1581, 197, 1661, 577, 1280, 570, 1934 |
| Basic Aggregate Functions | 620, 1251, 1075, 1633, 1211, 1193, 1174, 550 |
| Sorting and Grouping | 2356, 1141, 1070, 596, 1729, 619, 1045 |
| Advanced Select and Joins | 1731, 1789, 610, 180, 1164, 1204, 1907 |
| Subqueries | 1978, 626, 1341, 1321, 602, 585, 185 |
| Advanced String Functions / Regex / Clause | 1667, 1527, 196, 176, 1484, 1327, 1517 |

---

## Q1 — SQL practice section and in-browser Postgres runner

```
Ticket Q1. Read the shared rules at the top of Resources/Prompts - PassLoop SQL.md.

1. Section: turn the existing 'sql' interview section (/interview/sql, lib/interview/navigation.ts) into a practice section like DSA: add 'sql' to PRACTICE_SECTIONS, routes /interview/sql/practice and /interview/sql/notes, topic list = the 7 SQL 50 topics (in plan order), question list with done ticks, progress counts kept separate from DSA.
2. Problem model: new kind 'sql' in lib/practice/types.ts (own schema, strict zod): lc, topic, title, difficulty, statement (Markdown), tables [{name, columns [{name, type, pk?, note?}]}] (render with the S1 table-schema card), examples (tables in → result table out, shown as small grids), tests [{setup SQL: CREATE + INSERT, expected: {columns, rows}, ordered: boolean}], solution (Postgres), approaches (min 2, one optimal, with why), hints, clarify, followUps, mysqlNote? (how the MySQL version differs). Problem files lib/practice/problems/sql-*.ts, one per topic, same header-comment convention as the DSA files.
3. Workspace: reuse the practice workspace (Problem / Solution / Submissions / Notes tabs, ‹ › through the topic, autosave, editor controls) with a SQL editor mode. Run = first test only, Submit = all tests.
4. Runner: PGlite in a dedicated Web Worker, dynamically imported only on SQL routes. Each test: fresh database (or schema reset), run setup, run the user's query with a statement timeout (e.g. 2 s) and a row cap (e.g. 1,000), compare with expected: column count and order, values normalised (numbers to fixed precision, dates to ISO, NULL), rows compared as a multiset unless ordered=true. Show a diff table (expected vs yours, mismatched rows highlighted) and Postgres error messages verbatim. Only one statement is allowed (reject multiple statements and anything that is not SELECT/WITH).
5. Progress, flags and submissions reuse the existing per-user practice tables (they key on the LeetCode number; SQL numbers don't collide with DSA ones). If a DB-side catalogue check (e.g. private.valid_draft_problem) needs to know SQL numbers, extend it in a NEW migration (not applied until "apply it").
6. Seed only 3 problems (1757, 1378, 620) so the whole flow is testable; Q2/Q3 add the rest.
7. Move @electric-sql/pglite to dependencies (same exact version, no ^), copy its wasm/data assets at predev/prebuild like Pyodide/Excalidraw, and add a bundle assertion that PGlite only appears in SQL-route chunks. Record the dependency decision in docs/decisions.md.
Done when: unit tests (schema validation of every SQL problem, result comparison incl. ordered/unordered, NULLs, numeric precision, multi-statement rejection, timeout), every seeded solution passes its own tests in a Node PGlite test, browser tests desktop + 390 px (open a question, Run, Submit wrong then right, diff shown, progress tick), typecheck, suite, build, static + bundle assertions; docs + privacy updated if anything new is stored. Report checks actually run.
```

---

## Q2 — SQL 50 content, part 1 (Select, Basic Joins, Basic Aggregate Functions: 22 questions)

```
Ticket Q2. Read the shared rules and the content rule at the top of Resources/Prompts - PassLoop SQL.md. Requires Q1.

Write the 22 questions in the first three topics (keep 1757, 1378, 620 from Q1; review and improve them if needed). For each: own-words statement, table definitions, 1–2 worked examples, at least 4 tests (normal case, NULLs, duplicates/ties, empty or no-match case; ordered=true only when the question asks for an order), a Postgres solution, 2+ approaches with the optimal marked and why, hints, clarifying Q&A, a follow-up, and a mysqlNote where the MySQL answer differs.
Done when: schema validation passes for all 22, every solution passes all of its tests in the Node PGlite suite, a deliberately wrong query fails at least one test per question (mutation check), typecheck, suite, build. Report checks actually run.
```

---

## Q3 — SQL 50 content, part 2 (Sorting and Grouping, Advanced Select and Joins, Subqueries, Strings/Regex/Clause: 28 questions)

```
Ticket Q3. Same instructions and checks as Q2, for the remaining 28 questions. Include window functions where they are the cleanest answer (e.g. 180, 185, 1204, 1321) and show the non-window approach as the alternative. For DML-style questions on LeetCode (196 Delete Duplicate Emails, 1667 updates), turn them into a SELECT that returns the rows that would remain or the updated values, and say so in the statement.
```

---

## Q4 — SQL notes: basics tutorial, tackling SQL questions, Postgres vs MySQL

```
Ticket Q4. Read the shared rules at the top of Resources/Prompts - PassLoop SQL.md. Requires Q1–Q3.

1. Notes shelf for the SQL section (/interview/sql/notes), using the existing notes system and Content Drafts.
2. Code side only: make sure notes can link SQL questions with [[question:<lc>]] chips and that the SQL notes appear in the section's note list. Claude writes the three notes as Content Drafts after this lands:
   - sql-basics: SELECT/WHERE, NULL logic, joins (inner/left/self/cross, with small diagrams using the existing diagram block), GROUP BY/HAVING, CASE, subqueries vs CTEs, window functions, dates and strings; each section links 2–3 SQL 50 questions.
   - sql-tackling: a step-by-step method (read the schema and keys, write the output columns first, choose the join, check NULLs/duplicates/ties, build in CTE steps, test edge cases) and patterns (top-N per group, consecutive rows, running totals, first/last per group, pivot with CASE, percent/ratio).
   - sql-postgres-mysql: the differences that matter on LeetCode and in interviews (IFNULL vs COALESCE, DATE_FORMAT vs TO_CHAR, integer division, string concat, LIMIT/OFFSET, GROUP BY strictness, regex syntax, DATEDIFF vs date subtraction).
Done when: unit tests for chip validation with SQL numbers, browser test for the notes list, typecheck, suite, build. Report checks actually run.
```

---

## Q5 — SQL visuals: a "tables" visual kind, and visuals editable through Content Drafts

```
Ticket Q5. Read the shared rules at the top of Resources/Prompts - PassLoop SQL.md. Requires Q1–Q4.

Context (2026-11-24): the three SQL notes are live but the Visuals panel says "No visuals for this topic yet". Note visuals (lib/notes/visual.ts: kinds array | grid | graph, frames of highlights/pointers/vars, rendered by components/notes/trace-visual.tsx and grouped in visuals-tab.tsx) suit algorithms, not SQL. Also notes.visual is not draftable: the TS allowlist and private.apply_app_draft only allow body and free for notes, so Claude cannot add visuals without a direct DB write.

1. New visual kind "tables" in lib/notes/visual.ts (strict zod, keep the existing kinds unchanged):
   tables: [{id, name, columns[≤8], rows[≤10] of values (NULL shown as ∅)}] (≤3 tables: e.g. two inputs and one result),
   frames (2–14), each: caption, highlight [{table, row?, col?}] (cells or whole rows), done (same addressing), result rows revealed so far (e.g. `show: {resultTableId: n}`) or replaced rows for that frame, optional vars (as today).
   Render: small tables side by side on desktop (stacked at 390 px), current rows/cells highlighted, revealed result rows fade in, NULL cells styled distinctly, same stepper, keyboard and reduced-motion behaviour as the existing visuals. No new dependencies.
2. Make `visual` an allowed field for notes update drafts: TS allowlist + preview/approval validation (every visual must pass the Visual schema and visualIssues; reject unknown kinds) + private.apply_app_draft in a NEW migration (copy the live function and only add 'visual' to the notes allowlist with a jsonb array/object check). Do NOT apply it; Jamie says "apply it".
3. Draft preview: a notes draft that changes `visual` must show the new visuals in the /manage/review preview and on the page preview overlay, like body changes do.
4. Docs: content-drafts docs show the tables-visual JSON shape with one small example (two input tables, a LEFT JOIN result filled row by row).
Done when: unit tests (tables schema incl. limits and bad addresses, renderer frames, draft validation accepts a valid tables visual and rejects a bad one), DB tests (apply_app_draft accepts visual for notes only, still rejects title/sort), a browser test that steps through a tables visual at desktop and 390 px, typecheck, suite, build, static + bundle assertions. Report checks actually run.
```

After Q5 lands and its migration is applied, Claude writes the SQL visuals as Content Drafts: LEFT vs INNER JOIN, WHERE vs HAVING with GROUP BY, NULL in comparisons and COUNT, DENSE_RANK top-N per group, LAG for consecutive rows, running total, anti-join (rows with no match).

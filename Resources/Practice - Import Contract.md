# Practice import contract (TKT-66, Claude)

`20261101005242_practice_owner_data.sql` was approved and applied live on 2026-11-01 (remote version `20261101080700`). The tables are ready for import.
Codex implements schema and UI only; Claude handles the published artifact data. Never put personal content in git.

Use the owner database session or an authorized migration tool. Identify each problem by its numeric
problem number from `lib/practice/catalog.ts`, not a title or array position. Reject unknown numbers.

| Table | Import fields | Visibility |
| --- | --- | --- |
| practice_code | problem (primary key), code, updated_at | Owner only |
| practice_attempts | id (UUID primary key), problem, code, mode, status, passed, total, error, created_at | Owner only |
| question_notes | problem (primary key), body (Markdown), updated_at | Everyone allowed to read Practice |

Upsert code and notes on `problem`. Use a stable UUID per source attempt so repeated imports do not
duplicate history; preserve original timestamps. Do not replace newer destination edits on a rerun.
`mode` is `run` or `submit`; `status` is `ok`, `compile_error`, `timeout` or `crash`.
`passed` and `total` are nonnegative integers, with total at least passed. Error summaries are at most
2,000 characters; code is at most 100,000 and note bodies at most 200,000. Do not invent results for
source entries lacking outcomes: import their latest code into practice_code instead.

Question notes are shared, unlike code and attempts: review imported text for personal details before
copying. No LeetCode statement text. No AI calls or execution during import. Practice links use
`/practices/217`.

After import Jamie checks saved code on another device, private attempts, read-only member notes and
problem links. TKT-66 stays with Claude; ticket Done requires Jamie's live confirmation.

# Notes read-view contract (TKT-61)

The schema is in `supabase/migrations/20261031150000_notes.sql`. Apply it before deploying this code.
Applied to production through Supabase MCP on 31 October 2026 (remote migration version `20261031150441`, name `notes`).
The migration creates an empty table. It does not copy or overwrite any personal content.

Claude owns the one-time TKT-63 import. A `public.notes` row has:

| Column | Value |
| --- | --- |
| `id` | Coding topic ID, e.g. `arrays-hashing`; strip the artifact's `n_` prefix. |
| `title` | Topic label shown in the sidebar. |
| `body` | The current Markdown body, not the old AI draft. `###` headings become concept cards. |
| `free` | Owner free notes from the artifact, or an empty string. Requires the TKT-62 migration `20261031151127_notes_free.sql` (applied live on 31 October 2026). |
| `visual` | Decoded JSON: one artifact Visual object or an array of them; default `[]`. Parse the artifact's serialized `visual` string before inserting it. |
| `sort` | Integer sidebar order. |
| `updated_at` | ISO timestamp; defaults to the insertion time. |

`visual` retains the artifact's array/grid/graph shape, including frames, pointers, ranges, changed values/cells,
side variables, concept, time and space. The reader groups a visual's `concept` against the numbered heading's
name (without `1. ` etc.). Unmatched visuals appear under More. Invalid visuals show a message while the text stays readable.

If the published artifact's gallery includes problem visuals assembled at runtime, materialize those into the
imported `visual` array, with the appropriate `concept`. The website does not bundle the artifact's solution content
or call an AI service to reconstruct it. NeetCode problem names/links are metadata only; no problem statements are in git.

No sample note is seeded in production. Unit/database tests use synthetic notes; the live Notes window remains
empty until data is loaded. Owner editing is implemented in TKT-62 (awaiting its migration and deployment); copying data is TKT-63. Spaced repetition, mock history, quizzes,
AI controls and the On-this-page bar are outside this read-view ticket.

Reads follow `rls.can_view_app('notes')`. Only the owner may insert, update or delete rows. The table is included
in the existing encrypted weekly export. Visitors have no edit controls. The owner can edit the body and free notes through a server action that checks the owner role again; RLS independently enforces writes. A failed save keeps the draft and offers Retry.

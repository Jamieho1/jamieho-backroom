# Agent instructions

Read `docs/README.md` and `docs/status.md` first, then only the topic documents needed for the task. Do not load the full history or all source files routinely.

- Ask before starting each new ticket; existing approval continues for its scope. Mark Done only after Jamie verifies live.
- Jamie pushes. Never push; commits use Jamie Ho <shinghimho@gmail.com>.
- Prefer APIs/MCP and local checks. Do not visit the website or control Jamie's browser/computer unless explicitly requested.
- Jamie handles secrets. Never read, print or request their values.
- Use new migrations; never edit applied SQL. Test changes and obtain Jamie's approval before applying them live. Record confirmed applied/pending/unknown state.
- Database RLS enforces access; only the owner edits managed content. Preserve policy tests, static public pages and accurate privacy disclosures. Read `docs/security.md` before auth, data or storage changes.
- Private CV, notes, attempts and imports stay out of Git. Approved public artwork is a limited exception. No runtime AI calls or server-side user-code execution.
- After every change, update the affected `docs/` topic and `docs/status.md` with concise current facts, checks, unresolved work and migration/deployment state. Remove superseded guidance; omit examples and repeated history. Add one brief dated entry to `MEMORY.md`; archive older entries under `docs/archive/`.
- Verify proportionately using `docs/operations.md`. Never report old checks as newly passed.
- Keep this file under 300 words. Maintain `docs/README.md` as the selective reading map. Inspect relevant source before editing; documentation does not replace code verification.

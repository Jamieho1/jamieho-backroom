# PassLoop (moved to its own repo)

Interview practice (DSA, System Design, LLD, SQL, notes, Behavioral playbook, Resume, Companies, Applications) lives in the separate PassLoop repository (`~/Documents/Developer/PassLoop`) and Vercel project. This repo no longer contains its routes, components, libraries, CSS, scripts or tests. Read PassLoop's own docs (`docs/routes.md`, `docs/content-drafts.md`) for its behaviour.

## What this site keeps

- `lib/passloop.ts`: the only place that reads `NEXT_PUBLIC_PASSLOOP_URL` (fallback `https://pass-loop.vercel.app`; non-http(s) values are ignored). Also exposes `PASSLOOP_PRIVACY_URL` and the one-line description.
- Redirects in `next.config.ts`, all permanent (308) and query-preserving: `/interview` and `/interview/:path*` to `${PASSLOOP_URL}/` and `/:path*` (the bare rule is separate because a lone `/:path*` produced an empty Location); `/notes` to `/dsa/notes`; `/practices` to `/dsa/practice`; `/practices/:problem` to `/problems/:problem`; `/behavioral` to `/behavioral`; `/desktop?app=notes|practice|behavioral` (and `practice&problem=<n>`) to the same targets. Table: PassLoop `docs/routes.md`.
- Navigation link "PassLoop ↗" (external, replaces "Interview Prep") and a code-defined PassLoop card on /projects. It is not a `projects` row, so no database content was written.
- Privacy text and the export manifest no longer cover PassLoop data; the privacy page links `${PASSLOOP_URL}/privacy`.

## Removed here

Desktop apps Notes, Practice and Behavioral (including the owner Resume and Stories editor and its experience editor components), their libraries, CSS, tests, the Pyodide/Excalidraw/PGlite copy and bundle-assertion scripts, the notes importer, and the dependencies codemirror, Excalidraw and Pyodide. Database tables, rows, policies and the `desktop_apps` row `notes` are untouched (PassLoop's notes RLS reads it); this repo's migrations stay as the shared history.

## Shared modules kept

`components/markdown.tsx`, `components/diagram.tsx` and `components/code-highlight.tsx` (article code blocks; `.tk-*` colours now in app/articles.css) stay because remaining pages import them, so `@lezer/highlight` and `@lezer/python` remain. `@electric-sql/pglite` is now a dev dependency (database test harness only).

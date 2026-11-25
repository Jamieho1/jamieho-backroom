# Current state

## Implementation

PL4 is implemented locally (not committed, pushed or deployed): PassLoop now lives in its own repo and Vercel project; this site only links and redirects to it.

- `lib/passloop.ts` is the single reader of `NEXT_PUBLIC_PASSLOOP_URL` (fallback `https://pass-loop.vercel.app`).
- `next.config.ts` 308-redirects `/interview` (separate rule) and `/interview/:path*`, `/notes`, `/practices[/:problem]`, `/behavioral` and `/desktop?app=notes|practice|behavioral` to PassLoop.
- Navigation shows "PassLoop ↗" instead of Interview Prep; /projects has a code-defined PassLoop card (no database content written).
- Removed: app/interview, the Notes, Practice and Behavioral desktop apps and their components, libs, CSS, tests, e2e specs, the Pyodide/Excalidraw/PGlite scripts, the notes importer, and the codemirror, Excalidraw and Pyodide dependencies. Kept because remaining pages import them: markdown, diagram, code-highlight (so the two lezer packages). PGlite is now a dev dependency (test harness).
- Content Drafts filter `site = 'personal'` everywhere (review list, preview, approve, discard, counter); the allowlist drops PassLoop's tables; a passloop draft is invisible here (new tests).
- Privacy page says PassLoop is a separate service and links its privacy page; the export manifest lists only the 18 personal-site tables.

## Database and deployment

No table, row, policy or migration was touched (`desktop_apps` row `notes` kept). This repo's review and preview now require the PL2 migration (`content_changes.site`, authored in PassLoop) to be applied live. **Do not deploy PL4 before PL2 is applied and PassLoop is live**, or /interview redirects to a site that does not exist yet. Set `NEXT_PUBLIC_PASSLOOP_URL` in Vercel if the URL differs from the fallback. Earlier local migrations (S1-S3, C4, SQL, notes visuals) stay NOT applied and belong to PassLoop's sequence. PassLoop's tables are no longer in this repo's weekly export; PassLoop's own export must cover them.

## Verification (Linux copy, secret-free)

Typecheck passed; unit plus database suite 101 files, 946 tests passed; one production build and assert-static passed (no Next advisory). `next start` smoke: `/interview`, `/interview/sql/notes`, `/notes`, `/practices`, `/behavioral` return 308 to PassLoop; home, about, projects, articles and resources return 200 with the PassLoop link.

**Not run:** browser specs. Chromium is not installed in the sandbox (one attempt: 2 passed, 13 failed to launch). Edited specs (desktop, home, feedback, home-polish4, experience-preview, content-review-badge) are unverified in a browser.

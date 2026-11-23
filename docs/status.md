# Current state

## Implementation

PassLoop S1-S3 are implemented locally. `/interview/system-design/<slug>?tab=solution|quiz|whiteboard` shows an owner-managed question: PassLoop rail, collapsible question column, flag/done for signed-in users, sticky "On this page" TOC, Markdown solutions with ```table-schema cards and ```diagram blocks, and a quiz (attempts per account or visitor localStorage, no AI hint). S2 adds the whiteboard at `/interview/system-design/<slug>/whiteboard` (Excalidraw 0.18.1, lazy client-only chunk): code-built template frames, twelve-block library, timer, divider, autosave, phone note. S3 fills the left panel: step navigator (‹ ›, dots, category, interviewer question, instruction, target time) that selects and zooms to the step's template frame, text answers or browser-only Web Speech dictation (hidden when unsupported, with a one-line notice), "Compare with model answer" tick list ("You covered X of Y", no grading), "How to answer" and "Ask clarifying questions" tabs, and History: "Finish attempt" snapshots the board, answers, ticks and timer (account row, or last 3 in visitor localStorage); the drawer opens one read-only with "Restore to board". In-progress answers autosave in the browser only. Step shape is validated in TS and SQL. No question content is seeded (Tiny URL is S4).

## Database and pending content

**S3 migration `20261123220000_system_design_interview_steps.sql` (replaces the steps validator; own-row `system_design_attempts`), S2 migration `20261123210000_system_design_whiteboards.sql` (one own-row table) and S1 migration `20261123200000_system_design_questions.sql` are NOT applied live**: S1 adds three tables (questions, own-row quiz attempts, own-row flag/done), the draft apply function and a replacement `apply_content_change`. Readers tolerate the missing table (no questions). **C4 migration `20261123180000_interview_prep_links.sql` is also NOT applied.** Applied earlier: C1 `20261123123946` (remote `20261123125602`), P2/P3 `20261123110809`/`20261123110824`, Journey photos `20261121120427`, Project case studies `20261119233658`, Contact briefs `20261119150051`.

Pending reviews: email `78b3b527-19bb-41e3-ae94-7d6e355f7827`; Experience `9b27d9e7-c440-44c7-85ce-73c7c5f4d47e`; Technology `84c50b3d-2c18-4efd-90ac-cc18281ef9da`; CV `a2ba8b2f-0ebe-4e8f-9134-45b0bd7f5f07`; captions/highlights `478f314b-52dd-46b1-8202-5130a894d305`, `37b47db8-2872-4b2d-a5bd-c9c5b25e553a`. Six Contact copies and 23 earlier Storage objects remain approved for deletion, pending deployment/authenticated API access.

## Verification (S3, Linux sandbox copy)

Typecheck clean. Full suite 1,526 passed / 152 files (967 unit in 109 files, 559 database/policy in 43 files; new: step model, checklist, draft, history, frame focus, dictation helpers, panel/history UI, history actions, attempt policy tests, tightened step validator). One production build passed (no Next advisory), `assert-static` and `assert-excalidraw-bundle` passed (Excalidraw only in the whiteboard route's lazy loader).

**Not run:** the browser specs (`tests/e2e/system-design-whiteboard.spec.ts`, including the new S3 test) and all other Playwright specs: no Chromium in the sandbox (the spec's esbuild bundle now builds with `conditions:['production']`; the launch fails). Run them on the Mac. No live database operation, secret access, commit or push.

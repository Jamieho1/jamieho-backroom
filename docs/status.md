# Current state

## Implementation

Projects pages redesign is implemented locally. /projects is “Selected Work”: header with public-project count, single-select capability chips (All + the five What I build items, animated, empty state, `?capability=01`–`05` kept in the URL), a Featured block (two screenshots side by side, one, or the generated title card), a numbered list with a desktop-only cursor-following preview, and a “Have a project in mind?” band. /projects/[slug] is the case-study template: back link, hero, meta grid (empty cells hidden), screenshot carousel or title card, Markdown body with a sticky mini-index from its `##` headings, optional “How it works” diagram, Next project card with hover preview and the band. Both stay pre-rendered (ISR); What I build and project diagrams share `components/diagram.tsx`. The existing project editor is unchanged. Jamie deploys and verifies live.

Earlier local work stands: gold-border navigation controls, Hero → Creator → Background/Experience/Selected Work → What I build → Contact order, and the Contact brief form.

## Database and pending content

`20261119180000_project_case_studies.sql` (projects `capabilities`, `status`, `diagram` plus Content Drafts approval support) is tested locally and **NOT applied live**; it awaits Jamie’s “apply it”. Its draft sets (capabilities for five projects, Cyterly AI status, FinAI diagram) are **not inserted**: the exact SQL is in `../Media/Previews/projects-drafts-pending.sql`, to run only after the migration is applied. Until then the new pages render without capabilities, status or diagram.

`20261119090000_contact_briefs.sql` is applied live (remote `20261119150051`). Other pending draft sets await approval at /manage/review: email link `78b3b527-19bb-41e3-ae94-7d6e355f7827`, Experience order `9b27d9e7-c440-44c7-85ce-73c7c5f4d47e`, Technology `84c50b3d-2c18-4efd-90ac-cc18281ef9da`, CV bullets `a2ba8b2f-0ebe-4e8f-9134-45b0bd7f5f07`, caption/highlights `478f314b-52dd-46b1-8202-5130a894d305` and `37b47db8-2872-4b2d-a5bd-c9c5b25e553a`. Credly URLs await Jamie.

## Media

Six Contact media Storage copies and 23 earlier Storage objects remain approved for deletion, pending deployment of the new code and authenticated Storage API access; local files are already removed.

## Verification of this change

In an isolated secret-free copy: typecheck, all 1,139 unit/database tests (new: capability filter, URL parameter, diagram schema/layout, mini-index, page components, migration/policy/draft parity), production build and six-page static assertion passed; `git diff --check` clean; the pending draft SQL was applied to a disposable database and approved cleanly. Playwright specs (projects, home-polish4, publishing-preview updated) compile (334 tests listed) but were not run: no browser is installed here, so desktop/390px behaviour, visuals and the hover preview are unverified in a browser. No live data or schema change, commit or push.

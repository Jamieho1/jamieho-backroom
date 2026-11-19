# Current state

## Implementation

My story redesign is implemented locally. /about now follows the approved about-story mockup: MY STORY hero (About title as display headline, lede from the story intro, “N chapters · ~M min read”), a chapter reader built from the `## ` headings of site_sections.story (sticky gold-node rail with progress fill on desktop, “Chapter 0N / 0M” bar on phones, 680px column), tilted photo prints, pull quotes and 2×2 principle cards (a “Principles” chapter or a `### Principles` list), and the “Have a project in mind?” band with the shared pill. The story is currently empty, so visitors see only the hero, the About text and “More of the story is on its way.”; no placeholder boxes exist in code. /about stays pre-rendered (ISR) and Content Drafts previews of story or about changes still apply. How to write the story: architecture.md. Jamie deploys and verifies live.

Earlier local work stands: Projects pages redesign (Selected Work and case studies), gold-border navigation controls, Hero → Creator → Background/Experience/Selected Work → What I build → Contact order, and the Contact brief form.

## Database and pending content

`20261119180000_project_case_studies.sql` (projects `capabilities`, `status`, `diagram` plus Content Drafts approval support) is tested locally and **NOT applied live**; it awaits Jamie’s “apply it”. Its draft sets (capabilities for five projects, Cyterly AI status, FinAI diagram) are **not inserted**: the exact SQL is in `../Media/Previews/projects-drafts-pending.sql`, to run only after the migration is applied. Until then the new pages render without capabilities, status or diagram.

`20261119090000_contact_briefs.sql` is applied live (remote `20261119150051`). Other pending draft sets await approval at /manage/review: email link `78b3b527-19bb-41e3-ae94-7d6e355f7827`, Experience order `9b27d9e7-c440-44c7-85ce-73c7c5f4d47e`, Technology `84c50b3d-2c18-4efd-90ac-cc18281ef9da`, CV bullets `a2ba8b2f-0ebe-4e8f-9134-45b0bd7f5f07`, caption/highlights `478f314b-52dd-46b1-8202-5130a894d305` and `37b47db8-2872-4b2d-a5bd-c9c5b25e553a`. Credly URLs await Jamie.

## Media

Six Contact media Storage copies and 23 earlier Storage objects remain approved for deletion, pending deployment of the new code and authenticated Storage API access; local files are already removed.

## Verification of this change

In an isolated secret-free copy: typecheck, all 1,154 unit/database tests (new: chapter parsing, reading time, principles block, empty state, photo/pull-quote rendering, phone bar), production build and six-page static assertion (/about pre-rendered) passed; `git diff --check` clean. Playwright specs (story, story-preview with a new rail/jump/390px test) compile (338 tests listed) but were not run: no browser is installed here, so desktop/390px visuals, scroll highlighting and parallax are unverified in a browser. No live data or schema change, commit or push.

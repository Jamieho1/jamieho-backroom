# Recent work

Current state: [docs/status.md](docs/status.md). Selective context: [docs/README.md](docs/README.md).
Earlier dated history is preserved in [docs/archive/memory-through-2026-11-05.md](docs/archive/memory-through-2026-11-05.md); do not read routinely.

## 2026-11-06
- Replaced the outdated agent briefing with a sub-300-word entry point and focused docs for status, architecture, journey, security, operations and workflow. Archived previous MEMORY verbatim; shortened Claude's entry point.
- Reconciled current local code through b62d47a: Home v1.2 preview remains /journey; phone journey uses stills without video downloads. No application, migration or live changes. Documentation checks recorded in docs/status.md; no app tests rerun.

- Homepage change authorized 2026-11-06: journey moved to / with /journey redirect; no entry gate; supplied day/night hero artwork, subtle light animation, yellow display Welcome, top-to-floating navigation and separate site-logo home link; About/Techstack renames; removed desktop shortcut and fullscreen image growth. See docs/journey.md and docs/status.md. Switch on and app Close target /desktop. No migration/live change, commit or push. 517 unit/database tests and build/static checks passed; isolated desktop/390px E2E 121 passed, 3 existing skips with installed Chromium override. Previous docs edits retained.
- Final framing pass retained all hero characters on narrow desktops. Final build/static checks and focused browser rerun: 33 passed, 1 skip. Repeated full run had one intermittent pre-existing /about WebGL re-enable timeout, passing on focused rerun; documented in docs/status.md.
- Shortened hero-to-About scroll by about 59% (1.6 → 0.65 viewport heights), kept hero copy visible to 85% of the chapter to remove the empty tail. See docs/journey.md; no migration, deployment, commit or push.
- Timing follow-up validation: typecheck and 25 journey unit tests passed; whitespace clean.
- Hero readability discussion: proposed reserved top sky + compact glass description/social panel and clearer glass scroll cue; layout choice pending. Diagnosed local prerendered Cyterly shots list as empty; local PNG is not an uploaded public project screenshot. No code/content/media/database changes; docs updated, whitespace checked.
- Implemented approved top-sky glass hero, role/description parsing, Contact-derived YouTube/Instagram buttons and clickable glass scroll cue. Approved hero title/body updated live via MCP and verified; Contact links already matched. No schema migration. Cyterly live screenshots confirmed empty; supplied public image bundled as fallback, overridden by database screenshots, with no Storage upload/project-row write. Layout/image require deployment. Typecheck, 520 unit/DB tests, build/static checks and isolated desktop/390px suite passed (123 passed, 3 skips); docs/status.md records current state.

# Recent work

Current state: [docs/status.md](docs/status.md). Selective context: [docs/README.md](docs/README.md).
Earlier dated history is preserved in [docs/archive/memory-through-2026-11-05.md](docs/archive/memory-through-2026-11-05.md); do not read routinely.

## 2026-11-06
- Replaced the outdated agent briefing with a sub-300-word entry point and focused docs for status, architecture, journey, security, operations and workflow. Archived previous MEMORY verbatim; shortened Claude's entry point.
- Reconciled current local code through b62d47a: Home v1.2 preview remains /journey; phone journey uses stills without video downloads. No application, migration or live changes. Documentation checks recorded in docs/status.md; no app tests rerun.

- Homepage change authorized 2026-11-06: journey moved to / with /journey redirect; no entry gate; supplied day/night hero artwork, subtle light animation, yellow display Welcome, top-to-floating navigation and separate site-logo home link; About/Techstack renames; removed desktop shortcut and fullscreen image growth. See docs/journey.md and docs/status.md. Switch on and app Close target /desktop. No migration/live change, commit or push. 517 unit/database tests and build/static checks passed; isolated desktop/390px E2E 121 passed, 3 existing skips with installed Chromium override. Previous docs edits retained.
- Final framing pass retained all hero characters on narrow desktops. Final build/static checks and focused browser rerun: 33 passed, 1 skip. Repeated full run had one intermittent pre-existing /about WebGL re-enable timeout, passing on focused rerun; documented in docs/status.md.

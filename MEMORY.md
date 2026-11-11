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
- Corrected the hero per Jamie's clarification: artwork covers the full viewport, heading remains top, description/social glass sits below characters over the city. Applied focused UI UX Pro Max glass/contrast guidance; fixed CSS prefix ordering so standard backdrop blur survives the build, and prevented scroll-pill wrapping. No new database/content/migration changes; original public art unchanged. Current checks recorded in docs/status.md.
- Final full-background validation: 520 unit/DB tests, typecheck and build/static checks passed; focused browser suite 23 passed, 1 skip. One unrelated /about WebGL re-enable timeout remains intermittent in the broader run. Corrected glass samples exceed 4.5:1 in reviewed day/night states; no claim for untested states. Docs updated; no push/commit/deployment.

2026-11-06: Refined homepage introduction and scroll cue into coordinated navy glass with fine borders, muted gold and outline socials; full-background art/placement retained. Check passed (520 tests); focused browser checks 23 passed/1 existing skip. Local day/night desktop/phone previews reviewed. No database/migration changes; uncommitted, Jamie deploys/verifies.

2026-11-06: Added existing Contact LinkedIn link to homepage introduction with matching icon. Typecheck, content tests and build passed; no database/migration changes.

2026-11-06: Moved hero Welcome/name below the hands above introduction; removed displayed trailing period. Full-screen art retained, phone social spacing tightened. Typecheck/build passed; no database changes.

2026-11-06: Hero socials now use platform colours; fixed shared YouTube glyph white-on-white play triangle. Typecheck/build passed; no database/migration change.

2026-11-06: Raised hero heading halfway between fingertips and glass panel using responsive anchors. Build passed; no database/migration change.

2026-11-06: About grade hidden only in journey, text contrast strengthened and heading reduced; phone paragraph unclamped. 12 content tests/typecheck passed. Role wording live SQL rejected by automatic approval review; await explicit approval. Shorter heading choice pending; no database change.

2026-11-06: Jamie chose original About heading at reduced size and explicitly approved live role wording. Applied/verified slash removal in site_sections.about. No migration; cached page refresh/deploy needed.

2026-11-06: Enlarged hero Welcome/name and added local feathered navy contrast backdrop. Cyterly screenshot contains full dashboard with pan disabled, including still fallback. Typecheck/16 focused tests/build passed. No database changes.

2026-11-06: Softened daytime hero via reversible CSS colour grade; day heading navy/teal with pale halo, night light/gold on navy. Build passed; local responsive previews reviewed. Original media and database unchanged.

2026-11-06: Corrected overly pale day treatment: restored colour/depth with mild CSS grade and reduced heading halo. Night unchanged. Production build passed.

2026-11-06: Installed approved softer 1920×1080 landscape day hero as hashed WebP; removed CSS image grade. Portrait/night assets retained. Check passed (521 tests/build/static assertions); local previews reviewed. No database changes; uncommitted.

2026-11-06: Generated/installed matching 1920×1080 day/night landscape hero pair with extended detailed sky and larger aligned characters. Yellow/white editable heading restored above characters; lower intro unchanged. Existing phone portraits retained. Check passed (521 tests/build/static); focused browser checks 23 passed/1 existing skip, including updated artwork-selection check. No database/migration change.

2026-11-07: Added gold Schedule a call placeholder immediately after LinkedIn in hero (disabled; functionality deferred). Typecheck/build passed. No database change; uncommitted.

2026-11-08: Added subtle reading surfaces behind About/Projects/Experience/Creator pitch text, retaining geometry. Strong paragraph colour and no extra copy fade; responsive inset and reduced-transparency fallback. Local section previews checked; typecheck and final production build passed. No database changes.

2026-11-08: Replaced final Switch on CTA and desk copy with Contact Us monitor, social logos and existing contact form/action. Contact Us nav/direct anchors go to form; static fallback included. Check passed (521 tests/build/static), monitor previews fit desktop/phone; focused browser checks 23 passed/1 existing skip, including honeypot submission without inbox/email writes. No database/migration change.

2026-11-08: Retired /about and /desktop via redirects; shared Journey dropdown/Articles/Resources/Privacy navigation, visible Auto/Day/Night and gold auth buttons. Resources has generic blurred previews and existing-permission unlocks for Notes/Practice/Behavioral; app windows close there. No billing/DB change. Final check passed (517 tests/build/static); full E2E 115 passed/3 skips plus 10 final cross-page/theme/resource checks.

2026-11-09: Reduced Creator pitch heading across desktop/phone and static fallback; proposed “AI engineering, explained” awaits wording/live-content approval. No database/migration change. Production build and whitespace checks passed; no new browser-suite run.

2026-11-09: With explicit approval, saved Creator title “AI engineering, explained” live in site_sections.writing; database readback verified. Title only; no schema migration. Public cache refresh/rebuild needed; compact typography remains a local change.

2026-11-10: Left-aligned full top-bar links; centred floating bar retained, Journey hover/click and SVG chevron. Hero glass replaced with compact approved tagline/local scrim, buttons retained. Articles cover links/full-height sidebar, Cloud & Ink app palette, compact Notes/Practice/Resume sizing and sticky desktop Notes visuals. No database/migration change. Check passed (518 tests/build/static); final build and 38 affected desktop/phone browser checks passed. Docs updated; uncommitted, Jamie deploys/verifies.

2026-11-10: Raised hero tagline/buttons into the cloud bank and lowered Welcome/name toward the characters, with smaller phone offsets. Artwork unchanged. Production build/whitespace and local desktop/390px previews passed; no database/migration change or new full-suite run. Docs updated; Jamie deploys/verifies.

2026-11-11: Privacy, Articles, Notes, Practice, Resume & Stories and resource gates now use plain full-width pages under the root top bar, without window controls/backdrop. Privacy shares Resources Cloud & Ink; existing content, access checks/logging and internal scrolling retained. Projects/Settings remain windows. Also clipped an existing static-hero scrim overflow and updated obsolete hero tests. Check passed (518 tests/build/static); full browser run 124 passed/3 skips with remaining stale hero assertion corrected and both focused hero checks passing. Docs updated; no database/migration/deployment, commit or push.

2026-11-11 CI recheck: supplied failures match committed legacy glass-card assertions and pre-fix phone overflow. Verified pending local fixes against a full isolated browser rerun: 125 passed, 3 existing skips. No new code changes; docs updated. Fixes still need Jamie’s commit/push before CI can run them.

2026-11-11: Projects list/detail/manage now share the plain Resources-style shell/palette. Added direct Projects link to top/floating bars; Journey showcase renamed Work, preserving #projects and project content. Typecheck, 518 unit/DB tests (maxWorkers=2 after local setup timeouts), build/static and full browser suite (125 passed/3 existing skips) passed. No database/migration/deployment, commit or push. Docs updated.

2026-11-11: Fixed Articles index hiding the sidebar post list behind currentId. Latest posts now shows on index and detail pages with existing filters/newest-first data/eight-at-a-time paging. Typecheck, 13 article UI tests, build and 8 Articles desktop/phone checks passed. No database/migration change; docs updated, uncommitted.

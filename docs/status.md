# Current state

Updated 2026-11-06 from local code and Git history; baseline `b62d47a`. The working tree was clean before this documentation change. No fresh production, Notion or remote database verification.

- R1 foundation shipped; Notes, Practice, Behavioral, Articles and owner management exist. Old AGENTS ticket statuses were stale; consult the specific Notion ticket before changing its status.
- Jamie authorized moving the journey onto `/` on 2026-11-06. Implemented locally: `/journey` redirects home; direct entry without a start screen, illustrated hero, top-to-floating navigation, About/Techstack labels and no fullscreen image growth. Deployment and live verification remain pending.
- Recent code includes project pages/editor/showcase, Experience timeline, Toolkit/certification badges, Creator, booking CTA, text/image motion and desktop line geometry.
- Latest commit implements TKT-96: phones use day/night portrait wallpaper, desk and monitor stills; no journey video downloads. Desktop has no motion toggle; homepage Privacy is linked from the arrival bar. Reduced-motion/no-JS reading remains.
- Existing records confirm older migrations through `20261102194339_resume_sections.sql` applied. Local SQL for article categories/images, home-media, Now and projects exists; remote application is unverified in this review. See security before deployment involving these.
- Domain/subdomain SSO remains a follow-up; purchase status is unverified. Production deployment, final media checks and current ticket sign-offs require evidence.

## Latest change

2026-11-06: homepage cutover and presentation changes implemented; supplied public wide artwork encoded as hashed WebP. Existing app routes and auth gates retained; Switch on/Close lead to /desktop. Documentation reorganization from earlier this session retained. No schema/live data changes or migrations applied. No commit/push/deployment or ticket Done claim.

Validation: 517 unit/database tests, typecheck, production build and static assertions passed. Clean-copy browser suite using installed Chromium: 121 passed, 3 existing skips at desktop/390px. Initial configured-build tests exposed old placeholder assumptions; clean copy excludes all .env files. Pinned Playwright browser is absent locally, so verification used a temporary executable override without changing repository config. Docs link/word-count and whitespace checks passed.

Final framing verification: production build/static checks passed again; focused homepage/profile browser tests 33 passed, 1 existing skip. One older /about WebGL re-enable test timed out in the repeated full run (120 passed, 3 skips), then passed in the focused rerun; no unrelated runtime change made. Automated 1280px/390px framing reviewed.

2026-11-06 follow-up: shortened hero-to-About travel from 1.6 to 0.65 viewport heights (about 59% less) on desktop and phone; retained hero text through most of that shorter chapter. No migration/deployment changes. Typecheck, 25 affected journey tests and whitespace checks passed; full browser suite was not rerun for this timing-only follow-up.

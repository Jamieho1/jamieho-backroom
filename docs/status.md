# Current state

Updated 2026-11-07. Local changes remain uncommitted and undeployed; Jamie pushes and verifies production.

- Home is /; /journey redirects there. Direct arrival, 0.65-viewport hero, top-to-floating navigation; chapter labels About and Techstack. No fullscreen section-image growth.
- Latest hero: matching generated day/night 1920×1080 landscape art, detailed extra sky above larger characters, shared framing/scale. Yellow Welcome and white name are editable HTML above the characters. No CSS colour grading or pale heading halo. Existing phone portraits remain.
- Lower navy glass panel holds role, description and YouTube/Instagram/LinkedIn links. Brand colours/icons restored, YouTube play triangle visible. Gold Schedule a call placeholder follows LinkedIn; disabled, no scheduling action yet. Full-viewport artwork retained.
- About: original title at reduced size, stronger paragraph contrast, no phone truncation. Grade hidden only in journey display; stored resume unchanged.
- Live content confirmed: approved hero copy and About slash-removal applied through Supabase MCP. Contact contains supplied social URLs. Direct database edits require ISR refresh/rebuild to update cached public output.
- Cyterly: live screenshot list empty; supplied approved public WebP is an empty-list fallback. Owner screenshots override it. Preview uses contain with no vertical pan, including still fallback. No Storage upload/project-row change.
- Existing app routes/auth/RLS/editors retained. Desktop stays /desktop. Phones download no journey clips; desktop keeps room/monitor clips. Reduced-motion/no-JS fallbacks retained.
- No new schema/migration, dependency, push or deployment. Historical migration status unchanged; domain/subdomain SSO and ticket sign-offs still need evidence.

## Validation

Latest matching-sky revision: npm run check passed (typecheck, 521 unit/database tests, build and static assertions). Configured local day/night desktop and phone previews reviewed. Focused browser checks: 23 passed, 1 existing skip; the artwork-selection check was updated for the new filenames and passed on desktop and phone. Earlier full browser run had an unrelated /about WebGL re-enable timeout.

2026-11-07 placeholder button: typecheck and production build passed. No database/migration/dependency changes.

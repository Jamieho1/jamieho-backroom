# Current state

Updated 2026-11-06; baseline 4e69257. Implementation below is local unless explicitly described as live. Jamie pushes and verifies production.

- Journey lives at /; /journey redirects home. Direct arrival, day/night artwork, top-to-floating navigation, About/Techstack labels, no fullscreen section-image growth. Hero-to-About is 0.65 viewport heights.
- Latest UI: approved top-sky glass introduction with role/description, Creator-style YouTube/Instagram buttons, and a larger clickable glass scroll cue. Desktop reserves sky above the complete artwork; phones use portrait art.
- Live content: approved hero title/body saved to site_sections.hero through Supabase MCP and verified. Contact already contains the supplied social URLs. Direct database edits do not trigger page revalidation; deployment/rebuild or normal ISR refresh is needed to show new copy.
- Cyterly: live screenshot list confirmed empty. Supplied public screenshot is bundled under public/project-art and used only as an empty-list fallback. Owner screenshots take precedence. Image/layout require Jamie's deployment; no image uploaded to Storage or project record changed.
- Existing app routes, auth/RLS and owner editors retained. Desktop remains /desktop. Phones download no journey clips; desktop retains room/monitor clips. Readable reduced-motion/no-JS paths remain.
- No new schema/migration, dependency, commit, push or deployment. Older migration application records unchanged; newer historical remote state remains unverified. Domain/subdomain SSO and current ticket sign-offs require evidence.

## Validation

Typecheck, 520 unit/database tests, production build and static assertions passed. Isolated desktop/390px browser suite: 123 passed, 3 existing skips, using installed Chromium via temporary override. Local configured screenshots reviewed at 1280/1920/390 widths. Documentation/whitespace checks performed. Previous timing edits and docs changes retained; live visual review pending.

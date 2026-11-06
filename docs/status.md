# Current state

Updated 2026-11-06; baseline 4e69257. Implementation below is local unless explicitly described as live. Jamie pushes and verifies production.

- Journey lives at /; /journey redirects home. Direct arrival, day/night artwork, top-to-floating navigation, About/Techstack labels, no fullscreen section-image growth. Hero-to-About is 0.65 viewport heights.
- Latest refinement: full-background hero retained. Introduction and scroll cue now share navy glass, fine borders, small radii and gold accents. Description is left aligned; social links use platform-coloured buttons. Desktop/phone daylight sampled description contrast exceeds 6.6:1.
- Live content: approved hero title/body saved to site_sections.hero through Supabase MCP and verified. Contact already contains the supplied social URLs. Direct database edits do not trigger page revalidation; deployment/rebuild or normal ISR refresh is needed to show new copy.
- Cyterly: live screenshot list confirmed empty. Supplied public screenshot is bundled under public/project-art and used only as an empty-list fallback. Owner screenshots take precedence. Image/layout require Jamie's deployment; no image uploaded to Storage or project record changed.
- Existing app routes, auth/RLS and owner editors retained. Desktop remains /desktop. Phones download no journey clips; desktop retains room/monitor clips. Readable reduced-motion/no-JS paths remain.
- No new schema/migration, dependency, commit, push or deployment. Older migration application records unchanged; newer historical remote state remains unverified. Domain/subdomain SSO and current ticket sign-offs require evidence.

## Validation

Glass redesign: npm run check passed (520 unit/database tests, typecheck, production build and static assertions). Local configured desktop/day and phone/day/night previews reviewed; sampled description contrast: 6.77:1, 6.66:1 and 10.37:1 respectively. Focused desktop/phone browser checks: 23 passed, 1 existing skip. Prior complete browser run had one unrelated /about WebGL re-enable timeout. No new database, migration, dependency, commit, push or deployment changes. Jamie verifies production.

2026-11-06: Homepage introduction now includes LinkedIn beside YouTube/Instagram, using the existing Contact URL and matching platform-coloured icon button. Typecheck, journey-content tests and production build passed. No database change.

2026-11-06: Welcome/name moved below the pointing hands, above the introduction. Display strips trailing full stop without changing stored content. Phone social spacing tightened to fit the three links. Typecheck and final production build passed; local desktop/phone previews reviewed. No database/migration change.

2026-11-06: Restored platform colours to hero social buttons. YouTube glyph now has a red body and white play triangle, correcting white-on-white rendering wherever reused. Typecheck and production build passed; no database/migration change.

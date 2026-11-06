# Home journey

Current route: /. Jamie authorized the cutover on 2026-11-06; /journey redirects to /. Arrival opens directly with no entry gate. Hero scroll is 0.65 viewport heights (previously 1.6); its text stays until 85% of that chapter, avoiding an empty pause before About. Active sources: lib/journey/chapters.ts and content.ts; renderer components/journey/journey.tsx. Later Home v1.1/v1.2 decisions supersede the original all-landmarks journey and clickable-room plan.

Sequence: sky → About/Imperial → Projects showcase → Experience/Westminster → Techstack/certifications → Creator → black join → desk Now/contact → monitor “Switch on”. Copy and featured records bind from public database content; empty sections are handled by content binding. Do not invent personal claims or clients.

The hero uses the approved day/night wide artwork, portrait variants on phones, with a subtle moving light veil; figures and artwork remain rigid. Narrow desktop screens contain the full art with matching sky above to avoid clipping outer characters. No c1 video downloads. Desktop videos are limited to c7a/c7b room/monitor. Middle chapters use authored sections, framed images, project screenshots and text motion; Techstack uses an exploded stack. Framed images no longer grow fullscreen at hand-over. Decorative Three.js lines skip phones/reduced motion. Scroll orchestration must preserve reading, pause/reverse and fallback access.

TKT-96 phone mode at max-width768px: portrait day/night opening, c7a-last.jpg desk, c7b-last.jpg monitor/CTA, no clip downloads. Timing is in lib/journey/phone.ts. Reduced-motion/no-JS uses readable HTML/stills. The hero retains Welcome/name/description and Scroll to discover, without a desktop shortcut. Welcome uses larger yellow display type. Navigation starts as a top bar; after the hero it becomes a floating capsule beside the separate circular site logo. Numbering starts at 01 About; the logo returns to the hero. Theme/account/Privacy links remain in the arrival bar. Switch on and closing app windows lead to /desktop.

Media is external to Git: local public/home-media/ is ignored; live home-media Storage bucket is configured through NEXT_PUBLIC_HOME_MEDIA_URL. Raw inputs live in sibling Media/. lib/journey/media-manifest.json and public/media-sw.js provide hash-addressed caching. After media replacement regenerate scripts/home-media/manifest.mjs and coordinate upload; old encoding documentation lists unused historical clips.

Day art keeps warm sky/cloud tones; night uses softer muted contrast. Preserve character identity; portrait editions are recompositions. Generated image sources/prompts are outside Git in the chat visualization folder.

Legacy room modules and Resources plans may describe unused hotspots; they are not evidence of current UI. Read the active renderer before modifying navigation.

Hero readability (2026-11-06): approved top-sky placement, smaller name, compact glass role/description/social panel, with reserved artwork clearance. Hero body uses first paragraph as bold role and following paragraph as description; a one-paragraph body remains supported. Copy stays in site_sections.hero; YouTube/Instagram actions reuse Contact links. The larger glass scroll pill is a keyboard-accessible link that jumps to About.

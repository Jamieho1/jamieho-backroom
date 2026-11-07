# Home journey

Current route: /. Jamie authorized the cutover on 2026-11-06; /journey redirects to /. Arrival opens directly with no entry gate. Hero scroll is 0.65 viewport heights (previously 1.6); its text stays until 85% of that chapter, avoiding an empty pause before About. Active sources: lib/journey/chapters.ts and content.ts; renderer components/journey/journey.tsx. Later Home v1.1/v1.2 decisions supersede the original all-landmarks journey and clickable-room plan.

Sequence: sky → About/Imperial → Projects showcase → Experience/Westminster → Techstack/certifications → Creator → black join → desk Now/contact → monitor “Switch on”. Copy and featured records bind from public database content; empty sections are handled by content binding. Do not invent personal claims or clients.

The hero uses a matching generated 1920×1080 day/night landscape pair with extended detailed sky above larger characters, and existing portrait variants on phones, with a subtle moving light veil; figures and artwork remain rigid. The art covers the full viewport on desktop and phone; do not shrink it or reserve a separate sky band. Cover cropping is intentional. No c1 video downloads. Desktop videos are limited to c7a/c7b room/monitor. Middle chapters use authored sections, framed images, project screenshots and text motion; Techstack uses an exploded stack. Framed images no longer grow fullscreen at hand-over. Decorative Three.js lines skip phones/reduced motion. Scroll orchestration must preserve reading, pause/reverse and fallback access.

TKT-96 phone mode at max-width768px: portrait day/night opening, c7a-last.jpg desk, c7b-last.jpg monitor/CTA, no clip downloads. Timing is in lib/journey/phone.ts. Reduced-motion/no-JS uses readable HTML/stills. The hero retains Welcome/name/description and Scroll to discover, without a desktop shortcut. Welcome uses larger yellow display type. Navigation starts as a top bar; after the hero it becomes a floating capsule beside the separate circular site logo. Numbering starts at 01 About; the logo returns to the hero. Theme/account/Privacy links remain in the arrival bar. Switch on and closing app windows lead to /desktop.

Journey clips remain external to Git; approved public wallpaper WebPs are tracked. Local public/home-media/ is ignored; live home-media Storage bucket is configured through NEXT_PUBLIC_HOME_MEDIA_URL. Raw inputs live in sibling Media/. lib/journey/media-manifest.json and public/media-sw.js provide hash-addressed caching. After media replacement regenerate scripts/home-media/manifest.mjs and coordinate upload; old encoding documentation lists unused historical clips.

Day art keeps warm sky/cloud tones; night uses softer muted contrast. Preserve character identity; portrait editions are recompositions. Generated image sources/prompts are outside Git in the chat visualization folder.

Legacy room modules and Resources plans may describe unused hotspots; they are not evidence of current UI. Read the active renderer before modifying navigation.

Hero layout (2026-11-06): yellow Welcome and white name sit in the upper sky in both themes, above the characters. Text stays HTML and omits a trailing full stop. No pale halo or CSS image colour grade. Day/night landscape editions share framing and character scale; art covers the viewport with identical positioning. Existing portrait assets remain on phones. HeroArtwork references hashed dayHero/nightHero WebPs; Resources/Desktop - Asset Manifest.json records dimensions/hash. Desktop-scene layered art remains separate to preserve its alignment.

Role, description and socials stay over the city in a navy glass panel. Introduction and clickable scroll cue use fine borders, small radii and gold accents; 5px backdrop blur. Keep prefixed backdrop-filter before the standard property. Social buttons use YouTube red, Instagram purple/pink and LinkedIn blue with visible brand glyphs; destinations come from Contact. Personal copy stays database-managed. UI UX Pro Max guidance informed the glass refinement; no dependency added.

About retains its original heading at reduced size, solid-ink paragraph and untruncated phone text. Education classification is omitted only from the journey display; source resume is unchanged. Approved live role wording update removed the slash from site_sections.about and was verified.

Cyterly screenshots use contain without vertical panning in the live showcase and still fallback. Other project screenshot behaviour is unchanged.

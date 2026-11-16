# Home journey

The canonical route is `/`; `/journey` redirects home. Arrival opens directly on the cloud hero, with no entry gate. Active sources: `lib/journey/chapters.ts`, `content.ts`, `timeline.ts`, `phone.ts`; renderer `components/journey/journey.tsx`; styling `app/journey.css`.

## Chapters and navigation

Order: Hello (`sky`) → About (`about`) → Experience (`experience`) → Work (`projects`) → Techstack (`toolkit`) → Creator (`creator`) → black join → room → monitor Contact Us (`screen`). Empty data-driven sections are skipped. The shared chapter definitions drive desktop, phone and server-rendered stills.

`#about` is canonical. `#pivot` remains an alias in scroll calculations, initial/hash-change handling and native still/no-JS anchors. `/about` renders the My story editorial page. Contact hashes `#home-contact`, `#screen` and legacy `#desk` reach the monitor form. Schedule a call skips directly to that form. Theme changes preserve the current scroll position rather than replaying the URL hash.

Top and floating bars: Journey disclosure → My story (`/about`) → Projects → Interview Prep → Articles → Resources. Journey lists About, Experience, Work, Techstack, Creator and Contact Us as chapter jumps; absent chapters are omitted on Home. The logo returns to the hero. Navigation starts left-aligned at the top and becomes centred/floating after the hero. The disclosure supports hover, click, keyboard, Escape and outside dismissal. Phone links can wrap without horizontal overflow. Privacy remains in the Contact form; the review badge, feedback, icon Auto/Day/Night cycle and account controls are retained.

## Rendering and motion

One scroll owner: Lenis smooths native scrolling; ScrollTrigger reports progress; one animation loop draws chapters and text. Reverse scrolling retraces the same state. Section images do not grow fullscreen at hand-over. Decorative Three.js wireframes are limited to Work (torus) and Creator (helix); phones/reduced motion skip them. About uses the photo constellation described below. Experience uses the curve below. The old photo strip, Westminster still and timeline dots are not rendered.

The hero uses matching 1920×1080 day/night landscape artwork with extended sky and consistent character scale, plus portrait variants on phones. Artwork covers the viewport; characters remain rigid, with a subtle moving light veil. Yellow Welcome and white name sit above the characters; compact tagline/social buttons sit in the lower clouds on a local radial scrim. Text remains HTML. The clickable glass scroll cue leads to About. Hero scroll length is 0.65 viewport heights; text holds through 85%. No opening video is downloaded.

Work selects featured public projects (maximum four); owner screenshots override the supplied Cyterly fallback. Cyterly uses contain without panning. Techstack uses the existing exploded stack and public certificate badges. Creator retains its compact pitch, latest-media cards and equal-width social buttons; YouTube has a white tile/red triangle, Instagram a gradient and LinkedIn its blue styling. Copy/destinations come from public content loaders, never private fixtures.

Room arrival and monitor push-in retain their footage/keyframes. Fade/room/monitor lengths are 0.4/1.4/0.8 viewport units; room reaches its last frame only at chapter end. Contact display holds through 28% and fades by 52%. The monitor reveals the existing Contact form/social links; validation, honeypot, rate limits, Inbox, alerts and privacy link are unchanged.

At ≤768px, phone mode uses portrait hero artwork, c7a-last.jpg desk and c7b-last.jpg monitor, without clip downloads. Phone room/monitor lengths are 0.35/0.6 viewport units. Reduced-motion/no-JS rendering uses ordered HTML/stills, readable content, native anchors and the same Contact form.

## Media and data

Journey media remains outside Git: ignored `public/home-media/` locally, public home-media Storage configured by NEXT_PUBLIC_HOME_MEDIA_URL live. Approved wallpaper WebPs are the limited tracked exception. `media-manifest.json` and `public/media-sw.js` provide hash-addressed caching; replacement assets require manifest regeneration/upload coordination. Raw media lives in sibling Media/.

About photos are read from public about_photos through getAboutPhotos; Experience uses getJourneyStops; its artwork remains in Storage for TKT-115. This work generates/uploads no media. `lib/home-content.ts` provides About-photo/journey-stop loaders with owner-only draft overlays. Story is a fixed section key; TKT-110b starter proposals await Jamie’s approval (current IDs/state in status.md).

Owner preview uses verified Next Draft Mode and immutable snapshots before public filtering. Gold outlines follow canonical About/Experience/Work bindings; copied cookies confer no access. Public rendering remains static/ISR. Approve/Discard reuse the existing transaction and clear preview; normal editors and data ownership are unchanged.

## About constellation

`components/journey/about-constellation.tsx` renders in both the live engine and StillJourney. The database About title uses Barlow Condensed (system narrow fallbacks), uppercase except a lowercase italic connector between capitalised words. The existing first-paragraph binding supplies Markdown with links disabled. Read my story is a pill link to the editorial /about page. No education metadata or personal copy is added in code.

`lib/journey/constellation.ts` purely selects public photos, centre first then sort/UUID, capped at twelve. Without a marked centre the first ordered photo leads. Placement takes count and board dimensions: one centre, fewer than five a centre plus short row, five to twelve an even ring; tilt stays within ±6°. The board draws a faint circle and curved SVG connectors. Images use database alt/caption text and mediaUrl’s home-media manifest hashes; no personal photos enter Git. Changed preview photos/section retain gold markers.

GSAP quick setters drift only the board transform with pointer and the existing reversible chapter progress; the component creates no new scroll clock. Motion is desktop/no-preference only and cleaned up on unmount/preference changes. At ≤768px, the centre sits above an internally swipeable print row with captions beneath; short viewports can scroll the About content before handing wheel travel back to the main journey. Each photo is keyboard-focusable; dark captions appear on desktop hover/focus, and are visible in touch/reduced-motion/no-JS views. Still rendering is the finished layout without drift.

## Experience curve

Home reads getJourneyStops(preview): public, opted-in CV rows in chronological order, at most three public bullets per entry. experienceStops keeps the newest five when necessary and appends Projects; sparse data never fabricates entries. The pure experience-curve.ts layout returns wave positions/path and reversible progress; isPresent matches dates ending in present, ignoring case. Eight original inline icons share a rounded stroke, including the merging streams/plug icon. Entry/bullet draft markers survive composition without changing preview authorization or publishing rules.

ExperienceCurve holds within the existing desktop stage. One scroll clock draws the SVG stroke, highlights the reached stop and shows its title/organisation/dates/bullets card; keyboard focus reveals each card and retains the Projects link while focus moves into it. The current-role ring pulses gently. Projects links to #projects through existing hash navigation. Long cards can scroll within the section, handing wheel travel back at their edges.

On phones, a measured, naturally scrolling section sits at the Experience track offset; its actual height sets that chapter’s travel distance. Each card follows its stop on a vertical curve, without a pinned hold or clip downloads. StillJourney renders all cards and the completed line; responsive segments keep the vertical path on no-JS phones. Reduced motion disables drawing/pulsing. The section stays plain in current light colours with an empty experience-art-layer reserved for TKT-115. No artwork upload, migration or live content write is part of the curve.

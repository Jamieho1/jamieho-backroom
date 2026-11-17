# Home journey

The canonical route is `/`; `/journey` redirects home. Arrival opens directly on the cloud hero, with no entry gate. Active sources: `lib/journey/chapters.ts`, `content.ts`, `timeline.ts`, `phone.ts`; renderer `components/journey/journey.tsx`; styling `app/journey.css`.

## Chapters and navigation

Order: Hello (`sky`) → Background (`about`) → Experience (`experience`) → Work (`projects`) → Techstack (`toolkit`) → Creator (`creator`) → black join → room → monitor Contact Us (`screen`). Empty data-driven sections are skipped. The shared chapter definitions drive desktop, phone and server-rendered stills.

`#about` is canonical. `#background` and `#pivot` remain aliases in scroll calculations, initial/hash-change handling and native still/no-JS anchors. `/about` renders the My story editorial page. Contact hashes `#home-contact`, `#screen` and legacy `#desk` reach the monitor form. Schedule a call skips directly to that form. Theme changes preserve the current scroll position rather than replaying the URL hash. Leaving Home through a same-tab site link marks only that history entry; browser Back clears its old chapter hash and returns to clouds after router scroll restoration. Explicit incoming chapter links still work.

Top and floating bars: Journey disclosure → My story (About `/about`, Projects `/projects`) → Content (Articles `/articles`, Resources `/resources`) → Interview Prep. Journey lists Background, Experience, Work, Techstack, Creator and Contact Us as chapter jumps; absent chapters are omitted on Home. The JH mark returns to the hero. Both additional disclosures reuse Journey’s hover/click/keyboard/Escape behavior, with current-page highlights. Navigation starts left-aligned at the top and becomes centred/floating after the hero. The disclosure supports hover, click, keyboard, Escape and outside dismissal. Phone links can wrap without horizontal overflow. Privacy remains in the Contact form; the review badge, feedback, icon Auto/Day/Night cycle and account controls are retained.

## Rendering and motion

One scroll owner: Lenis smooths native scrolling; ScrollTrigger reports progress; one animation loop draws chapters and text. Reverse scrolling retraces the same state. Section images do not grow fullscreen at hand-over. Decorative Three.js wireframes are limited to Work (torus) and Creator (helix); phones/reduced motion skip them. About uses the photo constellation described below. Experience uses the curve below. The old photo strip, Westminster still and timeline dots are not rendered.

The hero uses matching 1920×1080 day/night landscape artwork with extended sky and consistent character scale, plus portrait variants on phones. Artwork covers the viewport; characters remain rigid, with a subtle moving light veil. Yellow Welcome and white name sit above the characters; compact tagline/social buttons sit in the lower clouds on a local radial scrim. Text remains HTML. The clickable glass scroll cue leads to About. Hero scroll length is 0.65 viewport heights; text holds through 85%. No opening video is downloaded.

Work selects featured public projects (maximum four); owner screenshots override the supplied Cyterly fallback. Multiple screenshots use the shared horizontal scroll-snap carousel with native touch scrolling, keyboard arrows, buttons and dots; reduced motion changes slides immediately. One screenshot remains static and contained; inactive project frames are inert. The same carousel is present in phone/static Work. Existing project case-study screenshots are already static, so their gallery stays unchanged. Techstack uses the existing exploded stack and public certificate badges. Creator retains its compact pitch, latest-media cards and equal-width social buttons; YouTube has a white tile/red triangle, Instagram a gradient and LinkedIn its blue styling. Copy/destinations come from public content loaders, never private fixtures.

Room arrival and monitor push-in retain their footage/keyframes. Fade/room/monitor lengths are 0.4/1.4/0.8 viewport units; room reaches its last frame only at chapter end. Contact display holds through 28% and fades by 52%. The monitor reveals the existing Contact form/social links; validation, honeypot, rate limits, Inbox, alerts and privacy link are unchanged.

At ≤768px, phone mode uses portrait hero artwork, c7a-last.jpg desk and c7b-last.jpg monitor, without clip downloads. Phone room/monitor lengths are 0.35/0.6 viewport units. Reduced-motion/no-JS rendering uses ordered HTML/stills, readable content, native anchors and the same Contact form.

## Media and data

Journey media remains outside Git: ignored `public/home-media/` locally, public home-media Storage configured by NEXT_PUBLIC_HOME_MEDIA_URL live. Approved wallpaper WebPs are the limited tracked exception. `media-manifest.json` and `public/media-sw.js` provide hash-addressed caching; replacement assets require manifest regeneration/upload coordination. Raw media lives in sibling Media/.

About photos are read from public about_photos through getAboutPhotos; Experience uses getJourneyStops and the three approved Experience WebPs from Storage; no new media is generated or uploaded. `lib/home-content.ts` provides About-photo/journey-stop loaders with owner-only draft overlays. Story is a fixed section key; The approved photo/journey lists feed the public sections; current content state is summarised in status.md.

Owner preview uses verified Next Draft Mode and immutable snapshots before public filtering. Gold outlines follow canonical About/Experience/Work bindings; copied cookies confer no access. Public rendering remains static/ISR. Approve/Discard reuse the existing transaction and clear preview; normal editors and data ownership are unchanged.

## About constellation

`components/journey/about-constellation.tsx` renders in both the live engine and StillJourney. The database About title uses Barlow Condensed (system narrow fallbacks), uppercase except a lowercase italic connector between capitalised words. The existing first-paragraph binding supplies Markdown with links disabled. Read my story is a pill link to the editorial /about page. No education metadata or personal copy is added in code.

`lib/journey/constellation.ts` purely selects public photos, centre first then sort/UUID, capped at twelve. Without a marked centre the first ordered photo leads. Placement takes count and board dimensions: one centre, fewer than five a centre plus short row, five to twelve an even ring; tilt stays within ±6°. A layered warm-gold/cool-blue radial atmosphere fills the About background without new image downloads; the editorial /about page uses a theme-compatible version of the same wash. The board draws a faint circle and curved SVG connectors. Images use database alt/caption text and mediaUrl’s home-media manifest hashes; no personal photos enter Git. Changed preview photos/section retain gold markers.

GSAP quick setters drift only the board transform with pointer and the existing reversible chapter progress; the component creates no new scroll clock. Motion is desktop/no-preference only and cleaned up on unmount/preference changes. At ≤768px, the centre sits above an internally swipeable print row with captions beneath; short viewports can scroll the About content before handing wheel travel back to the main journey. Each photo is keyboard-focusable; dark captions appear on desktop hover/focus, and are visible in touch/reduced-motion/no-JS views. Still rendering is the finished layout without drift.

## Experience curve

Home reads getJourneyStops(preview): public, opted-in CV rows in chronological order, at most three public bullets per entry. experienceStops keeps the newest five when necessary and appends Projects; sparse data never fabricates entries. The pure experience-curve.ts layout returns wave positions/path and reversible progress; isPresent matches dates ending in present, ignoring case. Eight original inline icons share a rounded stroke, including the merging streams/plug icon. Entry/bullet draft markers survive composition without changing preview authorization or publishing rules.

ExperienceCurve holds within the existing desktop stage. One scroll clock draws the SVG stroke, highlights the reached stop and shows its title/organisation/dates/bullets card; keyboard focus reveals each card and retains the Projects link while focus moves into it. Clicking a stop or activating it with Enter/Space scrolls the existing desktop journey clock to that stop; the mascot, drawn path and card arrive together in either direction. The current-role ring pulses gently. Projects links to #projects through existing hash navigation. The pinned heading and curve stay below navigation; only long cards scroll within their measured remaining viewport space, handing wheel travel back at their edges.

On phones, a measured, naturally scrolling section sits at the Experience track offset; its actual height sets that chapter’s travel distance. Each card follows its stop on a vertical curve, without a pinned hold or clip downloads. StillJourney renders all cards and the completed line; responsive segments keep the vertical path on no-JS phones. Reduced motion disables drawing/pulsing. The section uses the approved artwork described below. No migration or live content write is part of the curve.

## Experience artwork and chapter containment

experience-bg.webp, experience-mascot.webp and experience-phone.webp use mediaUrl, manifest SHA-256 prefixes and the unchanged media service worker. Their bytes match the approved local WebPs; ignored public/home-media copies support local development, never Git. The manifest script accepts an explicit filename list to merge only those entries, preserving unrelated hashes; its full rebuild also supports WebP.

Desktop Experience renders the background behind the entire section, with a small reversible vertical drift and bounded cover scale. A whole transparent character stands above the curve: its foot anchor follows the same native SVG arc length as the drawn stroke, offset 44px above each stop centre. The compact layout reserves space above the circles for the 88px character, keeping more room for the reading card. There is no mesh deformation, pointer response or independent animation clock. Pixel-rounded stop arrivals snap line/character/highlight together symmetrically. Resize recomputes the guide; keyboard focus previews cards without moving; activation synchronizes selection with scroll progress.

Media-specific preload links fetch background/mascot only at desktop widths and the single 9:16 still on phones. Picture sources prevent downloading hidden desktop layers on phones. The phone image reserves its aspect ratio above the vertical curve; no moving layers or clips. Reduced motion/no JS show the complete line/cards, a stationary background and the mascot at the guide midpoint. Decorative image failure retains the section’s light surface.

Each live chapter isolates and clips its descendants so neighbouring artwork cannot paint over its background. About explicitly resets its legacy panel translation to 0 0; using none was removed by the production CSS optimiser and left the inherited upward translation active. Its heading, paragraph and constellation now remain together inside the opaque light section throughout transitions.

## Home v1.3 verification coverage

The release gate covers full unit/database and desktop/390px browser suites plus the disposable real-migration integration suite. Home gate fixtures exercise photo/entry/bullet/Story gold outlines, anonymous draft isolation, approval invalidation, exact featured Work selection and Volunteer tags. Reduced-motion and no-JS runs cover / and /about; static Work retains the same project tags as the animated showcase. Canonical/legacy About hashes, Journey dropdown, My story and Contact hand-offs remain covered.

Experience’s root clips rather than scrolls, so its full-height artwork and explicit ink-coloured heading cannot move beneath navigation. The current card receives a measured maximum height and its own scroll area on desktop; phone/static cards retain natural flow. Long-copy tests wait for the section handover before measuring, then verify the heading/background remain fixed while the card scrolls. About’s CSS atmosphere preserves readable ink, existing photo positions and static/reduced-motion rendering; it introduces no new media or content.

# Home journey

The canonical route is `/`; `/journey` redirects home. Arrival opens directly on the cloud hero, with no entry gate. Active sources: `lib/journey/chapters.ts`, `content.ts`, `timeline.ts`, `phone.ts`; renderer `components/journey/journey.tsx`; styling `app/journey.css`.

## Chapters and navigation

Order: Hello (`sky`) → About (`about`) → Experience (`experience`) → Work (`projects`) → Techstack (`toolkit`) → Creator (`creator`) → black join → room → monitor Contact Us (`screen`). Empty data-driven sections are skipped. The shared chapter definitions drive desktop, phone and server-rendered stills.

`#about` is canonical. `#pivot` remains an alias in scroll calculations, initial/hash-change handling and native still/no-JS anchors. `/about` still redirects to `/#pivot` until the My story page ships. Contact hashes `#home-contact`, `#screen` and legacy `#desk` reach the monitor form. Schedule a call skips directly to that form. Theme changes preserve the current scroll position rather than replaying the URL hash.

Top and floating bars: Journey disclosure → My story (`/about`) → Projects → Interview Prep → Articles → Resources. Journey lists About, Experience, Work, Techstack, Creator and Contact Us as chapter jumps; absent chapters are omitted on Home. The logo returns to the hero. Navigation starts left-aligned at the top and becomes centred/floating after the hero. The disclosure supports hover, click, keyboard, Escape and outside dismissal. Phone links can wrap without horizontal overflow. Privacy remains in the Contact form; the review badge, feedback, icon Auto/Day/Night cycle and account controls are retained.

## Rendering and motion

One scroll owner: Lenis smooths native scrolling; ScrollTrigger reports progress; one animation loop draws chapters and text. Reverse scrolling retraces the same state. Section images do not grow fullscreen at hand-over. Decorative Three.js wireframes are limited to Work (torus) and Creator (helix); phones/reduced motion skip them. About and Experience retain readable text panels only: the old photo strip, Westminster still and timeline dots are not rendered. Their replacement constellation/curve layouts are separate tickets.

The hero uses matching 1920×1080 day/night landscape artwork with extended sky and consistent character scale, plus portrait variants on phones. Artwork covers the viewport; characters remain rigid, with a subtle moving light veil. Yellow Welcome and white name sit above the characters; compact tagline/social buttons sit in the lower clouds on a local radial scrim. Text remains HTML. The clickable glass scroll cue leads to About. Hero scroll length is 0.65 viewport heights; text holds through 85%. No opening video is downloaded.

Work selects featured public projects (maximum four); owner screenshots override the supplied Cyterly fallback. Cyterly uses contain without panning. Techstack uses the existing exploded stack and public certificate badges. Creator retains its compact pitch, latest-media cards and equal-width social buttons; YouTube has a white tile/red triangle, Instagram a gradient and LinkedIn its blue styling. Copy/destinations come from public content loaders, never private fixtures.

Room arrival and monitor push-in retain their footage/keyframes. Fade/room/monitor lengths are 0.4/1.4/0.8 viewport units; room reaches its last frame only at chapter end. Contact display holds through 28% and fades by 52%. The monitor reveals the existing Contact form/social links; validation, honeypot, rate limits, Inbox, alerts and privacy link are unchanged.

At ≤768px, phone mode uses portrait hero artwork, c7a-last.jpg desk and c7b-last.jpg monitor, without clip downloads. Phone room/monitor lengths are 0.35/0.6 viewport units. Reduced-motion/no-JS rendering uses ordered HTML/stills, readable content, native anchors and the same Contact form.

## Media and data

Journey media remains outside Git: ignored `public/home-media/` locally, public home-media Storage configured by NEXT_PUBLIC_HOME_MEDIA_URL live. Approved wallpaper WebPs are the limited tracked exception. `media-manifest.json` and `public/media-sw.js` provide hash-addressed caching; replacement assets require manifest regeneration/upload coordination. Raw media lives in sibling Media/.

The three existing About photos and Experience artwork remain in Storage for later layouts; this ticket generates/uploads no media. `lib/home-content.ts` provides About-photo/journey-stop loaders with owner-only draft overlays. Story is a fixed section key; TKT-110b starter proposals await Jamie’s approval (current IDs/state in status.md).

Owner preview uses verified Next Draft Mode and immutable snapshots before public filtering. Gold outlines follow canonical About/Experience/Work bindings; copied cookies confer no access. Public rendering remains static/ISR. Approve/Discard reuse the existing transaction and clear preview; normal editors and data ownership are unchanged.

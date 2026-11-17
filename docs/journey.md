# Home journey

`/` is canonical; `/journey` redirects home. Arrival opens the cloud hero directly. Public content remains cookie-free static/ISR; verified owner Draft Mode overlays request-local snapshots with gold outlines. Text is HTML, never baked into artwork. Sources: `lib/journey/{chapters,content,timeline,dial,phone}.ts`, `components/journey/journey.tsx`, `home-dial.tsx`, `app/journey.css`.

## Chapters and navigation

Hello → one Background/Experience/Selected Work dial → Techstack → Creator → black join → room → monitor Contact. The later “What I build” redesign is not implemented; only its navigation label changes. The Journey dropdown is Background, Experience, Work, What I build, Creator, Contact. My story (About/Projects), Content (Articles/Resources), Interview Prep and existing account/theme/feedback/review controls remain unchanged.

`#background`, `#about`, `#pivot` reach dial step zero; `#experience` the first opted-in entry; `#work`, `#projects` the first featured project. Dial index buttons and screenshot dots seek the same parent clock. Compact and native still anchors clear the navigation. Contact aliases `#home-contact`, `#screen`, `#desk` reach the monitor form. Schedule a call skips directly there. Browser Back from another same-tab page returns to clouds; explicit incoming chapter links still work. Theme changes preserve scroll instead of replaying hashes.

## Dial

The approved editorial surface is navy `#1B2333`, off-white `#F3EEE6` and gold `#E8C46A`, independent of theme. CSS/SVG supplies grain, fading dot grid, clipped outlined JAMIE HO watermark behind the dial, rotating tick rings, a divider, index rail, coordinates, gold caption leader tags and corner metadata. There is no new dependency or animation clock.

Step zero binds the About title, first paragraph (links disabled) and Read my story link. Public photos use centre-first/sort/UUID selection, capped at twelve; the chosen centre stays central, others occupy the ring. Captions and alt text remain database-managed. `background-photos.ts` also supplies the title connector treatment to the editorial Story page.

Experience uses `getJourneyStops`: public opted-in entries, chronological then sort/UUID, at most three public nonblank sorted bullets. All stops extend the dial; no artificial Projects CV stop is appended. Education shows the graduation photo, other roles the existing original inline line icons, drawn from scroll progress. Side photos slide/fade out; present entries pulse. Coordinates distinguish Imperial, Hong Kong and London. Organisation, dates, location, title and bullets retain preview markers.

Selected Work uses every featured public project in sort order. Text includes name, tagline, optional explicit highlights (maximum three), tags, code-mapped capability links and conditional Visit/Case study links. Body Markdown is never mined for highlights. A final All projects link follows the last project. Projects have no status field, so no fabricated status is displayed.

Shared `ScreenshotCarousel` uses macOS traffic lights and the first image’s ratio. Known ratios reserve Cyterly at 1899×952 and DataKind at 4:3; load-time natural dimensions refine other images. The enlarged browser frame occupies the inner dial, with page-driven horizontal scrubbing, reversible motion and dots seeking that same clock. Different later image ratios contain within the first frame; single images stay still. Cyterly’s supplied pixels have no baked border and remain unchanged.

One Lenis/ScrollTrigger/rAF owner drives desktop progress. At ≤900px the dial becomes measured natural-flow stacked steps inside the journey track; other chapters retain their existing phone rules. Reduced-motion/no-JS views use the same complete stacked content, native screenshot swipe rows/dots, fully drawn icons and native anchors. Long desktop copy can scroll internally; inactive cards and visuals are inert. Dynamic 3–8-stop fixtures cover matching text/visual/index, reverse motion, anchors, screenshot scrubbing, bounded columns and compact layouts.

## Unchanged surrounding chapters

The full-viewport day/night hero artwork, rigid subtle animation, HTML Welcome/name, social buttons and glass scroll cue remain. Hero travel is 0.65 viewport heights. Techstack retains its existing exploded layers/public certificates. Creator keeps the helix, compact pitch, latest-media cards and equal-width branded social links. Room/monitor footage and Contact form preserve their timings, validation, honeypot, rate limiting, Inbox, email alerts and privacy link. At ≤768px those video chapters use approved stills without clip downloads.

## Media and rollout

Journey photos/media stay outside Git: ignored local `public/home-media/`, live home-media Storage via NEXT_PUBLIC_HOME_MEDIA_URL. Manifest hashes and the existing media service worker remain for retained assets. Personal photos are never copied into Git.

The retired curve/mascot and former standalone Work/constellation implementations and tests are removed, including the three Experience manifest entries and local Experience-art folder. Storage objects `home-media/experience-bg.webp`, `experience-mascot.webp`, `experience-phone.webp` were listed and have no database content references, but remain pending deletion after Jamie deploys the replacement: current live code still requests them. No Storage object has been deleted prematurely.

Project highlights require `20261117183223_project_highlights.sql` (NOT applied live). The public reader selects the available row shape so deployment remains compatible before that additive migration. Approve/preview reuse the existing owner-only Content Drafts boundary; highlights drafts require the migration and new code before approval. Current pending proposal IDs and verified checks are in status.md.

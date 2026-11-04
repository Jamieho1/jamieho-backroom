# Desktop revision 2 — plan and design review

Date: 2026-11-03. **Planning/preview only. No website implementation yet.** Jamie asked to agree the design before changing code. Baseline implementation is local commit `4e79264`; a local commit does not establish live deployment status. This plan supersedes the earlier top-bar-only shortcuts, blurred ambient edges, covered-window scene disposal and public Motion toggle as future design requirements, not as claims of completed work.

## Later scope change under discussion

The latest decisions and first complete proposal are in `Resources/Home - London Journey Plan.md`. Exterior side-launcher/standalone About Me requirements here are superseded: pages open via the room monitor and close to the desk. Keep this document as earlier evidence and read the new plan before implementation.

Jamie has requested that the separate About Me design become a continuous main-page London journey. See `Resources/Home - London Journey Discovery.md`. The new request defers internal app redesign, retains earlier desktop/functionality requirements unless explicitly superseded, and requires discussion before a final plan, media generation or implementation. This revision-2 document is retained as requirement history; its old About Me entry/arrival flow must not be implemented blindly.

## Confirmed choices

- Jamie selected **Cloud & Ink** (cool blue-grey/navy) on 2026-11-03. The other palettes remain comparison references.
- Social destinations must be the same ones already used by Articles. Articles calls `socialLinks(sections.contact.body)` from `lib/social.ts`; the Contact Markdown is the existing source of truth. Reuse that result and the existing `/social/` icon assets for LinkedIn, YouTube and Instagram in that order. Keep the parser's host validation/deduplication and safe new-tab attributes. Do not create a second hard-coded profile list or ask Jamie to resend the URLs.

## Requested result

Keep the illustrated London desktop visible around every open app, with its original central composition and new detailed sky/city at the top and sides. Side shortcuts return. The top bar remains, with reorganized Practice navigation, social links, Privacy and a small inset. Window/app colours move away from the pale yellow palette.

## Artwork and placement

- Preserve the approved original day/night masters as the central layers. Generate only extra London rooftops, riverside city detail and clouds to the left/right, plus sky/cloud headroom above. No stretching, horizontal mirroring or blurred edge fills. No new portrait, bot, scarf or central city reconstruction.
- Pin the existing composition to the current reference desktop coordinates; additional artwork fills the space outside those bounds. Extra top sky accommodates the inset bar without moving the characters/city down. Use one world-to-viewport mapping for both modes and all landmark/UI anchors. Clip unused outer extension for other desktop aspect ratios while keeping the original centre visible; a portrait phone layout needs a separate fit, not desktop stretching.
- Built-in image generation produced two **edge studies**, not pixel-identical master replacements. The generator redraws some central details even with preservation instructions. Its generated centres must NOT replace the approved centre. The independent preview composites the supplied original images as a protected central layer above the edge studies, with only a narrow outer seam overlap feathered. Preview images are compressed for conversation display; full original PNGs stay unchanged. Seam refinement, full-resolution edge calibration and layer compatibility remain implementation work after approval.
- Keep all title/intro/invitation text, shortcuts and buttons as real UI. `lib/desktop-introduction.ts` remains the editable copy source; text is not baked into art.
- Add Articles and Projects buttons just left and right of the Shard. They follow the scene coordinate mapping, avoid its silhouette and use the real `/articles` and `/projects` links.

## Navigation and desktop chrome

- Top bar proposed inset: 8 px from the top and side edges; gently rounded corners. Keep current brand, session/theme controls and general layout. No translucent vertical backplates below desktop icons.
- Restore individual permitted side shortcuts: About Me FIRST at top-left, then Projects, Articles, Notes, Practice and Resume & Stories as access permits. Only the TOP BAR groups the three practice-related apps.
- Top-bar Practice disclosure contains Notes, Coding Practice and Resume & Stories (Behavioral). Preserve app IDs, canonical routes, RLS-filtered visibility, client navigation, account-change cache behavior and app-open recording. Hide inaccessible children and an empty parent; never hard-code private permissions.
- Retarget the independent Check Here cue/curly arrow to the first SIDE About Me shortcut, not the top-bar About Me link. Give the side target a distinct identifier so duplicate navigation links cannot confuse the anchor.
- Add LinkedIn, YouTube and Instagram icons immediately left of Settings. Reuse the existing Articles social configuration: `socialLinks(sections.contact.body)` from `lib/social.ts`, filtered to LinkedIn/YouTube/Instagram. Read it through the existing public section path; actual profile URLs stay in the Contact content. External links use a new tab with noopener/noreferrer. No new click collection is proposed.
- Privacy becomes a top-bar link. Remove its bottom-right floating button and all public Motion on/off/Still-view controls. Motion starts by default when supported; system reduced motion and hidden-tab suspension remain internal behavior.
- Phones keep an app grid and readable controls, with no page-width overflow at 390 px. Notes/Practice retain their own resizable panel behavior inside the shared window.

## Open windows and persistent scene

Source inspection explains the reported change: `DesktopBackdrop` currently treats an open app as covered, disposes the graphics instance and exposes the still poster. The animated version also repairs/extracts areas differently from the original poster. Blur is explicitly supplied by `.desktop-ambient`. Route/theme state changes can therefore switch compositions even though the intention was to save resources.

- Mount one persistent desktop scene outside routed app content. Opening About Me, Projects, Articles, Practice or another app changes the foreground window only. It must not recreate the scene, change its art/camera crop, reset boat/figure/Eye time or show the old static plate.
- Keep rendering the visible wallpaper around windows. Pause only for actual hidden/offscreen state as appropriate, not merely because an app is open. Keep native still/no-WebGL fallback coherent with the same composition.
- Starting window geometry for review: centred, maximum width about 1440 px, at least 112–128 px side room on normal desktops, roughly 20–24 px bottom gap, and roughly 20–24 px below the inset bar. At 1920 px this gives approximately 240 px side gaps. Treat these as adjustable review values. Window height follows the viewport, not content length; scrolling belongs inside the app. A larger-window action still retains a small desktop border.
- Preserve Notes/Practice internal layout/resizing and app draft retention. Shared outer window margins apply consistently; narrow screens use smaller gaps.

## Motion, Eye and theme transition

- Remove pointer-driven actor/sun displacement. Keep automatic gentle up/down whole-character floating. The current whole owner and whole overlapping robot ensemble remain rigid groups so no bot is sliced apart. Independent per-bot motion would require separate unobstructed assets and is not included in this request.
- Keep slow ship traffic, moving daylight rays/clouds/birds and the agreed localized night rain/purple lightning.
- Rebuild the Eye's mechanical attachment: fixed hub/A-frame; rim/spokes rotate; every cabin has an explicit rim attachment and its body offset below that attachment, with orientation counter-rotated to remain level. Correct the current fixed-radius upright sprites that appear detached. Check top, side and bottom quarters of the full rotation with close-up captures in BOTH modes. Geometry continuity alone is not a visual acceptance test.
- One shared motion clock survives app/theme changes. Stage the new theme's required textures before switching; crossfade the complete aligned scene for about 450–600 ms while chrome colours transition together. No left/right wipe, blur filter, split frame, empty canvas or poster swap. Verify slow/cold texture loads and rapid repeated theme toggles. A renderer-wide blend is appropriate if per-texture mixing cannot keep the complete composition synchronized.
- Add a high-contrast approximately 32 px hand cursor with a correct fingertip hotspot. Keep text-selection, drag/resize and disabled cursors meaningful. Do not tie figure motion to the pointer or replace the pointer with a lagging DOM follower.

## Selected colour direction and comparison references

All three avoid a yellow-tinted app background and pure-white reading panels. Accents are for actions/selection, not full search-field fills. Colour token changes should cover shared windows, title bars, menus, neutral inputs/search, cards, borders, links and buttons throughout the apps. Existing content/editor layouts remain functional.

| Direction | Light window / chrome | Dark window / chrome | Action accent (light / dark) | Character |
| --- | --- | --- | --- | --- |
| Cloud & Ink — selected by Jamie | `#E8EDF4` / `#DCE5EF` | `#172637` / `#101E2E` | `#315E9B` / `#8BBBE9` | Cool blue-grey and navy; matches sky and moonlight |
| Silver & Graphite | `#E9ECEF` / `#DCE0E5` | `#22262F` / `#171B23` | `#5A61A6` / `#B2B8F1` | Quiet neutral surfaces with restrained indigo |
| Sea Glass & Teal | `#E2ECEA` / `#D1E0DC` | `#19332F` / `#122622` | `#327465` / `#8DC7B1` | Muted natural green-blue; more colour in the chrome |

Compare the same open window and same artwork across directions. The preview exposes palette/side-gap/bottom-gap controls and local day/night/app navigation. The intro name/cue show on the closed-window desktop; open apps reveal the same artwork around their window. It is not production app data or a demonstration that final animation issues are fixed.

## Delivery order after design approval

1. Refine the new borders using the original centre as the permanent master and review edge joins/window gaps. Cloud & Ink and the Articles social source are already confirmed; no URL input is needed.
2. Static desktop layout first: full-width art, inset bar, side shortcuts/arrow, Practice disclosure, socials, Privacy and Shard buttons. Review desktop and 390 px views, including a window open/closed.
3. Persist the scene across routes, remove pointer coupling/public motion tools and correct Eye mechanics. Keep existing autonomous effects. Review an actual code recording showing a full capsule circuit, app navigation and day/night changes; no generated-video substitute.
4. Implement synchronized theme crossfade and hand cursor; apply the chosen surface tokens across apps.
5. Run typecheck/unit/DB/build/static checks, permission/navigation and desktop/phone browser regression tests, and targeted graphics lifecycle/Eye/cold-load transition checks. Jamie commits/pushes and verifies live. No ticket becomes Done before his live confirmation.

No schema, migration, secret, dependency update, public-content import or new data collection is expected. Any newly discovered database change must follow the existing separate approval rule.

## Preview locations and evidence

All preview images/source remain OUTSIDE Git:
`/Users/jamieho/.codex/visualizations/2026/10/31/01a19242-e170-7603-bb68-be12ae48066b/london-desktop-revision-two/`

- `extended-day-study.png`, `extended-night-study.png`: generated edge concepts; central redraw is not accepted.
- `reference-day.png`, `reference-night.png`: exact copies of the supplied centre masters.
- `london-desktop-colours.html`: conversation mockup with protected original centre and palette/window-gap options.
- `generation-spec.json`: full prompts and built-in image-generation mode.
- `preview-payload.json`: image hashes, geometry and compressed display copies.
- `preview-verification.json` and local screenshots: final preview checks, once completed; MEMORY.md records outcomes.

Technical references consulted for the plan: [MDN View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API) and [MDN cursor](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/cursor). The supplied PostHog screenshot is the visual layout reference; no live website/browser/computer UI was controlled.

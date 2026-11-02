# Desktop introduction — art direction, 2 November 2026

Status: revised rigid whole-character proof built on 2026-11-02, awaiting Jamie’s visual review. The first deformation-based proof was rejected for making figures look compressed. Production code, initial route behavior and wallpaper have not changed. The user confirmed the intended first arrival is the desktop introduction; About Me opens when clicked. Do not replace the detailed artwork with the earlier simplified motion-study characters.

## Revised visual direction

- Preserve the near-touching Creation of Adam pose from the first concept, with a fully clothed animated owner avatar based on the user-supplied identity reference.
- The main articulated bot remains the reaching partner. A varied ensemble of cute user-selected bot interpretations occupies the right cloud group: Claude-style orange pixel bot, ChatGPT-style cream plush character, Gemini-style blue furry character, Grok-style white round character and the supplied colorful Muse-style crew. These are creative reference-based interpretations, not assertions of official mascot designs.
- Use realistic clouds, fine fur/fabric/metal textures, and an original high-oblique aerial London panorama beneath the foreground subjects. Requested landmarks: Westminster/Parliament and Elizabeth Tower, London Eye, Shard, London Bridge, Tower Bridge, City towers and Canary Wharf. The bridge pictured by the user is Tower Bridge. The composition artistically compresses landmarks into one readable panorama; it is not a surveyed geographic view.
- Updated by Jamie on 2026-11-02: ALL app shortcuts, including Settings, belong in the TOP BAR. The artwork has no side icon columns or solid rectangular rails. The About Me invitation points to the top-bar app, leaving every character face/hand clear.
- Keep the right-side name/introduction clear of bot faces. Production typography and shortcuts must be real responsive UI rather than text baked into the wallpaper.
- Day: warm sunlit clouds, realistic Thames reflections, city revealed through cloud openings. Night: the same layout/identity/poses with a moon, illuminated London/river, subtle bot lights, rain and subdued distant cloud illumination.

## Candidate animation score — proposed, not implemented

| Layer | Candidate motion |
| --- | --- |
| Foreground clouds | Slow right-to-left drift on a seamless 90–150 second repeat, staggered layers and feathered edges; reveal/re-cover London through deliberate openings. |
| Sunlight | Predictable soft 120–180 second lighting sweep; light intensity changes subtly, avoiding a whole-scene camera tilt. |
| Owner avatar | Rigid movement of the ENTIRE fixed-pose figure. Head, body, limbs and clothes stay together; no image warping, compression or independent head deformation. |
| Bots | Main robot and scarf move as one rigid figure. The overlapping companion group moves together in the current proof so their shapes/occlusions stay intact. Separate per-bot movement requires proper independent assets later. No waving deformation. |
| Thames/city | Restrained water shimmer and reflection movement; landmark structures remain stable. |
| Night rain | Fine depth-separated rain, with reduced visibility around reading/icon areas. |
| Distant lightning | One soft, localized cloud glow on an occasional deterministic schedule (candidate 45–80 seconds), not a whole-screen strobe or repeated burst. No automatic thunder audio. Disabled with reduced motion and pause. |
| Pointer | Visible outlined arrow and restrained halo; real pointer responsiveness, no sluggish delayed click point. Native text/drag cursors remain available over app content. |

Suggested construction: approve the full-resolution composition, then build a clean layered asset pack with London, background/foreground cloud layers, owner/individual bot layers and weather/light masks. Use Three.js for depth/compositing and weather/water effects and GSAP timelines for coordinated repeatable motion. Small articulated movements need segmented/deformable character assets; larger new poses or camera changes require properly rigged 3D models. A flat screenshot alone cannot deliver independent joint movement. Verify a representative crop with motion before claiming a visual-fidelity percentage or integrating the full desktop.

Quality: the current generated concepts are each 1672×941 pixels. They establish composition/materials and are not verified high-density production masters. Prepare/verify target-display-resolution assets before deployment, with sharp real UI text. Use an explicit mobile recomposition rather than shrinking the entire desktop to unreadable sizes. Pause hidden/covered animation, offer a still/reduced-motion view, and keep app access/navigation unaffected.

## Preview assets — outside git

- Day: `/Users/jamieho/.codex/generated_images/01a19242-e170-7603-bb68-be12ae48066b/exec-a1436ef9-f5c1-47ae-a7f3-f02c2f72c746.png`
- Night: `/Users/jamieho/.codex/generated_images/01a19242-e170-7603-bb68-be12ae48066b/exec-5a0cd4e7-5745-41ce-9a2d-959216200d03.png`
- Full prompts/reference manifest: `/Users/jamieho/.codex/visualizations/2026/10/31/01a19242-e170-7603-bb68-be12ae48066b/desktop-london-v2-manifest.json`
- Preserved supplied references: sibling `desktop-london-v2-references/`. Personal avatar imagery stays outside git. Stock London images are architectural references only; generated concepts use an original composed panorama, not cleaned/reused stock photography.

Tooling references: [Three.js materials](https://threejs.org/docs/#api/en/materials/Material), [Three.js animation](https://threejs.org/docs/#api/en/animation/AnimationMixer), [GSAP Timeline](https://gsap.com/docs/v3/GSAP/Timeline/). Earlier licensed rain/particle/cursor/reference sources remain in the preceding MEMORY entry. No third-party models/source have been incorporated into the site.

Next review: approve/refine the revised composition and the character ensemble, then produce a representative layered animated crop at the intended display resolution. No new ticket, migration or deployment has started.


## First animated proof — superseded, do not integrate

Jamie rejected its weighted image deformation because it made the owner and AI look wavy/compressed. Use the rigid revision below.

Jamie clarified that “99%” means preserving the dense visual detail and finish. The implementation uses the cleaned full artwork as its source, rather than replacing it with simple 3D models.

- Standalone interactive file (all libraries/assets embedded, opens offline without a server): `/Users/jamieho/.codex/visualizations/2026/10/31/01a19242-e170-7603-bb68-be12ae48066b/london-animation-proof/index.html`.
- Actual code capture, 16 seconds (8 day / 8 night), 1280×764, 24 fps: sibling `day-night-proof.mp4`.
- Cleaned 1672×941 day/night plates and transparent cloud bank: sibling `assets/`; built-in image generation source prompts and checksums: `asset-manifest.json`. Personal imagery remains outside git.
- Fixed orthographic Three.js image compositor, twelve independently phased GSAP-driven actor regions and an anchored hand-connection area. Characters use small feathered image-space deformations: this is a fidelity/motion proof, not a complete segmented character asset pack or full 3D rig. Existing cloud painting stays baked in the base; an additional transparent cloud layer drifts above the city. Revealing city detail hidden in the original painting needs a fuller clean background plate in the subsequent asset pass.
- Separate moving cloud layer, repeating sunlight, restrained river refraction, animated rain and localized night cloud glow. Real UI text, reused existing icon SVGs and all app shortcuts in the top bar. About Me opens only on click. App contents are explicitly labelled navigation placeholders in the proof.
- Review controls: Day/Night, Pause, Still reference and Movement strength. Still reference bypasses deformation/weather/lighting and reproduces the clean source. Verified maximum channel difference is 1 out of 255 at 1440×810 (mean 0.0004204) against a browser-rendered copy of the clean master. This measures renderer reproduction, not a 99% metric against the earlier generated concept.
- Independent movement and fixed camera verified; pause, covered-window pause, reduced motion, no-WebGL still fallback, context loss/restoration, day/night navigation and 390 px layout checks pass with zero JavaScript errors and zero external HTTP requests. Desktop/phone screenshots and JSON reports are in the proof folder. A dedicated portrait composition and high-density masters remain production follow-ups.

Next: Jamie reviews the actual movement/detail using the standalone file/video. Integrate only after that review; no production code, routes, permission logic or migrations changed for this proof.


## Rigid revision — latest review version

Jamie clarified on 2026-11-02 that a character must move as a whole, with no waves/compression. All actor UV deformation and separate head/scarf motion have been removed.

- Interactive: `/Users/jamieho/.codex/visualizations/2026/10/31/01a19242-e170-7603-bb68-be12ae48066b/london-animation-proof-rigid/index.html`.
- Actual 24-second video: sibling `day-night-proof.mp4` (1280×764, 24 fps, 576 frames; 12 seconds day and 12 seconds night). Updated for the river-traffic extension below.
- Three textured rigid layers: whole owner; whole main robot/scarf; whole overlapping companion ensemble. The primary figures have a shared small carrier movement and rotate about fingertip-area pivots. The companion group moves separately while preserving all its internal overlaps. Every layer scale is fixed at (1,1,1); the camera stays fixed.
- Built-in image generation supplies empty day/night cloud plates and aligned transparent character/edge assets. Original master interior detail is sampled where aligned; extracted edge colours avoid moving pieces of the old sky with a figure. Upper cloud background is filled naturally as figures move, with the lower London panorama retained from the original master. No photo figure is rebuilt from primitive geometry. Source/pose edges still require visual review; no literal 99% comparison is claimed.
- `rigidity-verification.json`: 30 combinations of time, strength and day/night; maximum length/determinant error 2.22e-16, orthogonality error zero. Unit scale throughout. No shear/compression/stretch.
- Rendering/still comparison, independent primary-layer motion, pause, covered-window pause, context loss/restoration, no-WebGL fallback, reduced motion, 390 px layout, zero remote HTTP requests and zero JS errors verified. Day/night screenshots and decoded video frames reviewed. The reference-mode pixel comparison still matches the clean master within one channel level; it is not a metric for the revised cutout/background composition.
- Assets and exact generation prompts/checksums are in sibling `asset-manifest.json`; all art/code remains outside Git. The previous proof is retained only for comparison. No website source, data, migration or deployment change.

Await Jamie’s review of this corrected movement before integration. Do not reintroduce weighted image deformation for the figures.


## River traffic — current rigid proof extension

Jamie requested slow ships on the Thames, with gradual departures and new arrivals. The latest rigid proof now includes four original-art boat sprites on three bounded open-water routes: two staggered eastbound vessels, a smaller westbound commuter and a foreground vessel below Westminster Bridge. Hulls retain the source artwork and move as rigid units. The character technique is unchanged.

- Travel speed is approximately 2–3 native image pixels per second. Voyages last 108–154 seconds, with eight-second arrivals, nine-second departures and short empty intervals before a different hull enters. Journeys are staggered. The 24-second preview includes the foreground departure and replacement.
- Small procedural wakes follow each stern. Fragmented reflections follow the boats at night; their original night lighting is retained. Routes finish in open water before bridges/banks rather than passing over structures.
- Two generated clean-water plates supply only small feathered repairs at the original hull/wake locations. Outside these patches, the detailed London panorama remains sampled from the original masters. Reference masters remain untouched. Sources, full prompts and checksums are in the proof's asset-manifest.json.
- The shared scene clock freezes traffic when paused, covered, hidden or offscreen. Day/night changes lighting without resetting progress. Reduced motion, Still reference and graphics fallback use the original static master. No new network calls, storage or data collection.
- Local ship checks cover 218 visible hull-waterline samples across 360 seconds, safe open-water routes, slow speeds, transparent departure/replacement, theme continuity, identical paused frames, covered-window freeze and reduced motion. Existing rendering/reference, 390 px, rigid-character, context-loss and fallback checks pass. Reports: ship-verification.json, verification.json, rigidity-verification.json and behavior-verification.json.

This remains the standalone review proof in london-animation-proof-rigid/, outside Git. Await Jamie's visual review before website integration. No application source, database, migration, deployment or ticket status changed.

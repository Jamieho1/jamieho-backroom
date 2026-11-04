# Room interaction addition

Confirmed new intent from Jamie on 4 November 2026: after the London/train journey, arrive in the room and allow an exploration stop before approaching the monitor. Physical objects such as a CD and iPad can open different pages; more desk and wall objects can be added later. Exact CD/iPad destinations have not been chosen. This is a planning addition, not an implemented UI.

## Room states

Arrival leads into the stable frame-02 exploration composition. Give visitors time to inspect objects; no timer pushes them automatically into the monitor. Offer a clear Continue to screen action/monitor target and permit the agreed scroll progression without trapping the user. A deliberate monitor selection advances through frames03-05 to real page content. A visible Back to room/Close action returns to the exploration view, preserving the existing close-to-desk agreement. Direct app navigation must continue to skip the London tour and reuse room/monitor state.

CD and iPad actions lead to owner-selected destinations, not invented ones. Until assigned they should not be presented as working links. Suggested future targets are the two left wall frames, a shelf book or another intentional desk object; each requires Jamie's choice of purpose and destination. Do not silently map the CD to music or iPad to Articles.

## Extensible object registry

Store each target separately from its artwork: stable id, accessible label, action type, destination/app id, permission gate, enabled state, camera state, and an anchor. For a still scene use normalised coordinates/polygon relative to the image plus the actual responsive object-fit transform; for real geometry use a world-space anchor. Recalculate at each viewport/crop. Active hit areas must align with the physical object and be disabled/inert when camera movement or another state hides it. Do not leave a wide-view hit area active over a zoomed screen.

Existing visible objects can gain/change destinations without repainting the background. A genuinely NEW visible object still needs a separate image layer, 3D asset or revised scene art; a registry alone cannot insert pixels. For easy future additions prefer independently anchored layers/geometry with consistent shadows and permission checks, rather than baking every new object into every camera frame. Recheck all affected positions and screen crops.

Use real keyboard-focusable buttons/links and subtle discoverable hover/focus cues, with accessible names and an equivalent object list on phones/keyboard. Do not rely only on hidden invisible click zones or a special mouse cursor. New app actions reuse canonical routes/access checks and real app-open logging; no extra analytics collection is implied. Screen content and forms stay real HTML and reuse the existing contact backend, not baked screenshots.

## Status and next review

Only five reference stills and this plan exist now. No hotspots, new pages, persistent configuration, image-to-video motion or website integration has been implemented. Confirm CD/iPad destinations, preferred discoverability cues and interaction-vs-scroll behaviour before the coding stage. Review geometry continuity before production; monitor proportions differ slightly between generated keyframes and must be locked during motion refinement.

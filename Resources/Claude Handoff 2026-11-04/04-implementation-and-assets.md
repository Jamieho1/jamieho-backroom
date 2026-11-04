# Implementation and asset handoff

Prepared for Jamie Ho on 4 November 2026. This document explains what exists, what remains to build and how to continue safely. The four-document export is a planning handoff with selected visual references. Application source, private data, credentials and a final film are not included.

## Repository and project rules

Actual repository: /Users/jamieho/Documents/Developer/Personal Website/jamieho-backroom. The old Claude Cowork location is stale. GitHub is Jamieho1/jamieho-backroom. Jamie pushes himself; do not push. Commits, if requested, use Jamie's configured identity. Read actual AGENTS.md, CLAUDE.md, MEMORY.md, PRD.md, dependency map and README before coding. Current rules and source may evolve after this dated handoff.

Ask before starting a new ticket. Use APIs/MCP and safe local checks; Jamie checks the live site himself. Do not browse the live site or control his computer without a specific request. Jamie handles all secrets: never read .env, print credentials or ask for keys. Keep private CV/resume/notes and copied problem material out of Git. Approved original public wallpaper assets have a narrow Git exception; that is not general permission to commit every new reference or personal asset.

Public /, /privacy and /projects remain prerendered; /articles is currently also built as a public prerendered route. Preserve /notes, /practices and problem URLs, /behavioral, Articles public/published and owner/draft behaviour, Settings permission checks and the app registry. Access belongs in database RLS; only the owner writes. The public API function exception is record_signin; do not expose new callable database functions accidentally. Each policy needs meaningful database coverage. Privacy must match any actual collection change; this visual redesign does not itself authorize new analytics. Log real app openings, not every project scroll position.

No database migration is needed for the media pilot. Earlier migrations were applied as documented in repository MEMORY; this handoff adds/applies none. Do not infer that a new migration is safe to apply from these documents. Any future database change needs a new migration, tests and Jamie's explicit approval before live application. No runtime AI/server execution feature is being added; media production is an offline workflow.

## Local preview state

The isolated preview lives outside Git at /Users/jamieho/.codex/visualizations/2026/10/31/01a19242-e170-7603-bb68-be12ae48066b/london-journey-discovery/pilot1/motion-study. It is served at http://localhost:4587/ only while its local server runs. That URL does not travel to another computer with this export. The handoff does not include an executable copy of the preview or application repository.

The current preview includes library → Westminster → St Paul's → Canary Wharf → carriage → room. It uses layered images/crop/scale, some foreground geometry and covered swaps. Earlier procedural bridge/lift visuals were superseded after Jamie reported continuity problems. Its current Westminster uses one close source across the approach; that removes the far/close image jump but still does not demonstrate actual photoreal walking footage. The full original sky and Imperial entrance route remain planned. The room monitor, real project data panels, redesigned app shell and contact overlay are unimplemented in this preview.

Do not trust the first paragraphs of its historical README or final-source.json as the latest scope. They describe earlier two-scene states. The dated later addenda and verification/full-route/report.json reflect the later route. On 4 November the existing report records PASS with no errors for desktop/390px sampled states, reverse pixels, navigation, overflow and reduced-motion/no-JS reading. Those are prior local prototype checks, not new tests in this handoff, a real iPhone review or Jamie's live production sign-off.

Current source entry files are index.html, main.js, extension.js, onward.js and study.css. vendor/ contains unchanged scroll-craft and a local server. Existing bundled assets/study.js is served directly. Locally, node vendor/serve.mjs --root . --port 4587 serves it without an install. build.cjs depends on Jamie's absolute repository node_modules path; it is not portable without adjusting dependency resolution. verify-route.cjs also uses locally available tooling. Do not claim the preview can run from Word documents alone.

## Proposed production architecture

Use one scroll owner and a paused GSAP timeline or equivalent deterministic mapping. scroll-craft supplies the requested creative/verification workflow; read its actual skill before applying it. Three.js should solve geometry, depth or monitor interaction where useful. It need not render every distant architectural detail as a mesh. HyperFrames is an optional deterministic authoring/export workflow; its CLI/movie validation has not been run and it is not the form backend.

The rendering method is still open. Options include reference-guided film, geometry, preserved opening layers or a measured mixture. One long generated film may help explore the route, but it cannot guarantee the required protected hero pixels, physical continuity, ambient motion while paused or selectable text. A flattened clip freezes everything when its time is stopped; keep ambient elements independent if they must continue. A video generator does not implement scrolling, focus, login, database access or real forms.

For footage, test actual video seeking against image-sequence delivery only when measurements justify the additional bytes. Record native duration, resolution and frame rate; a 60fps UI loop does not create new frames in 24/30fps media, and upscaling does not prove new source detail. Preload before reveal, prepare source-aligned posters and a complete reading fallback, and release or pause resources when hidden. Test cold loading and unavailable assets, not just a warm local cache.

## Media planning and current authority

The expanded full script is a whole-journey concept brief. Its proposed 120-second schedule is not approved final duration and may exceed a chosen tool's limits. The earlier approximately eight-second Westminster pilot remains a possible small technical proof; the choice between a whole concept and one pilot is for Jamie, not an automatic execution instruction. The old isolated pilot sentence forbidding the next location is intentionally absent from the full script, whose transitions continue through the entire route.

Jamie explicitly forbids generation without him saying to run it. No video generation or provider upload has occurred in this work. Higgsfield was connected in Codex and provided read-only quotes of 24/56 credits for eight-second silent draft/720p alternatives on 4 November; quote validity and model support must be checked again before any future submission. Runway connected but exposed no Free-plan video capability through that integration. This does not establish every provider's web-plan rules or Claude's available integrations. Do not upgrade, spend, retry or substitute a provider automatically. Jamie may copy the script manually into an alternative himself.

## Reference files and provenance

The export includes selected reference images and a JSON manifest with relative names, source paths, byte counts, SHA-256 hashes, roles and limitations. It also includes a reference index for Claude. These are private handoff copies for context; their inclusion is not a production license, provider-upload instruction or permission to commit them. Preserve originals, don't remove watermarks and settle production-use provenance separately.

The original day/night images are composition and identity authorities. The library v5 image governs the accepted angle and latest unbranded red cup/diagonal path/details. Supporting user lawn/tower/sign/crest images explain details from other views. The close Westminster photo is architecture/orientation guidance, not a verified walking-height start frame. The distant St Paul's image governs composition, not verified lift mechanics. The platform/carriage photos guide Elizabeth line materials. The generated room image is a design study, not a functional monitor. References cannot supply a compatible moving start/end pair by themselves.

An exact new Imperial entrance production frame is still unresolved. Existing primary starting points include https://www.imperial.ac.uk/events-and-hospitality/venues/main-entrance/ and https://www.imperial.ac.uk/events-and-hospitality/venues/queens-lawn/ . One New Change architect context is https://www.jeannouvel.com/en/projects/one-new-change/ . These are source leads from earlier work, not a new verification or license grant. A composition reference may depict an escalator/atrium viewpoint; do not present it as proof of an exact glass lift route.

Technique references are https://www.bmwf3.com/ and https://komputermechanic.com/tutorials/scroll-animation-website . The desired qualities are crisp scene detail, real camera travel, scroll-driven pauses and clean connections. Their source assets/protected prompt bundles were not copied, and the creator's actual media provider is not established. Requested workflows: https://github.com/nateherkai/scroll-craft and https://github.com/heygen-com/hyperframes . Read their instructions before implementation; user authorization and repository rules take precedence over provider/key/deployment defaults.

## Next steps and acceptance

First discuss the handoff with Jamie. Confirm whether the next output should be a manually generated whole-journey concept, an isolated Westminster moving test or a monitor interaction proof. Prepare missing reference frames and settings for review without executing media generation. Do not redo the route discovery or discard the original art.

After explicit execution approval, produce only the chosen scope. Inspect opening, quarter, midpoint, three-quarter and exit frames for real perspective, stable landmark/character shape, colour, readability space and each cover/reveal. Then test actual slow/fast scroll, stops and reverse within the join. For the monitor, prove real focus, content scrolling, form submission and closing to desk; a screen texture is insufficient. Reuse the existing backend and app access rather than creating a new auth/data system.

When production source changes, run npm run check and appropriate npm run test:e2e coverage. Verify desktop and 390px phone, useful intermediate states, overflow, text contrast, keyboard/focus, reduced motion, no JavaScript/WebGL, missing media, cold loading and complete fallbacks. Headless phone dimensions do not prove real iPhone decoding or Low Power Mode. Report what was tested and what remains uncertain. Jamie pushes and checks live; only then change applicable tickets to Done.

## Open items to keep visible

Final public copy, client logos, exact technology inventory, final chapter timings/scroll distances, moving-shot start/end references, asset permissions, media provider/format and final performance budget remain to be settled. Do not invent values to make the plan seem complete. St Paul's exact lift geometry and Westminster pedestrian approach particularly need compatible references. Production monitor/app routing and theme-transition implementation remain open. Jamie has not bought the domain; TKT-71 domain/SSO remains separate. No secrets, CV data, backend export or application source is included in this handoff bundle.


## Transferring this handoff to Claude

Upload the four Word documents or their four Markdown equivalents, plus the references folder when the client supports it. The ZIP is convenient for export; if Claude cannot inspect ZIP contents, extract it first and attach the documents/images directly. Check that Claude can actually see the reference images before asking for visual work. If it will implement code, grant access to the actual repository separately. Existing auth/backend content is intentionally not exported here. Do not copy local filesystem paths into a remote media input field.

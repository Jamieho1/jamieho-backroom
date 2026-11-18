# Current state

## Implementation

What I build now contains complete AI Engineering and Cloud Architecture diagrams at wide/short desktop sizes. SVG viewports fit both axes, Cloud outer geometry has padding, and its two certification tiles sit in the left column below the tags. Phones/static layouts retain internal diagram panning; long left copy can scroll on short desktops.

Three unused tracked desktop WebPs and twelve retired Home/London/entry/room/photo-orbit implementation/test/CSS files are removed. Reusable owner editors, membership gates, active desktop art/runtime and dynamic social icons remain. The retained media manifest and home-media-v2 worker exclude retired cloud/London/mobile clips; phones preload no videos. The generator refreshes retained keys without rediscovering archived files.

## Cleanup approval and rollout

The reviewed inventory and execution results are outside Git in `../Media/Previews/media-cleanup-2026-11-18/`. Jamie approved “delete”. Removed 10 ignored repo files (5,335,929 bytes) and 17 Media files (64,239,089 bytes); moved 21 retained originals into Brand/Uploads with matching hashes. Earlier tracked cleanup removed three WebPs (1,223,166 bytes) and twelve retired source/test/CSS files (69,187 bytes). All nine retained runtime media files remain present.

Storage remains unchanged: 23 objects / 18,723,440 bytes are approved for deletion, but the deployed worker still lacks home-media-v2 and the retained-file allowlist. Deploy cleanup code first and recheck live references/hashes. Available Supabase MCP tools have no Storage removal API; do not delete catalogue rows through SQL or inspect secrets. Approval persists for this exact plan.

Technology set `84c50b3d-2c18-4efd-90ac-cc18281ef9da` and CV bullets 1/3 set `a2ba8b2f-0ebe-4e8f-9134-45b0bd7f5f07` remain drafts. Credly URLs await Jamie. Prior caption/highlight proposals `478f314b-52dd-46b1-8202-5130a894d305` and `37b47db8-2872-4b2d-a5bd-c9c5b25e553a` await Jamie. Project-highlights migration remains applied as remote `20261117220033`; no new migration or live content/policy change.

## Verification

After approved local deletion: typecheck, 1,064 unit/database tests, production build, six-page static assertions and diff checks pass. Home/dial/diagram/story/smoke browser suite at desktop/390px: 78 passed / 18 conditional skips. All 27 deleted paths are absent, 21 moved originals match their recorded SHA-256, and nine retained runtime files are present. The broader 215-pass/89-skip browser run preceded deletion; owner-preview integrations were not rerun.

Jamie commits/pushes and verifies live. No push by the agent; live review and Storage cleanup remain pending.

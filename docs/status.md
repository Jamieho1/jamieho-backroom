# Current state

## Implementation

Home polish 9 (local, unpushed): the Background step restores the mockup constellation (centre print plus four ring prints, gold tags above each on short leaders, wrapped/clamped, no overlaps). Four ghost prints stay dimmed at the ring edge through Experience stops and vanish before Selected Work. Centre line icons draw edges then nodes on a scrubbed GSAP timeline that reverses; neural-network is the supplied 3-3-2 icon. Stops order by `experience_items.sort`. “Have a project in mind?” is its own half-height (48vh) band after What I build that rises 1:1 with scroll, with Creator rising directly beneath it; ~1.4x strong pill, no supporting line, no pinned hold.

Earlier: What I build holds complete diagrams at wide/short desktop sizes; Cloud certification tiles sit below the tags. Retired Home/London/room/photo-orbit files and three WebPs are removed; the home-media-v2 worker retains only the nine manifest files and phones preload no videos.

## Pending for Jamie

Draft set `9b27d9e7-c440-44c7-85ce-73c7c5f4d47e` (“Experience stop order”: Imperial 10, Global Relay 20, KOLN3D 30; read back as draft) needs approval at /manage/review before the live order is Imperial → Global Relay → KOLN3D. Technology set `84c50b3d-2c18-4efd-90ac-cc18281ef9da`, CV bullets set `a2ba8b2f-0ebe-4e8f-9134-45b0bd7f5f07`, and caption/highlight sets `478f314b-52dd-46b1-8202-5130a894d305` and `37b47db8-2872-4b2d-a5bd-c9c5b25e553a` remain drafts. Credly URLs await Jamie. No migration for Polish 9; project-highlights stays applied as remote `20261117220033`.

## Cleanup

Reviewed inventory and results are outside Git in `../Media/Previews/media-cleanup-2026-11-18/`. Local deletion/moves are done. Storage keeps 23 objects (18,723,440 bytes) approved for deletion until the cleanup worker is deployed; the Supabase MCP has no Storage removal API. No repeat approval needed for that plan.

## Verification (Polish 9)

In an isolated secret-free copy (repo node_modules are macOS binaries and cannot run here): typecheck, full unit/database suite (1,068 tests), production build and static assertion pass; `git diff --check` clean. Playwright could not run because no Chromium is installed on this machine, so the new overlap, ghost, icon-scrub and banner browser tests and CSS layout are unrun and unseen. Jamie should run `npm run test:e2e` and review visually.

Jamie commits/pushes and verifies live.

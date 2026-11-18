# Active Home media pipeline

Only `c7a` (room arrival) and `c7b` (monitor/contact push-in) use video. Each has a desktop MP4 and first/last JPEG posters. Phones use the last posters and never download videos. The cloud hero uses approved artwork from the desktop asset registry; old London/Imperial/bridge clips are retired.

Raw room clips live under `Personal Website/Media/Uploads/2026-11-18-room-source-clips/`; retained still references are in `Media/Uploads/2026-11-18-room-source-stills/`. Encoded files stay in ignored `public/home-media/` for local development and public `home-media` Storage for deployment. Personal originals never enter Git.

1. `scripts/home-media/encode.sh "<raw clip.mp4>" c7a` (or c7b) produces a desktop MP4 and two posters; no unused mobile encoding.
2. `node scripts/home-media/manifest.mjs` refreshes only retained manifest entries, rather than rediscovering retired files still awaiting deletion. Explicit filename arguments merge newly approved assets.
3. The generator updates the manifest and service-worker filename allowlist together. Upload only changed retained files through the existing owner-only Storage uploader, and commit those two code files. Do not upload the entire archive.

`media-sw.js` uses cache namespace `home-media-v2`; activation removes the old namespace and retired filenames are no longer cached. Public assets remain content-versioned. New media needs reference/retention review before upload. Jamie approved the external audit plan; local deletions/moves are complete. Storage removals remain pending cleanup-code deployment and authenticated Storage API access.

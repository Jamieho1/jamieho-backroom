# Home journey media (TKT-75)

Media never goes into git. Raw clips live in `~/Documents/Developer/Personal Website/Media/Final-Media/`; encoded
files go to `public/home-media/` (gitignored) for local dev, and to the public Supabase Storage bucket `home-media`
for the live site (migration `20261104120000_home_media.sql`; owner-only writes).

| id | source clip | chapter |
|---|---|---|
| c1 | Cloud scene 1 (crop `crop=1365:768,`) | sky |
| c2 | C2 Cloud → Imperial entrance | descent |
| c3a | C3a Forecourt → revolving door | imperial |
| c3b | C3b Revolving door → library window | atrium |
| c5a | C5a Riverside → approaching the bridge | westminster |
| c5b | C5b Approach → under the bridge | arch |
| c7a | Into the room → in front of the desk | room |
| c7b | C7b Desk → close on the monitor | desk |

Each id produces `<id>-desktop.mp4`, `<id>-mobile.mp4`, `<id>-first.jpg`, `<id>-last.jpg` (`encode.sh`).
The library scene uses `lib-plate.jpg` (wide plate from S3a/S3b/S3c, props and window frame removed) and
`lib-props.png` (notebook + cup cut-out from S3b), built once with OpenCV from the stills.

Live site: upload every file in `public/home-media/` to the bucket root, then set the Vercel env var
`NEXT_PUBLIC_HOME_MEDIA_URL=https://<project-ref>.supabase.co/storage/v1/object/public/home-media` and redeploy.

## After encoding or replacing any file (TKT-76)

1. `node scripts/home-media/manifest.mjs` — re-hashes everything in `public/home-media/` into `lib/journey/media-manifest.json`.
2. Upload the changed files to the `home-media` bucket (same names, replace).
3. Commit the manifest. Pages request `<file>?v=<hash>`, so browsers and the media service worker (`public/media-sw.js`)
   fetch the new file immediately and keep it cached for good.

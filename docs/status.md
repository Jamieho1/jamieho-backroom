# Current state

## Implementation

Feedback pass (local): /about, /projects and /projects/[slug] share one type and spacing scale, `app/page-scale.css` (`--pg-*`), read by `story.css` and `project-pages.css`. At 1440px heroes are 60/56/48px (index/about/case study), section titles 28, sub-headings 21, quotes 22, body 15/1.65, ledes 16, eyebrows 12, ending band 50, page top padding 48; the first featured card now starts about 317px down. Photos and screenshots are never cropped: /about photo breaks show the whole image (≤560px wide, ≤70vh tall, centred, no parallax); /projects cards and case-study frames use `object-fit: contain`. Home dial stops with a `journey_photo` carry the gold caption tag (“ORG · LOCATION”), and the Credly certification tiles link to the two supplied badges (cause of the dead tiles: empty URLs rendered plain `div`s).

Earlier local work stands: home dial polish (larger Background prints, journey photos, Creator dissolving into Background), My story reader, Projects pages, Contact brief, dead-code cleanup. Jamie deploys and verifies live.

Pixelation: live About files are 768–2048px wide and the code adds no upscaling; the three oldest are quality-66 JPEGs with no better originals. Jamie should confirm live.

## Database and pending content

`20261121120000_journey_photos.sql` is tested locally and **NOT applied live**; its draft set (KOLN3D and Global Relay photos) is not inserted (SQL in `../Media/Previews/journey-photos-pending.sql`). `20261119180000_project_case_studies.sql` is also **NOT applied** (`../Media/Previews/projects-drafts-pending.sql`). `20261119090000_contact_briefs.sql` is applied live (remote `20261119150051`).

Pending review at /manage/review: email link `78b3b527-19bb-41e3-ae94-7d6e355f7827`, Experience order `9b27d9e7-c440-44c7-85ce-73c7c5f4d47e`, Technology `84c50b3d-2c18-4efd-90ac-cc18281ef9da` (its certificate URLs are empty: approving it as drafted makes the tiles plain again), CV bullets `a2ba8b2f-0ebe-4e8f-9134-45b0bd7f5f07`, caption/highlights `478f314b-52dd-46b1-8202-5130a894d305` and `37b47db8-2872-4b2d-a5bd-c9c5b25e553a`.

## Media

Six Contact media copies and 23 earlier Storage objects remain approved for deletion, pending deployment and authenticated Storage API access.

## Verification of this change

Secret-free copy: typecheck clean; 1,155 unit/DB tests pass; production build and static assertion pass; full Chromium suite (CI, 2 workers) 253 passed, 105 conditional skips, 0 failed, including new page-scale, caption and Credly clickability checks. No live data, schema, dependency, commit or push change.

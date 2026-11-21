# Current state

## Implementation

Home dial polish is implemented locally. Background photos are about 28% larger (centre 38.5%, ring prints 22.8%, ring radius 43%; ghosts end at 72°/108°/252°/288° so they never touch) and the no-overlap browser tests still pass at 1440×900 and 1280×800. Journey stops accept an optional `journey_photo`: the dial centre shows it as a white print and the line icon becomes a small gold ring badge that still draws in on scroll. Creator now dissolves into the Background dial instead of cutting (reversible opacity/transform; reduced-motion and compact views have no pin). Details: journey.md.

Pixelation: the live About files are 768–2048 px wide, so source size is not the cause, and the code adds no transform parameters or upscaling. The three oldest photos are quality-66 JPEGs and no better originals exist in Media; nothing was re-exported. A browser render at 2× pixel ratio showed no visible difference from right-sized copies. Jamie should confirm live whether it persists.

Earlier local work stands: My story chapter reader, Projects pages redesign, gold-border controls, Hero → Creator → Background/Experience/Selected Work → What I build → Contact order and the Contact brief form. Jamie deploys and verifies live.

## Database and pending content

`20261121120000_journey_photos.sql` (experience_items.journey_photo plus the Content Drafts apply function) is tested locally and **NOT applied live**; it awaits Jamie’s “apply it”. Its draft set (KOLN3D and Global Relay photos) is **not inserted**: SQL in `../Media/Previews/journey-photos-pending.sql`, to run after the migration is applied and the two photos are uploaded to home-media. Until then the public reader falls back to the older column set and stops show their icons.

`20261119180000_project_case_studies.sql` is also **NOT applied** (draft SQL `../Media/Previews/projects-drafts-pending.sql`). `20261119090000_contact_briefs.sql` is applied live (remote `20261119150051`). Other pending draft sets await approval at /manage/review: email link `78b3b527-19bb-41e3-ae94-7d6e355f7827`, Experience order `9b27d9e7-c440-44c7-85ce-73c7c5f4d47e`, Technology `84c50b3d-2c18-4efd-90ac-cc18281ef9da`, CV bullets `a2ba8b2f-0ebe-4e8f-9134-45b0bd7f5f07`, caption/highlights `478f314b-52dd-46b1-8202-5130a894d305` and `37b47db8-2872-4b2d-a5bd-c9c5b25e553a`.

## Media

Six Contact media copies and 23 earlier Storage objects remain approved for deletion, pending deployment and authenticated Storage API access.

## Verification of this change

Secret-free copy: typecheck clean; 1,168 unit/database tests pass (new: journey_photo validation/overlay, dial print and badge, cross-fade maths, DB constraint/policy/draft tests); production build and six-page static assertion pass; `git diff --check` clean. Cloud Chromium (2 workers): homepage, journey, dial, v13 and polish specs, 82 passed, 22 conditional skips, 0 failed, including new photo-badge, reduced-motion stacking and Creator/Background mid-scroll tests. No live data or schema change, commit or push.

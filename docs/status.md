# Current state

## Live data and pending rollout

Migrations through `20261116165138_home_v13_data.sql` are applied (remote `20261116171034`). New `20261117183223_project_highlights.sql` is prepared and **NOT applied live**; Jamie must say “apply it”.

Read-only verification confirms five public About photos, two DataKind screenshots, and approved About-photo/DataKind/university proposals. Featured Work remains Cyterly AI and DataKind UK.

Two new sets await Jamie at /manage/review: caption `478f314b-52dd-46b1-8202-5130a894d305`; exact mockup highlights `37b47db8-2872-4b2d-a5bd-c9c5b25e553a`. Both contain summary/operations only and remain drafts. Apply the migration and deploy new review code before approving highlights.

## Implementation

Home polish 7 replaces Background, Experience and Work with one navy editorial dial: database photos/jobs/projects, rotating rings, coordinates, caption leaders, dynamic index, drawn icons and scrubbed screenshot frames. All featured public projects extend it. Text/visual/anchor/dot navigation shares the existing scroll clock; no new dependency. At ≤900px and reduced-motion/no-JS it stacks naturally with native screenshot rows. Background/Experience/Work anchors are retained. Journey labels include What I build and Contact; Home polish 8 is not built.

Old curve/mascot/standalone Work/constellation code, replaced tests, manifest entries and local Experience-art files are removed. Three Storage objects remain pending deletion **after replacement deployment**, to preserve compatibility with previously deployed code. Full file/object inventory: handoff report. Existing brand marks, surrounding journey, editors and owner-only preview boundaries remain.

## Verification and next steps

Typecheck, 1,073 unit/database tests, production builds, six-page static assertions and diff checks pass. Full main browser suite: 207 passed / 81 conditional skips. Separate owner/member/visitor integrations: all 66 passed on a clean build with the same fixture database. Some builds required an unchanged retry after the existing Next security advisory; no dependency change.

Jamie applies the migration, commits/pushes and verifies live; then retire the three Storage objects after checking deployed references. No push or live migration application by the agent.

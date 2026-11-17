# Current state

## Live data

All migrations through 20261116165138_home_v13_data.sql are applied (remote 20261116171034). None pending. TKT-110b starter sets are approved; public About has three photos, one centre. Featured Work is Cyterly AI and DataKind UK.

About polish 1 prepared unchanged originals and stripped/oriented, uncropped 1600px JPEGs outside Git. Two upload sets remain draft: About university activities (3197e5d2-c515-454c-9354-7cf0de76abab, two slots) and DataKind second screenshot (4bdf7587-8deb-479b-91b4-8d9ba57463bf, one slot). Jamie uploads/previews/approves at /manage/review; five public About photos and two ordered DataKind screenshots cannot be confirmed before approval. University wording/activity set 5f1aaffe-2424-4d3d-beb9-d0419e9b1835 was separately prepared for owner review.

## Current implementation

Home order: Hello → Background (#about, aliases #background/#pivot) → Experience → Work → Techstack → Creator → Contact. Browser Back returns to clouds. Experience role activation synchronizes scroll/mascot/path/card; long cards scroll independently.

Home polish 4: Journey, My story (About/Projects), Content (Articles/Resources), Interview Prep; existing feedback/theme/account/review controls retained. Shared JH logo and favicon; PassLoop mark/wordmark and route favicon. Work uses horizontal multi-image carousels in desktop/static/phone rendering; single images stay still. Case-study galleries were already static and remain unchanged.

About polish 2 is preview-only: Media/Previews/about-background-preview.html has five photos, configurable orbit rings/story line, matching embedded display font, 390px/reduced-motion controls. No orbit/story-line design has been ported to the website; Jamie chooses settings first.

PassLoop and Content Drafts retain their existing access, preview, editor and isolation rules; public pages remain static/ISR. Photos/source logos stay outside Git; only approved public brand SVGs/favicon derivatives enter Git.

## Verification and next steps

Typecheck, all 1,098 unit/database tests, production build, six-page static assertions, main browsers 210 passed/76 conditional skips, synthetic integration 66 passed. Synthetic production build passed on retry after the existing pinned Next security advisory. External preview: five images load; desktop/390px have no horizontal overflow. No migration, publication or upload by the agent.

Jamie commits/pushes and reviews live. Remaining: photo-slot approvals/read-only verification, background preview decision, TKT-117 and Articles/Resources redesign, PassLoop build-out, domain/SSO sign-offs and separate Next dependency advisory review.

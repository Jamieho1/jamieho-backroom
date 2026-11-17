# Current state

## Live data

Migrations through 20261116165138_home_v13_data.sql are applied (remote 20261116171034); none pending. TKT-110b starter sets are approved. Last public verification: three About photos, one centre; featured Work is Cyterly AI and DataKind UK.

Photo upload sets await Jamie: About activities 3197e5d2-c515-454c-9354-7cf0de76abab (two slots), DataKind screenshot 4bdf7587-8deb-479b-91b4-8d9ba57463bf (one slot). Originals and stripped 1600px JPEGs are outside Git in Media/Uploads. Jamie uploads/previews/approves at /manage/review, then counts/order need read-only verification. University wording/activity proposal: 5f1aaffe-2424-4d3d-beb9-d0419e9b1835.

## Implementation

Home: Hello → Background (#about, aliases #background/#pivot) → Experience → Work → Techstack → Creator → Contact. Back returns to clouds. Experience role activation synchronizes scroll/mascot/path/card.

Shared bars: Journey, My story (About/Projects), Content (Articles/Resources), Interview Prep; existing theme/feedback/account/review controls. Desktop Work scrubs screenshots sideways; dots seek its clock. Phone Work is natural-flow; static/reduced-motion rows swipe. Image-sized browser frames and traffic lights apply to Work/project heroes. Cyterly’s CSS letterboxing is fixed without editing its pixels.

Home polish 6 replaces redrawn branding with original-image auto-traces and regenerated favicons. JH stays wide/centred at 70% inner button width. Expanded PassLoop scales beside its reserved collapse control; a 92px collapsed rail stacks mark/expand. Stored preferences, tooltips and phone drawer behavior remain intact.

Fidelity at original resolution against thresholded foreground masks: JH 0.735%, PassLoop mark 1.330%, wordmark 1.488%. Source hashes verified; overlays, measurements and trace script are in Media/Brand. Temporary Potrace tooling adds no runtime dependency; no manual path edits.

Background decorations remain preview-only in Media/Previews/about-background-preview.html. PassLoop/Content Drafts ownership, preview boundaries and static/ISR rules remain unchanged.

## Verification and next steps

Home polish 6: typecheck, 1,099 unit/database tests, production build, six-page static assertions and full browsers 216 passed/78 conditional skips. Tests prove logo bounds, no overlap, preference/tooltips and 390px drawer behavior. Synthetic integrations were not rerun for this asset/CSS change; Home polish 5’s latest gate passed all 66.

No schema/live data change or push. Jamie commits/pushes and reviews live. Remaining: photo approvals, background decision, TKT-117/content-library redesign, PassLoop build-out, domain/SSO and separate pinned Next advisory review.

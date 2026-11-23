# Current state

## Implementation

PassLoop C4 is implemented locally: experiences carry ordered `prep_links` (note, question, behavioral_theme; optional label) shown as a grouped “What to prepare” block after the article plus a compact right-sidebar copy from 1,101px (Concepts, Practice with difficulty and done tick, Behavioral with answered X of Y; empty groups hidden). `[[note:id]]`, `[[question:number-or-slug]]`, `[[behavioral:theme]]` chips render in experience Markdown and company overviews (unknown refs stay plain text). Company Overview gains Most-mentioned topics (top 8 by count). Role pages (Full-Stack, FDE, Data Science, Machine Learning) list readable notes via id-prefix sections (`full-stack-`, `fde-`, `data-science-`, `ml-`) and keep Soon when empty. Content Drafts allowlists prep_links and refuses unknown links/chips. C1-C3 remain intact. Jamie pushes/reviews before Done.

## Database and pending content

**C4 migration `20261123180000_interview_prep_links.sql` is NOT applied live**: it adds `prep_links` with a shape CHECK and replaces the hardened approval function. Readers tolerate the missing column; drafts using prep_links need the migration. Read-only live check this session: no prep_links column, notes has no section column, theme ids unchanged, no experiences. C1 `20261123123946` is remote `20261123125602`; P2/P3 `20261123110809`/`20261123110824`; Journey photos `20261121120427`, Project case studies `20261119233658`, Contact briefs `20261119150051`.

Pending reviews: email `78b3b527-19bb-41e3-ae94-7d6e355f7827`; Experience `9b27d9e7-c440-44c7-85ce-73c7c5f4d47e`; Technology `84c50b3d-2c18-4efd-90ac-cc18281ef9da` (empty certificate URLs undo linked tiles); CV `a2ba8b2f-0ebe-4e8f-9134-45b0bd7f5f07`; captions/highlights `478f314b-52dd-46b1-8202-5130a894d305`, `37b47db8-2872-4b2d-a5bd-c9c5b25e553a`. Six Contact copies and 23 earlier Storage objects remain approved for deletion, pending deployment/authenticated API access.

## Verification

Clean-copy run: typecheck passed; full unit/database suite **1,401 passed / 140 files** (19 new unit/DB tests); one synthetic-loopback production build (the existing Next advisory interrupted fresh builds; the unchanged retry passed) and six static-page assertions passed. Loopback browsers (one worker, installed Chrome): experiences, company page, companies, experience preview, new C4 and the fixed preview specs **36 passed / 0 failed** at desktop and 390px. Preview-spec drift fixed in tests only: What-I-build now targets the proposed credential link among the default Credly tiles; Home v1.3 checks the photo caption on its item and the About-first story heading. The project-photo spec, the phone drawer focus-trap case and the full browser suite were not rerun. Desktop/phone screenshots inspected. No live database operation, secret access, commit or push.

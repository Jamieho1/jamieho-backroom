# Current state

## Live data (read-only verified)

- All migrations through 20261116165138_home_v13_data.sql are applied; remote version 20261116171034. None pending.
- All three TKT-110b starter sets are approved. Public content has three About photos, one centre and three journey stops. Story is empty, so My story uses its starter.
- Featured public Work is exactly Cyterly AI and DataKind UK; DataKind UK has Volunteer.

## Current implementation

- Home v1.3: Hello → About → Experience → Work → Techstack → Creator → Contact Us. About has its photo constellation and Read my story; /about is the themed ISR editorial page/starter.
- About has a subtle gold/blue CSS background, also echoed on My story. Returning with browser Back from a same-tab site link opens the clouds; explicit chapter links still work.
- Experience uses the approved versioned background/mascot and portrait phone still. Desktop heading/curve stay pinned below navigation; the smaller mascot leaves room for longer independently scrolling cards. Clicking/activating a role scrolls to its stop, synchronizing mascot/path/card. Static Work retains project tags.
- Shared bars: Journey, My story, Projects, Interview Prep, Articles, Resources, icon theme cycle, feedback/account/review controls. Privacy remains in Contact.
- PassLoop retains public Practice/guides/template and private per-user progress/resume/answers; Notes requires sign-in. Legacy app routes still work. Resources lists Guides only.
- Content Drafts retains owner-only approval/preview, photo slots and existing table scopes. Public pages stay static/ISR.

## Release gate

Current role-selection checks pass: typecheck; 15 focused Experience unit tests; production build; six-page static assertions; Home/Experience browsers 30 passed/six viewport skips. Clicks and keyboard activation reach each stop forward/backward with aligned mascot/card. Phones, reduced motion/no JS and Back-to-clouds remain covered. The preceding background/navigation gate passed all 1,097 unit/database tests and 57 browser cases (one skip); the full suite was not rerun for role selection. TKT-116 remains the latest synthetic integration gate (66 passes).

University qualification/society changes are saved in pending Content Drafts set 5f1aaffe-2424-4d3d-beb9-d0419e9b1835 (three operations). Jamie approves via /manage/review; live CV is unchanged. No migration or upload. Jamie pushes and reviews the final UI live before Done.

## Remaining work

- Jamie’s final deployment/live review of Home v1.3.
- TKT-117 image sizing and the separately reviewed Articles/Resources redesign.
- PassLoop build-out; old editors/deprecation later.
- Domain/subdomain SSO sign-offs remain unverified.
- Supabase leaked-password protection is off (Google sign-in only); record_signin is intentionally API-callable.
- The pinned Next.js build emitted a security-upgrade advisory; dependency review remains separate.

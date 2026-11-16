# Current state

## Live data (read-only verified)

- All migrations through 20261116165138_home_v13_data.sql are applied; remote version 20261116171034. None pending.
- All three TKT-110b starter sets are approved. Public content has three About photos, one centre and three journey stops. Story is empty, so My story uses its starter.
- Featured public Work is exactly Cyterly AI and DataKind UK; DataKind UK has Volunteer.

## Current implementation

- Home v1.3: Hello → About → Experience → Work → Techstack → Creator → Contact Us. About has its photo constellation and Read my story; /about is the themed ISR editorial page/starter.
- Experience uses the approved versioned background/mascot and portrait phone still. Desktop heading/curve stay pinned below navigation; the smaller mascot leaves room for longer independently scrolling cards. Static Work retains project tags.
- Shared bars: Journey, My story, Projects, Interview Prep, Articles, Resources, icon theme cycle, feedback/account/review controls. Privacy remains in Contact.
- PassLoop retains public Practice/guides/template and private per-user progress/resume/answers; Notes requires sign-in. Legacy app routes still work. Resources lists Guides only.
- Content Drafts retains owner-only approval/preview, photo slots and existing table scopes. Public pages stay static/ISR.

## Release gate

TKT-116 local gate passes: typecheck; 1,097 unit/database tests; standard and synthetic production builds; static assertions for all six required pages; full main browser suite 201 passed/75 conditional skips; full synthetic integration suite 66 passed. Coverage includes Home photo/journey/Story outlines, approval refreshes, exact featured Work/Volunteer, reduced-motion/no-JS / and /about, canonical/legacy anchors and account isolation. No migration, live writes or media uploads. Jamie pushes and reviews the final UI live before Done.

## Remaining work

- Jamie’s final deployment/live review of Home v1.3.
- TKT-117 image sizing and the separately reviewed Articles/Resources redesign; About visual refinement after discussion.
- PassLoop build-out; old editors/deprecation later.
- Domain/subdomain SSO sign-offs remain unverified.
- Supabase leaked-password protection is off (Google sign-in only); record_signin is intentionally API-callable.
- The pinned Next.js build emitted a security-upgrade advisory; dependency review remains separate.

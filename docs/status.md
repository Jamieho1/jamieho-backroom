# Current state

## Implementation

Home polish 8 replaces the old Techstack/Toolkit scene with the approved five-capability What I build section after the editorial dial and before Creator. It includes mockup copy, data-driven inline SVG diagrams, reversible desktop scroll steps/row navigation, a 0N / 05 counter, ≤900px measured accordion, internally panning diagrams and fully open/drawn reduced-motion/no-JS views. Layout measurements preserve explicit navigation destinations, including phone back-to-top jumps.

Capability and dial chips have gold hover/focus styling without link semantics. Shared GSAP primary links provide bounded magnetic movement, gold sweep/navy text, arrow animation, focus end states and a stronger pulsing conversation CTA to Contact. Old Toolkit code/styles/tests and its two local badge images are retired. No migration, policy, editor or public caching change is required.

## Live content and rollout

Two summary/operations-only sets remain drafts at /manage/review:
- Technology copy with empty Credly URLs: `84c50b3d-2c18-4efd-90ac-cc18281ef9da`.
- Global Relay bullets 1/3 only: `a2ba8b2f-0ebe-4e8f-9134-45b0bd7f5f07`; bullet 2 is untouched.

Live sections/experience/bullet fingerprints match before/after. Jamie deploys the new reader before approving Technology, then supplies actual Credly URLs; empty tiles are non-clickable. No content approval by the agent.

`20261117183223_project_highlights.sql` remains applied live as remote `20261117220033`. Prior caption/highlight proposals `478f314b-52dd-46b1-8202-5130a894d305` and `37b47db8-2872-4b2d-a5bd-c9c5b25e553a` await Jamie. The three previously retired Experience Storage objects still await replacement deployment before deletion.

## Verification

Typecheck, 1,072 unit/database tests, production build, six-page static assertions and diff checks pass. Full main browser run: 214 passed / 88 conditional skips. Existing owner/member/visitor integration suite: 66 passed; new capability-preview/isolation cases: 2 passed. Both production and synthetic builds passed after unchanged retries for the existing Next advisory; no dependency change. An existing feedback test now waits for its asynchronous focus effect rather than racing it.

Jamie commits/pushes and verifies live; no push by the agent. Home polish 8 awaits live verification.

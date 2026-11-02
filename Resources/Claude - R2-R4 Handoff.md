# Claude handoff: R2–R4 data imports and cut-over

Updated 2026-11-02. Read AGENTS.md and MEMORY.md first. Latest local implementation commit:
`113d6af` (complete London Home journey and owner-editable content). This handoff refresh is uncommitted.
Jamie pushes; do not assume a local commit proves deployment. Jamie checks the live website himself.

## Implementation available

- TKT-60 desktop, TKT-61 Notes reader, TKT-62 owner Notes editor.
- TKT-64 browser-only Practice arena, TKT-65 owner saved code/attempts and shared question notes.
- TKT-67 Behavioral CV / STAR stories, TKT-68 question bank, mappings, outlines, follow-ups and coverage.
- Home, Projects and Privacy share the public desktop shell; public routes remain pre-rendered.
  Home has a continuous Three.js/GSAP London scene with readable HTML sections, direct anchors,
  motion/still controls and phone/reduced-motion/no-WebGL/no-JS fallbacks. No global footer or Open my desktop link.
- Canonical app routes: `/notes`, `/practices`, `/practices/<problem>`, `/behavioral`; legacy desktop
  query links redirect. Allowed launcher icons persist across client navigation.
- Practice now has difficulty/NeetCode tags, search, an owner-only starred review list and collapsible,
  draggable desktop panels. Owner code/notes drafts survive resizing; phone layout stays stacked.
- Public Articles: `/articles`, `/articles/<slug>`, owner-only `/articles/manage` with drafts/publishing.
  See `Resources/Articles - Content Guide.md`. No article content has been seeded by Codex.
- Home Interests/Technology use optional `site_sections` rows. Empty Interests stays hidden; Technology
  uses recognised tags from public project cards unless overridden with owner Markdown. Clearing the
  override restores the automatic list. Personal interest copy and client material remain deferred.
- Last complete validation: 423 unit/DB tests, production build/typecheck/static assertions; 82 localhost
  headless E2E passed, 2 existing duplicate phone runtime cases skipped. Final Home-only rerun: 12 passed.
  All 345 sampled text/frame combinations passed contrast. A supplied CI Retry failure was fixed locally;
  fresh GitHub CI/deployment status must be verified separately. No production browser checks by Codex.

## Database migrations already applied live

All reviewed SQL below was applied with Jamie's explicit approval to project `lhacrrnwddvpawsreamk`.
Do not apply again just because Supabase assigned a different remote timestamp.

| Local migration | Remote version |
| --- | --- |
| 20261031090000_desktop_apps.sql | Applied in SQL Editor; see MEMORY.md |
| 20261031150000_notes.sql | 20261031150441 |
| 20261031151127_notes_free.sql | 20261031151625 |
| 20261101005242_practice_owner_data.sql | 20261101080700 |
| 20261101104828_behavioral_stories.sql | 20261101105507 |
| 20261101110015_behavioral_answers.sql | 20261101110756 |
| 20261101142129_practice_stars.sql | 20261101144554 |
| 20261101145851_articles.sql | 20261101223239 |
| 20261102005510_home_journey_sections.sql | 20261102081107 |

Home sections migration was approved/applied and verified through MCP on 2026-11-02: both new rows
are empty, RLS/public reads/owner-only updates remain intact, authenticated INSERT/DELETE stay revoked.
Do not edit applied migration files.

Codex copied no personal notes, code, attempts, CV, stories or answers. No pending migration is required
for the current UI. Ask Jamie before any new live migration or content changes under the working agreement.

## Claude's remaining tickets

1. TKT-63: Notes import. Follow `Resources/Notes - Import Contract.md`, including free notes and visuals.
2. TKT-66: Practice import. Follow `Resources/Practice - Import Contract.md`. Saved code/attempts are
   owner-only; question notes are shared with Practice viewers. Stable attempt UUIDs prevent duplicate imports.
3. TKT-69: CV, stories and answer preparation. Follow `Resources/Behavioral - Import Contract.md`.
   Reuse Experience tables, keep imported CV visibility hidden by default, map source bullet/story IDs
   to stable destination UUIDs and preserve newer destination edits on reruns.
4. TKT-70: Artifact cut-over only after the three imports are verified. Keep the source intact until then;
   mark Notes/Behavioral read-only with the agreed destination notice as specified in that ticket.

No personal content belongs in git. No AI calls or server-side Python execution. Generic question IDs
are catalogued in `lib/behavioral/questions.ts`. Custom/deep-dive questions need review; never silently
omit them or import unreachable answer rows. Each supported question accepts at most two distinct stories.

## Protect the completed follow-ups during imports

- Read the current import contracts, not an older copy of this handoff. Keep saved attempt UUIDs and
  story/bullet mappings stable; preserve newer destination edits on reruns. Do not overwrite star
  preferences or Articles/Home content as part of an unrelated import.
- CV and private data still belong only in Supabase. Public Home server reads remain anonymous and
  cookie-free; never feed hidden CV rows into its pre-rendered Experience section.
- Keep Home CSS/graphics scoped to Home; Notes/Practice layouts remain independent. Do not import
  Scroll Craft's document-scroll engine/global CSS into the inner desktop scroll pane.

## Outstanding verification and ticket state

- TKT-60/61 and TKT-67 are Done in Notion. Jamie explicitly verified TKT-67 live.
- TKT-62 remains In Progress: owner editor live review needs a note to exist after import.
- TKT-64/65/68 remain In Progress pending explicit live confirmation of their functionality.
  Do not treat a generic instruction to continue as live sign-off.
- After imports Jamie checks owner saves across devices, Notes edit/retry, Practice code/history/notes,
  Behavioral hidden CV access and story links, answer mapping/coverage, and read-only invitee behavior.
- Membership/invitation removal must remove private access through RLS. Public CV rows remain public
  on the landing page separately; uninvited users must not read private CV, stories or answers.
- Public `/`, `/privacy`, `/projects` and `/articles` must stay pre-rendered; do not load cookie-based
  private data on their server path. No new collection without matching Privacy changes.
- Jamie approved the initial Home visual prototype. The full journey has been committed locally;
  its deployment and full live review are not confirmed by that approval. Ticket statuses above are
  the last recorded statuses; check Notion before changing them, and mark Done only after explicit live sign-off.

TKT-71 (domain and subdomain SSO) remains later. Remind Jamie to buy the domain before the first
external subdomain app or public launch; he handles DNS/account access and every secret.


## 2026-11-02 — Resume presentation follow-up (Codex, migration applied)
- Behavioral now says Resume & Stories, with CV/Questions controls beside Add story; the story library is under Questions and the CV opens a story panel only when requested. Separate category sections reuse the existing owner-only Experience entry/bullet editor. Pasted multiline text is supported; existing bullet IDs remain stable. New entries and bullets start hidden, and public flags still control About Me publication. Existing Other entries stay intact and can be recategorised through Type; do not reinterpret or overwrite Claude's imported content.
- Home app display name is About Me (route `/`, internal ID `home`); its London content is unchanged. Closing every window leaves wallpaper and app chrome. Non-Home light-mode surfaces use warm stone tones and neutral searches; content gutters align across Behavioral/Articles/Settings/Projects/Privacy. Notes/Practice retain their panel gutters.
- New migration `20261102194339_resume_sections.sql` only adds certificate/skills to `experience_items_kind_check`. APPLIED live with Jamie’s approval on 2026-11-02, remote version 20261102195356. Ready for Jamie to commit/push and review live. Existing RLS policies, functions, grants, records and publication flags are unchanged. Older owner-policy cleanup was already included in behavioral_stories; no duplicate policy changes are needed.
- Validation: 435 unit/DB tests, typecheck, production build and all four static assertions passed. Full local browser suite: 88 passed / 2 existing skips, including 390 px phone layout. Local neutral-fixture screenshots reviewed. No live website visit, personal data import, secret handling, commit or push. Jamie reviews live after migration/commit/push; no ticket newly marked Done.

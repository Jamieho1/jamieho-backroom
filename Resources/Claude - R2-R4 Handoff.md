# Claude handoff: R2–R4 data imports and cut-over

Prepared 2026-11-01. Read AGENTS.md and MEMORY.md first. Latest local commit at handoff:
`4e668d3` (Home width adjustment); implementation and UI checks passed before that commit.
Jamie pushes; do not assume a local commit proves deployment. Jamie checks the live website himself.

## Implementation available

- TKT-60 desktop, TKT-61 Notes reader, TKT-62 owner Notes editor.
- TKT-64 browser-only Practice arena, TKT-65 owner saved code/attempts and shared question notes.
- TKT-67 Behavioral CV / STAR stories, TKT-68 question bank, mappings, outlines, follow-ups and coverage.
- Home, Projects and Privacy share the public desktop shell; public routes remain pre-rendered.
  Home content spans its padded window width; no global footer or Open my desktop link.
- Last complete validation: 378 unit/DB tests, production build/static assertions; 54 localhost
  headless E2E passed, 2 duplicate phone runtime cases skipped. No production browser checks by Codex.

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

## Outstanding verification and ticket state

- TKT-60/61 and TKT-67 are Done in Notion. Jamie explicitly verified TKT-67 live.
- TKT-62 remains In Progress: owner editor live review needs a note to exist after import.
- TKT-64/65/68 remain In Progress pending explicit live confirmation of their functionality.
  Do not treat a generic instruction to continue as live sign-off.
- After imports Jamie checks owner saves across devices, Notes edit/retry, Practice code/history/notes,
  Behavioral hidden CV access and story links, answer mapping/coverage, and read-only invitee behavior.
- Membership/invitation removal must remove private access through RLS. Public CV rows remain public
  on the landing page separately; uninvited users must not read private CV, stories or answers.
- Public Home/Projects pages must stay pre-rendered; do not load cookie-based private data on their server path.

TKT-71 (domain and subdomain SSO) remains later. Remind Jamie to buy the domain before the first
external subdomain app or public launch; he handles DNS/account access and every secret.

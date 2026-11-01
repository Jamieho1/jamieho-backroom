# Behavioral import contract (TKT-69, Claude)

TKT-67 schema: `20261101104828_behavioral_stories.sql`, approved and APPLIED live on 2026-11-01
(remote version `20261101105507`). Claude handles imports from the published artifact; Codex does not
copy personal data. Never put CV or story text in git.

Reuse `experience_items` and `experience_bullets`; do not duplicate CV tables. New items/bullets default
to hidden; preserve that default when importing. Map source CV bullet IDs to destination bullet UUIDs.
Do not overwrite newer destination edits on a repeated import.

`behavioral_stories` fields:

| Field | Mapping / limit |
| --- | --- |
| id | Stable UUID per source story for repeatable upserts |
| bullet_id | Destination experience_bullets UUID, or null for an unlinked story |
| title | Required, 1–160 characters |
| situation, task, action, result | STAR text, up to 20,000 characters each |
| skills | Plain text, up to 1,000 characters; join source skill labels |
| numbers | Plain text, up to 2,000 characters; leave empty if absent in source |
| updated_at | Original timestamp; application updates refresh it through a trigger |

A story links to one bullet, matching the predecessor's optional bulletId. Multiple stories may link
to the same bullet. Deleting a bullet leaves its stories unlinked; they remain available in All stories.
Stories are readable only under Behavioral app access (Invite-only by default); owner-only writes.
Public Experience bullets remain publicly readable separately, without stories. No AI drafting or calls.

The TKT-68 question-bank schema below is required before the TKT-69 full import. Jamie checks invite access,
owner edits, story counts and hidden-bullet visibility after deployment/import. Do not mark Done without
his live confirmation.

## TKT-68 question preparation

Migration `20261101110015_behavioral_answers.sql` was approved and APPLIED live on 2026-11-01
(remote version `20261101110756`). The answer table is ready for import. Generic prompts are in `lib/behavioral/questions.ts`; its IDs are stable and
preserve the predecessor's 22 `g-*` and 15 company IDs. All text is generic; no personal background
or company-specific answer advice is embedded in code. Each prompt has one primary coverage theme.

Upsert `behavioral_answers` on `question_id`:

| Field | Mapping / limit |
| --- | --- |
| question_id | Exact ID in the static catalog; do not map by array position |
| primary_story_id | First destination behavioral_stories UUID, or null |
| secondary_story_id | Second, different destination story UUID, or null |
| outline | Answer outline text, at most 20,000 characters |
| followups | Follow-up preparation text, at most 10,000 characters |
| updated_at | Original timestamp on initial insert; updates refresh through trigger |

Build the stable source-story → destination UUID mapping first. Missing mappings should stay null;
do not invent stories. Join source follow-up arrays into readable plain text if necessary. Do not
silently truncate a source list with more than two stories: choose with Jamie or preserve it for review.
Unknown/custom/deep-dive question IDs are not supported by this static bank; preserve those in the
source and report them for review rather than dropping them or importing unreachable answers.

Reruns must not overwrite newer destination edits. Answer rows follow Behavioral access and owner-only
writes. Coverage is derived, never imported: each question with at least one existing linked story
counts once toward its primary theme, regardless of outlines or filters. Deleted stories set links null;
answer text survives. Jamie verifies owner edits and read-only invitee access before Done.

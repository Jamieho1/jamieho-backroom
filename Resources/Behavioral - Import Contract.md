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

TKT-68 will add the question-bank schema before the TKT-69 full import. Jamie checks invite access,
owner edits, story counts and hidden-bullet visibility after deployment/import. Do not mark Done without
his live confirmation.

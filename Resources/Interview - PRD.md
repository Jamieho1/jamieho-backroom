# Interview — sidebar workspace for practice, notes, resume and behavioral

Status: draft for sign-off (2026-11-14). Settled in the grill of 2026-11-14 (reference: techprep.app layouts Jamie supplied; Behavioral checked live in his Chrome). Builds after TKT-107/108 (Content Drafts) and **before** Home v1.3. Supersedes TKT-100 (layout pass for Notes, Practice and Resume & Stories).

**Problem:** Notes, Practice and Resume & Stories are separate apps tucked inside Resources, with a top bar layout and no shared structure. Jamie wants one Interview area that works like TechPrep: a sidebar of sections (DSA, System Design, Low Level Design, Finance, AI Engineering, Resume, Behavioral, Tools), topic lists with coloured icons, per-user progress, a resume each user builds from an anonymised template, and a question-based behavioral playbook.

**Outcome and completion:** `/interview` is a sidebar-only workspace linked from the top bar. Every signed-in user has their own progress, resume and behavioral answers; Jamie edits the shared content and never sees other users' data. Done when every section in Scope works on desktop and 390 px, access rules are enforced by the database, and Jamie confirms live.

## Scope

**In:**

1. **Entry and addresses.** Top bar: Journey · My story · Projects · **Interview** · Articles · Resources · Privacy. Inside `/interview` there is no top bar.

   | Page | Address |
   |---|---|
   | Dashboard (placeholder) | `/interview` |
   | Section practice / one topic's questions | `/interview/<section>/practice` · `/interview/<section>/practice/<topic>` |
   | Section notes / one topic's note | `/interview/<section>/notes` · `/interview/<section>/notes/<topic>` |
   | One question's workspace | `/interview/problems/<id>` |
   | Resume · Behavioral | `/interview/resume` · `/interview/behavioral` |
   | Companies · Roadmaps · Application Tracker (placeholders) | `/interview/companies` · `/interview/roadmaps` · `/interview/applications` |

   Sections: `dsa`, `system-design`, `low-level-design`, `finance`, `ai-engineering`. Old `/notes`, `/practices`, `/practices/<id>`, `/behavioral` keep working during the build and are deprecated afterwards (Claude recommends permanent redirects; Jamie decides at the end). Resources keeps only Guides; the Notes, Practice and Resume & Stories cards and their locked previews leave it.
2. **Sidebar (dark theme only for now; light mode later).**
   - Section rail, expanded: logo (to the homepage); Dashboard; **Interview Skills:** Data Structures & Algorithms · System Design · Low Level Design · Finance · AI Engineering; **Career:** Resume · Behavioral; **Tools:** Companies · Roadmaps · Application Tracker; bottom: Feedback, Back to site, sign-in/account.
   - Section rail, collapsed: icons only, names on hover.
   - Topic list: collapse button; a **Notes** button at the top (reads **Practice** while in Notes) that switches mode for the same topics; topics with their own coloured line icons (own designs, topic colours already in `lib/notes/topics.ts`), lock or "Soon" tags where relevant. Collapsed, it disappears completely, leaving a small expand button at the top of the content.
   - Collapse states remembered per browser. Phones: section rail becomes a slide-in drawer from a menu button; topic list sits under a "Topics ▾" button; content full width, no sideways scroll.
3. **Sections and content.**
   - Each section opens on **Practice**. Practice topic page: searchable list of questions with name, tags, **flag** and **complete** tick; clicking opens the question's own workspace page (the existing practice workspace). Notes mode: a section notes main page (designed later) and topic → the existing note page.
   - **Data Structures & Algorithms:** the 17 coding topics (notes + practice problems from `lib/practice/problems`).
   - **System Design:** existing `sd-*` notes as topics; new notes appear automatically. No practice questions yet.
   - **Low Level Design:** the "Class design / stateful" note moves here as the first topic. No practice questions yet.
   - **Finance** and **AI Engineering:** empty topic lists with a "Soon" page until Jamie adds notes.
   - Sections without practice questions show Practice greyed out with "No practice questions yet".
4. **Access and roles.**
   - Notes, Practice, Resume and Behavioral are open to everyone; opening Notes asks visitors to sign in (existing Google sign-in).
   - Shared content (notes, questions, guides, template) is edited only by Jamie, through Content Drafts or the existing editors.
   - Each signed-in user has private data only they can read or change: flags, completion, saved code, resume, behavioral answers and custom questions. Jamie sees everything unlocked but never other users' data. Enforced by RLS with tests.
   - Signed-out visitors see questions and guides but no flags/ticks; their code stays in their browser as today.
   - Membership-gate code stays in the codebase for future courses; it is not used by these sections.
   - Placeholders (Dashboard, Finance, AI Engineering, Companies, Roadmaps, Application Tracker, Behavioral Course) show a "Soon" tag and a short page.
5. **Per-user progress.** New per-user records for practice flags, completions and saved code (pattern: article pins). Flag replaces today's owner-only star; complete = a passed submit. Jamie's existing stars, attempts and saved code migrate to his own user records.
6. **Resume (per user, Career → Resume).**
   - Each signed-in user gets a private resume workspace (entries, bullets, education, certificates, skills) they edit and keep.
   - Jamie's resume appears only as an **anonymised template**: his CV's structure with placeholder content (e.g. "Software Engineer · Company A · 2024–present", generic bullets, "MEng · University B"), keeping his real certificates and skills. Written once by hand (Claude drafts it from the CV's shape; Jamie approves through Content Drafts), never generated from his live data.
   - New user: template shown read-only as a guide, with **Start from template** (copies the structure into their workspace) or **Start blank**.
   - Jamie's real CV stays his own data; the homepage and journey keep reading his public CV entries as today.
7. **Behavioral (Career → Behavioral), question-based, two tabs like TechPrep.**
   - **Playbook (built now):** questions grouped by theme (Conflict, Failure & learning, Leadership, Ambiguity, Ownership, Impact, Teamwork, Customer focus, Why us / Why you), searchable, status filter (answered / not). Each question page: Jamie's guide — what interviewers are looking for, what you might talk about, a STAR structure, common mistakes, likely follow-ups and a generic sample answer — plus the user's own private STAR answer (Situation, Task, Action, Result), optionally tagged to a role on their own resume. Users can **Create** their own questions. Progress "answered X of Y" per theme.
   - **Course (placeholder "Soon"):** later lessons from Jamie's YouTube content.
   - The CV-bullet → story mapping and coverage strip are retired. Jamie's existing stories and answers move into his own private workspace.
8. **Feedback.** "Report a problem / Suggest an idea" in the sidebar bottom and the site top bar: type (problem / idea), message, optional page link auto-filled; lands in the Settings inbox with the existing validation, honeypot, rate limit and email alert.

**Later (not in this build):** email-list opt-in (Creator, Articles, Resources); resume PDF export, ATS guidance and job-tailored versions linked to the Application Tracker; Behavioral PDF export; Behavioral Course lessons; Dashboard, Tools and Notes main-page designs; light mode; removing the old addresses.

**Not wanted:** AI features (e.g. "AI Enhance"); Jamie viewing other users' data; questions generated from CV sentences.

## Canonical locations/data

- Code: this repo. Spec: this file. Prompts: `Resources/Prompts - Interview.md`. Tickets: Notion Tickets (project `40858664-d2d2-8191-b83d-f677a1e28165`); map in `Resources/Tickets - Dependency Map.md`.
- Existing sources: `lib/notes/topics.ts` (topics/colours), notes table (DSA, `sd-*`, `class-design`), `lib/practice/problems` (catalogue in code), practice tables (owner-only today), behavioral tables and question bank in code, `components/site-navigation.tsx`, `lib/resources.ts`, contact/inbox pipeline.
- Database changes (new migrations, applied only after "apply it"): per-user practice progress; per-user resume and behavioral workspaces plus template content; section assignment for notes (System Design / LLD / Finance / AI Engineering); app visibility set to open; feedback message type; Content Drafts allowlist entries for any new shared-content tables.

## Constraints

- RLS enforces every rule: own-row access for user data, owner-only writes for shared content, no owner read of other users' data (owner tooling must not bypass this).
- Privacy policy and encrypted exports updated for the new per-user data before launch.
- No runtime AI calls; no server-side code execution (Pyodide stays in the browser).
- Practice problem catalogue stays in code; own-words content only.
- Animate transform/opacity only; no horizontal overflow at 390 px; reduced motion respected.
- Jamie pushes; ChatGPT builds from per-ticket prompts following `AGENTS.md` and `docs/`; Claude checks each landing and migration.

## Build plan

1. **Gate:** TKT-107 done and TKT-108 closed.
2. **Shell:** `/interview` layout, section rail + topic list (both collapse modes, memory, phone drawer), dark theme, Interview top-bar link, Resources trimmed to Guides, placeholder pages, coloured topic icon set.
3. **DSA / System Design / Low Level Design:** Practice topic lists (search, tags, flag/tick placeholders until step 4), Notes switch, workspace page at `/interview/problems/<id>`, section assignment for notes (moves Class design to LLD), Finance/AI Engineering empty states.
4. **Per-user progress** (migration): flags, completions, saved code per user; migrate Jamie's data; wire flags/ticks. *Gate: "apply it".*
5. **Resume** (migration): per-user workspace, template content, Start from template / blank. Claude drafts the anonymised template for Jamie to approve. *Gate: "apply it".*
6. **Behavioral Playbook** (migration): themes, questions, guides, private answers, custom questions, Course placeholder; move Jamie's stories/answers to his workspace. Claude drafts guide text through Content Drafts. *Gate: "apply it".*
7. **Feedback** entry points and inbox type.
8. **Access:** apps open to everyone, sign-in prompt on Notes, privacy/export updates.
9. **Verification:** full checks, desktop + 390 px, a second test account proving isolation; Jamie confirms live. Then Home v1.3.

## Verification and handoff

- Database policy tests for every new table (own-row only, owner-only shared writes, owner cannot read others).
- Browser tests at desktop and 390 px: rail collapse to icons, topic list collapse/expand, Notes↔Practice switch keeps the topic, search, flag/tick per user, workspace page, Start from template, Behavioral answer save, feedback submit, locks/"Soon" items, no sideways scroll.
- Two-account check (owner + test user): neither sees the other's progress, resume or answers.
- Typecheck, full suite, build and static assertions per `docs/operations.md`; docs (`architecture`, `security`, `status`, new `interview` topic) and MEMORY.md updated; migrations recorded applied/pending.
- Rollback: the shell is additive under `/interview`; old pages remain until deprecated; migrations are additive.

## Open questions

- Behavioral theme list and starter questions: Jamie confirms before step 6 (Claude proposes from the existing bank and TechPrep's playbook shape, own wording).
- Exact table/column names are left to the build tickets.

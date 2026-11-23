# Build prompts — PassLoop practice workspace (DSA + Low Level Design)

Paste one at a time into ChatGPT (or hand to a Sonnet agent), in order: **P1 → P2 → P3 → P4**. Each ticket ends with a stop for Jamie to push and review. Shared rules for every ticket: read AGENTS.md, docs/README.md, docs/status.md, docs/interview.md and docs/security.md first and follow them (Jamie pushes; never push; new migrations only, applied live only after Jamie says "apply it"; no runtime AI calls; no server-side code execution — Python runs in the browser with Pyodide; own-words content only; transform/opacity animation; desktop + 390 px + reduced motion; update docs/ + MEMORY.md after).

Reference products for layout/behaviour only (no copying text, images or code): techprep.app problem page (LRU Cache, Low Level Design) and neetcode.io problem page.

Applies to both Interview Skills sections that have practice: Data Structures & Algorithms and Low Level Design (same page design; only the topic list and question type differ).

---

## P1 — Workspace layout, editor controls, shortcuts, autosave

```
Ticket P1 (PassLoop practice workspace). Read the shared rules at the top of Resources/Prompts - PassLoop Practice.md and follow them.

Build on the existing question workspace (/interview/problems/<id>):
1. Sidebar: when the PassLoop rail is collapsed, show NO logo — only the expand button, in the same top row height as the expanded brand row.
2. Top bar of the workspace: "‹ ›" previous/next buttons and a breadcrumb button showing the question's TOPIC (e.g. "Sliding Window", "Caching") — the topic the question is listed under in the section's list, not the section name. ‹ › move through every question of the current section (e.g. all DSA, or all Low Level Design) in list order, crossing topic boundaries. Clicking the topic button opens a slide-in drawer (left) with the full section list grouped by topic: search box, per-question done/flag icons, current question highlighted and scrolled into view; Escape/close button; phone = full-screen sheet.
3. Layout: left = description panel (tabs: Problem · Solution · Submissions · Notes — Submissions content comes in P3, show a placeholder now). Right = vertical split: code editor on top, console panel below, divider draggable up/down (min sizes, remembered per browser). The existing left/right divider resizes the description vs the whole right column (editor and console move together).
4. Fixed bottom bar of the right column: "Console / Test" toggle (chevron), "Run" and a green "Submit". The bar stays visible when the console is collapsed; the toggle collapses/expands the console panel (remembered).
5. Editor controls in the editor header: language label (Python), reset to starter code (confirm dialog), fullscreen editor, collapse/expand description panel, and a "?" button opening a shortcuts panel. Shortcuts: ⌘/Ctrl+Enter = Run, ⌘/Ctrl+Shift+Enter = Submit, ⌘/Ctrl+S = save now, Esc = exit fullscreen/close panels. Shortcuts work while focus is in the editor and never fire inside other text inputs except the editor.
6. Autosave: code saves as you type (debounced ~800 ms) for signed-in users to their existing per-user saved code, and to localStorage for visitors; show a quiet status ("Saved" / "Saving…" / "Offline — saved locally"); remove the manual "Save code" button (⌘S still forces a save). Never lose code on navigation (flush on route change/unload).
7. Phones (≤900 px): stacked — description, then editor, then console; bottom bar sticky; drawer full-screen.

Done when: unit tests for prev/next ordering across topics and the topic label; browser tests desktop + 390 px for collapsed sidebar, drawer search/highlight, divider drags, console toggle, reset, fullscreen, shortcuts, autosave (reload keeps code); typecheck, suite, build, static assertions pass; docs/interview.md updated. Report checks actually run.
```

---

## P2 — Test cases, Run/Submit results, class-design runner

```
Ticket P2. Read the shared rules at the top of Resources/Prompts - PassLoop Practice.md. Requires P1.

1. Console panel tabs: "Test Cases" and "Output".
   - Test Cases: case tabs (Case 1, Case 2, …) prefilled from the question's visible examples; each case shows its inputs in editable fields; "+" adds a custom case (copy of the current one), "×" removes custom cases; custom cases are kept per user/question (localStorage for visitors, per-user storage for signed-in users — reuse existing per-user tables or add a migration).
   - Output: after Run, per-case result chips (✓/✗), and for the selected case: input, your output, expected output (when known), and stdout (print output, truncated with "show more"). Runtime/compile errors shown as a red block with the Python traceback trimmed to the user's code.
2. Run = visible + custom cases. Submit = all local tests in the catalogue for that question; show "Accepted N/N" or "Wrong answer — first failing case" (input/expected/output) or "Runtime error"; show runtime in ms measured in the browser. Keep the existing per-user attempt/completion recording (complete = accepted submit).
3. Class-design questions (needed for Low Level Design, e.g. LRU Cache): support a test format with `operations` (["LRUCache","put","get",…]) and `arguments` ([[2],[1,1],[1],…]). The runner instantiates the class with the first operation, calls each method in order, and compares the list of return values (None→null) with the expected list. Starter code is a class with typed method stubs plus a commented usage example. Function-style questions keep working. Add the LRU Cache question to Low Level Design with own-words description, constraints, 2 visible examples and ≥10 local tests.
4. Keep the problem catalogue in code (lib/practice/problems); extend its types for the class-design format with zod validation and unit tests.

Done when: unit tests for the runner (function and class-design formats, None/null mapping, errors, timeouts — a per-case time limit with a clear "Time limit exceeded"), custom cases persistence; browser tests for Run/Submit on Contains Duplicate and LRU Cache (pass, wrong answer, runtime error) desktop + 390 px; typecheck, suite, build, static assertions; docs updated. Report checks actually run.
```

---

## P3 — Submissions tab and complexity inputs

```
Ticket P3. Read the shared rules at the top of Resources/Prompts - PassLoop Practice.md. Requires P2.

1. Complexity inputs: a slim row at the bottom of the code editor area (above the console) with two short text fields "Time" and "Space" (placeholders "e.g. O(n)", "e.g. O(1)"), saved with autosave per user/question.
2. Every Submit stores a submission per user (new table or extend practice_attempts via a migration; own-rows RLS exactly like other per-user practice data; owner cannot read others' rows; policy tests): status (accepted / wrong answer / runtime error / time limit), passed/total, runtime ms, language, created_at, code snapshot, typed time and space complexity.
3. Submissions tab (in the description panel, after Solution, before Notes): newest first; each collapsed row shows status (coloured), passed/total, language, runtime, relative time, and "Yours: O(n) · O(n)  |  Expected: O(n) · O(n)" side by side (expected comes from the question's solution data; NO right/wrong mark). Expanding a row shows the read-only code snapshot with a "Load into editor" button (confirm before overwriting). Visitors see a sign-in prompt.
4. Privacy policy and encrypted export manifest updated for the new data.

Done when: DB policy tests (own rows only, owner blocked from others), unit tests, browser tests desktop + 390 px (submit → row appears, expand shows snapshot, load into editor); migration recorded NOT applied — stop and ask Jamie for "apply it"; typecheck, suite, build, static assertions; docs + privacy updated. Report checks actually run.
```

---

## P4 — Problem content: examples, follow-ups, solutions, related questions

```
Ticket P4. Read the shared rules at the top of Resources/Prompts - PassLoop Practice.md. Requires P1.

1. Examples: drop the "Examples" heading; render "Example 1", "Example 2" blocks with a coloured vertical line on the left (topic colour) — input/output/explanation in mono.
2. Follow-ups: after Hints, a "Follow-up" block with 1–2 follow-up questions per problem (e.g. "Can you implement get and put in O(1) average time?", "What if the input is streamed and doesn't fit in memory?"). Add a `followUps` field to the catalogue type and write own-words follow-ups for every existing question.
3. Solution tab: several approaches per question (e.g. Brute force → Hash set → Sorting), each with a short explanation, Python code, and Time/Space complexity badges; the first "Expected" complexity used by P3 is the optimal approach's. Extend the catalogue type; write content for every existing question (own words).
4. Related questions: at the bottom of the Problem tab, up to 5 questions from the same concept/topic as listed in Notes (same topic first, then same section), with difficulty and done status, linking to their workspaces.
5. Notes tab unchanged.

Done when: unit tests for the catalogue schema (every question has ≥1 follow-up and ≥1 approach with complexity; related questions exclude itself), browser tests desktop + 390 px for examples, follow-ups, solution approaches and related links; typecheck, suite, build, static assertions; docs updated. Report checks actually run.
```

---

## P5 — Shared concepts between Low Level Design and DSA

```
Ticket P5. Read the shared rules at the top of Resources/Prompts - PassLoop Practice.md. Requires P4 (related questions, follow-ups, solutions are in place). No migration: content lives in the code catalogue.

Goal: each question keeps ONE home section (no duplicates across DSA and Low Level Design); sections are linked through shared concept tags.
1. Data: add `concepts: string[]` to every practice question in the catalogue, using the SAME ids as the DSA note topics in lib/notes/topics.ts (e.g. hash-map, linked-list, heap, sliding-window, two-pointers, tree, graph, stack, queue…). Optional `prerequisites: string[]` (question ids) for harder questions. zod-validate: every concept id exists in the topics list; every prerequisite id exists; no self-reference. Fill concepts for every existing question (DSA and LLD); add prerequisites for LLD questions where a DSA question is the natural warm-up (e.g. LRU Cache → a hash-map question and a linked-list question if present in the catalogue).
2. LLD (and any question with concepts outside its own topic): under the title, a "Builds on" row of small chips (topic colour + name); each chip links to that DSA topic's Notes page. Chips use the site's gold hover, not plain links styling.
3. "Practise first" line (only when prerequisites exist): links to those questions with difficulty + done tick.
4. DSA notes pages: a "Used in design" block listing Low Level Design questions whose concepts include that note's topic (name, difficulty, done tick), hidden when empty.
5. Related questions (from P4): rank shared-concept matches first regardless of section, then same topic, then same section; max 5; exclude itself.
6. Section lists, the topic drawer and ‹ › stay within the current section (unchanged).
Done when: unit tests (schema validation, concept ids exist, related ranking across sections, "Used in design" lookup), browser tests desktop + 390 px (Builds on chips on LRU Cache link to the right notes, Practise first links, Used in design block on the linked-list note); typecheck, suite, build, static assertions; docs/interview.md updated. Report checks actually run.
```

---

# Companies (Tools → Companies)

Layout reference: techprep.app/companies and /companies/google (structure only — no copying of their text, data, logos or question lists). All content is Jamie's own, entered through Content Drafts. No paywall: everything visible (sign-in only for personal progress).

## C1 — Companies data model and directory

```
Ticket C1 (PassLoop Companies). Read the shared rules at the top of Resources/Prompts - PassLoop Practice.md and follow them.

1. Migration (NOT applied until Jamie says "apply it"; policy tests): 
   - companies: id uuid, slug (unique, kebab), name, logo_path (optional home-media path; '' = monogram), overview (Markdown), sort, public, timestamps.
   - company_questions: id, company_id, kind ('coding' | 'system_design' | 'low_level_design'), section label for coding ('Data Structures & Algorithms' | 'SQL' | …), question_ref (practice problem id from the code catalogue, or a notes/system-design topic id), rank (frequency order, lower = more frequent), public.
   - interview_experiences: id, company_id, slug, title, level ('Junior'|'Mid'|'Senior'|'Staff'|'Other'), role, interview_date (month), region, body (Markdown), published, published_at. Anonymous by default (no author field).
   RLS: anyone reads public/published rows; only the owner writes (existing owner check). Add all three tables to the Content Drafts allowlist (TS + SQL apply functions, mirroring existing patterns) with preview overlay support. Validate question_ref against the catalogue in the TS allowlist (unknown ids refused).
2. /interview/companies (sidebar Tools → Companies; remove its "Soon" placeholder): title "Companies", search box ("Search N companies"), sort select (A–Z, Most questions), responsive card grid (5 / 3 / 2 / 1 columns): logo or a monogram tile (first letters on a colour derived from the name), name, "N questions", chevron; whole card links to the company page. Empty state when there are no companies yet.
3. Logos: optional; if logo_path is set use it from home-media (small, 20–24 px, alt "<name> logo"); otherwise the monogram. Never fetch logos from third-party sites.

Done when: DB policy tests; unit tests for search/sort and monogram; browser tests desktop + 390 px with fixture companies; typecheck, suite, build, static assertions; docs/interview.md + security.md updated; migration recorded NOT applied. Report checks actually run.
```

## C2 — Company page: tabs, question lists, overview

```
Ticket C2. Read the shared rules at the top of Resources/Prompts - PassLoop Practice.md. Requires C1 (migration applied).

/interview/companies/[slug]:
1. Desktop layout: PassLoop rail, then a narrow companies list column (search + scrollable list with logos/monograms, current highlighted, collapsible like the topic list), then the content. Phones: the companies list becomes a "Companies ▾" sheet.
2. Header: logo/monogram + name, a "Search questions" box and a "Status" filter (All / To do / Done / Flagged — uses the signed-in user's existing practice flags and completions; visitors see All only). Tabs: Overview · Coding · System Design · Low-Level Design · Interview Experiences (tab in the URL, e.g. ?tab=coding).
3. Overview: the company's Markdown overview with an "On this page" sticky TOC from ## headings, a "Practice" box (Coding N Qs · System Design N Qs · Low-Level Design N Qs linking to the tabs) and "Latest interview experiences" (3 newest, linking to C3 pages).
4. Coding: "Ordered by most frequently asked within each section"; grouped by section label; list rows: topic-colour icon, question name, difficulty badge, flag + done controls (existing per-user practice state); grid/list toggle; row opens the question workspace (/interview/problems/<id>) and the workspace's ‹ › stay as today.
5. System Design and Low-Level Design: two-column cards (icon, title, small "Problem statement · Solution" meta, flag/done, chevron) linking to the existing system-design notes / LLD question pages.
6. Search and status filter apply across the current tab; empty states for tabs with no items.

Done when: unit tests (grouping/ranking, filters, URL tab), browser tests desktop + 390 px (directory → company → each tab → open a question), typecheck, suite, build, static assertions; docs updated. Report checks actually run.
```

## C3 — Interview experiences

```
Ticket C3. Read the shared rules at the top of Resources/Prompts - PassLoop Practice.md. Requires C2.

1. Interview Experiences tab: list of published experiences for the company (title, level · role · month year · region, 2-line excerpt, published date), newest first, filter by level.
2. Detail page /interview/companies/[slug]/experiences/[experience]: "← All interview experiences", company chip · level · role · month year · region, big title, "By an anonymous member · Published <date>", Markdown body (## sections like Recruiter, Technical screen, Onsite, Outcome). Right sidebar (desktop): "More from <company>" (up to 3) and "More at <level>" across companies (up to 5); phones: these move below the article.
3. No votes/comments/premium box for now.
4. Content Drafts: experiences are drafted and approved like other content; preview overlay works on these pages.

Done when: unit tests (related lists), browser tests desktop + 390 px, typecheck, suite, build, static assertions; docs updated. Report checks actually run.
```

## C4 — "What to prepare" links in interview experiences + role notes

```
Ticket C4. Read the shared rules at the top of Resources/Prompts - PassLoop Practice.md. Requires C3.

Goal: an interview experience stays short; instead of re-explaining topics it links to the site's own notes, questions and guides so readers know what to study and practise.
1. Role notes: Role sections (Full-Stack, Finance Engineering, AI Engineering, FDE, Data Science, Machine Learning) can hold notes topics like the existing sections (reuse the notes table's section assignment; add 'full-stack' etc. as sections if missing — migration only if needed, NOT applied until "apply it"). Each role page shows its note topics instead of "Soon" once it has at least one note (keep "Soon" when empty). Example future topic: Full-Stack → "Locking mechanisms". Notes are created/edited through Content Drafts as today.
2. Prep links on experiences: add `prep_links` to interview_experiences — an ordered list of {kind: 'note' | 'question' | 'behavioral_theme', ref, label?} where ref is a notes topic id, a practice question id or a behavioral theme id. Validate refs (TS allowlist + SQL check on shape; unknown refs refused). Allowlist in Content Drafts with preview support.
3. Rendering on the experience page: a "What to prepare" block after the article (and a compact copy in the right sidebar on desktop): grouped as Concepts (notes) · Practice (questions, with difficulty + the reader's done tick) · Behavioral (themes, with "answered X of Y" for signed-in users). Each item links to its page. Hide empty groups.
4. Inline references: in experience Markdown, `[[note:locking]]`, `[[question:lru-cache]]` and `[[behavioral:conflict]]` render as small linked chips (unknown refs render as plain text and are reported in Content Drafts validation).
5. Company Overview tab: a "Most-mentioned topics" box aggregating prep_links across that company's experiences (top 8 by count), linking to each topic.
Done when: unit tests (ref validation, chip parsing, aggregation), DB/policy tests if a migration was added, browser tests desktop + 390 px; typecheck, suite, build, static assertions; docs updated. Report checks actually run.
```

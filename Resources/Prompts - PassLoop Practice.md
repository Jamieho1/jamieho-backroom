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

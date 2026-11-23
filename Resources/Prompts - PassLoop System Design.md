# Build prompts — PassLoop System Design (solution page, quiz, whiteboard)

Paste in order: **S1 → S2 → S3 → S4**. Shared rules for every ticket: read AGENTS.md, docs/README.md, docs/status.md, docs/interview.md and docs/security.md first and follow them (Jamie pushes; never push; new migrations only, applied live only after Jamie says "apply it"; **no runtime AI calls — no AI hints, no AI feedback**; own-words content only; desktop + 390 px + reduced motion; update docs/ + MEMORY.md + docs/decisions.md after).

Layout reference only (no copying of text, quiz questions, diagrams or code): techprep.app system design solution, quiz and whiteboard pages.

Approved dependency (decision 2026-11-23): `@excalidraw/excalidraw` (MIT) for the whiteboard canvas only — loaded with next/dynamic on the whiteboard route, never in other bundles. No other new dependencies.

---

## S1 — System design question page: Solution + Quiz

```
Ticket S1. Read the shared rules at the top of Resources/Prompts - PassLoop System Design.md.

1. Routes: /interview/system-design/<slug> (tabs in URL: ?tab=solution|quiz|whiteboard). The section's practice/notes list links here for system-design questions. Existing sd-* notes stay readable; a system-design question can reference its note.
2. Layout (desktop): PassLoop rail · question list column ("← All system design", questions with done ticks, current highlighted, collapsible like the topic list) · content · sticky "On this page" TOC on the right built from the solution's ## headings, highlighting the current section while scrolling, with a back-to-top button. Header: question icon + title, flag and done controls (existing per-user practice state). Phones: list → "Questions ▾" sheet, TOC → collapsible "On this page" at the top.
3. Solution tab: Markdown body in the agreed order (Overview, Requirements, Data Model, API Design, Key Questions, Basic design, Advanced design, main flows, Additional discussion points). Support a fenced block ```table-schema (JSON: table name + columns name/type/pk) rendered as a styled table-diagram card, and ```diagram blocks rendered by the existing data-driven diagram component. No video.
4. Quiz tab: card "<Question> · Quiz · N Qs" + "Start quiz"; attempts list (score, date) per signed-in user (visitors can take it, attempts kept in localStorage only). Quiz runner: "1 / N" progress, question, 4 options (keyboard 1–4), "Don't know" (counts as wrong); after answering show correct/incorrect + short explanation, "Next"; final score screen with review of wrong answers. NO AI hint button.
5. Data: system-design questions (slug, title, icon, section topic, note ref, solution Markdown, quiz [{q, options[4], answer index, explanation}], step definitions for S3, public, sort) in a new table editable through Content Drafts (allowlist TS + SQL apply function), plus per-user quiz attempts (own-rows RLS, owner can't read others; policy tests). Migration NOT applied until "apply it".
Done when: unit tests (TOC from headings, table-schema parsing, quiz scoring), DB policy tests, browser tests desktop + 390 px (TOC highlight, quiz flow, attempts), typecheck, suite, build, static assertions; docs + privacy/export updated. Report checks actually run.
```

---

## S2 — Whiteboard canvas, template and component library

```
Ticket S2. Read the shared rules at the top of Resources/Prompts - PassLoop System Design.md. Requires S1. Add @excalidraw/excalidraw (pin an exact version), dynamically imported only on the whiteboard route.

1. Route /interview/system-design/<slug>/whiteboard (also reachable from the Whiteboard tab): full-height workspace — left panel (S3 fills it; placeholder now) and right Excalidraw canvas, with a draggable divider. Top bar: question title, timer (start/pause/reset), history button (S3), list/back button.
2. Canvas: dark theme matching PassLoop, tools (lock, hand, select, rectangle, diamond, ellipse, arrow, line, text), zoom +/- with %, undo/redo, help "?". Disable Excalidraw features we don't want (collaboration, export to their cloud, image upload, AI/"text to diagram").
3. Starting template generated from the question data: title + one-line "what you need to do"; frames "Functional Requirements" (prefilled list from the question, as the interviewer would give it), "Non-Functional Requirements", "Core Entities", "API Design" (empty, with a small grey example beside each frame) and a large "High-Level Design" frame. Template is built as Excalidraw elements in code (no binary assets).
4. Library panel (Excalidraw library): own-designed simple blocks — Client, Server, Multi-instance Server, API Gateway, Load Balancer, Message Queue, Database, Cache, CDN, Object Storage, Worker, DNS — searchable, drag onto the canvas.
5. Autosave the canvas per user/question (debounced) to a per-user table (own-rows RLS, policy tests; migration NOT applied until "apply it"); visitors autosave to localStorage. "Reset board" (confirm) restores the template.
6. Phones: whiteboard shows a friendly "Best on a larger screen" note with a read-only template preview and a button to continue anyway.
Done when: unit tests (template generation per question, library items), DB policy tests, browser tests desktop (canvas loads, template frames present, library drag, autosave + reload) and 390 px (fallback note); bundle check that Excalidraw is not in other routes' chunks; typecheck, suite, build, static assertions; docs updated. Report checks actually run.
```

---

## S3 — Interview steps, voice/text answers, compare with model answer, history

```
Ticket S3. Read the shared rules at the top of Resources/Prompts - PassLoop System Design.md. Requires S2.

1. Left panel step navigator: ‹ › and step dots (e.g. 1 Non-functional, 2 Core entities, 3 API design, 4 High-level design, 5–8 deep dives such as "redirect flow", "scaling reads", "short-code generation", "caching"), defined per question. Each step: category label, the interviewer's question, what to do ("Write your answer in the purple box on the whiteboard…" or "Revise your design and explain…"), and the target time ("Spend ~2 minutes in a real interview"). Navigating a step highlights/zooms to its canvas frame.
2. Answer input per step: text box, or voice mode using the browser's built-in Web Speech API (SpeechRecognition) for dictation where supported — mic button, live transcript into the text box, "Switch to text mode"; hide voice mode where unsupported. Show a one-line notice that voice uses the browser's speech service. Nothing is sent to our servers except the saved text.
3. "Compare with model answer" (replaces AI feedback): reveals that step's model answer (Markdown) and a checklist of key points; the user ticks the points they covered; shows "You covered X of Y" — no automatic grading, no AI.
4. Tabs under the step: "How to answer" (approach, Markdown) and "Ask clarifying questions" (a list of common candidate questions; clicking one reveals the interviewer's pre-written answer).
5. History: each "Finish attempt" saves a snapshot (canvas JSON, per-step answers, checklist ticks, timer value, created_at) per user (own-rows RLS, policy tests; same migration family, NOT applied until "apply it"); history drawer lists attempts; opening one loads it read-only with "Restore to board".
Done when: unit tests (step model, checklist scoring, history serialisation), DB policy tests, browser tests desktop (step navigation + frame focus, text answer, compare/checklist, clarifying Q reveal, finish + history restore; voice button hidden when SpeechRecognition is absent), typecheck, suite, build, static assertions; docs + privacy (voice notice) updated. Report checks actually run.
```

---

## S4 — Tiny URL content end to end

```
Ticket S4. Read the shared rules at the top of Resources/Prompts - PassLoop System Design.md. Requires S1–S3 applied live.

Write own-words content for ONE question, Tiny URL (URL shortener), and insert it as a live Content Drafts set (summary + operations only; Jamie approves):
- Solution Markdown in the agreed section order, including a table-schema block for the urls table and a high-level design diagram block.
- Quiz: 15–20 multiple-choice questions with explanations.
- Whiteboard: functional requirements list, examples for each frame, 8 steps (non-functional, core entities, API, high-level design, redirect flow, short-code generation, scaling reads/caching, analytics or expiry), each with interviewer question, what to do, target time, model answer, 4–6 checklist points, "how to answer" text and 4–6 clarifying questions with interviewer answers.
Use only general, well-known system design knowledge; no copied text from any site. Report the draft id and a short outline for Jamie's review.
```

# Prompts — small fixes

Standalone tickets that don't depend on Content Drafts or Home v1.3. Paste into ChatGPT (with repo access) whenever convenient; tell Claude when each lands.

---

## TKT-117 — Smaller covers and in-body pictures for Articles and Resources (Guides); post<N>-<slug> upload folders

```
You are working in the jamieho-backroom repo. First read AGENTS.md, docs/README.md, docs/status.md and docs/architecture.md and follow them (Jamie pushes; never push; update docs/ + MEMORY.md after the change). Ticket: TKT-117 (Notion). No database change.

Problem (Jamie, 2026-11-14): article pictures are far too big. Instagram carousel slides are 4:5 portrait (1080x1350). The /articles cards crop them into a large 16:9 band (app/articles.css .article-card-cover), and article pages show each slide at full column width.

Build:
1. Article cards (/articles list and the Related list on article pages) become compact rows: a 4:5 thumbnail on the left (about 128x160 px desktop, 96x120 px at 390 px) showing the whole cover with no cropping and no letterbox gaps; text on the right: date · category, title, 2-line summary, and the existing gold "Read article" action. Keep the whole card a single accessible link, the pin button outside it, and the Cloud & Ink card styling.
2. Inside an article, Markdown images render at most ~360 px wide for portrait images and ~560 px for landscape, centred, with rounded corners and the alt text as a small caption underneath. When two or more images appear consecutively (back-to-back image lines/paragraphs), show them side by side on desktop (wrapping to more rows as needed) and stacked on phones. Clicking an image opens the full-size file in a new tab. Embedded videos are unchanged.
3. The article editor's picture upload (components/articles/image-upload.tsx + lib/article-images.ts imagePath) stores new files in a folder named post<N>-<slug>, where N is the article's number in creation order (existing: post1-3-personal-ai-agents, post2-stop-copy-pasting-into-claude; the next new article is post3). Determine N on the server from created_at order; for a brand-new unsaved article use the next number. Guides keep guides-<slug>. Do not move or rewrite existing files or links.

Resources too: apply the same cover/card and in-body image sizing to Guides — /resources cards, /guides and /guides/[slug] — with guide uploads in article-images/guides-<slug>/. Do not change the Articles/Resources layout (separate redesign ticket).

Done when:
- /articles cards show the full 4:5 cover at thumbnail size, desktop and 390 px, no sideways scroll; whole-card link and pin still work.
- In-article images are capped as specified with captions; consecutive images sit side by side on desktop and stack on phones; landscape images look right; click opens the full file.
- Unit test for the new upload path (post<N>-<slug>), existing links untouched.
- Typecheck, unit suite, build, static assertions and Articles browser tests (desktop + 390 px) pass.
- docs/architecture.md, docs/status.md and MEMORY.md updated.

Report: files changed, checks actually run and results.
```

---

## TKT-145 — Approve large Content Drafts: compare a hash, not the whole draft in the URL

```
You are working in the jamieho-backroom repo. First read AGENTS.md, docs/README.md, docs/status.md, docs/content-drafts.md and docs/security.md and follow them (Jamie pushes; never push; new migrations only, applied live only after Jamie says "apply it"; update docs/ + MEMORY.md + docs/decisions.md after). Ticket: TKT-145 (Notion).

Problem (2026-11-23): approving a large draft fails with "Approval failed. No content changes were applied. Try again." and nothing reaches Postgres. approveContentChange (app/actions/content-drafts.ts) guards its PATCH with
  .filter("operations","eq",JSON.stringify(set.operations)).filter("photo_slots","eq",JSON.stringify(set.photo_slots))
which puts the whole draft into the request URL. The Tiny URL draft (~26k characters, ~40 KB URL-encoded) got HTTP 400 from the Supabase API gateway (edge log: PATCH /rest/v1/content_changes 400, no Postgres error). The largest draft that worked before was ~30 KB encoded. Any future large draft will hit the same limit.

Fix:
1. New migration: add to public.content_changes a stored generated column
     content_hash text generated always as (md5(operations::text || '|' || photo_slots::text)) stored
   (jsonb::text is canonical, so equal content gives equal hashes). Check that private.apply_content_change and the existing triggers/RLS/grants still work: the column must be readable by the owner and must not be writable by anyone (it is generated). Keep every existing check in the trigger (including "Save draft edits before reviewing the set").
2. approveContentChange: select content_hash when loading the set, and replace the two URL filters with .eq("content_hash", loaded.content_hash). Same semantics: if the draft changed between load and approve, zero rows update and the existing "This draft changed or was already reviewed" message is returned.
3. Grep for any other place that filters on operations/photo_slots or sends a draft's content in a URL (discard, save edits, preview, scripts/ops.mjs) and fix it the same way.
4. Content Draft authors (docs/content-drafts.md): note that there is no longer a practical URL size limit; the 100-operation limit and per-field limits still apply.

Done when: unit tests for the action (hash used, no operations/photo_slots in the query, changed-since-load still rejected), DB tests (generated column present and correct, not writable, owner can read, approval of a draft with >100 KB of operations succeeds end to end in PGlite), typecheck, full suite, build, static assertions. Report the migration filename and the checks actually run. Do NOT apply the migration.
```


# Prompts — small fixes

Standalone tickets that don't depend on Content Drafts or Home v1.3. Paste into ChatGPT (with repo access) whenever convenient; tell Claude when each lands.

---

## TKT-117 — Smaller article covers and in-article pictures; post<N>-<slug> upload folders

```
You are working in the jamieho-backroom repo. First read AGENTS.md, docs/README.md, docs/status.md and docs/architecture.md and follow them (Jamie pushes; never push; update docs/ + MEMORY.md after the change). Ticket: TKT-117 (Notion). No database change.

Problem (Jamie, 2026-11-14): article pictures are far too big. Instagram carousel slides are 4:5 portrait (1080x1350). The /articles cards crop them into a large 16:9 band (app/articles.css .article-card-cover), and article pages show each slide at full column width.

Build:
1. Article cards (/articles list and the Related list on article pages) become compact rows: a 4:5 thumbnail on the left (about 128x160 px desktop, 96x120 px at 390 px) showing the whole cover with no cropping and no letterbox gaps; text on the right: date · category, title, 2-line summary, and the existing gold "Read article" action. Keep the whole card a single accessible link, the pin button outside it, and the Cloud & Ink card styling.
2. Inside an article, Markdown images render at most ~360 px wide for portrait images and ~560 px for landscape, centred, with rounded corners and the alt text as a small caption underneath. When two or more images appear consecutively (back-to-back image lines/paragraphs), show them side by side on desktop (wrapping to more rows as needed) and stacked on phones. Clicking an image opens the full-size file in a new tab. Embedded videos are unchanged.
3. The article editor's picture upload (components/articles/image-upload.tsx + lib/article-images.ts imagePath) stores new files in a folder named post<N>-<slug>, where N is the article's number in creation order (existing: post1-3-personal-ai-agents, post2-stop-copy-pasting-into-claude; the next new article is post3). Determine N on the server from created_at order; for a brand-new unsaved article use the next number. Guides keep guides-<slug>. Do not move or rewrite existing files or links.

Done when:
- /articles cards show the full 4:5 cover at thumbnail size, desktop and 390 px, no sideways scroll; whole-card link and pin still work.
- In-article images are capped as specified with captions; consecutive images sit side by side on desktop and stack on phones; landscape images look right; click opens the full file.
- Unit test for the new upload path (post<N>-<slug>), existing links untouched.
- Typecheck, unit suite, build, static assertions and Articles browser tests (desktop + 390 px) pass.
- docs/architecture.md, docs/status.md and MEMORY.md updated.

Report: files changed, checks actually run and results.
```

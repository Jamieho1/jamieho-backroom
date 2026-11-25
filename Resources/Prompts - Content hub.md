# Build prompts — Content hub (Articles + Resources → /content)

Run one at a time, in order: **H1 → H2 → H3 → H4 → H5**. Each ticket ends with a stop for Jamie to review, commit and push.

**Shared rules for every ticket:** read AGENTS.md, docs/README.md, docs/status.md, docs/architecture.md, docs/journey.md, docs/security.md and docs/content-drafts.md first and follow them. Jamie pushes; never push. New migrations only, applied live only after Jamie says "apply it". No runtime AI calls. Never invent personal facts or post content; new text fields stay empty until Jamie fills them. Public pages stay pre-rendered/ISR and cookie-free (scripts/assert-static.mjs). Keep every existing article/guide slug and URL working; Instagram and YouTube already link to /articles/<slug>. Desktop + 390 px, dark + light (the site's existing theme mechanism), reduced motion. Update docs/ + MEMORY.md after (docs/workflow.md).

**Design reference:** `docs/design/content-hub.html` (open in a browser). Use the top bar to switch pages (Latest, Series, Series page, Guides, Post page) and keep topic filter option **A · Dropdowns** (the chosen one). Sample posts and samples marked "sample" are not real content.

**Look:** the My story style (app/about/story.css + app/page-scale.css): navy #1B2333, cream ink #F3EEE6, gold #E8C46A, Barlow Condensed uppercase headings, mono eyebrows and meta, faint dot grid; Inter body. Add light-theme tokens matching the mockup (#F6F2EA background, #8A6514 gold text). Reuse the shared site navigation; no window shell.

**Decisions already made by Jamie (do not reopen):**
- Articles and Resources become one Content hub with three tabs: **Latest · Series · Free guides**. One job per page.
- Latest = one uniform grid of post cards, 12 at a time ("Show 12 more"), grouped by month, with a Cards / List switch. Filters are two dropdown buttons, "Topic: … ⌄" and "Platform: … ⌄", with counts, "Clear filters" and a result count. No topic pill bubbles.
- Each card leads with what you get: a one-line "You'll learn", read time, series part, NEW / READ badges.
- Series cards show reading progress, the parts in order with "Next", and Continue/Start. Guide cards show facts, who it's for, what's inside and direct buttons.
- One search box handles both search and the post code from the last slide (e.g. MCP101). Short links /p/<code> open a post.
- Reading progress ("Read", series progress) is per browser (guarded localStorage), no sign-in.

---

## H1 — Content data model, editors and drafts (migration)

```
Ticket H1 (Content hub). Read the shared rules at the top of Resources/Prompts - Content hub.md. Includes a migration: write it, do NOT apply it; stop and ask Jamie for "apply it".

1. New table public.content_series: id uuid pk, slug (unique, same rules as article slugs), title (≤80), goal (≤200, the "After this:" line), topic (the article category enum values: ai, career, productivity, building), planned_parts int (1–50), sort int, published bool default false, created_at, updated_at. RLS exactly like articles/guides: published rows readable by everyone, owner-only writes. Tests in tests/db.
2. articles: add series_id (fk content_series, on delete set null), series_part int (1–50, null when no series; unique per series across articles AND guides — enforce with a trigger), code text (≤16, uppercase letters/digits, unique, nullable), takeaway text (≤160, the "You'll learn" line), slides text[] (ordered HTTPS image URLs of the carousel, ≤20). Read time is computed from body (words/220, min 1), not stored.
3. guides: add series_id, series_part (same rules), audience text (≤200, the "For:" line), highlights text[] (≤3 items, ≤80 each, the "inside" ticks), exercises int (nullable). Chapter count = number of "## " headings in body, read time computed; not stored.
4. Owner editors (/articles/manage, /guides/manage) get these fields; a small owner-only /content/series/manage editor for series (list, create, edit, publish). Validation shared via zod schemas in lib/articles.ts, lib/guides.ts and a new lib/content-series-data.ts; keep lib/content-series.ts only as the topic label map.
5. Content Drafts: add content_series and the new article/guide fields to the TS allowlist and private.apply_publishing_draft (mirrored SQL validation, same pattern as the case-studies migration); previews revalidate /content, /content/series, /content/series/<slug>, /content/guides. Drafts stay personal-site only (site = 'personal').
6. Export manifest includes content_series. Privacy unchanged (no visitor data). No content is created or backfilled; Jamie fills fields later (via editors or Content Drafts).

Done when: DB tests (RLS, uniqueness of code and series parts across both tables, cascade/set null), unit tests (schemas, read time, chapter count), Content Drafts tests for the new fields; migration recorded NOT applied; typecheck, suite, build, assert-static pass; docs updated. Report checks actually run.
```

---

## H2 — /content shell + Latest page, search/code, short links, redirects

```
Ticket H2. Read the shared rules at the top of Resources/Prompts - Content hub.md. Requires H1 applied live.

1. Shared content frame (layout for /content, /content/series, /content/guides): eyebrow "Content", H1 "The long version of every post" (italic serif "of", as in My story), one-line lede, and one search box (right on desktop, below on phone) with hint "Every post ends with a code, like MCP101." Typing an exact code shows a single result row that opens the post; otherwise it searches titles/summaries of posts, series and guides (client-side over the pre-rendered list). Then sticky tabs: LATEST n · SERIES n · FREE GUIDES n (mono, gold underline on the current tab).
2. Latest (/content): filter row A — "Topic: All topics ⌄" and "Platform: All platforms ⌄" dropdown buttons (menu with counts, radio semantics, keyboard + Escape), "Clear filters" link when active, "N posts" on the right. Filter state in the URL (?topic=ai&platform=instagram) so pages stay static and shareable. One-line guide band (latest published guide) with "All free guides →". Intro line + Cards / List switch (remembered in localStorage). Month headings ("November 2026 · 2 posts"). Post card: 16:10 cover (cover_url, else first slide, else a typographic fallback), platform icon, NEW badge (published in the last 14 days) or READ badge (opened in this browser), date · topic, title, "You'll learn: <takeaway>" (hidden when empty), read time chip (or "N min video" for YouTube), series chip "MCP 101 · 1/5". List row: square thumbnail, title, date · topic · time, series chip, Read chip. 12 at a time, "Show 12 more", "Showing x of y".
3. Short links: /p/[code] (case-insensitive) permanently redirects to the post; unknown codes go to /content?code=<code> with a friendly "No post with that code yet" note. Pre-render known codes.
4. Redirects (308): /articles → /content, /resources → /content/guides, /guides → /content/guides. Post URLs /articles/<slug> and guide URLs /guides/<slug> stay. Site navigation "Content" menu: Latest, Series, Free guides. Update Content Drafts preview targets.
5. Footer band "New posts every week. Follow along." with Instagram/YouTube buttons (links from the existing Contact section data).

Done when: unit tests (code lookup, filters/URL params, month grouping, badges, read-state storage guards), browser tests desktop + 390 px dark/light (search + code, dropdown keyboard, Cards/List, Show more, /p/mcp101 redirect, /articles and /resources redirects); typecheck, suite, build, assert-static; docs updated. Report checks actually run.
```

---

## H3 — Series index and series page

```
Ticket H3. Read the shared rules. Requires H2.

1. /content/series: intro line "Topics you can read in order, start to finish." Grid of series cards: topic chip, title, progress ring "read/planned" (this browser), "After this: <goal>", the first four parts as a list (✓ read, "Next" on the first unread released part, "Soon" for planned parts not yet published, "+ N more"), footer "x of N out · ~M min" and a Start / Continue button that opens the next unread part. Only published series with at least one published part.
2. /content/series/[slug]: left column (sticky on desktop): breadcrumb, title, goal, topic chip, "x of N parts out" bar, "Start at part 1 →" (or Continue). Right: ordered parts on a vertical line, each a card with thumbnail, "Part n · Instagram/YouTube/Free guide", title, takeaway or summary, date; planned-but-unpublished parts show as dashed "Part n · coming — Follow on Instagram to get it first" using planned_parts (no titles invented).
3. Static generation for all published series; Content Drafts preview support.

Done when: unit tests (part ordering across articles+guides, next-part logic, coming slots), browser tests desktop + 390 px; typecheck, suite, build, assert-static; docs updated. Report checks actually run.
```

---

## H4 — Free guides index and guide page

```
Ticket H4. Read the shared rules. Requires H2.

1. /content/guides: intro "Free, long-lived references. See what's inside before you open one." Guide cards: topic chip + "Updated <date>", title, summary; a facts row (chapters from headings, minutes, exercises when set); "For: <audience>"; up to three highlights with ticks; buttons "Read the guide →" and, when present, "Notion toolkit ↗" / "Google Doc ↗". Hide empty parts gracefully.
2. /guides/[slug] restyle in the My story look: breadcrumb, eyebrow "Free guide · <topic>", H1, subtitle, meta (chapters · minutes · updated), Start chapter 1 / Pin; a "Take it with you" card (toolkit links + "Posts that link here": articles in the same series); chapter cards from the headings (number, title, minutes); then the body with the left chapter rail like My story. Keep existing Markdown rendering, toolkit buttons and preview markers.

Done when: unit tests (facts, chapter extraction), browser tests desktop + 390 px; typecheck, suite, build, assert-static; docs updated. Report checks actually run.
```

---

## H5 — Post page

```
Ticket H5. Read the shared rules. Requires H2 (H3 for the series bar).

/articles/[slug] in the My story look, simpler than today:
1. Left chapter rail from "## " headings (sticky, gold active dot), replacing the right "On this page" column; the old left "Latest posts" sidebar is removed (Latest lives on /content). Keep personal pins: a small "☆ Pin" button by the meta line.
2. Header: breadcrumb "Content / <Series> · part n of N", H1, summary, meta "date · n min read · topic · Code <code>". Origin banner: platform icon + "The long version of my Instagram carousel." (or YouTube video) + "View post ↗" (source_url). YouTube posts keep the embedded player.
3. Slides strip when slides[] is set: horizontal swipeable strip of 4:5 images, click opens a lightweight viewer (keyboard, Escape); otherwise nothing.
4. Body: existing Markdown renderer restyled (condensed uppercase h2 with gold numbers, gold-accent links, code blocks unchanged).
5. End: a two-cell bar — "Series: all N parts of <Series>" and "Next · part n+1: <title> →" (or a guide); then "More like this" with three post cards (same series first, then same topic). Footer band as H2.

Done when: unit tests (rail extraction, next part, related order), browser tests desktop + 390 px (rail, slides viewer keyboard, pin, YouTube embed); typecheck, suite, build, assert-static; docs updated. Report checks actually run.
```

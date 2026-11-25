# Articles content guide

Implemented locally on 2026-11-01. Migration `20261101145851_articles.sql` is APPLIED live with Jamie's approval (remote version `20261101223239`). Jamie must push the implementation before using the new UI in production.

1. Sign in as the owner and open Articles → Manage articles.
2. Choose New article. Give it a title and a unique slug, such as `video-reading-list`.
3. Add a summary (shown under the title), pick a category (AI, Career, Productivity & Tools, Building in Public) and a platform (YouTube, Instagram, RedNote, Other). Optionally add a cover image URL (shown only when the post has no slides and no video), the original video/post link (a YouTube link plays inside the article; any link becomes the "View post ↗" button in the origin banner) and the project it belongs to.
   - New owner fields (H1, shown on the post page since H5): **Series** and **Part** (together; the page shows "Content / <Series> · part n of N", a "Series: all N parts" cell and "Next · part n+1" to the next published part, article or guide), **Code** (up to 16 capitals/digits, e.g. `MCP101`, shown as "Code MCP101" in the meta line; `/p/mcp101` opens the post), **You'll learn** (the one-line takeaway on cards) and **Slides** (ordered HTTPS image URLs of the carousel, up to 20; the page shows a swipeable 4:5 strip that opens a viewer with arrow keys and Escape). Leave any of them empty and that part of the page is simply not shown.
4. Write the article in Markdown (each `## Section` becomes a numbered chapter in the left rail beside the article and a gold-numbered heading; a `## Links and sources` or `## Additional resources` section is styled as the article's closing notes; prompts or commands go in fenced blocks, e.g. ```` ```text title="Prompt: organise my files" ```` for a copyable block, add `collapsed` to fold it): `## Section` headings, `![Caption](https://…image.png)` pictures, and a YouTube link on its own line for an extra video.
5. Save with Publish publicly unticked for a private draft. Retry keeps the same draft if saving fails.
6. Tick Publish publicly and Save when ready. Open article gives the shareable `/articles/video-reading-list` URL.
7. Put that URL in the video description or post/profile reference. Keep the slug stable; renaming changes the shared URL.
8. To remove it from public reading, edit, untick Publish publicly and Save. Drafts remain accessible to the owner in Manage articles.

Public readers need no sign-in. They find posts on `/content` (Latest, with Topic and Platform dropdowns, search and post codes), `/content/series` and `/content/guides`; `/articles` redirects to `/content`, and each `/articles/<slug>` URL stays valid. An article page has the chapter rail on the left, a small "☆ Pin" button by the meta line (pins need sign-in), a series/next bar and three "More like this" posts (same series first, then same topic) at the end, then the footer band with the Instagram and YouTube links from the landing page's Contact section. Private drafts are hidden
by database RLS, including direct slug requests. Management is owner-only and excluded from analytics.
No YouTube/Instagram API connection or secret is required: the app stores article text and links, and
links to the original video/post open a new tab. No article content is committed to git or seeded here.

Database fields: UUID id; unique slug; title; summary; body (Markdown); platform (`youtube`, `instagram`,
`xiaohongshu`, `other`); category (`ai`, `career`, `productivity`, `building`); cover_url; project_id (optional app id); source_url (optional HTTPS); published (false by default); created_at; updated_at.
New data is included in the existing encrypted export. Changes to live content come from Jamie's editor
actions; Codex has not created, imported or published any article content.

# Articles content guide

Implemented locally on 2026-11-01. Migration `20261101145851_articles.sql` is APPLIED live with Jamie's approval (remote version `20261101223239`). Jamie must push the implementation before using the new UI in production.

1. Sign in as the owner and open Articles → Manage articles.
2. Choose New article. Give it a title and a unique slug, such as `video-reading-list`.
3. Add a summary (shown under the title), pick a category (AI, Career, Productivity & Tools, Building in Public) and a platform (YouTube, Instagram, RedNote, Other). Optionally add a cover image URL, the original video/post link (a YouTube link plays inside the article) and the project it belongs to.
4. Write the article in Markdown: `## Section` headings, `![Caption](https://…image.png)` pictures, and a YouTube link on its own line for an extra video.
5. Save with Publish publicly unticked for a private draft. Retry keeps the same draft if saving fails.
6. Tick Publish publicly and Save when ready. Open article gives the shareable `/articles/video-reading-list` URL.
7. Put that URL in the video description or post/profile reference. Keep the slug stable; renaming changes the shared URL.
8. To remove it from public reading, edit, untick Publish publicly and Save. Drafts remain accessible to the owner in Manage articles.

Public readers need no sign-in. They can search Articles and filter by category pills and a platform toggle; an article page lists a short, expandable list of other posts on the left and three "If you liked this" posts at the end. The footer shows "Jamie Ho ©" and channel icons, taken from the links in the landing page's Contact section (LinkedIn, YouTube, Instagram, RedNote). Private drafts are hidden
by database RLS, including direct slug requests. Management is owner-only and excluded from analytics.
No YouTube/Instagram API connection or secret is required: the app stores article text and links, and
links to the original video/post open a new tab. No article content is committed to git or seeded here.

Database fields: UUID id; unique slug; title; summary; body (Markdown); platform (`youtube`, `instagram`,
`xiaohongshu`, `other`); category (`ai`, `career`, `productivity`, `building`); cover_url; project_id (optional app id); source_url (optional HTTPS); published (false by default); created_at; updated_at.
New data is included in the existing encrypted export. Changes to live content come from Jamie's editor
actions; Codex has not created, imported or published any article content.

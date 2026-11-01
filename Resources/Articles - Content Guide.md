# Articles content guide

Implemented locally on 2026-11-01. Migration `20261101145851_articles.sql` is APPLIED live with Jamie's approval (remote version `20261101223239`). Jamie must push the implementation before using the new UI in production.

1. Sign in as the owner and open Articles → Manage articles.
2. Choose New article. Give it a title and a unique slug, such as `video-reading-list`.
3. Add a summary, select YouTube/Instagram/Other and optionally paste the original HTTPS video/post link.
4. Write the extra references in Markdown. Use headings, lists and `[Reference title](https://example.com)` links.
5. Save with Publish publicly unticked for a private draft. Retry keeps the same draft if saving fails.
6. Tick Publish publicly and Save when ready. Open article gives the shareable `/articles/video-reading-list` URL.
7. Put that URL in the video description or post/profile reference. Keep the slug stable; renaming changes the shared URL.
8. To remove it from public reading, edit, untick Publish publicly and Save. Drafts remain accessible to the owner in Manage articles.

Public readers need no sign-in. They can search Articles and filter by platform. Private drafts are hidden
by database RLS, including direct slug requests. Management is owner-only and excluded from analytics.
No YouTube/Instagram API connection or secret is required: the app stores article text and links, and
links to the original video/post open a new tab. No article content is committed to git or seeded here.

Database fields: UUID id; unique slug; title; summary; body (Markdown); platform (`youtube`, `instagram`,
`other`); source_url (optional HTTPS); published (false by default); created_at; updated_at.
New data is included in the existing encrypted export. Changes to live content come from Jamie's editor
actions; Codex has not created, imported or published any article content.

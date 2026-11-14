# Data and security contract

Access is enforced in database RLS with PGlite policy tests, never just hidden UI. Only the owner edits managed site/app content. Readers manage only their own article_pins, separate from article content. Contact submissions and permitted self app-open records have their existing constrained visitor writes. New app data uses rls.can_view_app. Settings remains owner-only; Behavioral access is registry-controlled and initially invite-only.

Anon/authenticated may execute only public.record_signin over the API. ops_usage is service-role-only. RLS helpers belong in rls; trigger functions in private. Preserve grants, security-invoker discovery and tests/db coverage.

Public /, /resources, /privacy, /projects and /articles must remain pre-rendered; scripts/assert-static.mjs enforces this. Public reads avoid request cookies. Privacy must reflect collection/storage changes in the same patch.

CV/resume, notes, saved code, attempts, private imports and provider secrets stay outside Git. New resume entries/bullets start hidden. Use own-words practice content; no copied LeetCode text/scraping. No runtime AI or server-side execution of user code.

Approved illustrated public wallpaper in public/desktop-art/ and editable public introduction copy in lib/desktop-introduction.ts are explicit exceptions. This does not authorize private content or arbitrary journey media in Git.

Migrations are append-only. Test locally, obtain Jamie's approval before live application, record local filename/remote version/result. SQL presence does not prove application. Historical applied records through resume_sections are in archived MEMORY; newer categories/images/home_media/now/projects migration application must be verified before relying on it.

Storage reads/writes require appropriate bucket/policy checks. Keep schema and export coverage consistent. Never inspect .env values or private.settings owner seed; Jamie handles keys. NEXT_PUBLIC variables are public Config; real secrets are unprefixed Sensitive. Never place service-role/Google secrets in Vercel.

The supplied public Cyterly screenshot is delivered under public/project-art for the requested project display. This contains no private CV/notes/import data. Other project screenshots remain database/Storage managed.

Resources previews contain generic placeholders only. Unlock state uses existing server-filtered app discovery; /notes, /practices and /behavioral still enforce server/RLS access. Missing permission shows a membership gate; payment integration is not implemented. Retired /about and /desktop only redirect.

Article pins: 20261111180819_article_pins.sql (applied live 2026-11-11 as remote 20261111181807) grants authenticated SELECT/INSERT/DELETE only. RLS isolates every user, including owner; inserts require an accessible published article. No UPDATE, anonymous grants or new callable functions. Account/article deletion cascades; export-tables.json includes pins. Privacy discloses account/article IDs and pin dates. Approved application and live RLS/grant/policy/cascade checks succeeded; no article-pins security advisory.

Guides (2026-11-11): public.guides published rows are readable by anon and members without app access checks; drafts and all writes are owner-only via RLS (tests/db/guides.test.ts). Links must be HTTPS. Public reads are cookie-free. No new personal data is collected.


TKT-98 content_changes (2026-11-14): RLS permits SELECT/INSERT/UPDATE/DELETE only to authenticated owners; anon has no table grants, service_role only export reads. The private.apply_content_change SECURITY DEFINER trigger has an empty search_path, revoked API EXECUTE and an explicit auth.uid()/rls.is_owner() approval guard. Approval independently rejects unknown operations/tables/keys/fields, wrong types, excess lengths, nonempty photo slots and supplied audit metadata. Status update, live content edits, previous values and approver/timestamp are one transaction. No new public RPC; record_signin-only tests remain. Draft insertions may be made by administrative tooling, but approval requires the owner’s session even for administrative callers. Review is uncached, owner-only/404 and escapes all proposed text. New owner audit records join encrypted exports; no new visitor collection. Migration 20261114020933_content_changes.sql applied live with explicit approval on 2026-11-14 as remote 20261114101016. Catalogue verification confirmed policy/grants, trigger hardening and record_signin-only public execution; no content_changes advisory. Existing content unchanged and no live test rows created.


TKT-101 homepage preview: entry is a server action, not a GET/URL toggle; it validates the pending set through the authenticated owner session and existing RLS before enabling Next Draft Mode. jb.content-preview stores only the UUID, httpOnly/SameSite=Lax, Secure in production, root path, one-hour lifetime. Neither this cookie, Next’s bypass cookie nor query parameters authorize draft reads: every enabled homepage request verifies the owner and revalidates the pending set’s allowlist/photo-slot rules before overlaying. Signed-out/member/stale/invalid states receive only live content; no draft values or summary enter their HTML. Draft Mode bypasses ISR and sends private/no-store responses. Public rendering stays pre-rendered and the live loader result/fallback objects are never mutated. Preview approval/discard reuse the unchanged TKT-98 engine and clear both preview cookies; anyone may clear only their own preview state. No new secrets, permissions, public RPC, database migration or visitor tracking.

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

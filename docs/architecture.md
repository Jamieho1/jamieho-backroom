# Architecture

Next.js App Router, React, TypeScript; Supabase Postgres/Google Auth/RLS; Vercel hosting/analytics; Resend contact alerts. Dependency pins live in package.json/package-lock.json.

| Area | Source |
| --- | --- |
| Homepage/profile | app/page.tsx, components/journey/ |
| Journey | app/page.tsx, components/journey/, lib/journey/, app/journey.css; app/journey/ redirects home |
| App registry/access discovery | lib/apps.ts, lib/viewer.ts, lib/desktop-pages.ts, components/desktop-apps-provider.tsx |
| Notes | app/notes/, app/desktop/notes-content.tsx, components/notes/, lib/notes/ |
| Practice | app/practices/, components/practice/, lib/practice/, public/runner/ |
| Behavioral/resume | app/behavioral/, components/behavioral/, lib/behavioral/, lib/experience.ts |
| Articles | app/articles/, components/articles/, lib/articles*, lib/article-images.ts |
| Guides | app/guides/, components/guides/, lib/guides*, app/actions/guides.ts |
| Project portfolio | app/projects/, components/portfolio/, lib/portfolio*, app/actions/portfolio.ts |
| Content drafts/review | app/manage/review/, app/actions/content-drafts.ts, lib/content-drafts/, components/content-drafts/ |
| Owner admin | app/settings/, app/actions/ |
| Shared content/contact | lib/sections.ts, lib/social.ts, lib/contact.ts, app/actions/contact.ts |
| Auth/session | proxy.ts, lib/supabase/, app/auth/ |

Canonical protected URLs are /notes, /practices, /practices/[problem], /behavioral; legacy desktop queries redirect. /settings is owner-only. Registry access is RLS-filtered; same-account icons persist during navigation and clear on account changes. App opens are logged daily; external apps open new tabs.

Notes uses resizable list/content/visuals; Practice has collapsible/resizable list/problem/code. Python executes in a time-limited browser worker via Pyodide. Visitor code remains local; owner saves/attempts/stars are private database records. Shared question notes are owner-edited.

Articles and portfolio projects have public slug pages and owner management. Published content is database-backed; project portfolio records are distinct from the app registry. Experience publication controls also feed public profile/journey content. Social destinations come from Contact Markdown, not hardcoded personal URLs.

Update this map when routes, data ownership or module boundaries change.

Homepage navigation/hero are isolated in components/journey/navigation.tsx and hero-artwork.tsx. Resources is /resources. Retired /about redirects to /#pivot; /desktop redirects to /resources while legacy app queries go to canonical routes. Privacy, Projects (list and details), Articles, Notes, Practice and Resume & Stories render as plain full-width pages below the root shared navigation, without window/titlebar/maximise/close/backdrop. Only owner Settings retains its existing window shell.

lib/project-art.ts provides the supplied public Cyterly image only when that public project has no database screenshots. Owner-selected screenshots override it; the editor still reads and writes the database record.

Homepage ending: components/journey/screen-contact.tsx embeds the existing ContactForm/sendMessage action on the monitor and in static fallbacks. app/page.tsx supplies social links from Contact content. Final navigation targets Contact Us, not /desktop.

Shared navigation: components/site-navigation.tsx, with Journey dropdown, Projects, Articles, Resources, Privacy, theme and auth controls; JourneyNavigation supplies local scroll actions. ResourceCatalog/ResourceGate and lib/resources.ts provide three generic locked previews and permission-filtered opening. ThemeToggle persists Auto/Day/Night in the existing jb.theme key; Auto removes the explicit theme override so system preference remains live.

App presentation (2026-11-10): Projects, Articles, Notes, Practice and Resume & Stories inherit Resources Cloud & Ink tokens in explicit and system themes. Notes/Practice/Resume use compact 14px body and 20px workspace headings. Articles browse surface stretches to window bottom; whole article cards are single accessible links to public slug routes, including images, text, action styling and empty padding. Notes visuals stick within the shared app content scroll container, with their own overflow on desktop; stacked phone/narrow layouts remain static. Resize controls are retained.

Plain app shell (2026-11-11): Desktop routes the five approved apps and resource gates through .app-page/.app-page-content without rendering embedded navigation or window chrome. Root SiteHeader provides one top bar. Content still scrolls within a viewport beneath it, preserving Notes sticky visuals and full-height sidebars. App discovery/logging remains in the same client component; AppPage server permissions and content queries are unchanged. Privacy inherits Cloud & Ink; policy wording/collection are unchanged.

Articles sidebar (2026-11-11): Latest posts renders on both /articles and slug pages, not only when currentId exists. Existing published newest-first input, shared search/category/platform filters, eight-at-a-time list and active-article indicator are retained.

Catalogue card styling (2026-11-11): Resources and .catalog-card share border, 14px radius and theme surface tokens in globals.css. Projects/Articles use common 24px body padding, 22px titles and a separated gold-action footer; project cards no longer imitate window chrome. Images, project tags/Featured badges and public detail-page links remain.

Articles scrolling (2026-11-11): desktop .articles-app constrains left/right panes to the shared content viewport; sidebar and reading pane scroll independently. Near-bottom sidebar scroll reveals eight more latest posts, with Show more retained. Narrow layouts retain their stacked article list scroll. Personal pins use authenticated server actions and account-keyed client state. Pinned posts lives above Latest posts; pin buttons remain outside full-card links. Account changes/logout clear displayed pins and stale async results are ignored. Migration 20261111180819_article_pins.sql applied live with approval on 2026-11-11 as remote 20261111181807; frontend requires deployment.

Guides (2026-11-11): public evergreen resource pages, separate from articles. An article is the long version of one social post; a guide is the reusable reference several posts link to, with optional Notion toolkit and Google Doc links. Table public.guides (migration 20261111220000_guides.sql): published rows readable by anyone (no app gate), owner-only writes. /resources (ISR 1h, still pre-rendered) shows a Guides shelf above the member app catalogue; /guides lists them; /guides/[slug] renders Markdown with the article renderer and toolkit buttons; /guides/manage is the owner editor (pictures in the article-images bucket under guides-<slug>/). Owner Resources bar links Manage guides.


Content drafts (TKT-98, 2026-11-14): owner-only dynamic /manage/review loads pending public.content_changes and current site_sections through the request client. Strict TypeScript/SQL allowlists support section title/body updates; TKT-104 adds experience item/bullet operations (see below). One owner-authenticated status UPDATE invokes a private SECURITY DEFINER trigger, applying operations, before-values and approval metadata atomically; no new public RPC or credentials. Approval revalidates affected routes; discard changes status only. Existing editors, public rendering and navigation are unchanged. See content-drafts.md. Migration 20261114020933_content_changes.sql applied live with approval on 2026-11-14 as remote 20261114101016. Backend verified; frontend deployment/live review remains Jamie’s step.


TKT-101 homepage preview (2026-11-14): app/page.tsx calls getHomePreview, then passes its validated owner-only context to getSections; disabled Draft Mode short-circuits before dynamic cookies/auth, preserving the static public homepage. lib/content-drafts/preview.ts owns session/set validation, overlay.ts owns immutable composition and marker bindings, app/actions/content-preview.ts owns cookie lifecycle and delegates mutations to TKT-98. Review list launches the preview; ContentPreviewBar provides fixed approval/discard/exit controls. Journey changes are data attributes only, including static/reduced-motion copies. No migration, approval-rule or other-page behavior changes.


Owner review badge (2026-11-14): SiteNavigation includes ContentReviewBadge in its existing account row, covering top and floating bars. A client effect runs only for a known owner and calls app/actions/content-draft-count.ts; the server independently verifies ownership and performs an exact, draft-only HEAD count under existing content_changes RLS. No rows/content are returned. Zero/error/loading/non-owner states render nothing; account-keyed state and generation guards prevent stale replies after logout/account changes. Refreshes on navigation, visible-tab focus and successful review events. Public pages remain static/ISR; other navigation items/theme controls and database rules are unchanged.


TKT-104 experience drafts (2026-11-14): experience-overlay.ts composes sequential item/bullet operations over the owner snapshot. getPublicExperience(preview) filters publication after overlay; fromRows carries changed markers to Home role panels and CV entries/bullets. BehavioralContent overlays only CV data and makes preview read-only; existing stories, editor and access paths remain. Review compares against current rows and offers Home/CV entry points; preview bar switches between them. Approval revalidates all CV consumers (/, /journey, /about, /behavioral) through the existing status action/transaction. New private helper migration 20261114110327_content_drafts_experience.sql is NOT applied live; no public API/RLS/navigation/design changes.

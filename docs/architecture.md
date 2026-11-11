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
| Project portfolio | app/projects/, components/portfolio/, lib/portfolio*, app/actions/portfolio.ts |
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

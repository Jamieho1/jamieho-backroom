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

Homepage navigation/hero are isolated in components/journey/navigation.tsx and hero-artwork.tsx. Resources is /resources. Retired /about redirects to /#pivot; /desktop redirects to /resources while legacy app queries go to canonical routes. Existing app content stays in its window shell, with shared site navigation and Close returning to Resources.

lib/project-art.ts provides the supplied public Cyterly image only when that public project has no database screenshots. Owner-selected screenshots override it; the editor still reads and writes the database record.

Homepage ending: components/journey/screen-contact.tsx embeds the existing ContactForm/sendMessage action on the monitor and in static fallbacks. app/page.tsx supplies social links from Contact content. Final navigation targets Contact Us, not /desktop.

Shared navigation: components/site-navigation.tsx, with Journey dropdown, Articles, Resources, Privacy, theme and auth controls; JourneyNavigation supplies local scroll actions. ResourceCatalog/ResourceGate and lib/resources.ts provide three generic locked previews and permission-filtered opening. ThemeToggle persists Auto/Day/Night in the existing jb.theme key; Auto removes the explicit theme override so system preference remains live.

App presentation (2026-11-10): Articles, Notes, Practice and Resume & Stories inherit Resources Cloud & Ink tokens in explicit and system themes. Notes/Practice/Resume use compact 14px body and 20px workspace headings. Articles browse surface stretches to window bottom; cover images/placeholders link to public slug routes. Notes visuals stick within the existing app scroll container, with their own overflow on desktop; stacked phone/narrow layouts remain static. Resize controls are retained.

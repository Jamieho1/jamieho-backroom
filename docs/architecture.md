# Architecture

Next.js App Router, React, TypeScript; Supabase Postgres/Google Auth/RLS; Vercel hosting/analytics; Resend contact alerts. Dependency pins live in package.json/package-lock.json.

| Area | Source |
| --- | --- |
| Homepage/profile | app/page.tsx, app/about/, components/journey/ |
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

Homepage navigation/hero are isolated in components/journey/navigation.tsx and hero-artwork.tsx. The desktop remains at /desktop; public /about and existing apps remain available.

lib/project-art.ts provides the supplied public Cyterly image only when that public project has no database screenshots. Owner-selected screenshots override it; the editor still reads and writes the database record.

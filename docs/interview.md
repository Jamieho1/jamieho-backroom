# Interview shell — TKT-118

/interview is an additive, dark-only workspace. app/interview/layout.tsx renders InterviewShell with scoped --iv-* tokens and CSS; SiteHeader returns nothing only for /interview and its descendants. Existing root viewer/app providers and Google sign-in/sign-out controls are reused. Other site pages retain their top/floating navigation and theme settings.

## Routes and data

Dashboard: /interview. Skills use /interview/<section>/practice and /notes, with optional topic suffix: dsa, system-design, low-level-design, finance, ai-engineering. Career/Tools placeholders: /interview/resume, /interview/behavioral, /interview/companies, /interview/roadmaps, /interview/applications. Unknown sections/modes/topics return 404. Every content page is a generic Soon placeholder; no existing notes, CV, stories, saved code or progress is loaded. Content/access migrations belong to later tickets.

lib/interview/navigation.ts defines rail groups/destinations. DSA has 17 public taxonomy topics; LLD has class-design; other topic lists remain empty until their content tickets. Notes/Practice links preserve the selected DSA topic. Practice remains unavailable from System Design/LLD Notes because those sections have no questions yet. Feedback is a Soon stub for TKT-123.

components/interview/icons.tsx contains original inline SVG paths for sections and all topic IDs, using one rounded 1.7px stroke style. Topic colours come from lib/notes/topics.ts; class-design now has #38BDF8. No external/TechPrep artwork.

## Interaction

Desktop: rail and topic column collapse independently. Browser keys jb.interview.rail-collapsed.v1 and jb.interview.topics-collapsed.v1 hold booleans; all localStorage reads/writes are guarded. Collapsed rail keeps accessible names and hover/focus tooltips (Escape dismisses). Collapsed topics disappear, leaving a Topics button at the content's top-left. The icon-only rail toggle sits beside the expanded logo; when collapsed, it replaces the logo and centres over the navigation icons. Rail and topic collapse/expand controls share a 32px height and vertical centre. Compact 13px navigation, 232px rail and 232px topic column keep the complete rail and 17-topic DSA list visible at 1280×720; shorter viewports retain independent scrolling.

At ≤768px, desktop collapse preferences are ignored visually. Menu opens a slide-in modal rail with an inert background, trapped Tab/Shift+Tab, backdrop/close control and Escape focus restoration. Topics opens an independently scrollable dropdown above full-width content; Escape closes it and returns focus. Route changes close mobile panels. Drawer motion uses transform/opacity and is removed for reduced motion. Each column scrolls independently; layout is tested at 390px.

The shared site navigation adds Interview between Projects and Articles, including the floating bar. /resources renders only the public Guides shelf; ResourceCatalog/ResourceGate and membership logic stay available for future courses. /notes, /practices, /practices/[problem] and /behavioral retain their existing access checks/editors unchanged.

No migration, live data change, new dependency or deployment. Jamie pushes and verifies live. Current validation and file inventory: docs/status.md.

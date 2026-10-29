# PRD: Personal Website

_Status: **signed off by Jamie 2026-10-29**. Source: grill-me session 2026-10-29; decision log in the Job Application Tracker project doc `claude/personal-website-grill-decisions.md`._

## Personal Website

**Problem**

The Interview Prep artifact has become Jamie's most-used tool and his best piece of work. But it lives inside claude.ai:

- recruiters and possible freelance clients can't see it;
- there's no place that presents Jamie, his CV and his projects together;
- each new side project (GEO SaaS and others) would have no common home, login or showcase.

Jamie needs one personal website that is three things at once:

1. a public portfolio, landing page and "about me";
2. a signed-in desktop where his apps live, starting with Notes, the practice arena and Behavioral;
3. a hub that later projects plug into as separate "microservice" apps.

**Success Criteria**

1. **Public pages:** anyone can open `/` with no login. They see Hero, About, Experience (only bullets Jamie marked public), Projects, Writing/YouTube and Contact. It loads fast, is pre-rendered (indexable) and reads well at 390 px.
2. **Sign-in and the desktop:** anyone with a Google account can sign in and open `/desktop`. They can read Notes and use the practice arena. Run/Submit works in their browser, and their code is saved only in their browser.
3. **Owner powers:** only Jamie (the owner) can:
   - edit landing sections, notes, arena notes and Behavioral content;
   - read the contact Inbox and the sign-in list;
   - manage the invite list.
   This is enforced by database row-level security, not only by the UI.
4. **Invite-only Behavioral:** Behavioral is visible only to Jamie and invited emails. An uninvited signed-in user gets nothing back from the database.
5. **App registry:** the desktop icons and the Projects page both come from one `apps` table. Adding a row adds an app with no code change. Each app has its own visibility: Public, Signed-in or Invite-only.
6. **Contact form:** a message reaches the Inbox, and an email alert reaches Jamie. Spam is limited by a honeypot and 5 messages per hour per IP.
7. **Data copy:** the one-time copy from the artifact moves:
   - all 18 coding notes, with visuals;
   - the CV, as Experience rows, all hidden by default;
   - STAR stories, Behavioral answers, the latest arena code and the per-question notes.
   Nothing is retyped. The copy can be re-run safely, and its JSON stays in Jamie's folder as a backup.
8. **Running cost:** £0/month on free tiers, plus the domain (about £10/year) once bought. Vercel Pro is only needed if paid work flows through the site.
9. **Failure handling:** each failure mode in Constraints behaves as described there.

**Scope**

In scope (v1):

- **Landing `/`:**
  - Hero, About, Experience, Projects (from the registry), Writing/YouTube, Contact.
  - Content is Markdown rows in Supabase.
  - An owner-only "Edit site" mode; saving revalidates the page, with no redeploy.
- **Projects page:** project cards styled as mini desktop windows (screenshot, description, tech tags, link).
- **Contact:**
  - A form (name, email, need, optional budget) saved to a `messages` table.
  - A Settings Inbox (owner only).
  - A Resend email alert.
  - LinkedIn / GitHub / YouTube / email links.
- **Auth:**
  - Supabase Auth with Google.
  - Roles: owner, invited, signed-in, anonymous.
  - An invite list in Settings.
- **App registry:** an `apps` table holding name, icon, kind (internal/external), url, visibility, screenshots, tags and description.
- **`/desktop`:**
  - The OS-style workspace carried over from the artifact (wallpaper, icons, windows, menu bar).
  - A launcher grid on phones.
- **Notes (coding):**
  - Concept cards, the Visuals tab, Recall mode, IDE code colours and NeetCode links.
  - The owner edits Markdown; everyone else reads.
  - No AI buttons.
- **Practice arena (no interview mode):**
  - Problem list, own-words descriptions, tests, Run/Submit via in-browser Pyodide.
  - Solution, visuals, complexity and pitfalls.
  - A per-question Notes panel (owner edits, others read).
  - The owner's code and attempts are saved to the database; visitors' code stays in localStorage.
- **Behavioral (redesigned):**
  - **CV view:** bullets shared with Experience; each bullet shows a badge and links to its STAR stories.
  - **Question bank view:** grouped by theme (Conflict, Failure, Leadership, Ambiguity, Ownership, Impact, Customer, plus the Palantir/Balyasny/JPMorgan sets). Each question shows its best stories, an answer outline and follow-ups.
  - A coverage strip per theme.
  - Starts Invite-only.
- **Settings:**
  - App visibility, the invite list, the Inbox.
  - The sign-in list (name, email, first and last visit, apps opened).
  - A free-tier banner.
- **Analytics:** Vercel Web Analytics (cookieless, no banner).
- **Design:**
  - The current PostHog-style tokens, type, light/dark mode and IDE code colours across the whole site.
  - The landing page uses an editorial layout.
  - Dark mode follows the system setting, with a toggle.
- **Data copy:**
  - Copied: coding notes, CV → Experience, stories, Behavioral questions and answers, the latest arena code, per-question notes.
  - The artifact's Notes and Behavioral then show "Moved to the website" and become read-only.
- **Ops:**
  - A daily keep-alive ping to Supabase.
  - A weekly JSON export to Jamie's folder.

Out of scope (later):

- Any AI, including interview mode, Alex, grading, quiz generation, Draft with Claude and voice.
- A system design app (it needs its own design and its own grill).
- GSAP / three.js animation.
- Saving visitors' work to the database (multi-user).
- Payments or subscriptions.
- External subdomain apps. The registry and the shared login are ready for them, but the first one comes after v1.
- Spaced repetition, quiz data and mock history. These stay in the artifact.

**Constraints**

- **Stack:** Next.js (App Router) on Vercel Hobby; Supabase (Postgres, Auth, RLS); Resend (email). Reuse the artifact's React components wherever possible.
- **Secrets:** Jamie enters every secret himself in Vercel/Supabase: the Supabase keys, the Google OAuth client and the Resend key. Claude never sees or handles them.
- **GitHub:** Jamie creates the GitHub repo and pushes. Claude never pushes.
- **Free tiers:**
  - Supabase pauses a project after 7 idle days (hence the keep-alive ping), and its backups are limited (hence the weekly export).
  - Vercel Hobby is non-commercial.
- **Content rules:**
  - The CV and personal content are never in git; they live in the database only.
  - Problem content is own-words only. No LeetCode text and no scraping.
- **No server-side code execution:** all Python runs in the visitor's browser (Pyodide worker).
- **Privacy:**
  - Copied CV bullets start hidden from the landing page.
  - Behavioral stays Invite-only until Jamie changes it.
  - No cookie banner, so nothing tracks visitors with cookies.
- **Domain:**
  - v1 can run on `*.vercel.app`.
  - Jamie's own domain is required before the first subdomain app (sharing the login cookie across `*.vercel.app` sites is impossible) or the public launch, whichever comes first. **Remind Jamie at that point.**
- **Working rules:**
  - Tell Jamie before any coding ticket starts and wait for his go-ahead.
  - Say what will change before changing his notes or content.
- **Failure modes:**
  - **Supabase down or paused:** the landing and Projects pages still render (pre-rendered); the desktop apps show "Can't reach the data right now". Nothing is lost.
  - **A save fails:** the draft stays on the page with "Couldn't save — retry".
  - **Pyodide fails:** Run/Submit are disabled with a message; the content still shows.
  - **Resend fails:** the message is still in the Inbox.
  - **Near free-tier limits:** a banner in Settings.

**Build Plan**

Each release can be deployed on its own. Each one ends with the tests passing (unit + end-to-end), Jamie checking it, and Jamie pushing.

1. **R1 — Skeleton and public site**
   1. A new Next.js repo and Vercel project.
   2. A Supabase project with the schema: `profiles`, `site_sections`, `experience`, `apps`, `app_visibility`, `invites`, `messages`, `signins`, plus RLS policies and their tests.
   3. Google sign-in, the owner role, the invite list.
   4. The app registry.
   5. The landing page with Edit site mode.
   6. The Projects page.
   7. The contact form, the Inbox and the Resend alert.
   8. Vercel Analytics.
   9. The keep-alive ping and the weekly export.
   - **Decision point:** check the RLS tests before any private data is loaded.
2. **R2 — Desktop and Notes**
   1. The `/desktop` shell (ported from the artifact), with the phone launcher.
   2. The Notes app: cards, visuals, Recall, IDE colours, owner editing.
   3. The data copy for the coding notes: export JSON to the folder, load it, verify the counts against the artifact.
3. **R3 — Practice arena**
   1. Port the arena without interview mode: Pyodide worker, tests, Solution and visuals, the Notes panel.
   2. Owner saving to the database; visitor saving to localStorage.
   3. Copy the latest code and the per-question notes.
4. **R4 — Behavioral**
   1. The CV view and the Question bank view, with the coverage strip.
   2. Copy the CV to Experience (hidden) and copy the stories and answers.
   3. Behavioral visibility set to Invite-only.
   4. Switch the artifact's Notes and Behavioral to read-only "Moved to the website".
5. **Before the first subdomain app or public launch:** buy the domain, move the auth cookie to `.<domain>`, and point Vercel at the domain. (Reminder to Jamie.)

**Resolved at sign-off**

- Name: **jamieho-backroom** is used for the repo, the Vercel project and the Supabase project.
- Desktop wallpaper: the artifact's current one for v1. It will be redesigned later, together with Jamie.

---

_After sign-off, proceed with the build. If scope changes mid-build, update this PRD rather than silently drifting from it._

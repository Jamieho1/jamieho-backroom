# Current state

Snapshot only (≤400 words). Replace lines when facts change; no dated logs — git history keeps them. Decisions go in [decisions.md](decisions.md).

## Live

- Production READY on 2f4d437 (checked 2026-11-16). Jamie pushes; Vercel deploys.
- Documentation retains active specs/current topics only; superseded planning uses git history.
- All migrations through `20261115212120_interview_public_access` are applied live. None pending.
- Article pages are ISR daily (`revalidate = 86400`); Content Drafts approvals call `revalidatePath`. Direct DB edits need a save in the editor or a redeploy.

## Site today

- Home journey at `/`: Hello → About (heading + text + 3-photo strip) → Experience → Work → Techstack → Creator → Contact. `/about` redirects to `/#pivot` until My story ships.
- Top bar: Journey · Projects · Interview Prep · Articles · Resources. Privacy lives in the Contact form only. Icon-only Auto/Day/Night switch.
- `/interview` is PassLoop: sidebar with Interview Skills (DSA, System Design, LLD, Fundamental, SQL), Role, Career (Resume, Behavioral, Project), Tools. Open to all; per-user flags, code, resume and STAR answers, own-rows RLS. Old `/notes`, `/practices`, `/behavioral` still work (deprecation pending Jamie).
- Resources lists Guides only, in the Articles-style sidebar layout with series filters.
- Content Drafts: `/manage/review` with page preview, owner badge, photo slots. Covers site_sections, CV, projects/articles/guides, notes/practice/behavioral and resume template. TKT-107/108 live photo-slot test verified: approved set, exactly one expected DataKind UK project-media URL, Storage PNG 3,254,783 bytes.

## Open work (in order)

1. Home v1.3: TKT-110 → 116 (data migration, order/nav, About constellation, Experience journey, mascot, My story).
2. Articles: TKT-117 (article + Resources image sizing) and the Articles/Resources redesign (to be grilled with Claude; earlier options rejected).
3. PassLoop build-out.
4. TKT-99 old editors redo (later).

## Known gaps

- Supabase leaked-password protection off (Google sign-in only; low risk). `record_signin` callable by signed-in users by design.
- Domain/subdomain SSO sign-offs unverified.

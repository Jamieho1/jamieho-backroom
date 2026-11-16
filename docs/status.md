# Current state

Snapshot only (≤400 words). Replace lines when facts change; no dated logs — git history keeps them. Decisions go in [decisions.md](decisions.md).

## Live

- Production READY on 2f4d437 (checked 2026-11-16). Jamie pushes; Vercel deploys.
- Documentation retains active specs/current topics only; superseded planning uses git history.
- All migrations through `20261116165138_home_v13_data.sql` (TKT-110) are applied live; remote version `20261116171034`. None pending.
- Article pages are ISR daily (`revalidate = 86400`); Content Drafts approvals call `revalidatePath`. Direct DB edits need a save in the editor or a redeploy.

## Site today

- Home journey at `/`: Hello → About → Experience → Work → Techstack → Creator → Contact Us in the working tree; About uses the constellation; Experience uses the public-stop curve. `/about` redirects to `/#pivot` until My story ships.
- Working-tree top/floating bars: Journey · My story · Projects · Interview Prep · Articles · Resources. Privacy lives in the Contact form only. Icon-only Auto/Day/Night switch.
- `/interview` is PassLoop: sidebar with Interview Skills (DSA, System Design, LLD, Fundamental, SQL), Role, Career (Resume, Behavioral, Project), Tools. Open to all; per-user flags, code, resume and STAR answers, own-rows RLS. Old `/notes`, `/practices`, `/behavioral` still work (deprecation pending Jamie).
- Resources lists Guides only, in the Articles-style sidebar layout with series filters.
- Content Drafts: `/manage/review` with page preview, owner badge, photo slots. Covers site_sections, CV, projects/articles/guides, notes/practice/behavioral and resume template. TKT-107/108 live photo-slot test verified: approved set, exactly one expected DataKind UK project-media URL, Storage PNG 3,254,783 bytes.

## Open work (in order)

1. TKT-110 schema is applied/verified; code deployment and Jamie’s live review remain pending. Its prior implementation checks passed.
2. TKT-110b: three live draft sets await Jamie’s separate approvals at /manage/review after TKT-110 deployment: About photos `23f1a988-4bcc-4a34-971e-f17144ebe77a`; journey stops `c0770745-b17b-4ec3-84d8-59b65d301427`; trimmed About `3ef88c4c-4cf2-4469-8078-43287d733c7e`. Last read-back: draft/unapproved; live content unchanged and Story blank. TKT-111–113 order/navigation, About constellation and Experience curve implemented locally. TKT-113 typecheck, 1,089 unit/DB tests, build/static assertions and 51 browser cases pass (3 viewport skips); no migration/live writes. Jamie deploys/reviews live; next TKT-114–116.
3. Articles: TKT-117 (article + Resources image sizing) and the Articles/Resources redesign (to be grilled with Claude; earlier options rejected).
4. PassLoop build-out.
5. TKT-99 old editors redo (later).

## Known gaps

- Supabase leaked-password protection off (Google sign-in only; low risk). `record_signin` callable by signed-in users by design.
- Domain/subdomain SSO sign-offs unverified.

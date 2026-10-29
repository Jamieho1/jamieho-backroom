-- TKT-55: Experience (roles, projects, education) with a public flag on every item and bullet.
-- Everything starts hidden. The landing page shows only what Jamie ticks public; Behavioral (TKT-67) shows
-- the whole CV to whoever can open the Behavioral app.

create table public.experience_items (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'role' check (kind in ('role', 'project', 'education', 'other')),
  title text not null default '' check (length(title) <= 160),
  org text not null default '' check (length(org) <= 160),
  dates text not null default '' check (length(dates) <= 80),
  location text not null default '' check (length(location) <= 80),
  summary text not null default '' check (length(summary) <= 2000),
  sort int not null default 100,
  public boolean not null default false,
  updated_at timestamptz not null default now()
);

create table public.experience_bullets (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.experience_items (id) on delete cascade,
  text text not null default '' check (length(text) <= 1000),
  sort int not null default 100,
  public boolean not null default false,
  updated_at timestamptz not null default now()
);
create index experience_bullets_item on public.experience_bullets (item_id, sort);

alter table public.experience_items enable row level security;
alter table public.experience_bullets enable row level security;
revoke insert, update, delete, truncate on public.experience_items, public.experience_bullets from anon;

-- Reads: public rows for everyone; the whole CV for whoever can open Behavioral (owner + invitees by default).
create policy "experience_items: public or behavioral" on public.experience_items for select to anon, authenticated
  using (public or (select rls.can_view_app('behavioral')));
create policy "experience_bullets: public or behavioral" on public.experience_bullets for select to anon, authenticated
  using (
    (public and exists (select 1 from public.experience_items i where i.id = item_id and i.public))
    or (select rls.can_view_app('behavioral'))
  );

-- Writes: owner only.
create policy "experience_items: owner writes" on public.experience_items for all to authenticated
  using ((select rls.is_owner())) with check ((select rls.is_owner()));
create policy "experience_bullets: owner writes" on public.experience_bullets for all to authenticated
  using ((select rls.is_owner())) with check ((select rls.is_owner()));

create trigger experience_items_touch before update on public.experience_items for each row execute function private.touch_updated_at();
create trigger experience_bullets_touch before update on public.experience_bullets for each row execute function private.touch_updated_at();

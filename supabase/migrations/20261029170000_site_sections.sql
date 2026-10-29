-- TKT-54: landing-page sections as Markdown rows. Everyone reads; only the owner edits.
-- Seeded with placeholders only: Jamie writes the real words in Edit site mode (no CV text in git).

create table public.site_sections (
  key text primary key check (key in ('hero', 'about', 'writing', 'contact')),
  title text not null default '' check (length(title) <= 120),
  body text not null default '' check (length(body) <= 20000),
  sort int not null default 100,
  updated_at timestamptz not null default now()
);
alter table public.site_sections enable row level security;
revoke insert, update, delete, truncate on public.site_sections from anon;
revoke insert, delete, truncate on public.site_sections from authenticated;

create policy "site_sections: anyone reads" on public.site_sections for select to anon, authenticated using (true);
create policy "site_sections: owner edits" on public.site_sections for update to authenticated
  using ((select rls.is_owner())) with check ((select rls.is_owner()));

create or replace function private.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
create trigger site_sections_touch before update on public.site_sections for each row execute function private.touch_updated_at();

insert into public.site_sections (key, title, body, sort) values
  ('hero', 'Jamie Ho', 'Software engineer in London. *Replace this line with your one-line intro in Edit site mode.*', 10),
  ('about', 'About', '*Write a short paragraph about yourself here.*', 20),
  ('writing', 'Writing & videos', '*Add links to your YouTube channel, articles or talks here.*', 40),
  ('contact', 'Contact', '*Say how people can reach you for work.*', 90)
on conflict (key) do nothing;

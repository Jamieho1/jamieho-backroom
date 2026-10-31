-- TKT-62: free notes use the existing Notes read/owner-write policies.
-- Existing body, visuals and note rows are preserved.
alter table public.notes
  add column free text not null default '' check (length(free) <= 200000);

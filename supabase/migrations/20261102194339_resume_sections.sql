-- Resume categories; keep existing rows, visibility flags and read policies unchanged.
alter table public.experience_items drop constraint experience_items_kind_check;
alter table public.experience_items add constraint experience_items_kind_check
  check (kind in ('role', 'project', 'education', 'certificate', 'skills', 'other'));

-- Existing per-operation owner write policies and public/Behavioral read policies remain unchanged.

-- TKT-65: private owner code/history, plus per-question notes shared with Practice viewers.
create table public.practice_code (
  problem integer primary key check (problem between 1 and 10000),
  code text not null default '' check (length(code) <= 100000),
  updated_at timestamptz not null default now()
);
create table public.practice_attempts (
  id uuid primary key default gen_random_uuid(),
  problem integer not null check (problem between 1 and 10000),
  code text not null check (length(code) <= 100000),
  mode text not null check (mode in ('run', 'submit')),
  status text not null check (status in ('ok', 'compile_error', 'timeout', 'crash')),
  passed integer not null default 0 check (passed >= 0),
  total integer not null default 0 check (total >= passed),
  error text not null default '' check (length(error) <= 2000),
  created_at timestamptz not null default now()
);
create index practice_attempts_problem_time on public.practice_attempts (problem, created_at desc);
create table public.question_notes (
  problem integer primary key check (problem between 1 and 10000),
  body text not null default '' check (length(body) <= 200000),
  updated_at timestamptz not null default now()
);

alter table public.practice_code enable row level security;
alter table public.practice_attempts enable row level security;
alter table public.question_notes enable row level security;
revoke all on public.practice_code, public.practice_attempts, public.question_notes from anon, authenticated;
grant select on public.practice_code, public.practice_attempts, public.question_notes to anon, authenticated;
grant insert, update, delete on public.practice_code, public.practice_attempts, public.question_notes to authenticated;

create policy "practice_code: owner reads" on public.practice_code for select to anon, authenticated
  using ((select rls.can_view_app('practice')) and (select rls.is_owner()));
create policy "practice_code: owner inserts" on public.practice_code for insert to authenticated with check ((select rls.is_owner()));
create policy "practice_code: owner updates" on public.practice_code for update to authenticated using ((select rls.is_owner())) with check ((select rls.is_owner()));
create policy "practice_code: owner deletes" on public.practice_code for delete to authenticated using ((select rls.is_owner()));

create policy "practice_attempts: owner reads" on public.practice_attempts for select to anon, authenticated
  using ((select rls.can_view_app('practice')) and (select rls.is_owner()));
create policy "practice_attempts: owner inserts" on public.practice_attempts for insert to authenticated with check ((select rls.is_owner()));
create policy "practice_attempts: owner updates" on public.practice_attempts for update to authenticated using ((select rls.is_owner())) with check ((select rls.is_owner()));
create policy "practice_attempts: owner deletes" on public.practice_attempts for delete to authenticated using ((select rls.is_owner()));

create policy "question_notes: allowed app viewers read" on public.question_notes for select to anon, authenticated using ((select rls.can_view_app('practice')));
create policy "question_notes: owner inserts" on public.question_notes for insert to authenticated with check ((select rls.is_owner()));
create policy "question_notes: owner updates" on public.question_notes for update to authenticated using ((select rls.is_owner())) with check ((select rls.is_owner()));
create policy "question_notes: owner deletes" on public.question_notes for delete to authenticated using ((select rls.is_owner()));

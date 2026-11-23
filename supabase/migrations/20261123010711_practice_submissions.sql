-- P3: private complexity drafts and immutable submission snapshots; existing progress is preserved.
create table public.practice_complexities (
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 problem integer not null check(problem between 1 and 100000),
 time_complexity text not null default '' check(length(time_complexity)+length(regexp_replace(time_complexity,U&'[^\+010000-\+10FFFF]','','g'))<=120),
 space_complexity text not null default '' check(length(space_complexity)+length(regexp_replace(space_complexity,U&'[^\+010000-\+10FFFF]','','g'))<=120),
 updated_at timestamptz not null default now(),primary key(user_id,problem)
);
create table public.practice_submissions (
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 id uuid not null,problem integer not null check(problem between 1 and 100000),
 status text not null check(status in ('accepted','wrong answer','runtime error','time limit')),
 passed integer not null check(passed>=0),total integer not null check(total>=passed and total between 1 and 10000),
 runtime_ms double precision not null check(runtime_ms>=0 and runtime_ms<=86400000),
 language text not null default 'Python' check(language='Python'),
 code text not null check(length(code)+length(regexp_replace(code,U&'[^\+010000-\+10FFFF]','','g'))<=100000),
 time_complexity text not null default '' check(length(time_complexity)+length(regexp_replace(time_complexity,U&'[^\+010000-\+10FFFF]','','g'))<=120),
 space_complexity text not null default '' check(length(space_complexity)+length(regexp_replace(space_complexity,U&'[^\+010000-\+10FFFF]','','g'))<=120),
 created_at timestamptz not null default now(),primary key(user_id,id),
 check((status='accepted' and passed=total) or (status<>'accepted' and passed<total))
);
create index practice_submissions_user_problem_time on public.practice_submissions(user_id,problem,created_at desc,id desc);
alter table public.practice_complexities enable row level security;
alter table public.practice_submissions enable row level security;
revoke all on public.practice_complexities,public.practice_submissions from anon,authenticated;
grant select,insert,update,delete on public.practice_complexities to authenticated;
grant select,insert,delete on public.practice_submissions to authenticated;
grant select on public.practice_complexities,public.practice_submissions to service_role;
create policy "practice_complexities: own rows" on public.practice_complexities for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy "practice_submissions: own rows" on public.practice_submissions for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
comment on table public.practice_submissions is 'Private immutable Submit snapshots; own-user access, no owner bypass. Existing attempts still determine completion.';

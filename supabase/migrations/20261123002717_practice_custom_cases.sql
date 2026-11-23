-- P2: private input overrides/custom cases; saved code and attempt rows remain untouched.
create table public.practice_cases (
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 problem integer not null check(problem>0 and problem<=100000),
 cases jsonb not null default '[]'::jsonb,
 updated_at timestamptz not null default now(),
 primary key(user_id,problem)
);
alter table public.practice_cases enable row level security;
revoke all on public.practice_cases from anon,authenticated;
grant select,insert,update,delete on public.practice_cases to authenticated;
grant select on public.practice_cases to service_role;
create policy "practice_cases: own rows" on public.practice_cases for all to authenticated
 using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create function private.validate_practice_cases() returns trigger language plpgsql set search_path='' as $$
declare row_value jsonb; input_value jsonb; seen text[]='{}'; ident text;
begin
 if jsonb_typeof(new.cases)<>'array' or jsonb_array_length(new.cases)>20 or length(new.cases::text)>120000 then raise exception 'Invalid test cases: maximum 20 cases and bounded input size.' using errcode='22023'; end if;
 for row_value in select value from jsonb_array_elements(new.cases) loop
  if jsonb_typeof(row_value)<>'object' or (row_value-array['id','inputs'])<>'{}'::jsonb or not(row_value?'id' and row_value?'inputs') then raise exception 'Invalid test case fields.' using errcode='22023'; end if;
  ident=row_value->>'id';
  if jsonb_typeof(row_value->'id')<>'string' or ident!~*'^(visible:[A-Za-z0-9_-]{1,60}|custom:[0-9a-f-]{36})$' or ident=any(seen) then raise exception 'Invalid or duplicate case ID.' using errcode='22023'; end if;
  seen=array_append(seen,ident);
  if jsonb_typeof(row_value->'inputs')<>'array' or jsonb_array_length(row_value->'inputs') not between 1 and 20 then raise exception 'Invalid test inputs.' using errcode='22023'; end if;
  for input_value in select value from jsonb_array_elements(row_value->'inputs') loop
   if jsonb_typeof(input_value)<>'string' or length(input_value#>>'{}')+length(regexp_replace(input_value#>>'{}',U&'[^\+010000-\+10FFFF]','','g'))>10000 then raise exception 'Keep each test input under 10000 characters.' using errcode='22023'; end if;
  end loop;
 end loop;
 return new;
end $$;
revoke all on function private.validate_practice_cases() from public,anon,authenticated,service_role;
create trigger validate_practice_cases before insert or update on public.practice_cases for each row execute function private.validate_practice_cases();
comment on table public.practice_cases is 'Private per-user practice input overrides/custom cases; no owner bypass, exported encrypted.';

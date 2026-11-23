-- S2: per-account whiteboard canvas (Excalidraw scene JSON) for each system-design question.
-- NOT applied to any remote database until Jamie says "apply it". Own-row RLS for everyone including the owner.
create table public.system_design_whiteboards (
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 question_id uuid not null references public.system_design_questions(id) on delete cascade,
 scene jsonb not null check(
  jsonb_typeof(scene)='object'
  and coalesce(jsonb_typeof(scene->'elements')='array',false)
  and jsonb_array_length(scene->'elements')<=3000
  and pg_column_size(scene)<=1000000
 ),
 updated_at timestamptz not null default now(),
 primary key(user_id,question_id)
);
alter table public.system_design_whiteboards enable row level security;
revoke all on public.system_design_whiteboards from public,anon,authenticated,service_role;
grant select,insert,update,delete on public.system_design_whiteboards to authenticated;
grant select on public.system_design_whiteboards to service_role;
create policy "system_design_whiteboards: own rows read" on public.system_design_whiteboards for select to authenticated using (user_id=(select auth.uid()));
create policy "system_design_whiteboards: own rows insert" on public.system_design_whiteboards for insert to authenticated with check (user_id=(select auth.uid()) and exists(select 1 from public.system_design_questions q where q.id=question_id and q.public));
create policy "system_design_whiteboards: own rows update" on public.system_design_whiteboards for update to authenticated using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));
create policy "system_design_whiteboards: own rows delete" on public.system_design_whiteboards for delete to authenticated using (user_id=(select auth.uid()));
comment on table public.system_design_whiteboards is 'Per-account whiteboard scene for a system-design question; own-row RLS, user_id exported with every row.';

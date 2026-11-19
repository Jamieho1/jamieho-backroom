-- Contact brief. Existing messages/budgets remain unchanged (reason NULL = historical row).
-- New server submissions require a reason. NULL retains the legacy transport shape during rollout.
-- Existing guard, spam limits, RLS and old-client delivery remain unchanged.
alter table public.messages add column reason text check(reason in ('project','hiring','collaboration','hello'));
alter table public.messages add column needs text[];
alter table public.messages add column timeline text;
alter table public.messages alter column need drop not null;
alter table public.messages alter column budget drop not null;
alter table public.messages drop constraint messages_need_check;
alter table public.messages add constraint messages_need_check check(need is null or length(btrim(need)) between 1 and 4000);
alter table public.messages add constraint messages_brief_shape check (
 (reason is null and needs is null and timeline is null and need is not null)
 or (reason is not null and kind='contact' and reason='project' and needs is not null and cardinality(needs) between 1 and 6
   and array_position(needs,null) is null
   and needs <@ array['AI engineering','Production event systems','Cloud architecture','Full-stack & delivery','Machine learning & computer vision','Something else']::text[]
   and cardinality(array_positions(needs,'AI engineering'))<=1 and cardinality(array_positions(needs,'Production event systems'))<=1 and cardinality(array_positions(needs,'Cloud architecture'))<=1 and cardinality(array_positions(needs,'Full-stack & delivery'))<=1 and cardinality(array_positions(needs,'Machine learning & computer vision'))<=1 and cardinality(array_positions(needs,'Something else'))<=1
   and budget is not null and budget in ('Under £1k','£1k–£5k','£5k–£15k','£15k+','Not sure yet')
   and timeline is not null and timeline in ('As soon as possible','Within 1–3 months','Just exploring'))
 or (reason is not null and kind='contact' and reason in ('hiring','collaboration','hello') and needs is null and budget is null and timeline is null)
);
alter table public.messages add constraint messages_feedback_brief check(kind='contact' or (reason is null and needs is null and timeline is null and need is not null and budget is not null and budget=''));
grant insert(reason,needs,timeline) on public.messages to anon,authenticated;

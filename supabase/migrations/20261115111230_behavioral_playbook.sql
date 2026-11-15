-- TKT-122: shared guides and isolated per-user preparation. Legacy tables remain intact.
create function private.playbook_text(value text,maximum integer,required boolean default false) returns boolean language sql immutable set search_path='' as $$
 select value is not null and char_length(value)+char_length(regexp_replace(value,U&'[^\+010000-\+10FFFF]','','g'))<=maximum and (not required or btrim(value,chr(9)||chr(10)||chr(11)||chr(12)||chr(13)||chr(32)||chr(160)||chr(5760)||chr(8192)||chr(8193)||chr(8194)||chr(8195)||chr(8196)||chr(8197)||chr(8198)||chr(8199)||chr(8200)||chr(8201)||chr(8202)||chr(8232)||chr(8233)||chr(8239)||chr(8287)||chr(12288)||chr(65279))<>'')
$$;
revoke all on function private.playbook_text(text,integer,boolean) from public,anon,authenticated,service_role;
create table public.interview_behavioral_themes(id text primary key check(id ~ '^[a-z][a-z0-9-]{0,59}$'),title text not null,color text not null check(color ~ '^#[0-9a-fA-F]{6}$'),sort integer not null default 0 check(sort between 0 and 10000));
create table public.interview_behavioral_questions(id uuid primary key default gen_random_uuid(),theme_id text not null references public.interview_behavioral_themes(id),prompt text not null,looking_for text not null default '',talk_about text not null default '',star text not null default '',mistakes text not null default '',followups text not null default '',sample text not null default '',sort integer not null default 0 check(sort between 0 and 10000),published boolean not null default true);
create index interview_bq_theme on public.interview_behavioral_questions(theme_id);
create table public.interview_behavioral_custom_questions(id uuid primary key default gen_random_uuid(),user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,theme_id text not null references public.interview_behavioral_themes(id),prompt text not null,legacy jsonb,created_at timestamptz not null default now(),unique(user_id,id));
create index interview_bc_theme on public.interview_behavioral_custom_questions(theme_id);
create index interview_bc_user on public.interview_behavioral_custom_questions(user_id);
create table public.interview_behavioral_answers(user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,question_id uuid not null,custom boolean not null default false,situation text not null default '',task text not null default '',action text not null default '',result text not null default '',role_id uuid,updated_at timestamptz not null default now(),primary key(user_id,question_id));
-- A hardened trigger checks the polymorphic question and the role inside this user's resume.
create function private.validate_playbook_row() returns trigger language plpgsql security definer set search_path='' as $$
declare f text; row jsonb:=to_jsonb(NEW); max_len integer;
begin
 if TG_TABLE_NAME='interview_behavioral_themes' then
  if not private.playbook_text(NEW.title,100,true) then raise exception 'Invalid theme title.' using errcode='22023'; end if;
 elsif TG_TABLE_NAME in ('interview_behavioral_questions','interview_behavioral_custom_questions') then
  if not private.playbook_text(NEW.prompt,400,true) then raise exception 'Invalid question prompt.' using errcode='22023'; end if;
  if TG_TABLE_NAME='interview_behavioral_questions' then
   foreach f in array array['looking_for','talk_about','star','mistakes','followups','sample'] loop
    max_len:=case when f='sample' then 12000 else 6000 end;
    if not private.playbook_text(row->>f,max_len) then raise exception 'Guide text exceeds its limit.' using errcode='22023'; end if;
   end loop;
  else
   if TG_OP='UPDATE' and (NEW.user_id is distinct from OLD.user_id or NEW.id is distinct from OLD.id or NEW.legacy is distinct from OLD.legacy) then raise exception 'Question identity and imported archive cannot change.' using errcode='22023'; end if;
   if TG_OP='INSERT' and auth.uid() is not null and NEW.legacy is not null then raise exception 'Imported archive is migration-only.' using errcode='22023'; end if;
  end if;
 else
  if TG_OP='UPDATE' and (NEW.user_id is distinct from OLD.user_id or NEW.question_id is distinct from OLD.question_id or NEW.custom is distinct from OLD.custom) then raise exception 'Answer identity cannot change.' using errcode='22023'; end if;
  foreach f in array array['situation','task','action','result'] loop
   if not private.playbook_text(row->>f,20000) then raise exception 'STAR text exceeds its limit.' using errcode='22023'; end if;
  end loop;
  if NEW.custom then
   if not exists(select 1 from public.interview_behavioral_custom_questions q where q.id=NEW.question_id and q.user_id=NEW.user_id) then raise exception 'Private question unavailable.' using errcode='22023'; end if;
  elsif not exists(select 1 from public.interview_behavioral_questions q where q.id=NEW.question_id and q.published) then raise exception 'Shared question unavailable.' using errcode='22023'; end if;
  if NEW.role_id is not null and not exists(select 1 from public.user_resumes r cross join lateral jsonb_array_elements(r.content->'entries') e where r.user_id=NEW.user_id and e->>'id'=NEW.role_id::text and e->>'kind'='role') then raise exception 'Choose a role from your own resume.' using errcode='22023'; end if;
  if TG_OP='UPDATE' or auth.uid() is not null then NEW.updated_at:=clock_timestamp(); end if;
 end if;
 return NEW;
end $$;
revoke all on function private.validate_playbook_row() from public,anon,authenticated,service_role;
create function private.cleanup_playbook_answers() returns trigger language plpgsql security definer set search_path='' as $$
begin delete from public.interview_behavioral_answers where user_id=OLD.user_id and question_id=OLD.id and custom; return OLD; end $$;
revoke all on function private.cleanup_playbook_answers() from public,anon,authenticated,service_role;
create trigger playbook_custom_delete after delete on public.interview_behavioral_custom_questions for each row execute function private.cleanup_playbook_answers();
create trigger playbook_theme_validate before insert or update on public.interview_behavioral_themes for each row execute function private.validate_playbook_row();
create trigger playbook_question_validate before insert or update on public.interview_behavioral_questions for each row execute function private.validate_playbook_row();
create trigger playbook_custom_validate before insert or update on public.interview_behavioral_custom_questions for each row execute function private.validate_playbook_row();
create trigger playbook_answer_validate before insert or update on public.interview_behavioral_answers for each row execute function private.validate_playbook_row();
alter table public.interview_behavioral_themes enable row level security;
alter table public.interview_behavioral_questions enable row level security;
alter table public.interview_behavioral_custom_questions enable row level security;
alter table public.interview_behavioral_answers enable row level security;
revoke all on public.interview_behavioral_themes,public.interview_behavioral_questions,public.interview_behavioral_custom_questions,public.interview_behavioral_answers from anon,authenticated;
grant select on public.interview_behavioral_themes,public.interview_behavioral_questions to anon,authenticated;
grant insert,update,delete on public.interview_behavioral_themes,public.interview_behavioral_questions,public.interview_behavioral_custom_questions,public.interview_behavioral_answers to authenticated;
grant select on public.interview_behavioral_custom_questions,public.interview_behavioral_answers to authenticated;
grant select on public.interview_behavioral_themes,public.interview_behavioral_questions,public.interview_behavioral_custom_questions,public.interview_behavioral_answers to service_role;
create policy "playbook themes public" on public.interview_behavioral_themes for select to anon,authenticated using(true);
create policy "playbook themes owner" on public.interview_behavioral_themes for all to authenticated using((select rls.is_owner())) with check((select rls.is_owner()));
create policy "playbook questions public" on public.interview_behavioral_questions for select to anon,authenticated using(published or (select rls.is_owner()));
create policy "playbook questions owner" on public.interview_behavioral_questions for all to authenticated using((select rls.is_owner())) with check((select rls.is_owner()));
create policy "playbook custom own" on public.interview_behavioral_custom_questions for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy "playbook answers own" on public.interview_behavioral_answers for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
insert into public.interview_behavioral_themes(id,title,color,sort) values ('conflict','Conflict','#F87171',0);
insert into public.interview_behavioral_themes(id,title,color,sort) values ('failure-learning','Failure & learning','#FB923C',1);
insert into public.interview_behavioral_themes(id,title,color,sort) values ('leadership','Leadership','#A78BFA',2);
insert into public.interview_behavioral_themes(id,title,color,sort) values ('ambiguity','Ambiguity','#38BDF8',3);
insert into public.interview_behavioral_themes(id,title,color,sort) values ('ownership','Ownership','#FBBF24',4);
insert into public.interview_behavioral_themes(id,title,color,sort) values ('impact','Impact','#34D399',5);
insert into public.interview_behavioral_themes(id,title,color,sort) values ('teamwork','Teamwork','#60A5FA',6);
insert into public.interview_behavioral_themes(id,title,color,sort) values ('customer-focus','Customer focus','#2DD4BF',7);
insert into public.interview_behavioral_themes(id,title,color,sort) values ('why-us-you','Why us / Why you','#E879F9',8);
insert into public.interview_behavioral_questions(id,theme_id,prompt,sort) values ('12200000-0000-4000-8000-000000000001','conflict','Describe resolving a disagreement.',0);
insert into public.interview_behavioral_questions(id,theme_id,prompt,sort) values ('12200000-0000-4000-8000-000000000002','conflict','When did you challenge a request constructively?',1);
insert into public.interview_behavioral_questions(id,theme_id,prompt,sort) values ('12200000-0000-4000-8000-000000000003','failure-learning','Describe a mistake and what changed afterward.',0);
insert into public.interview_behavioral_questions(id,theme_id,prompt,sort) values ('12200000-0000-4000-8000-000000000004','failure-learning','How did you act on difficult feedback?',1);
insert into public.interview_behavioral_questions(id,theme_id,prompt,sort) values ('12200000-0000-4000-8000-000000000005','leadership','Describe influencing without authority.',0);
insert into public.interview_behavioral_questions(id,theme_id,prompt,sort) values ('12200000-0000-4000-8000-000000000006','leadership','How have you helped someone develop?',1);
insert into public.interview_behavioral_questions(id,theme_id,prompt,sort) values ('12200000-0000-4000-8000-000000000007','ambiguity','How did you turn unclear requirements into a plan?',0);
insert into public.interview_behavioral_questions(id,theme_id,prompt,sort) values ('12200000-0000-4000-8000-000000000008','ambiguity','Describe deciding with incomplete evidence.',1);
insert into public.interview_behavioral_questions(id,theme_id,prompt,sort) values ('12200000-0000-4000-8000-000000000009','ownership','When did you take responsibility beyond your role?',0);
insert into public.interview_behavioral_questions(id,theme_id,prompt,sort) values ('12200000-0000-4000-8000-000000000010','ownership','Describe resolving an incident and following through.',1);
insert into public.interview_behavioral_questions(id,theme_id,prompt,sort) values ('12200000-0000-4000-8000-000000000011','impact','Which project are you proudest of?',0);
insert into public.interview_behavioral_questions(id,theme_id,prompt,sort) values ('12200000-0000-4000-8000-000000000012','impact','What process or system did you improve, and how did you measure it?',1);
insert into public.interview_behavioral_questions(id,theme_id,prompt,sort) values ('12200000-0000-4000-8000-000000000013','teamwork','Describe working across teams with different priorities.',0);
insert into public.interview_behavioral_questions(id,theme_id,prompt,sort) values ('12200000-0000-4000-8000-000000000014','teamwork','How did you help a team deliver under pressure?',1);
insert into public.interview_behavioral_questions(id,theme_id,prompt,sort) values ('12200000-0000-4000-8000-000000000015','customer-focus','When did you uncover what a user actually needed?',0);
insert into public.interview_behavioral_questions(id,theme_id,prompt,sort) values ('12200000-0000-4000-8000-000000000016','customer-focus','Describe balancing a user request with technical constraints.',1);
insert into public.interview_behavioral_questions(id,theme_id,prompt,sort) values ('12200000-0000-4000-8000-000000000017','why-us-you','Why this company and role?',0);
insert into public.interview_behavioral_questions(id,theme_id,prompt,sort) values ('12200000-0000-4000-8000-000000000018','why-us-you','What experience makes you a strong fit?',1);
insert into public.content_changes(summary,operations) values ('TKT-122: Review starter Behavioral guides (18 questions)','[{"table": "interview_behavioral_questions", "op": "update", "key": "12200000-0000-4000-8000-000000000001", "fields": {"looking_for": "Respectful disagreement, listening and a decision based on evidence rather than winning.", "talk_about": "A design review, delivery scope discussion or disagreement over priorities.", "star": "Situation: give only the context needed. Task: name your responsibility. Action: explain your own decisions and collaboration. Result: state the outcome, evidence and learning. For motivation questions, use a brief relevant example rather than forcing the whole response into STAR.", "mistakes": "Blaming the other person; skipping their reasoning; claiming you alone fixed everything.", "followups": "What did the other person get right? What would you do if they still disagreed?", "sample": "Fictional example \u2014 adapt the structure, never claim this experience as your own. A teammate wanted a full rewrite while I preferred an incremental change. I asked what risks concerned them and compared both options with a small test. We agreed on an incremental release with clear rollback checks. The team shipped the first slice and used the measurements to decide what to tackle next."}}, {"table": "interview_behavioral_questions", "op": "update", "key": "12200000-0000-4000-8000-000000000002", "fields": {"looking_for": "Respectful disagreement, listening and a decision based on evidence rather than winning.", "talk_about": "A design review, delivery scope discussion or disagreement over priorities.", "star": "Situation: give only the context needed. Task: name your responsibility. Action: explain your own decisions and collaboration. Result: state the outcome, evidence and learning. For motivation questions, use a brief relevant example rather than forcing the whole response into STAR.", "mistakes": "Blaming the other person; skipping their reasoning; claiming you alone fixed everything.", "followups": "What did the other person get right? What would you do if they still disagreed?", "sample": "Fictional example \u2014 adapt the structure, never claim this experience as your own. A teammate wanted a full rewrite while I preferred an incremental change. I asked what risks concerned them and compared both options with a small test. We agreed on an incremental release with clear rollback checks. The team shipped the first slice and used the measurements to decide what to tackle next."}}, {"table": "interview_behavioral_questions", "op": "update", "key": "12200000-0000-4000-8000-000000000003", "fields": {"looking_for": "Accountability, honest reflection and a specific change in behaviour.", "talk_about": "A mistake you owned or feedback that changed how you work.", "star": "Situation: give only the context needed. Task: name your responsibility. Action: explain your own decisions and collaboration. Result: state the outcome, evidence and learning. For motivation questions, use a brief relevant example rather than forcing the whole response into STAR.", "mistakes": "Disguising a strength as a weakness; blaming circumstances; describing no follow-through.", "followups": "What was your contribution to the mistake? How do you know the change helped?", "sample": "Fictional example \u2014 adapt the structure, never claim this experience as your own. I underestimated the effort to validate a data import and missed an internal milestone. I told the team early, reduced the next delivery to a safe slice and added validation checkpoints. On the next import, those checks caught a mismatch before release. I learned to estimate verification work explicitly."}}, {"table": "interview_behavioral_questions", "op": "update", "key": "12200000-0000-4000-8000-000000000004", "fields": {"looking_for": "Accountability, honest reflection and a specific change in behaviour.", "talk_about": "A mistake you owned or feedback that changed how you work.", "star": "Situation: give only the context needed. Task: name your responsibility. Action: explain your own decisions and collaboration. Result: state the outcome, evidence and learning. For motivation questions, use a brief relevant example rather than forcing the whole response into STAR.", "mistakes": "Disguising a strength as a weakness; blaming circumstances; describing no follow-through.", "followups": "What was your contribution to the mistake? How do you know the change helped?", "sample": "Fictional example \u2014 adapt the structure, never claim this experience as your own. I underestimated the effort to validate a data import and missed an internal milestone. I told the team early, reduced the next delivery to a safe slice and added validation checkpoints. On the next import, those checks caught a mismatch before release. I learned to estimate verification work explicitly."}}, {"table": "interview_behavioral_questions", "op": "update", "key": "12200000-0000-4000-8000-000000000005", "fields": {"looking_for": "Clear influence, empathy and helping others make progress.", "talk_about": "A proposal you won support for or a colleague you coached.", "star": "Situation: give only the context needed. Task: name your responsibility. Action: explain your own decisions and collaboration. Result: state the outcome, evidence and learning. For motivation questions, use a brief relevant example rather than forcing the whole response into STAR.", "mistakes": "Confusing authority with influence; taking credit for someone else\u2019s growth.", "followups": "How did you adapt your approach? What did you learn from the other person?", "sample": "Fictional example \u2014 adapt the structure, never claim this experience as your own. Our team had inconsistent incident notes. I gathered examples, asked colleagues what they needed and proposed a short template. Two volunteers tried it and suggested changes. After sharing the revised version, the team adopted it. The useful outcome was a shared practice the team could maintain without me."}}, {"table": "interview_behavioral_questions", "op": "update", "key": "12200000-0000-4000-8000-000000000006", "fields": {"looking_for": "Clear influence, empathy and helping others make progress.", "talk_about": "A proposal you won support for or a colleague you coached.", "star": "Situation: give only the context needed. Task: name your responsibility. Action: explain your own decisions and collaboration. Result: state the outcome, evidence and learning. For motivation questions, use a brief relevant example rather than forcing the whole response into STAR.", "mistakes": "Confusing authority with influence; taking credit for someone else\u2019s growth.", "followups": "How did you adapt your approach? What did you learn from the other person?", "sample": "Fictional example \u2014 adapt the structure, never claim this experience as your own. Our team had inconsistent incident notes. I gathered examples, asked colleagues what they needed and proposed a short template. Two volunteers tried it and suggested changes. After sharing the revised version, the team adopted it. The useful outcome was a shared practice the team could maintain without me."}}, {"table": "interview_behavioral_questions", "op": "update", "key": "12200000-0000-4000-8000-000000000007", "fields": {"looking_for": "Reasoned assumptions, bounded experiments and explicit handling of uncertainty.", "talk_about": "Unclear requirements, incomplete evidence or changing priorities.", "star": "Situation: give only the context needed. Task: name your responsibility. Action: explain your own decisions and collaboration. Result: state the outcome, evidence and learning. For motivation questions, use a brief relevant example rather than forcing the whole response into STAR.", "mistakes": "Pretending you knew everything; collecting evidence forever; hiding assumptions.", "followups": "Which assumption mattered most? What would have made you change direction?", "sample": "Fictional example \u2014 adapt the structure, never claim this experience as your own. A request to make search better had no success measure. I spoke with users, identified a common failed lookup and proposed a small relevance experiment. We agreed on examples to test and a review date. The first result was mixed, so we adjusted the query rules rather than expanding the project blindly."}}, {"table": "interview_behavioral_questions", "op": "update", "key": "12200000-0000-4000-8000-000000000008", "fields": {"looking_for": "Reasoned assumptions, bounded experiments and explicit handling of uncertainty.", "talk_about": "Unclear requirements, incomplete evidence or changing priorities.", "star": "Situation: give only the context needed. Task: name your responsibility. Action: explain your own decisions and collaboration. Result: state the outcome, evidence and learning. For motivation questions, use a brief relevant example rather than forcing the whole response into STAR.", "mistakes": "Pretending you knew everything; collecting evidence forever; hiding assumptions.", "followups": "Which assumption mattered most? What would have made you change direction?", "sample": "Fictional example \u2014 adapt the structure, never claim this experience as your own. A request to make search better had no success measure. I spoke with users, identified a common failed lookup and proposed a small relevance experiment. We agreed on examples to test and a review date. The first result was mixed, so we adjusted the query rules rather than expanding the project blindly."}}, {"table": "interview_behavioral_questions", "op": "update", "key": "12200000-0000-4000-8000-000000000009", "fields": {"looking_for": "Following a problem through, communicating risk and preventing recurrence.", "talk_about": "An incident, overlooked responsibility or improvement beyond your normal remit.", "star": "Situation: give only the context needed. Task: name your responsibility. Action: explain your own decisions and collaboration. Result: state the outcome, evidence and learning. For motivation questions, use a brief relevant example rather than forcing the whole response into STAR.", "mistakes": "Hero narratives; working outside your authority without alignment; no lasting follow-through.", "followups": "Who else helped? How did you prevent the problem returning?", "sample": "Fictional example \u2014 adapt the structure, never claim this experience as your own. I noticed repeated retries creating duplicate notifications. I raised the risk, agreed a safe mitigation with the on-call engineer and helped trace the retry path. We added an idempotency check and a regression case. I documented the cause and tracked the follow-up so the fix did not end with the incident call."}}, {"table": "interview_behavioral_questions", "op": "update", "key": "12200000-0000-4000-8000-000000000010", "fields": {"looking_for": "Following a problem through, communicating risk and preventing recurrence.", "talk_about": "An incident, overlooked responsibility or improvement beyond your normal remit.", "star": "Situation: give only the context needed. Task: name your responsibility. Action: explain your own decisions and collaboration. Result: state the outcome, evidence and learning. For motivation questions, use a brief relevant example rather than forcing the whole response into STAR.", "mistakes": "Hero narratives; working outside your authority without alignment; no lasting follow-through.", "followups": "Who else helped? How did you prevent the problem returning?", "sample": "Fictional example \u2014 adapt the structure, never claim this experience as your own. I noticed repeated retries creating duplicate notifications. I raised the risk, agreed a safe mitigation with the on-call engineer and helped trace the retry path. We added an idempotency check and a regression case. I documented the cause and tracked the follow-up so the fix did not end with the incident call."}}, {"table": "interview_behavioral_questions", "op": "update", "key": "12200000-0000-4000-8000-000000000011", "fields": {"looking_for": "A clear user or business outcome and your identifiable contribution.", "talk_about": "A project or measurable process improvement; distinguish team impact from your part.", "star": "Situation: give only the context needed. Task: name your responsibility. Action: explain your own decisions and collaboration. Result: state the outcome, evidence and learning. For motivation questions, use a brief relevant example rather than forcing the whole response into STAR.", "mistakes": "Listing technologies without outcomes; inventing metrics; claiming the team\u2019s work as your own.", "followups": "What was the baseline? How did you separate the effect of your change from other factors?", "sample": "Fictional example \u2014 adapt the structure, never claim this experience as your own. A support report took several manual steps. I mapped the workflow, built a small aggregation job and tested its output against the old process. The team no longer had to assemble the same data by hand. We tracked time spent and errors before and after, and kept a manual fallback during rollout."}}, {"table": "interview_behavioral_questions", "op": "update", "key": "12200000-0000-4000-8000-000000000012", "fields": {"looking_for": "A clear user or business outcome and your identifiable contribution.", "talk_about": "A project or measurable process improvement; distinguish team impact from your part.", "star": "Situation: give only the context needed. Task: name your responsibility. Action: explain your own decisions and collaboration. Result: state the outcome, evidence and learning. For motivation questions, use a brief relevant example rather than forcing the whole response into STAR.", "mistakes": "Listing technologies without outcomes; inventing metrics; claiming the team\u2019s work as your own.", "followups": "What was the baseline? How did you separate the effect of your change from other factors?", "sample": "Fictional example \u2014 adapt the structure, never claim this experience as your own. A support report took several manual steps. I mapped the workflow, built a small aggregation job and tested its output against the old process. The team no longer had to assemble the same data by hand. We tracked time spent and errors before and after, and kept a manual fallback during rollout."}}, {"table": "interview_behavioral_questions", "op": "update", "key": "12200000-0000-4000-8000-000000000013", "fields": {"looking_for": "Coordination, shared priorities, reliability and willingness to help.", "talk_about": "A cross-team dependency, deadline or moment you supported a teammate.", "star": "Situation: give only the context needed. Task: name your responsibility. Action: explain your own decisions and collaboration. Result: state the outcome, evidence and learning. For motivation questions, use a brief relevant example rather than forcing the whole response into STAR.", "mistakes": "Saying only we without explaining your role; blaming another team; treating overwork as the only solution.", "followups": "How were responsibilities agreed? What happened when a dependency slipped?", "sample": "Fictional example \u2014 adapt the structure, never claim this experience as your own. Two teams needed the same deployment window. I arranged a short discussion to identify the real deadlines and dependencies. We split the release into independent steps and wrote down owners and rollback points. Both teams completed their essential work, and the next shared release used the same coordination checklist."}}, {"table": "interview_behavioral_questions", "op": "update", "key": "12200000-0000-4000-8000-000000000014", "fields": {"looking_for": "Coordination, shared priorities, reliability and willingness to help.", "talk_about": "A cross-team dependency, deadline or moment you supported a teammate.", "star": "Situation: give only the context needed. Task: name your responsibility. Action: explain your own decisions and collaboration. Result: state the outcome, evidence and learning. For motivation questions, use a brief relevant example rather than forcing the whole response into STAR.", "mistakes": "Saying only we without explaining your role; blaming another team; treating overwork as the only solution.", "followups": "How were responsibilities agreed? What happened when a dependency slipped?", "sample": "Fictional example \u2014 adapt the structure, never claim this experience as your own. Two teams needed the same deployment window. I arranged a short discussion to identify the real deadlines and dependencies. We split the release into independent steps and wrote down owners and rollback points. Both teams completed their essential work, and the next shared release used the same coordination checklist."}}, {"table": "interview_behavioral_questions", "op": "update", "key": "12200000-0000-4000-8000-000000000015", "fields": {"looking_for": "Curiosity about the underlying need and honest communication of constraints.", "talk_about": "User interviews, support cases or balancing a request with safety and maintainability.", "star": "Situation: give only the context needed. Task: name your responsibility. Action: explain your own decisions and collaboration. Result: state the outcome, evidence and learning. For motivation questions, use a brief relevant example rather than forcing the whole response into STAR.", "mistakes": "Accepting every request literally; dismissing users; promising a result you cannot support.", "followups": "How did you validate the need? What alternative did you offer?", "sample": "Fictional example \u2014 adapt the structure, never claim this experience as your own. A user asked for a large spreadsheet export. I asked how they used it and found they only needed a recurring exception list. I showed a smaller report, explained its limits and collected feedback. We delivered the focused report first and reviewed whether a full export was still necessary."}}, {"table": "interview_behavioral_questions", "op": "update", "key": "12200000-0000-4000-8000-000000000016", "fields": {"looking_for": "Curiosity about the underlying need and honest communication of constraints.", "talk_about": "User interviews, support cases or balancing a request with safety and maintainability.", "star": "Situation: give only the context needed. Task: name your responsibility. Action: explain your own decisions and collaboration. Result: state the outcome, evidence and learning. For motivation questions, use a brief relevant example rather than forcing the whole response into STAR.", "mistakes": "Accepting every request literally; dismissing users; promising a result you cannot support.", "followups": "How did you validate the need? What alternative did you offer?", "sample": "Fictional example \u2014 adapt the structure, never claim this experience as your own. A user asked for a large spreadsheet export. I asked how they used it and found they only needed a recurring exception list. I showed a smaller report, explained its limits and collected feedback. We delivered the focused report first and reviewed whether a full export was still necessary."}}, {"table": "interview_behavioral_questions", "op": "update", "key": "12200000-0000-4000-8000-000000000017", "fields": {"looking_for": "Informed motivation, relevant evidence and a realistic account of what you want to learn.", "talk_about": "Two concrete aspects of the role, your relevant strengths and a genuine learning goal.", "star": "Situation: give only the context needed. Task: name your responsibility. Action: explain your own decisions and collaboration. Result: state the outcome, evidence and learning. For motivation questions, use a brief relevant example rather than forcing the whole response into STAR.", "mistakes": "Generic praise; reciting the company homepage; unsupported claims about the team.", "followups": "Why this team rather than a similar one? What gap will you need to close?", "sample": "Fictional example \u2014 adapt the structure, never claim this experience as your own. This role interests me because it combines reliable backend systems with close feedback from users. My experience investigating failures and delivering incremental changes is relevant to that work. I want to deepen my understanding of the team\u2019s domain, and I would ask how success is measured before proposing improvements."}}, {"table": "interview_behavioral_questions", "op": "update", "key": "12200000-0000-4000-8000-000000000018", "fields": {"looking_for": "Informed motivation, relevant evidence and a realistic account of what you want to learn.", "talk_about": "Two concrete aspects of the role, your relevant strengths and a genuine learning goal.", "star": "Situation: give only the context needed. Task: name your responsibility. Action: explain your own decisions and collaboration. Result: state the outcome, evidence and learning. For motivation questions, use a brief relevant example rather than forcing the whole response into STAR.", "mistakes": "Generic praise; reciting the company homepage; unsupported claims about the team.", "followups": "Why this team rather than a similar one? What gap will you need to close?", "sample": "Fictional example \u2014 adapt the structure, never claim this experience as your own. This role interests me because it combines reliable backend systems with close feedback from users. My experience investigating failures and delivering incremental changes is relevant to that work. I want to deepen my understanding of the team\u2019s domain, and I would ask how success is measured before proposing improvements."}}]'::jsonb);

-- Copy all source fields, IDs, links and timestamps into the owner's private archive; originals remain.
do $$
declare owner_id uuid; owner_count integer; row record; question uuid; legacy_titles jsonb:='{"g-intro": "How would you introduce your experience and the work you want to do next?", "g-proud": "Which project are you proudest of, and what did you contribute?", "g-disagree": "Describe a disagreement with a colleague and how you resolved it.", "g-fail": "Describe a mistake you made and what changed afterward.", "g-ownership": "When did you take responsibility beyond your assigned role?", "g-incident": "Describe an incident you helped resolve and the follow-through.", "g-deadline": "How did you choose what to deliver under a tight deadline?", "g-ambiguous": "Describe turning unclear requirements into a workable plan.", "g-mentor": "How have you helped someone develop their skills?", "g-influence": "Describe influencing a decision without formal authority.", "g-learn": "When did you need to learn something quickly to deliver a result?", "g-feedback": "Describe difficult feedback and how you acted on it.", "g-crossteam": "How did you work with another team whose priorities differed?", "g-incomplete": "Describe deciding with incomplete evidence and managing the risk.", "g-process": "What process did you improve, and how did you measure the benefit?", "g-tradeoff": "Describe a technical trade-off and the alternatives you considered.", "g-pushback": "When did you challenge a request and offer a better alternative?", "g-customer": "Describe going beyond the initial request to help a user.", "g-bug": "What difficult bug did you investigate, and what was your approach?", "g-pivot": "Describe a change in your career direction and what you learned.", "g-why-leave": "What are you looking for in your next role?", "g-weakness": "Which skill are you improving, and how do you track progress?", "p-why": "Why does working at Palantir interest you?", "p-deepdive": "Walk through a project from problem to outcome and what you would change.", "p-domain": "How did you learn an unfamiliar domain to solve a user problem?", "p-userconflict": "Describe reconciling a stakeholder request with your technical judgment.", "p-messy": "How did you make progress with incomplete or inconsistent data?", "b-why": "What interests you about Balyasny and working in an investment business?", "b-pressure": "Describe delivering while priorities changed under pressure.", "b-latency": "How did you improve a system\u2019s speed or reliability?", "b-users": "Describe meeting the needs of demanding internal users.", "b-wrong": "When did new evidence change your technical opinion?", "j-why": "Why are you interested in JPMorgan and this team?", "j-risk": "Describe balancing delivery speed with safety and controls.", "j-explain": "How did you explain a technical decision to a non-technical audience?", "j-bigorg": "Describe coordinating across a large organisation to get a result.", "j-current": "How do you keep learning and apply new skills to your work?"}'::jsonb; legacy_themes jsonb:='{"g-intro": "impact", "g-proud": "impact", "g-disagree": "conflict", "g-fail": "failure-learning", "g-ownership": "ownership", "g-incident": "ownership", "g-deadline": "ambiguity", "g-ambiguous": "ambiguity", "g-mentor": "leadership", "g-influence": "leadership", "g-learn": "ambiguity", "g-feedback": "failure-learning", "g-crossteam": "conflict", "g-incomplete": "ambiguity", "g-process": "impact", "g-tradeoff": "ambiguity", "g-pushback": "conflict", "g-customer": "customer-focus", "g-bug": "ownership", "g-pivot": "ownership", "g-why-leave": "impact", "g-weakness": "failure-learning", "p-why": "impact", "p-deepdive": "ownership", "p-domain": "customer-focus", "p-userconflict": "conflict", "p-messy": "ambiguity", "b-why": "impact", "b-pressure": "ambiguity", "b-latency": "impact", "b-users": "customer-focus", "b-wrong": "failure-learning", "j-why": "impact", "j-risk": "ownership", "j-explain": "customer-focus", "j-bigorg": "leadership", "j-current": "ownership"}'::jsonb;
begin
 if exists(select 1 from public.behavioral_stories) or exists(select 1 from public.behavioral_answers) then
  select count(*),(array_agg(id))[1] into owner_count,owner_id from public.profiles where role='owner';
  if owner_count<>1 then raise exception 'Cannot migrate Behavioral preparation without one owner.'; end if;
  for row in select * from public.behavioral_stories loop
   question:=gen_random_uuid();
   insert into public.interview_behavioral_custom_questions(id,user_id,theme_id,prompt,legacy) values(question,owner_id,'ownership',row.title,jsonb_build_object('source','behavioral_stories','row',to_jsonb(row)));
   insert into public.interview_behavioral_answers(user_id,question_id,custom,situation,task,action,result,updated_at) values(owner_id,question,true,row.situation,row.task,row.action,row.result,row.updated_at);
  end loop;
  for row in select * from public.behavioral_answers loop
   question:=gen_random_uuid();
   insert into public.interview_behavioral_custom_questions(id,user_id,theme_id,prompt,legacy) values(question,owner_id,coalesce(legacy_themes->>row.question_id,'ownership'),coalesce(legacy_titles->>row.question_id,'Imported preparation: '||row.question_id),jsonb_build_object('source','behavioral_answers','row',to_jsonb(row)));
   insert into public.interview_behavioral_answers(user_id,question_id,custom,action,updated_at) values(owner_id,question,true,row.outline,row.updated_at);
  end loop;
 end if;
end $$;
create function private.apply_playbook_draft(operation jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare tbl text:=operation->>'table';key text:=operation->>'key';fields jsonb:=operation->'fields';before_row jsonb;allowed text[];col text;assignments text:='';cols text;vals text;
begin
 if auth.uid() is null or not rls.is_owner() then raise exception 'Only the owner can approve guides.' using errcode='42501'; end if;
 if jsonb_typeof(operation) is distinct from 'object' or operation-array['op','table','key','fields']::text[]<>'{}'::jsonb or coalesce(tbl,'') not in ('interview_behavioral_themes','interview_behavioral_questions') or coalesce(operation->>'op','') not in ('insert','update') or jsonb_typeof(operation->'key') is distinct from 'string' or jsonb_typeof(fields) is distinct from 'object' or fields='{}'::jsonb then raise exception 'Invalid guide operation.' using errcode='22023'; end if;
 allowed:=case when tbl='interview_behavioral_themes' then array['title','color','sort'] else array['theme_id','prompt','looking_for','talk_about','star','mistakes','followups','sample','sort','published'] end;
 if fields-allowed<>'{}'::jsonb then raise exception 'Unknown guide field.' using errcode='22023'; end if;
 if tbl='interview_behavioral_questions' then perform key::uuid; end if;
 for col in select jsonb_object_keys(fields) loop
  if jsonb_typeof(fields->col) is distinct from (case when col='sort' then 'number' when col='published' then 'boolean' else 'string' end) then raise exception 'Invalid guide field type.' using errcode='22023'; end if;
  if col='sort' and ((fields->>col)::numeric<>trunc((fields->>col)::numeric) or (fields->>col)::numeric not between 0 and 10000) then raise exception 'Invalid guide order.' using errcode='22023'; end if;
 end loop;
 execute format('select to_jsonb(t) from public.%I t where id::text=$1 for update',tbl) into before_row using key;
 if operation->>'op'='insert' then
  if before_row is not null then raise exception 'Guide already exists.' using errcode='22023'; end if;
  if tbl='interview_behavioral_themes' and not (fields?&array['title','color','sort']) or tbl='interview_behavioral_questions' and not (fields?&array['theme_id','prompt']) then raise exception 'Missing guide fields.' using errcode='22023'; end if;
  cols:='id'; vals:=case when tbl='interview_behavioral_themes' then '$2' else '$2::uuid' end;
  for col in select jsonb_object_keys(fields) loop
   cols:=cols||format(',%I',col);vals:=vals||format(',($1->>%L)',col)||case when col='sort' then '::integer' when col='published' then '::boolean' else '' end;
  end loop;
  execute format('insert into public.%I(%s) values (%s)',tbl,cols,vals) using fields,key;
 else
  if before_row is null then raise exception 'Guide no longer exists.' using errcode='22023'; end if;
  for col in select jsonb_object_keys(fields) loop
   assignments:=assignments||case when assignments='' then '' else ',' end||format('%I=($1->>%L)',col,col)||case when col='sort' then '::integer' when col='published' then '::boolean' else '' end;
  end loop;
  execute format('update public.%I set %s where id::text=$2',tbl,assignments) using fields,key;
 end if;
 return jsonb_build_object('table',tbl,'key',key,'values',before_row);
end $$;
revoke all on function private.apply_playbook_draft(jsonb) from public,anon,authenticated,service_role;

create or replace function private.apply_content_change() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  operation jsonb;
  field_name text;
  section_key text;
  old_values jsonb;
  history jsonb := '[]'::jsonb;
  field_count integer;
begin
  if TG_OP = 'INSERT' then
    if NEW.status <> 'draft' or NEW.previous is not null or NEW.approved_at is not null or NEW.approved_by is not null then
      raise exception 'New change sets must be drafts without approval metadata.' using errcode = '22023';
    end if;
    return NEW;
  end if;
  if auth.uid() is null or not rls.is_owner() then
    raise exception 'Only the owner can review content drafts.' using errcode = '42501';
  end if;
  if OLD.status <> 'draft' then
    raise exception 'This change set has already been reviewed.' using errcode = '22023';
  end if;
  if NEW.id is distinct from OLD.id or NEW.created_at is distinct from OLD.created_at then
    raise exception 'Change set identity and creation time cannot be edited.' using errcode = '22023';
  end if;
  if NEW.previous is not null or NEW.approved_at is not null or NEW.approved_by is not null then
    raise exception 'Approval metadata is filled only by the approval engine.' using errcode = '22023';
  end if;
  if NEW.status = 'draft' then return NEW; end if;
  if NEW.operations is distinct from OLD.operations or NEW.summary is distinct from OLD.summary or NEW.photo_slots is distinct from OLD.photo_slots then
    raise exception 'Save draft edits before reviewing the set.' using errcode = '22023';
  end if;
  -- Discard changes only status; malformed proposals can still be discarded safely.
  if NEW.status = 'discarded' then return NEW; end if;
  if jsonb_array_length(NEW.operations)>100 or (jsonb_array_length(NEW.operations)=0 and NEW.photo_slots='[]'::jsonb) then
    raise exception 'A change set must contain between 1 and 100 operations.' using errcode = '22023';
  end if;
  for operation in select value from jsonb_array_elements(NEW.operations) loop
    if jsonb_typeof(operation) is distinct from 'object' then
      raise exception 'Each operation must be an object.' using errcode = '22023';
    end if;
    if operation->>'table' in ('interview_behavioral_themes','interview_behavioral_questions') then
      history:=history||jsonb_build_array(private.apply_playbook_draft(operation));
      continue;
    end if;
    if operation->>'table'='resume_templates' then
      history:=history||jsonb_build_array(private.apply_resume_template_draft(operation));
      continue;
    end if;
    if operation->>'table' in ('notes','question_notes','practice_code','practice_stars','behavioral_stories','behavioral_answers') then
      history := history || jsonb_build_array(private.apply_app_draft(operation));
      continue;
    end if;
    if operation->>'table' in ('projects','articles','guides') then
      history := history || jsonb_build_array(private.apply_publishing_draft(operation));
      continue;
    end if;
    if operation->>'table' in ('experience_items','experience_bullets') then
      history := history || jsonb_build_array(private.apply_experience_draft(operation));
      continue;
    end if;
    if (operation - array['op', 'table', 'key', 'fields']::text[]) <> '{}'::jsonb
       or operation->>'table' is distinct from 'site_sections' then
      raise exception 'Unknown table or operation property.' using errcode = '22023';
    end if;
    if operation->>'op' is distinct from 'update' then
      raise exception 'Only update operations are supported for site_sections.' using errcode = '22023';
    end if;
    section_key := operation->>'key';
    if jsonb_typeof(operation->'key') is distinct from 'string' or section_key not in ('hero','now','about','interests','technology','writing','contact') then
      raise exception 'Unknown section key.' using errcode = '22023';
    end if;
    if jsonb_typeof(operation->'fields') is distinct from 'object' then
      raise exception 'Operation fields must be an object.' using errcode = '22023';
    end if;
    field_count := 0;
    for field_name in select jsonb_object_keys(operation->'fields') loop
      field_count := field_count + 1;
      if field_name not in ('title','body') then
        raise exception 'Unknown editable field: %.', field_name using errcode = '22023';
      end if;
      if jsonb_typeof(operation->'fields'->field_name) is distinct from 'string' then
        raise exception 'Field % must be text.', field_name using errcode = '22023';
      end if;
      if char_length(operation->'fields'->>field_name) > (case when field_name = 'title' then 120 else 20000 end) then
        raise exception 'Field % is too long.', field_name using errcode = '22023';
      end if;
      -- Postgres JSON rejects NUL before storage; TS validation does the same.
    end loop;
    if field_count = 0 then
      raise exception 'Each update needs at least one editable field.' using errcode = '22023';
    end if;
    select jsonb_build_object('key', s.key, 'title', s.title, 'body', s.body)
      into old_values from public.site_sections s where s.key = section_key for update;
    if not found then
      raise exception 'Section % no longer exists.', section_key using errcode = '22023';
    end if;
    history := history || jsonb_build_array(jsonb_build_object('table', 'site_sections', 'key', section_key, 'values', old_values));
    update public.site_sections set
      title = case when operation->'fields' ? 'title' then operation->'fields'->>'title' else title end,
      body = case when operation->'fields' ? 'body' then operation->'fields'->>'body' else body end
      where key = section_key;
  end loop;
  if NEW.photo_slots <> '[]'::jsonb then history:=history||private.apply_draft_photos(NEW.id,NEW.photo_slots); end if;
  NEW.previous := history;
  NEW.approved_at := clock_timestamp();
  NEW.approved_by := auth.uid();
  return NEW;
end;
$$;
revoke all on function private.apply_content_change() from public, anon, authenticated, service_role;

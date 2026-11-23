-- Q1: SQL practice. Submit snapshots for SQL questions are stored as language 'SQL'. The question number is the
-- LeetCode number (SQL numbers do not collide with the DSA ones); every other table already accepts 1..10000 or more.
-- Existing 'Python' rows and all other checks are unchanged. Not applied until Jamie says "apply it".
alter table public.practice_submissions drop constraint practice_submissions_language_check;
alter table public.practice_submissions add constraint practice_submissions_language_check check (language in ('Python','SQL'));
comment on table public.practice_submissions is 'Private immutable Submit snapshots (Python or SQL); own-user access, no owner bypass. Existing attempts still determine completion.';

-- TKT-123: shared Inbox/guard for contact messages and anonymous Problem/Idea feedback.
-- Defaults preserve existing contact rows. No changes to the existing hourly limiter or RLS.
alter table public.messages add column kind text not null default 'contact' check(kind in ('contact','problem','idea'));
alter table public.messages add column page_path text;
alter table public.messages alter column name drop not null;
alter table public.messages alter column email drop not null;
alter table public.messages add constraint messages_submission_shape check (
 (kind='contact' and name is not null and email is not null and page_path is null)
 or (kind in ('problem','idea') and name is null and email is null and budget='')
);
alter table public.messages add constraint messages_local_page check (
 page_path is null or (
  char_length(page_path)<=2000 and page_path ~ '^/([^/].*)?$'
  and strpos(page_path,chr(92))=0 and strpos(page_path,'?')=0
  and page_path !~ '[[:cntrl:][:space:]]'
  and lower(page_path) !~ '%(0[0-9a-f]|1[0-9a-f]|7f|5c|2f)'
 )
);
grant insert(kind,page_path) on public.messages to anon,authenticated;

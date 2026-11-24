-- Q4: SQL notes. (1) private.valid_draft_problem also accepts the 50 SQL LeetCode numbers, so approved interview
-- experiences can link them as question prep links (the same function guards question notes, practice code, flags and
-- company questions; the application still limits those to its own catalogue). They never collide with the DSA numbers.
-- (2) Create the three empty SQL notes so Content Drafts can fill them: the notes operation is update-only, so a row
-- must exist first. Note ids already satisfy the key check ^[a-z0-9][a-z0-9-]{0,79}$; no note text is written here.
-- Not applied until Jamie says "apply it".
create or replace function private.valid_draft_problem(value integer) returns boolean
language sql immutable set search_path='' as $$ select coalesce(value=any(array[1,2,3,4,5,10,11,15,17,19,20,21,22,23,25,32,33,36,39,40,42,43,45,46,48,49,50,51,53,54,55,56,57,62,66,70,72,73,74,76,78,79,84,90,91,97,98,100,102,104,105,110,115,121,124,125,127,128,130,131,133,134,138,139,141,143,146,150,152,153,155,167,176,180,185,196,197,198,199,200,202,206,207,208,210,211,212,213,215,217,226,230,235,238,239,242,252,253,261,269,271,286,287,295,297,300,309,312,322,323,329,332,347,355,416,417,424,435,494,518,543,550,567,570,572,577,584,585,595,596,602,610,619,620,621,626,647,678,684,695,703,704,739,743,746,763,773,778,787,846,853,875,973,981,994,1045,1046,1068,1070,1075,1141,1143,1148,1164,1174,1193,1204,1211,1251,1280,1321,1327,1341,1378,1448,1484,1517,1527,1581,1584,1633,1661,1667,1683,1729,1731,1757,1789,1851,1899,1907,1934,1978,2013,2356]::integer[]),false) $$;
revoke all on function private.valid_draft_problem(integer) from public,anon,authenticated,service_role;

insert into public.notes(id,title,body,sort) values
 ('sql-basics','SQL basics','',9001),
 ('sql-tackling','Tackling SQL questions','',9002),
 ('sql-postgres-mysql','Postgres vs MySQL','',9003)
on conflict (id) do nothing;

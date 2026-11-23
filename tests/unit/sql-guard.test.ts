import {it,expect} from 'vitest';
import {guardQuery,MAX_QUERY_LENGTH} from '@/lib/practice/sql-guard';
const rejected=(sql:string)=>{const r=guardQuery(sql);return r.ok?'':r.message;};
it('accepts one SELECT or WITH statement, with or without a trailing semicolon, comments and parentheses',()=>{
 for(const sql of ['select 1','SELECT 1;',' \n with x as (select 1) select * from x ;','-- note\nselect 1','/* a */ select 1','(select 1) union (select 2)','select 1;  -- trailing comment','select 1; /* done */'])expect(guardQuery(sql).ok,sql).toBe(true);
 expect(guardQuery('SELECT 1;')).toEqual({ok:true,sql:'SELECT 1'});
});
it('rejects multiple statements but ignores semicolons inside strings, identifiers, dollar quotes and comments',()=>{
 for(const sql of ['select 1; select 2','select 1;select 2;','select 1; drop table x','select 1;;select 2'])expect(rejected(sql),sql).toMatch(/Only one statement/);
 for(const sql of ["select 'a;b'","select \"a;b\" from (select 1 as \"a;b\") t","select $$a;b$$","select $q$a;b$q$","select 1 -- a;b\n","select 1 /* a; b /* nested; */ ; */","select E'it\\'s;fine'","select 'it''s;fine'"])expect(guardQuery(sql).ok,sql).toBe(true);
});
it('rejects anything that is not SELECT or WITH, and blank input',()=>{
 for(const sql of ['drop table x','insert into t values (1)','update t set a=1','delete from t','create table t(a int)','truncate t','alter table t add b int','set search_path to x','show all','explain select 1','values (1)','call p()','-- only a comment','   ',''])expect(rejected(sql),sql).not.toBe('');
 expect(rejected('')).toBe('Write a query first.');expect(rejected('drop table x')).toMatch(/Only SELECT/);
 expect(rejected('x'.repeat(MAX_QUERY_LENGTH+1))).toMatch(/under 20,000/);
});

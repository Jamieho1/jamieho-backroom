import {it,expect,beforeAll,afterAll,describe} from 'vitest';
import {PGlite} from '@electric-sql/pglite';
import {SQL_PROBLEMS,SQL_LIST,sqlProblemByNumber} from '@/lib/practice/sql-catalog';
import {SQL_TOPICS,SqlProblemSchema,SqlCatalogueSchema,type SqlProblem} from '@/lib/practice/sql-types';
import {runSqlTest,type SqlDbLike} from '@/lib/practice/sql-engine';
import {compareResults} from '@/lib/practice/sql-compare';
import {PRACTICE_ANCHORS} from '@/lib/notes/neetcode150';
import * as seeds from '@/lib/practice/problems/sql-select';

let db:PGlite;
beforeAll(async()=>{db=new PGlite();await db.waitReady;});afterAll(async()=>db.close());
/** Runs every test of a problem against a query with the same engine and comparison the browser uses. */
async function verdicts(problem:SqlProblem,query:string){
 const out:{name:string;pass:boolean;why:string}[]=[];
 for(const test of problem.tests){
  const r=await runSqlTest(db as unknown as SqlDbLike,{setup:test.setup,query});
  if(!r.ok){out.push({name:test.name,pass:false,why:r.message});continue;}
  const c=compareResults(test.expected,r,test.ordered);out.push({name:test.name,pass:c.pass,why:c.summary});
 }
 return out;
}
// A deliberately wrong query per question; each must fail at least one test (mutation check).
const WRONG:Record<number,string[]>={
 1757:[`SELECT item_id FROM catalogue_items WHERE fat_level = 'LOW' OR eco_packaging IS TRUE`,`SELECT item_id FROM catalogue_items WHERE fat_level = 'LOW' AND eco_packaging IS NOT FALSE`,`SELECT item_id FROM catalogue_items WHERE fat_level = 'LOW'`],
 1378:[`SELECT s.full_name, b.badge_code FROM staff s JOIN badge_codes b ON b.staff_id = s.staff_id`,`SELECT s.full_name, b.badge_code FROM staff s RIGHT JOIN badge_codes b ON b.staff_id = s.staff_id`,`SELECT DISTINCT s.full_name, b.badge_code FROM staff s LEFT JOIN badge_codes b ON b.staff_id = s.staff_id`,`SELECT b.badge_code, s.full_name FROM staff s LEFT JOIN badge_codes b ON b.staff_id = s.staff_id`],
 620:[`SELECT film_id, title, genre, audience_score FROM film_catalog WHERE film_id % 2 = 1 AND genre <> 'Documentary' ORDER BY audience_score DESC, film_id`,`SELECT film_id, title, genre, audience_score FROM film_catalog WHERE film_id % 2 = 1 AND genre IS DISTINCT FROM 'Documentary' ORDER BY film_id`,`SELECT film_id, title, genre, audience_score FROM film_catalog WHERE film_id % 2 = 0 AND genre IS DISTINCT FROM 'Documentary' ORDER BY audience_score DESC, film_id`,`SELECT film_id, title, genre, audience_score FROM film_catalog WHERE film_id % 2 = 1 AND genre IS DISTINCT FROM 'Documentary' ORDER BY audience_score DESC, film_id DESC`],
};
describe('SQL catalogue',()=>{
 it('seeds exactly the three Q1 problems in plan order, one topic each',()=>{
  expect(SQL_PROBLEMS.map(p=>[p.lc,p.topic])).toEqual([[1757,'sql-select'],[1378,'sql-basic-joins'],[620,'sql-basic-aggregate']]);
  expect(SQL_TOPICS.map(t=>t.label)).toEqual(['Select','Basic Joins','Basic Aggregate Functions','Sorting and Grouping','Advanced Select and Joins','Subqueries','Advanced String Functions / Regex / Clause']);
  expect(seeds.sql[0].lc).toBe(1757);
 });
 it('SQL numbers never collide with DSA practice numbers',()=>{const dsa=new Set(PRACTICE_ANCHORS.map(p=>p.lc));for(const p of SQL_LIST)expect(dsa.has(p.lc),String(p.lc)).toBe(false);});
 it.each(SQL_PROBLEMS.map(p=>[p.lc,p] as const))('%i validates against the strict schema and mirrors its examples in tests',(_lc,problem)=>{
  expect(SqlProblemSchema.safeParse(problem).success).toBe(true);
  expect(problem.tests.length).toBeGreaterThanOrEqual(4);
  expect(problem.approaches.filter(a=>a.optimal)).toHaveLength(1);expect(problem.approaches.length).toBeGreaterThanOrEqual(2);
  expect(problem.examples.some(e=>problem.tests.some(t=>JSON.stringify(t.expected.rows)===JSON.stringify(e.result.rows)&&JSON.stringify(t.expected.columns)===JSON.stringify(e.result.columns)))).toBe(true);
  expect(problem.tests.some(t=>t.expected.rows.some(r=>r.includes(null)))||problem.tests.some(t=>/NULL/.test(t.setup))).toBe(true);
  expect(problem.tests.some(t=>t.expected.rows.length===0)).toBe(true);
 });
 it('the strict schema rejects unknown keys, bad rows, duplicate numbers, a missing optimal approach and unsafe solutions',()=>{
  const base=SQL_PROBLEMS[0];const bad=(patch:object)=>SqlProblemSchema.safeParse({...base,...patch}).success;
  expect(bad({extra:1})).toBe(false);expect(bad({kind:'python'})).toBe(false);expect(bad({topic:'arrays-hashing'})).toBe(false);
  expect(bad({tests:[{...base.tests[0],expected:{columns:['item_id'],rows:[[1,2]]}}]})).toBe(false);
  expect(bad({approaches:base.approaches.map(a=>({...a,optimal:true}))})).toBe(false);expect(bad({approaches:base.approaches.slice(0,1)})).toBe(false);
  expect(bad({solution:'DELETE FROM catalogue_items'})).toBe(false);expect(bad({solution:'SELECT 1; SELECT 2'})).toBe(false);
  expect(bad({tests:[{...base.tests[0],ordered:'yes'}]})).toBe(false);expect(bad({tables:[]})).toBe(false);expect(bad({difficulty:'Trivial'})).toBe(false);
  expect(SqlCatalogueSchema.safeParse([base,base]).success).toBe(false);
 });
});
describe.each(SQL_PROBLEMS.map(p=>[p.lc,p] as const))('SQL %i in PGlite',(lc,problem)=>{
 it('its solution and every approach pass every test',async()=>{
  for(const [label,code] of [['solution',problem.solution],...problem.approaches.map(a=>[a.id,a.code] as const)]){
   const out=await verdicts(problem,code);
   expect(out.filter(o=>!o.pass),`${lc} ${label}: ${JSON.stringify(out.filter(o=>!o.pass))}`).toEqual([]);
  }
 });
 it('deliberately wrong queries fail at least one test (mutation check)',async()=>{
  expect(WRONG[lc]?.length).toBeGreaterThan(0);
  for(const query of WRONG[lc]){const out=await verdicts(problem,query);expect(out.some(o=>!o.pass),`${lc} unexpectedly passes: ${query}`).toBe(true);}
 });
 it('a query that is not a single SELECT fails every test with an error, not a crash',async()=>{
  const out=await verdicts(problem,'SELECT 1; DROP TABLE x');expect(out.every(o=>!o.pass)).toBe(true);
 });
});
it('lookup helpers return the catalogue entries',()=>{expect(sqlProblemByNumber(1757)?.title).toBe('Recyclable and Low Fat Products');expect(sqlProblemByNumber(217)).toBeUndefined();});

import {it,expect,beforeAll,afterAll} from 'vitest';
import {PGlite} from '@electric-sql/pglite';
import {runSqlTest,toCell,ROW_CAP,type SqlDbLike} from '@/lib/practice/sql-engine';
let db:PGlite;const live=()=>db as unknown as SqlDbLike;
const setup='CREATE TABLE t (id integer PRIMARY KEY, n numeric(5,2), d date, ts timestamp, b boolean, s text); INSERT INTO t VALUES (1, 2.50, DATE \'2024-01-05\', TIMESTAMP \'2024-01-05 10:30:00\', true, \'x\'), (2, NULL, NULL, NULL, NULL, NULL);';
beforeAll(async()=>{db=new PGlite();await db.waitReady;});afterAll(async()=>db.close());
it('returns JSON-friendly cells: numbers, ISO dates, booleans and NULL',async()=>{
 const r=await runSqlTest(live(),{setup,query:'SELECT id, n, d, ts, b, s, id::bigint AS big, count(*) AS c FROM t GROUP BY id,n,d,ts,b,s ORDER BY id'});
 expect(r).toEqual({ok:true,columns:['id','n','d','ts','b','s','big','c'],rows:[[1,2.5,'2024-01-05','2024-01-05T10:30:00.000Z',true,'x',1,1],[2,null,null,null,null,null,2,1]]});
 expect(toCell(BigInt('9007199254740993'),20)).toBe('9007199254740993');
});
it('rejects multiple statements and non-SELECT statements before touching the database',async()=>{
 for(const query of ['SELECT 1; SELECT 2','DROP TABLE t','INSERT INTO t(id) VALUES (3)','CREATE TABLE z(a int)',''])expect(await runSqlTest(live(),{setup,query})).toMatchObject({ok:false,kind:'rejected'});
 const check=await runSqlTest(live(),{setup,query:'SELECT count(*) FROM t'});expect(check).toMatchObject({ok:true,rows:[[2]]});
});
it('runs the query in a READ ONLY transaction, so a data-modifying CTE fails with Postgres\' own message',async()=>{
 const r=await runSqlTest(live(),{setup,query:'WITH gone AS (DELETE FROM t RETURNING id) SELECT id FROM gone'});
 expect(r).toMatchObject({ok:false,kind:'error'});expect(r.ok?'':r.message).toMatch(/in a read-only transaction$/);
 expect(await runSqlTest(live(),{setup,query:'SELECT count(*) FROM t'})).toMatchObject({ok:true,rows:[[2]]});
});
it('reports Postgres errors verbatim with their code and position, and recovers for the next test',async()=>{
 const r=await runSqlTest(live(),{setup,query:'SELECT nope FROM t'});
 expect(r).toMatchObject({ok:false,kind:'error',message:'column "nope" does not exist',code:'42703'});
 expect(await runSqlTest(live(),{setup,query:'SELECT * FORM t'})).toMatchObject({ok:false,kind:'error',message:'syntax error at or near "FORM"'});
 expect(await runSqlTest(live(),{setup,query:'SELECT 1 AS ok'})).toMatchObject({ok:true,rows:[[1]]});
});
it('gives every test a fresh schema and flags a broken setup separately',async()=>{
 await runSqlTest(live(),{setup,query:'SELECT 1'});
 expect(await runSqlTest(live(),{setup:'CREATE TABLE other(a int);',query:'SELECT * FROM t'})).toMatchObject({ok:false,kind:'error',message:'relation "t" does not exist'});
 expect(await runSqlTest(live(),{setup:'CREATE TABLE broken(',query:'SELECT 1'})).toMatchObject({ok:false,kind:'setup'});
});
it('caps the number of returned rows',async()=>{
 const r=await runSqlTest(live(),{setup:'',query:`SELECT g FROM generate_series(1,${ROW_CAP+1}) AS g`});
 expect(r).toMatchObject({ok:false,kind:'cap'});expect(r.ok?'':r.message).toContain('1,000 rows');
 expect(await runSqlTest(live(),{setup:'',query:`SELECT g FROM generate_series(1,${ROW_CAP}) AS g`})).toMatchObject({ok:true});
 expect(await runSqlTest(live(),{setup:'',query:'SELECT g FROM generate_series(1,50) AS g',rowCap:10})).toMatchObject({ok:false,kind:'cap'});
});

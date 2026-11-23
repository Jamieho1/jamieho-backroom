import {it,expect} from 'vitest';
import {compareResults,normaliseCell} from '@/lib/practice/sql-compare';
const grid=(columns:string[],rows:any[][])=>({columns,rows});
it('normalises numbers to four decimals and keeps NULL distinct from text',()=>{
 expect(normaliseCell(2.5)).toBe(normaliseCell(2.50004));expect(normaliseCell(2.5)).not.toBe(normaliseCell(2.5001));
 expect(normaliseCell(1)).toBe(normaliseCell(1.0));expect(normaliseCell(-0)).toBe(normaliseCell(0));expect(normaliseCell(BigInt(7))).toBe('n:7');
 expect(normaliseCell(null)).not.toBe(normaliseCell('NULL'));expect(normaliseCell(null)).toBe(normaliseCell(undefined));
 expect(normaliseCell('5')).not.toBe(normaliseCell(5));expect(normaliseCell(true)).not.toBe(normaliseCell('true'));
 expect(normaliseCell('2024-01-05 10:00:00')).toBe(normaliseCell('2024-01-05T10:00:00.000Z'));expect(normaliseCell(new Date('2024-01-05T10:00:00Z'))).toBe(normaliseCell('2024-01-05T10:00:00Z'));
 expect(normaliseCell('2024-01-05')).toBe('s:2024-01-05');
});
it('unordered results match as a multiset, including duplicates',()=>{
 const expected=grid(['a','b'],[[1,'x'],[2,'y'],[2,'y']]);
 expect(compareResults(expected,grid(['a','b'],[[2,'y'],[1,'x'],[2,'y']]),false).pass).toBe(true);
 const dup=compareResults(expected,grid(['a','b'],[[1,'x'],[2,'y']]),false);expect(dup.pass).toBe(false);expect(dup.expected.rows.map(r=>r.ok)).toEqual([true,true,false]);expect(dup.summary).toMatch(/1 expected row is missing and 0 returned rows are unexpected/);
 const extra=compareResults(expected,grid(['a','b'],[[1,'x'],[2,'y'],[2,'y'],[3,'z']]),false);expect(extra.pass).toBe(false);expect(extra.actual.rows.map(r=>r.ok)).toEqual([true,true,true,false]);
 expect(compareResults(grid(['a'],[]),grid(['a'],[]),false).pass).toBe(true);expect(compareResults(grid(['a'],[]),grid(['a'],[[1]]),false).pass).toBe(false);
});
it('ordered results must match position by position',()=>{
 const expected=grid(['id'],[[3],[1],[2]]);
 expect(compareResults(expected,grid(['id'],[[3],[1],[2]]),true).pass).toBe(true);
 const swapped=compareResults(expected,grid(['id'],[[1],[3],[2]]),true);expect(swapped.pass).toBe(false);expect(swapped.expected.rows.map(r=>r.ok)).toEqual([false,false,true]);expect(swapped.summary).toMatch(/not in the required order/);
 expect(compareResults(expected,grid(['id'],[[1],[3],[2]]),false).pass).toBe(true);
 expect(compareResults(expected,grid(['id'],[[3],[1]]),true).pass).toBe(false);
});
it('NULLs compare equal to NULL only, and numeric strings never equal numbers',()=>{
 expect(compareResults(grid(['a'],[[null],[1]]),grid(['a'],[[1],[null]]),false).pass).toBe(true);
 expect(compareResults(grid(['a'],[[null]]),grid(['a'],[['NULL']]),false).pass).toBe(false);
 expect(compareResults(grid(['a'],[[5]]),grid(['a'],[['5']]),false).pass).toBe(false);
 expect(compareResults(grid(['avg'],[[2.3333]]),grid(['avg'],[[2.33333333]]),false).pass).toBe(true);
 expect(compareResults(grid(['avg'],[[2.33]]),grid(['avg'],[[2.3333]]),false).pass).toBe(false);
});
it('columns must match in count, order and (case-insensitive) name',()=>{
 const expected=grid(['full_name','badge_code'],[['A',null]]);
 expect(compareResults(expected,grid(['FULL_NAME','Badge_Code'],[['A',null]]),false).pass).toBe(true);
 const fewer=compareResults(expected,grid(['full_name'],[['A']]),false);expect(fewer.pass).toBe(false);expect(fewer.columnsOk).toBe(false);expect(fewer.summary).toMatch(/Expected 2 columns but your query returned 1/);
 const reordered=compareResults(expected,grid(['badge_code','full_name'],[[null,'A']]),false);expect(reordered.pass).toBe(false);expect(reordered.summary).toMatch(/names or their order/);
 expect(reordered.expected.rows.every(r=>!r.ok)).toBe(true);
});

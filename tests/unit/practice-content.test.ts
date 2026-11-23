import {it,expect} from 'vitest';
import {execFileSync} from 'node:child_process';
import {PROBLEMS,problemByNumber} from '@/lib/practice/catalog';
import {ArenaProblemSchema} from '@/lib/practice/types';
import {expectedComplexity} from '@/lib/practice/submissions';
import {relatedQuestions} from '@/lib/interview/practice-navigation';
for(const problem of PROBLEMS){
 it(`${problem.lc}: validates complete authored content and all approaches pass visible examples`,()=>{
  expect(ArenaProblemSchema.safeParse(problem).success).toBe(true);
  const tests=problem.tests.filter(t=>t.visible).map(t=>({...t,kind:'functional'}));
  const script=`import sys,json;sys.path.insert(0,'public/runner');import harness;d=json.load(sys.stdin);print(harness.run_tests(d['code'],d['method'],json.dumps(d['tests']),json.dumps(d['extra'])))`;
  for(const approach of problem.approaches){const value={code:approach.code,method:problem.method,tests,extra:{prelude:problem.prelude,driver:problem.driver}};const raw=execFileSync('python3',['-c',script],{input:JSON.stringify(value),timeout:10000}).toString().trim().split('\n').at(-1)!;const out=JSON.parse(raw);expect(out.compile_error,approach.title).toBeNull();for(const row of out.results)expect(row.status,`${approach.title} ${row.id}: ${row.error??row.got}, expected ${row.expected}`).toBe('pass');}
 });
}
it('rejects missing follow-ups, empty/invalid approaches and ambiguous optimal choices',()=>{const p=problemByNumber(217)!;for(const patch of [{followUps:[]},{followUps:['tiny']},{approaches:[]},{approaches:[p.approaches[0]]},{approaches:p.approaches.map(a=>({...a,optimal:true}))},{approaches:p.approaches.map(a=>({...a,code:''}))},{approaches:[p.approaches[0],p.approaches[0]]}])expect(ArenaProblemSchema.safeParse({...p,...patch}).success).toBe(false);});
it('expected complexity is the explicitly marked optimum, including improved-space and LIS approaches',()=>{for(const p of PROBLEMS){const optimal=p.approaches.find(a=>a.optimal)!;expect(expectedComplexity(p.lc)).toBe(`${optimal.time} · ${optimal.space}`);}expect(expectedComplexity(300)).toContain('O(n log n)');expect(expectedComplexity(238)).toContain('O(1) auxiliary');});
it('related questions exclude self and duplicates, prefer shared concepts across section boundaries',()=>{for(const p of PROBLEMS){const rows=relatedQuestions(p.lc);expect(rows.length).toBeLessThanOrEqual(5);expect(rows.some(r=>r.lc===p.lc)).toBe(false);expect(new Set(rows.map(r=>r.lc)).size).toBe(rows.length);expect(rows.every(r=>r.lc!==p.lc)).toBe(true);}expect(relatedQuestions(217)[0].lc).toBe(146);});

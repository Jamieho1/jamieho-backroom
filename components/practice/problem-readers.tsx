'use client';
import {problemByNumber} from '@/lib/practice/catalog';
import {extraOf,solutionOf} from '@/lib/practice/solutions';
import {Visual} from '@/lib/notes/visual';
import {Markdown} from '@/components/notes/markdown';
import {CodeBlock} from '@/components/notes/code-highlight';
import {TraceVisual} from '@/components/notes/trace-visual';
import type {RunOutcome,RunMode} from '@/lib/practice/runner';
export function ProblemSolution({lc}:{lc:number}) {
 const problem=problemByNumber(lc)!;const solution=solutionOf(lc);const extra=extraOf(lc);
 const parsed=solution?Visual.safeParse(solution.visual):null;
 return <div className="practice-solution">
  {solution?<><h3>Intuition</h3><Markdown text={solution.intuition} /><h3>Algorithm</h3><Markdown text={solution.algorithm} /></>:null}
  {parsed?.success?<TraceVisual visual={parsed.data} />:null}
  <h3>Reference code</h3><CodeBlock code={problem.solution} />
  <h3>Complexity</h3>{extra?<dl><dt>Time: {extra.time.o}</dt><dd><Markdown text={extra.time.why} /></dd><dt>Space: {extra.space.o}</dt><dd><Markdown text={extra.space.why} /></dd></dl>:<p>{solution?.complexity}</p>}
  {extra?<><h3>Common pitfalls</h3><ul>{extra.pitfalls.map(p=><li key={p}><Markdown text={p} /></li>)}</ul></>:null}
 </div>;
}
export function Results({result,mode}:{result:RunOutcome;mode:RunMode}) {
 return <section className="practice-results" aria-label="Test results" aria-live="polite">
  <h3>{mode==="run"?"Run":"Submit"} results</h3>
  {result.status==="ok"?<>
   <p>{result.passed} / {result.total} passed</p>
   <ul>{result.results.map((r,i)=><li key={r.id}><strong>{r.visible?r.id:`Additional test ${i+1}`}: {r.status}</strong>{r.visible?<pre>{r.error??`Got: ${r.got}\nExpected: ${r.expected}`}</pre>:null}</li>)}</ul>
   {result.stdout?<details open><summary>Output</summary><pre>{result.stdout}</pre></details>:null}
  </>:result.status==="timeout"?<p>The run exceeded {result.afterMs/1000} seconds and was stopped. Check for an infinite loop.</p>:<pre>{result.error}</pre>}
 </section>;
}

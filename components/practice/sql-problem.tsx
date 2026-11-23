import {Markdown} from '@/components/notes/markdown';
import {CodeBlock} from '@/components/notes/code-highlight';
import {TableSchemaCard} from '@/components/interview/table-schema-card';
import type {SqlProblem} from '@/lib/practice/sql-types';
import {SqlGrid} from './sql-grid';

/** Problem tab: statement, table definitions (the S1 schema card), worked examples as small grids, hints and follow-ups. */
export function SqlProblemView({problem}:{problem:SqlProblem}){
 return <>
  <Markdown text={problem.statement}/>
  <section aria-label="Tables"><h3>Tables</h3>{problem.tables.map(t=><TableSchemaCard key={t.name} schema={{table:t.name,note:t.note,columns:t.columns}}/>)}</section>
  <h3>Examples</h3>
  {problem.examples.map((example,i)=><section className="practice-example practice-example-lined sql-example" key={i} aria-label={`Example ${i+1}`}>
   <h4>Example {i+1}</h4>
   {example.tables.map(t=><SqlGrid key={t.name} caption={`Input · ${t.name}`} columns={t.columns} rows={t.rows.map(cells=>({cells}))}/>)}
   <SqlGrid caption="Output" columns={example.result.columns} rows={example.result.rows.map(cells=>({cells}))}/>
   {example.explanation?<p>{example.explanation}</p>:null}
  </section>)}
  {problem.hints.length?<details><summary>Hints</summary>{problem.hints.map((h,i)=><p key={i}>{h}</p>)}</details>:null}
  {problem.clarify.length?<details><summary>Clarifying questions</summary>{problem.clarify.map((c,i)=><p key={i}><strong>{c.question}</strong><br/>{c.answer}</p>)}</details>:null}
  <section className="practice-follow-ups" aria-label="Follow-up"><h3>Follow-up</h3><ul>{problem.followUps.map(q=><li key={q}>{q}</li>)}</ul></section>
 </>;
}

/** Solution tab: the Postgres reference answer, every approach (one marked optimal, with why) and the MySQL difference. */
export function SqlSolutionView({problem}:{problem:SqlProblem}){
 return <div className="practice-solution">
  <section className="practice-approaches" aria-label="Solution approaches"><h3>Approaches</h3>
   {problem.approaches.map((a,i)=><details className="practice-approach" data-optimal={a.optimal} key={a.id} open={a.optimal}><summary><strong>{i+1}. {a.title}</strong>{a.optimal?<span className="practice-tag">Optimal approach</span>:null}</summary><Markdown text={a.explanation}/><CodeBlock code={a.code} lang="sql"/></details>)}
  </section>
  <h3>Reference solution (Postgres)</h3><CodeBlock code={problem.solution} lang="sql"/>
  {problem.mysqlNote?<section aria-label="MySQL difference"><h3>On MySQL</h3><Markdown text={problem.mysqlNote}/></section>:null}
 </div>;
}

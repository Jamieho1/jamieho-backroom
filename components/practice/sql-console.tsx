'use client';
import {useEffect,useState} from 'react';
import type {SqlProblem} from '@/lib/practice/sql-types';
import type {SqlRunResult} from '@/lib/practice/sql-runner';
import type {RunMode} from '@/lib/practice/runner';
import {SqlGrid} from './sql-grid';
/** Test data and output for SQL practice: expected vs your result as grids, mismatched rows highlighted, Postgres errors verbatim. */
export function SqlConsole({problem,result,mode,busy,loading}:{problem:SqlProblem;result:SqlRunResult|null;mode:RunMode;busy:boolean;loading:boolean}){
 const [tab,setTab]=useState('Test Data'),[selected,setSelected]=useState(0),[output,setOutput]=useState(0);
 const outcome=result?.outcome;const results=outcome&&'results'in outcome?outcome.results??[]:[];
 useEffect(()=>{if(result||busy){setTab('Output');setOutput(result&&mode==='submit'?Math.max(0,results.findIndex(c=>c.status!=='pass')):0);}},[result,busy,mode]);// eslint-disable-line react-hooks/exhaustive-deps
 const index=Math.min(selected,problem.tests.length-1),current=problem.tests[index];
 let heading='';
 if(outcome){
  if(outcome.status==='timeout')heading='Time limit exceeded';
  else if(outcome.status!=='ok'||outcome.results.some(r=>r.status==='error'))heading='Runtime error';
  else if(mode==='submit')heading=outcome.total>0&&outcome.passed===outcome.total?`Accepted ${outcome.passed}/${outcome.total}`:'Wrong answer — first failing case';
  else heading=`Run results · ${outcome.passed}/${outcome.total} passed`;
 }
 const detail=result?.details[output],item=results[output];
 return <div className="pw-tests sql-console">
  <div className="notes-tabs" role="tablist" aria-label="Console view">{['Test Data','Output'].map(name=><button key={name} role="tab" aria-selected={tab===name} aria-controls={`console-${name.replace(' ','-')}`} onClick={()=>setTab(name)}>{name}</button>)}</div>
  {tab==='Test Data'?<section role="tabpanel" id="console-Test-Data" aria-label="Test Data">
   <p className="muted small">Run uses the first case. Submit checks every case, each on a fresh database.</p>
   <div className="pw-case-tabs" role="tablist" aria-label="Test cases">{problem.tests.map((t,i)=><button key={t.name} role="tab" aria-selected={i===index} aria-controls="active-case-data" onClick={()=>setSelected(i)}>Case {i+1}</button>)}</div>
   <div id="active-case-data" role="tabpanel" aria-label={`Case ${index+1} data`}><h4>{current.name}</h4>
    <details><summary>Setup SQL</summary><pre>{current.setup}</pre></details>
    <SqlGrid caption={current.ordered?'Expected result (this exact order)':'Expected result (any row order)'} columns={current.expected.columns} rows={current.expected.rows.map(cells=>({cells}))}/></div>
  </section>:<section role="tabpanel" id="console-Output" aria-label="Output"><section className="practice-results pw-output" aria-label="Test results" aria-live="polite">
   {loading&&!busy&&!outcome?<p role="status">Loading PostgreSQL…</p>:busy?<p>Running…</p>:outcome?<>
    <h3 className={heading.startsWith('Accepted')?'pw-accepted':heading.includes('error')||heading.includes('Wrong')||heading.includes('exceeded')?'pw-failed':''}>{heading}</h3>{outcome.ms!==undefined?<p>Runtime: {outcome.ms.toFixed(2)} ms</p>:null}
    {outcome.status==='crash'?<pre className="pw-test-error" role="alert">{outcome.error}</pre>:null}
    <div className="pw-case-tabs" role="tablist" aria-label="Case results">{results.map((c,i)=><button key={c.id} role="tab" aria-selected={output===i} aria-controls="case-output" data-result={c.status} onClick={()=>setOutput(i)}>{c.status==='pass'?'✓':'✗'} Case {i+1}</button>)}</div>
    {item&&detail?<div id="case-output" role="tabpanel" aria-label={`Case ${output+1} result`}>
     <h4>{detail.name}{detail.ordered?<span className="practice-tag">Order matters</span>:null}</h4>
     {detail.failure?<><pre className="pw-test-error" role="alert">{detail.failure.message}</pre>{detail.failure.code||detail.failure.position?<small className="muted">{detail.failure.code?`SQLSTATE ${detail.failure.code}`:''}{detail.failure.code&&detail.failure.position?' · ':''}{detail.failure.position?`position ${detail.failure.position}`:''}</small>:null}</>:null}
     {detail.comparison?<><p className={detail.comparison.pass?'pw-accepted':'pw-failed'} role="status">{detail.comparison.summary}</p>
      <div className="sql-diff"><SqlGrid caption="Expected" columns={detail.comparison.expected.columns} rows={detail.comparison.expected.rows}/><SqlGrid caption="Your result" columns={detail.comparison.actual.columns} rows={detail.comparison.actual.rows}/></div></>:null}
    </div>:null}
   </>:<p>Run your query to see the result here.</p>}
  </section></section>}
 </div>;
}

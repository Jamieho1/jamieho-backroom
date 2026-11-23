'use client';
import {useEffect,useState} from 'react';
import {inputLabels,type EditableCase} from '@/lib/practice/cases';
import type {ArenaProblem} from '@/lib/practice/types';
import type {RunMode,RunOutcome} from '@/lib/practice/runner';
export function TestConsole({problem,cases,onChange,result,mode,busy,readOnly,status,validationError}:{problem:ArenaProblem;cases:EditableCase[];onChange(cases:EditableCase[]):void;result:RunOutcome|null;mode:RunMode;busy:boolean;readOnly:boolean;status:string;validationError:string}){
 const [tab,setTab]=useState('Test Cases'),[selected,setSelected]=useState(0),[output,setOutput]=useState(0),[more,setMore]=useState(false);
 const results=result&&'results'in result?result.results??[]:[];
 useEffect(()=>{if(result||busy||validationError){setTab('Output');setOutput(result&&mode==='submit'?Math.max(0,('results'in result?result.results??[]:[]).findIndex(c=>c.status!=='pass')):0);setMore(false);}},[result,busy,validationError,mode]);
 const labels=inputLabels(problem),index=Math.min(selected,cases.length-1),current=cases[index],item=results[output];
 let heading='';if(result){if(result.status==='timeout')heading='Time limit exceeded';else if(result.status!=='ok'||result.results.some(r=>r.status==='error'))heading='Runtime error';else if(mode==='submit')heading=result.total>0&&result.passed===result.total?`Accepted ${result.passed}/${result.total}`:'Wrong answer — first failing case';else heading=`Run results · ${result.passed}/${result.total} passed`;}
 const stdout=item?.stdout??(result?.status==='ok'?result.stdout:'')??'';
 return <div className="pw-tests">
  <div className="notes-tabs" role="tablist" aria-label="Console view">{['Test Cases','Output'].map(name=><button key={name} role="tab" aria-selected={tab===name} aria-controls={`console-${name.replace(' ','-')}`} onClick={()=>setTab(name)}>{name}</button>)}</div>
  {tab==='Test Cases'?<section role="tabpanel" id="console-Test-Cases" aria-label="Test Cases"><div className="pw-case-tabs" role="tablist" aria-label="Test cases">{cases.map((c,i)=><button key={c.id} role="tab" aria-selected={i===index} aria-controls="active-case-inputs" onClick={()=>setSelected(i)}>Case {i+1}</button>)}<button aria-label="Add custom case" disabled={readOnly||busy||cases.length>=20} onClick={()=>{if(!current)return;onChange([...cases,{id:'custom:'+crypto.randomUUID(),inputs:[...current.inputs]}]);setSelected(cases.length);}}>+</button></div>
   {current?<div id="active-case-inputs" role="tabpanel" aria-label={`Case ${index+1} inputs`}>{current.inputs.map((value,i)=><label className="pw-test-input" key={i}>{labels[i]??`Input ${i+1}`}<textarea rows={problem.kind==='class_design'?3:2} maxLength={10000} spellCheck={false} disabled={readOnly||busy} value={value} onChange={e=>onChange(cases.map(c=>c.id!==current.id?c:{...c,inputs:c.inputs.map((v,j)=>j===i?e.target.value:v)}))}/></label>)}{current.id.startsWith('custom:')?<button aria-label={`Remove Case ${index+1}`} disabled={readOnly||busy} onClick={()=>{onChange(cases.filter(c=>c.id!==current.id));setSelected(Math.max(0,index-1));}}>× Remove custom case</button>:null}</div>:null}<small className="pw-case-save" role="status">{readOnly?'Read-only cases':status}</small>
  </section>:<section role="tabpanel" id="console-Output" aria-label="Output"><section className="practice-results pw-output" aria-label="Test results" aria-live="polite">
   {validationError?<pre className="pw-test-error" role="alert">{validationError}</pre>:null}
   {busy?<p>Running…</p>:result?<><h3 className={heading.startsWith('Accepted')?'pw-accepted':heading.includes('error')||heading.includes('Wrong')||heading.includes('exceeded')?'pw-failed':''}>{heading}</h3>{result.ms!==undefined?<p>Runtime: {result.ms.toFixed(2)} ms</p>:null}
    <div className="pw-case-tabs" role="tablist" aria-label="Case results">{results.map((c,i)=><button key={c.id} role="tab" aria-selected={output===i} aria-controls="case-output" data-result={c.status} onClick={()=>{setOutput(i);setMore(false);}}>{c.status==='pass'?'✓':c.status==='unknown'?'?':'✗'} Case {i+1}</button>)}</div>
    {result.status==='compile_error'||result.status==='crash'?<pre className="pw-test-error" role="alert">{result.error}</pre>:null}
    {item?<div id="case-output" role="tabpanel" aria-label={`Case ${output+1} result`}><h4>Input</h4><pre>{item.input??'Input recorded by the runner'}</pre>{item.error?<pre className="pw-test-error" role="alert">{item.error}</pre>:null}<h4>Your output</h4><pre>{item.got??'No output'}</pre><h4>Expected output</h4><pre>{item.expected??'Not specified for this custom input'}</pre></div>:null}
    {stdout?<div><h4>Stdout</h4><pre>{more?stdout:stdout.slice(0,1200)}</pre>{stdout.length>1200?<button aria-expanded={more} onClick={()=>setMore(v=>!v)}>{more?'Show less':'Show more'}</button>:null}{stdout.length>=16000?<small>Print output capped at 16,000 characters.</small>:null}</div>:null}
   </>:!validationError?<p>Run your cases to see output here.</p>:null}
  </section></section>}
 </div>;
}

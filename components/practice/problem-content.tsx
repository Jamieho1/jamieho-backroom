'use client';
import Link from 'next/link';
import type {CSSProperties} from 'react';
import type {ArenaProblem} from '@/lib/practice/types';
import {topicById} from '@/lib/notes/topics';
import {relatedQuestions} from '@/lib/interview/practice-navigation';
import {interviewProblemHref} from '@/lib/interview/content';
export function ProblemExamples({problem,topic}:{problem:ArenaProblem;topic:string}){
 return <div className="practice-examples" style={{'--practice-topic':topicById(topic)?.dot??'#F7C86B'} as CSSProperties}>{problem.examples.map((example,i)=><section className="practice-example practice-example-lined" key={i} aria-label={`Example ${i+1}`}><h4>Example {i+1}</h4><pre>Input: {example.input}{'\n'}Output: {example.output}{example.explanation?`\n\nExplanation: ${example.explanation}`:''}</pre></section>)}</div>;
}
export function FollowUps({questions}:{questions:readonly string[]}){return <section className="practice-follow-ups" aria-label="Follow-up"><h3>Follow-up</h3><ul>{questions.map(question=><li key={question}>{question}</li>)}</ul></section>;}
export function RelatedQuestions({lc,completed,canSave,onNavigate}:{lc:number;completed:ReadonlySet<number>;canSave:boolean;onNavigate():void}){
 const related=relatedQuestions(lc);
 return <section className="pw-related" aria-label="Related questions"><h3>Related questions</h3>{related.length?<ul>{related.map(p=><li key={p.lc}><Link href={interviewProblemHref(p.lc)} onClick={onNavigate}><span>{p.title}</span><span className={`practice-tag practice-difficulty ${p.difficulty.toLowerCase()}`}>{p.difficulty}</span>{canSave?<span role="img" aria-label={`${p.title} ${completed.has(p.lc)?'completed':'not completed'}`} className="pw-done" data-complete={completed.has(p.lc)}>{completed.has(p.lc)?'✓':'○'}</span>:null}</Link></li>)}</ul>:<p>More questions will appear here as this section grows.</p>}</section>;
}

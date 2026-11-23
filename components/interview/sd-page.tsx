'use client';
import Link from 'next/link';
import {useContext,useMemo,useRef} from 'react';
import {createPortal} from 'react-dom';
import {useSearchParams} from 'next/navigation';
import {useViewer} from '@/components/viewer-provider';
import {CompanyNavigationContext} from './company-navigation';
import {InterviewIcon,isInterviewIcon} from './icons';
import {QuizPanel} from './sd-quiz';
import {SolutionView,backToTop,goToHeading,prefersReducedMotion,useActiveHeading} from './sd-solution';
import {useSdProgress} from './use-sd-progress';
import {noteHref} from '@/lib/interview/content';
import {wbHref} from '@/lib/interview/whiteboard';
import {SD_LIST_HREF,SD_TABS,sdHref,sdTab,tocFromMarkdown,type SdListItem,type SdQuestion,type TocItem} from '@/lib/interview/system-design';
import {headingDomId} from './sd-solution';
export interface SystemDesignPageProps{question:SdQuestion;questions:SdListItem[]}
export function SystemDesignPage(props:SystemDesignPageProps){
 const {viewer}=useViewer();const account=viewer.status==='owner'||viewer.status==='member'?viewer.id:undefined;
 return <SystemDesignContent key={(account??'visitor')+':'+props.question.id} {...props} account={account}/>;
}
function QuestionList({questions,current,done}:{questions:SdListItem[];current:string;done:ReadonlySet<string>}){
 const {host,close}=useContext(CompanyNavigationContext);
 return host?createPortal(<><Link href={SD_LIST_HREF} prefetch={false} className="iv-sd-all" onClick={close}>← All system design</Link><nav aria-label="System design questions">{questions.map(q=><Link key={q.id} href={sdHref(q.slug)} prefetch={false} aria-current={q.slug===current?'page':undefined} onClick={close}><span className="iv-icon"><InterviewIcon name={isInterviewIcon(q.icon)?q.icon:'system-design'}/></span><span>{q.title}</span>{done.has(q.id)?<span className="iv-sd-tick" role="img" aria-label="Done">✓</span>:null}</Link>)}</nav></>,host):null;
}
function TocLinks({items,active,onGo,onTop}:{items:TocItem[];active:string;onGo:(id:string)=>void;onTop:(el:HTMLElement|null)=>void}){
 return <><ol>{items.map(i=><li key={i.id}><a href={'#'+headingDomId(i.id)} aria-current={active===i.id?'location':undefined} onClick={e=>{e.preventDefault();onGo(i.id);}}>{i.text}</a></li>)}</ol><button type="button" className="iv-sd-top" onClick={e=>onTop(e.currentTarget)}>↑ Back to top</button></>;
}
function SystemDesignContent({question,questions,account}:SystemDesignPageProps&{account?:string}){
 const params=useSearchParams();const tab=sdTab(params.get('tab'));
 const progress=useSdProgress(!!account,account);
 const toc=useMemo(()=>tocFromMarkdown(question.solution),[question.solution]);
 const showToc=tab==='solution'&&toc.length>0;
 const [active,setActive]=useActiveHeading(showToc?toc:[]);
 const details=useRef<HTMLDetailsElement>(null);
 const go=(id:string)=>{setActive(id);goToHeading(id,!prefersReducedMotion());if(details.current)details.current.open=false;};
 const top=(el:HTMLElement|null)=>backToTop(el,!prefersReducedMotion());
 const icon=isInterviewIcon(question.icon)?question.icon:'system-design';
 const flagged=progress.flagged.has(question.id),done=progress.done.has(question.id);
 return <><QuestionList questions={questions} current={question.slug} done={progress.done}/>
 <article className="iv-sd-page" data-tab={tab}>
  <header className="iv-sd-header"><div className="iv-sd-title"><span className="iv-icon"><InterviewIcon name={icon}/></span><h1>{question.title}</h1></div>
   {account?<div className="iv-sd-controls"><button type="button" className="iv-flag" aria-label={`${flagged?'Unflag':'Flag'} ${question.title}`} aria-pressed={flagged} disabled={!progress.loaded||progress.saving} onClick={()=>void progress.toggle(question.id,'flagged')}><svg viewBox="0 0 24 24" fill={flagged?'currentColor':'none'} stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M5 21V4h13l-3 5 3 5H5"/></svg></button>
    <button type="button" className="iv-sd-done" aria-pressed={done} disabled={!progress.loaded||progress.saving} onClick={()=>void progress.toggle(question.id,'done')}>{done?'✓ Done':'Mark as done'}</button></div>:null}</header>
  {progress.error?<p role="alert">{progress.error} <button type="button" onClick={()=>void progress.reload()}>Retry</button></p>:null}
  <nav className="iv-sd-tabs" aria-label="Question tabs">{SD_TABS.map(t=><Link key={t.id} href={t.id==='whiteboard'?wbHref(question.slug):sdHref(question.slug,t.id)} aria-current={tab===t.id?'page':undefined} prefetch={false} scroll={false}>{t.label}</Link>)}</nav>
  {question.note_ref?<p className="iv-sd-note-link"><Link href={noteHref(question.note_ref)} prefetch={false}>Read the related notes ›</Link></p>:null}
  <div className="iv-sd-layout">
   <div className="iv-sd-main">
    {showToc?<details className="iv-sd-toc-mobile" ref={details}><summary>On this page</summary><nav><TocLinks items={toc} active={active} onGo={go} onTop={top}/></nav></details>:null}
    {tab==='solution'?<SolutionView markdown={question.solution} toc={toc}/>:null}
    {tab==='quiz'?<QuizPanel questionId={question.id} slug={question.slug} title={question.title} quiz={question.quiz} account={account}/>:null}
    {tab==='whiteboard'?<section className="iv-sd-whiteboard"><h2>Whiteboard</h2><p>The whiteboard opens in its own full-height workspace.</p><p><Link href={wbHref(question.slug)} prefetch={false} className="iv-sd-primary">Open the whiteboard ›</Link></p></section>:null}
   </div>
   {showToc?<aside className="iv-sd-toc" aria-label="On this page"><h2>On this page</h2><nav><TocLinks items={toc} active={active} onGo={go} onTop={top}/></nav></aside>:null}
  </div>
 </article></>;
}

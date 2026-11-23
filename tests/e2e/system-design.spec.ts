import {test,expect,type Page} from '@playwright/test';
import {build} from 'esbuild';
import {readFileSync} from 'node:fs';
/** S1 browser checks: the real components mounted in a scrolling workspace pane (as in the shell), desktop and 390px. */
let bundle='';
const diagram={title:'Request flow',nodes:[{id:'client',title:'Client'},{id:'api',title:'API'},{id:'db',title:'Database'}],edges:[{from:'client',to:'api'},{from:'api',to:'db'}]};
const schema={table:'urls',columns:[{name:'id',type:'bigint',pk:true},{name:'long_url',type:'text'},{name:'created_at',type:'timestamptz'}]};
const filler=(n:number)=>Array.from({length:n},(_,i)=>`Paragraph ${i+1} explains one detail of the design in plain words so the page has real height to scroll through.`).join('\n\n');
const solution=['Overview','Requirements','Data Model','API Design','Key Questions','Basic design','Advanced design','Main flows','Additional discussion points'].map(h=>`## ${h}\n\n${filler(7)}\n\n${h==='Data Model'?'```table-schema\n'+JSON.stringify(schema)+'\n```\n\n':''}${h==='Basic design'?'```diagram\n'+JSON.stringify(diagram)+'\n```\n\n':''}`).join('');
const quiz=[{q:'Which layer absorbs repeated reads?',options:['A cache','A cron job','A linter','A font'],answer:0,explanation:'A cache serves repeats.'},{q:'What keeps writes durable?',options:['Memory only','A write-ahead log','A CSS file','A cookie'],answer:1,explanation:'The log survives restarts.'},{q:'Which spreads load?',options:['A mutex','A load balancer','A comment','A badge'],answer:1,explanation:'It fans requests out.'}];
const question={id:'00000000-0000-4000-8000-000000000e01',slug:'fixture',title:'Fixture Design',icon:'system-design',topic:'',note_ref:'',solution,quiz,steps:[],sort:1,public:true};
test.beforeAll(async()=>{
 const stub=(contents:string)=>({contents,resolveDir:process.cwd(),loader:'tsx' as const});
 const out=await build({stdin:{contents:`import React from 'react';import {createRoot} from 'react-dom/client';import {SystemDesignPage} from './components/interview/sd-page';createRoot(document.getElementById('sd-fixture')).render(<div className="iv-shell" style={{display:'block',height:'100vh'}}><section className="iv-workspace" id="sd-scroll" style={{height:'100vh',overflow:'auto'}}><main><SystemDesignPage question={window.__question} questions={[window.__question]}/></main></section></div>);`,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,format:'iife',jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},plugins:[{name:'sd-fixtures',setup(b){
  b.onResolve({filter:/^next\/link$/},()=>({path:'link',namespace:'fx'}));b.onResolve({filter:/^next\/navigation$/},()=>({path:'nav',namespace:'fx'}));
  b.onResolve({filter:/^@\/components\/viewer-provider$/},()=>({path:'viewer',namespace:'fx'}));b.onResolve({filter:/^@\/app\/actions\/system-design$/},()=>({path:'actions',namespace:'fx'}));
  b.onLoad({filter:/^link$/,namespace:'fx'},()=>stub('import React from "react";export default function Link({children,prefetch,scroll,...props}){return <a {...props}>{children}</a>}'));
  b.onLoad({filter:/^nav$/,namespace:'fx'},()=>stub('export const useSearchParams=()=>new URLSearchParams(location.search);export const usePathname=()=>location.pathname;'));
  b.onLoad({filter:/^viewer$/,namespace:'fx'},()=>stub('export const useViewer=()=>({viewer:{status:"visitor"},configured:true});'));
  b.onLoad({filter:/^actions$/,namespace:'fx'},()=>stub('const no=async()=>({ok:false,message:"signed out"});export const loadSdProgress=no,saveSdProgress=no,loadQuizAttempts=no,saveQuizAttempt=no;'));
 }}]});
 bundle=out.outputFiles[0].text;
});
const fits=async(page:Page)=>expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
async function mount(page:Page,query=''){
 await page.goto('/interview/companies'+query);
 await page.addStyleTag({content:`body>:not(#sd-fixture){display:none!important}body{margin:0;background:#101720}${readFileSync('app/interview/interview.css','utf8')}${readFileSync('app/interview/system-design.css','utf8')}`});
 await page.evaluate(q=>{(window as unknown as {__question:unknown}).__question=q;const root=document.createElement('div');root.id='sd-fixture';document.body.append(root);},question);
 await page.addScriptTag({content:bundle});await expect(page.getByRole('heading',{level:1,name:'Fixture Design'})).toBeVisible();
}
const settle=(page:Page)=>page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r(null)))));
test('S1 solution: table-schema card, diagram, TOC highlight on scroll, jump and back to top',async({page},info)=>{
 const phone=info.project.name==='phone';await page.emulateMedia({reducedMotion:'reduce'});await mount(page);
 await expect(page.locator('[data-table-schema="urls"]')).toBeVisible();await expect(page.locator('[data-project-diagram="true"]')).toHaveCount(1);
 const headings=['Overview','Requirements','Data Model','API Design','Key Questions','Basic design','Advanced design','Main flows','Additional discussion points'];
 const toc=phone?page.locator('details.iv-sd-toc-mobile'):page.locator('aside.iv-sd-toc');
 if(phone){await expect(page.locator('aside.iv-sd-toc')).toBeHidden();await expect(toc.locator('summary')).toHaveText('On this page');await toc.locator('summary').click();}
 else await expect(toc.getByRole('heading',{name:'On this page'})).toBeVisible();
 await expect(toc.getByRole('link')).toHaveText(headings);
 const current=toc.locator('a[aria-current="location"]');await expect(current).toHaveText('Overview');
 await page.evaluate(()=>{const s=document.getElementById('sd-scroll')!;const h=document.getElementById('sd-basic-design')!;s.scrollTop+=h.getBoundingClientRect().top-s.getBoundingClientRect().top-20;});await settle(page);
 await expect(current).toHaveText('Basic design');
 await page.evaluate(()=>{const s=document.getElementById('sd-scroll')!;s.scrollTop=s.scrollHeight;});await settle(page);await expect(current).toHaveText('Additional discussion points');
 if(phone){await toc.locator('summary').click();}
 await page.evaluate(()=>{document.getElementById('sd-scroll')!.scrollTop=0;});await settle(page);
 if(phone)await toc.locator('summary').click();
 await toc.getByRole('link',{name:'API Design'}).click();await settle(page);
 expect(await page.evaluate(()=>{const s=document.getElementById('sd-scroll')!;return Math.abs(document.getElementById('sd-api-design')!.getBoundingClientRect().top-s.getBoundingClientRect().top)<60;})).toBe(true);
 if(phone)await expect(toc).not.toHaveAttribute('open','');
 if(phone)await toc.locator('summary').click();
 await toc.getByRole('button',{name:/Back to top/}).click();await settle(page);expect(await page.evaluate(()=>document.getElementById('sd-scroll')!.scrollTop)).toBe(0);
 await fits(page);await page.screenshot({path:info.outputPath('system-design-solution.png')});
});
test('S1 quiz: keyboard 1-4, explanations, Don\'t know, score review and attempts kept in the browser',async({page},info)=>{
 await mount(page,'?tab=quiz');await page.evaluate(()=>localStorage.clear());await page.evaluate(()=>history.replaceState(null,'','?tab=quiz'));await page.reload();
 await mount(page,'?tab=quiz');
 await expect(page.getByRole('heading',{name:'Fixture Design · Quiz · 3 Qs'})).toBeVisible();await expect(page.getByText('No attempts yet.')).toBeVisible();
 await page.getByRole('button',{name:'Start quiz'}).click();await expect(page.getByText('1 / 3')).toBeVisible();
 await page.keyboard.press('1');await expect(page.getByRole('status')).toContainText('Correct');await expect(page.getByText('A cache serves repeats.')).toBeVisible();
 await page.getByRole('button',{name:'Next'}).click();await expect(page.getByText('2 / 3')).toBeVisible();
 await page.getByRole('button',{name:"Don't know"}).click();await expect(page.getByRole('status')).toContainText("don't know");await expect(page.getByText('Correct answer: A write-ahead log')).toBeVisible();
 await page.getByRole('button',{name:'Next'}).click();await page.keyboard.press('1');await expect(page.getByRole('status')).toContainText('Incorrect');await fits(page);
 await page.getByRole('button',{name:'See score'}).click();await expect(page.getByRole('heading',{name:'Your score: 1 / 3'})).toBeVisible();
 await expect(page.locator('.iv-sd-review li')).toHaveCount(2);await expect(page.getByText("You answered: Don't know")).toBeVisible();await expect(page.getByText('You answered: A mutex')).toBeVisible();
 await page.screenshot({path:info.outputPath('system-design-quiz-score.png')});
 await page.getByRole('button',{name:'Back to attempts'}).click();await expect(page.getByRole('list',{name:'Your attempts'}).getByText('1 / 3')).toBeVisible();
 await mount(page,'?tab=quiz');await expect(page.getByRole('list',{name:'Your attempts'}).getByText('1 / 3')).toBeVisible();// still there after a reload
 await page.getByRole('button',{name:'Start quiz'}).click();await page.keyboard.press('1');await page.getByRole('button',{name:'Next'}).click();await page.keyboard.press('2');await page.getByRole('button',{name:'Next'}).click();await page.keyboard.press('2');await page.getByRole('button',{name:'See score'}).click();
 await expect(page.getByRole('heading',{name:'Your score: 3 / 3'})).toBeVisible();await page.getByRole('button',{name:'Back to attempts'}).click();await expect(page.getByRole('list',{name:'Your attempts'}).getByRole('listitem')).toHaveCount(2);
 await expect(page.getByRole('list',{name:'Your attempts'}).getByRole('listitem').first()).toContainText('3 / 3');await fits(page);
});

import { test,expect,type Page } from '@playwright/test';
import { build } from 'esbuild';
import { readFileSync } from 'node:fs';
import { problemByNumber } from '../../lib/practice/catalog';
let bundle='';
test.beforeAll(async()=>{
 // Bundle the real widget only for the test; no fixture route is added to the application.
 const out=await build({stdin:{contents:`
   import React from 'react';
   import {createRoot} from 'react-dom/client';
   import {PracticeArena} from './components/practice/arena';
   import {NotesReader} from './components/notes/reader';
   const params=new URLSearchParams(location.search);
   createRoot(document.getElementById('practice-test-root')).render(
     <main className="desktop-os"><div className="desktop-workspace">
       <section className="desktop-window"><div className="desktop-app-content">
         {params.has('notesFixture') ? <NotesReader notes={[{id:'arrays-hashing',title:'Arrays',body:'# Arrays\\n\\n### 1. Walk\\nExample explanation. Contains Duplicate',free:'',visual:[{kind:'array',title:'Walk a list',concept:'Walk',values:[2,4],frames:[{caption:'Start',pointers:[{name:'i',index:0}]},{caption:'Move',pointers:[{name:'i',index:1}]}]}],sort:1,updated_at:'2026-11-01T00:00:00Z'}]} /> : <PracticeArena viewerKey="fixture" initialProblem={217} canEdit={params.has('ownerFixture')} />}
       </div></section>
     </div></main>
   );
 `,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,format:'iife',platform:'browser',jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},plugins:[{name:'mock-practice-service',setup(b){b.onResolve({filter:/app\/actions\/practice-stars$/},()=>({path:'stars',namespace:'stars-fixture'}));b.onLoad({filter:/.*/,namespace:'stars-fixture'},()=>({contents:`let stars=new Set([217]);let fail=true;export async function loadPracticeStars(){return {ok:true,problems:[...stars]}};export async function savePracticeStar(problem,starred){if(fail){fail=false;return {ok:false,message:'Could not save star'}};starred?stars.add(problem):stars.delete(problem);return {ok:true};}`}));b.onResolve({filter:/^next\/link$/},()=>({path:'link',namespace:'link-fixture'}));b.onLoad({filter:/.*/,namespace:'link-fixture'},()=>({resolveDir:process.cwd(),contents:'import React from "react";export default function Link({prefetch,children,...props}){return React.createElement("a",props,children)}'}));b.onResolve({filter:/app\/actions\/practice$/},()=>({path:'practice',namespace:'fixture'}));b.onResolve({filter:/app\/actions\/notes$/},()=>({path:'notes',namespace:'notes-fixture'}));b.onLoad({filter:/.*/,namespace:'notes-fixture'},()=>({contents:'export async function saveNote(){return {ok:false,message:"Not part of this fixture"};}'}));b.onLoad({filter:/.*/,namespace:'fixture'},()=>({contents:`
 let codeFailures=1; let noteFailures=1;let loadFailures=location.search.includes('loadFailure')?1:0;
 export async function loadPracticeData(){if(loadFailures-- > 0)throw new Error('offline');return {ok:true,data:{note:'Shared question notes',code:location.search.includes('ownerFixture')?'Server code':null,attempts:[]}};}
 export async function savePracticeCode(){return codeFailures-- > 0 ? {ok:false,message:'Could not save code'} : {ok:true};}
 export async function savePracticeAttempt(){return {ok:true};}
 export async function saveQuestionNotes(){return noteFailures-- > 0 ? {ok:false,message:'Could not save notes'} : {ok:true};}
 `}));}}]});
 bundle=out.outputFiles[0].text;
});
async function mount(page:Page,mode=''){
 await page.route('**/__practice_test.js',route=>route.fulfill({contentType:'text/javascript',body:bundle}));
 await page.goto(`/privacy${mode?'?'+mode+'=1':''}`);
 await page.addStyleTag({content:`body > :not(#practice-test-root) { display:none!important; }\n${readFileSync('app/notes.css','utf8')}\n${readFileSync('app/practice.css','utf8')}`});
 await page.evaluate(()=>{const root=document.createElement('div');root.id='practice-test-root';document.body.append(root);});
 await page.addScriptTag({url:'/__practice_test.js'});
}
test('actual Practice UI runs Python, restores code after reload, and fits the viewport',async({page},info)=>{
 test.setTimeout(120000);
 await mount(page);
 const editor=page.getByRole('textbox',{name:'Python code'});
 await editor.fill(problemByNumber(217)!.solution);
 await expect(page.getByRole('button',{name:'Run',exact:true})).toBeEnabled({timeout:60000});
 await page.getByRole('button',{name:'Run',exact:true}).click();
 const count=problemByNumber(217)!.tests.filter(t=>t.visible).length;
 await expect(page.getByRole('region',{name:'Test results'})).toContainText(`${count} / ${count} passed`,{timeout:30000});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect(await page.evaluate(()=>localStorage.getItem('jamieho.practice.v1.fixture.217'))).toBe(problemByNumber(217)!.solution);
 await mount(page);
 await expect.poll(async()=>(await page.getByRole('textbox',{name:'Python code'}).locator('.cm-line').allTextContents()).join('\n').trimEnd()).toBe(problemByNumber(217)!.solution.trimEnd());
 await page.getByRole('tab',{name:'Solution',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Common pitfalls'})).toBeVisible();
 if(info.project.name==='desktop') {
  await page.getByRole('textbox',{name:'Python code'}).fill('class Solution:\n    def containsDuplicate(self, nums):\n        while True:\n            pass\n');
  await expect(page.getByRole('button',{name:'Run',exact:true})).toBeEnabled({timeout:60000});
  await page.getByRole('button',{name:'Run',exact:true}).click();
  await expect(page.getByRole('region',{name:'Test results'})).toContainText('exceeded 5 seconds',{timeout:15000});
  await expect(page.getByRole('button',{name:'Run',exact:true})).toBeEnabled({timeout:60000});
 }
});
test('actual Practice UI remains readable when the worker cannot load',async({page})=>{
 await page.route('**/runner/worker.mjs',route=>route.abort());
 await mount(page);
 await expect(page.getByRole('alert')).toContainText('Python could not load',{timeout:10000});
 await expect(page.getByRole('button',{name:'Run',exact:true})).toBeDisabled();
 await expect(page.getByRole('button',{name:'Submit',exact:true})).toBeDisabled();
 await page.getByRole('tab',{name:'Solution',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Reference code'})).toBeVisible();
});

test('owner controls preserve code and question-note drafts on failure',async({page})=>{
 await page.route('**/runner/worker.mjs',route=>route.abort());
 await mount(page,'ownerFixture');
 const editor=page.getByRole('textbox',{name:'Python code'});
 await expect(editor).toContainText('Server code');
 await editor.fill('Owner draft');
 await page.getByRole('button',{name:'Save code',exact:true}).click();
 await page.getByRole('button',{name:'Retry saving code'}).waitFor();
 await expect(editor).toContainText('Owner draft');
 await page.getByRole('button',{name:'Retry saving code'}).click();
 await expect(page.getByText('Saved across devices')).toBeVisible();
 await page.getByRole('tab',{name:'Notes',exact:true}).click();
 await page.getByRole('button',{name:'Edit question notes'}).click();
 await page.getByLabel('Question notes (Markdown)').fill('An owner explanation');
 await page.getByRole('button',{name:'Save notes',exact:true}).click();
 await page.getByRole('button',{name:'Retry',exact:true}).waitFor();
 await expect(page.getByLabel('Question notes (Markdown)')).toHaveValue('An owner explanation');
 await page.getByRole('button',{name:'Retry',exact:true}).click();
 await expect(page.getByText('An owner explanation')).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('Notes problem links target the matching arena problem',async({page})=>{
 await mount(page,'notesFixture');
 const link=page.getByRole('region',{name:'NeetCode problems'}).getByRole('link',{name:'Contains Duplicate →'});
 await expect(link).toHaveAttribute('href','/practices/217');
 await link.click();
 await expect(page).toHaveURL(/\/practices\/217$/);
});

test('owner can recover saved code after an initial load failure without losing the latest browser draft',async({page})=>{
 await page.route('**/runner/worker.mjs',r=>r.abort());
 await mount(page,'ownerFixture&loadFailure');
 const editor=page.getByRole('textbox',{name:'Python code'});await editor.fill('Draft typed offline');
 await expect(page.getByRole('button',{name:'Save code',exact:true})).toBeDisabled();
 await page.getByRole('button',{name:'Retry loading saved data',exact:true}).click();
 await expect(page.getByRole('button',{name:'Load saved code',exact:true})).toBeVisible();
 await expect(editor).toHaveText('Draft typed offline');
 await page.getByRole('button',{name:'Load saved code',exact:true}).click();await expect(editor).toHaveText('Server code');
 await page.getByRole('button',{name:'Restore browser draft',exact:true}).click();await expect(editor).toHaveText('Draft typed offline');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('Practice tags, search, title alignment and private review filter work at desktop and phone sizes',async({page},info)=>{
 await page.route('**/runner/worker.mjs',r=>r.abort());await mount(page,'ownerFixture');
 const heading=page.locator('.practice-heading');await expect(heading.getByText('NeetCode 150',{exact:true})).toBeVisible();
 const search=page.getByRole('searchbox',{name:'Search problems',exact:true});await expect(search).toHaveAttribute('placeholder','Search questions…');
 const colors=await page.locator('.practice-sidebar').evaluate(el=>{
  const color=(difficulty:string)=>getComputedStyle(el.querySelector('[data-difficulty="'+difficulty+'"]')!).color.match(/\d+/g)!.map(Number);
  return {easy:color('easy'),medium:color('medium'),hard:color('hard'),search:getComputedStyle(el.querySelector('input')!).backgroundColor,background:getComputedStyle(el).backgroundColor};
 });
 expect(colors.easy[1]).toBeGreaterThan(colors.easy[0]);expect(colors.medium[0]).toBeGreaterThan(colors.medium[1]);expect(colors.medium[1]).toBeGreaterThan(colors.medium[2]);expect(colors.hard[0]).toBeGreaterThan(colors.hard[1]);expect(colors.search).not.toBe(colors.background);
 if(info.project.name==='desktop'){
  const title=await heading.getByRole('heading',{name:'Contains Duplicate',exact:true}).boundingBox();const meta=await heading.locator('.practice-heading-meta').boundingBox();expect(Math.abs(title!.y+title!.height/2-meta!.y-meta!.height/2)).toBeLessThan(2);
 }
 await page.getByRole('button',{name:'★ Starred (1)',exact:true}).click();await expect(page.getByRole('navigation',{name:'Practice problems'}).getByRole('button')).toHaveCount(1);
 await page.getByRole('button',{name:'Unstar Contains Duplicate for later',exact:true}).click();await expect(page.getByRole('button',{name:'Retry saving star',exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'★ Starred (1)',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Retry saving star',exact:true}).click();await expect(page.getByRole('button',{name:'★ Starred (0)',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Star Contains Duplicate for later',exact:true}).click();await expect(page.getByRole('button',{name:'★ Starred (1)',exact:true})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('Practice question list collapses and panel dividers resize without resetting code',async({page},info)=>{
 await page.route('**/runner/worker.mjs',r=>r.abort());await mount(page);
 const editor=page.getByRole('textbox',{name:'Python code'});await editor.fill('Keep this draft');
 const list=page.getByRole('navigation',{name:'Practice problems'});await expect(list).toBeVisible();
 await page.getByRole('button',{name:'Collapse question list'}).click();await expect(list).toHaveCount(0);await expect(editor).toHaveText('Keep this draft');
 await page.getByRole('button',{name:'Expand question list'}).click();await expect(list).toBeVisible();
 if(info.project.name==='desktop'){
  const sidebar=page.locator('.practice-sidebar');const before=(await sidebar.boundingBox())!.width;
  const handle=page.getByRole('separator',{name:'Resize question list'});const bar=(await handle.boundingBox())!;
  await page.mouse.move(bar.x+bar.width/2,bar.y+20);await page.mouse.down();await page.mouse.move(bar.x+bar.width/2+80,bar.y+20);await page.mouse.up();expect((await sidebar.boundingBox())!.width).toBeGreaterThan(before+50);
  const split=page.getByRole('separator',{name:'Resize problem and code panels'});await expect(split).toBeVisible();const old=Number(await split.getAttribute('aria-valuenow'));const center=(await split.boundingBox())!;await page.mouse.move(center.x+4,center.y+20);await page.mouse.down();await page.mouse.move(center.x+70,center.y+20);await page.mouse.up();expect(Number(await split.getAttribute('aria-valuenow'))).toBeGreaterThan(old);
  await expect(editor).toHaveText('Keep this draft');
  await mount(page);await expect.poll(async()=>Number(await page.getByRole('separator',{name:'Resize question list'}).getAttribute('aria-valuenow'))).toBeGreaterThan(260);
 }else{await expect(page.getByRole('separator',{name:'Resize question list'})).toHaveCount(0);}
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('Notes shows text and visuals together with resizable panels and fits phones', async({page}, info) => {
 await mount(page,'notesFixture');
 await expect(page.getByRole('heading',{name:'Arrays',exact:true})).toHaveCount(1);
 await expect(page.getByText(/^Step 1\. Start$/)).toBeVisible();
 await expect(page.getByRole('button',{name:'Recall mode'})).toHaveCount(0);
 await expect(page.getByRole('tab',{name:/^(Notes|Visuals)$/})).toHaveCount(0);
 await page.getByRole('button',{name:'Open all',exact:true}).click();
 await expect(page.getByText('Example explanation.',{exact:false})).toBeVisible();
 await page.getByRole('button',{name:'Next frame'}).click();
 await expect(page.getByText(/^Step 2\. Move$/)).toBeVisible();
 if(info.project.name==='desktop') {
  const topics=page.getByRole('separator',{name:'Resize topics',exact:true});
  const split=page.getByRole('separator',{name:'Resize notes and visuals',exact:true});
  const before=(await split.boundingBox())!.x;
  const box=(await topics.boundingBox())!;
  await page.mouse.move(box.x+4,box.y+30); await page.mouse.down(); await page.mouse.move(box.x+54,box.y+30); await page.mouse.up();
  await expect(topics).toHaveAttribute('aria-valuenow','270');
  const center=(await split.boundingBox())!;
  await page.mouse.move(center.x+4,center.y+30); await page.mouse.down(); await page.mouse.move(center.x+44,center.y+30); await page.mouse.up();
  expect((await split.boundingBox())!.x).toBeGreaterThan(before);
  await split.focus(); await page.keyboard.press('Home'); await expect(split).toHaveAttribute('aria-valuenow','25');
  await expect(page.getByText(/^Step 2\. Move$/)).toBeVisible();
 } else {
  await expect(page.getByRole('separator',{name:'Resize notes and visuals'})).toBeHidden();
 }
 await page.getByRole('button',{name:'Collapse topics'}).click();
 await expect(page.getByRole('navigation',{name:'Coding topics'})).toBeHidden();
 await page.getByRole('button',{name:'Expand topics'}).click();
 await expect(page.getByRole('navigation',{name:'Coding topics'})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

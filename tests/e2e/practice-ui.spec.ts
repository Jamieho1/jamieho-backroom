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
         {params.has('notesFixture') ? <NotesReader notes={[{id:'arrays-hashing',title:'Arrays',body:'Contains Duplicate',free:'',visual:[],sort:1,updated_at:'2026-11-01T00:00:00Z'}]} /> : <PracticeArena viewerKey="fixture" initialProblem={217} canEdit={params.has('ownerFixture')} />}
       </div></section>
     </div></main>
   );
 `,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,format:'iife',platform:'browser',jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},plugins:[{name:'mock-practice-service',setup(b){b.onResolve({filter:/^next\/link$/},()=>({path:'link',namespace:'link-fixture'}));b.onLoad({filter:/.*/,namespace:'link-fixture'},()=>({resolveDir:process.cwd(),contents:'import React from "react";export default function Link({prefetch,children,...props}){return React.createElement("a",props,children)}'}));b.onResolve({filter:/app\/actions\/practice$/},()=>({path:'practice',namespace:'fixture'}));b.onResolve({filter:/app\/actions\/notes$/},()=>({path:'notes',namespace:'notes-fixture'}));b.onLoad({filter:/.*/,namespace:'notes-fixture'},()=>({contents:'export async function saveNote(){return {ok:false,message:"Not part of this fixture"};}'}));b.onLoad({filter:/.*/,namespace:'fixture'},()=>({contents:`
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

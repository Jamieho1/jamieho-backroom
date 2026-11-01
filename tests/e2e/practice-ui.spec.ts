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
   createRoot(document.getElementById('practice-test-root')).render(
     <main className="desktop-os"><div className="desktop-workspace">
       <section className="desktop-window"><div className="desktop-app-content">
         <PracticeArena viewerKey="fixture" initialProblem={217} />
       </div></section>
     </div></main>
   );
 `,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,format:'iife',platform:'browser',jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'}});
 bundle=out.outputFiles[0].text;
});
async function mount(page:Page){
 await page.route('**/__practice_test.js',route=>route.fulfill({contentType:'text/javascript',body:bundle}));
 await page.goto('/privacy');
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
 const lines=await page.getByRole('textbox',{name:'Python code'}).locator('.cm-line').allTextContents();
 expect(lines.join('\n').trimEnd()).toBe(problemByNumber(217)!.solution.trimEnd());
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

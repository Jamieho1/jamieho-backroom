import { test,expect,type Page } from '@playwright/test';
import { build } from 'esbuild';
import { readFileSync } from 'node:fs';
let bundle='';
test.beforeAll(async()=>{
 const out=await build({stdin:{contents:`
 import React from 'react';import {createRoot} from 'react-dom/client';
 import {Behavioral} from './components/behavioral/workspace';
 const bullet='00000000-0000-4000-8000-000000000001';
 const items=[{id:'role',kind:'role',title:'Example role',org:'Example org',dates:'',location:'',summary:'',public:false,bullets:[{id:bullet,text:'Example bullet '+ 'long'.repeat(80),public:false}]}];
 const stories=[{id:'00000000-0000-4000-8000-000000000002',bullet_id:bullet,title:'Example story',situation:'Context',task:'Goal',action:'Steps',result:'Outcome',skills:'Ownership',numbers:'Two improvements',updated_at:'2026-11-01T00:00:00Z'}];
 createRoot(document.getElementById('behavioral-test-root')).render(<main className="desktop-os"><div className="desktop-workspace"><section className="desktop-window"><div className="desktop-app-content"><Behavioral items={items} initialStories={stories} initialAnswers={[{question_id:'g-disagree',primary_story_id:stories[0].id,secondary_story_id:null,outline:'Example outline',followups:'Example follow-up',updated_at:'now'}]} canEdit={location.search.includes('owner')} /></div></section></div></main>);
 `,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,format:'iife',platform:'browser',jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},plugins:[{name:'behavioral-service',setup(b){b.onResolve({filter:/app\/actions\/behavioral$/},()=>({path:'behavioral',namespace:'fixture'}));b.onLoad({filter:/.*/,namespace:'fixture'},()=>({contents:`let answerFail=true;export async function saveAnswer(answer){if(answerFail){answerFail=false;return {ok:false,message:'Could not save answer'};}return {ok:true,answer:{...answer,updated_at:'now'}};} let fail=true;export async function saveStory(story){if(fail){fail=false;return {ok:false,message:'Could not save'};}return {ok:true,story:{...story,updated_at:'2026-11-01T00:00:00Z'}};}`}));}}]});
 bundle=out.outputFiles[0].text;
});
async function mount(page:Page,owner=false){
 await page.route('**/__behavioral_test.js',r=>r.fulfill({contentType:'text/javascript',body:bundle}));
 await page.goto('/privacy'+(owner?'?owner=1':''));
 await page.addStyleTag({content:`body > :not(#behavioral-test-root) {display:none!important;}\n${readFileSync('app/behavioral.css','utf8')}`});
 await page.evaluate(()=>{const root=document.createElement('div');root.id='behavioral-test-root';document.body.append(root);});
 await page.addScriptTag({url:'/__behavioral_test.js'});
}
test('invited-reader widget opens bullet stories without editing controls and fits the viewport',async({page})=>{
 await mount(page);await page.getByRole('button',{name:/1 story for Example bullet/}).click();
 await expect(page.getByRole('article',{name:'Selected STAR story'})).toContainText('Two improvements');
 await expect(page.getByRole('button',{name:'Edit story',exact:true})).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Add story',exact:true})).toHaveCount(0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('owner story edits survive a failed save and Retry updates the linked story',async({page})=>{
 await mount(page,true);await page.getByRole('button',{name:/1 story for Example bullet/}).click();
 await page.getByRole('button',{name:'Edit story',exact:true}).click();
 await page.getByRole('textbox',{name:'Result',exact:true}).fill('New outcome '+ 'long'.repeat(80));
 await page.getByRole('textbox',{name:'Numbers',exact:true}).fill('Three improvements');
 await page.getByRole('button',{name:'Save story',exact:true}).click();
 await expect(page.getByRole('alert')).toContainText('Could not save');
 await expect(page.getByRole('textbox',{name:'Result',exact:true})).toHaveValue('New outcome '+ 'long'.repeat(80));
 await expect(page.getByRole('button',{name:/1 story for Example bullet/})).toBeDisabled();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.getByRole('button',{name:'Retry',exact:true}).click();
 await expect(page.getByRole('article',{name:'Selected STAR story'})).toContainText('Three improvements');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('question readers filter sets and open mapped stories without edit controls',async({page})=>{
 await mount(page);await page.getByRole('tab',{name:'Questions',exact:true}).click();
 await page.getByRole('combobox',{name:'Theme',exact:true}).selectOption('Conflict');
 await expect(page.getByRole('article',{name:'Selected question'})).toContainText('Example outline');
 await expect(page.getByRole('button',{name:/Conflict: 1\//})).toBeVisible();
 await expect(page.getByRole('button',{name:'Edit answer',exact:true})).toHaveCount(0);
 await page.getByRole('article',{name:'Selected question'}).getByRole('button',{name:'Example story',exact:true}).click();
 await expect(page.getByRole('article',{name:'Selected STAR story'})).toContainText('Outcome');
 await page.getByRole('tab',{name:'Questions',exact:true}).click();
 await page.getByRole('combobox',{name:'Theme',exact:true}).selectOption('');
 await page.getByRole('combobox',{name:'Question set',exact:true}).selectOption('Palantir');
 await expect(page.getByRole('navigation',{name:'Choose question'}).getByRole('button')).toHaveCount(5);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('owner question mapping retries retain the draft and update coverage at 390px and desktop',async({page})=>{
 await mount(page,true);await page.getByRole('tab',{name:'Questions',exact:true}).click();
 await page.getByRole('searchbox',{name:'Search questions',exact:true}).fill('proudest');
 await page.getByRole('button',{name:'Edit answer',exact:true}).click();
 await page.getByRole('combobox',{name:'Best story 1',exact:true}).selectOption('00000000-0000-4000-8000-000000000002');
 const outline='Outline '+ 'long'.repeat(80);
 await page.getByRole('textbox',{name:'Answer outline',exact:true}).fill(outline);
 await page.getByRole('textbox',{name:'Follow-ups',exact:true}).fill('Ask for the outcome');
 await page.getByRole('button',{name:'Save answer',exact:true}).click();
 await expect(page.getByRole('alert')).toContainText('Could not save answer');
 await expect(page.getByRole('textbox',{name:'Answer outline',exact:true})).toHaveValue(outline);
 await expect(page.getByRole('combobox',{name:'Best story 1',exact:true})).toHaveValue('00000000-0000-4000-8000-000000000002');
 await expect(page.getByRole('tab',{name:'CV & stories',exact:true})).toBeDisabled();
 await expect(page.getByRole('button',{name:/Impact: 0\//})).toBeDisabled();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.getByRole('button',{name:'Retry',exact:true}).click();
 await expect(page.getByRole('button',{name:/Impact: 1\//})).toBeEnabled();
 await expect(page.getByRole('article',{name:'Selected question'})).toContainText('Ask for the outcome');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

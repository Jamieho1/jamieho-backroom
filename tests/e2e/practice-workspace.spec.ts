import {test,expect,type Page} from '@playwright/test';
import {build} from 'esbuild';
import {readFileSync} from 'node:fs';
let html='';
test.beforeAll(async()=>{
 const source=`import React from 'react';import {createRoot} from 'react-dom/client';import {InterviewShell} from './components/interview/shell';import {PracticeArena} from './components/practice/arena';
 const params=new URLSearchParams(location.search);createRoot(document.getElementById('root')).render(<InterviewShell><PracticeArena singleProblem viewerKey={params.get('account')||'visitor'} canSave={!!params.get('account')} canEdit={!!params.get('account')} initialProblem={Number(params.get('id')||217)}/></InterviewShell>);`;
 const actions=`const account=new URLSearchParams(location.search).get('account')||'visitor';window.p1={run:0,submit:0,save:0,offline:false};
 export async function loadPracticeData(problem){return {ok:true,data:{code:localStorage.getItem('fixture.remote.'+account+'.'+problem),note:'',attempts:[]}}}
 export async function savePracticeCode(problem,code){window.p1.save++;if(window.p1.offline)return {ok:false,message:'Offline'};localStorage.setItem('fixture.remote.'+account+'.'+problem,code);return {ok:true}}
 export async function savePracticeAttempt(){return {ok:true}}
 export async function saveQuestionNotes(){return {ok:true}}
 export async function loadPracticeStars(){return {ok:true,problems:account==='visitor'?[]:[217]}}
 export async function savePracticeStar(){return {ok:true}}
 export async function loadPracticeCases(){return {ok:true,cases:[]}};export async function savePracticeCases(){return {ok:true}};export async function loadPracticeCompletions(){return {ok:true,problems:account==='visitor'?[]:[217]}}`;
 const modules:Record<string,{contents:string;loader?:'tsx'}>={
  'next/link':{loader:'tsx',contents:`import React from 'react';export default function Link({href,prefetch,children,...props}){const match=String(href).startsWith('/interview/problems/')?['',String(href).split('/').at(-1)]:null;const params=new URLSearchParams(location.search);if(match)params.set('id',match[1]);return <a {...props} href={match?'/p1-fixture?'+params:href}>{children}</a>}`},
  'next/navigation':{contents:`export const usePathname=()=>'/interview/problems/'+(new URLSearchParams(location.search).get('id')||217);`},
  '@/components/viewer-provider':{contents:`export const useViewer=()=>({viewer:{status:new URLSearchParams(location.search).has('account')?'owner':'anonymous',id:new URLSearchParams(location.search).get('account')},configured:false});`},
  '@/components/sign-in-button':{loader:'tsx',contents:`import React from 'react';export const SignInButton=()=> <button>Sign in</button>;`},
  '@/components/feedback-button':{loader:'tsx',contents:`import React from 'react';export const FeedbackButton=({children,...props})=><button {...props}>{children}</button>;`},
  '@/lib/practice/runner':{contents:`export class PythonRunner{async warmUp(){}dispose(){}async run(problem,code,mode){window.p1[mode]++;return {status:'ok',passed:1,total:1,results:[{id:'synthetic',visible:true,status:'pass',got:'true',expected:'true'}],stdout:''}}}`},
 };
 const out=await build({stdin:{contents:source,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,format:'iife',platform:'browser',jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},plugins:[{name:'synthetic-p1',setup(b){
  b.onResolve({filter:/^(next\/link|next\/navigation|@\/components\/(viewer-provider|sign-in-button|feedback-button)|@\/lib\/practice\/runner)$/},a=>({path:a.path,namespace:'p1'}));
  b.onResolve({filter:/app\/actions\/(practice|practice-stars|practice-progress|practice-cases)$/},()=>({path:'actions',namespace:'p1'}));
  b.onLoad({filter:/.*/,namespace:'p1'},a=>({...(a.path==='actions'?{contents:actions}:modules[a.path]),resolveDir:process.cwd()}));
 }}]});
 const css=['app/globals.css','app/practice.css','app/notes.css','app/interview/interview.css'].map(p=>readFileSync(p,'utf8')).join('\n');
 html=`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head><body><div id="root"></div><script>${out.outputFiles[0].text.replace(/<\/script/gi,'<\\/script')}</script></body></html>`;
});
async function mount(page:Page,query='id=217'){await page.route('**/p1-fixture**',route=>route.fulfill({contentType:'text/html',body:html}));await page.goto('/p1-fixture?'+query);await expect(page.getByRole('textbox',{name:'Python code',exact:true})).toBeVisible();}
const fits=async(page:Page)=>expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);

test('P1 topic drawer searches/highlights, crosses topic boundary and collapsed rail has no logo',async({page},info)=>{
 await mount(page,'id=128&account=synthetic-owner');
 if(info.project.name==='desktop'){
  const before=await page.locator('.iv-brand-row').boundingBox();await page.getByRole('button',{name:'Collapse section rail'}).click();await expect(page.locator('.iv-brand')).toBeHidden();
  const button=await page.getByRole('button',{name:'Expand section rail'}).boundingBox();expect(button!.y+button!.height/2).toBeCloseTo(before!.y+before!.height/2,0);
 }
 await page.getByRole('button',{name:'Arrays & Hashing ▾'}).click();const drawer=page.getByRole('dialog',{name:'Section questions'});await expect(drawer).toBeVisible();
 await expect(drawer.locator('[aria-current=page]')).toHaveText('Longest Consecutive Sequence');
 const current=await drawer.locator('[aria-current=page]').boundingBox(),box=await drawer.boundingBox();expect(current!.y).toBeGreaterThanOrEqual(box!.y);expect(current!.y+current!.height).toBeLessThanOrEqual(box!.y+box!.height);
 await drawer.getByRole('searchbox',{name:'Search questions'}).fill('Contains Duplicate');await expect(drawer.locator('nav a')).toHaveCount(1);await expect(drawer.getByRole('img',{name:'Contains Duplicate completed',exact:true})).toBeVisible();await expect(drawer.getByRole('button',{name:'Unflag Contains Duplicate',exact:true})).toBeVisible();
 if(info.project.name==='phone')expect(Math.round(box!.width)).toBe(390);
 await page.keyboard.press('Escape');await expect(drawer).toHaveCount(0);await expect(page.getByRole('button',{name:'Arrays & Hashing ▾'})).toBeFocused();
 await page.getByRole('link',{name:'Next question'}).click();await expect(page.getByRole('button',{name:'Two Pointers ▾'})).toBeVisible();await expect(page.getByRole('region',{name:'Valid Palindrome',exact:true})).toBeVisible();await fits(page);
});

test('P1 split sizes and console preference persist; controls reset/fullscreen/description work',async({page},info)=>{
 await mount(page);const editor=page.getByRole('textbox',{name:'Python code',exact:true});await editor.fill('# synthetic draft');
 if(info.project.name==='desktop'){
  for(const [name,axis] of [['Resize problem and code panels','x'],['Resize editor and console','y']] as const){const handle=page.getByRole('separator',{name});const before=Number(await handle.getAttribute('aria-valuenow'));const b=(await handle.boundingBox())!;await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width/2+(axis==='x'?60:0),b.y+b.height/2+(axis==='y'?60:0));await page.mouse.up();expect(Number(await handle.getAttribute('aria-valuenow'))).toBeGreaterThan(before);}
 }else{await expect(page.getByRole('separator',{name:'Resize editor and console'})).toBeHidden();}
 await page.getByRole('button',{name:'Console / Test',exact:true}).click();await expect(page.getByRole('region',{name:'Console / Test'})).toHaveCount(0);await expect(page.getByRole('button',{name:'Submit',exact:true})).toBeVisible();
 await page.reload();await expect(page.getByRole('button',{name:'Console / Test',exact:true})).toHaveAttribute('aria-expanded','false');await expect(editor).toContainText('# synthetic draft');
 if(info.project.name==='desktop'){expect(Number(await page.getByRole('separator',{name:'Resize problem and code panels'}).getAttribute('aria-valuenow'))).toBeGreaterThan(50);}
 await page.getByRole('button',{name:'Console / Test',exact:true}).click();if(info.project.name==='desktop')expect(Number(await page.getByRole('separator',{name:'Resize editor and console'}).getAttribute('aria-valuenow'))).toBeGreaterThan(60);
 await page.getByRole('button',{name:'Collapse description panel'}).click();await expect(page.getByRole('region',{name:'Question description'})).toHaveCount(0);await page.getByRole('button',{name:'Expand description panel'}).click();
 await page.getByRole('button',{name:'Fullscreen editor',exact:true}).click();await expect(page.locator('.pw-right')).toHaveAttribute('data-fullscreen','true');await editor.focus();await page.keyboard.press('Escape');await expect(page.locator('.pw-right')).toHaveAttribute('data-fullscreen','false');
 page.once('dialog',d=>d.dismiss());await page.getByRole('button',{name:'Reset to starter code'}).click();await expect(editor).toContainText('# synthetic draft');page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Reset to starter code'}).click();await expect(editor).not.toContainText('# synthetic draft');
 await page.getByRole('tab',{name:'Submissions',exact:true}).click();await expect(page.getByText('Submissions workspace is coming soon.')).toBeVisible();await fits(page);await page.screenshot({path:info.outputPath('p1-workspace.png')});
});

test('P1 editor shortcuts, autosave, route/unload recovery and offline retry preserve account code',async({page})=>{
 await mount(page,'id=217&account=synthetic-owner');const editor=page.getByRole('textbox',{name:'Python code',exact:true});await editor.fill('# synthetic owner code');await expect.poll(()=>page.evaluate(()=>localStorage.getItem('fixture.remote.synthetic-owner.217'))).toBe('# synthetic owner code');await expect(page.locator('.pw-save-status')).toHaveText('Saved');await expect(page.getByRole('button',{name:'Save code',exact:true})).toHaveCount(0);
 await editor.focus();await page.keyboard.press('Control+Enter');await expect.poll(()=>page.evaluate(()=>(window as any).p1.run)).toBe(1);await page.keyboard.press('Control+Shift+Enter');await expect.poll(()=>page.evaluate(()=>(window as any).p1.submit)).toBe(1);
 await editor.fill('# flushed immediately');await page.keyboard.press('Control+s');await expect.poll(()=>page.evaluate(()=>localStorage.getItem('fixture.remote.synthetic-owner.217'))).toBe('# flushed immediately');
 await page.getByRole('button',{name:'Keyboard shortcuts'}).click();await expect(page.getByRole('dialog',{name:'Keyboard shortcuts'})).toBeVisible();await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Keyboard shortcuts'})).toBeFocused();
 await page.getByRole('button',{name:'Arrays & Hashing ▾'}).click();await page.getByRole('searchbox',{name:'Search questions'}).focus();await page.keyboard.press('Control+Enter');expect(await page.evaluate(()=>(window as any).p1.run)).toBe(1);await page.keyboard.press('Escape');
 await page.evaluate(()=>{(window as any).p1.offline=true;});await editor.fill('# pending offline');await expect(page.locator('.pw-save-status')).toHaveText('Offline — saved locally');
 await page.getByRole('link',{name:'Next question'}).click();await expect(page.getByRole('region',{name:'Valid Anagram',exact:true})).toBeVisible();await page.getByRole('link',{name:'Previous question'}).click();await expect(editor).toContainText('# pending offline');await expect.poll(()=>page.evaluate(()=>localStorage.getItem('fixture.remote.synthetic-owner.217'))).toBe('# pending offline');
 await editor.fill('# unload recovery');await page.reload();await expect(editor).toContainText('# unload recovery');
 await page.goto('/p1-fixture?id=217&account=synthetic-member');await expect(editor).not.toContainText('# unload recovery');await fits(page);
});

test('P1 reduced motion and visitor local-only code retain the usable workspace',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await mount(page);const editor=page.getByRole('textbox',{name:'Python code',exact:true});await editor.fill('# visitor only');await page.reload();await expect(editor).toContainText('# visitor only');
 await page.getByRole('button',{name:'Arrays & Hashing ▾'}).click();const drawer=page.getByRole('dialog',{name:'Section questions'});await expect(drawer).toBeVisible();expect(await drawer.evaluate(el=>getComputedStyle(el).animationName)).toBe('none');await expect(drawer.getByRole('button',{name:/^Flag /})).toHaveCount(0);await expect(drawer.getByRole('img')).toHaveCount(0);await page.keyboard.press('Escape');expect(await page.evaluate(()=>(window as any).p1.save)).toBe(0);await fits(page);
});

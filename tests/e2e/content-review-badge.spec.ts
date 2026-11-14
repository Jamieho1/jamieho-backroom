import {test,expect,type Page} from '@playwright/test';
import {build} from 'esbuild';
let bundle='';
test.beforeAll(async()=>{
 const out=await build({stdin:{contents:`import React from 'react';import {createRoot} from 'react-dom/client';import {SiteNavigation} from './components/site-navigation';const floating=new URLSearchParams(location.search).get('floating')==='true';createRoot(document.getElementById('badge-fixture')).render(<SiteNavigation journey={floating} ref={node=>{if(node)node.dataset.floating=String(floating)}}/>);`,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,format:'iife',platform:'browser',jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},plugins:[{name:'badge-fixture',setup(b){
 b.onResolve({filter:/components\/viewer-provider$|\.\/viewer-provider$/},()=>({path:'viewer',namespace:'badge-viewer'}));
 b.onLoad({filter:/.*/,namespace:'badge-viewer'},()=>({resolveDir:process.cwd(),contents:`import {useSyncExternalStore} from 'react';const role=new URLSearchParams(location.search).get('role')||'anonymous';let viewer={status:role,id:role};const listeners=new Set();window.changeBadgeViewer=status=>{viewer={status,id:status};for(const callback of listeners)callback()};export function useViewer(){return {viewer:useSyncExternalStore(callback=>{listeners.add(callback);return()=>listeners.delete(callback)},()=>viewer),configured:true}}`}));
 b.onResolve({filter:/app\/actions\/content-draft-count$/},()=>({path:'count',namespace:'badge-count'}));b.onLoad({filter:/.*/,namespace:'badge-count'},()=>({contents:`export async function getContentDraftCount(){const response=await fetch('/__badge_count');return response.json()}`}));
 b.onResolve({filter:/^next\/navigation$/},()=>({path:'navigation',namespace:'badge-navigation'}));b.onLoad({filter:/.*/,namespace:'badge-navigation'},()=>({contents:'export function usePathname(){return "/"}'}));
 b.onResolve({filter:/^next\/link$/},()=>({path:'link',namespace:'badge-link'}));b.onLoad({filter:/.*/,namespace:'badge-link'},()=>({resolveDir:process.cwd(),contents:'import React from "react";export default function Link({prefetch,children,...props}){return React.createElement("a",props,children)}'}));
 }}]});bundle=out.outputFiles[0].text;
});
async function mount(page:Page,role:string,count:number,floating=false){
 let requests=0;await page.route('**/__badge_count',async r=>{requests++;await r.fulfill({json:count})});
 await page.goto('/privacy?role='+role+'&floating='+floating);await page.addStyleTag({content:'body > :not(#badge-fixture){display:none!important}'});
 await page.evaluate(()=>{const root=document.createElement('div');root.id='badge-fixture';document.body.append(root)});
 await page.route('**/__badge_fixture.js',r=>r.fulfill({contentType:'text/javascript',body:bundle}));await page.addScriptTag({url:'/__badge_fixture.js'});
 return ()=>requests;
}
test('owner sees two drafts in top and floating bars without overflow or changed controls',async({page})=>{
 for(const floating of [false,true]){
  await mount(page,'owner',2,floating);const badge=page.getByRole('link',{name:'2 to review',exact:true});await expect(badge).toBeVisible();await expect(badge).toHaveAttribute('href','/manage/review');
  await expect(page.getByRole('combobox',{name:'Colour mode'})).toBeVisible();await expect(page.getByRole('button',{name:'Sign out',exact:true})).toBeVisible();
  await expect(page.getByRole('navigation',{name:'Site',exact:true}).getByRole('link')).toHaveCount(4);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.evaluate(()=>{(window as unknown as {changeBadgeViewer:(role:string)=>void}).changeBadgeViewer('member')});await expect(badge).toHaveCount(0);
 }
});
test('zero drafts shows nothing in both bars',async({page})=>{
 for(const floating of [false,true]){const calls=await mount(page,'owner',0,floating);await expect.poll(calls).toBeGreaterThan(0);await expect(page.locator('.site-review-badge')).toHaveCount(0);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
});
test('visitors and non-owners never show or request the badge',async({page})=>{
 for(const role of ['anonymous','member'])for(const floating of [false,true]){const calls=await mount(page,role,2,floating);await expect(page.getByRole('combobox',{name:'Colour mode'})).toBeVisible();await expect(page.locator('.site-review-badge')).toHaveCount(0);expect(calls()).toBe(0);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
});

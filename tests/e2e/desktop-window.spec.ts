import {test,expect} from '@playwright/test';
import {build} from 'esbuild';
let bundle='';
test.beforeAll(async()=>{
 const out=await build({stdin:{contents:`
 import React from 'react';import {createRoot} from 'react-dom/client';import {Desktop} from './components/desktop';
 const long=location.search.includes('long');
 const app={id:'notes',name:'Notes',kind:'internal',url:'/desktop?app=notes',visibility:'signed_in',icon:'notes',screenshots:[],tags:[],description:'',sort:0,locked:false};
 createRoot(document.getElementById('window-test')).render(<Desktop apps={[app]} initialApp="notes" signedIn content={<div style={{padding:20}}>{long?Array.from({length:100},(_,i)=><p key={i}>Example content row {i+1}</p>):<p>Short content</p>}</div>} />);
 `,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,format:'iife',platform:'browser',jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},plugins:[{name:'desktop-fixture',setup(b){
 b.onResolve({filter:/^next\/link$/},()=>({path:'link',namespace:'link-fixture'}));b.onLoad({filter:/.*/,namespace:'link-fixture'},()=>({resolveDir:process.cwd(),contents:'import React from "react";export default function Link({prefetch,children,...props}){return React.createElement("a",props,children)}'}));
 b.onResolve({filter:/app\/actions\/desktop$/},()=>({path:'desktop',namespace:'desktop-fixture'}));b.onLoad({filter:/.*/,namespace:'desktop-fixture'},()=>({contents:'export async function logDesktopOpen(){};export async function getDesktopApps(){return []}'}));
 }}]});bundle=out.outputFiles[0].text;
});
test('short and long app windows reach the desktop bottom; long content scrolls inside',async({page},info)=>{
 for(const kind of ['short','long']){
  await page.goto('/privacy?'+kind);
  await page.addStyleTag({content:'body > :not(#window-test) {display:none!important}'});
  await page.evaluate(()=>{const root=document.createElement('div');root.id='window-test';document.body.append(root);});
  await page.route('**/__window_test.js',r=>r.fulfill({contentType:'text/javascript',body:bundle}));
  await page.addScriptTag({url:'/__window_test.js'});
  const win=page.getByRole('region',{name:'Notes',exact:true});await expect(win).toBeVisible();
  const box=await win.boundingBox();expect(Math.abs(box!.y+box!.height-page.viewportSize()!.height)).toBeLessThanOrEqual(2);
  expect(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight+1)).toBe(true);
  if(kind==='long'){
   const scroll=page.locator('#window-test .desktop-app-content');expect(await scroll.evaluate(el=>el.scrollHeight>el.clientHeight)).toBe(true);
   await scroll.evaluate(el=>{el.scrollTop=el.scrollHeight;});await expect(page.getByText('Example content row 100',{exact:true})).toBeVisible();
  }
  if(info.project.name==='desktop'){
   await page.getByRole('button',{name:'Maximise window'}).click();const full=await win.boundingBox();expect(Math.abs(full!.y+full!.height-page.viewportSize()!.height)).toBeLessThanOrEqual(2);
   await page.getByRole('button',{name:'Restore window'}).click();
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
});

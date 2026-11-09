import {test,expect} from '@playwright/test';
import {build} from 'esbuild';
let bundle='';
test.beforeAll(async()=>{
 const output=await build({stdin:{contents:`import React from 'react';import {createRoot} from 'react-dom/client';import {ResourceCatalog} from './components/resource-catalog';createRoot(document.getElementById('desktop-fixture')).render(<ResourceCatalog />);`,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,format:'iife',platform:'browser',jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},plugins:[{name:'desktop-fixture',setup(b){
 b.onResolve({filter:/desktop-apps-provider$/},()=>({path:'apps',namespace:'fixture'}));
 b.onResolve({filter:/viewer-provider$/},()=>({path:'viewer',namespace:'fixture'}));
 b.onResolve({filter:/app\/actions\/desktop$/},()=>({path:'actions',namespace:'fixture'}));
 b.onResolve({filter:/theme-toggle$/},()=>({path:'theme',namespace:'fixture'}));
 b.onResolve({filter:/sign-in-button$/},()=>({path:'signin',namespace:'fixture'}));
 b.onResolve({filter:/^next\/link$/},()=>({path:'link',namespace:'fixture'}));
 b.onLoad({filter:/.*/,namespace:'fixture'},args=>({resolveDir:process.cwd(),contents:args.path==='apps'?`import {useState,useEffect} from 'react';const seed=()=>{};export function useDesktopApps(){const [loading,setLoading]=useState(true);useEffect(()=>{window.finishAppDiscovery=()=>setLoading(false)},[]);return {loading,loadError:false,seed,apps:loading?[]:[{id:'notes',name:'Notes',kind:'internal',icon:'notes',url:'/notes'},{id:'settings',name:'Settings',kind:'internal',icon:'gear',url:'/settings'}]}}`:args.path==='viewer'?`export const useViewer=()=>({viewer:{status:'owner',id:'fixture'},configured:false,editing:false,setEditing(){}});`:args.path==='actions'?`export async function logDesktopOpen(){}`:args.path==='theme'?`export const ThemeToggle=()=>null;`:args.path==='signin'?`export const SignInButton=()=>null;`:`import React from 'react';export default function Link({prefetch,children,...props}){return React.createElement('a',props,children)}`}));
 }}]});bundle=output.outputFiles[0].text;
});
test('resources unlock only the apps returned by access discovery',async({page})=>{
 await page.route('**/__desktop_fixture.js',r=>r.fulfill({contentType:'text/javascript',body:bundle}));
 await page.goto('/resources');
 await page.addStyleTag({content:'body>:not(#desktop-fixture){display:none!important}'});
 await page.evaluate(()=>{const root=document.createElement('div');root.id='desktop-fixture';document.body.append(root)});
 await page.addScriptTag({url:'/__desktop_fixture.js'});
 await expect(page.getByText('Checking access…',{exact:true})).toHaveCount(3);
 await page.evaluate(()=>{(window as unknown as {finishAppDiscovery():void}).finishAppDiscovery()});
 await expect(page.getByRole('link',{name:'Open Notes',exact:true})).toBeVisible();
 await expect(page.getByRole('link',{name:'Open Practice',exact:true})).toHaveCount(0);
 await expect(page.getByText('Membership access required',{exact:true})).toHaveCount(2);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

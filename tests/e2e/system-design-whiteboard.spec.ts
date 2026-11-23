import {test,expect,type Page} from '@playwright/test';
import {build} from 'esbuild';
import {readFileSync} from 'node:fs';
/**
 * S2 browser checks: the real whiteboard workspace (with the real Excalidraw canvas) mounted over a static page, as in the S1 spec.
 * Desktop checks the canvas, template frames, library drag, autosave + reload and reset; 390px checks the "Best on a larger screen" note.
 * Fonts are requested from /excalidraw-assets, which `npm run dev`/`build` copies into public/ (scripts/copy-excalidraw.mjs).
 */
let js='',css='';
const question={id:'00000000-0000-4000-8000-000000000e11',slug:'fixture',title:'Fixture Design',solution:'## Overview\nA fixture service stores short notes.\n\n## Requirements\n- Users can add a note\n- Users can read a note'};
const FRAMES='Functional Requirements|Non-Functional Requirements|Core Entities|API Design|High-Level Design';
test.beforeAll(async()=>{
 const stub=(contents:string)=>({contents,resolveDir:process.cwd(),loader:'tsx' as const});
 const out=await build({stdin:{contents:`import React from 'react';import {createRoot} from 'react-dom/client';import {SystemDesignWhiteboard} from './components/interview/sd-whiteboard';createRoot(document.getElementById('wb-fixture')).render(<div className="iv-shell" style={{display:'block',height:'100vh'}}><section className="iv-workspace" style={{height:'100vh'}}><main><SystemDesignWhiteboard question={window.__question}/></main></section></div>);`,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,outdir:'out',format:'iife',jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},loader:{'.css':'css','.woff2':'dataurl','.woff':'dataurl','.ttf':'dataurl'},plugins:[{name:'wb-fixtures',setup(b){
  b.onResolve({filter:/^next\/link$/},()=>({path:'link',namespace:'fx'}));b.onResolve({filter:/^next\/dynamic$/},()=>({path:'dynamic',namespace:'fx'}));
  b.onResolve({filter:/^@\/components\/viewer-provider$/},()=>({path:'viewer',namespace:'fx'}));b.onResolve({filter:/^@\/app\/actions\/system-design-whiteboard$/},()=>({path:'actions',namespace:'fx'}));
  b.onLoad({filter:/^link$/,namespace:'fx'},()=>stub('import React from "react";export default function Link({children,prefetch,scroll,...props}){return <a {...props}>{children}</a>}'));
  // next/dynamic with ssr:false is a lazy client component; esbuild inlines the import (no code splitting in this fixture).
  b.onLoad({filter:/^dynamic$/,namespace:'fx'},()=>stub('import React from "react";export default function dynamic(load,opts){const L=React.lazy(load);return props=>React.createElement(React.Suspense,{fallback:opts&&opts.loading?opts.loading():null},React.createElement(L,props));}'));
  b.onLoad({filter:/^viewer$/,namespace:'fx'},()=>stub('export const useViewer=()=>({viewer:{status:"visitor"},configured:true});'));
  b.onLoad({filter:/^actions$/,namespace:'fx'},()=>stub('const no=async()=>({ok:false,message:"signed out"});export const loadSdWhiteboard=no,saveSdWhiteboard=no,resetSdWhiteboard=no;'));
 }}]});
 js=out.outputFiles.filter(f=>f.path.endsWith('.js')).map(f=>f.text).join('\n');css=out.outputFiles.filter(f=>f.path.endsWith('.css')).map(f=>f.text).join('\n');
});
const fits=async(page:Page)=>expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
async function mount(page:Page,clear=false){
 await page.goto('/interview/companies');
 if(clear)await page.evaluate(()=>localStorage.clear());
 await page.addStyleTag({content:`body>:not(#wb-fixture){display:none!important}body{margin:0;background:#101720}${readFileSync('app/interview/interview.css','utf8')}${readFileSync('app/interview/system-design.css','utf8')}${css}`});
 await page.evaluate(q=>{(window as unknown as {__question:unknown}).__question=q;const root=document.createElement('div');root.id='wb-fixture';document.body.append(root);},question);
 await page.addScriptTag({content:js});
}
const canvas=(page:Page)=>page.getByTestId('sd-board-canvas');
const ready=async(page:Page)=>{await expect(canvas(page)).toHaveAttribute('data-ready','true',{timeout:30_000});await expect(canvas(page)).toHaveAttribute('data-frames',FRAMES);};
const elements=async(page:Page)=>Number(await canvas(page).getAttribute('data-elements'));

test('S2 desktop: canvas loads with the template, tools, library search + drag, autosave and reload, reset',async({page},info)=>{
 test.skip(info.project.name!=='desktop','desktop workspace');
 await mount(page,true);await ready(page);
 await expect(page.getByRole('heading',{level:1,name:'Fixture Design'})).toBeVisible();await expect(page.getByRole('timer')).toHaveText('00:00');
 await expect(page.locator('.iv-sd-board-panel')).toBeVisible();
 // tools: the ticket's set is present; embeds, laser, image and text-to-diagram are not offered
 for(const t of ['lock','hand','selection','rectangle','diamond','ellipse','arrow','line','text'])await expect(page.getByTestId('toolbar-'+t)).toBeVisible();
 for(const t of ['embeddable','laser','image'])await expect(page.getByTestId('toolbar-'+t)).toHaveCount(0).catch(()=>expect(page.getByTestId('toolbar-'+t)).toBeHidden());
 await expect(page.getByText(/text to diagram|Mermaid/i)).toHaveCount(0);
 await expect(page.getByRole('button',{name:/live collaboration|share/i})).toHaveCount(0);
 // draggable divider
 const before=(await page.locator('.iv-sd-board-panel').boundingBox())!.width;
 const sep=(await page.getByRole('separator').boundingBox())!;await page.mouse.move(sep.x+5,sep.y+200);await page.mouse.down();await page.mouse.move(sep.x+105,sep.y+200,{steps:5});await page.mouse.up();
 expect((await page.locator('.iv-sd-board-panel').boundingBox())!.width).toBeGreaterThan(before+60);
 // timer
 await page.getByRole('button',{name:'Start'}).click();await expect(page.getByRole('timer')).not.toHaveText('00:00',{timeout:4000});await page.getByRole('button',{name:'Pause'}).click();await page.getByRole('button',{name:'Reset timer'}).click();await expect(page.getByRole('timer')).toHaveText('00:00');
 // library: own blocks, searchable, drag onto the canvas
 await page.getByRole('searchbox',{name:'Search components'}).fill('queue');await page.getByRole('button',{name:'Open library'}).click();
 const units=page.locator('.library-unit');await expect(units).toHaveCount(1);
 const start=await elements(page);const box=(await canvas(page).boundingBox())!;const item=(await units.first().boundingBox())!;
 await page.mouse.move(item.x+item.width/2,item.y+item.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2,box.y+box.height/2,{steps:12});await page.mouse.up();
 await expect.poll(()=>elements(page)).toBeGreaterThan(start);
 await page.getByRole('searchbox',{name:'Search components'}).fill('');await expect(units).toHaveCount(12);
 // autosave to localStorage (debounced) and survive a reload
 await expect.poll(()=>page.evaluate(()=>localStorage.getItem('jb.sd.board.v1.fixture')),{timeout:6000}).not.toBeNull();await expect(page.getByText('Saved')).toBeVisible();
 const saved=await elements(page);
 await mount(page);await ready(page);expect(await elements(page)).toBe(saved);
 // reset restores the template after a confirmation
 await page.getByRole('button',{name:'Reset board'}).click();await page.getByRole('button',{name:'Cancel'}).click();expect(await elements(page)).toBe(saved);
 await page.getByRole('button',{name:'Reset board'}).click();await page.getByRole('button',{name:'Reset',exact:true}).click();
 await expect.poll(()=>elements(page)).toBeLessThan(saved);await expect(canvas(page)).toHaveAttribute('data-frames',FRAMES);expect(await page.evaluate(()=>localStorage.getItem('jb.sd.board.v1.fixture'))).toBeNull();
 await page.screenshot({path:info.outputPath('system-design-whiteboard.png')});
});
test('S2 phone (390px): friendly note with a read-only template preview, then continue anyway',async({page},info)=>{
 test.skip(info.project.name!=='phone','phone fallback');
 await mount(page,true);
 await expect(page.getByRole('heading',{name:'Best on a larger screen'})).toBeVisible();await expect(page.getByTestId('sd-board-phone')).toBeVisible();
 await expect(page.getByRole('img',{name:'Preview of the starting board'})).toBeVisible();await expect(page.getByTestId('sd-board-canvas')).toHaveCount(0);
 await fits(page);await page.screenshot({path:info.outputPath('system-design-whiteboard-phone.png')});
 await page.getByRole('button',{name:'Continue anyway'}).click();await ready(page);await expect(page.locator('.iv-sd-board-panel')).toBeHidden();await fits(page);
});

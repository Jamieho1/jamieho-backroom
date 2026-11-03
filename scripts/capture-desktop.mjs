/** Local visual review only. Never visits a deployed site or touches user data. */
import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
const address=new URL(process.argv[2]||'http://127.0.0.1:3100');
if(!['localhost','127.0.0.1','[::1]'].includes(address.hostname))throw Error('Only localhost previews are allowed.');
const out=path.resolve(process.argv[3]||'/private/tmp/jamie-desktop-preview');await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({...(process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH}:{}),args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const results=[];
try{
 for(const [width,height]of [[1280,800],[1920,1000],[390,844]]){
  for(const theme of ['light','dark']){
   const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,colorScheme:theme});const page=await context.newPage();const errors=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|Shader|WebGLProgram/.test(m.text()))errors.push(m.text())});
   await page.goto(address.href);await page.locator('.desktop-backdrop[data-scene="ready"]').waitFor({timeout:30000});await page.waitForTimeout(500);
   const state=await page.evaluate(()=>({overflowX:document.documentElement.scrollWidth>innerWidth,overflowY:document.documentElement.scrollHeight>innerHeight+1,scene:document.querySelector('.desktop-backdrop')?.getAttribute('data-scene'),time:document.querySelector('.desktop-canvas')?.getAttribute('data-scene-time'),frame:document.querySelector('.desktop-art-frame')?.getBoundingClientRect().toJSON(),copy:document.querySelector('.desktop-introduction')?.getBoundingClientRect().toJSON()}));
   if(errors.length||state.overflowX||state.overflowY)throw Error(JSON.stringify({width,height,theme,state,errors}));
   const file=`${theme}-${width}.png`;await page.screenshot({path:path.join(out,file)});results.push({width,height,theme,file,...state,errors});await context.close();console.log('Captured '+file);
  }
 }
 await fs.writeFile(path.join(out,'review.json'),JSON.stringify(results,null,2));
}finally{await browser.close()}

import {test,expect,type Page} from '@playwright/test';
import {build} from 'esbuild';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
let bundle='',staticHtml='';
const css=readFileSync('app/journey.css','utf8');
test.beforeAll(async()=>{
 const out=await build({stdin:{contents:`import React from 'react';import {createRoot} from 'react-dom/client';import {AboutConstellation} from './components/journey/about-constellation';const count=Number(new URLSearchParams(location.search).get('count')||12);const photos=Array.from({length:count},(_,i)=>({id:String(i),path:'fixture-'+i+'.png',alt:'Synthetic photo '+i,caption:'Caption '+i,sort:i,centre:i===2,public:true}));createRoot(document.getElementById('constellation-fixture')).render(<div className="journey"><div className="journey-section-light" style={{position:'relative',height:'100svh'}}><AboutConstellation panel={{id:'about',from:0,to:1,title:'From Research to Production',body:'A short synthetic paragraph about learning, building and sharing.'}} photos={photos} base="/fixture-media"/></div></div>);`,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,format:'iife',platform:'browser',jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},plugins:[{name:'constellation-next-link',setup(b){b.onResolve({filter:/^next\/link$/},()=>({path:'link',namespace:'constellation-link'}));b.onLoad({filter:/.*/,namespace:'constellation-link'},()=>({resolveDir:process.cwd(),contents:'import React from "react";export default function Link({prefetch,children,...props}){return React.createElement("a",props,children)}'}));}}]});bundle=out.outputFiles[0].text;
 const ssr=await build({stdin:{contents:`import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';import {AboutConstellation} from './components/journey/about-constellation';const photos=Array.from({length:4},(_,i)=>({id:String(i),path:'fixture-'+i+'.png',alt:'Static photo '+i,caption:'Static caption '+i,sort:i,centre:i===1,public:true}));export const html=renderToStaticMarkup(<AboutConstellation panel={{id:'about',from:0,to:1,title:'From Research to Production',body:'A synthetic first paragraph.'}} photos={photos} base="/fixture-media" still/>);`,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,format:'cjs',platform:'node',jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},plugins:[{name:'static-next-link',setup(b){b.onResolve({filter:/^next\/link$/},()=>({path:'link',namespace:'static-link'}));b.onLoad({filter:/.*/,namespace:'static-link'},()=>({resolveDir:process.cwd(),contents:'import React from "react";export default function Link({prefetch,children,...props}){return React.createElement("a",props,children)}'}));}}]});
 const module={exports:{}};new Function('require','module','exports',ssr.outputFiles[0].text)(createRequire(process.cwd()+'/package.json'),module,module.exports);staticHtml=(module.exports as {html:string}).html;
});
async function mount(page:Page,count=12){
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.route('**/fixture-media/*.png',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="240" height="300"><rect width="240" height="300" fill="#a6b8bf"/><path d="M0 220 100 120 240 250V300H0" fill="#57746c"/><circle cx="180" cy="65" r="28" fill="#f3d49a"/></svg>'}));
 await page.goto('/privacy?count='+count);await page.addStyleTag({content:css+'body > :not(#constellation-fixture){display:none!important}'});
 await page.evaluate(()=>{const root=document.createElement('div');root.id='constellation-fixture';document.body.append(root)});
 await page.route('**/__constellation.js',r=>r.fulfill({contentType:'text/javascript',body:bundle}));await page.addScriptTag({url:'/__constellation.js'});
 expect(errors).toEqual([]);await expect(page.getByRole('heading',{name:/from research to production/i})).toBeVisible();
}
test('constellation captions, story link and keyboard targets work without page overflow',async({page},info)=>{
 await mount(page);
 await page.screenshot({path:info.outputPath('constellation.png')});
 const root=page.locator('.about-constellation'),figures=root.locator('figure');
 await expect(figures).toHaveCount(12);await expect(figures.first()).toHaveAttribute('aria-label','Synthetic photo 2');await expect(root.locator('h2 em')).toHaveText('to');
 await expect(root.locator('svg path')).toHaveCount(11);
 if(info.project.name==='desktop'){
  const caption=figures.first().locator('figcaption');await expect(caption).toHaveCSS('opacity','0');await figures.first().hover();await expect(caption).toHaveCSS('opacity','1');
 }else{
  for(const figure of await figures.all())await expect(figure.locator('figcaption')).toHaveCSS('opacity','1');
  const orbit=root.locator('.about-constellation-orbit');expect(await orbit.evaluate(el=>el.scrollWidth>el.clientWidth)).toBe(true);await orbit.evaluate(el=>el.scrollLeft=300);expect(await orbit.evaluate(el=>el.scrollLeft)).toBeGreaterThan(0);
 }
 const story=page.getByRole('link',{name:'Read my story',exact:true});await expect(story).toHaveAttribute('href','/about');await story.focus();
 for(let i=0;i<12;i++){await page.keyboard.press('Tab');await expect(figures.nth(i)).toBeFocused();await expect(figures.nth(i).locator('figcaption')).toHaveCSS('opacity','1');}
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 const requests:string[]=[];page.on('request',r=>{if(new URL(r.url()).pathname==='/about')requests.push(r.url())});await story.click();await expect(page).toHaveURL(/\/#pivot$/);expect(requests.length).toBeGreaterThan(0);
});
test('sparse counts keep a centre plus short row and cap larger collections',async({page})=>{
 for(const count of [1,4,5,13]){await mount(page,count);await expect(page.locator('.about-photo')).toHaveCount(Math.min(count,12));await expect(page.locator('.about-constellation-board')).toHaveAttribute('data-layout',count<2?'single':count<5?'simple':'constellation');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
});
test('reduced motion shows finished photos and captions with no pointer drift',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await mount(page,5);
 const board=page.locator('.about-constellation-motion');const before=await board.evaluate(el=>getComputedStyle(el).transform);await page.locator('.about-photo').first().hover();
 await expect(page.locator('.about-photo figcaption').first()).toHaveCSS('opacity','1');expect(await board.evaluate(el=>getComputedStyle(el).transform)).toBe(before);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('server-rendered photos, captions and story link work with JavaScript disabled',async({browser},info)=>{
 const context=await browser.newContext({javaScriptEnabled:false,viewport:info.project.use.viewport});
 try{
  await context.route('**/fixture-media/*.png',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="240" height="300"><rect width="240" height="300" fill="#a6b8bf"/></svg>'}));
  const page=await context.newPage();await page.setContent(`<base href="http://127.0.0.1:3100/"><style>${css}</style><div class="journey"><div class="journey-section-light">${staticHtml}</div></div>`);
  const figures=page.locator('.about-photo');await expect(figures).toHaveCount(4);await expect(figures.first().getByRole('img')).toHaveAttribute('alt','Static photo 1');
  await expect(page.getByRole('link',{name:'Read my story'})).toHaveAttribute('href','/about');
  for(const figure of await figures.all()){await figure.focus();await expect(figure).toBeFocused();await expect(figure.locator('figcaption')).toBeVisible();}
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }finally{await context.close();}
});

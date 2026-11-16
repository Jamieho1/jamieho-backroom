import {test,expect,type Page} from '@playwright/test';
import {build,type Plugin} from 'esbuild';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
let bundle='',staticHtml='';
const css=readFileSync('app/journey.css','utf8');
const fixture=`const stops=Array.from({length:3},(_,i)=>({id:'stop-'+i,title:'Synthetic role '+i,org:'Example '+i,dates:i===2?'2024 – Present':String(2018+i),icon:['graduation-cap','neural-network','streams-plug'][i],present:i===2,draftChanged:i===1,bullets:Array.from({length:3},(_,j)=>({text:'Synthetic public proof '+i+'.'+j+(typeof location!=='undefined'&&new URLSearchParams(location.search).has('long')?' Synthetic detail with engineering evidence.'.repeat(20):''),draftChanged:i===1&&j===0}))})).concat([{id:'projects',title:'Projects',org:'',dates:'',icon:'rocket',present:false,project:true,bullets:[]}]);`;
const plugins:Plugin[]=[{name:'curve-isolation',setup(b){
 b.onResolve({filter:/^next\/link$/},()=>({path:'link',namespace:'fixture'}));
 b.onResolve({filter:/^\.\/navigation$/},()=>({path:'nav',namespace:'fixture'}));
 b.onResolve({filter:/^\.\/screen-contact$/},()=>({path:'contact',namespace:'fixture'}));
 b.onResolve({filter:/^\.\/(motes|line-shape)$/},()=>({path:'decor',namespace:'fixture'}));
 b.onLoad({filter:/.*/,namespace:'fixture'},args=>({resolveDir:process.cwd(),contents:args.path==='link'?`import React from 'react';export default function Link({children,prefetch,...p}){return <a {...p}>{children}</a>}`:args.path==='nav'?`import React,{forwardRef} from 'react';export const JourneyNavigation=forwardRef(function Nav({items,onJump},ref){return <nav ref={ref} style={{position:'fixed',top:0,zIndex:100}}>{items.map(({c})=><button key={c.id} onClick={()=>onJump(c.id)}>{c.nav}</button>)}</nav>});`:args.path==='contact'?`import React,{forwardRef} from 'react';export const ScreenContact=forwardRef(()=>null);export const ContactContent=()=>null;`:`import React,{forwardRef} from 'react';export const Motes=forwardRef(()=>null);export const LineShape=forwardRef(()=>null);`,loader:'tsx'}));
}}];
test.beforeAll(async()=>{
 const out=await build({stdin:{contents:`import React from 'react';import {createRoot} from 'react-dom/client';import {Journey} from './components/journey/journey';${fixture}const chapters=[{id:'sky',kind:'section',tone:'light',scroll:.65,panels:[{id:'hero',title:'Synthetic homepage',from:0,to:1}]},{id:'experience',kind:'section',tone:'light',nav:'Experience',scroll:3.4,wipe:.12,experienceStops:stops},{id:'projects',kind:'section',tone:'dark',nav:'Work',scroll:1.6,panels:[{id:'work',title:'Synthetic Work',body:'Selected project details',from:0,to:1}]}];createRoot(document.getElementById('curve-fixture')).render(<Journey chapters={chapters} base="/fixture-media"/>);`,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,format:'iife',platform:'browser',jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},plugins});bundle=out.outputFiles[0].text;
 const ssr=await build({stdin:{contents:`import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';import {ExperienceCurve} from './components/journey/experience-curve';${fixture}export const html=renderToStaticMarkup(<ExperienceCurve stops={stops} still/>);`,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,format:'cjs',platform:'node',jsx:'automatic'});
 const module={exports:{}};new Function('require','module','exports',ssr.outputFiles[0].text)(createRequire(process.cwd()+'/package.json'),module,module.exports);staticHtml=(module.exports as {html:string}).html;
});
async function mount(page:Page,long=false){
 await page.route('**/fixture-media/**',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="941" height="1672"><rect width="941" height="1672" fill="#c2d3dc"/></svg>'}));
 await page.goto('/privacy'+(long?'?long=1':''));await page.addStyleTag({content:css+'body > :not(#curve-fixture){display:none!important} body{margin:0}'});
 await page.evaluate(()=>{const root=document.createElement('div');root.id='curve-fixture';document.body.append(root)});
 await page.route('**/__curve.js',r=>r.fulfill({contentType:'text/javascript',body:bundle}));await page.addScriptTag({url:'/__curve.js'});
 await expect(page.locator('.journey-live')).toBeAttached();await expect(page.locator('.journey-track')).toBeVisible();
}
async function position(page:Page,local:number){await page.evaluate(p=>scrollTo(0,(.65+3.4*p)*innerHeight),local);}
test('desktop line reverses and each keyboard stop reveals its card, Projects reaches Work',async({page},info)=>{
 test.skip(info.project.name!=='desktop','desktop holds the curve');await mount(page);await position(page,.68);
 const curve=page.locator('[data-chapter="experience"] .experience-curve');await expect(curve).toBeVisible();await expect(curve).toHaveAttribute('data-current','2');
 const line=curve.locator('.experience-path-drawn');await expect.poll(()=>line.evaluate(el=>Number((el as SVGElement).style.strokeDashoffset))).toBeCloseTo(1/3,1);
 await position(page,.44);await expect(curve).toHaveAttribute('data-current','1');await expect.poll(()=>line.evaluate(el=>Number((el as SVGElement).style.strokeDashoffset))).toBeCloseTo(2/3,1);
 const top=await curve.boundingBox();await position(page,.68);await expect(curve).toHaveAttribute('data-current','2');expect((await curve.boundingBox())!.y).toBeCloseTo(top!.y,0);
 const buttons=curve.getByRole('button');await buttons.first().focus();
 for(let i=0;i<4;i++){
  await expect(buttons.nth(i)).toBeFocused();await expect(curve).toHaveAttribute('data-current',String(i));
  const card=curve.locator('.experience-card:visible');await expect(card).toHaveCount(1);await expect(card.getByRole('heading')).toHaveText(i===3?'Projects':'Synthetic role '+i);
  if(i<3){await expect(card.locator('li')).toHaveCount(3);await page.keyboard.press('Tab');}
 }
 await expect(curve.locator('[data-present="true"]')).toHaveCount(1);await page.keyboard.press('Tab');await expect(curve.getByRole('link',{name:'See the work ↓'})).toBeFocused();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:info.outputPath('experience-desktop.png')});
 await curve.getByRole('link',{name:'See the work ↓'}).click();await expect(page.locator('[data-chapter="projects"]').getByRole('heading',{name:'Synthetic Work'})).toBeVisible();
});
test('phone curve travels with the document and every card stays readable without overflow',async({page},info)=>{
 test.skip(info.project.name!=='phone','phone uses document flow');await mount(page);
 const curve=page.locator('.journey-phone-experience .experience-curve');await expect(curve).toBeAttached();
 await page.evaluate(()=>scrollTo(0,.65*innerHeight+1));await expect(curve).toHaveAttribute('data-animated','false');
 const y=(await curve.boundingBox())!.y;await page.evaluate(()=>scrollBy(0,180));expect((await curve.boundingBox())!.y).toBeCloseTo(y-180,0);
 for(const card of await curve.locator('.experience-card').all()){await card.scrollIntoViewIfNeeded();await expect(card).toBeVisible();expect(await card.evaluate(el=>getComputedStyle(el).color)).not.toBe('rgba(0, 0, 0, 0)');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
 const buttons=curve.getByRole('button');for(const b of await buttons.all()){await b.focus();await expect(b).toBeFocused()}
 await expect(curve.locator('.experience-mobile-segment')).toHaveCount(3);await page.screenshot({path:info.outputPath('experience-phone.png')});await curve.getByRole('link',{name:'See the work ↓'}).click();await expect(page.locator('[data-chapter="projects"]').getByRole('heading',{name:'Synthetic Work'})).toBeVisible();
});
test('reduced motion keeps the complete line and every card visible',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/privacy');await page.addStyleTag({content:css+'body > :not(#curve-fixture){display:none!important}'});
 await page.evaluate(html=>{const root=document.createElement('div');root.id='curve-fixture';root.className='journey journey-section-light';root.innerHTML=html;document.body.append(root)},staticHtml);
 await expect(page.locator('.experience-card')).toHaveCount(4);for(const card of await page.locator('.experience-card').all())await expect(card).toBeVisible();await expect(page.locator('.experience-path-drawn')).toHaveCSS('stroke-dashoffset','0px');const mascot=page.locator('.experience-mascot');const transform=await mascot.evaluate(el=>getComputedStyle(el).transform);await page.mouse.wheel(0,300);expect(await mascot.evaluate(el=>getComputedStyle(el).transform)).toBe(transform);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('no JavaScript leaves finished cards, line and native Work link usable',async({browser},info)=>{
 const context=await browser.newContext({javaScriptEnabled:false,viewport:info.project.use.viewport});try{
  const page=await context.newPage();await page.setContent(`<style>${css}</style><div class="journey journey-section-light">${staticHtml}<section id="projects"><h2>Work destination</h2></section></div>`);
  for(const button of await page.getByRole('button').all()){await button.focus();await expect(button).toBeFocused()}
  for(const card of await page.locator('.experience-card').all())await expect(card).toBeVisible();await page.getByRole('link',{name:'See the work ↓'}).click();await expect(page).toHaveURL(/#projects$/);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }finally{await context.close();}
});

test('mascot follows every reached stop in both directions and backdrop drift is reversible',async({page},info)=>{
 test.skip(info.project.name!=='desktop','desktop moving layers');await mount(page);
 const curve=page.locator('[data-chapter="experience"] .experience-curve');
 for(const i of [0,1,2,3,2,1,0]){
  await position(page,.2+i*.24);await expect(curve).toHaveAttribute('data-current',String(i));
  await expect.poll(async()=>curve.evaluate((el,index)=>{
   const sprite=el.querySelector('.experience-mascot')!.getBoundingClientRect(),ring=el.querySelectorAll('.experience-stop-ring')[index].getBoundingClientRect();
   return Math.max(Math.abs(sprite.x+sprite.width/2-(ring.x+ring.width/2)),Math.abs(sprite.bottom-(ring.y+ring.height/2-44)));
  },i)).toBeLessThan(2);
 }
 const background=curve.locator('.experience-art-layer img');const first=await background.evaluate(el=>getComputedStyle(el).transform);await position(page,.92);await expect(curve).toHaveAttribute('data-current','3');expect(await background.evaluate(el=>getComputedStyle(el).transform)).not.toBe(first);
 await position(page,.2);await expect(curve).toHaveAttribute('data-current','0');await expect.poll(()=>background.evaluate(el=>getComputedStyle(el).transform)).toBe(first);
 await expect(curve.locator('.experience-mascot img')).toHaveAttribute('src',/experience-mascot.webp\?v=/);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:info.outputPath('experience-art-desktop.png')});
});
test('phone downloads only the portrait Experience still and no moving layers or clips',async({page},info)=>{
 test.skip(info.project.name!=='phone','phone asset budget');const requests:string[]=[];page.on('request',req=>{if(/experience-.*\.webp/.test(req.url()))requests.push(new URL(req.url()).pathname.split('/').pop()!)});await mount(page);
 const curve=page.locator('.journey-phone-experience .experience-curve');await curve.locator('.experience-art-layer').scrollIntoViewIfNeeded();
 await expect.poll(()=>curve.locator('.experience-art-layer img').evaluate((el:HTMLImageElement)=>el.currentSrc)).toMatch(/experience-phone.webp\?v=/);
 await expect(curve.locator('.experience-mascot')).toBeHidden();await expect(curve.locator('.experience-art-layer img')).toHaveCSS('transform','none');
 expect([...new Set(requests)]).toEqual(['experience-phone.webp']);await expect(page.locator('video[src]')).toHaveCount(0);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('long cards scroll without lifting Experience under navigation or uncovering its background',async({page},info)=>{
 test.skip(info.project.name!=='desktop','pinned desktop cards');await mount(page,true);await position(page,.21);
 const curve=page.locator('[data-chapter="experience"] .experience-curve');await expect(curve).toHaveAttribute('data-current','0');
 await expect(curve).toHaveAttribute('data-animated','true');const card=curve.locator('.experience-card:visible');
 await expect.poll(()=>card.evaluate(el=>el.scrollHeight-el.clientHeight)).toBeGreaterThan(100);
 const heading=curve.locator('.experience-heading');await expect.poll(async()=>(await heading.boundingBox())!.y).toBeCloseTo(112,0);const before=await heading.boundingBox(),background=await curve.locator('.experience-art-layer').boundingBox();
 await card.hover();await page.mouse.wheel(0,150);await expect.poll(()=>card.evaluate(el=>el.scrollTop)).toBeGreaterThan(0);
 expect((await heading.boundingBox())!.y).toBeCloseTo(before!.y,0);expect(await curve.evaluate(el=>el.scrollTop)).toBe(0);
 expect(before!.y).toBeGreaterThanOrEqual(100);expect(background!.y+background!.height).toBeGreaterThanOrEqual(page.viewportSize()!.height-1);
 await expect(heading.locator('h2')).toHaveCSS('color','rgb(21, 17, 12)');await expect(curve.locator('.experience-mascot')).toHaveCSS('height','88px');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

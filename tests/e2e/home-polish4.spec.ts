import {test,expect} from '@playwright/test';
import {build,type Plugin} from 'esbuild';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const css=readFileSync('app/journey.css','utf8');let bundle='',detailHtml='';
const plugins:Plugin[]=[{name:'polish-journey',setup(b){
 b.onResolve({filter:/^\.\/navigation$/},()=>({path:'nav',namespace:'polish'}));b.onResolve({filter:/^\.\/screen-contact$/},()=>({path:'contact',namespace:'polish'}));b.onResolve({filter:/^\.\/(motes|line-shape)$/},()=>({path:'decor',namespace:'polish'}));
 b.onLoad({filter:/.*/,namespace:'polish'},args=>({resolveDir:process.cwd(),loader:'tsx',contents:args.path==='nav'?`import React,{forwardRef} from 'react';export const JourneyNavigation=forwardRef(()=>null);`:args.path==='contact'?`import React,{forwardRef} from 'react';export const ScreenContact=forwardRef(()=>null);export const ContactContent=()=>null;`:`import React,{forwardRef} from 'react';export const Motes=forwardRef(()=>null);export const LineShape=forwardRef(()=>null);`}));
}}];
test.beforeAll(async()=>{const out=await build({stdin:{contents:`import React from 'react';import {createRoot} from 'react-dom/client';import {Journey} from './components/journey/journey';const shot=color=>'data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1200"><rect width="1600" height="1200" fill="'+color+'"/></svg>');const chapters=[{id:'sky',kind:'section',tone:'light',scroll:.65,panels:[{id:'hero',title:'Synthetic hello',from:0,to:1}]},{id:'projects',label:'Work',nav:'Work',kind:'section',tone:'dark',scroll:2.6,showcase:[{slug:'cyterly',name:'Cyterly AI',tagline:'Synthetic public screenshot fixture',tags:['AI'],href:'/projects/cyterly',shots:['/project-art/cyterly-action-plan-f356cf5e1908.webp']},{slug:'datakind-uk',name:'DataKind UK',tagline:'Synthetic carousel fixture',tags:['Volunteer'],href:'/projects/datakind-uk',shots:[shot('#5899b5'),shot('#ad7b57')]}]}];createRoot(document.getElementById('polish-fixture')).render(<Journey chapters={chapters} base="/fixture-media"/>);`,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,format:'iife',platform:'browser',jsx:'automatic',define:{'process.env':'{"NODE_ENV":"production"}'},plugins});bundle=out.outputFiles[0].text;
 const result=await build({stdin:{contents:`import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';import {ProjectDetail} from './components/portfolio/views';const p={id:'synthetic',slug:'cyterly',name:'Cyterly AI',tagline:'Synthetic project',body:'',tags:[],screenshots:['/project-art/cyterly-action-plan-f356cf5e1908.webp'],url:'',public:true,featured:true,sort:0,created_at:''};export const html=renderToStaticMarkup(<ProjectDetail p={p}/>);`,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,format:'cjs',platform:'node',jsx:'automatic',plugins:[{name:'detail-static',setup(b){b.onResolve({filter:/^next\/link$/},()=>({path:'link',namespace:'detail'}));b.onResolve({filter:/^\.\/manage-link$/},()=>({path:'manage',namespace:'detail'}));b.onLoad({filter:/.*/,namespace:'detail'},args=>({loader:'tsx',resolveDir:process.cwd(),contents:args.path==='link'?`import React from 'react';export default function Link({children,prefetch,...props}){return <a {...props}>{children}</a>}`:`export function ProjectManageLink(){return null}`}));}}]});
 const module={exports:{}};new Function('require','module','exports',result.outputFiles[0].text)(createRequire(process.cwd()+'/package.json'),module,module.exports);detailHtml=(module.exports as {html:string}).html;
});

async function mountWork(page:import('@playwright/test').Page){
 await page.goto('/privacy');await page.addStyleTag({content:css+'body > :not(#polish-fixture){display:none!important} body{margin:0}'});await page.evaluate(()=>{const el=document.createElement('div');el.id='polish-fixture';document.body.append(el)});await page.route('**/__polish.js',r=>r.fulfill({contentType:'text/javascript',body:bundle}));await page.addScriptTag({url:'/__polish.js'});await expect(page.locator('.journey-live')).toBeAttached();
}
async function workPosition(page:import('@playwright/test').Page,project:number,within:number){await page.evaluate(({project,within})=>scrollTo(0,(.65+.6+project+within)*innerHeight),{project,within});}
async function fits(carousel:import('@playwright/test').Locator){
 const track=carousel.locator('.screenshot-carousel-track'),img=track.locator('img').first();await expect(img).toBeVisible();await expect.poll(()=>img.evaluate((el:HTMLImageElement)=>el.naturalWidth)).toBeGreaterThan(0);
 const box=await track.boundingBox(),picture=await img.boundingBox();expect(Math.abs(box!.width-picture!.width)).toBeLessThan(1);expect(Math.abs(box!.height-picture!.height)).toBeLessThan(1);const ratio=await img.evaluate((el:HTMLImageElement)=>el.naturalWidth/el.naturalHeight);expect(box!.width/box!.height).toBeCloseTo(ratio,2);await expect(img).toHaveCSS('object-fit','cover');
}
async function lights(carousel:import('@playwright/test').Locator){const dots=carousel.locator('.browser-traffic-lights i');for(const [i,color] of ['rgb(255, 95, 87)','rgb(254, 188, 43)','rgb(40, 200, 64)'].entries())await expect(dots.nth(i)).toHaveCSS('background-color',color);}

test('Work scrubs DataKind screenshots down and up; dots seek the same clock',async({page},info)=>{
 test.skip(info.project.name!=='desktop','phone Work is natural document flow');await mountWork(page);
 const carousel=page.locator('[data-chapter="projects"]').getByRole('region',{name:'DataKind UK screenshots'}),track=carousel.locator('.screenshot-carousel-track');
 await workPosition(page,1,.12);await expect(carousel).toBeVisible();await expect.poll(()=>track.evaluate(el=>el.scrollLeft)).toBeLessThan(2);
 await workPosition(page,1,.88);await expect.poll(()=>track.evaluate(el=>el.scrollLeft/el.clientWidth)).toBeGreaterThan(.99);await expect(carousel.getByRole('button',{name:'Show DataKind UK screenshot 2'})).toHaveAttribute('aria-current','true');
 await workPosition(page,1,.12);await expect.poll(()=>track.evaluate(el=>el.scrollLeft)).toBeLessThan(2);await fits(carousel);await lights(carousel);
 await carousel.getByRole('button',{name:'Show DataKind UK screenshot 2'}).click();await expect.poll(()=>track.evaluate(el=>el.scrollLeft/el.clientWidth)).toBeGreaterThan(.99);await expect.poll(()=>page.evaluate(()=>scrollY/innerHeight)).toBeCloseTo(.65+.6+1+.88,2);
 await workPosition(page,0,.5);const cyterly=page.locator('[data-chapter="projects"]').getByRole('region',{name:'Cyterly AI screenshots'});await fits(cyterly);await lights(cyterly);expect((await cyterly.boundingBox())!.height).toBeLessThan(page.viewportSize()!.height*.67);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('phone Work flows naturally with swipeable image-sized frames and no scrub',async({page},info)=>{
 test.skip(info.project.name!=='phone','phone document flow');await mountWork(page);const work=page.locator('.journey-phone-work');await work.scrollIntoViewIfNeeded();
 for(const name of ['Cyterly AI','DataKind UK']){const carousel=work.getByRole('region',{name:name+' screenshots'});await carousel.scrollIntoViewIfNeeded();await fits(carousel);await lights(carousel);await expect(carousel).not.toHaveAttribute('data-scrub','true');}
 const carousel=work.getByRole('region',{name:'DataKind UK screenshots'}),track=carousel.locator('.screenshot-carousel-track');await track.hover();await page.mouse.wheel(650,0);await expect.poll(()=>track.evaluate(el=>el.scrollLeft/el.clientWidth)).toBeGreaterThan(.99);const before=(await work.boundingBox())!.y;await page.evaluate(()=>scrollBy(0,80));expect((await work.boundingBox())!.y).toBeCloseTo(before-80,0);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('reduced-motion Work keeps native rows and dots without scrubbing',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/privacy');await page.addStyleTag({content:css+'body > :not(#polish-fixture){display:none!important}'});await page.evaluate(()=>{const el=document.createElement('div');el.id='polish-fixture';document.body.append(el)});await page.route('**/__polish.js',r=>r.fulfill({contentType:'text/javascript',body:bundle}));await page.addScriptTag({url:'/__polish.js'});
 const carousel=page.locator('#projects').getByRole('region',{name:'DataKind UK screenshots'});await carousel.scrollIntoViewIfNeeded();await fits(carousel);await carousel.getByRole('button',{name:'Show DataKind UK screenshot 2'}).click();const track=carousel.locator('.screenshot-carousel-track');await expect.poll(()=>track.evaluate(el=>el.scrollLeft/el.clientWidth)).toBeGreaterThan(.99);await expect(carousel).not.toHaveAttribute('data-scrub','true');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('public brand icons, grouped navigation and PassLoop rail use the approved marks',async({page},info)=>{
 await page.goto('/');await expect(page.locator('.site-navigation:visible .site-navigation-logo img')).toHaveAttribute('src','/brand/jh-mark.svg');await expect(page.locator('link[rel="icon"][href*="icon.svg"]')).toHaveAttribute('href',/\/icon.svg/);await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('sizes','180x180');
 const nav=page.getByRole('navigation',{name:'Site',exact:true});await expect(nav.locator(':scope > details > summary')).toHaveText(['Journey','My story','Content']);
 for(const menu of ['my story','content']){const disclosure=nav.locator(`[data-menu="${menu}"]`);await disclosure.locator('summary').focus();await page.keyboard.press('Enter');await expect(disclosure).toHaveAttribute('open','');await page.keyboard.press('Escape');await expect(disclosure).not.toHaveAttribute('open','');if(info.project.name==='desktop'){await disclosure.locator('summary').evaluate(el=>(el as HTMLElement).blur());await disclosure.locator('summary').hover();await expect(disclosure).toHaveAttribute('open','');await page.locator('.site-navigation:visible .site-navigation-logo').hover();await expect(disclosure).not.toHaveAttribute('open','');}}
 await page.goto('/interview');await expect(page.locator('link[rel="icon"][href*="/interview/icon.svg"]').first()).toBeAttached();await expect(page.locator('link[rel="icon"][href*="jh-icon"]')).toHaveCount(0);
 if(info.project.name==='phone')await page.getByRole('button',{name:'Open interview menu'}).click();await expect(page.locator('.iv-brand-mark')).toBeVisible();await expect(page.locator('.iv-brand-wordmark')).toBeVisible();
 if(info.project.name==='desktop'){await page.getByRole('button',{name:'Collapse section rail'}).click();await expect(page.locator('.iv-brand-mark')).toBeVisible();await expect(page.locator('.iv-brand-wordmark')).toBeHidden();await expect(page.getByRole('link',{name:'PassLoop — home'})).toHaveAttribute('href','/');}
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});


test('project-detail browser frame fits its image and retains traffic lights in both themes and without JS',async({browser,baseURL},info)=>{
 const context=await browser.newContext({javaScriptEnabled:false,viewport:info.project.use.viewport});try{
  const page=await context.newPage();await page.goto(baseURL+'/privacy');await page.setContent(`<style>${readFileSync('app/globals.css','utf8')}${readFileSync('app/projects.css','utf8')}</style><main>${detailHtml}</main>`);
  const frame=page.getByRole('region',{name:'Cyterly AI screenshots'});await fits(frame);await lights(frame);await page.locator('html').evaluate(el=>el.setAttribute('data-theme','dark'));await lights(frame);expect((await frame.boundingBox())!.height).toBeLessThan(page.viewportSize()!.height*.73);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }finally{await context.close();}
});


test('traced logo layout preserves the full wordmark and separates collapsed controls',async({page},info)=>{
 await page.goto('/');const button=page.locator('.site-navigation:visible .site-navigation-logo'),mark=button.locator('img');const outer=await button.boundingBox(),image=await mark.boundingBox();expect(image!.width/(outer!.width-2)).toBeCloseTo(.7,1);expect(Math.abs(image!.x+image!.width/2-outer!.x-outer!.width/2)).toBeLessThan(1);expect(Math.abs(image!.y+image!.height/2-outer!.y-outer!.height/2)).toBeLessThan(1);expect(image!.width/image!.height).toBeCloseTo(412/220,1);
 await page.goto('/interview/dsa/practice');if(info.project.name==='phone'){await page.getByRole('button',{name:'Open interview menu'}).click();await expect.poll(async()=>(await page.locator('.iv-rail').boundingBox())!.x).toBeCloseTo(0,0);}
 const rail=await page.locator('.iv-rail').boundingBox(),brand=await page.locator('.iv-brand').boundingBox();
 for(const selector of ['.iv-brand-mark','.iv-brand-wordmark']){const img=page.locator(selector);await expect(img).toBeVisible();const box=await img.boundingBox();expect(box!.width).toBeGreaterThan(10);expect(box!.x).toBeGreaterThanOrEqual(brand!.x);expect(box!.x+box!.width).toBeLessThanOrEqual(brand!.x+brand!.width+1);expect(box!.x+box!.width).toBeLessThanOrEqual(rail!.x+rail!.width);}
 if(info.project.name==='desktop'){
  const collapse=await page.getByRole('button',{name:'Collapse section rail'}).boundingBox();expect(brand!.x+brand!.width+9).toBeLessThanOrEqual(collapse!.x);await page.getByRole('button',{name:'Collapse section rail'}).click();const icon=await page.locator('.iv-brand-mark').boundingBox(),expand=await page.getByRole('button',{name:'Expand section rail'}).boundingBox(),narrow=await page.locator('.iv-rail').boundingBox();expect(narrow!.width).toBe(92);expect(icon!.y+icon!.height+7).toBeLessThanOrEqual(expand!.y);expect(icon!.x).toBeGreaterThanOrEqual(narrow!.x);expect(icon!.x+icon!.width).toBeLessThanOrEqual(narrow!.x+narrow!.width);await page.getByRole('link',{name:'PassLoop — home'}).focus();await expect(page.getByRole('tooltip')).toHaveText('PassLoop — home');await page.reload();await expect(page.locator('.iv-shell')).toHaveAttribute('data-rail-collapsed','true');
 }else{const close=await page.getByRole('button',{name:'Close interview menu'}).boundingBox();expect(brand!.x+brand!.width).toBeLessThanOrEqual(close!.x);await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Open interview menu'})).toBeFocused();}
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:info.outputPath('traced-brand-layout.png')});
});

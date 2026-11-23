import {test,expect} from '@playwright/test';
import {build,type Plugin} from 'esbuild';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
let detailHtml='';
test.beforeAll(async()=>{
 const result=await build({stdin:{contents:`import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';import {ProjectCaseStudy} from './components/projects/case-study';const p={id:'synthetic',slug:'cyterly',name:'Cyterly AI',tagline:'Synthetic project',body:'',tags:[],screenshots:['/project-art/cyterly-action-plan-f356cf5e1908.webp'],url:'',public:true,featured:true,sort:0,created_at:''};export const html=renderToStaticMarkup(<ProjectCaseStudy project={p} index={1} total={1} next={null}/>);`,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,format:'cjs',platform:'node',jsx:'automatic',plugins:[{name:'detail-static',setup(b){b.onResolve({filter:/^next\/link$/},()=>({path:'link',namespace:'detail'}));b.onResolve({filter:/components\/portfolio\/manage-link$/},()=>({path:'manage',namespace:'detail'}));b.onLoad({filter:/.*/,namespace:'detail'},args=>({loader:'tsx',resolveDir:process.cwd(),contents:args.path==='link'?`import React from 'react';export default function Link({children,prefetch,...props}){return <a {...props}>{children}</a>}`:`export function ProjectManageLink(){return null}`}));}}]});
 const module={exports:{}};new Function('require','module','exports',result.outputFiles[0].text)(createRequire(process.cwd()+'/package.json'),module,module.exports);detailHtml=(module.exports as {html:string}).html;
});
async function fits(carousel:import('@playwright/test').Locator){
 const track=carousel.locator('.screenshot-carousel-track'),img=track.locator('img').first();await expect(img).toBeVisible();await expect.poll(()=>img.evaluate((el:HTMLImageElement)=>el.naturalWidth)).toBeGreaterThan(0);
 const box=await track.boundingBox(),picture=await img.boundingBox();expect(Math.abs(box!.width-picture!.width)).toBeLessThan(1);expect(Math.abs(box!.height-picture!.height)).toBeLessThan(1);const ratio=await img.evaluate((el:HTMLImageElement)=>el.naturalWidth/el.naturalHeight);expect(box!.width/box!.height).toBeCloseTo(ratio,2);await expect(img).toHaveCSS('object-fit','contain');
}
async function lights(carousel:import('@playwright/test').Locator){const dots=carousel.locator('.browser-traffic-lights i');for(const [i,color] of ['rgb(255, 95, 87)','rgb(254, 188, 43)','rgb(40, 200, 64)'].entries())await expect(dots.nth(i)).toHaveCSS('background-color',color);}

test('public brand icons, grouped navigation and PassLoop rail use the approved marks',async({page},info)=>{
 await page.goto('/');await expect(page.locator('.site-navigation:visible .site-navigation-logo img')).toHaveAttribute('src','/brand/jh-mark.svg');await expect(page.locator('link[rel="icon"][href*="icon.svg"]')).toHaveAttribute('href',/\/icon.svg/);await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('sizes','180x180');
 const nav=page.getByRole('navigation',{name:'Site',exact:true});await expect(nav.locator(':scope > details > summary')).toHaveText(['Journey','My story','Content']);
 for(const menu of ['my story','content']){const disclosure=nav.locator(`[data-menu="${menu}"]`);await disclosure.locator('summary').focus();await page.keyboard.press('Enter');await expect(disclosure).toHaveAttribute('open','');await page.keyboard.press('Escape');await expect(disclosure).not.toHaveAttribute('open','');if(info.project.name==='desktop'){await disclosure.locator('summary').evaluate(el=>(el as HTMLElement).blur());await disclosure.locator('summary').hover();await expect(disclosure).toHaveAttribute('open','');await page.locator('.site-navigation:visible .site-navigation-logo').hover();await expect(disclosure).not.toHaveAttribute('open','');}}
 await page.goto('/interview');await expect(page.locator('link[rel="icon"][href*="/interview/icon.svg"]').first()).toBeAttached();await expect(page.locator('link[rel="icon"][href*="jh-icon"]')).toHaveCount(0);
 if(info.project.name==='phone')await page.getByRole('button',{name:'Open interview menu'}).click();await expect(page.locator('.iv-brand-mark')).toBeVisible();await expect(page.locator('.iv-brand-wordmark')).toBeVisible();
 if(info.project.name==='desktop'){await page.getByRole('button',{name:'Collapse section rail'}).click();await expect(page.locator('.iv-brand')).toBeHidden();await expect(page.locator('.iv-brand-mark')).toBeHidden();await expect(page.getByRole('button',{name:'Expand section rail'})).toBeVisible();}
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});


test('project-detail browser frame fits its image and retains traffic lights in both themes and without JS',async({browser,baseURL},info)=>{
 const context=await browser.newContext({javaScriptEnabled:false,viewport:info.project.use.viewport});try{
  const page=await context.newPage();await page.goto(baseURL+'/privacy');await page.setContent(`<style>${readFileSync('app/globals.css','utf8')}${readFileSync('app/page-scale.css','utf8')}${readFileSync('app/projects.css','utf8')}${readFileSync('app/project-pages.css','utf8')}</style><main>${detailHtml}</main>`);
  const frame=page.getByRole('region',{name:'Cyterly AI screenshots'});await fits(frame);await lights(frame);await page.locator('html').evaluate(el=>el.setAttribute('data-theme','dark'));await lights(frame);expect((await frame.boundingBox())!.height).toBeLessThan(page.viewportSize()!.height*.73);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }finally{await context.close();}
});


test('traced logo layout preserves the full wordmark and separates collapsed controls',async({page},info)=>{
 await page.goto('/');const button=page.locator('.site-navigation:visible .site-navigation-logo'),mark=button.locator('img');const outer=await button.boundingBox(),image=await mark.boundingBox();expect(image!.width/(outer!.width-2)).toBeCloseTo(.7,1);expect(Math.abs(image!.x+image!.width/2-outer!.x-outer!.width/2)).toBeLessThan(1);expect(Math.abs(image!.y+image!.height/2-outer!.y-outer!.height/2)).toBeLessThan(1);expect(image!.width/image!.height).toBeCloseTo(412/220,1);
 await page.goto('/interview/dsa/practice');if(info.project.name==='phone'){await page.getByRole('button',{name:'Open interview menu'}).click();await expect.poll(async()=>(await page.locator('.iv-rail').boundingBox())!.x).toBeCloseTo(0,0);}
 const rail=await page.locator('.iv-rail').boundingBox(),brand=await page.locator('.iv-brand').boundingBox();
 for(const selector of ['.iv-brand-mark','.iv-brand-wordmark']){const img=page.locator(selector);await expect(img).toBeVisible();const box=await img.boundingBox();expect(box!.width).toBeGreaterThan(10);expect(box!.x).toBeGreaterThanOrEqual(brand!.x);expect(box!.x+box!.width).toBeLessThanOrEqual(brand!.x+brand!.width+1);expect(box!.x+box!.width).toBeLessThanOrEqual(rail!.x+rail!.width);}
 if(info.project.name==='desktop'){
  const collapse=await page.getByRole('button',{name:'Collapse section rail'}).boundingBox();expect(brand!.x+brand!.width+9).toBeLessThanOrEqual(collapse!.x);await page.getByRole('button',{name:'Collapse section rail'}).click();const expand=await page.getByRole('button',{name:'Expand section rail'}).boundingBox(),narrow=await page.locator('.iv-rail').boundingBox();expect(narrow!.width).toBe(92);await expect(page.locator('.iv-brand')).toBeHidden();expect(expand!.y+expand!.height/2).toBeCloseTo(collapse!.y+collapse!.height/2,0);expect(expand!.x).toBeGreaterThanOrEqual(narrow!.x);expect(expand!.x+expand!.width).toBeLessThanOrEqual(narrow!.x+narrow!.width);await page.getByRole('link',{name:'Dashboard',exact:true}).focus();await expect(page.getByRole('tooltip')).toHaveText('Dashboard');await page.reload();await expect(page.locator('.iv-shell')).toHaveAttribute('data-rail-collapsed','true');
 }else{const close=await page.getByRole('button',{name:'Close interview menu'}).boundingBox();expect(brand!.x+brand!.width).toBeLessThanOrEqual(close!.x);await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Open interview menu'})).toBeFocused();}
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:info.outputPath('traced-brand-layout.png')});
});

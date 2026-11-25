import {test,expect,type Page} from '@playwright/test';
import {build} from 'esbuild';
import {readFileSync} from 'node:fs';
let bundle='';
test.beforeAll(async()=>{
 const out=await build({stdin:{contents:`import React from 'react';import {createRoot} from 'react-dom/client';import {BrandIcon} from './components/journey/brand-icon';
 createRoot(document.getElementById('resources-fixture')).render(<div className="journey"><div className="journey-hero-glass" id="social-test"><p className="journey-actions">{['youtube','instagram','linkedin'].map(kind=><a key={kind} href="#" className={'journey-brand journey-brand-'+kind}><BrandIcon platform={kind} size={20}/>{kind}</a>)}</p></div><div data-chapter="creator"><div className="journey-panel-left"><p className="journey-actions">{['youtube','instagram','linkedin'].map(kind=><a key={kind} href="#" className={'journey-brand journey-brand-'+kind}><BrandIcon platform={kind} size={20}/>{kind}</a>)}</p></div></div><div className="journey-contact-socials"><a href="#" className="journey-brand journey-brand-youtube"><BrandIcon platform="youtube" size={20}/>YouTube</a></div></div>);`,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,format:'iife',platform:'browser',jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},plugins:[{name:'resources-fixture',setup(b){
 b.onResolve({filter:/components\/viewer-provider$/},()=>({path:'viewer',namespace:'resources-viewer'}));b.onLoad({filter:/.*/,namespace:'resources-viewer'},()=>({contents:'export function useViewer(){return {viewer:{status:"anonymous"},configured:false}}'}));
 b.onResolve({filter:/^next\/link$/},()=>({path:'link',namespace:'resources-link'}));b.onLoad({filter:/.*/,namespace:'resources-link'},()=>({resolveDir:process.cwd(),contents:'import React from "react";export default function Link({prefetch,children,...props}){return React.createElement("a",props,children)}'}));
 }}]});bundle=out.outputFiles[0].text;
});
async function mount(page:Page,socials=false){
 await page.goto('/privacy');
 if(socials)await page.addStyleTag({content:readFileSync('app/journey.css','utf8')});
 await page.addStyleTag({content:'body > :not(#resources-fixture){display:none!important}'});
 await page.evaluate(()=>{const root=document.createElement('div');root.id='resources-fixture';document.body.append(root)});
 await page.route('**/__resources_fixture.js',r=>r.fulfill({contentType:'text/javascript',body:bundle}));await page.addScriptTag({url:'/__resources_fixture.js'});
}
test('social marks keep rectangular YouTube, coloured Instagram and equal Creator widths',async({page})=>{
 await mount(page,true);const hero=page.locator('#social-test');
 expect(await hero.locator('.journey-brand-instagram').evaluate(el=>getComputedStyle(el).backgroundImage)).toContain('linear-gradient');
 for(const parent of ['#social-test','.journey-contact-socials']){
  const icon=page.locator('#resources-fixture '+parent+' .journey-brand-youtube svg');const box=await icon.boundingBox();
  expect(box!.width/box!.height).toBeCloseTo(1.5,1);expect(await icon.evaluate(el=>getComputedStyle(el).backgroundColor)).toBe('rgba(0, 0, 0, 0)');
 }
 const widths=await page.locator('#resources-fixture [data-chapter="creator"] .journey-brand').evaluateAll(els=>els.map(el=>el.getBoundingClientRect().width));expect(Math.max(...widths)-Math.min(...widths)).toBeLessThan(1);
});

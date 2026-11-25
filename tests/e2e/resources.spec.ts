import {test,expect,type Page} from '@playwright/test';
import {build} from 'esbuild';
import {readFileSync} from 'node:fs';
let bundle='';
test.beforeAll(async()=>{
 const out=await build({stdin:{contents:`import React from 'react';import {createRoot} from 'react-dom/client';import {GuidesShell} from './components/guides/library';import {BrandIcon} from './components/journey/brand-icon';
 const guides=Array.from({length:20},(_,i)=>({id:String(i),slug:i?'reference-'+i:'mcp',title:i?'Reference '+i:'MCP guide',summary:'Practical reference',cover_url:'',notion_url:'',doc_url:'',updated_at:'2026-11-01'}));
 createRoot(document.getElementById('resources-fixture')).render(location.search.includes('socials')?<div className="journey"><div className="journey-hero-glass" id="social-test"><p className="journey-actions">{['youtube','instagram','linkedin'].map(kind=><a key={kind} href="#" className={'journey-brand journey-brand-'+kind}><BrandIcon platform={kind} size={20}/>{kind}</a>)}</p></div><div data-chapter="creator"><div className="journey-panel-left"><p className="journey-actions">{['youtube','instagram','linkedin'].map(kind=><a key={kind} href="#" className={'journey-brand journey-brand-'+kind}><BrandIcon platform={kind} size={20}/>{kind}</a>)}</p></div></div><div className="journey-contact-socials"><a href="#" className="journey-brand journey-brand-youtube"><BrandIcon platform="youtube" size={20}/>YouTube</a></div></div>:<main className="app-page guides-page"><div className="desktop-app-content app-page-content"><GuidesShell guides={guides}/></div></main>);`,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,format:'iife',platform:'browser',jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},plugins:[{name:'resources-fixture',setup(b){
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
test('Resources matches Articles browsing with series, search and independent scrolling',async({page},info)=>{
 await mount(page);const side=page.getByRole('complementary',{name:'Browse resources'});
 await expect(page.locator('.guide-card .content-series-tag').first()).toHaveText('AI Engineering');
 await side.getByRole('button',{name:'AI Engineering',exact:true}).click();await expect(page.locator('.guide-card')).toHaveCount(1);
 await expect(page.locator('.guide-card')).toHaveAttribute('href','/guides/mcp');
 await side.getByRole('button',{name:'All series',exact:true}).click();
 await page.getByRole('searchbox',{name:'Search resources'}).fill('Reference 19');await expect(page.locator('.guide-card')).toHaveCount(1);
 await page.getByRole('searchbox',{name:'Search resources'}).fill('');
 if(info.project.name==='desktop'){
  const main=page.locator('#resources-fixture .articles-main');await main.evaluate(el=>el.scrollTop=300);
  expect(await side.evaluate(el=>el.scrollTop)).toBe(0);await side.evaluate(el=>el.scrollTop=el.scrollHeight);
  await expect(side.getByRole('link',{name:'Reference 15',exact:false})).toBeAttached();
 }
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('social marks keep rectangular YouTube, coloured Instagram and equal Creator widths',async({page})=>{
 await mount(page,true);const hero=page.locator('#social-test');
 expect(await hero.locator('.journey-brand-instagram').evaluate(el=>getComputedStyle(el).backgroundImage)).toContain('linear-gradient');
 for(const parent of ['#social-test','.journey-contact-socials']){
  const icon=page.locator('#resources-fixture '+parent+' .journey-brand-youtube svg');const box=await icon.boundingBox();
  expect(box!.width/box!.height).toBeCloseTo(1.5,1);expect(await icon.evaluate(el=>getComputedStyle(el).backgroundColor)).toBe('rgba(0, 0, 0, 0)');
 }
 const widths=await page.locator('#resources-fixture [data-chapter="creator"] .journey-brand').evaluateAll(els=>els.map(el=>el.getBoundingClientRect().width));expect(Math.max(...widths)-Math.min(...widths)).toBeLessThan(1);
});

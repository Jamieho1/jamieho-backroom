import {test,expect,type Page} from '@playwright/test';
import {build} from 'esbuild';
import {readFileSync} from 'node:fs';

/** Series cards and the series page are bundled with synthetic parts and mounted on a static page, so no database is needed. Not executed in the sandbox (no Chromium): run with the other specs. */
let bundle='';
test.beforeAll(async()=>{
 const out=await build({stdin:{contents:`import React from 'react';import {createRoot} from 'react-dom/client';
 import {SeriesCards,SeriesDetail} from './components/content/series-views';import {ContentFooterBand} from './components/content/footer-band';import {seriesViews} from './lib/content-series-view';
 const series=[{id:'s1',slug:'mcp-101',title:'MCP 101',goal:'Connect AI to your apps, then build it properly.',topic:'ai',planned_parts:6,sort:1},{id:'s2',slug:'soon',title:'Planned only',goal:'',topic:'career',planned_parts:3,sort:2}];
 const post=(id,part,platform,title)=>({id,slug:id,title,summary:'',platform,category:'ai',cover_url:'',firstSlide:'',created_at:'2026-11-1'+part+'T00:00:00Z',series_id:'s1',series_part:part,code:null,takeaway:'Learn '+id,minutes:5});
 const guide={id:'g2',slug:'mcp',title:'The MCP Guide',summary:'First connection to production.',cover_url:'',notion_url:'',doc_url:'',created_at:'2026-11-12T00:00:00Z',updated_at:'2026-11-12T00:00:00Z',series_id:'s1',series_part:2,audience:'',highlights:[],exercises:null,minutes:25,chapters:5};
 const views=seriesViews([series[0]],[post('p1',1,'instagram','Stop copy-pasting into Claude'),post('p3',3,'youtube','Connect Notion to Claude')],[guide]);
 const detail=location.hash==='#detail';
 createRoot(document.getElementById('hub-fixture')).render(<div className="sty hub"><div className="sty-layer sty-dots"/><div className="hub-in hub-content">{detail?<SeriesDetail s={views[0]}/>:<SeriesCards items={views}/>}</div><ContentFooterBand socials={[]}/></div>);`,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,format:'iife',platform:'browser',jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},plugins:[{name:'hub-fixture',setup(b){
  b.onResolve({filter:/components\/viewer-provider$/},()=>({path:'viewer',namespace:'hub-viewer'}));b.onLoad({filter:/.*/,namespace:'hub-viewer'},()=>({contents:'export function useViewer(){return {viewer:{status:"anonymous"},configured:false}}'}));
  b.onResolve({filter:/^next\/link$/},()=>({path:'link',namespace:'hub-link'}));b.onLoad({filter:/.*/,namespace:'hub-link'},()=>({resolveDir:process.cwd(),contents:'import React from "react";export default function Link({prefetch,children,...props}){return React.createElement("a",props,children)}'}));
  b.onResolve({filter:/^next\/navigation$/},()=>({path:'nav',namespace:'hub-nav'}));b.onLoad({filter:/.*/,namespace:'hub-nav'},()=>({contents:'export const useRouter=()=>({push:(href)=>{window.__pushed=href}});export const usePathname=()=>"/content";'}));
 }}]});bundle=out.outputFiles[0].text;
});
async function mount(page:Page,scheme:'light'|'dark'='dark',hash='',read:string[]=[]){
 await page.emulateMedia({colorScheme:scheme});
 await page.goto('/privacy');
 await page.evaluate(ids=>localStorage.setItem('jb.content.read',JSON.stringify(ids)),read);
 await page.goto('/privacy?fixture=series'+(hash?'#'+hash:''));
 for(const css of ['app/page-scale.css','app/about/story.css','app/content/content.css'])await page.addStyleTag({content:readFileSync(css,'utf8')});
 await page.addStyleTag({content:'body > :not(#hub-fixture){display:none!important}'});
 await page.evaluate(()=>{const root=document.createElement('div');root.id='hub-fixture';document.body.append(root)});
 await page.route('**/__series_fixture.js',r=>r.fulfill({contentType:'text/javascript',body:bundle}));await page.addScriptTag({url:'/__series_fixture.js'});
}
const noSideScroll=(page:Page)=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth);

for(const scheme of ['dark','light'] as const)test(`series card: ring, goal, parts, Next / Soon and Start (${scheme})`,async({page})=>{
 await mount(page,scheme);
 const card=page.getByRole('article').first();
 await expect(card.getByRole('img',{name:'You have read 0 of 6'})).toBeVisible();
 await expect(card).toContainText('After this: Connect AI to your apps');
 await expect(card.locator('.hub-srows li')).toHaveCount(5);await expect(card.getByText('Next')).toBeVisible();await expect(card.getByText('Soon')).toBeVisible();await expect(card).toContainText('+ 2 more');
 await expect(card).toContainText('3 of 6 out · ~35 min');
 await expect(card.getByRole('link',{name:'Start →'})).toHaveAttribute('href','/articles/p1');
 expect(await noSideScroll(page)).toBe(true);
 expect(await page.locator('.sty.hub').evaluate(el=>getComputedStyle(el).backgroundColor)).toBe(scheme==='dark'?'rgb(27, 35, 51)':'rgb(246, 242, 234)');
});
test('progress comes from this browser: Continue goes to the next unread part',async({page})=>{
 await mount(page,'dark','',['p1']);
 const card=page.getByRole('article').first();
 await expect(card.getByRole('img',{name:'You have read 1 of 6'})).toBeVisible();
 await expect(card.getByRole('link',{name:'Continue →'})).toHaveAttribute('href','/guides/mcp');
});
test('series page: sticky info column, parts in order, dashed coming slots',async({page})=>{
 await mount(page,'dark','detail');
 await expect(page.getByRole('heading',{level:1,name:'MCP 101'})).toBeVisible();
 await expect(page.getByText('3 of 6 parts out')).toBeVisible();
 const items=page.locator('.hub-parts > li');await expect(items).toHaveCount(6);
 await expect(items.nth(0)).toContainText('Part 1 · Instagram');await expect(items.nth(1)).toContainText('Part 2 · Free guide');await expect(items.nth(2)).toContainText('Part 3 · YouTube');
 await expect(items.nth(3)).toContainText('Part 4 · coming');await expect(items.nth(3)).toContainText('Follow on Instagram to get it first');
 expect(await items.nth(3).locator('.hub-part').evaluate(el=>getComputedStyle(el).borderTopStyle)).toBe('dashed');
 await expect(page.getByRole('link',{name:'Start at part 1 →'})).toHaveAttribute('href','/articles/p1');
 if((page.viewportSize()?.width??0)>900)expect(await page.locator('.hub-sd-aside').evaluate(el=>getComputedStyle(el).position)).toBe('sticky');
 expect(await noSideScroll(page)).toBe(true);
});
test('series page at phone width keeps the date and Read chips and does not scroll sideways',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await mount(page,'light','detail',['p1']);
 await expect(page.locator('.hub-parts > li').first().getByText('Read',{exact:true})).toBeVisible();
 await expect(page.locator('.hub-parts > li').first().locator('.hub-chip').first()).toBeVisible();
 expect(await noSideScroll(page)).toBe(true);
});

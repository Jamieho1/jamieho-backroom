import {test,expect,type Page} from '@playwright/test';
import {build} from 'esbuild';
import {readFileSync} from 'node:fs';

/** The Content hub components are bundled with synthetic posts and mounted on a static page, so no database is needed. */
let bundle='';
test.beforeAll(async()=>{
 const out=await build({stdin:{contents:`import React from 'react';import {createRoot} from 'react-dom/client';
 import {LatestView} from './components/content/latest';import {HubSearch} from './components/content/hub-search';import {HubTabs} from './components/content/hub-tabs';import {ContentFooterBand} from './components/content/footer-band';
 import {buildSearchIndex} from './lib/content-hub';
 const sid='00000000-0000-4000-8000-000000000a01';
 const series=[{id:sid,slug:'mcp-101',title:'MCP 101',goal:'Ship a server',topic:'ai',planned_parts:5,sort:1}];
 const posts=Array.from({length:30},(_,i)=>({id:'id'+i,slug:'post-'+i,title:i===0?'Stop copy-pasting into Claude':'Sample post '+i,summary:'',platform:i%2?'youtube':'instagram',category:i%3?'ai':'career',cover_url:'',firstSlide:'',created_at:new Date(Date.UTC(2026,10,28)-i*86400000*3).toISOString(),series_id:i===0?sid:null,series_part:i===0?1:null,code:i===0?'MCP101':null,takeaway:i===0?'Wire up a tool':'',minutes:4}));
 const guide={id:'g',slug:'mcp',title:'The MCP Guide',summary:'From first connection to production.',cover_url:'',notion_url:'',doc_url:'',created_at:'a',updated_at:'b',series_id:null,series_part:null,audience:'',highlights:[],exercises:null,minutes:25,chapters:5};
 createRoot(document.getElementById('hub-fixture')).render(<div className="sty hub"><div className="sty-layer sty-dots"/><header className="hub-in hub-head"><div><p className="sty-eyebrow">CONTENT</p><h1>Complete content <em>of</em> every post</h1><p className="sty-lede">Lede.</p></div><HubSearch index={buildSearchIndex({posts,guides:[guide],series})}/></header><HubTabs counts={{latest:30,series:1,guides:1}}/><div className="hub-in hub-content"><LatestView posts={posts} series={series} guide={guide}/></div><ContentFooterBand socials={[{kind:'instagram',href:'https://example.com/i'},{kind:'youtube',href:'https://example.com/y'}]}/></div>);`,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,format:'iife',platform:'browser',jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},plugins:[{name:'hub-fixture',setup(b){
  b.onResolve({filter:/components\/viewer-provider$/},()=>({path:'viewer',namespace:'hub-viewer'}));b.onLoad({filter:/.*/,namespace:'hub-viewer'},()=>({contents:'export function useViewer(){return {viewer:{status:"anonymous"},configured:false}}'}));
  b.onResolve({filter:/^next\/link$/},()=>({path:'link',namespace:'hub-link'}));b.onLoad({filter:/.*/,namespace:'hub-link'},()=>({resolveDir:process.cwd(),contents:'import React from "react";export default function Link({prefetch,children,...props}){return React.createElement("a",props,children)}'}));
  b.onResolve({filter:/^next\/navigation$/},()=>({path:'nav',namespace:'hub-nav'}));b.onLoad({filter:/.*/,namespace:'hub-nav'},()=>({contents:'export const useRouter=()=>({push:(href)=>{window.__pushed=href}});export const usePathname=()=>"/content";'}));
 }}]});bundle=out.outputFiles[0].text;
});
async function mount(page:Page,scheme:'light'|'dark'='dark'){
 await page.emulateMedia({colorScheme:scheme});
 await page.goto('/privacy');
 for(const css of ['app/page-scale.css','app/about/story.css','app/content/content.css'])await page.addStyleTag({content:readFileSync(css,'utf8')});
 await page.addStyleTag({content:'body > :not(#hub-fixture){display:none!important}'});
 await page.evaluate(()=>{const root=document.createElement('div');root.id='hub-fixture';document.body.append(root)});
 await page.route('**/__hub_fixture.js',r=>r.fulfill({contentType:'text/javascript',body:bundle}));await page.addScriptTag({url:'/__hub_fixture.js'});
 await expect(page.locator('.hub-card').first()).toBeVisible();
}
const noSideScroll=(page:Page)=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth);

for(const scheme of ['dark','light'] as const)test(`frame, Latest and tabs render without side scroll (${scheme})`,async({page})=>{
 await mount(page,scheme);
 await expect(page.getByRole('heading',{level:1,name:/Complete content of every post/i})).toBeVisible();
 await expect(page.getByRole('navigation',{name:'Content sections'}).getByRole('link',{name:'Latest 30'})).toHaveAttribute('aria-current','page');
 expect(await noSideScroll(page)).toBe(true);
 const bg=await page.locator('.sty.hub').evaluate(el=>getComputedStyle(el).backgroundColor);
 expect(bg).toBe(scheme==='dark'?'rgb(27, 35, 51)':'rgb(246, 242, 234)');
 await page.evaluate(t=>{document.documentElement.dataset.theme=t},scheme==='dark'?'light':'dark');
 expect(await page.locator('.sty.hub').evaluate(el=>getComputedStyle(el).backgroundColor)).toBe(scheme==='dark'?'rgb(246, 242, 234)':'rgb(27, 35, 51)');
});
test('one search box: a code shows one result, text searches',async({page})=>{
 await mount(page);const box=page.getByRole('searchbox',{name:'Search posts or enter a post code'});
 await box.fill('mcp101');const results=page.getByRole('region',{name:'Search results'});await expect(results.getByRole('link')).toHaveCount(1);await expect(results.getByRole('link')).toHaveAttribute('href','/articles/post-0');
 await box.press('Enter');expect(await page.evaluate(()=>(window as unknown as {__pushed:string}).__pushed)).toBe('/articles/post-0');
 await box.fill('guide');await expect(results.getByRole('link')).toHaveAttribute('href','/guides/mcp');
 await box.fill('nothing like this');await expect(results).toContainText('Nothing matches');
});
test('dropdown filters work with the keyboard and keep state in the URL',async({page})=>{
 await mount(page);const topic=page.getByRole('button',{name:/Topic:/});
 await topic.focus();await page.keyboard.press('ArrowDown');await expect(page.getByRole('menuitemradio',{name:/All topics/})).toBeFocused();
 await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter');await expect(topic).toContainText('AI');await expect(page).toHaveURL(/\?topic=ai$/);await expect(page.getByRole('button',{name:'Clear filters'})).toBeVisible();
 await expect(topic).toBeFocused();
 await topic.press('ArrowDown');await page.keyboard.press('Escape');await expect(page.getByRole('menu')).toHaveCount(0);await expect(topic).toBeFocused();
 await page.getByRole('button',{name:'Clear filters'}).click();await expect(page).not.toHaveURL(/topic=/);await expect(page.getByText('30 posts')).toBeVisible();
});
test('Cards and List switch is remembered, Show more adds 12 at a time',async({page})=>{
 await mount(page);
 await expect(page.locator('.hub-card')).toHaveCount(12);await expect(page.getByText('Showing 12 of 30')).toBeVisible();
 await page.getByRole('button',{name:'Show 12 more'}).click();await expect(page.locator('.hub-card')).toHaveCount(24);
 await page.getByRole('button',{name:/List/}).click();await expect(page.locator('.hub-row')).toHaveCount(24);await expect(page.locator('.hub-card')).toHaveCount(0);
 expect(await noSideScroll(page)).toBe(true);
 await page.reload();await page.addStyleTag({content:'body > :not(#hub-fixture){display:none!important}'});
 await page.evaluate(()=>{const root=document.createElement('div');root.id='hub-fixture';document.body.append(root)});await page.addScriptTag({url:'/__hub_fixture.js'});
 await expect(page.locator('.hub-row')).toHaveCount(12);
});
test('the Stop-copy-pasting card shows what you learn, read time, series chip and NEW',async({page})=>{
 await page.clock.install({time:new Date('2026-11-29T12:00:00Z')});await mount(page);
 const card=page.locator('.hub-card').first();await expect(card).toContainText("You'll learn: Wire up a tool");await expect(card).toContainText('4 min read');await expect(card).toContainText('MCP 101 · 1/5');await expect(card).toContainText('New');
});

test('/articles, /resources and /guides redirect permanently; post and guide pages stay',async({request})=>{
 for(const [from,to] of [['/articles','/content'],['/resources','/content/guides'],['/guides','/content/guides']]){
  const r=await request.get(from,{maxRedirects:0});expect(r.status(),from).toBe(308);expect(new URL(r.headers()['location'],'http://x').pathname).toBe(to);
 }
 for(const path of ['/articles/does-not-exist','/guides/does-not-exist']){const r=await request.get(path,{maxRedirects:0});expect(r.status(),path).not.toBe(308);}
});
test('/p/<code> redirects: unknown codes go to the hub with a note, known codes to the post',async({request,page})=>{
 const r=await request.get('/p/mcp101',{maxRedirects:0});expect([307,308]).toContain(r.status());
 const loc=new URL(r.headers()['location'],'http://x');
 if(r.status()===308)expect(loc.pathname).toMatch(/^\/articles\//);else{expect(loc.pathname).toBe('/content');expect(loc.searchParams.get('code')).toBe('MCP101');}
 const unknown=await request.get('/p/zzzz9',{maxRedirects:0});expect(unknown.status()).toBe(307);expect(unknown.headers()['location']).toBe('/content?code=ZZZZ9');
 await page.goto('/p/zzzz9');await expect(page).toHaveURL(/\/content\?code=ZZZZ9$/);await expect(page.getByText('No post with that code yet.')).toBeVisible();
});
test('Content is one link in the site navigation, no dropdown',async({page})=>{
 await page.goto('/privacy');const nav=page.locator('.site-navigation:visible').getByRole('navigation',{name:'Site',exact:true});
 await expect(nav.locator('[data-menu="content"]')).toHaveCount(0);await expect(nav.getByRole('link',{name:'Content',exact:true})).toHaveAttribute('href','/content');
});

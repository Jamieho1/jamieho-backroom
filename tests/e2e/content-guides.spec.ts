import {test,expect,type Page} from '@playwright/test';
import {build} from 'esbuild';
import {readFileSync} from 'node:fs';

/** Guide cards and the guide page are bundled with a synthetic guide and mounted on a static page, so no database is needed. Not executed in the sandbox (no Chromium): run with the other specs. */
let bundle='';
test.beforeAll(async()=>{
 const out=await build({stdin:{contents:`import React from 'react';import {createRoot} from 'react-dom/client';
 import {GuideCards} from './components/content/guide-cards';import {GuideDetail} from './components/content/guide-detail';import {ContentFooterBand} from './components/content/footer-band';import {seriesParts} from './lib/content-series-view';
 const para=(n)=>Array.from({length:n},(_,i)=>'Reading text number '+i+'.').join(' ');
 const body='Intro text.\\n\\n'+['What MCP is','Connect your first app','Build a server','Ship it','Keep it safe'].map(t=>'## '+t+'\\n\\n'+para(260)+'\\n\\n\`\`\`text title="A prompt"\\nCopy me\\n\`\`\`\\n').join('\\n');
 const hub={id:'g1',slug:'mcp',title:'The MCP guide',summary:'From your first connection to production.',cover_url:'',notion_url:'https://example.com/n',doc_url:'https://example.com/d',created_at:'2026-11-01T00:00:00Z',updated_at:'2026-11-12T00:00:00Z',series_id:null,series_part:null,audience:'Anyone who uses Claude or ChatGPT daily and wants it to reach their own apps.',highlights:['What MCP is, in plain words','Connect your first app safely','Build and ship your own server'],exercises:12,minutes:25,chapters:5};
 const guide={id:'g1',slug:'mcp',title:'The MCP guide',summary:'From your first connection to production.',body,notion_url:'https://example.com/n',doc_url:'https://example.com/d',cover_url:'',series_id:'s1',series_part:2,audience:'',highlights:[],exercises:null,published:true,created_at:'2026-11-01T00:00:00Z',updated_at:'2026-11-12T00:00:00Z'};
 const post=(id,part)=>({id,slug:id,title:'Post '+id,summary:'',platform:'instagram',category:'ai',cover_url:'',firstSlide:'',created_at:'2026-11-1'+part+'T00:00:00Z',series_id:'s1',series_part:part,code:null,takeaway:'',minutes:5});
 const posts=seriesParts({id:'s1'},[post('p1',1),post('p3',3)],[]);
 const detail=location.hash==='#detail';
 createRoot(document.getElementById('hub-fixture')).render(<div className="sty hub"><div className="sty-layer sty-dots"/>{detail?<GuideDetail guide={guide} topic="AI Engineering" posts={posts}/>:<div className="hub-in hub-content"><GuideCards guides={[hub,{...hub,id:'g2',slug:'bare',title:'A bare guide',summary:'',audience:'',highlights:[],exercises:null,notion_url:'',doc_url:''}]} series={[]}/></div>}<ContentFooterBand socials={[]}/></div>);`,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,format:'iife',platform:'browser',jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},plugins:[{name:'hub-fixture',setup(b){
  b.onResolve({filter:/components\/viewer-provider$/},()=>({path:'viewer',namespace:'hub-viewer'}));b.onLoad({filter:/.*/,namespace:'hub-viewer'},()=>({contents:'export function useViewer(){return {viewer:{status:"anonymous"},configured:false}}'}));
  b.onResolve({filter:/^next\/link$/},()=>({path:'link',namespace:'hub-link'}));b.onLoad({filter:/.*/,namespace:'hub-link'},()=>({resolveDir:process.cwd(),contents:'import React from "react";export default function Link({prefetch,children,...props}){return React.createElement("a",props,children)}'}));
  b.onResolve({filter:/^next\/navigation$/},()=>({path:'nav',namespace:'hub-nav'}));b.onLoad({filter:/.*/,namespace:'hub-nav'},()=>({contents:'export const useRouter=()=>({push:()=>{}});export const usePathname=()=>"/content/guides";'}));
 }}]});bundle=out.outputFiles[0].text;
});
async function mount(page:Page,scheme:'light'|'dark'='dark',hash=''){
 await page.addInitScript(()=>{try{localStorage.setItem('jb.theme','auto')}catch{}}); // Night is the site default; these specs check Auto following the system.
 await page.emulateMedia({colorScheme:scheme});
 await page.goto('/privacy'+(hash?'#'+hash:''));
 for(const css of ['app/page-scale.css','app/about/story.css','app/content/content.css'])await page.addStyleTag({content:readFileSync(css,'utf8')});
 await page.addStyleTag({content:'body > :not(#hub-fixture){display:none!important}'});
 await page.evaluate(()=>{const root=document.createElement('div');root.id='hub-fixture';document.body.append(root)});
 await page.route('**/__guide_fixture.js',r=>r.fulfill({contentType:'text/javascript',body:bundle}));await page.addScriptTag({url:'/__guide_fixture.js'});
}
const noSideScroll=(page:Page)=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth);

for(const scheme of ['dark','light'] as const)test(`guide cards: facts, For line, ticks and buttons; empty parts hidden (${scheme})`,async({page})=>{
 await mount(page,scheme);
 const card=page.locator('.guide-card').first();
 await expect(card).toContainText('AI Engineering');await expect(card).toContainText('Updated 12 Nov 2026');
 await expect(card.locator('.hub-facts')).toContainText('5chapters');await expect(card.locator('.hub-facts')).toContainText('25mto read');await expect(card.locator('.hub-facts')).toContainText('12exercises');
 await expect(card.locator('.hub-for')).toContainText('For: Anyone who uses Claude');await expect(card.locator('.hub-ticks li')).toHaveCount(3);
 await expect(card.getByRole('link',{name:'Read the guide →'})).toHaveAttribute('href','/guides/mcp');
 await expect(card.getByRole('link',{name:'Notion toolkit ↗'})).toBeVisible();await expect(card.getByRole('link',{name:'Google Doc ↗'})).toBeVisible();
 const bare=page.locator('.guide-card').nth(1);
 await expect(bare.locator('.hub-facts')).not.toContainText('exercises');await expect(bare.locator('.hub-for,.hub-ticks')).toHaveCount(0);await expect(bare.getByRole('link',{name:/Notion|Google/})).toHaveCount(0);
 expect(await noSideScroll(page)).toBe(true);
 expect(await page.locator('.sty.hub').evaluate(el=>getComputedStyle(el).backgroundColor)).toBe(scheme==='dark'?'rgb(27, 35, 51)':'rgb(246, 242, 234)');
});
for(const scheme of ['dark','light'] as const)test(`guide page: hero, Take it with you, chapter cards, body and rail (${scheme})`,async({page})=>{
 const narrow=page.viewportSize()!.width<1000;
 await mount(page,scheme,'detail');
 await expect(page.getByRole('heading',{level:1,name:'The MCP guide'})).toBeVisible();
 await expect(page.getByText('FREE GUIDE · AI ENGINEERING')).toBeVisible();
 await expect(page.locator('.sty-hmeta')).toContainText('5 chapters');
 const take=page.getByRole('region',{name:'Take it with you'});
 await expect(take.getByRole('link',{name:'Open the Notion toolkit ↗'})).toBeVisible();await expect(take.getByText('Posts that link here')).toBeVisible();await expect(take.locator('.guide-links li')).toHaveCount(2);
 await expect(page.getByRole('region',{name:'Chapters'}).getByRole('link')).toHaveCount(5);
 await expect(page.locator('.guide-body h2')).toHaveCount(5);
 expect(await noSideScroll(page)).toBe(true);
 if(!narrow){
  await expect(page.locator('.sty-rail')).toBeVisible();
  await page.locator('.sty-rail').getByRole('link',{name:/Build a server/}).click();
  await expect(page.locator('.sty-rail li.on')).toContainText('Build a server');
 }else{
  const bar=page.locator('.sty-mbar');await page.locator('.guide-body').scrollIntoViewIfNeeded();await expect(bar).toBeVisible();
  await bar.click();await page.locator('.sty-rail').getByRole('link',{name:/Ship it/}).click();await expect(bar).toContainText('Chapter 04 / 05');
 }
});

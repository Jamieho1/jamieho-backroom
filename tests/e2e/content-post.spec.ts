import {test,expect,type Page} from '@playwright/test';
import {build} from 'esbuild';
import {readFileSync} from 'node:fs';

/** The post page is bundled with a synthetic post and mounted on a static page, so no database is needed. Not executed in the sandbox (no Chromium): run with the other specs. */
let bundle='';
test.beforeAll(async()=>{
 const out=await build({stdin:{contents:`import React from 'react';import {createRoot} from 'react-dom/client';
 import {PostDetail} from './components/content/post-detail';import {ContentFooterBand} from './components/content/footer-band';import {seriesParts} from './lib/content-series-view';
 const para=(n)=>Array.from({length:n},(_,i)=>'Reading text number '+i+'.').join(' ');
 const body='Intro text.\\n\\n'+['The loop','Plug it in once','The plug has a name','Do you need it?'].map(t=>'## '+t+'\\n\\n'+para(260)+'\\n\\n\`\`\`text title="A prompt"\\nCopy me\\n\`\`\`\\n').join('\\n')+'\\n## Links and sources\\n- [Docs](https://example.com)\\n';
 const slide=(n)=>'data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000"><rect width="800" height="1000" fill="#1B2333"/><text x="60" y="520" font-size="120" fill="#E8C46A">'+n+'</text></svg>');
 const hash=location.hash;
 const article={id:'a1',slug:'stop-copy-pasting',title:'Stop copy-pasting into Claude',summary:'Claude only sees what you paste in.',body,platform:hash==='#video'?'youtube':'instagram',category:'ai',source_url:hash==='#video'?'https://youtu.be/dQw4w9WgXcQ':'https://www.instagram.com/p/x/',cover_url:'',project_id:null,series_id:'s1',series_part:1,code:'MCP101',takeaway:'',slides:hash==='#video'?[]:[1,2,3,4,5,6].map(slide),published:true,created_at:'2026-11-11T09:00:00Z',updated_at:'2026-11-11T09:00:00Z'};
 const series={id:'s1',slug:'mcp-101',title:'MCP 101',goal:'Use MCP',topic:'ai',planned_parts:5,sort:0};
 const hp=(id,o)=>({id,slug:id,title:'Related post '+id,summary:'',platform:'instagram',category:'ai',cover_url:'',firstSlide:'',created_at:'2026-11-0'+id.slice(1)+'T00:00:00Z',series_id:null,series_part:null,code:null,takeaway:'',minutes:5,...o});
 const next=seriesParts(series,[hp('p2',{series_id:'s1',series_part:2,title:'The second part'})],[])[0];
 createRoot(document.getElementById('hub-fixture')).render(<div className="sty hub"><div className="sty-layer sty-dots"/><div className="hub-in hub-content"><PostDetail article={article} series={series} allSeries={[series]} next={next} related={[hp('r1'),hp('r2'),hp('r3')]}/></div><ContentFooterBand socials={[]}/></div>);`,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,format:'iife',platform:'browser',jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},plugins:[{name:'hub-fixture',setup(b){
  b.onResolve({filter:/components\/viewer-provider$/},()=>({path:'viewer',namespace:'hub-viewer'}));b.onLoad({filter:/.*/,namespace:'hub-viewer'},()=>({contents:'export function useViewer(){return {viewer:location.hash==="#member"?{status:"member",id:"fixture-user"}:{status:"anonymous"},configured:false}}'}));
  b.onResolve({filter:/app\/actions\/article-pins$/},()=>({path:'pins',namespace:'hub-pins'}));b.onLoad({filter:/.*/,namespace:'hub-pins'},()=>({contents:'let ids=new Set();export async function loadArticlePins(){return {ok:true,ids:[...ids]}};export async function saveArticlePin(id,pinned){pinned?ids.add(id):ids.delete(id);return {ok:true}}'}));
  b.onResolve({filter:/^next\/link$/},()=>({path:'link',namespace:'hub-link'}));b.onLoad({filter:/.*/,namespace:'hub-link'},()=>({resolveDir:process.cwd(),contents:'import React from "react";export default function Link({prefetch,children,...props}){return React.createElement("a",props,children)}'}));
 }}]});bundle=out.outputFiles[0].text;
});
async function mount(page:Page,scheme:'light'|'dark'='dark',hash=''){
 await page.emulateMedia({colorScheme:scheme});
 await page.goto('/privacy'+(hash?'#'+hash:''));
 for(const css of ['app/page-scale.css','app/about/story.css','app/content/content.css'])await page.addStyleTag({content:readFileSync(css,'utf8')});
 await page.addStyleTag({content:'body > :not(#hub-fixture){display:none!important}'});
 await page.evaluate(()=>{const root=document.createElement('div');root.id='hub-fixture';document.body.append(root)});
 await page.route('**/__post_fixture.js',r=>r.fulfill({contentType:'text/javascript',body:bundle}));await page.addScriptTag({url:'/__post_fixture.js'});
}
const noSideScroll=(page:Page)=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth);

for(const scheme of ['dark','light'] as const)test(`post page: header, origin banner, slides strip, body with rail, series bar, More like this (${scheme})`,async({page})=>{
 const narrow=page.viewportSize()!.width<1000;
 await mount(page,scheme);
 await expect(page.getByRole('heading',{level:1,name:'Stop copy-pasting into Claude'})).toBeVisible();
 await expect(page.getByRole('navigation',{name:'Breadcrumb'})).toContainText('MCP 101 · part 1 of 5');
 await expect(page.locator('.sty-hmeta')).toContainText('Code MCP101');
 await expect(page.locator('.post-origin')).toContainText('The long version of my Instagram carousel.');
 await expect(page.getByRole('link',{name:'View post ↗'})).toHaveAttribute('href','https://www.instagram.com/p/x/');
 await expect(page.locator('.post-strip li')).toHaveCount(6);
 const box=await page.locator('.post-slide').first().boundingBox();expect(box!.height/box!.width).toBeCloseTo(1.25,1);
 await expect(page.locator('.guide-body h2')).toHaveCount(5);
 const h2=await page.locator('.guide-body h2').first().evaluate(el=>{const s=getComputedStyle(el);return {t:s.textTransform,f:s.fontFamily,n:getComputedStyle(el,'::before').content};});
 expect(h2.t).toBe('uppercase');expect(h2.f).toContain('Barlow');expect(h2.n).toContain('01');
 await expect(page.locator('.post-nextbar a')).toHaveCount(2);await expect(page.locator('.post-nextbar a').last()).toContainText('Next · part 2');
 await expect(page.getByRole('region',{name:'More like this'}).getByRole('link')).toHaveCount(3);
 expect(await noSideScroll(page)).toBe(true);
 expect(await page.locator('.sty.hub').evaluate(el=>getComputedStyle(el).backgroundColor)).toBe(scheme==='dark'?'rgb(27, 35, 51)':'rgb(246, 242, 234)');
 if(!narrow){
  await expect(page.locator('.sty-rail')).toBeVisible();
  await page.locator('.sty-rail').getByRole('link',{name:/The plug has a name/}).click();
  await expect(page.locator('.sty-rail li.on')).toContainText('The plug has a name');
 }else{
  const bar=page.locator('.sty-mbar');await page.locator('.guide-body').scrollIntoViewIfNeeded();await expect(bar).toBeVisible();
  await bar.click();await page.locator('.sty-rail').getByRole('link',{name:/Do you need it/}).click();await expect(bar).toContainText('Chapter 04 / 05');
 }
});
test('slides viewer: opens as a dialog, arrow keys move, Tab stays inside, Escape returns focus',async({page})=>{
 await mount(page);
 const third=page.getByRole('button',{name:'Open slide 3 of 6'});await third.scrollIntoViewIfNeeded();await third.click();
 const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();await expect(dialog.getByRole('img')).toHaveAttribute('alt','Slide 3 of 6');
 await expect(page.getByRole('button',{name:'Close slide viewer'})).toBeFocused();
 await page.keyboard.press('ArrowRight');await expect(dialog.getByRole('img')).toHaveAttribute('alt','Slide 4 of 6');
 await page.keyboard.press('ArrowLeft');await page.keyboard.press('ArrowLeft');await expect(dialog.getByRole('img')).toHaveAttribute('alt','Slide 2 of 6');
 for(let i=0;i<6;i++){await page.keyboard.press('Tab');expect(await page.evaluate(()=>!!document.activeElement?.closest('[role="dialog"]'))).toBe(true);}
 const img=await dialog.getByRole('img').boundingBox();expect(img!.width).toBeLessThanOrEqual(page.viewportSize()!.width);expect(img!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
 await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);await expect(third).toBeFocused();
 expect(await noSideScroll(page)).toBe(true);
});
test('slides viewer respects reduced motion',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await mount(page);
 await page.getByRole('button',{name:'Open slide 1 of 6'}).click();
 const t=await page.locator('.post-viewer-nav').first().evaluate(el=>getComputedStyle(el).transitionDuration);expect(parseFloat(t)).toBe(0);
 expect(await page.locator('.post-strip').evaluate(el=>getComputedStyle(el).scrollSnapType)).toBe('none');
});
test('signed-in readers pin and unpin from the small Pin button by the meta line',async({page})=>{
 await mount(page,'dark','member');
 const pin=page.getByRole('button',{name:'Pin Stop copy-pasting into Claude'});await expect(pin).toBeEnabled();await pin.click();
 await expect(page.getByRole('button',{name:'Unpin Stop copy-pasting into Claude'})).toHaveAttribute('aria-pressed','true');
 await page.getByRole('button',{name:'Unpin Stop copy-pasting into Claude'}).click();
 await expect(page.getByRole('button',{name:'Pin Stop copy-pasting into Claude'})).toHaveAttribute('aria-pressed','false');
});
test('YouTube posts keep the embedded player and have no slides strip',async({page})=>{
 await mount(page,'dark','video');
 await expect(page.locator('.post-origin')).toContainText('YouTube video');await expect(page.locator('.post-strip')).toHaveCount(0);
 await page.getByRole('button',{name:/Play video/}).click();
 await expect(page.locator('.article-video iframe')).toHaveAttribute('src',/youtube-nocookie\.com\/embed\/dQw4w9WgXcQ/);
 expect(await noSideScroll(page)).toBe(true);
});

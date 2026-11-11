import {test,expect,type Page} from '@playwright/test';
import {build} from 'esbuild';
import {readFileSync} from 'node:fs';
let bundle='';
test.beforeAll(async()=>{
 const out=await build({stdin:{contents:`import React from 'react';import {createRoot} from 'react-dom/client';import {ArticleEditor} from './components/articles/editor';import {ArticlesShell} from './components/articles/library';
 const article={id:'00000000-0000-4000-8000-000000000001',slug:'example-reference',title:'Example reference',summary:'Extra reading',body:'[Reference](https://example.com)',platform:'youtube',category:'ai',source_url:'https://example.com/video',cover_url:'',project_id:null,published:true,created_at:'2026-11-01',updated_at:'2026-11-01'};
 createRoot(document.getElementById('articles-fixture')).render(<><div className="site-header" /><main className="app-page"><div className="desktop-app-content app-page-content">{location.search.includes('editor')?<ArticleEditor initial={[article]} />:<ArticlesShell articles={location.search.includes('many')?Array.from({length:30},(_,i)=>({...article,id:String(i),slug:'post-'+i,title:'Post '+i+': Detailed practical notes on building and deploying AI systems'})):[article]} />}</div></main></>);`,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,format:'iife',platform:'browser',jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},plugins:[{name:'article-fixture',setup(b){
 b.onResolve({filter:/app\/actions\/article-pins$/},()=>({path:'pins',namespace:'article-pins'}));b.onLoad({filter:/.*/,namespace:'article-pins'},()=>({contents:'let ids=new Set();let fail=true;export async function loadArticlePins(){return {ok:true,ids:[...ids]}};export async function saveArticlePin(id,pinned){if(fail){fail=false;return {ok:false,message:"Pin save failed"}};pinned?ids.add(id):ids.delete(id);return {ok:true}}'}));
 b.onResolve({filter:/app\/actions\/articles$/},()=>({path:'actions',namespace:'article-actions'}));b.onLoad({filter:/.*/,namespace:'article-actions'},()=>({contents:`let fail=true;export async function saveArticle(article){if(fail){fail=false;return {ok:false,message:'Could not save article'}};return {ok:true,article:{...article,created_at:'now',updated_at:'now'}}}`}));
 b.onResolve({filter:/components\/viewer-provider$/},()=>({path:'viewer',namespace:'viewer-fixture'}));b.onLoad({filter:/.*/,namespace:'viewer-fixture'},()=>({contents:'export function useViewer(){return {viewer:location.search.includes("pins=1")?{status:"member",id:"fixture-user"}:{status:"anonymous"},configured:false}}'}));
 b.onResolve({filter:/^next\/link$/},()=>({path:'link',namespace:'link-fixture'}));b.onLoad({filter:/.*/,namespace:'link-fixture'},()=>({resolveDir:process.cwd(),contents:'import React from "react";export default function Link({prefetch,children,...props}){return React.createElement("a",props,children)}'}));
 }}]});bundle=out.outputFiles[0].text;
});
async function mount(page:Page,editor=false,many=false,pins=false){await page.goto('/privacy'+(editor?'?editor=1':many?'?many=1':pins?'?pins=1':''));await page.addStyleTag({content:'body > :not(#articles-fixture){display:none!important}\n'+readFileSync('app/articles.css','utf8')});await page.evaluate(()=>{const root=document.createElement('div');root.id='articles-fixture';document.body.append(root);});await page.route('**/__articles_fixture.js',r=>r.fulfill({contentType:'text/javascript',body:bundle}));await page.addScriptTag({url:'/__articles_fixture.js'});}
test('Articles is public, in the shared navigation, and owner management is hidden from visitors',async({page})=>{await page.goto('/');await page.getByRole('navigation',{name:'Site'}).getByRole('link',{name:'Articles',exact:true}).click();await expect(page).toHaveURL(/\/articles$/);await expect(page.getByText('No articles have been published yet.')).toBeVisible();await expect(page.getByRole('link',{name:'Manage articles'})).toHaveCount(0);const res=await page.goto('/articles/manage');expect(res?.status()).toBe(404);});
test('article cards have shareable links and readers can search without sideways overflow',async({page})=>{await mount(page);await expect(page.getByRole('heading',{name:'Latest posts'})).toBeVisible();await expect(page.getByRole('navigation',{name:'Articles',exact:true}).getByRole('link',{name:/Example reference/})).toHaveAttribute('href','/articles/example-reference');await expect(page.getByRole('link',{name:'Example reference',exact:true})).toHaveAttribute('href','/articles/example-reference');await expect(page.locator('#articles-fixture select')).toHaveCount(0);await page.getByRole('searchbox',{name:'Search articles'}).fill('no-match');await expect(page.getByText('No articles match these filters.')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);});
test('article edits retain drafts on failed save and Retry updates the published article',async({page})=>{await mount(page,true);await page.getByRole('button',{name:'Edit Example reference'}).click();await page.getByRole('textbox',{name:'Article (Markdown)',exact:true}).fill('Reference notes '+ 'long'.repeat(80));await page.getByRole('button',{name:'Save article',exact:true}).click();await expect(page.getByRole('alert')).toContainText('Could not save article');await expect(page.getByRole('textbox',{name:'Article (Markdown)',exact:true})).toHaveValue('Reference notes '+ 'long'.repeat(80));expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.getByRole('button',{name:'Retry',exact:true}).click();await expect(page.getByRole('link',{name:'Open article'})).toHaveAttribute('href','/articles/example-reference');});

test('Articles browse background extends to the window bottom',async({page},info)=>{
 await mount(page);
 if(info.project.name==='desktop') {
  const side=await page.locator('.articles-side').boundingBox();
  const content=await page.locator('#articles-fixture .desktop-app-content').boundingBox();
  expect(side!.y+side!.height).toBeGreaterThanOrEqual(content!.y+content!.height-2);
 }
 await expect(page.getByRole('link',{name:'Example reference',exact:true})).toHaveAttribute('href','/articles/example-reference');
});

test('clicking empty article-card space opens the article',async({page})=>{
 await mount(page);
 const card=page.locator('.article-card');
 const box=await card.boundingBox();
 await card.click({position:{x:8,y:box!.height-8}});
 await expect(page).toHaveURL(/\/articles\/example-reference$/);
});

test('reading scroll leaves the sidebar fixed; sidebar scroll loads more latest posts',async({page},info)=>{
 test.skip(info.project.name!=='desktop','side-by-side layout');
 await mount(page,false,true);
 const side=page.locator('.articles-side');const reading=page.locator('.articles-main');
 const links=page.getByRole('navigation',{name:'Articles',exact:true}).getByRole('link');
 await expect(links).toHaveCount(8);
 const before=await side.boundingBox();
 await reading.evaluate(el=>{el.scrollTop=400;});
 expect(await reading.evaluate(el=>el.scrollTop)).toBeGreaterThan(0);
 expect((await side.boundingBox())!.y).toBe(before!.y);
 expect(await side.evaluate(el=>el.scrollTop)).toBe(0);
 await expect(links).toHaveCount(8);
 await side.evaluate(el=>{el.scrollTop=el.scrollHeight;});
 await expect(links).toHaveCount(16);
});

test('signed-in readers pin privately, retry failures and unpin from their sidebar',async({page})=>{
 await mount(page,false,false,true);
 const pin=page.getByRole('button',{name:'Pin Example reference',exact:true});await expect(pin).toBeEnabled();
 await pin.click();await expect(page.getByRole('alert')).toContainText('Pin save failed');
 await expect(page.getByRole('region',{name:'Pinned posts',exact:true}).getByRole('link')).toHaveCount(0);
 await page.getByRole('button',{name:'Retry pin change'}).click();
 const pinned=page.getByRole('navigation',{name:'Pinned articles',exact:true});await expect(pinned.getByRole('link',{name:'Example reference',exact:true})).toHaveAttribute('href','/articles/example-reference');
 await pinned.getByRole('button',{name:'Unpin Example reference',exact:true}).click();
 await expect(page.getByRole('navigation',{name:'Pinned articles',exact:true})).toHaveCount(0);
 await expect(pin).toBeEnabled();
});

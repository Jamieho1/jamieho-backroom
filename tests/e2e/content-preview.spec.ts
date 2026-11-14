import {test,expect,type Page} from '@playwright/test';
import {readFileSync} from 'node:fs';
const api=process.env.CONTENT_PREVIEW_TEST_API;
const previewCookie='jb.content-preview';
const dummyId='00000000-0000-4000-8000-000000000199';
test.use({serviceWorkers:'block'});
test.beforeEach(async({page})=>{await page.route(/\/home-media\/.*\.mp4/,r=>r.abort());});

test('a URL and a forged preview cookie never expose draft data to visitors',async({page,baseURL})=>{
 await page.goto('/');const live=await page.getByRole('heading',{level:1}).textContent();
 const manifest=JSON.parse(readFileSync('.next/prerender-manifest.json','utf8'));
 await page.context().addCookies([{name:previewCookie,value:dummyId,url:baseURL!,httpOnly:true},{name:'__prerender_bypass',value:manifest.preview.previewModeId,url:baseURL!,httpOnly:true}]);
 const response=await page.goto('/?preview='+dummyId);
 await expect(page.getByRole('heading',{level:1})).toHaveText(live!);
 await expect(page.getByRole('complementary',{name:'Content preview'})).toHaveCount(0);
 await expect(page.locator('[data-draft-changed="true"]')).toHaveCount(0);
 expect(response?.headers()['cache-control']).toContain('no-store');
});

// These tests use real Next server actions with the loopback PGlite adapter in tests/support.
// Run the dedicated local integration configuration described in docs/content-drafts.md.
test.describe('real owner preview and session isolation',()=>{
 test.skip(!api,'requires the disposable local Supabase adapter');
 test.describe.configure({mode:'serial'});
 async function local(path:string,body?:unknown){
  if(!api || !/^http:\/\/127\.0\.0\.1:\d+$/.test(api))throw Error('Preview test API must be loopback-only');
  const response=await fetch(api+path,body?{method:'POST',body:JSON.stringify(body)}:undefined);
  if(!response.ok)throw Error(await response.text());return response.json();
 }
 async function signIn(page:Page,baseURL:string,role='owner'){
  const {cookie}=await local('/__session?role='+role);await page.context().addCookies([{...cookie,url:baseURL}]);
 }
 async function proposal(summary:string){
  const suffix=Math.random().toString(16).slice(2,10);const title='Draft hero '+suffix,about='Draft About '+suffix;
  const set=await local('/__seed',{summary:summary+' '+suffix,operations:[{op:'update',table:'site_sections',key:'hero',fields:{title}},{op:'update',table:'site_sections',key:'about',fields:{title:about}}]});
  return {id:set.id,title,about,summary:summary+' '+suffix};
 }
 async function enter(page:Page,baseURL:string,summary:string){
  const set=await proposal(summary);await signIn(page,baseURL);await page.goto('/manage/review');
  await page.getByRole('article',{name:set.summary,exact:true}).getByRole('button',{name:'Preview on page',exact:true}).click();
  await expect(page.getByRole('complementary',{name:'Content preview'})).toBeVisible();
  return set;
 }
 test('owner sees hero/About proposals outlined and Back to list exits without publishing',async({page,baseURL})=>{
  const before=await local('/__state');const live=before.sections.find((s:{key:string})=>s.key==='hero').title;
  const set=await enter(page,baseURL!,'Preview before approval');
  await expect(page.getByRole('heading',{level:1})).toHaveText(set.title);
  const heading=page.locator('[data-chapter="sky"] .journey-hero-heading');await expect(heading).toHaveAttribute('data-draft-changed','true');
  expect(await heading.evaluate(el=>getComputedStyle(el).outlineColor)).toBe('rgb(242, 180, 92)');
  // Chromium sends secure localhost Draft Mode cookies; APIRequestContext over HTTP does not.
  const response=await page.reload();expect(response?.headers()['cache-control']).toContain('no-store');
  await expect(page.getByRole('complementary',{name:'Content preview'})).toBeVisible();
  const cookie=(await page.context().cookies()).find(c=>c.name===previewCookie);expect(cookie?.httpOnly).toBe(true);
  expect(await page.evaluate(()=>document.cookie.includes('jb.content-preview'))).toBe(false);
  await page.locator('.is-journey summary').click();await page.getByRole('navigation',{name:'Journey chapters'}).getByRole('button',{name:'About',exact:true}).click();
  const about=page.locator('[data-chapter="pivot"] .journey-panel');await expect(about.getByRole('heading',{name:set.about,exact:true})).toBeVisible();await expect(about).toHaveAttribute('data-draft-changed','true');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.getByRole('button',{name:'Back to list',exact:true}).click();await expect(page).toHaveURL(/\/manage\/review$/);
  expect((await page.context().cookies()).some(c=>c.name===previewCookie)).toBe(false);
  await page.goto('/');await expect(page.getByRole('heading',{level:1})).toHaveText(live);await expect(page.locator('[data-draft-changed="true"]')).toHaveCount(0);
 });
 test('preview Approve uses the real action, exits and publishes without a rebuild',async({page,baseURL})=>{
  const set=await enter(page,baseURL!,'Approve from preview');await page.getByRole('button',{name:'Approve',exact:true}).click();
  await expect(page.getByRole('complementary',{name:'Content preview'})).toHaveCount(0);await expect(page.getByRole('heading',{level:1})).toHaveText(set.title);
  expect((await page.context().cookies()).some(c=>c.name===previewCookie)).toBe(false);
  const state=await local('/__state');expect(state.sets.find((s:{id:string})=>s.id===set.id).status).toBe('approved');
  await expect(page.locator('[data-draft-changed="true"]')).toHaveCount(0);
 });
 test('preview Discard exits and leaves the homepage live values unchanged',async({page,baseURL})=>{
  const state=await local('/__state');const live=state.sections.find((s:{key:string})=>s.key==='hero').title;
  const set=await enter(page,baseURL!,'Discard from preview');await page.getByRole('button',{name:'Discard',exact:true}).click();
  await expect(page.getByRole('complementary',{name:'Content preview'})).toHaveCount(0);await expect(page.getByRole('heading',{level:1})).toHaveText(live);
  expect((await local('/__state')).sets.find((s:{id:string})=>s.id===set.id).status).toBe('discarded');
 });
 test('copied owner preview cookies reveal only live content to signed-out and member sessions',async({page,browser,baseURL})=>{
  const state=await local('/__state');const live=state.sections.find((s:{key:string})=>s.key==='hero').title;
  const set=await enter(page,baseURL!,'Private preview');
  const copied=(await page.context().cookies()).filter(c=>[previewCookie,'__prerender_bypass'].includes(c.name));expect(copied).toHaveLength(2);
  for(const role of ['anonymous','member']){
   const context=await browser.newContext({viewport:page.viewportSize()!});const other=await context.newPage();
   try{
    if(role==='member')await signIn(other,baseURL!,role);
    await context.addCookies(copied);const response=await other.goto(baseURL+'/?preview='+set.id);
    await expect(other.getByRole('heading',{level:1})).toHaveText(live);await expect(other.getByRole('complementary',{name:'Content preview'})).toHaveCount(0);await expect(other.locator('[data-draft-changed="true"]')).toHaveCount(0);
    const html=await other.content();expect(html).not.toContain(set.title);expect(html).not.toContain(set.about);expect(html).not.toContain(set.summary);expect(response?.headers()['cache-control']).toContain('no-store');
    const review=await other.goto(baseURL+'/manage/review');expect(review?.status()).toBe(404);
   }finally{await context.close();}
  }
 });
 test('the preview URL alone and a stale set cookie show only live content',async({page,baseURL})=>{
  const state=await local('/__state');const live=state.sections.find((s:{key:string})=>s.key==='hero').title;
  const set=await proposal('URL has no authority');await signIn(page,baseURL!);await page.goto('/?preview='+set.id);
  await expect(page.getByRole('heading',{level:1})).toHaveText(live);await expect(page.getByRole('complementary',{name:'Content preview'})).toHaveCount(0);
  await page.goto('/manage/review');await page.getByRole('article',{name:set.summary,exact:true}).getByRole('button',{name:'Preview on page',exact:true}).click();
  await expect(page.getByRole('complementary',{name:'Content preview'})).toBeVisible();
  await page.context().addCookies([{name:previewCookie,value:dummyId,url:baseURL!,httpOnly:true}]);
  await page.reload();await expect(page.getByRole('heading',{level:1})).toHaveText(live);await expect(page.getByRole('complementary',{name:'Content preview'})).toHaveCount(0);await expect(page.locator('[data-draft-changed="true"]')).toHaveCount(0);
 });
 test('reduced-motion preview uses the same proposed values and changed-block markers',async({page,baseURL})=>{
  await page.emulateMedia({reducedMotion:'reduce'});const set=await enter(page,baseURL!,'Reduced motion preview');
  await expect(page.getByRole('heading',{level:1})).toHaveText(set.title);
  const about=page.locator('.journey-stills #pivot [data-draft-changed="true"]');await about.scrollIntoViewIfNeeded();
  await expect(about.getByRole('heading',{name:set.about,exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Back to list',exact:true}).click();await expect(page).toHaveURL(/\/manage\/review$/);
 });
});

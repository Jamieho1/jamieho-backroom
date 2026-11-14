import {test,expect,type Page} from '@playwright/test';
const api=process.env.CONTENT_PREVIEW_TEST_API;
const item='00000000-0000-4000-8000-000000000501',hidden='00000000-0000-4000-8000-000000000502',removed='00000000-0000-4000-8000-000000000503',added='00000000-0000-4000-8000-000000000504';
async function local(path:string,body?:unknown){
 if(!api||!/^http:\/\/127\.0\.0\.1:\d+$/.test(api))throw Error('Loopback fixture required');
 const response=await fetch(api+path,body?{method:'POST',body:JSON.stringify(body)}:undefined);if(!response.ok)throw Error(await response.text());return response.json();
}
async function signIn(page:Page,baseURL:string,role='owner'){const {cookie}=await local('/__session?role='+role);await page.context().addCookies([{...cookie,url:baseURL}]);}
async function proposal(){
 await local('/__experience_seed',{});
 const summary='Experience set '+Math.random().toString(16).slice(2,10);
 const set=await local('/__seed',{summary,operations:[{op:'insert',table:'experience_bullets',key:added,fields:{item_id:item,text:'Draft new proof',public:true,sort:0}},{op:'update',table:'experience_items',key:item,fields:{title:'Draft fixture role'}},{op:'update',table:'experience_items',key:hidden,fields:{public:false}},{op:'delete',table:'experience_bullets',key:removed}]});
 return {...set,summary};
}
async function enter(page:Page,baseURL:string,target='Preview on page'){
 const set=await proposal();await signIn(page,baseURL);await page.goto('/manage/review');
 const card=page.getByRole('article',{name:set.summary,exact:true});await expect(card).toContainText('Live fixture role');await expect(card).toContainText('Draft fixture role');await expect(card).toContainText('(delete bullet)');
 await card.getByRole('button',{name:target,exact:true}).click();await expect(page.getByRole('complementary',{name:'Content preview'})).toBeVisible();return set;
}
test.describe('real Experience/CV draft previews',()=>{
 test.skip(!api,'requires the disposable local Supabase adapter');test.describe.configure({mode:'serial'});
 test.beforeEach(async({page})=>{await page.route(/\/home-media\/.*\.mp4/,r=>r.abort());});
 test('mixed draft overlays Home and CV, with outlines, hidden filtering and discard',async({page,baseURL},testInfo)=>{
  await page.emulateMedia({reducedMotion:'reduce'});const set=await enter(page,baseURL!);
  const experience=page.locator('.journey-stills #experience');await experience.scrollIntoViewIfNeeded();
  const panel=experience.locator('[data-draft-changed="true"]').filter({has:page.getByRole('heading',{name:'Draft fixture role',exact:true})});await expect(panel).toBeVisible();
  await expect(experience.locator('li[data-draft-changed="true"]')).toContainText('Draft new proof');await expect(experience).not.toContainText('Hide fixture role');await expect(experience).not.toContainText('Delete fixture proof');
  expect(await page.content()).not.toContain('Private fixture proof');await page.screenshot({path:testInfo.outputPath('home-preview.png')});
  await page.getByRole('link',{name:'Preview CV',exact:true}).click();await expect(page).toHaveURL(/\/behavioral$/);
  const cv=page.getByRole('region',{name:'CV',exact:true});await expect(cv.getByRole('heading',{name:'Draft fixture role',exact:true})).toBeVisible();
  const changed=cv.locator('article[data-draft-changed="true"]').filter({hasText:'Draft fixture role'});await expect(changed).toBeVisible();expect(await changed.evaluate(el=>getComputedStyle(el).outlineStyle)).toBe('solid');
  await expect(cv.locator('li[data-draft-changed="true"]')).toContainText('Draft new proof');await expect(cv).toContainText('Hidden from homepage');await expect(cv).not.toContainText('Delete fixture proof');await expect(cv.getByRole('button',{name:'Add experience',exact:true})).toHaveCount(0);
  expect((await page.reload())?.headers()['cache-control']).toContain('no-store');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:testInfo.outputPath('cv-preview.png')});
  await page.getByRole('button',{name:'Discard',exact:true}).click();await expect(page.getByRole('complementary',{name:'Content preview'})).toHaveCount(0);
  await expect(cv).toContainText('Live fixture role');await expect(cv).toContainText('Delete fixture proof');await expect(cv.getByRole('button',{name:'Add experience',exact:true})).toBeVisible();
  expect((await local('/__state')).sets.find((s:{id:string})=>s.id===set.id).status).toBe('discarded');
 });
 test('approve from CV applies the entire set and preserves deleted bullet history',async({page,baseURL})=>{
  const set=await enter(page,baseURL!,'Preview CV');await expect(page.getByRole('region',{name:'CV',exact:true})).toContainText('Draft fixture role');
  await page.getByRole('button',{name:'Approve',exact:true}).click();await expect(page.getByRole('complementary',{name:'Content preview'})).toHaveCount(0);await expect(page.locator('[data-draft-changed="true"]')).toHaveCount(0);
  const state=await local('/__state');const saved=state.sets.find((s:{id:string})=>s.id===set.id);expect(saved.status).toBe('approved');expect(saved.previous.find((p:{key:string})=>p.key===removed).values.text).toBe('Delete fixture proof');expect(state.items.find((i:{id:string})=>i.id===hidden).public).toBe(false);expect(state.bullets.some((b:{id:string})=>b.id===removed)).toBe(false);
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await expect(page.locator('.journey-stills #experience')).toContainText('Draft fixture role');await expect(page.locator('.journey-stills #experience')).toContainText('Draft new proof');
 });
 test('copied cookies expose no Experience drafts on Home or CV to visitors and members',async({page,browser,baseURL})=>{
  const set=await enter(page,baseURL!,'Preview CV');const cookies=(await page.context().cookies()).filter(c=>['jb.content-preview','__prerender_bypass'].includes(c.name));
  for(const role of ['anonymous','member']){
   const context=await browser.newContext({viewport:page.viewportSize()!,reducedMotion:'reduce'});const other=await context.newPage();
   try{
    if(role==='member')await signIn(other,baseURL!,role);await context.addCookies(cookies);
    for(const path of ['/','/behavioral']){await other.goto(baseURL+path);const html=await other.content();expect(html).not.toContain('Draft fixture role');expect(html).not.toContain('Draft new proof');expect(html).not.toContain(set.summary);await expect(other.getByRole('complementary',{name:'Content preview'})).toHaveCount(0);if(role==='member'&&path==='/behavioral')await expect(other.getByRole('region',{name:'CV',exact:true})).toContainText('Live fixture role');}
   }finally{await context.close();}
  }
 });
});

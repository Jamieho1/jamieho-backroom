import {test,expect,type Page} from '@playwright/test';
const api=process.env.CONTENT_PREVIEW_TEST_API;
async function local(path:string,body?:unknown){if(!api||!/^http:\/\/127\.0\.0\.1:\d+$/.test(api))throw Error('Disposable loopback API required');const r=await fetch(api+path,body?{method:'POST',body:JSON.stringify(body)}:undefined);if(!r.ok)throw Error(await r.text());return r.json();}
async function owner(page:Page,baseURL:string){const {cookie}=await local('/__session?role=owner');await page.context().addCookies([{...cookie,url:baseURL}]);}
const photo='00000000-0000-4000-8000-000000001601',role='00000000-0000-4000-8000-000000001602',bullet='00000000-0000-4000-8000-000000001603';
test.describe('Home v1.3 release gate',()=>{
 test.skip(!api,'requires disposable loopback API');test.describe.configure({mode:'serial'});
 test('photo, journey and Story previews keep gold outlines and publish the expected Work without leaking drafts',async({page,browser,baseURL},info)=>{
  await local('/__home_v13_seed',{});const suffix=Math.random().toString(16).slice(2,10),summary='Home gate '+suffix;
  await local('/__seed',{summary,operations:[{op:'update',table:'about_photos',key:photo,fields:{caption:'Proposed photo '+suffix}},{op:'update',table:'experience_items',key:role,fields:{title:'Proposed role '+suffix}},{op:'update',table:'experience_bullets',key:bullet,fields:{text:'Proposed proof '+suffix}},{op:'update',table:'site_sections',key:'story',fields:{title:'Proposed story '+suffix,body:'## Synthetic story chapter\nPublic copy after approval.'}}]});
  await owner(page,baseURL!);await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/manage/review');await page.getByRole('article',{name:summary,exact:true}).getByRole('button',{name:'Preview on page',exact:true}).click();
  await expect(page.getByRole('complementary',{name:'Content preview'})).toBeVisible();await page.goto('/');
  const picture=page.locator('#about figure[data-draft-changed="true"]');await expect(picture).toContainText('Proposed photo '+suffix);expect(await picture.evaluate(el=>getComputedStyle(el).outlineStyle)).toBe('solid');
  const entry=page.locator('#experience article[data-draft-changed="true"]');await expect(entry).toContainText('Proposed role '+suffix);await expect(entry.locator('li[data-draft-changed="true"]')).toContainText('Proposed proof '+suffix);expect(await entry.evaluate(el=>getComputedStyle(el).outlineStyle)).toBe('solid');
  await expect(page.locator('#projects .journey-still-showcase > ul > li h2')).toHaveText(['Cyterly AI','DataKind UK']);await expect(page.locator('#projects .journey-still-showcase > ul > li').filter({hasText:'DataKind UK'})).toContainText('Volunteer');
  await page.goto('/about');await expect(page.locator('.story-editorial')).toHaveAttribute('data-draft-changed','true');await expect(page.locator('h1')).toHaveText('Proposed story '+suffix);expect((await page.reload())?.headers()['cache-control']).toContain('no-store');
  const guest=await browser.newContext({viewport:page.viewportSize()!,reducedMotion:'reduce'});try{const visitor=await guest.newPage();for(const path of ['/','/about']){await visitor.goto(baseURL+path);const html=await visitor.content();for(const value of ['Proposed photo '+suffix,'Proposed role '+suffix,'Proposed proof '+suffix,'Proposed story '+suffix,summary])expect(html).not.toContain(value);}}finally{await guest.close();}
  await page.getByRole('button',{name:'Approve',exact:true}).click();await expect(page.getByRole('complementary',{name:'Content preview'})).toHaveCount(0);await page.goto('/');
  await expect(page.locator('#projects .journey-still-showcase > ul > li h2')).toHaveText(['Cyterly AI','DataKind UK']);await expect(page.locator('#about')).toContainText('Proposed photo '+suffix);await expect(page.locator('#experience')).toContainText('Proposed role '+suffix);await expect(page.locator('[data-draft-changed="true"]')).toHaveCount(0);
  const context=await browser.newContext({javaScriptEnabled:false,viewport:info.project.use.viewport});try{const still=await context.newPage();for(const path of ['/','/about']){await still.goto(baseURL+path);await expect(still.getByRole('link',{name:path==='/'?'Read my story':'Get in touch',exact:true})).toBeVisible();expect(await still.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}}finally{await context.close();}
 });
});

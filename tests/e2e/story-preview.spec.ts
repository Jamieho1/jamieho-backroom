import {test,expect,type Page} from '@playwright/test';
const api=process.env.CONTENT_PREVIEW_TEST_API;
async function local(path:string,body?:unknown){if(!api||!/^http:\/\/127\.0\.0\.1:\d+$/.test(api))throw Error('Disposable loopback API required');const response=await fetch(api+path,body?{method:'POST',body:JSON.stringify(body)}:undefined);if(!response.ok)throw Error(await response.text());return response.json();}
async function owner(page:Page,baseURL:string){const {cookie}=await local('/__session?role=owner');await page.context().addCookies([{...cookie,url:baseURL}]);}
async function preview(page:Page,summary:string){await page.goto('/manage/review');await page.getByRole('article',{name:summary,exact:true}).getByRole('button',{name:'Preview on page',exact:true}).click();await expect(page.getByRole('complementary',{name:'Content preview'})).toBeVisible();await page.goto('/about');}
test.describe('My story publication through the real owner approval pipeline',()=>{
 test.skip(!api,'requires disposable local Supabase adapter');test.describe.configure({mode:'serial'});
const svg='<svg xmlns="http://www.w3.org/2000/svg" width="900" height="500"><rect width="900" height="500" fill="#829ab1"/></svg>';
 test('Story preview is private; approval refreshes cached /about without rebuilding; discard preserves it',async({page,browser,baseURL},info)=>{
  const suffix=Math.random().toString(16).slice(2,10),title='Synthetic story '+suffix,summary='Story proposal '+suffix;
  const visitorContext=await browser.newContext({viewport:page.viewportSize()!});const visitor=await visitorContext.newPage();
  const chapters=(p:Page)=>p.locator('.story-editorial .sty-ch-h h2');
  try{
   await visitor.goto(baseURL+'/about');const previous=await visitor.locator('h1').textContent();const before=await visitor.locator('.story-editorial').getAttribute('data-starter');
   await local('/__seed',{summary,operations:[{op:'update',table:'site_sections',key:'story',fields:{title,body:'Synthetic intro line.\n\n## Learning to build\nA synthetic chapter.\n\n![Synthetic alt](https://example.test/story.png "Synthetic story caption")\n\n> A synthetic pull quote.\n\n## Production\nSecond synthetic chapter.\n\n## Principles\n### Ship small\nSynthetic card text.\n\n### Own it\nSecond card.'}}]});
   await owner(page,baseURL!);await preview(page,summary);
   await page.route('https://example.test/story.png',r=>r.fulfill({contentType:'image/svg+xml',body:svg}));await page.reload();
   await expect(chapters(page)).toHaveText(['Learning to build','Production','Principles']);await expect(page.locator('.story-editorial')).toHaveAttribute('data-draft-changed','true');await expect(page.locator('.story-editorial')).toHaveAttribute('data-starter','false');
   expect((await page.reload())?.headers()['cache-control']).toContain('no-store');
   await visitor.reload();await expect(visitor.locator('h1')).toHaveText(previous!);await expect(visitor.locator('.story-editorial')).toHaveAttribute('data-starter',before!);expect(await visitor.content()).not.toContain('Synthetic story caption');await expect(visitor.getByRole('complementary',{name:'Content preview'})).toHaveCount(0);
   await page.getByRole('button',{name:'Approve',exact:true}).click();await expect(page.getByRole('complementary',{name:'Content preview'})).toHaveCount(0);
   await visitor.route('https://example.test/story.png',r=>r.fulfill({contentType:'image/svg+xml',body:svg}));await visitor.reload();
   const article=visitor.locator('.story-editorial');await expect(article).toHaveAttribute('data-starter','false');await expect(article.locator('[data-draft-changed]')).toHaveCount(0);await expect(chapters(visitor)).toHaveText(['Learning to build','Production','Principles']);
   await expect(article.locator('.sty-hmeta')).toContainText('3 chapters');await expect(article.locator('.sty-brk figcaption')).toHaveText('Synthetic story caption');await expect(article.locator('.sty-pq blockquote')).toContainText('A synthetic pull quote.');await expect(article.locator('.sty-pc')).toHaveCount(2);
   const image=article.getByRole('img');await expect(image).toBeAttached();expect(await visitor.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   await visitor.screenshot({path:info.outputPath('story-editorial.png')});
   const discarded='Discard story '+suffix;await local('/__seed',{summary:discarded,operations:[{op:'update',table:'site_sections',key:'story',fields:{body:'## Never publish '+suffix}}]});await preview(page,discarded);await expect(chapters(page)).toHaveText(['Never publish '+suffix]);await page.getByRole('button',{name:'Discard',exact:true}).click();await expect(chapters(page)).toHaveText(['Learning to build','Production','Principles']);await visitor.reload();await expect(chapters(visitor)).toHaveText(['Learning to build','Production','Principles']);
  }finally{await visitorContext.close();}
 });

 test('Chapter rail highlights while scrolling, jump links work and nothing scrolls sideways (desktop and 390px)',async({page,baseURL},info)=>{
  const suffix=Math.random().toString(16).slice(2,10),summary='Story rail '+suffix,filler=Array.from({length:14},(_,i)=>`Synthetic paragraph ${i} with enough words to make the chapter tall and scrollable in the reading column.`).join('\n\n');
  const titles=['One start','Two middle','Three turn','Four close'];
  await local('/__seed',{summary,operations:[{op:'update',table:'site_sections',key:'story',fields:{body:titles.map(t=>`## ${t}\n${filler}`).join('\n\n')}}]});
  await owner(page,baseURL!);await preview(page,summary);
  const phone=info.project.name==='phone',rail=page.locator('.sty-rail'),bar=page.locator('.sty-mbar'),items=page.locator('.sty-rail li:not(.fill)');
  await expect(items).toHaveCount(4);await expect(items.nth(0)).toHaveClass(/on/);
  if(phone){await expect(bar).toBeVisible();await expect(bar).toContainText('Chapter 01 / 04');await expect(rail).toBeHidden();await bar.click();await expect(rail).toBeVisible();await expect(bar).toHaveAttribute('aria-expanded','true');}
  else{await expect(bar).toBeHidden();await expect(rail).toBeVisible();}
  await page.getByRole('link',{name:/Three turn/}).click();
  await expect(page).toHaveURL(/#three-turn$/);await expect(items.nth(2)).toHaveClass(/on/);await expect(items.nth(1)).toHaveClass(/done/);await expect(items.nth(3)).not.toHaveClass(/on|done/);
  if(phone){await expect(rail).toBeHidden();await expect(bar).toContainText('Chapter 03 / 04');await expect(bar).toHaveAttribute('aria-expanded','false');}
  await expect(page.locator('#three-turn')).toBeInViewport();
  expect(Number(await page.locator('.sty-idx').evaluate(el=>getComputedStyle(el).getPropertyValue('--p')))).toBeGreaterThan(0);
  await page.locator('#four-close').evaluate(el=>el.scrollIntoView({block:'end'}));await page.locator('.sty-cta').evaluate(el=>el.scrollIntoView({block:'end'}));
  await expect(items.nth(3)).toHaveClass(/on/);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  if(!phone){const box=await page.locator('.sty-cols').boundingBox();expect(box!.width).toBeLessThanOrEqual(680.5);}
 });
});

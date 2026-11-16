import {test,expect,type Page} from '@playwright/test';
const api=process.env.CONTENT_PREVIEW_TEST_API;
async function local(path:string,body?:unknown){if(!api||!/^http:\/\/127\.0\.0\.1:\d+$/.test(api))throw Error('Disposable loopback API required');const response=await fetch(api+path,body?{method:'POST',body:JSON.stringify(body)}:undefined);if(!response.ok)throw Error(await response.text());return response.json();}
async function owner(page:Page,baseURL:string){const {cookie}=await local('/__session?role=owner');await page.context().addCookies([{...cookie,url:baseURL}]);}
async function preview(page:Page,summary:string){await page.goto('/manage/review');await page.getByRole('article',{name:summary,exact:true}).getByRole('button',{name:'Preview on page',exact:true}).click();await expect(page.getByRole('complementary',{name:'Content preview'})).toBeVisible();await page.goto('/about');}
test.describe('My story publication through the real owner approval pipeline',()=>{
 test.skip(!api,'requires disposable local Supabase adapter');test.describe.configure({mode:'serial'});
 test('Story preview is private; approval refreshes cached /about without rebuilding; discard preserves it',async({page,browser,baseURL},info)=>{
  const suffix=Math.random().toString(16).slice(2,10),title='Synthetic story '+suffix,summary='Story proposal '+suffix;
  const visitorContext=await browser.newContext({viewport:page.viewportSize()!});const visitor=await visitorContext.newPage();
  try{
   await visitor.goto(baseURL+'/about');const previous=await visitor.locator('h1').textContent();
   await local('/__seed',{summary,operations:[{op:'update',table:'site_sections',key:'story',fields:{title,body:'## Learning to build\nA synthetic chapter.\n\n![Synthetic story caption](https://example.test/story.png)\n\n> A synthetic pull quote.\n\n## Production\nSecond synthetic chapter.'}}]});
   await owner(page,baseURL!);await preview(page,summary);
   await page.route('https://example.test/story.png',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="900" height="500"><rect width="900" height="500" fill="#829ab1"/></svg>'}));await page.reload();
   await expect(page.getByRole('heading',{level:1})).toHaveText(title);await expect(page.locator('.story-editorial')).toHaveAttribute('data-draft-changed','true');
   expect((await page.reload())?.headers()['cache-control']).toContain('no-store');
   await visitor.reload();await expect(visitor.locator('h1')).toHaveText(previous!);expect(await visitor.content()).not.toContain(title);await expect(visitor.getByRole('complementary',{name:'Content preview'})).toHaveCount(0);
   await page.getByRole('button',{name:'Approve',exact:true}).click();await expect(page.getByRole('complementary',{name:'Content preview'})).toHaveCount(0);
   await visitor.route('https://example.test/story.png',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="900" height="500"><rect width="900" height="500" fill="#829ab1"/></svg>'}));await visitor.reload();await expect(visitor.getByRole('heading',{level:1})).toHaveText(title);
   const article=visitor.locator('.story-editorial');await expect(article).toHaveAttribute('data-starter','false');await expect(article.locator('[data-draft-changed]')).toHaveCount(0);await expect(article.getByRole('heading',{level:2})).toHaveText(['Learning to build','Production']);
   await expect(article.locator('.article-caption')).toHaveText('Synthetic story caption');await expect(article.locator('blockquote')).toContainText('A synthetic pull quote.');
   const image=article.getByRole('img');await expect(image).toBeVisible();expect((await image.boundingBox())!.width).toBeCloseTo((await article.boundingBox())!.width,0);
   const colors:string[]=[];for(const theme of ['light','dark']){await visitor.evaluate(value=>document.documentElement.dataset.theme=value,theme);colors.push(await article.evaluate(el=>getComputedStyle(el).color));expect(await visitor.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)}expect(colors[0]).not.toBe(colors[1]);
   await visitor.screenshot({path:info.outputPath('story-editorial.png')});
   const discarded='Discard story '+suffix;await local('/__seed',{summary:discarded,operations:[{op:'update',table:'site_sections',key:'story',fields:{title:'Never publish '+suffix}}]});await preview(page,discarded);await expect(page.locator('h1')).toHaveText('Never publish '+suffix);await page.getByRole('button',{name:'Discard',exact:true}).click();await expect(page.locator('h1')).toHaveText(title);await visitor.reload();await expect(visitor.locator('h1')).toHaveText(title);
  }finally{await visitorContext.close();}
 });
});

import { test, expect } from "@playwright/test";

test("the retired desktop redirects to the Free guides tab", async ({ page }) => {
 await page.goto('/desktop'); await expect(page).toHaveURL(/\/content\/guides$/);
 await expect(page.getByRole('heading',{name:/Complete content of every post/i,level:1})).toBeVisible();
 await expect(page.getByRole('navigation',{name:'Content sections'}).getByRole('link',{name:/^Free guides/})).toHaveAttribute('aria-current','page');
 await expect(page.locator('.resource-preview')).toHaveCount(0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('retired Notes, Practice and Behavioral addresses permanently redirect to PassLoop',async({request})=>{
 const base=process.env.NEXT_PUBLIC_PASSLOOP_URL?.replace(/\/+$/,'')||'https://pass-loop.vercel.app';
 for(const [old,path] of [['/notes','/dsa/notes'],['/practices','/dsa/practice'],['/practices/217','/problems/217'],['/behavioral','/behavioral'],['/desktop?app=notes','/dsa/notes'],['/desktop?app=practice','/dsa/practice'],['/desktop?app=practice&problem=217','/problems/217'],['/desktop?app=behavioral','/behavioral'],['/interview','/'],['/interview/sql/notes','/sql/notes']]){
  const response=await request.get(old,{maxRedirects:0});
  expect(response.status(),old).toBe(308);
  expect(new URL(response.headers().location).origin+new URL(response.headers().location).pathname,old).toBe(base+path);
 }
});

test('the Latest, Series and Free guides tabs use client navigation without replacing the document',async({page})=>{
 await page.goto('/content/guides');await page.evaluate(()=>{(window as unknown as {navigationMarker:string}).navigationMarker='persistent';});
 const marker=()=>page.evaluate(()=>(window as unknown as {navigationMarker:string}).navigationMarker);
 for(const [label,url] of [['Latest',/\/content$/],['Series',/\/content\/series$/],['Free guides',/\/content\/guides$/]] as const){
  await page.getByRole('navigation',{name:'Content sections'}).getByRole('link',{name:new RegExp('^'+label)}).click();
  await expect(page).toHaveURL(url);expect(await marker()).toBe('persistent');
 }
});

test('Privacy, Projects and Content use plain pages with one shared header',async({page})=>{
 for(const path of ['/privacy','/projects','/content']) {
  await page.goto(path);
  await expect(page.locator('.app-page')).toBeVisible();
  await expect(page.locator('.desktop-window, .desktop-titlebar, .desktop-backdrop')).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Maximise window'})).toHaveCount(0);
  await expect(page.getByRole('link',{name:'Close window'})).toHaveCount(0);
  await expect(page.getByRole('banner')).toHaveCount(1);
  await expect(page.getByRole('navigation',{name:'Site'})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
 await page.goto('/projects');
 const resources=await page.locator('body').evaluate(el=>getComputedStyle(el).backgroundColor);
 await page.goto('/privacy');
 expect(await page.locator('body').evaluate(el=>getComputedStyle(el).backgroundColor)).toBe(resources);
 await page.getByRole('button', { name: /^Colour mode:/ }).click();
  await page.getByRole('button', { name: /^Colour mode:/ }).click();
 const privacyDark=await page.locator('body').evaluate(el=>getComputedStyle(el).backgroundColor);
 await page.goto('/projects');
 expect(await page.locator('body').evaluate(el=>getComputedStyle(el).backgroundColor)).toBe(privacyDark);
});

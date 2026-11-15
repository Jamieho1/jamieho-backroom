import { test, expect } from "@playwright/test";

test("the retired desktop redirects to the Guides resource shelf", async ({ page }) => {
 await page.goto('/desktop'); await expect(page).toHaveURL(/\/resources$/);
 await expect(page.getByRole('heading',{name:'Resources',level:1})).toBeVisible();
 await expect(page.getByRole('heading',{name:'Guides',exact:true})).toBeVisible();
 await expect(page.locator('.resource-preview')).toHaveCount(0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test("legacy Behavioral deep links open the public Playbook entry", async ({ page }) => {
 await page.goto('/desktop?app=behavioral'); await expect(page).toHaveURL(/\/behavioral$/);
 await expect(page.getByRole('link',{name:'Open Behavioral Playbook'})).toBeVisible();
 await expect(page.getByRole('region',{name:'Question bank'})).toHaveCount(0);
});

test('legacy desktop links preserve account-only Notes and public Practice/Behavioral entry points',async({page})=>{
 for(const [old,path] of [['/desktop?app=notes','/notes'],['/desktop?app=practice','/practices'],['/desktop?app=practice&problem=217','/practices/217'],['/desktop?app=behavioral','/behavioral']]){
  await page.goto(old);expect(new URL(page.url()).pathname).toBe(path);
  if(path==='/notes')await expect(page.getByRole('heading',{name:'Sign in to read Notes'})).toBeVisible();
  else if(path==='/behavioral')await expect(page.getByRole('link',{name:'Open Behavioral Playbook'})).toBeVisible();
  else await expect(page.getByLabel('Python code',{exact:true})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
});

test('Resources and Articles use client navigation without replacing the document',async({page})=>{
 await page.goto('/resources');await page.evaluate(()=>{(window as unknown as {navigationMarker:string}).navigationMarker='persistent';});
 await page.locator('.site-navigation:visible [data-menu=content] summary').click();
 await page.getByRole('navigation',{name:'Site'}).getByRole('link',{name:'Articles',exact:true}).click();
 await expect(page).toHaveURL(/\/articles$/);
 expect(await page.evaluate(()=>(window as unknown as {navigationMarker:string}).navigationMarker)).toBe('persistent');
 await page.locator('.site-navigation:visible [data-menu=content] summary').click();
 await page.getByRole('navigation',{name:'Site'}).getByRole('link',{name:'Resources',exact:true}).click();
 await expect(page).toHaveURL(/\/resources$/);
 expect(await page.evaluate(()=>(window as unknown as {navigationMarker:string}).navigationMarker)).toBe('persistent');
});

test('Privacy, Articles and protected resources use plain pages with one shared header',async({page})=>{
 for(const path of ['/privacy','/projects','/articles','/notes','/practices','/behavioral']) {
  await page.goto(path);
  await expect(page.locator('.app-page')).toBeVisible();
  await expect(page.locator('.desktop-window, .desktop-titlebar, .desktop-backdrop')).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Maximise window'})).toHaveCount(0);
  await expect(page.getByRole('link',{name:'Close window'})).toHaveCount(0);
  await expect(page.getByRole('banner')).toHaveCount(1);
  await expect(page.getByRole('navigation',{name:'Site'})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
 await page.goto('/resources');
 const resources=await page.locator('body').evaluate(el=>getComputedStyle(el).backgroundColor);
 await page.goto('/privacy');
 expect(await page.locator('body').evaluate(el=>getComputedStyle(el).backgroundColor)).toBe(resources);
 await page.getByRole('combobox',{name:'Colour mode'}).selectOption('dark');
 const privacyDark=await page.locator('body').evaluate(el=>getComputedStyle(el).backgroundColor);
 await page.goto('/resources');
 expect(await page.locator('body').evaluate(el=>getComputedStyle(el).backgroundColor)).toBe(privacyDark);
});

import { test, expect } from "@playwright/test";

test("the retired desktop redirects to locked resource previews", async ({ page }) => {
 await page.goto('/desktop'); await expect(page).toHaveURL(/\/resources$/);
 await expect(page.getByRole('heading',{name:'Resources',level:1})).toBeVisible();
 await expect(page.getByText('Sign in to unlock',{exact:true})).toHaveCount(3);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test("legacy resource deep links stay behind sign-in", async ({ page }) => {
 await page.goto('/desktop?app=behavioral'); await expect(page).toHaveURL(/\/behavioral$/);
 await expect(page.getByText('Sign in to unlock',{exact:true})).toBeVisible();
 await expect(page.getByRole('region',{name:'Question bank'})).toHaveCount(0);
});

test('Projects and Privacy keep full-height app windows with the shared navigation',async({page},info)=>{
 if(info.project.name==='desktop')await page.setViewportSize({width:1920,height:900});
 for(const [path,title] of [['/projects','Projects'],['/privacy','Privacy']] as const){
  await page.goto(path);const win=page.getByRole('region',{name:title,exact:true});await expect(win).toBeVisible();
  const box=await win.boundingBox();expect(Math.abs(box!.y+box!.height-page.viewportSize()!.height)).toBeLessThanOrEqual(2);
  expect(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight+1)).toBe(true);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await expect(page.getByRole('link',{name:'Close window'})).toHaveAttribute('href','/resources');
 }
});

test('clean resource routes stay gated and legacy desktop links redirect to them',async({page})=>{
 for(const [old,path] of [['/desktop?app=notes','/notes'],['/desktop?app=practice','/practices'],['/desktop?app=practice&problem=217','/practices/217'],['/desktop?app=behavioral','/behavioral']]){
  await page.goto(old);expect(new URL(page.url()).pathname).toBe(path);
  await expect(page.getByText('Sign in to unlock',{exact:true})).toBeVisible();
  await expect(page.getByRole('region',{name:'Question bank'})).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
});

test('Resources and Articles use client navigation without replacing the document',async({page})=>{
 await page.goto('/resources');await page.evaluate(()=>{(window as unknown as {navigationMarker:string}).navigationMarker='persistent';});
 await page.getByRole('navigation',{name:'Site'}).getByRole('link',{name:'Articles',exact:true}).click();
 await expect(page).toHaveURL(/\/articles$/);
 expect(await page.evaluate(()=>(window as unknown as {navigationMarker:string}).navigationMarker)).toBe('persistent');
 await page.getByRole('navigation',{name:'Site'}).getByRole('link',{name:'Resources',exact:true}).click();
 await expect(page).toHaveURL(/\/resources$/);
 expect(await page.evaluate(()=>(window as unknown as {navigationMarker:string}).navigationMarker)).toBe('persistent');
});

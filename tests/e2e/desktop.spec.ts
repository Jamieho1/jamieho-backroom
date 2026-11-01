import { test, expect } from "@playwright/test";

test("Home has no redundant desktop link; protected desktop still asks visitors to sign in", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Open my desktop" })).toHaveCount(0);
  await page.goto("/desktop");
  await expect(page).toHaveURL(/\/desktop$/);
  await expect(page.getByRole("heading", { name: "Your desktop", level:1 })).toBeVisible();
  await expect(page.getByText("Sign in with Google to open your apps.")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("desktop deep links stay behind sign-in", async ({ page }) => {
  await page.goto("/desktop?app=behavioral");
  await expect(page.getByText("Sign in with Google to open your apps.")).toBeVisible();
  await expect(page.getByRole("region", { name: "Behavioral" })).toHaveCount(0);
});

test('Home, Projects and Privacy share a full-height desktop with no page footer gap',async({page},info)=>{
 if(info.project.name==='desktop')await page.setViewportSize({width:1920,height:900});
 for(const [path,title] of [['/','Home'],['/projects','Projects'],['/privacy','Privacy']] as const){
  await page.goto(path);
  const win=page.getByRole('region',{name:title,exact:true});
  await expect(win).toBeVisible();
  if(path==='/'){
   const widthFits=await page.locator('.landing').evaluate(el=>{
    const pane=el.parentElement!;const style=getComputedStyle(el);
    const inner=el.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight);
    return Math.abs(el.getBoundingClientRect().width-pane.clientWidth)<2&&Array.from(el.querySelectorAll('.block,.hero .md p')).every(b=>Math.abs(b.getBoundingClientRect().width-inner)<2);
   });expect(widthFits).toBe(true);
  }
  const box=await win.boundingBox();
  expect(box).not.toBeNull();
  expect(Math.abs(box!.y+box!.height-page.viewportSize()!.height)).toBeLessThanOrEqual(2);
  expect(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight+1)).toBe(true);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await expect(page.locator('.site-footer')).toHaveCount(0);
 }
 await page.goto('/projects');
 await page.getByRole('navigation',{name:'Desktop apps'}).getByRole('link',{name:'Home',exact:true}).click();
 await expect(page).toHaveURL(/\/$/);await expect(page.getByRole('region',{name:'Home',exact:true})).toBeVisible();
 await page.locator('.landing-footer').getByRole('link',{name:'Privacy',exact:true}).click();
 await expect(page).toHaveURL(/\/privacy$/);
 await expect(page.getByRole('heading',{name:'Privacy policy',exact:true})).toBeVisible();
});

test('clean app routes stay gated and legacy desktop links redirect to them',async({page})=>{
 for(const [old,path] of [['/desktop?app=notes','/notes'],['/desktop?app=practice','/practices'],['/desktop?app=practice&problem=217','/practices/217'],['/desktop?app=behavioral','/behavioral']]){
  await page.goto(old);expect(new URL(page.url()).pathname).toBe(path);
  await expect(page.getByText('Sign in with Google to open your apps.')).toBeVisible();
  await expect(page.getByRole('region',{name:'Question bank'})).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
});
test('Home and Projects use client navigation without replacing the document',async({page})=>{
 await page.goto('/');await page.evaluate(()=>{(window as unknown as {navigationMarker:string}).navigationMarker='persistent';});
 await page.getByRole('navigation',{name:'Desktop apps'}).getByRole('link',{name:'Projects',exact:true}).click();
 await expect(page).toHaveURL(/\/projects$/);
 expect(await page.evaluate(()=>(window as unknown as {navigationMarker:string}).navigationMarker)).toBe('persistent');
 await page.getByRole('navigation',{name:'Desktop apps'}).getByRole('link',{name:'Home',exact:true}).click();
 await expect(page).toHaveURL(/\/$/);
 expect(await page.evaluate(()=>(window as unknown as {navigationMarker:string}).navigationMarker)).toBe('persistent');
});

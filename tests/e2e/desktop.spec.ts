import { test, expect } from "@playwright/test";

test("landing links to the desktop, which asks anonymous visitors to sign in", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Open my desktop" }).click();
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

test('Home, Projects and Privacy share a full-height desktop with no page footer gap',async({page})=>{
 for(const [path,title] of [['/','Home'],['/projects','Projects'],['/privacy','Privacy']] as const){
  await page.goto(path);
  const win=page.getByRole('region',{name:title,exact:true});
  await expect(win).toBeVisible();
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

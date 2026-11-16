import { test, expect } from "@playwright/test";

test("retired About and desktop pages redirect without exposing the old screens", async ({ page }) => {
  await page.goto("/about"); await expect(page).toHaveURL(/\/#pivot$/);
  await page.goto("/desktop"); await expect(page).toHaveURL(/\/resources$/);
  await expect(page.getByRole("heading", { name: "Resources", level: 1 })).toBeVisible();
  await page.goto("/desktop?app=notes"); await expect(page).toHaveURL(/\/notes$/);
});

test("Resources shows only public Guides and Notes requires an account", async ({ page }) => {
  await page.goto("/resources");
  await expect(page.getByRole('heading',{name:'Guides',exact:true})).toBeVisible();
  for(const name of ['Notes','Practice','Resume & Stories','Member apps'])await expect(page.getByRole('heading',{name,exact:true})).toHaveCount(0);
  await expect(page.locator('.resource-card,.resource-preview')).toHaveCount(0);
  await page.goto('/notes'); await expect(page.getByRole('heading',{name:'Sign in to read Notes'})).toBeVisible();
  await expect(page.locator('.notes-layout')).toHaveCount(0);
});

test("Auto tracks the computer while explicit Day and Night choices persist", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" }); await page.goto("/");
  const mode = page.getByRole('button', { name: /^Colour mode:/ });
  await expect(mode).toHaveAttribute("data-theme-mode", "auto");
  await expect.poll(() => page.locator('.journey-hero-night').evaluate(el => getComputedStyle(el).opacity)).toBe('1');
  await mode.click();
  expect(await mode.evaluate(el => getComputedStyle(el).outlineStyle)).toBe('none');
  await page.reload();
  await expect(mode).toHaveAttribute('data-theme-mode','light'); expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe('light');
  await mode.click(); await page.reload(); await expect(mode).toHaveAttribute('data-theme-mode','dark');
  await mode.click(); await page.emulateMedia({colorScheme:'light'});
  await expect.poll(() => page.locator('.journey-hero-night').evaluate(el => getComputedStyle(el).opacity)).toBe('0');
  expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBeUndefined();
  await expect(mode).toHaveAttribute('data-theme-mode','auto');
  await mode.focus(); await page.keyboard.press('Enter');
  await expect(mode).toHaveAttribute('data-theme-mode','light');
  await page.keyboard.press('Space');
  await expect(mode).toHaveAttribute('data-theme-mode','dark');
  await expect(page.locator('.site-navigation:visible').getByRole('link',{name:'Privacy',exact:true})).toHaveCount(0);
  await expect(page.locator('.contact-form a[href="/privacy"]').first()).toBeAttached();
});

test("navigation controls remain available in the floating bar", async ({ page }) => {
  await page.goto('/'); await page.locator('.is-journey [data-menu=journey] summary').click();
  await page.getByRole('navigation',{name:'Journey chapters'}).getByRole('button',{name:'Education',exact:true}).click();
  await expect(page.locator('.site-navigation.is-journey')).toHaveAttribute('data-floating','true');
  for(const name of ['Projects','Interview Prep']) await expect(page.getByRole('link',{name,exact:true})).toBeVisible();
  await expect(page.locator('.site-navigation:visible [data-menu=content] summary')).toBeVisible();
  await expect(page.getByRole('button', { name: /^Colour mode:/ })).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test("Journey dropdown returns from Resources to the requested homepage section", async ({ page }) => {
  await page.goto('/resources');
  await page.locator('.site-navigation [data-menu=journey] summary').click();
  await page.getByRole('navigation',{name:'Journey chapters'}).getByRole('link',{name:'Education',exact:true}).click();
  await expect(page).toHaveURL(/\/#pivot$/);
  await expect(page.locator('[data-chapter="pivot"] .journey-panel')).toBeVisible();
});

test('Journey opens on hover and click, and the floating bar remains centred', async ({page}, info) => {
 await page.goto('/');
 const menu=page.locator('.site-navigation.is-journey [data-menu=journey]');
 const summary=menu.locator('summary');
 if(info.project.name==='desktop') {
  const logo=await page.locator('.is-journey .site-navigation-logo').boundingBox();
  const links=await page.locator('.is-journey .site-navigation-links').boundingBox();
  expect(links!.x-(logo!.x+logo!.width)).toBeLessThan(30);
  await summary.hover(); await expect(menu).toHaveAttribute('open','');
  await page.locator('.is-journey .site-navigation-logo').hover(); await expect(menu).not.toHaveAttribute('open','');
 }
 await summary.click(); await expect(menu).toHaveAttribute('open','');
 await summary.click(); await expect(menu).not.toHaveAttribute('open','');
 await summary.click(); await page.keyboard.press('Escape'); await expect(menu).not.toHaveAttribute('open','');
 await summary.click();
 await page.getByRole('navigation',{name:'Journey chapters'}).getByRole('button',{name:'Education',exact:true}).click();
 await expect(page.locator('.site-navigation.is-journey')).toHaveAttribute('data-floating','true');
 if(info.project.name==='desktop') {
  const bar=await page.locator('.site-navigation.is-journey').boundingBox();
  expect(Math.abs(bar!.x+bar!.width/2-page.viewportSize()!.width/2)).toBeLessThan(2);
 }
});

test('Projects opens the catalogue while Journey Work links to the showcase',async({page})=>{
 await page.goto('/resources');
 const nav=page.getByRole('navigation',{name:'Site',exact:true});
 await expect(nav.getByRole('link',{name:'Projects',exact:true})).toHaveAttribute('href','/projects');
 await nav.locator('[data-menu=journey] summary').click();
 const chapters=page.getByRole('navigation',{name:'Journey chapters'});
 await expect(chapters.getByRole('link',{name:'Work',exact:true})).toHaveAttribute('href','/#projects');
 await expect(chapters.getByRole('link',{name:'Projects',exact:true})).toHaveCount(0);
 await page.keyboard.press('Escape');
 await nav.getByRole('link',{name:'Projects',exact:true}).click();
 await expect(page).toHaveURL(/\/projects$/);
 await expect(page.locator('.app-page[data-app="projects"]')).toBeVisible();
});

test('Content groups Articles and Resources with hover, click and keyboard in top and floating bars',async({page},info)=>{
 await page.goto('/resources');
 const menu=page.locator('.site-navigation:visible [data-menu=content]');const summary=menu.locator('summary');
 await expect(menu).not.toHaveAttribute('open','');
 if(info.project.name==='desktop'){
  await summary.hover();await expect(menu).toHaveAttribute('open','');
  await page.getByRole('heading',{name:'Resources',level:1}).hover();await expect(menu).not.toHaveAttribute('open','');
 }
 await summary.focus();await page.keyboard.press('Enter');await expect(menu).toHaveAttribute('open','');
 const content=page.getByRole('navigation',{name:'Content pages'});
 await expect(content.getByRole('link')).toHaveText(['Articles','Resources']);
 await expect(content.getByRole('link',{name:'Articles',exact:true})).toHaveAttribute('href','/articles');
 await expect(content.getByRole('link',{name:'Resources',exact:true})).toHaveAttribute('href','/resources');
 await page.keyboard.press('Escape');await expect(menu).not.toHaveAttribute('open','');await expect(summary).toBeFocused();
 await summary.click();await expect(menu).toHaveAttribute('open','');await summary.click();await expect(menu).not.toHaveAttribute('open','');
 await summary.click();await page.locator('.site-navigation [data-menu=journey] summary').click();await expect(menu).not.toHaveAttribute('open','');
 await page.getByRole('navigation',{name:'Journey chapters'}).getByRole('link',{name:'Education',exact:true}).click();
 await expect(page.locator('.site-navigation.is-journey')).toHaveAttribute('data-floating','true');
 await page.locator('.site-navigation:visible [data-menu=content] summary').click();
 await expect(page.getByRole('navigation',{name:'Content pages'})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.getByRole('navigation',{name:'Content pages'}).getByRole('link',{name:'Articles',exact:true}).click();await expect(page).toHaveURL(/\/articles$/);
 await expect(page.locator('.site-navigation:visible [data-menu=content]')).not.toHaveAttribute('open','');
});

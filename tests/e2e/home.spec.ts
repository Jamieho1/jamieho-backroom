import { test, expect } from "@playwright/test";

test("My story renders and retired desktop addresses keep their redirects", async ({ page }) => {
  await page.goto("/about"); await expect(page).toHaveURL(/\/about$/); await expect(page.locator(".story-editorial")).toBeVisible();
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
  await page.getByRole('navigation',{name:'Journey chapters'}).getByRole('button',{name:'Background',exact:true}).click();
  await expect(page.locator('.site-navigation.is-journey')).toHaveAttribute('data-floating','true');
  await expect(page.getByRole('link',{name:'Interview Prep',exact:true})).toBeVisible();
  for(const menu of ['my story','content']){await page.locator(`.site-navigation:visible [data-menu="${menu}"] summary`).click();await expect(page.locator(`.site-navigation:visible [data-menu="${menu}"] nav`)).toBeVisible();await page.keyboard.press('Escape');}
  await expect(page.getByRole('button', { name: /^Colour mode:/ })).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test("Journey dropdown returns from Resources to the requested homepage section", async ({ page }) => {
  await page.goto('/resources');
  await page.locator('.site-navigation [data-menu=journey] summary').click();
  await page.getByRole('navigation',{name:'Journey chapters'}).getByRole('link',{name:'Background',exact:true}).click();
  await expect(page).toHaveURL(/\/#about$/);
  await expect(page.locator('.home-dial:visible [data-dial-step="0"]')).toBeVisible();
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
 await page.getByRole('navigation',{name:'Journey chapters'}).getByRole('button',{name:'Background',exact:true}).click();
 await expect(page.locator('.site-navigation.is-journey')).toHaveAttribute('data-floating','true');
 if(info.project.name==='desktop') {
  const bar=await page.locator('.site-navigation.is-journey').boundingBox();
  expect(Math.abs(bar!.x+bar!.width/2-page.viewportSize()!.width/2)).toBeLessThan(2);
 }
});

test('Projects opens the catalogue while Journey Work links to the showcase',async({page})=>{
 await page.goto('/resources');
 const nav=page.getByRole('navigation',{name:'Site',exact:true});
 await nav.locator('[data-menu="my story"] summary').click();await expect(nav.getByRole('link',{name:'Projects',exact:true})).toHaveAttribute('href','/projects');await page.keyboard.press('Escape');
 await nav.locator('[data-menu=journey] summary').click();
 const chapters=page.getByRole('navigation',{name:'Journey chapters'});
 await expect(chapters.getByRole('link',{name:'Work',exact:true})).toHaveAttribute('href','/#projects');
 await expect(chapters.getByRole('link',{name:'Projects',exact:true})).toHaveCount(0);
 await page.keyboard.press('Escape');
 await nav.locator('[data-menu="my story"] summary').click();await nav.getByRole('link',{name:'Projects',exact:true}).click();
 await expect(page).toHaveURL(/\/projects$/);
 await expect(page.locator('.app-page[data-app="projects"]')).toBeVisible();
});

test('grouped navigation retains order, active pages and floating controls',async({page})=>{
 await page.goto('/resources');const nav=page.locator('.site-navigation:visible').getByRole('navigation',{name:'Site',exact:true});
 await expect(nav.locator(':scope > details > summary')).toHaveText(['Journey','My story','Content']);await expect(nav.locator(':scope > a')).toHaveText(['Interview Prep']);
 await nav.locator('[data-menu=content] summary').click();await expect(nav.getByRole('link',{name:'Resources',exact:true})).toHaveAttribute('aria-current','page');await page.keyboard.press('Escape');
 await nav.locator('[data-menu=journey] summary').click();const chapters=page.getByRole('navigation',{name:'Journey chapters'});await expect(chapters.getByRole('link')).toHaveText(['Background','Experience','Work','What I build','Creator','Contact']);await chapters.getByRole('link',{name:'Background',exact:true}).click();await expect(page).toHaveURL(/\/#about$/);
 const floating=page.locator('.site-navigation.is-journey');await expect(floating).toHaveAttribute('data-floating','true');await floating.locator('[data-menu=content] summary').click();await floating.getByRole('link',{name:'Articles',exact:true}).click();await expect(page).toHaveURL(/\/articles$/);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

// A chapter hash can remain after the logo scrolls back to the clouds.
test('colour mode changes preserve the clouds after returning from an Education deep link',async({page})=>{
 await page.goto('/#pivot');
 const navigation=page.locator('.site-navigation.is-journey');
 await expect(navigation).toHaveAttribute('data-floating','true');
 await navigation.getByRole('link',{name:'Jamie Ho — back to the top'}).click();
 await expect(navigation).toHaveAttribute('data-floating','false');
 await expect.poll(()=>page.evaluate(()=>scrollY)).toBeLessThan(3);
 const mode=page.getByRole('button',{name:/^Colour mode:/});
 for(const state of ['light','dark','auto']){
  await mode.click();await expect(mode).toHaveAttribute('data-theme-mode',state);
  await page.waitForTimeout(500);
  await expect(navigation).toHaveAttribute('data-floating','false');
  expect(await page.evaluate(()=>scrollY)).toBeLessThan(3);
 }
 await page.emulateMedia({colorScheme:'dark'});await page.waitForTimeout(500);
 await expect(navigation).toHaveAttribute('data-floating','false');
 expect(await page.evaluate(()=>scrollY)).toBeLessThan(3);
});

test("Back from another page returns to clouds instead of restoring Contact", async ({ page }) => {
  await page.goto('/#home-contact');
  await expect(page.getByRole('heading',{name:'Let’s build something',exact:true}).last()).toBeVisible();
  await page.locator('.site-navigation:visible [data-menu=content] summary').click();await page.locator('.site-navigation:visible').getByRole('link',{name:'Resources',exact:true}).click();
  await expect(page).toHaveURL(/\/resources$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect.poll(()=>page.evaluate(()=>window.scrollY)).toBeLessThan(5);
  await expect(page.locator('[data-chapter="sky"]')).not.toHaveAttribute('inert','');
});

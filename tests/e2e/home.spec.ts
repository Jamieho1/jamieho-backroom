import { test, expect } from "@playwright/test";

test("retired About and desktop pages redirect without exposing the old screens", async ({ page }) => {
  await page.goto("/about"); await expect(page).toHaveURL(/\/#pivot$/);
  await page.goto("/desktop"); await expect(page).toHaveURL(/\/resources$/);
  await expect(page.getByRole("heading", { name: "Resources", level: 1 })).toBeVisible();
  await page.goto("/desktop?app=notes"); await expect(page).toHaveURL(/\/notes$/);
});

test("resources show generic locked previews without signed-out content", async ({ page }) => {
  await page.goto("/resources");
  for (const name of ["Notes", "Practice", "Resume & Stories"]) await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
  await expect(page.getByText("Sign in to unlock", { exact: true })).toHaveCount(3);
  await expect(page.getByRole("link", { name: /^Open / })).toHaveCount(0);
  for (const preview of await page.locator('.resource-preview').all()) expect(await preview.evaluate(el => getComputedStyle(el).filter)).toContain('blur');
  await page.goto('/notes'); await expect(page.getByText('Sign in to unlock', {exact:true})).toBeVisible();
  await expect(page.locator('.notes-layout')).toHaveCount(0);
});

test("Auto tracks the computer while explicit Day and Night choices persist", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" }); await page.goto("/");
  const mode = page.getByRole("combobox", { name: "Colour mode" });
  await expect(mode).toHaveValue("auto");
  await expect.poll(() => page.locator('.journey-hero-night').evaluate(el => getComputedStyle(el).opacity)).toBe('1');
  await mode.selectOption('light'); await page.reload();
  await expect(mode).toHaveValue('light'); expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe('light');
  await mode.selectOption('dark'); await page.reload(); await expect(mode).toHaveValue('dark');
  await mode.selectOption('auto'); await page.emulateMedia({colorScheme:'light'});
  await expect.poll(() => page.locator('.journey-hero-night').evaluate(el => getComputedStyle(el).opacity)).toBe('0');
  expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBeUndefined();
});

test("navigation controls remain available in the floating bar", async ({ page }) => {
  await page.goto('/'); await page.locator('.is-journey summary').click();
  await page.getByRole('navigation',{name:'Journey chapters'}).getByRole('button',{name:'About',exact:true}).click();
  await expect(page.locator('.site-navigation.is-journey')).toHaveAttribute('data-floating','true');
  for(const name of ['Articles','Resources','Privacy']) await expect(page.getByRole('link',{name,exact:true})).toBeVisible();
  await expect(page.getByRole('combobox',{name:'Colour mode'})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test("Journey dropdown returns from Resources to the requested homepage section", async ({ page }) => {
  await page.goto('/resources');
  await page.locator('.site-navigation summary').click();
  await page.getByRole('navigation',{name:'Journey chapters'}).getByRole('link',{name:'About',exact:true}).click();
  await expect(page).toHaveURL(/\/#pivot$/);
  await expect(page.locator('[data-chapter="pivot"] .journey-panel')).toBeVisible();
});

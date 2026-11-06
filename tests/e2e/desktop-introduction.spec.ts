import { test, expect } from '@playwright/test';

test('homepage artwork and navigation work without WebGL', async ({ page }) => {
  await page.addInitScript(`HTMLCanvasElement.prototype.getContext = function() { return null; }`);
  await page.goto('/');
  await expect(page.locator('.journey-hero-art')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Jamie Ho', level: 1 })).toBeVisible();
  await expect(page.getByRole('button', { name: /desktop motion/ })).toHaveCount(0);
  await page.getByRole('button', { name: /Switch to dark mode/ }).click();
  await expect.poll(() => page.locator('.journey-hero-night').evaluate(el => getComputedStyle(el).opacity)).toBe('1');
});

test('without JavaScript the homepage retains its art, copy and working links', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(baseURL!);
  await expect(page.locator('.journey-stills')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Jamie Ho', level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: /Switch on the computer/ })).toHaveAttribute('href', '/desktop');
  await context.close();
});

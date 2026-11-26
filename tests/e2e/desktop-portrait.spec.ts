import { test, expect } from '@playwright/test';

test('homepage selects portrait artwork for phones and matching landscape art for desktop', async ({ page }) => {
  await page.addInitScript(() => { try { localStorage.setItem('jb.theme', 'light'); } catch { /* storage blocked */ } });
  await page.goto('/');
  const img = page.locator('.journey-hero-day img');
  await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.currentSrc)).toMatch(test.info().project.name === 'phone' ? /dayPortrait-/ : /dayHero-/);
  // Start from Day, then Day → Auto → Night (Night is also the default for new visitors).
  await page.getByRole('button', { name: /^Colour mode:/ }).click();
  await page.getByRole('button', { name: /^Colour mode:/ }).click();
  await expect.poll(() => page.locator('.journey-hero-night').evaluate(el => getComputedStyle(el).opacity)).toBe('1');
  await expect.poll(() => page.locator('.journey-hero-night img').evaluate((el: HTMLImageElement) => el.currentSrc)).toMatch(test.info().project.name === 'phone' ? /nightPortrait-/ : /nightHero-/);
  if (test.info().project.name === 'desktop') {
    for (const theme of ['day', 'night']) {
      await expect.poll(() => page.locator(`.journey-hero-${theme} img`).evaluate((el: HTMLImageElement) => [el.naturalWidth, el.naturalHeight])).toEqual([1920, 1080]);
    }
  }
});

import { test, expect } from "@playwright/test";
test.use({ serviceWorkers: "block" });
test.beforeEach(async ({ page }) => { await page.route(/\/home-media\/.*\.mp4/, r => r.abort()); });

test("homepage enters directly, keeps hero text and scrolls without an entry gate", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Jamie Ho", level: 1 })).toBeVisible();
  await expect(page.getByRole("dialog", { name: "Welcome" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Enter the journey" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /straight to my desktop/i })).toHaveCount(0);
  await expect(page.locator(".journey-cue")).toBeVisible();
  await expect(page.locator('.journey-navigation')).toHaveAttribute('data-floating', 'false');
  await page.mouse.wheel(0, 1200);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
});

test("legacy journey address redirects to the homepage", async ({ page }) => {
  await page.goto("/journey");
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator(".journey-hero-art")).toHaveCount(1);
});

test("About floats the bar, numbering starts at 01, logo returns to hero", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Journey chapters" });
  await expect(nav.getByRole("button", { name: /Hello/ })).toHaveCount(0);
  await expect(nav.getByRole("button", { name: /About/ })).toBeVisible();
  await expect(nav.getByRole("button", { name: /About/ }).locator(".journey-nav-n")).toHaveText("01");
  await expect(nav.getByRole("button", { name: /Techstack/ })).toBeAttached();
  await nav.getByRole("button", { name: /About/ }).click();
  await expect(page.locator(".journey-navigation")).toHaveAttribute("data-floating", "true");
  await expect(page.locator('[data-chapter="pivot"] .journey-panel')).toBeVisible();
  await page.getByRole("link", { name: "Jamie Ho — back to the top" }).click();
  await expect(page.locator(".journey-navigation")).toHaveAttribute("data-floating", "false");
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(4);
});

test("opening uses artwork and never downloads the opening video", async ({ page }) => {
  const clips: string[] = [];
  page.on("request", r => { if (/c1-.*\.mp4/.test(r.url())) clips.push(r.url()); });
  await page.goto("/");
  await expect(page.locator('[data-chapter="sky"] video')).toHaveCount(0);
  await expect(page.locator('[data-chapter="sky"] .journey-hero-art')).toBeVisible();
  await page.waitForTimeout(500);
  expect(clips).toEqual([]);
});

test("section photos stay framed through hand-over instead of growing fullscreen", async ({ page }) => {
  await page.goto("/");
  const about = page.locator('[data-chapter="pivot"]');
  await page.getByRole("navigation", { name: "Journey chapters" }).getByRole("button", { name: /About/ }).click();
  await expect(about.locator(".journey-panel")).toBeVisible();
  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(600);
  await expect(page.locator('[data-grow]')).toHaveCount(0);
  expect(await about.locator("figure").evaluate(el => el.style.transform)).toBe("");
});

test("journey ends at monitor and Switch on opens the protected desktop", async ({ page }) => {
  await page.goto("/#desk");
  const on = page.getByRole("button", { name: /Switch on the computer/ });
  await expect(on).toBeVisible();
  await on.click();
  await expect(page).toHaveURL(/\/desktop$/);
  await expect(page.getByText("Sign in with Google to open your apps.")).toBeVisible();
});

test("reduced motion keeps readable stills, text and the desktop destination", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".journey-stills")).toBeVisible();
  await expect(page.locator(".journey-start")).toHaveCount(0);
  await expect(page.getByRole("link", { name: /Switch on the computer/ })).toHaveAttribute("href", "/desktop");
  await expect(page.locator(".journey-stills a", { hasText: "Send a message" })).toHaveAttribute("href", "/about#home-contact");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("phone keeps all sections usable with no sideways overflow or video downloads", async ({ page }) => {
  test.skip(test.info().project.name !== "phone", "phone mode");
  const clips: string[] = [];
  page.on("request", r => { if (/\.mp4/.test(r.url())) clips.push(r.url()); });
  await page.goto("/");
  const hero = page.locator('[data-chapter="sky"] .journey-hero-day img');
  await expect.poll(() => hero.evaluate((img: HTMLImageElement) => img.currentSrc)).toMatch(/dayPortrait-/);
  const height = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  for (const f of [0, .2, .5, .8, 1]) {
    await page.evaluate(y => scrollTo(0, y), height * f);
    await page.waitForTimeout(250);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  expect(clips).toEqual([]);
  await expect(page.getByRole("button", { name: /Switch on the computer/ })).toBeVisible();
});

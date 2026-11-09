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
  await expect(page.locator('.site-navigation.is-journey')).toHaveAttribute('data-floating', 'false');
  await page.mouse.wheel(0, 1200);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
});

test("glass introduction keeps full-background framing and the scroll cue opens About", async ({ page }) => {
  await page.goto("/");
  const glass = page.locator('[data-chapter="sky"] .journey-hero-glass');
  await expect(glass).toBeVisible();
  expect(await glass.evaluate(el => getComputedStyle(el).backgroundImage)).not.toBe("none");
  expect(await glass.evaluate(el => getComputedStyle(el).backdropFilter)).toContain("blur(");
  const placement = await page.evaluate(() => {
    const img = document.querySelector<HTMLElement>('[data-chapter="sky"] .journey-hero-day img')!.getBoundingClientRect();
    const description = document.querySelector<HTMLElement>('[data-chapter="sky"] .journey-hero-glass')!.getBoundingClientRect();
    const heading = document.querySelector<HTMLElement>('[data-chapter="sky"] .journey-hero-heading')!.getBoundingClientRect();
    return { fullBackground: Math.abs(img.height - innerHeight) < 2 && Math.abs(img.width - innerWidth) < 2, descriptionBelowCharacters: description.top > innerHeight * .5, headingAboveDescription: heading.bottom < description.top, headingInSky: heading.bottom < innerHeight * .28 };
  });
  expect(placement).toEqual({ fullBackground: true, descriptionBelowCharacters: true, headingAboveDescription: true, headingInSky: true });
  await page.getByRole("link", { name: "Scroll to discover" }).click();
  await expect(page.locator('[data-chapter="pivot"] .journey-panel')).toBeVisible();
  await expect(page.locator(".site-navigation.is-journey")).toHaveAttribute("data-floating", "true");
});

test("legacy journey address redirects to the homepage", async ({ page }) => {
  await page.goto("/journey");
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator(".journey-hero-art")).toHaveCount(1);
});

test("Journey dropdown navigates, keeps the floating controls and returns to the hero", async ({ page }) => {
  await page.goto("/");
  await page.locator(".is-journey summary").click();
  const nav = page.getByRole("navigation", { name: "Journey chapters" });
  await expect(nav.getByRole("button", { name: /Hello/ })).toHaveCount(0);
  await expect(nav.getByRole("button", { name: /About/ })).toBeVisible();

  await expect(nav.getByRole("button", { name: /TechStack/ })).toBeAttached();
  await nav.getByRole("button", { name: /About/ }).click();
  await expect(page.locator(".site-navigation.is-journey")).toHaveAttribute("data-floating", "true");
  await expect(page.locator('[data-chapter="pivot"] .journey-panel')).toBeVisible();
  await page.getByRole("link", { name: "Jamie Ho — back to the top" }).click();
  await expect(page.locator(".site-navigation.is-journey")).toHaveAttribute("data-floating", "false");
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
  await page.locator(".is-journey summary").click();
  await page.getByRole("navigation", { name: "Journey chapters" }).getByRole("button", { name: /About/ }).click();
  await expect(about.locator(".journey-panel")).toBeVisible();
  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(600);
  await expect(page.locator('[data-grow]')).toHaveCount(0);
  expect(await about.locator("figure").evaluate(el => el.style.transform)).toBe("");
});

test("journey ends with the contact form on the monitor instead of a desktop link", async ({ page }) => {
  await page.goto("/#home-contact");
  const contact = page.getByRole("region", { name: "Contact Us", exact: true });
  await expect(contact).toBeVisible();
  await expect(contact.getByLabel("Name", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /Switch on the computer/ })).toHaveCount(0);
  await expect(page.getByText("At the desk", { exact: true })).toHaveCount(0);
  await page.locator(".is-journey summary").click();
  await expect(page.getByRole("navigation", { name: "Journey chapters" }).getByRole("button", { name: /Contact Us/ })).toBeVisible();
  await page.locator(".is-journey summary").click();
  await contact.getByLabel("Name", { exact: true }).fill("Local form test");
  await contact.getByLabel("Email", { exact: true }).fill("visitor@example.test");
  await contact.getByLabel("What do you need?", { exact: true }).fill("Testing the contact form UI.");
  await contact.getByRole("combobox", { name: "Budget", exact: true }).selectOption({ index: 1 });
  // The existing honeypot success path exercises the real server action without writing or emailing.
  await contact.locator('input[name="website"]').evaluate((el: HTMLInputElement) => { el.value = "bot.example"; });
  await contact.getByRole("button", { name: "Send", exact: true }).click();
  await expect(contact.getByRole("status")).toContainText("Thanks, your message is in.");
  await expect(page).toHaveURL(/\/#home-contact$/);
});

test("reduced motion keeps readable stills and the contact form", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".journey-stills")).toBeVisible();
  await expect(page.locator(".journey-start")).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Contact Us", exact: true }).getByLabel("Name", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Send a message", exact: true })).toBeVisible();
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
  await expect(page.getByRole("region", { name: "Contact Us", exact: true })).toBeVisible();
});

import { test, expect, type Page } from "@playwright/test";

/** TKT-76 + room redesign (2026-11-05): start screen, still fallback, the desk panels and "Switch on". */
const blockClips = (page: Page) => page.route(/\/home-media\/.*\.mp4/, (r) => r.abort());
// The media service worker would fetch around page.route; these tests simulate the network failing.
test.use({ serviceWorkers: "block" });

test("the start screen holds the page until Enter, then the journey scrolls", async ({ page }) => {
  await page.goto("/journey");
  const start = page.getByRole("dialog", { name: "Welcome" });
  await expect(start).toBeVisible();
  await expect(page.getByRole("button", { name: "Enter the journey" })).toBeFocused();
  await expect(page.locator(".journey-start-pct")).toHaveText(/Loading \d+%|Ready/);
  await page.mouse.wheel(0, 1500);
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => scrollY)).toBe(0);

  await page.getByRole("button", { name: "Enter the journey" }).click();
  await expect(start).toHaveCount(0);
  await page.mouse.wheel(0, 1500);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
});

test("visitors who want the apps can go straight to the desktop", async ({ page }) => {
  await page.goto("/journey");
  await expect(page.getByRole("link", { name: /Straight to my desktop/ })).toHaveAttribute("href", "/");
  await page.getByRole("button", { name: "Enter the journey" }).click();
  await expect(page.getByRole("link", { name: /Go straight to my desktop/ })).toHaveAttribute("href", "/");
});

test("a clip that has not arrived shows its approved still, never a blank or frozen frame", async ({ page }) => {
  await blockClips(page);
  await page.goto("/journey");
  await page.getByRole("button", { name: "Enter the journey" }).click();
  const videos = page.locator("video.journey-video");
  await expect(videos.first()).toHaveAttribute("poster", /c1-first\.jpg\?v=/);
  expect(await videos.evaluateAll((vs) => vs.every((v) => !(v as HTMLVideoElement).currentSrc))).toBe(true);
});

test("the journey ends on the monitor: Switch on opens the desktop", async ({ page }) => {
  await blockClips(page);
  await page.goto("/journey#desk");
  await expect(page.getByRole("dialog", { name: "Welcome" })).toHaveCount(0);
  await expect(page.locator('[data-chapter="screen"] video')).toHaveAttribute("poster", /c7b-last\.jpg/);
  const on = page.getByRole("button", { name: /Switch on the computer/ });
  await expect(on).toBeVisible();
  await on.click();
  await page.waitForURL((u) => u.pathname === "/");
});

test("the desk closes with a contact line", async ({ page }) => {
  await blockClips(page);
  await page.goto("/journey#desk");
  const contact = page.locator('section.journey-panel[aria-label="Say hello"]'); // faded out at the very end, still in the page
  await expect(contact).toBeAttached();
  await expect(contact.locator("a", { hasText: "Send a message" })).toHaveAttribute("href", "/about#home-contact");
  await expect(page.locator('section.journey-panel[aria-label="Latest"]')).toHaveCount(0);
});

test("reduced motion gets the still version with no start screen", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/journey");
  await expect(page.getByRole("dialog", { name: "Welcome" })).toHaveCount(0);
  await expect(page.locator(".journey-stills")).toBeVisible();
  // v1.1: the Pivot is a flat section in the still version too, with its statement and the Imperial still.
  const pivot = page.locator(".journey-still-section").first();
  await expect(pivot.locator(".journey-look-statement .journey-title")).toBeVisible();
  await expect(pivot.locator("figure img")).toHaveAttribute("src", /still-imperial\.jpg\?v=/);
  await expect(page.getByRole("link", { name: /Switch on the computer/ })).toHaveAttribute("href", "/");
});

test("after the hero, the Pivot section wipes in with its statement, and no middle clips load", async ({ page }) => {
  const clips: string[] = [];
  page.on("request", (r) => { const m = r.url().match(/\/(c\w+)-(desktop|mobile)\.mp4/); if (m) clips.push(m[1]); });
  await blockClips(page);
  await page.goto("/journey");
  await page.getByRole("button", { name: "Enter the journey" }).click();
  await page.getByRole("navigation", { name: "Journey chapters" }).getByRole("button", { name: /Pivot/ }).click();
  const statement = page.locator('[data-chapter="pivot"] .journey-look-statement');
  await expect(statement).toBeVisible();
  await expect(page.locator('[data-chapter="pivot"] figure img')).toHaveAttribute("src", /still-imperial\.jpg/);
  expect([...new Set(clips)].sort()).toEqual(["c1", "c7a", "c7b"]);
});

test("with no featured projects or public roles, those sections are skipped, not left blank", async ({ page }) => {
  await page.goto("/journey");
  await page.getByRole("button", { name: "Enter the journey" }).click();
  const nav = page.getByRole("navigation", { name: "Journey chapters" });
  await expect(nav.getByRole("button", { name: /Pivot/ })).toBeVisible();
  await expect(nav.getByRole("button", { name: /Projects/ })).toHaveCount(0);
  await expect(nav.getByRole("button", { name: /Experience/ })).toHaveCount(0); // no public roles yet → skipped too
  await expect(page.locator('[data-chapter="projects"]')).toHaveCount(0);
});

test("the Toolkit stack lifts its layers as you scroll (falls back to project tags without '## layer' text)", async ({ page }) => {
  await page.goto("/journey");
  await page.getByRole("button", { name: "Enter the journey" }).click();
  await page.getByRole("navigation", { name: "Journey chapters" }).getByRole("button", { name: /Toolkit/ }).click();
  const tk = page.locator('[data-chapter="toolkit"]');
  await expect(tk.locator(".journey-toolkit-item").first()).toBeVisible();
  await expect(tk.locator(".journey-toolkit-plane").first()).toHaveAttribute("data-on", "true");
});

test("on a phone the journey never scrolls sideways and the chapter menu keeps the current chapter in view", async ({ page }) => {
  test.skip(test.info().project.name !== "phone", "phone layout");
  await blockClips(page);
  await page.goto("/journey");
  await page.getByRole("button", { name: "Enter the journey" }).click();
  const H = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  for (const f of [0.1, 0.3, 0.5, 0.7, 0.9, 1]) {
    await page.evaluate((y) => window.scrollTo(0, y), Math.round(H * f));
    await page.waitForTimeout(400);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await expect.poll(() => page.evaluate(() => {
    const b = document.querySelector<HTMLElement>('.journey-nav button[aria-current="step"]');
    if (!b) return false;
    const r = b.getBoundingClientRect();
    return r.left >= 0 && r.right <= innerWidth;
  })).toBe(true);
});

test("the still version (reduced motion) has no sideways scroll and keeps every link", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/journey");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.locator(".journey-stills a", { hasText: "Go straight to my desktop" })).toHaveAttribute("href", "/");
  await expect(page.locator(".journey-stills a", { hasText: "Send a message" })).toHaveAttribute("href", "/about#home-contact");
});

test("TKT-92: 'Scroll to discover' nudges until the visitor scrolls, then goes", async ({ page }) => {
  await blockClips(page);
  await page.goto("/journey");
  await page.getByRole("button", { name: "Enter the journey" }).click();
  const cue = page.locator(".journey-cue");
  await expect(cue).toBeVisible();
  await page.mouse.wheel(0, 1200);
  await expect(cue).toBeHidden();
});

test("TKT-92: reduced motion has no cue and no cycling words", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/journey");
  await expect(page.locator(".journey-cue")).toHaveCount(0);
  expect(await page.locator(".journey-rotate").evaluateAll((els) => els.every((e) => getComputedStyle(e).animationName === "none"))).toBe(true);
});

test("TKT-93: at the end of the Pivot its photo grows to fill the screen and the text fades", async ({ page }) => {
  await blockClips(page);
  await page.goto("/journey");
  await page.getByRole("button", { name: "Enter the journey" }).click();
  const pivot = page.locator('[data-chapter="pivot"]');
  const H = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  let y = 0;
  // Scroll until the photo starts growing, then a little further so it covers the screen.
  while (y < H && !(await pivot.getAttribute("data-grow"))) { y += 40; await page.evaluate((v) => scrollTo(0, v), y); await page.waitForTimeout(40); }
  expect(y).toBeLessThan(H);
  // Step on until it has fully grown (Lenis eases the scroll, so give each step a moment to settle).
  const grow = () => pivot.evaluate((el) => Number((el as HTMLElement).style.getPropertyValue("--grow") || 0));
  let g = await grow();
  for (let k = 0; k < 120 && g < 0.98; k++) {
    y += 12;
    await page.evaluate((v) => scrollTo(0, v), y);
    await page.waitForTimeout(120);
    g = await grow();
  }
  expect(g).toBeGreaterThanOrEqual(0.98);
  const covers = await pivot.locator("figure").evaluate((f) => { const r = f.getBoundingClientRect(); return r.left <= 1 && r.top <= 1 && r.right >= innerWidth - 1 && r.bottom >= innerHeight - 1; });
  expect(covers).toBe(true);
  expect(Number(await pivot.locator(".journey-panel").first().evaluate((n) => getComputedStyle(n).opacity))).toBeLessThan(0.05);
});

test("TKT-95: the wireframe never loads on a phone or with reduced motion, and never throws", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  if (test.info().project.name !== "phone") await page.emulateMedia({ reducedMotion: "reduce" });
  const three: string[] = [];
  page.on("request", (r) => { if (/three/i.test(r.url())) three.push(r.url()); });
  await page.goto("/journey");
  const enter = page.getByRole("button", { name: "Enter the journey" });
  if (await enter.count()) await enter.click();
  await page.mouse.wheel(0, 2500);
  await page.waitForTimeout(800);
  await expect(page.locator(".journey-lines")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("TKT-95: on a desktop the journey scrolls through every section without errors (wireframe or not)", async ({ page }) => {
  test.skip(test.info().project.name === "phone", "desktop only");
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await blockClips(page);
  await page.goto("/journey");
  await page.getByRole("button", { name: "Enter the journey" }).click();
  const nav = page.getByRole("navigation", { name: "Journey chapters" });
  for (const name of [/Pivot/, /Toolkit/, /Creator/]) { await nav.getByRole("button", { name }).click(); await page.waitForTimeout(700); }
  expect(errors).toEqual([]);
});

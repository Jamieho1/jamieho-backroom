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

test("the desk shows the Latest panel with a contact line", async ({ page }) => {
  await blockClips(page);
  await page.goto("/journey#desk");
  const latest = page.locator('section.journey-panel[aria-label="Latest"]'); // faded out at the very end, still in the page
  await expect(latest).toBeAttached();
  await expect(latest.locator("a", { hasText: "Say hello" })).toHaveAttribute("href", "/about#home-contact");
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

import { test, expect } from "@playwright/test";

/** 2026-11-06: phones get Jamie's 9:16 art (day and night) instead of a thin landscape band. */
test("a portrait screen shows the 9:16 wallpaper for the theme, with no landscape scene", async ({ page }) => {
  test.skip(test.info().project.name !== "phone", "portrait layout");
  await page.goto("/");
  const backdrop = page.locator(".desktop-backdrop");
  await expect(backdrop).toHaveAttribute("data-composition", "portrait");
  const art = () => page.locator(".desktop-portrait").evaluate((el) => getComputedStyle(el).backgroundImage);
  await expect.poll(art).toMatch(/dayPortrait-/);
  await expect(page.locator(".desktop-art-frame")).toBeHidden();
  await page.emulateMedia({ colorScheme: "dark" });
  await expect.poll(art).toMatch(/nightPortrait-/);
  await page.waitForTimeout(1500);
  await expect(page.locator(".desktop-canvas canvas")).toHaveCount(0);
});

test("a landscape screen keeps the framed art", async ({ page }) => {
  test.skip(test.info().project.name === "phone", "landscape layout");
  await page.goto("/");
  await expect(page.locator(".desktop-backdrop")).not.toHaveAttribute("data-composition", "portrait");
  await expect(page.locator(".desktop-portrait")).toBeHidden();
});

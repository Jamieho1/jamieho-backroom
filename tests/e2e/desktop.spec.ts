import { test, expect } from "@playwright/test";

test("landing links to the desktop, which asks anonymous visitors to sign in", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Open my desktop" }).click();
  await expect(page).toHaveURL(/\/desktop$/);
  await expect(page.getByRole("heading", { name: "Your desktop" })).toBeVisible();
  await expect(page.getByText("Sign in with Google to open your apps.")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("desktop deep links stay behind sign-in", async ({ page }) => {
  await page.goto("/desktop?app=behavioral");
  await expect(page.getByText("Sign in with Google to open your apps.")).toBeVisible();
  await expect(page.getByRole("region", { name: "Behavioral" })).toHaveCount(0);
});

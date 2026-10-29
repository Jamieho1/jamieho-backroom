import { test, expect } from "@playwright/test";

test("the placeholder landing page loads with no login", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Jamie Ho" })).toBeVisible();
  const noSideScroll = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
  expect(noSideScroll).toBe(true);
});

test("/api/health answers with the app name and a Supabase status", async ({ request }) => {
  const res = await request.get("/api/health");
  const body = await res.json();
  expect(body.app).toBe("jamieho-backroom");
  expect(["ok", "unconfigured", "unreachable"]).toContain(body.supabase);
  expect(res.status()).toBe(body.ok ? 200 : 503);
});

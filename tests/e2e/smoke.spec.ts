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

test("the header offers Google sign-in when signed out", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("banner").getByRole("link", { name: "Jamie Ho" })).toBeVisible();
  // Without Supabase settings (CI) the button is hidden rather than broken.
  const configured = process.env.NEXT_PUBLIC_SUPABASE_URL ? 1 : 0;
  await expect(page.getByRole("button", { name: "Sign in with Google" })).toHaveCount(configured);
});

test("a callback without a code comes back with a clear message", async ({ page }) => {
  await page.goto("/auth/callback");
  await expect(page).toHaveURL(/\/\?auth=error$/);
  await expect(page.locator("main [role=alert]")).toHaveText(/Sign-in didn.t complete/);
});

import { test, expect } from "@playwright/test";

test("the placeholder landing page loads with no login", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Jamie Ho" })).toBeVisible();
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
  await expect(page.getByRole("banner").getByRole("link", { name: "Jamie Ho — back to the top" })).toBeVisible();
  // Without Supabase settings (CI) the button is hidden rather than broken.
  const configured = process.env.NEXT_PUBLIC_SUPABASE_URL ? 1 : 0;
  await expect(page.getByRole("button", { name: "Sign in" })).toHaveCount(configured);
});

test("a callback without a code comes back with a clear message", async ({ page }) => {
  await page.goto("/auth/callback");
  await expect(page).toHaveURL(/\/\?auth=error$/);
  await expect(page.locator("main [role=alert]")).toHaveText(/Sign-in didn.t complete/);
});

test("the privacy policy is public and linked from the shared bar", async ({ page }) => {
  await page.goto("/"); await page.getByRole("link", { name: "Privacy", exact: true }).click();
  await expect(page).toHaveURL(/\/privacy$/);
  await expect(page.getByRole("heading", { name: "Privacy policy" })).toBeVisible();
  for (const h of ["What is collected", "Why it is used", "Who processes it", "How long it is kept", "Your rights"]) await expect(page.getByRole("heading", { name: h })).toBeVisible();
});

test("the Google site-verification tag appears only when configured", async ({ page }) => {
  await page.goto("/");
  const tag = page.locator('meta[name="google-site-verification"]');
  await expect(tag).toHaveCount(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ? 1 : 0);
});

test("Settings is a plain 404 for anyone who isn't the owner", async ({ page }) => {
  const res = await page.goto("/settings");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Settings" })).toHaveCount(0);
});

test("the project page is public with the plain Resources layout", async ({ page }) => {
  await page.goto("/projects");
  await expect(page.getByRole("heading", { name: "Projects", level: 1 })).toBeVisible();
  await expect(page.getByText("Projects are on their way.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Close window" })).toHaveCount(0);
  await expect(page.locator(".app-page[data-app=projects]")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("the contact form checks fields and quietly drops bot submissions", async ({ page }) => {
  await page.goto("/#home-contact");
  const form = page.getByRole("region", { name: "Contact Us", exact: true });
  await form.getByRole("button", { name: "Send" }).click(); // the browser blocks it: every field is required
  await expect(form.locator(":invalid")).toHaveCount(5); // form + name, email, need, budget
  await expect(form.getByRole("alert")).toHaveCount(0);
  await form.getByLabel("Name").fill("Bot");
  await form.getByLabel("Email").fill("bot@example.com");
  await form.getByLabel("What do you need?").fill("Spam");
  await form.getByRole("combobox", { name: "Budget" }).selectOption("Not sure yet");
  await form.locator('input[name="website"]').evaluate((el: HTMLInputElement) => { el.value = "spam.example"; });
  await form.getByRole("button", { name: "Send" }).click();
  await expect(form.getByRole("status")).toContainText("Thanks");
});

test("settings (and so the inbox) is hidden from visitors", async ({ page }) => {
  const res = await page.goto("/settings");
  expect(res?.status()).toBe(404);
});

test("reading the public pages sets no cookies (so no cookie banner is needed)", async ({ page, context }) => {
  for (const path of ["/", "/resources", "/projects", "/privacy"]) await page.goto(path);
  expect(await context.cookies()).toEqual([]);
});

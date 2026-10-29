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

test("the privacy policy is public and linked from every page", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("contentinfo").getByRole("link", { name: "Privacy" }).click();
  await expect(page).toHaveURL(/\/privacy$/);
  await expect(page.getByRole("heading", { name: "Privacy policy" })).toBeVisible();
  for (const h of ["What is collected", "Why it is used", "Who processes it", "How long it is kept", "Your rights"]) {
    await expect(page.getByRole("heading", { name: h })).toBeVisible();
  }
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

test("the landing page shows its sections", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Jamie Ho" })).toBeVisible();
  for (const h of ["About", "Writing & videos", "Contact"]) await expect(page.getByRole("heading", { level: 2, name: h })).toBeVisible();
  await expect(page.getByRole("button", { name: "Edit site" })).toHaveCount(0); // only the owner gets this
});

test("dark/light toggle switches the theme and remembers it", async ({ page }) => {
  await page.goto("/");
  const toggle = page.getByRole("button", { name: /Switch to (dark|light) mode/ });
  const before = await toggle.getAttribute("aria-label");
  await toggle.click();
  const theme = await page.evaluate(() => document.documentElement.dataset.theme);
  expect(before).toContain(theme!);
  await page.reload();
  expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe(theme);
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).toBe(theme === "dark" ? "rgb(30, 31, 35)" : "rgb(255, 253, 247)");
});

test("projects show as windows on the landing page and /projects", async ({ page }) => {
  await page.goto("/");
  const section = page.getByRole("region", { name: "Projects" });
  await expect(section.getByRole("article").first()).toBeVisible();
  await page.getByRole("banner").getByRole("link", { name: "Projects" }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(page.getByRole("heading", { level: 1, name: "Projects" })).toBeVisible();
  await expect(page.getByRole("article", { name: "Behavioral" })).toContainText("Invite-only");
  const noSideScroll = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
  expect(noSideScroll).toBe(true);
});

test("the contact form checks fields and quietly drops bot submissions", async ({ page }) => {
  await page.goto("/");
  const form = page.getByRole("region", { name: "Send a message" });
  await form.getByRole("button", { name: "Send" }).click(); // the browser blocks it: every field is required
  await expect(form.locator(":invalid")).toHaveCount(5); // form + name, email, need, budget
  await expect(form.getByRole("alert")).toHaveCount(0);
  await form.getByLabel("Name").fill("Bot");
  await form.getByLabel("Email").fill("bot@example.com");
  await form.getByLabel("What do you need?").fill("Spam");
  await form.getByLabel("Budget").selectOption("Not sure yet");
  await page.locator('input[name="website"]').fill("http://spam.example", { force: true });
  await form.getByRole("button", { name: "Send" }).click();
  await expect(form.getByRole("status")).toContainText("Thanks");
});

test("settings (and so the inbox) is hidden from visitors", async ({ page }) => {
  const res = await page.goto("/settings");
  expect(res?.status()).toBe(404);
});

test("reading the public pages sets no cookies (so no cookie banner is needed)", async ({ page, context }) => {
  for (const path of ["/", "/projects", "/privacy"]) await page.goto(path);
  expect(await context.cookies()).toEqual([]);
});

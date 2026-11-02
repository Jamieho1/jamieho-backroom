import { test, expect } from "@playwright/test";

test("Home waypoints scroll its pane, focus the destination and keep the form usable", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Explore my work" }).click();
  await expect(page.locator("#home-work")).toBeFocused();
  expect(await page.locator(".desktop-app-content").evaluate(e => e.scrollTop)).toBeGreaterThan(0);
  expect(await page.evaluate(() => scrollY)).toBe(0);
  await page.evaluate(() => { location.hash = "home-contact"; });
  await page.getByRole("region", { name: "Send a message" }).getByLabel("Name").fill("Local preview");
  await expect(page.getByRole("region", { name: "Send a message" }).getByLabel("Name")).toHaveValue("Local preview");
  expect(await page.locator(".desktop-app-content").evaluate(e => e.scrollWidth <= e.clientWidth)).toBe(true);
});

test("reduced motion starts with the exact-scene still and keeps all content reachable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Enable London motion" })).toBeVisible();
  await expect(page.locator(".home-canvas canvas")).toHaveCount(0);
  expect(await page.locator(".home-poster img").evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  await page.getByRole("navigation", { name: "On this page" }).getByRole("link", { name: "About", exact: true }).click();
  await expect(page.locator("#home-about")).toBeFocused();
  await expect(page.getByRole("heading", { name: "About", exact: true })).toBeInViewport();
  await expect(page.locator(".home-canvas canvas")).toHaveCount(0);
});

test("a missing WebGL context falls back to a complete still view", async ({ page }) => {
  await page.addInitScript(`(() => {
    const get = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(kind, ...args) {
      return String(kind).includes('webgl') ? null : get.call(this, kind, ...args);
    };
  })()`);
  await page.goto("/");
  await expect(page.locator('.home-journey[data-scene="unavailable"]')).toBeVisible();
  await expect(page.locator(".home-motion-label")).toHaveText("Still view");
  await expect(page.getByRole("button", { name: "Pause London motion" })).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1, name: "Jamie Ho" })).toBeVisible();
  await page.getByRole("link", { name: "Get in touch", exact: false }).click();
  await expect(page.getByRole("region", { name: "Send a message" }).getByLabel("Name")).toBeInViewport();
  await expect(page.locator(".home-canvas canvas")).toHaveCount(0);
});

test("London follows the inner scroll, resizes with the window and releases its canvas", async ({ page }) => {
  await page.goto("/");
  const webgl = await page.evaluate(() => {
    const c = document.createElement("canvas"), gl = c.getContext("webgl2");
    gl?.getExtension("WEBGL_lose_context")?.loseContext(); return !!gl;
  });
  test.skip(!webgl, "This runner has no WebGL2; still/reduced-motion paths are tested independently.");
  await expect(page.locator('.home-journey[data-scene="ready"]')).toBeVisible({ timeout: 15_000 });
  const canvas = page.locator(".home-canvas"), pane = page.locator(".desktop-app-content");
  const start = await canvas.getAttribute("data-sc-verify-state");
  await pane.evaluate(e => { e.scrollTop = e.clientHeight * 0.6; });
  await expect(canvas).not.toHaveAttribute("data-sc-verify-state", start!);
  expect(await page.evaluate(() => scrollY)).toBe(0);
  await page.setViewportSize({ width: 1050, height: 740 });
  await expect.poll(async () => page.locator(".home-stage").evaluate(e => Math.abs(e.clientHeight - e.closest(".desktop-app-content")!.clientHeight))).toBeLessThan(2);
  await expect.poll(async () => page.locator(".home-canvas canvas").evaluate(e => Math.abs(e.getBoundingClientRect().width - e.parentElement!.clientWidth))).toBeLessThan(2);
  await page.getByRole("button", { name: "Maximise window" }).click();
  await expect.poll(async () => page.locator(".home-stage").evaluate(e => Math.abs(e.clientHeight - e.closest(".desktop-app-content")!.clientHeight))).toBeLessThan(2);
  await page.getByRole("button", { name: "Restore window" }).click();
  await pane.evaluate(e => { e.scrollTop = 0; });
  await page.getByRole("button", { name: "Pause London motion" }).click();
  await expect(page.locator(".home-canvas canvas")).toHaveCount(0);
  await page.getByRole("button", { name: "Enable London motion" }).click();
  await expect(page.locator('.home-journey[data-scene="ready"]')).toBeVisible();
  await pane.evaluate(e => { e.scrollTop = e.clientHeight; });
  await expect(canvas).toHaveAttribute("data-sc-verify-hold", "true");
  await page.locator(".home-canvas canvas").evaluate((canvas: HTMLCanvasElement) => canvas.getContext("webgl2")?.getExtension("WEBGL_lose_context")?.loseContext());
  await expect(page.locator('.home-journey[data-scene="unavailable"]')).toBeVisible();
  await expect(page.locator(".home-canvas canvas")).toHaveCount(0);
  expect(await page.locator(".home-copy-ground").evaluate(e => getComputedStyle(e, "::before").opacity)).toBe("1");
  await page.getByRole("navigation", { name: "Desktop apps" }).getByRole("link", { name: "Projects", exact: true }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(page.locator(".home-canvas canvas")).toHaveCount(0);
});

test("the complete Home remains readable without JavaScript", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage(); await page.goto(baseURL!);
  await expect(page.getByRole("heading", { level: 1, name: "Jamie Ho" })).toBeVisible();
  await page.getByRole("link", { name: "Explore my work" }).click();
  await expect(page.getByRole("region", { name: "Projects" })).toBeInViewport();
  await expect(page.locator(".home-canvas canvas")).toHaveCount(0);
  await context.close();
});

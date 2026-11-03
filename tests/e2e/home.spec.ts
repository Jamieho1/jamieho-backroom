import { test, expect } from "@playwright/test";

test("Home waypoints scroll its pane, focus the destination and keep the form usable", async ({ page }) => {
  await page.goto("/about");
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
  await page.goto("/about");
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
  await page.goto("/about");
  await expect(page.locator('.home-journey[data-scene="unavailable"]')).toBeVisible();
  await expect(page.locator(".home-motion-label")).toHaveText("Still view");
  await expect(page.getByRole("button", { name: "Pause London motion" })).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1, name: "Jamie Ho" })).toBeVisible();
  await page.getByRole("link", { name: "Get in touch", exact: false }).click();
  await expect(page.getByRole("region", { name: "Send a message" }).getByLabel("Name")).toBeInViewport();
  await expect(page.locator(".home-canvas canvas")).toHaveCount(0);
});

test("London follows the inner scroll, resizes with the window and releases its canvas", async ({ page }) => {
  await page.goto("/about");
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
  const page = await context.newPage(); await page.goto(baseURL!+"/about");
  await expect(page.getByRole("heading", { level: 1, name: "Jamie Ho" })).toBeVisible();
  await page.getByRole("link", { name: "Explore my work" }).click();
  await expect(page.getByRole("region", { name: "Projects" })).toBeInViewport();
  await expect(page.locator(".home-canvas canvas")).toHaveCount(0);
  await context.close();
});

test("technology evidence links to its project and every remaining stop reaches a distinct, settled view", async ({ page }) => {
  await page.goto("/about");
  await expect(page.getByRole("heading", { name: "Interests", exact: true })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Technology", exact: true })).toBeVisible();
  await page.locator('.home-toolkit').getByRole('link', { name: 'Notes', exact: true }).first().click();
  await expect(page.locator('#home-project-notes')).toBeFocused();
  await expect(page.getByRole('article', { name: 'Notes', exact: true })).toBeInViewport();
  const canvas = page.locator('.home-canvas');
  const webgl = await page.evaluate(() => {
    const gl = document.createElement('canvas').getContext('webgl2');
    gl?.getExtension('WEBGL_lose_context')?.loseContext(); return !!gl;
  });
  if (webgl) await expect(page.locator('.home-journey[data-scene="ready"]')).toBeVisible({ timeout: 15_000 });
  const poses = new Set<string>();
  for (const stop of ['technology', 'work', 'writing', 'contact']) {
    await page.locator(`#home-${stop}`).evaluate(e => e.scrollIntoView({ block: 'start' }));
    if (webgl) {
      await expect(canvas).toHaveAttribute('data-home-waypoint', stop);
      await expect(canvas).toHaveAttribute('data-sc-verify-hold', 'true');
      poses.add((await canvas.getAttribute('data-sc-verify-state'))!);
    }
    expect(await page.locator('.desktop-app-content').evaluate(e => e.scrollWidth <= e.clientWidth)).toBe(true);
    expect(await page.evaluate(() => scrollY)).toBe(0);
    await expect(page.getByRole('navigation', { name: 'On this page' })).toBeInViewport();
  }
  if (webgl) expect(poses.size).toBe(4);
  // A neutral DOM fixture exercises reflow when public Experience arrives or its owner edits it.
  // No personal content, production fixture route or database write is involved.
  await page.evaluate(() => {
    const node = document.createElement('div'); node.id = 'home-experience'; node.dataset.homeStop = 'experience'; node.className = 'home-content-stop'; node.tabIndex = -1;
    const pane = document.createElement('div'); pane.className = 'home-reading-pane';
    const title = document.createElement('h2'); title.textContent = 'Example experience layout'; pane.append(title);
    const list = document.createElement('ol'); list.className = 'xp';
    for (let i = 0; i < 14; i++) { const row = document.createElement('li'); row.textContent = `Example responsibility ${i + 1}: ` + 'example-long-text'.repeat(12); list.append(row); }
    pane.append(list); node.append(pane); document.querySelector('#home-writing')!.before(node);
  });
  await page.locator('#home-experience').evaluate(e => e.scrollIntoView({ block: 'start' }));
  if (webgl) {
    await expect(canvas).toHaveAttribute('data-home-waypoint', 'experience');
    await expect(canvas).toHaveAttribute('data-sc-verify-hold', 'true');
    const settled = await canvas.getAttribute('data-sc-verify-state');
    await page.locator('.desktop-app-content').evaluate(e => { e.scrollTop += 80; });
    await expect(canvas).toHaveAttribute('data-sc-verify-state', settled!);
  }
  expect(await page.locator('.desktop-app-content').evaluate(e => e.scrollWidth <= e.clientWidth)).toBe(true);
  await page.getByRole('link', { name: 'Back to the river' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Jamie Ho' })).toBeInViewport();
});

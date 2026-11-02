/** Regenerate original Home posters and capture actual pane-scroll review frames from a local server.
 * node scripts/capture-home.mjs http://localhost:3100 [chromium executable] [review output directory]
 * Use a source copy without .env files for placeholder-only review images.
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const [address = "http://localhost:3100", executablePath, review = "/private/tmp/jamie-home-preview"] = process.argv.slice(2);
const url = new URL(address);
if (!["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) throw new Error("Capture only from a local preview server.");
const assets = path.resolve("public/home"); await mkdir(assets, { recursive: true }); await mkdir(review, { recursive: true });
const browser = await chromium.launch({ executablePath: executablePath || undefined, args: ["--enable-webgl", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const report = [];
try {
  for (const [name, width, height] of [["desktop", 1850, 1000], ["phone", 390, 844], ["compact", 360, 640]]) {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "no-preference", deviceScaleFactor: name === "desktop" ? 1 : 2 });
    await context.addInitScript(() => { Element.prototype.requestPointerLock = () => Promise.resolve(); Element.prototype.setPointerCapture = () => {}; });
    const page = await context.newPage(), errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(url.href); await page.locator('.home-journey[data-scene="ready"]').waitFor();
    const mask = await page.addStyleTag({ content: ".home-canvas{transition:none!important;opacity:1!important}.home-story,.home-copy-ground,.home-grain,.home-poster,nextjs-portal{visibility:hidden!important}" });
    if (name !== "compact") await page.locator(".home-stage").screenshot({ path: path.join(assets, name === "desktop" ? "london.jpg" : "london-phone.jpg"), type: "jpeg", quality: 88 });
    await mask.evaluate(e => e.remove());
    const pane = page.locator(".desktop-app-content"); const distance = await page.locator("#home-about").evaluate(e => e.offsetTop);
    for (const [frame, progress] of [["opening", 0], ["turn", 0.3], ["transition", 0.6], ["about", 1]]) {
      await pane.evaluate((e, y) => { e.scrollTop = y; }, distance * progress);
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      await page.screenshot({ path: path.join(review, `${name}-${frame}.png`) });
      report.push({ name, frame, pose: await page.locator(".home-canvas").getAttribute("data-sc-verify-state"), paneScroll: await pane.evaluate(e => e.scrollTop), documentScroll: await page.evaluate(() => scrollY) });
    }
    for (const stop of await page.locator('.home-rest [data-home-stop]').all()) {
      const frame = await stop.getAttribute('data-home-stop');
      await stop.evaluate(e => e.scrollIntoView({ block: 'start' }));
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      await page.screenshot({ path: path.join(review, `${name}-${frame}.png`) });
      report.push({ name, frame, pose: await page.locator('.home-canvas').getAttribute('data-sc-verify-state'), paneScroll: await pane.evaluate(e => e.scrollTop), documentScroll: await page.evaluate(() => scrollY) });
    }
    await pane.evaluate(e => { e.scrollTop = e.scrollHeight; });
    await page.screenshot({ path: path.join(review, `${name}-footer.png`) });
    if (errors.length) throw new Error(errors.join("\n"));
    await context.close();
  }
  await writeFile(path.join(review, "frames.json"), JSON.stringify(report, null, 2) + "\n");
  console.log(`Posters: ${assets}\nReview frames: ${review}`);
} finally { await browser.close(); }

import { test, expect } from "@playwright/test";
test.use({ serviceWorkers: "block" });
test.beforeEach(async ({ page }) => { await page.route(/\/home-media\/.*\.mp4/, r => r.abort()); });

test("homepage enters directly, keeps hero text and scrolls without an entry gate", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Jamie Ho", level: 1 })).toBeVisible();
  await expect(page.getByRole("dialog", { name: "Welcome" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Enter the journey" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /straight to my desktop/i })).toHaveCount(0);
  await expect(page.locator(".journey-cue")).toBeVisible();
  await expect(page.locator('.site-navigation.is-journey')).toHaveAttribute('data-floating', 'false');
  await page.mouse.wheel(0, 1200);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
});

test("editorial introduction keeps full-background framing and the scroll cue opens About", async ({ page }) => {
  await page.goto("/");
  const glass = page.locator('[data-chapter="sky"] .journey-hero-glass');
  await expect(glass).toBeVisible();
  expect(await glass.evaluate(el => getComputedStyle(el).backgroundImage)).toBe("none");
  expect(await glass.evaluate(el => getComputedStyle(el, "::before").backgroundImage)).toContain("radial-gradient");
  expect(await glass.evaluate(el => getComputedStyle(el).backdropFilter)).toBe("none");
  const placement = await page.evaluate(() => {
    const img = document.querySelector<HTMLElement>('[data-chapter="sky"] .journey-hero-day img')!.getBoundingClientRect();
    const description = document.querySelector<HTMLElement>('[data-chapter="sky"] .journey-hero-glass')!.getBoundingClientRect();
    const heading = document.querySelector<HTMLElement>('[data-chapter="sky"] .journey-hero-heading')!.getBoundingClientRect();
    return { fullBackground: Math.abs(img.height - innerHeight) < 2 && Math.abs(img.width - innerWidth) < 2, descriptionBelowCharacters: description.top > innerHeight * .5, headingAboveDescription: heading.bottom < description.top, headingInSky: heading.bottom < innerHeight * (innerWidth <= 768 ? .32 : .28) };
  });
  expect(placement).toEqual({ fullBackground: true, descriptionBelowCharacters: true, headingAboveDescription: true, headingInSky: true });
  await page.getByRole("link", { name: "Scroll to discover" }).click();
  await expect(page.locator('.home-dial:visible [data-dial-step="0"]')).toBeVisible();
  await expect(page.locator(".site-navigation.is-journey")).toHaveAttribute("data-floating", "true");
});

test("legacy journey address redirects to the homepage", async ({ page }) => {
  await page.goto("/journey");
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator(".journey-hero-art")).toHaveCount(1);
});

test("Journey dropdown navigates, keeps the floating controls and returns to the hero", async ({ page }) => {
  await page.goto("/");
  await page.locator(".is-journey [data-menu=journey] summary").click();
  const nav = page.getByRole("navigation", { name: "Journey chapters" });
  await expect(nav.getByRole("button", { name: /Hello/ })).toHaveCount(0);
  await expect(nav.getByRole("button", { name: /Background/ })).toBeVisible();

  await expect(nav.getByRole("button", { name: /What I build/ })).toBeAttached();
  await nav.getByRole("button", { name: /Background/ }).click();
  await expect(page.locator(".site-navigation.is-journey")).toHaveAttribute("data-floating", "true");
  await expect(page.locator('.home-dial:visible [data-dial-step="0"]')).toBeVisible();
  await page.getByRole("link", { name: "Jamie Ho — back to the top" }).click();
  await expect(page.locator(".site-navigation.is-journey")).toHaveAttribute("data-floating", "false");
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(4);
});

test("opening uses artwork and never downloads the opening video", async ({ page }) => {
  const clips: string[] = [];
  page.on("request", r => { if (/c1-.*\.mp4/.test(r.url())) clips.push(r.url()); });
  await page.goto("/");
  await expect(page.locator('[data-chapter="sky"] video')).toHaveCount(0);
  await expect(page.locator('[data-chapter="sky"] .journey-hero-art')).toBeVisible();
  await page.waitForTimeout(500);
  expect(clips).toEqual([]);
});

test("About remains readable without the retired photos, timeline or fullscreen growth", async ({ page }) => {
  await page.goto("/");
  const about = page.locator('[data-chapter="about"]');
  await page.locator(".is-journey [data-menu=journey] summary").click();
  await page.getByRole("navigation", { name: "Journey chapters" }).getByRole("button", { name: /Background/ }).click();
  await expect(page.locator('.home-dial:visible [data-dial-step="0"]')).toBeVisible();
  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(600);
  await expect(page.locator('[data-grow]')).toHaveCount(0);
  await expect(page.locator(".journey-about-photos, .journey-timeline, img[src*=still-westminster]")).toHaveCount(0);
});

test("journey ends with the contact form on the monitor instead of a desktop link", async ({ page }) => {
  await page.goto("/#home-contact");
  const contact = page.getByRole("region", { name: "Contact", exact: true });
  await expect(contact).toBeVisible();
  await expect(contact.getByLabel("Name", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /Switch on the computer/ })).toHaveCount(0);
  await expect(page.getByText("At the desk", { exact: true })).toHaveCount(0);
  await page.locator(".is-journey [data-menu=journey] summary").click();
  await expect(page.getByRole("navigation", { name: "Journey chapters" }).getByRole("button", { name: /Contact/ })).toBeVisible();
  await page.locator(".is-journey [data-menu=journey] summary").click();
  await contact.getByLabel("Name", { exact: true }).fill("Local form test");
  await contact.getByLabel("Email", { exact: true }).fill("visitor@example.test");
  await contact.getByLabel("What do you need?", { exact: true }).fill("Testing the contact form UI.");
  await contact.getByRole("combobox", { name: "Budget", exact: true }).selectOption({ index: 1 });
  // The existing honeypot success path exercises the real server action without writing or emailing.
  await contact.locator('input[name="website"]').evaluate((el: HTMLInputElement) => { el.value = "bot.example"; });
  await contact.getByRole("button", { name: "Send", exact: true }).click();
  await expect(contact.getByRole("status")).toContainText("Thanks, your message is in.");
  await expect(page).toHaveURL(/\/#home-contact$/);
});

test("reduced motion keeps readable stills and the contact form", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".journey-stills")).toBeVisible();
  await expect(page.locator(".journey-start")).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Contact", exact: true }).getByLabel("Name", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Contact", exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("phone keeps all sections usable with no sideways overflow or video downloads", async ({ page }) => {
  test.skip(test.info().project.name !== "phone", "phone mode");
  const clips: string[] = [];
  page.on("request", r => { if (/\.mp4/.test(r.url())) clips.push(r.url()); });
  await page.goto("/");
  const hero = page.locator('[data-chapter="sky"] .journey-hero-day img');
  await expect.poll(() => hero.evaluate((img: HTMLImageElement) => img.currentSrc)).toMatch(/dayPortrait-/);
  const height = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  for (const f of [0, .2, .5, .8, 1]) {
    await page.evaluate(y => scrollTo(0, y), height * f);
    await page.waitForTimeout(250);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  expect(clips).toEqual([]);
  await expect(page.getByRole("region", { name: "Contact", exact: true })).toBeVisible();
});


test("About text remains readable and inactive project links cannot intercept the biography", async ({ page }) => {
  await page.goto("/");
  await page.locator(".is-journey [data-menu=journey] summary").click();
  await page.getByRole("navigation", { name: "Journey chapters" }).getByRole("button", { name: "Background", exact: true }).click();
  const about = page.locator('[data-chapter="about"]');
  await expect(page.locator('.home-dial:visible [data-dial-step="0"]')).toBeVisible();
  await expect(about).not.toHaveAttribute("inert");
  await expect(page.locator('[data-chapter="sky"]')).toHaveAttribute("inert", "");
  await expect(about.locator(".dial-prose a")).toHaveCount(0);
  await expect(about.locator('.journey-about-photos')).toHaveCount(0);
  await page.waitForTimeout(1800);
  const body = page.locator(".home-dial:visible .dial-prose");
  if (await body.count()) {
    const intercepted = await body.evaluate(el => {
      const r = el.getBoundingClientRect();
      // Model a project child overriding visibility inside an invisible inactive chapter.
      const inactive = document.querySelector<HTMLElement>('[data-chapter="sky"]')!;
      const link = document.createElement('a'); link.href = 'https://example.com/finai'; link.textContent = 'Hidden project';
      Object.assign(link.style, {position:'fixed',left:r.x+'px',top:r.y+'px',width:r.width+'px',height:r.height+'px',visibility:'visible',zIndex:'999'});
      inactive.append(link);
      const intercepted = !!document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)?.closest('a');
      link.remove(); return intercepted;
    });
    expect(intercepted).toBe(false);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('Schedule a call jumps directly to the Contact form',async({page})=>{
 await page.goto('/');
 const call=page.getByRole('link',{name:'Schedule a call',exact:true});
 await expect(call).toHaveAttribute('href','#home-contact');await call.click();
 await expect(page.getByRole('region',{name:'Contact',exact:true}).getByLabel('Name',{exact:true})).toBeVisible();
});

for(const anchor of ['background','about','pivot'])test(`${anchor} hash lands on canonical About, including hash changes`,async({page})=>{
 await page.goto('/#'+anchor);const about=page.locator('.home-dial:visible [data-dial-step="0"]');await expect(about).toBeVisible();
 const nav=page.locator('.site-navigation.is-journey');await expect(nav.locator('[data-menu="my story"] summary')).toBeVisible();
 await nav.getByRole('link',{name:'Jamie Ho — back to the top'}).click();await expect(nav).toHaveAttribute('data-floating','false');
 await page.evaluate(()=>{location.hash='sky'});await page.evaluate(hash=>{location.hash=hash},anchor);await expect(about).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('reduced motion and no JavaScript retain canonical/legacy anchors without retired media',async({page,browser},info)=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/#pivot');
 expect(await page.locator('#about #pivot').count()).toBe(1);
 expect(await page.locator('#about').evaluate(el=>Math.abs(el.getBoundingClientRect().top))).toBeLessThan(3);
 await expect(page.locator('.journey-about-photos, .journey-timeline, img[src*=still-westminster]')).toHaveCount(0);
 const context=await browser.newContext({javaScriptEnabled:false,viewport:info.project.use.viewport});
 try{const still=await context.newPage();await still.goto('/#about');await expect(still.locator('.journey-stills #about')).toBeVisible();await expect(still.locator('#about #pivot')).toHaveCount(1);expect(await still.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}finally{await context.close();}
});

test('About text and photos stay on their own opaque section through chapter handovers',async({page})=>{
 await page.goto('/#about');const about=page.locator('[data-chapter="about"]');await expect(page.locator('.home-dial:visible [data-dial-step="0"]')).toBeVisible();
 await expect(about).toHaveCSS('isolation','isolate');await expect(about).toHaveCSS('overflow','clip');await expect(about).toHaveCSS('background-color','rgb(27, 35, 51)');
 // Model elevated descendants in a neighbouring chapter: their z-index must remain contained.
 await page.evaluate(()=>{const hero=document.querySelector<HTMLElement>('.journey-hero-art');if(hero)hero.style.zIndex='999';});
 await page.waitForTimeout(1800);
 expect(await page.locator('.home-dial:visible').evaluate(el=>getComputedStyle(el).backgroundColor)).toBe('rgb(27, 35, 51)');
 const rectangle=await about.boundingBox();const title=await page.locator('.home-dial:visible h2').first().boundingBox();expect(title!.y).toBeGreaterThanOrEqual(rectangle!.y);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

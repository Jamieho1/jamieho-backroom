import {test,expect,type Page} from '@playwright/test';

/** Day / Night on the pages that used to be navy-only (app/day-theme.css). Night keeps each page's own navy; Day is the /content cream. */
const CREAM='rgb(246, 242, 234)',NAVY='rgb(27, 35, 51)';
const bodyBg=(page:Page)=>page.evaluate(()=>getComputedStyle(document.body).backgroundColor);
const fits=(page:Page)=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth);
const auto=(page:Page)=>page.addInitScript(()=>{try{localStorage.setItem('jb.theme','auto')}catch{}});

for(const [scheme,bg] of [['light',CREAM],['dark',NAVY]] as const){
 test(`My story follows Auto (${scheme} system)`,async({page})=>{
  await auto(page);await page.emulateMedia({colorScheme:scheme,reducedMotion:'reduce'});await page.goto('/about');
  await expect(page.locator('.story-editorial')).toHaveCSS('background-color',bg);if(scheme==='light')expect(await bodyBg(page)).toBe(CREAM);
  await expect(page.locator('.story-editorial .sty-eyebrow').first()).toHaveCSS('color',scheme==='light'?'rgb(138, 101, 20)':'rgb(232, 196, 106)');
  expect(await fits(page)).toBe(true);
 });
 test(`Home sections follow Auto (${scheme} system)`,async({page})=>{
  await auto(page);await page.emulateMedia({colorScheme:scheme,reducedMotion:'reduce'});await page.goto('/');
  await expect(page.locator('.journey-stills #about .home-dial').first()).toHaveCSS('background-color',bg);
  await expect(page.locator('.journey-stills .wib').first()).toHaveCSS('background-color',scheme==='light'?CREAM:'rgb(16, 23, 37)');
  await expect(page.locator('#contact')).toHaveCSS('background-color',bg);
  await expect(page.locator('#contact .brief-heading')).toHaveCSS('color',scheme==='light'?NAVY:'rgb(243, 238, 230)');
  // Creator is cream by design in Day and turns navy in Night.
  await expect(page.locator('.journey-stills #creator')).toHaveCSS('background-color',scheme==='light'?'rgb(246, 243, 238)':NAVY);
  expect(await fits(page)).toBe(true);
 });
}

test('Night is the default even when the computer is in light mode, and when storage is blocked',async({page,browser},info)=>{
 await page.emulateMedia({colorScheme:'light',reducedMotion:'reduce'});await page.goto('/about');
 await expect(page.locator('.story-editorial')).toHaveCSS('background-color',NAVY);
 await page.goto('/');await expect(page.locator('#contact')).toHaveCSS('background-color',NAVY);
 const ctx=await browser.newContext({viewport:info.project.use.viewport,colorScheme:'light'});try{const p=await ctx.newPage();await p.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked')}})});await p.goto('/about');expect(await p.evaluate(()=>document.documentElement.dataset.theme)).toBe('dark');}finally{await ctx.close();}
});

test('the Day / Night toggle overrides the system setting',async({page})=>{
 await page.emulateMedia({colorScheme:'light',reducedMotion:'reduce'});
 await page.addInitScript(()=>{try{localStorage.setItem('jb.theme','dark')}catch{}});
 await page.goto('/about');await expect(page.locator('.story-editorial')).toHaveCSS('background-color',NAVY);
 await page.evaluate(()=>{document.documentElement.dataset.theme='light'});
 await expect(page.locator('.story-editorial')).toHaveCSS('background-color',CREAM);
});

test('in Day, keyboard focus on home chips is the darker text gold',async({page})=>{
 await auto(page);await page.emulateMedia({colorScheme:'light',reducedMotion:'reduce'});await page.goto('/');
 const chip=page.locator('.journey-stills .wib .chip').first();await chip.focus();await expect(chip).toHaveCSS('color','rgb(138, 101, 20)');
});

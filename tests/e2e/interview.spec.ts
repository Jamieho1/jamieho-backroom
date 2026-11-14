import {test,expect} from '@playwright/test';
const overflow=async(page:import('@playwright/test').Page)=>expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
test('Interview renders its own dark shell and every rail destination is a working placeholder',async({page},info)=>{
 await page.emulateMedia({colorScheme:'light'});await page.goto('/interview');await expect(page.getByRole('heading',{level:1,name:'Dashboard',exact:true})).toBeVisible();await expect(page.locator('.site-header,.site-navigation')).toHaveCount(0);expect(await page.locator('.iv-shell').evaluate(el=>getComputedStyle(el).backgroundColor)).toBe('rgb(14, 19, 28)');
 for(const [label,url] of [['Data Structures & Algorithms','/interview/dsa/practice'],['System Design','/interview/system-design/practice'],['Low Level Design','/interview/low-level-design/practice'],['Finance','/interview/finance/practice'],['AI Engineering','/interview/ai-engineering/practice'],['Resume','/interview/resume'],['Behavioral','/interview/behavioral'],['Companies','/interview/companies'],['Roadmaps','/interview/roadmaps'],['Application Tracker','/interview/applications']]){
  if(info.project.name==='phone')await page.getByRole('button',{name:'Open interview menu'}).click();
  await page.getByRole('navigation',{name:'Interview sections'}).getByRole('link',{name:label,exact:true}).click();await expect(page).toHaveURL(url);await expect(page.getByRole('heading',{level:1,name:label,exact:true})).toBeVisible();await expect(page.locator('.iv-soon')).toHaveText('Soon');await overflow(page);
 }
 await page.screenshot({path:info.outputPath('interview.png')});
});
test('desktop collapse modes persist, tooltips work on hover/focus and keyboard reaches topics',async({page},info)=>{
 test.skip(info.project.name==='phone','desktop controls');await page.goto('/interview/dsa/practice');await expect(page.getByRole('navigation',{name:'Topics'}).getByRole('link')).toHaveCount(17);
 await page.getByRole('button',{name:'Collapse section rail'}).click();const finance=page.getByRole('link',{name:'Finance',exact:true});await finance.hover();await expect(page.getByRole('tooltip')).toHaveText('Finance');await page.mouse.move(600,100);await finance.focus();await expect(page.getByRole('tooltip')).toHaveText('Finance');await page.keyboard.press('Tab');await expect(page.getByRole('tooltip')).toHaveText('AI Engineering');
 await page.getByRole('button',{name:'Collapse topics'}).click();await expect(page.getByRole('complementary',{name:'Topic list'})).not.toBeVisible();await expect(page.getByRole('button',{name:'Expand topics'})).toBeVisible();await page.reload();await expect(page.getByRole('button',{name:'Expand section rail'})).toBeVisible();await expect(page.getByRole('button',{name:'Expand topics'})).toBeVisible();
 await page.getByRole('button',{name:'Expand topics'}).click();await page.getByRole('navigation',{name:'Topics'}).getByRole('link',{name:'Trees',exact:true}).focus();await page.keyboard.press('Enter');await expect(page).toHaveURL('/interview/dsa/practice/trees');await expect(page.getByRole('heading',{level:1,name:'Trees'})).toBeVisible();await overflow(page);
});
test('phone drawer traps focus, closes with Escape, and Topics reveals selectable topics',async({page},info)=>{
 test.skip(info.project.name!=='phone','phone controls');await page.goto('/interview/dsa/practice');await expect(page.getByRole('complementary',{name:'Interview menu'})).not.toBeVisible();await page.getByRole('button',{name:'Open interview menu'}).click();const drawer=page.getByRole('dialog',{name:'Interview menu'});await expect(drawer).toBeVisible();await expect(drawer.getByRole('link',{name:'Jamie Ho — home'})).toBeFocused();await page.keyboard.press('Shift+Tab');await expect(drawer.getByRole('link',{name:'Back to site'})).toBeFocused();await page.keyboard.press('Tab');await expect(drawer.getByRole('link',{name:'Jamie Ho — home'})).toBeFocused();await page.keyboard.press('Escape');await expect(drawer).toHaveCount(0);await expect(page.getByRole('button',{name:'Open interview menu'})).toBeFocused();
 const topics=page.getByRole('button',{name:'Topics',exact:true});await topics.click();await expect(topics).toHaveAttribute('aria-expanded','true');await page.getByRole('navigation',{name:'Topics'}).getByRole('link',{name:'Arrays & Hashing',exact:true}).click();await expect(page).toHaveURL('/interview/dsa/practice/arrays-hashing');await expect(topics).toHaveAttribute('aria-expanded','false');await expect(page.getByRole('heading',{level:1,name:'Arrays & Hashing'})).toBeVisible();await overflow(page);
});
test('blocked browser storage leaves the shell usable and the saved desktop state does not hide phone menus',async({page},info)=>{
 await page.addInitScript(()=>{Storage.prototype.getItem=()=>{throw Error('blocked')};Storage.prototype.setItem=()=>{throw Error('blocked')};});await page.goto('/interview/dsa/practice');
 if(info.project.name==='phone'){await page.getByRole('button',{name:'Topics',exact:true}).click();await expect(page.getByRole('navigation',{name:'Topics'})).toBeVisible();}else{await page.getByRole('button',{name:'Collapse topics'}).click();await page.getByRole('button',{name:'Expand topics'}).click();await expect(page.getByRole('navigation',{name:'Topics'})).toBeVisible();}await overflow(page);
});
test('Interview is between Projects and Articles; Resources has only Guides; old app routes still work',async({page})=>{
 await page.goto('/resources');const nav=page.getByRole('navigation',{name:'Site',exact:true});expect(await nav.locator(':scope > a').allTextContents()).toEqual(['Projects','Interview','Articles','Resources','Privacy']);await expect(nav.getByRole('link',{name:'Interview',exact:true})).toHaveAttribute('href','/interview');await expect(page.getByRole('heading',{name:'Guides',exact:true})).toBeVisible();await expect(page.locator('.resource-card,.resource-preview')).toHaveCount(0);await overflow(page);
 for(const url of ['/notes','/practices','/practices/217','/behavioral']){const response=await page.goto(url);expect(response?.status()).toBe(200);await expect(page.getByRole('navigation',{name:'Site',exact:true})).toBeVisible();await expect(page.getByText('Sign in to unlock',{exact:true})).toBeVisible();await overflow(page);}
});

test('topic mode links preserve the selected DSA topic',async({page},info)=>{
 await page.goto('/interview/dsa/practice/trees');if(info.project.name==='phone')await page.getByRole('button',{name:'Topics',exact:true}).click();
 await page.getByRole('link',{name:'Notes',exact:true}).click();await expect(page).toHaveURL('/interview/dsa/notes/trees');await expect(page.getByRole('heading',{level:1,name:'Trees'})).toBeVisible();
 if(info.project.name==='phone')await page.getByRole('button',{name:'Topics',exact:true}).click();await page.getByRole('link',{name:'Practice',exact:true}).click();await expect(page).toHaveURL('/interview/dsa/practice/trees');
});

test('desktop collapse preferences do not hide the phone drawer or Topics',async({page},info)=>{
 test.skip(info.project.name!=='phone','phone preference override');
 await page.addInitScript(()=>{localStorage.setItem('jb.interview.rail-collapsed.v1','true');localStorage.setItem('jb.interview.topics-collapsed.v1','true');});await page.goto('/interview/dsa/practice');await page.getByRole('button',{name:'Open interview menu'}).click();await expect(page.getByRole('dialog',{name:'Interview menu'}).getByRole('link',{name:'Data Structures & Algorithms',exact:true})).toBeVisible();await page.keyboard.press('Escape');await page.getByRole('button',{name:'Topics',exact:true}).click();await expect(page.getByRole('navigation',{name:'Topics'}).getByRole('link',{name:'Trees',exact:true})).toBeVisible();await overflow(page);
});

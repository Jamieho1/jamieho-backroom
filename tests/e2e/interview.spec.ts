import {test,expect} from '@playwright/test';
const overflow=async(page:import('@playwright/test').Page)=>expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
test('Interview renders its own dark shell and every rail destination is a working placeholder',async({page},info)=>{
 await page.emulateMedia({colorScheme:'light'});await page.goto('/interview');await expect(page.locator('.iv-brand')).toHaveAttribute('aria-label','PassLoop — home');await expect(page.locator('.iv-brand-mark')).toBeAttached();await expect(page.getByRole('heading',{level:1,name:'Dashboard',exact:true})).toBeVisible();await expect(page.locator('.site-header,.site-navigation')).toHaveCount(0);expect(await page.locator('.iv-shell').evaluate(el=>getComputedStyle(el).backgroundColor)).toBe('rgb(14, 19, 28)');
 for(const [label,url] of [['Data Structures & Algorithms','/interview/dsa/practice'],['System Design','/interview/system-design/practice'],['Low Level Design','/interview/low-level-design/practice'],['Finance Engineering','/interview/finance/practice'],['AI Engineering','/interview/ai-engineering/practice'],['FDE','/interview/forward-deploy-engineer'],['Data Science','/interview/data-scientist'],['Full-Stack','/interview/full-stack'],['Machine Learning','/interview/machine-learning'],['Fundamental','/interview/fundamental'],['SQL','/interview/sql'],['Project','/interview/project'],['Mock Interview','/interview/mock-interview'],['Resume','/interview/resume'],['Behavioral','/interview/behavioral'],['Companies','/interview/companies'],['Roadmaps','/interview/roadmaps'],['Application Tracker','/interview/applications']]){
  if(info.project.name==='phone')await page.getByRole('button',{name:'Open interview menu'}).click();
  await page.getByRole('navigation',{name:'Interview sections'}).getByRole('link',{name:label,exact:true}).click();await expect(page).toHaveURL(url);await expect(page.getByRole('heading',{level:1,name:label,exact:true})).toBeVisible();if(!url.includes('/practice')&&url!=='/interview/resume'&&url!=='/interview/behavioral')await expect(page.locator('.iv-soon')).toHaveText('Soon');if(['FDE','Data Science','Mock Interview','Full-Stack','Machine Learning','Fundamental','SQL','Project'].includes(label))await expect(page.getByText('This workspace is coming soon. Your interview preparation will live here.',{exact:true})).toBeVisible();await overflow(page);
 }
 await page.screenshot({path:info.outputPath('interview.png')});
});
test('desktop collapse modes persist, tooltips work on hover/focus and keyboard reaches topics',async({page},info)=>{
 test.skip(info.project.name==='phone','desktop controls');await page.goto('/interview/dsa/practice');await expect(page.getByRole('navigation',{name:'Topics'}).getByRole('link')).toHaveCount(17);
 await page.setViewportSize({width:1280,height:720});
 expect(await page.locator('.iv-topics').evaluate(el=>el.scrollHeight<=el.clientHeight)).toBe(true);
 // The expanded taxonomy scrolls independently without moving the rail header/account controls.
 expect(await page.locator('.iv-sections').evaluate(el=>getComputedStyle(el).overflowY)).toBe('auto');
 await page.getByRole('link',{name:'Application Tracker',exact:true}).scrollIntoViewIfNeeded();await expect(page.getByRole('link',{name:'Application Tracker',exact:true})).toBeVisible();
 await page.getByRole('link',{name:'Dashboard',exact:true}).scrollIntoViewIfNeeded();
 const logo=await page.locator('.iv-brand').boundingBox(),toggle=await page.getByRole('button',{name:'Collapse section rail'}).boundingBox();expect(Math.abs(logo!.y+logo!.height/2-toggle!.y-toggle!.height/2)).toBeLessThan(2);expect(toggle!.x).toBeGreaterThan(logo!.x+logo!.width);
 const topicCollapse=await page.getByRole('button',{name:'Collapse topics'}).boundingBox();
 const centerY=(box:{y:number;height:number})=>box.y+box.height/2;
 expect(Math.abs(centerY(toggle!)-centerY(topicCollapse!))).toBeLessThan(1);
 await expect(page.getByRole('button',{name:'Collapse section rail'})).toHaveText('');

 await page.getByRole('button',{name:'Collapse section rail'}).click();
 await expect(page.locator('.iv-brand')).toBeHidden();await expect(page.locator('.iv-brand-mark')).toBeHidden();
 const expandRail=await page.getByRole('button',{name:'Expand section rail'}).boundingBox();
 const dashboardIcon=await page.getByRole('link',{name:'Dashboard',exact:true}).locator('.iv-icon').boundingBox();
 expect(Math.abs(expandRail!.y+expandRail!.height/2-toggle!.y-toggle!.height/2)).toBeLessThan(1);expect(Math.abs(expandRail!.x+expandRail!.width/2-dashboardIcon!.x-dashboardIcon!.width/2)).toBeLessThan(1);
 const railLine=await page.locator('.iv-group').first().boundingBox();
 const contentLine=await page.locator('.iv-content-toolbar').evaluate(el=>{const style=getComputedStyle(el,'::after');return el.getBoundingClientRect().top+parseFloat(style.top);});
 expect(Math.abs(contentLine-railLine!.y)).toBeLessThan(1);
 const finance=page.getByRole('link',{name:'Finance Engineering',exact:true});await finance.hover();await expect(page.getByRole('tooltip')).toHaveText('Finance Engineering');await page.mouse.move(600,100);await finance.focus();await expect(page.getByRole('tooltip')).toHaveText('Finance Engineering');await page.keyboard.press('Tab');await expect(page.getByRole('tooltip')).toHaveText('AI Engineering');
 await page.getByRole('button',{name:'Collapse topics'}).click();await expect(page.getByRole('complementary',{name:'Topic list'})).not.toBeVisible();await expect(page.getByRole('button',{name:'Topics'})).toBeVisible();
 const expandTopics=await page.getByRole('button',{name:'Topics'}).boundingBox();
 expect(Math.abs(centerY(expandTopics!)-centerY(topicCollapse!))).toBeLessThan(1);
 await page.reload();await expect(page.getByRole('button',{name:'Expand section rail'})).toBeVisible();await expect(page.getByRole('button',{name:'Topics'})).toBeVisible();
 await page.getByRole('button',{name:'Topics'}).click();await page.getByRole('navigation',{name:'Topics'}).getByRole('link',{name:'Trees',exact:true}).focus();await page.keyboard.press('Enter');await expect(page).toHaveURL('/interview/dsa/practice/trees');await expect(page.getByRole('heading',{level:1,name:'Trees'})).toBeVisible();await overflow(page);
});
test('phone drawer traps focus, closes with Escape, and Topics reveals selectable topics',async({page},info)=>{
 test.skip(info.project.name!=='phone','phone controls');await page.goto('/interview/dsa/practice');await expect(page.getByRole('complementary',{name:'Interview menu'})).not.toBeVisible();await page.getByRole('button',{name:'Open interview menu'}).click();const drawer=page.getByRole('dialog',{name:'Interview menu'});await expect(drawer).toBeVisible();await expect(drawer.getByRole('link',{name:'PassLoop — home'})).toBeFocused();await page.keyboard.press('Shift+Tab');await expect(drawer.getByRole('link',{name:'Back to site'})).toBeFocused();await page.keyboard.press('Tab');await expect(drawer.getByRole('link',{name:'PassLoop — home'})).toBeFocused();await page.keyboard.press('Escape');await expect(drawer).toHaveCount(0);await expect(page.getByRole('button',{name:'Open interview menu'})).toBeFocused();
 const topics=page.getByRole('button',{name:'Topics',exact:true});await topics.click();await expect(topics).toHaveAttribute('aria-expanded','true');await page.getByRole('navigation',{name:'Topics'}).getByRole('link',{name:'Arrays & Hashing',exact:true}).click();await expect(page).toHaveURL('/interview/dsa/practice/arrays-hashing');await expect(topics).toHaveAttribute('aria-expanded','false');await expect(page.getByRole('heading',{level:1,name:'Arrays & Hashing'})).toBeVisible();await overflow(page);
});
test('blocked browser storage leaves the shell usable and the saved desktop state does not hide phone menus',async({page},info)=>{
 await page.addInitScript(()=>{Storage.prototype.getItem=()=>{throw Error('blocked')};Storage.prototype.setItem=()=>{throw Error('blocked')};});await page.goto('/interview/dsa/practice');
 if(info.project.name==='phone'){await page.getByRole('button',{name:'Topics',exact:true}).click();await expect(page.getByRole('navigation',{name:'Topics'})).toBeVisible();}else{await page.getByRole('button',{name:'Collapse topics'}).click();await page.getByRole('button',{name:'Topics'}).click();await expect(page.getByRole('navigation',{name:'Topics'})).toBeVisible();}await overflow(page);
});
test('Interview is between Projects and Articles; Resources has only Guides; old app routes still work',async({page})=>{
 await page.goto('/resources');const nav=page.getByRole('navigation',{name:'Site',exact:true});expect(await nav.locator(':scope > a').allTextContents()).toEqual(['Interview Prep']);await expect(nav.getByRole('link',{name:'Interview Prep',exact:true})).toHaveAttribute('href','/interview');await expect(page.getByRole('heading',{name:'Guides',exact:true})).toBeVisible();await expect(page.locator('.resource-card,.resource-preview')).toHaveCount(0);await overflow(page);
 for(const url of ['/notes','/practices','/practices/217','/behavioral']){const response=await page.goto(url);expect(response?.status()).toBe(200);await expect(page.getByRole('navigation',{name:'Site',exact:true})).toBeVisible();if(url==='/notes')await expect(page.getByRole('heading',{name:'Sign in to read Notes'})).toBeVisible();else if(url==='/behavioral')await expect(page.getByRole('link',{name:'Open Behavioral Playbook'})).toBeVisible();else await expect(page.getByLabel('Python code',{exact:true})).toBeVisible();await overflow(page);}
});

test('topic mode links preserve the selected DSA topic',async({page},info)=>{
 await page.goto('/interview/dsa/practice/trees');if(info.project.name==='phone')await page.getByRole('button',{name:'Topics',exact:true}).click();
 await page.getByRole('link',{name:'Notes',exact:true}).click();await expect(page).toHaveURL('/interview/dsa/notes/trees');await expect(page.getByRole('heading',{name:'Sign in to read Notes'})).toBeVisible();
 if(info.project.name==='phone')await page.getByRole('button',{name:'Topics',exact:true}).click();await page.getByRole('link',{name:'Practice',exact:true}).click();await expect(page).toHaveURL('/interview/dsa/practice/trees');
});

test('desktop collapse preferences do not hide the phone drawer or Topics',async({page},info)=>{
 test.skip(info.project.name!=='phone','phone preference override');
 await page.addInitScript(()=>{localStorage.setItem('jb.interview.rail-collapsed.v1','true');localStorage.setItem('jb.interview.topics-collapsed.v1','true');});await page.goto('/interview/dsa/practice');await page.getByRole('button',{name:'Open interview menu'}).click();await expect(page.getByRole('dialog',{name:'Interview menu'}).getByRole('link',{name:'Data Structures & Algorithms',exact:true})).toBeVisible();await page.keyboard.press('Escape');await page.getByRole('button',{name:'Topics',exact:true}).click();await expect(page.getByRole('navigation',{name:'Topics'}).getByRole('link',{name:'Trees',exact:true})).toBeVisible();await overflow(page);
});

test('DSA questions search and open a full-width workspace; Notes switch keeps topic',async({page},info)=>{
 await page.goto('/interview/dsa/practice/arrays-hashing');
 await expect(page.getByRole('heading',{level:1,name:'Arrays & Hashing'})).toBeVisible();
 await page.getByRole('searchbox',{name:'Search questions'}).fill('Contains Duplicate');
 await expect(page.locator('.iv-questions > li')).toHaveCount(1);
 await expect(page.locator('.iv-question-progress')).toHaveCount(0);
 await expect(page.locator('.iv-flag,.iv-completion')).toHaveCount(0);
 await page.locator('.iv-questions a').click();await expect(page).toHaveURL('/interview/problems/217');
 await expect(page.getByRole('region',{name:'Contains Duplicate',exact:true})).toBeVisible();
 await expect(page.locator('.practice-sidebar')).toHaveCount(0);await overflow(page);
 if(info.project.name==='desktop')await expect(page.locator('.iv-shell')).toHaveAttribute('data-topics-collapsed','true');
 if(info.project.name==='phone')await page.getByRole('button',{name:'Topics',exact:true}).click();else await page.getByRole('button',{name:'Topics',exact:true}).click();
 await page.getByRole('link',{name:'Notes',exact:true}).click();await expect(page).toHaveURL('/interview/dsa/notes/arrays-hashing');
 await expect(page.getByRole('heading',{name:'Sign in to read Notes'})).toBeVisible();
 if(info.project.name==='phone')await page.getByRole('button',{name:'Topics',exact:true}).click();
 await page.getByRole('link',{name:'Practice',exact:true}).click();await expect(page).toHaveURL('/interview/dsa/practice/arrays-hashing');
 await overflow(page);
});
test('practice workspace executes the existing Python runner on the new address',async({page},info)=>{
 test.skip(info.project.name!=='desktop','Runner is the same at both sizes');test.setTimeout(120000);
 await page.goto('/interview/problems/217');
 await expect(page.getByRole('button',{name:'Run',exact:true})).toBeEnabled({timeout:60000});
 await page.getByRole('tab',{name:'Solution',exact:true}).click();
 const solution=await page.locator('.practice-approach[data-optimal="true"] pre.code').textContent();
 const editor=page.getByRole('textbox',{name:'Python code',exact:true});
 await editor.fill(solution!);await page.getByRole('button',{name:'Run',exact:true}).click();
 await expect(page.getByRole('region',{name:'Test results'})).toContainText('passed',{timeout:60000});
 await expect(page.getByRole('region',{name:'Test results'})).not.toContainText('fail');
});


test('reduced motion keeps Interview collapse, drawer and Topics controls usable',async({page},info)=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/interview/dsa/practice/arrays-hashing');
 if(info.project.name==='phone'){
  await page.getByRole('button',{name:'Open interview menu'}).click();await expect(page.getByRole('dialog',{name:'Interview menu'})).toBeVisible();
  expect(await page.locator('.iv-rail').evaluate(el=>getComputedStyle(el).transitionDuration)).toBe('0s');
  await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Open interview menu'})).toBeFocused();
  await page.getByRole('button',{name:'Topics',exact:true}).click();await expect(page.getByRole('navigation',{name:'Topics',exact:true})).toBeVisible();
  await page.getByRole('navigation',{name:'Topics',exact:true}).getByRole('link',{name:'Trees',exact:true}).click();await expect(page).toHaveURL('/interview/dsa/practice/trees');
 }else{
  await page.getByRole('button',{name:'Collapse section rail'}).click();await page.getByRole('button',{name:'Expand section rail'}).click();
  await page.getByRole('button',{name:'Collapse topics'}).click();await page.getByRole('button',{name:'Topics',exact:true}).click();
  await page.getByRole('navigation',{name:'Topics',exact:true}).getByRole('link',{name:'Trees',exact:true}).click();await expect(page).toHaveURL('/interview/dsa/practice/trees');
 }
 await expect(page.getByRole('heading',{name:'Trees',level:1,exact:true})).toBeVisible();await overflow(page);
});

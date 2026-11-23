import {test,expect,type Page} from '@playwright/test';
const api=process.env.CONTENT_PREVIEW_TEST_API;
test.skip(!api,'Requires the disposable migrated loopback API');
async function local(path:string,body?:unknown){if(!api||!/^http:\/\/127\.0\.0\.1:\d+$/.test(api))throw Error('Disposable API required');const r=await fetch(api+path,body?{method:'POST',body:JSON.stringify(body)}:undefined);if(!r.ok)throw Error(await r.text());return r.json();}
async function signIn(page:Page,baseURL:string,role='owner'){const {cookie}=await local('/__session?role='+role);await page.context().addCookies([{...cookie,url:baseURL}]);}
const fits=async(page:Page)=>expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
const seed=async(roleNote=true)=>{await local('/__company_page_seed',{});await local('/__experiences_seed',{});await local('/__prep_seed',{roleNote});};
test.beforeEach(async()=>{await seed();});
const story='/interview/companies/synthetic-labs/experiences/synthetic-interview';
test('C4 visitors see grouped What to prepare links and inline chips; unknown chips stay plain text',async({page},info)=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(story);
 const block=page.getByRole('region',{name:'What to prepare',exact:true});await expect(block).toBeVisible();
 for(const group of ['Concepts','Practice','Behavioral'])await expect(block.getByRole('region',{name:group,exact:true})).toBeVisible();
 const concepts=block.getByRole('region',{name:'Concepts',exact:true}).getByRole('link');await expect(concepts).toHaveCount(2);await expect(concepts.nth(0)).toHaveText('Locking');await expect(concepts.nth(0)).toHaveAttribute('href','/interview/full-stack/notes/full-stack-locking');await expect(concepts.nth(1)).toHaveText('Synthetic architecture');
 const practice=block.getByRole('region',{name:'Practice',exact:true}).getByRole('link');await expect(practice).toHaveCount(2);await expect(practice.nth(0)).toContainText('LRU Cache');await expect(practice.nth(0)).toContainText('Medium');await expect(practice.nth(0)).toHaveAttribute('href','/interview/problems/146');await expect(practice.nth(1)).toContainText('Two Sum');
 const theme=block.getByRole('region',{name:'Behavioral',exact:true}).getByRole('link');await expect(theme).toHaveText('Conflict');await expect(theme).toHaveAttribute('href','/interview/behavioral/themes/conflict');
 await expect(block.getByRole('img')).toHaveCount(0);await expect(block).not.toContainText('answered');
 const article=page.locator('.iv-experience-article');const chips=article.locator('a.iv-chip');await expect(chips).toHaveCount(3);await expect(chips.nth(0)).toHaveText('LRU Cache');await expect(chips.nth(0)).toHaveAttribute('href','/interview/problems/146');await expect(chips.nth(1)).toHaveText('Locking');await expect(chips.nth(2)).toHaveText('Conflict');
 await expect(article).toContainText('unknown no-such-note stays plain text');expect(await article.innerHTML()).not.toContain('[[');
 const summary=page.getByRole('region',{name:'What to prepare summary',exact:true});
 if(info.project.name==='phone')await expect(summary).toBeHidden();else{await expect(summary).toBeVisible();await expect(summary.getByRole('link')).toHaveCount(5);const box=await summary.boundingBox(),art=await article.boundingBox();expect(box!.x).toBeGreaterThan(art!.x+art!.width);}
 const before=page.url();await chips.nth(0).click();await expect(page).toHaveURL(/\/interview\/problems\/146$/);expect(page.url()).not.toBe(before);
 await page.goto(story);await fits(page);await page.screenshot({path:info.outputPath('what-to-prepare.png')});
});
test('C4 signed-in readers see done ticks, answered counts and note titles; groups without links are hidden',async({page,baseURL},info)=>{
 await signIn(page,baseURL!);await page.goto(story);
 const block=page.getByRole('region',{name:'What to prepare',exact:true});
 await expect(block.getByRole('link',{name:/Locking mechanisms/})).toBeVisible();
 await expect(block.getByRole('img',{name:'Two Sum completed'})).toBeVisible();await expect(block.getByRole('img',{name:'LRU Cache not completed'})).toBeVisible();
 await expect(block.getByRole('link',{name:/Conflict/})).toContainText(/answered 1 of \d+/);
 const member=await page.context().browser()!.newContext({viewport:page.viewportSize()!});try{const other=await member.newPage();await signIn(other,baseURL!,'member');await other.goto(baseURL+story);const b=other.getByRole('region',{name:'What to prepare',exact:true});await expect(b.getByRole('img',{name:'Two Sum not completed'})).toBeVisible();await expect(b.getByRole('link',{name:/Conflict/})).toContainText('answered 0 of');await fits(other);}finally{await member.close();}
 // Only-practice and no-link stories hide empty groups / the whole block.
 await page.goto('/interview/companies/synthetic-labs/experiences/synthetic-interview-3');const only=page.getByRole('region',{name:'What to prepare',exact:true});await expect(only.getByRole('region')).toHaveCount(1);await expect(only.getByRole('region',{name:'Practice',exact:true})).toBeVisible();
 await page.goto('/interview/companies/synthetic-labs/experiences/synthetic-interview-5');await expect(page.getByRole('region',{name:/What to prepare/})).toHaveCount(0);await fits(page);
});
test('C4 Company Overview lists the most-mentioned topics (top 8) and links to each',async({page},info)=>{
 await page.goto('/interview/companies/synthetic-labs');
 const box=page.getByRole('region',{name:'Most-mentioned topics',exact:true});await expect(box).toBeVisible();const rows=box.getByRole('listitem');await expect(rows).toHaveCount(8);
 await expect(rows.nth(0)).toContainText('LRU Cache');await expect(rows.nth(0)).toContainText('3 experiences');await expect(rows.nth(1)).toContainText('Locking');await expect(rows.nth(1)).toContainText('2 experiences');await expect(rows.nth(2)).toContainText('1 experience');
 await fits(page);await box.getByRole('link',{name:/LRU Cache/}).click();await expect(page).toHaveURL(/\/interview\/problems\/146$/);
 await page.goto('/interview/companies/another-company');await expect(page.getByRole('region',{name:'Most-mentioned topics',exact:true})).toContainText('No topics mentioned yet.');await fits(page);
});
test('C4 role pages list their notes once one exists and stay Soon when empty',async({page,baseURL})=>{
 await page.goto('/interview/full-stack');await expect(page.getByText('Soon',{exact:true})).toBeVisible();
 await signIn(page,baseURL!,'member');await page.goto('/interview/full-stack');
 const list=page.getByRole('region',{name:'Full-Stack topics',exact:true});await expect(list.getByRole('heading',{name:'Full-Stack',level:1})).toBeVisible();await expect(page.getByText('Soon',{exact:true})).toHaveCount(0);
 await list.getByRole('link',{name:/Locking mechanisms/}).click();await expect(page).toHaveURL('/interview/full-stack/notes/full-stack-locking');await expect(page.locator('.iv-note-reader')).toContainText('Synthetic locking note body');await fits(page);
 for(const empty of ['machine-learning','data-scientist','forward-deploy-engineer']){await page.goto('/interview/'+empty);await expect(page.getByText('Soon',{exact:true})).toBeVisible();}
 expect((await page.goto('/interview/full-stack/practice'))?.status()).toBe(404);
 await local('/__prep_seed',{roleNote:false});await page.goto('/interview/full-stack');await expect(page.getByText('Soon',{exact:true})).toBeVisible();await fits(page);
});
test('C4 owner previews and approves prep links and chips; copied cookies reveal only live values',async({page,browser,baseURL},info)=>{
 const summary='C4 preview '+Math.random().toString(16).slice(2);
 await local('/__seed',{summary,operations:[{op:'update',table:'interview_experiences',key:'00000000-0000-4000-8000-000000000982',fields:{prep_links:[{kind:'behavioral_theme',ref:'leadership'},{kind:'note',ref:'full-stack-locking',label:'Proposed locking label'}],body:'## Proposal\nOwner-only [[behavioral:leadership]] chip.'}}]});
 await signIn(page,baseURL!);await page.goto('/manage/review');await page.getByRole('article',{name:summary,exact:true}).getByRole('button',{name:'Preview on page',exact:true}).click();
 await page.getByRole('complementary',{name:'Content preview'}).getByRole('link',{name:'Preview Synthetic experience 2',exact:true}).click();
 const block=page.getByRole('region',{name:'What to prepare',exact:true});await expect(block.getByRole('link')).toHaveText(['Proposed locking label','Leadership']);await expect(page.locator('.iv-experience-article a.iv-chip')).toHaveText('Leadership');
 const url=page.url();const copied=(await page.context().cookies()).filter(c=>['jb.content-preview','__prerender_bypass'].includes(c.name));
 for(const role of ['anonymous','member']){const context=await browser.newContext({viewport:page.viewportSize()!});try{const other=await context.newPage();if(role==='member')await signIn(other,baseURL!,role);await context.addCookies(copied);await other.goto(url);const live=other.getByRole('region',{name:'What to prepare',exact:true});await expect(live.getByRole('link')).toHaveCount(2);expect(await other.content()).not.toContain('Proposed locking label');expect(await other.content()).not.toContain('Owner-only');}finally{await context.close();}}
 await page.getByRole('complementary',{name:'Content preview'}).getByRole('button',{name:'Approve',exact:true}).click();await expect(page.getByRole('complementary',{name:'Content preview'})).toHaveCount(0);await expect(block.getByRole('link')).toContainText(['Proposed locking label','Leadership']);await fits(page);
});

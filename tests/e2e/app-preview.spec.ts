import {test,expect,type Page} from '@playwright/test';
const api=process.env.CONTENT_PREVIEW_TEST_API;
const story='00000000-0000-4000-8000-000000000903';
async function local(path:string,body?:unknown){if(!api||!/^http:\/\/127\.0\.0\.1:\d+$/.test(api))throw Error('Disposable loopback API required');const response=await fetch(api+path,body?{method:'POST',body:JSON.stringify(body)}:undefined);if(!response.ok)throw Error(await response.text());return response.json();}
async function signIn(page:Page,baseURL:string,role='owner'){const {cookie}=await local('/__session?role='+role);await page.context().addCookies([{...cookie,url:baseURL}]);}
async function enter(page:Page,baseURL:string,target='Preview on page'){
 await local('/__app_seed',{});const summary='App proposal '+Math.random().toString(16).slice(2,10);
 const set=await local('/__seed',{summary,operations:[{table:'notes',op:'update',key:'fixture-note',fields:{body:'Draft fixture note'}},{table:'question_notes',op:'update',key:217,fields:{body:'Draft fixture question'}},{table:'practice_code',op:'update',key:217,fields:{code:'# Draft fixture code'}},{table:'practice_stars',op:'delete',key:217},{table:'behavioral_stories',op:'update',key:story,fields:{title:'Draft fixture story',situation:'Draft fixture situation'}},{table:'behavioral_answers',op:'update',key:'g-intro',fields:{outline:'Draft fixture outline'}}]});
 await signIn(page,baseURL);await page.goto('/manage/review');const card=page.getByRole('article',{name:summary,exact:true});await expect(card).toContainText('Live fixture note');await expect(card).toContainText('Draft fixture note');await card.getByRole('button',{name:target,exact:true}).click();await expect(page.getByRole('complementary',{name:'Content preview'})).toBeVisible();return {...set,summary};
}
test.describe('real owner app draft previews',()=>{
 test.skip(!api,'requires the disposable local API');test.describe.configure({mode:'serial'});
 test('Notes, Practice and Stories preview read-only with gold outlines and discard restores live values',async({page,baseURL},info)=>{
  const set=await enter(page,baseURL!);
  await expect(page).toHaveURL(/\/interview\/dsa\/notes\/fixture-note$/);
  await expect(page.locator('.notes-main[data-draft-changed="true"]')).toContainText('Draft fixture note');await expect(page.getByRole('button',{name:'Edit',exact:true})).toHaveCount(0);expect((await page.reload())?.headers()['cache-control']).toContain('no-store');
  await page.getByRole('link',{name:'Preview problem 217',exact:true}).click();await expect(page).toHaveURL(/\/interview\/problems\/217$/);await expect(page.getByRole('status').filter({hasText:'Read-only draft preview'})).toBeVisible();
  await expect(page.getByLabel('Python code',{exact:true})).toBeVisible();
  await page.getByRole('tab',{name:'Notes',exact:true}).click();await expect(page.locator('.practice-question-notes[data-draft-changed="true"]')).toContainText('Draft fixture question');await expect(page.locator('.practice-coding[data-draft-changed="true"]')).toContainText('# Draft fixture code');
  await expect(page.getByRole('button',{name:'Run',exact:true})).toBeDisabled();await expect(page.getByRole('button',{name:/Star Contains Duplicate for later/})).toBeDisabled();
  expect(await page.evaluate(()=>JSON.stringify(Object.entries(localStorage)))).not.toContain('Draft fixture code');
  const editor=page.getByLabel('Python code',{exact:true});await expect(editor).toContainText('# Draft fixture code');await editor.click();await page.keyboard.type('Should not save');await expect(editor).not.toContainText('Should not save');
  await page.getByRole('link',{name:'Preview Resume & Stories',exact:true}).click();await expect(page.getByRole('article',{name:'Selected question'})).toContainText('Draft fixture outline');await page.getByText('Story library (1)',{exact:true}).click();await page.getByRole('button',{name:'Draft fixture story',exact:true}).click();await expect(page.getByRole('region',{name:'STAR stories'})).toContainText('Draft fixture situation');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:info.outputPath('app-preview.png')});
  await page.getByRole('button',{name:'Discard',exact:true}).click();await expect(page.getByRole('complementary',{name:'Content preview'})).toHaveCount(0);expect((await local('/__state')).sets.find((s:{id:string})=>s.id===set.id).status).toBe('discarded');
  await page.goto('/notes');await expect(page.locator('.notes-main')).toContainText('Live fixture note');
 });
 test('Approve applies every app operation and clears preview cookies',async({page,baseURL})=>{
  const set=await enter(page,baseURL!);await page.getByRole('button',{name:'Approve',exact:true}).click();await expect(page.getByRole('complementary',{name:'Content preview'})).toHaveCount(0);await expect(page.locator('.notes-main')).toContainText('Draft fixture note');await expect(page.locator('[data-draft-changed="true"]')).toHaveCount(0);
  const state=await local('/__state'),saved=state.sets.find((s:{id:string})=>s.id===set.id);expect(saved.status).toBe('approved');expect(saved.previous).toHaveLength(6);expect(saved.previous.find((p:{table:string})=>p.table==='practice_stars').values.problem).toBe(217);
  expect(state.app.question_notes[0].body).toBe('Draft fixture question');expect(state.app.practice_code[0].code).toBe('# Draft fixture code');expect(state.app.practice_stars).toEqual([]);expect(state.app.behavioral_stories[0].title).toBe('Draft fixture story');expect(state.app.behavioral_answers[0].outline).toBe('Draft fixture outline');
 });
 test('visitors and app-access members with copied valid cookies never receive private draft values',async({page,browser,baseURL})=>{
  const set=await enter(page,baseURL!);const cookies=(await page.context().cookies()).filter(c=>['jb.content-preview','__prerender_bypass'].includes(c.name));
  for(const role of ['anonymous','member']){const context=await browser.newContext({viewport:page.viewportSize()!});const other=await context.newPage();try{
   if(role==='member')await signIn(other,baseURL!,role);await context.addCookies(cookies);
   for(const path of ['/notes','/interview/dsa/notes/fixture-note','/interview/system-design/notes/sd-fixture','/practices/217','/interview/problems/217','/behavioral']){await other.goto(baseURL+path);await expect(other.getByRole('complementary',{name:'Content preview'})).toHaveCount(0);const html=await other.content();for(const secret of ['Draft fixture note','Draft fixture question','Draft fixture code','Draft fixture story','Draft fixture situation','Draft fixture outline',set.summary])expect(html).not.toContain(secret);
    if(role==='member'&&(path==='/notes'||path==='/interview/dsa/notes/fixture-note'))await expect(other.locator('.notes-main')).toContainText('Live fixture note');
    if(role==='member'&&(path==='/practices/217'||path==='/interview/problems/217')){await other.getByRole('tab',{name:'Notes',exact:true}).click();await expect(other.locator('.practice-question-notes')).toContainText('Live fixture question');await expect(other.getByLabel('Python code',{exact:true})).not.toContainText('Live fixture code');}
    if(role==='member'&&path==='/behavioral'){await other.getByRole('tab',{name:'Questions',exact:true}).click();await expect(other.getByRole('article',{name:'Selected question'})).toContainText('Live fixture outline');}
   }
  }finally{await context.close();}}
 });
});

test('Interview topic membership comes from accessible notes and preserves the no-question mode',async({page,baseURL},info)=>{
 test.skip(!api,'requires disposable local API');
 await local('/__app_seed',{});await signIn(page,baseURL!);
 await page.goto('/interview/system-design/practice');
 if(info.project.name==='phone')await page.getByRole('button',{name:'Topics',exact:true}).click();
 await expect(page.getByRole('navigation',{name:'Topics'}).getByRole('link',{name:'Synthetic architecture'})).toBeVisible();
 await page.getByRole('link',{name:'Notes',exact:true}).click();
 await expect(page).toHaveURL('/interview/system-design/notes');
 if(info.project.name==='phone')await page.getByRole('button',{name:'Topics',exact:true}).click();
 await page.getByRole('link',{name:'Synthetic architecture',exact:true}).click();
 await expect(page).toHaveURL('/interview/system-design/notes/sd-fixture');
 await expect(page.locator('.notes-main')).toContainText('Synthetic system note');
 if(info.project.name==='phone')await page.getByRole('button',{name:'Topics',exact:true}).click();
 await expect(page.getByText('Practice · No practice questions yet',{exact:true})).toHaveAttribute('aria-disabled','true');
 await page.goto('/interview/low-level-design/notes/class-design');
 await expect(page.locator('.notes-main')).toContainText('Synthetic class note');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

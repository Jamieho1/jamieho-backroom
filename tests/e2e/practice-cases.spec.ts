import {test,expect,type Page} from '@playwright/test';
import {problemByNumber} from '../../lib/practice/catalog';
async function ready(page:Page,id:number){await page.goto('/interview/problems/'+id);await expect(page.getByRole('button',{name:'Run',exact:true})).toBeEnabled({timeout:60000});}
async function execute(page:Page,code:string,mode:'Run'|'Submit'){const button=page.getByRole('button',{name:mode,exact:true});await expect(button).toBeEnabled({timeout:60000});await page.getByRole('textbox',{name:'Python code',exact:true}).fill(code);await button.click();}
const fits=async(page:Page)=>expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
for(const id of [217,146])test(`P2 ${id} Run/Submit accepts, identifies wrong answers and trims runtime traces`,async({page})=>{
 test.setTimeout(120000);const p=problemByNumber(id)!;await ready(page,id);await expect(page.getByRole('tab',{name:'Test Cases',exact:true})).toBeVisible();
 const inputs=page.getByRole('tabpanel',{name:'Case 1 inputs',exact:true});await expect(inputs.getByRole('textbox')).toHaveCount(id===146?2:1);
 await execute(page,p.solution,'Run');await expect(page.getByRole('region',{name:'Test results'})).toContainText(`Run results · 2/2 passed`,{timeout:60000});await expect(page.getByRole('region',{name:'Test results'})).toContainText('Runtime:');
 if(id===146){await expect(page.getByRole('tabpanel',{name:'Case 1 result',exact:true})).toContainText('null');await expect(page.getByRole('tabpanel',{name:'Case 1 result',exact:true})).not.toContainText('None');}
 await execute(page,p.solution,'Submit');await expect(page.getByRole('heading',{name:`Accepted ${p.tests.length}/${p.tests.length}`,exact:true})).toBeVisible({timeout:60000});
 const wrong=id===217?'class Solution:\n    def containsDuplicate(self, nums):\n        return False':p.solution.replace('return self.data[key]','return -999');
 await execute(page,wrong,'Submit');await expect(page.getByRole('heading',{name:'Wrong answer — first failing case',exact:true})).toBeVisible({timeout:60000});await expect(page.getByRole('region',{name:'Test results'})).toContainText('Expected output');await expect(page.getByRole('region',{name:'Test results'})).toContainText('Your output');
 const error=id===217?'class Solution:\n    def containsDuplicate(self, nums):\n        raise ValueError("synthetic runtime")':'class LRUCache:\n    def __init__(self, capacity): pass\n    def put(self, key, value): pass\n    def get(self, key): raise ValueError("synthetic runtime")';
 await execute(page,error,'Run');await expect(page.getByRole('heading',{name:'Runtime error',exact:true})).toBeVisible({timeout:60000});const trace=page.locator('.pw-test-error');await expect(trace).toContainText('ValueError: synthetic runtime');await expect(trace).toContainText('solution.py');await expect(trace).not.toContainText('harness.py');await fits(page);
});
test('P2 custom inputs persist, unknown expected output stays unknown, stdout expands, and timeouts recover',async({page},info)=>{
 test.setTimeout(120000);await page.emulateMedia({reducedMotion:'reduce'});await ready(page,217);const p=problemByNumber(217)!;
 await page.getByRole('button',{name:'Add custom case'}).click();await page.getByRole('textbox',{name:'nums',exact:true}).fill('[9,9]');await page.reload();await page.getByRole('tab',{name:'Case 3',exact:true}).click();await expect(page.getByRole('textbox',{name:'nums',exact:true})).toHaveValue('[9,9]');
 await execute(page,'print("x" * 1500)\n'+p.solution,'Run');await expect(page.getByRole('tablist',{name:'Case results'}).getByRole('tab')).toHaveCount(3,{timeout:60000});await page.getByRole('tablist',{name:'Case results'}).getByRole('tab').nth(2).click();await expect(page.getByRole('tabpanel',{name:'Case 3 result',exact:true})).toContainText('Not specified for this custom input');await page.getByRole('button',{name:'Show more',exact:true}).click();await expect(page.getByRole('button',{name:'Show less',exact:true})).toBeVisible();
 await page.getByRole('tab',{name:'Test Cases',exact:true}).click();await page.getByRole('button',{name:'Remove Case 3'}).click();await expect(page.getByRole('tab',{name:'Case 3',exact:true})).toHaveCount(0);
 await execute(page,'def invalid syntax!','Run');await expect(page.locator('.pw-test-error')).toContainText('SyntaxError',{timeout:60000});await expect(page.locator('.pw-test-error')).not.toContainText('harness.py');
 await execute(page,'class Solution:\n    def containsDuplicate(self, nums):\n        while True: pass','Run');await expect(page.getByRole('heading',{name:'Time limit exceeded',exact:true})).toBeVisible({timeout:15000});
 await execute(page,p.solution,'Submit');await expect(page.getByRole('heading',{name:`Accepted ${p.tests.length}/${p.tests.length}`,exact:true})).toBeVisible({timeout:60000});await fits(page);await page.screenshot({path:info.outputPath('p2-console.png')});
});
const api=process.env.CONTENT_PREVIEW_TEST_API;
async function local(path:string,body?:unknown){if(!api||!/^http:\/\/127\.0\.0\.1:\d+$/.test(api))throw Error('Local API required');const r=await fetch(api+path,body?{method:'POST',body:JSON.stringify(body)}:undefined);if(!r.ok)throw Error(await r.text());return r.json();}
test('P2 signed-in custom cases sync across browser storage resets and stay isolated between accounts',async({page,browser,baseURL})=>{
 test.skip(!api,'disposable local database required');test.setTimeout(120000);await local('/__app_seed',{});
 const signIn=async(p:Page,role:string)=>{const {cookie}=await local('/__session?role='+role);await p.context().addCookies([{...cookie,url:baseURL!}]);};
 await signIn(page,'owner');const context=await browser.newContext({viewport:page.viewportSize()!});const member=await context.newPage();try{
 await ready(page,217);await page.getByRole('button',{name:'Add custom case'}).click();await page.getByRole('textbox',{name:'nums',exact:true}).fill('[4,4]');await expect.poll(async()=>JSON.stringify((await local('/__state')).app.practice_cases)).toContain('[4,4]');
 await page.evaluate(()=>localStorage.clear());await page.reload();await page.getByRole('tab',{name:'Case 3',exact:true}).click();await expect(page.getByRole('textbox',{name:'nums',exact:true})).toHaveValue('[4,4]');
 await signIn(member,'member');await ready(member,217);await expect(member.getByRole('tab',{name:'Case 3',exact:true})).toHaveCount(0);await member.getByRole('button',{name:'Add custom case'}).click();await member.getByRole('textbox',{name:'nums',exact:true}).fill('[5,5]');await expect.poll(async()=>JSON.stringify((await local('/__state')).app.practice_cases)).toContain('[5,5]');
 await member.evaluate(()=>localStorage.clear());await member.reload();await member.getByRole('tab',{name:'Case 3',exact:true}).click();await expect(member.getByRole('textbox',{name:'nums',exact:true})).toHaveValue('[5,5]');await page.reload();await page.getByRole('tab',{name:'Case 3',exact:true}).click();await expect(page.getByRole('textbox',{name:'nums',exact:true})).toHaveValue('[4,4]');await fits(page);await fits(member);
 }finally{await context.close();}
});

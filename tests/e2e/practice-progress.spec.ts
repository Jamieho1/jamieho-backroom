import {test,expect,type Page} from '@playwright/test';
import {problemByNumber} from '../../lib/practice/catalog';
const api=process.env.CONTENT_PREVIEW_TEST_API;
async function local(path:string,body?:unknown){if(!api||!/^http:\/\/127\.0\.0\.1:\d+$/.test(api))throw Error('Disposable API required');const res=await fetch(api+path,body?{method:'POST',body:JSON.stringify(body)}:undefined);if(!res.ok)throw Error(await res.text());return res.json();}
async function signIn(page:Page,url:string,role:string){const {cookie}=await local('/__session?role='+role);await page.context().addCookies([{...cookie,url}]);}
const fits=async(page:Page)=>expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
test('owner and member have isolated flags, saved code and completions; visitors have no progress controls',async({page,browser,baseURL})=>{
 test.skip(!api,'disposable local API required');test.setTimeout(120000);
 await local('/__app_seed',{});await signIn(page,baseURL!,'owner');const context=await browser.newContext({viewport:page.viewportSize()!});const member=await context.newPage();
 try{
  await signIn(member,baseURL!,'member');await page.goto('/interview/dsa/practice/arrays-hashing');await member.goto('/interview/dsa/practice/arrays-hashing');
  await expect(page.getByRole('button',{name:'Unflag Contains Duplicate',exact:true})).toBeEnabled();
  await expect(member.getByRole('button',{name:'Flag Contains Duplicate',exact:true})).toBeEnabled();
  await member.getByRole('button',{name:'Flag Two Sum',exact:true}).click();await expect(member.getByRole('button',{name:'Unflag Two Sum',exact:true})).toBeEnabled();
  await expect(page.getByRole('button',{name:'Flag Two Sum',exact:true})).toBeEnabled();
  await member.goto('/interview/problems/217');const editor=member.getByRole('textbox',{name:'Python code',exact:true});await expect(editor).toBeVisible();await expect(editor).not.toContainText('Live fixture code');
  await expect(member.getByRole('button',{name:'Run',exact:true})).toBeEnabled({timeout:60000});await editor.fill(problemByNumber(217)!.solution+'\n# Member synthetic code');
  await expect(member.locator('.pw-save-status')).toHaveText('Saved');
  await member.getByRole('button',{name:'Submit',exact:true}).click();await expect(member.getByRole('region',{name:'Test results'})).toContainText('Accepted',{timeout:60000});await expect(member.getByText('Saving attempt…',{exact:true})).toHaveCount(0);
  await member.reload();await expect(member.getByRole('textbox',{name:'Python code',exact:true})).toContainText('Member synthetic code');
  await page.goto('/interview/problems/217');await expect(page.getByRole('textbox',{name:'Python code',exact:true})).toContainText('Live fixture code');await expect(page.getByRole('textbox',{name:'Python code',exact:true})).not.toContainText('Member synthetic code');
  // Prove the other direction too: owner progress on a different problem is never the member's.
  await page.goto('/interview/problems/1');const ownerEditor=page.getByRole('textbox',{name:'Python code',exact:true});
  await expect(page.getByRole('button',{name:'Run',exact:true})).toBeEnabled({timeout:60000});await ownerEditor.fill(problemByNumber(1)!.solution+'\n# Owner synthetic code');
  await expect(page.locator('.pw-save-status')).toHaveText('Saved');
  await page.getByRole('button',{name:'Submit',exact:true}).click();await expect(page.getByRole('region',{name:'Test results'})).toContainText('Accepted',{timeout:60000});await expect(page.getByText('Saving attempt…',{exact:true})).toHaveCount(0);
  await page.reload();await expect(page.getByRole('textbox',{name:'Python code',exact:true})).toContainText('Owner synthetic code');
  await member.goto('/interview/problems/1');await expect(member.getByRole('textbox',{name:'Python code',exact:true})).toBeVisible();await expect(member.getByRole('textbox',{name:'Python code',exact:true})).not.toContainText('Owner synthetic code');
  await member.goto('/interview/dsa/practice/arrays-hashing');await page.goto('/interview/dsa/practice/arrays-hashing');
  await expect(member.getByRole('img',{name:'Contains Duplicate completed',exact:true})).toBeVisible();await expect(page.getByRole('img',{name:'Contains Duplicate not completed',exact:true})).toBeVisible();
  await expect(page.getByRole('img',{name:'Two Sum completed',exact:true})).toBeVisible();await expect(member.getByRole('img',{name:'Two Sum not completed',exact:true})).toBeVisible();
  await member.reload();await expect(member.getByRole('button',{name:'Unflag Two Sum',exact:true})).toBeEnabled();await expect(page.getByRole('button',{name:'Flag Two Sum',exact:true})).toBeEnabled();await fits(member);await fits(page);
  const visitor=await browser.newPage({viewport:page.viewportSize()!});try{await visitor.goto(baseURL+'/interview/dsa/practice/arrays-hashing');await expect(visitor.locator('.iv-question-progress')).toHaveCount(0);await fits(visitor);}finally{await visitor.close();}
 }finally{await context.close();}
});

import {test,expect} from '@playwright/test';
const api=process.env.CONTENT_PREVIEW_TEST_API;
async function local(path:string,body?:unknown){if(!api||!/^http:\/\/127\.0\.0\.1:\d+$/.test(api))throw Error('Disposable API required');const r=await fetch(api+path,body?{method:'POST',body:JSON.stringify(body)}:undefined);if(!r.ok)throw Error(await r.text());return r.json();}
const paths=['/notes','/interview/dsa/notes','/interview/dsa/notes/fixture-note','/interview/system-design/notes','/interview/system-design/notes/sd-fixture','/interview/low-level-design/notes/class-design','/interview/finance/notes','/interview/ai-engineering/notes'];
const fits=async(page:import('@playwright/test').Page)=>expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
test('visitors get Google sign-in on every Notes entry; Practice, template and guides remain public',async({page})=>{
 test.skip(!api,'disposable local API required');await local('/__app_seed',{});
 for(const path of paths){expect((await page.goto(path))?.status()).toBe(200);await expect(page.getByRole('region',{name:'Notes sign-in'})).toBeVisible();await expect(page.getByRole('button',{name:'Sign in with Google',exact:true})).toBeVisible();expect(await page.content()).not.toContain('Live fixture note');await expect(page.getByText('Membership access required',{exact:true})).toHaveCount(0);await fits(page);}
 for(const path of ['/interview/dsa/practice/arrays-hashing','/interview/problems/217','/practices/217']){await page.goto(path);await expect(page.getByRole('region',{name:'Notes sign-in'})).toHaveCount(0);if(path.endsWith('217'))await expect(page.getByLabel('Python code',{exact:true})).toBeVisible();else await expect(page.locator('a[href="/interview/problems/217"]')).toBeVisible();await fits(page);}
 await page.goto('/interview/resume');await expect(page.getByRole('region',{name:'Resume template'})).toBeVisible();await expect(page.getByRole('button',{name:'Sign in to build your own'})).toBeVisible();await fits(page);
 await page.goto('/interview/behavioral');await expect(page.getByRole('heading',{name:'Behavioral',level:1,exact:true})).toBeVisible();await expect(page.locator('.iv-playbook-theme a').first()).toBeVisible();await page.locator('.iv-playbook-theme a').first().click();await expect(page.getByRole('region',{name:'Question guide'})).toBeVisible();await expect(page.getByRole('button',{name:'Sign in to prepare your answer',exact:true})).toBeVisible();await fits(page);
 await page.goto('/behavioral');await expect(page.getByRole('link',{name:'Open Behavioral Playbook'})).toBeVisible();expect(await page.content()).not.toContain('Live fixture outline');await fits(page);
});
test('an uninvited account reads Notes and public Practice, keeps private workspaces, and logout removes Notes',async({page,baseURL})=>{
 test.skip(!api,'disposable local API required');await local('/__app_seed',{});const {cookie}=await local('/__session?role=reader');await page.context().addCookies([{...cookie,url:baseURL!}]);
 for(const path of ['/notes','/interview/dsa/notes/fixture-note']){await page.goto(path);await expect(page.locator('.notes-main')).toContainText('Live fixture note');await expect(page.getByRole('button',{name:'Edit',exact:true})).toHaveCount(0);await fits(page);}
 await page.goto('/interview/dsa/notes');await expect(page.getByRole('heading',{name:'Data Structures & Algorithms notes'})).toBeVisible();await fits(page);
 await page.goto('/interview/problems/217');await expect(page.getByLabel('Python code',{exact:true})).toBeVisible();expect(await page.content()).not.toContain('# Live fixture code');await fits(page);
 await page.goto('/interview/resume');await expect(page.getByRole('button',{name:'Start blank',exact:true})).toBeVisible();await fits(page);
 await page.goto('/interview/behavioral');await expect(page.getByRole('heading',{name:'Behavioral',level:1,exact:true})).toBeVisible();expect(await page.content()).not.toContain('Live fixture story');await fits(page);
 await page.context().clearCookies();await page.goto('/interview/dsa/notes/fixture-note');await expect(page.getByRole('button',{name:'Sign in with Google',exact:true})).toBeVisible();expect(await page.content()).not.toContain('Live fixture note');
});

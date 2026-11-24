import {test,expect,type Page} from '@playwright/test';
const api=process.env.CONTENT_PREVIEW_TEST_API;
async function signIn(page:Page,url:string,role:string){if(!api||!/^http:\/\/127\.0\.0\.1:\d+$/.test(api))throw Error('Disposable API required');const res=await fetch(api+'/__session?role='+role);if(!res.ok)throw Error(await res.text());const {cookie}=await res.json();await page.context().addCookies([{...cookie,url}]);}
const fits=async(page:Page)=>expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
const NOTES=[['SQL basics','/interview/sql/notes/sql-basics'],['Tackling SQL questions','/interview/sql/notes/sql-tackling'],['Postgres vs MySQL','/interview/sql/notes/sql-postgres-mysql']];

test('SQL notes shelf lists the three notes in order and the practice list keeps its seven topics',async({page})=>{
 await page.goto('/interview/sql/notes');
 await expect(page.getByRole('heading',{name:'SQL',exact:true,level:1})).toBeVisible();
 const links=page.getByRole('navigation',{name:'Topics'}).getByRole('link');
 await expect(links).toHaveCount(3);
 expect((await links.allTextContents()).map(t=>t.trim())).toEqual(NOTES.map(n=>n[0]));
 expect(await links.evaluateAll(a=>a.map(l=>l.getAttribute('href')))).toEqual(NOTES.map(n=>n[1]));
 await fits(page);
 await page.goto('/interview/sql/practice');
 await expect(page.getByRole('navigation',{name:'Topics'}).getByRole('link')).toHaveCount(7);
 expect((await page.request.get('/interview/sql/notes/sql-basics')).status()).toBe(200);
 expect((await page.request.get('/interview/sql/notes/sql-select')).status()).toBe(404);
 // Topics and notes are different lists, so the Practice / Notes switch never carries a topic id across.
 await page.goto('/interview/sql/notes/sql-basics');
 await expect(page.locator('a.iv-mode-link')).toHaveAttribute('href','/interview/sql/practice');
 await page.goto('/interview/sql/problems/1757');
 await expect(page.locator('a.iv-mode-link')).toHaveAttribute('href','/interview/sql/notes');
});
test('signed-in owner sees the shelf overview and a coming-soon page for a note that is not drafted yet',async({page,baseURL})=>{
 test.skip(!api,'Needs the disposable preview API');
 await signIn(page,baseURL!,'owner');
 await page.goto('/interview/sql/notes');
 const list=page.getByRole('region',{name:'SQL topics'}).getByRole('link');
 await expect(list).toHaveCount(3);expect((await list.allTextContents()).map(t=>t.replace('›','').trim())).toEqual(NOTES.map(n=>n[0]));
 await page.goto('/interview/sql/notes/sql-tackling');
 await expect(page.getByRole('heading',{name:'Tackling SQL questions'})).toBeVisible();
 await expect(page.getByRole('status')).toContainText('Coming soon');
 await fits(page);
});
test('a SQL question page links the SQL basics note',async({page})=>{
 await page.goto('/interview/sql/problems/1757');
 await expect(page.getByRole('navigation',{name:'Builds on'}).getByRole('link',{name:'SQL basics'})).toHaveAttribute('href','/interview/sql/notes/sql-basics');
});

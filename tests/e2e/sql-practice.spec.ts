import {test,expect,type Page} from '@playwright/test';
import {sqlProblemByNumber} from '../../lib/practice/sql-catalog';
const api=process.env.CONTENT_PREVIEW_TEST_API;
async function local(path:string,body?:unknown){if(!api||!/^http:\/\/127\.0\.0\.1:\d+$/.test(api))throw Error('Disposable API required');const res=await fetch(api+path,body?{method:'POST',body:JSON.stringify(body)}:undefined);if(!res.ok)throw Error(await res.text());return res.json();}
async function signIn(page:Page,url:string,role:string){const {cookie}=await local('/__session?role='+role);await page.context().addCookies([{...cookie,url}]);}
const fits=async(page:Page)=>expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
const WRONG="SELECT item_id FROM catalogue_items WHERE fat_level = 'LOW'";
const RIGHT=sqlProblemByNumber(1757)!.solution;
const editorOf=(page:Page)=>page.getByRole('textbox',{name:'SQL query',exact:true});
const results=(page:Page)=>page.getByRole('region',{name:'Test results'});
const button=(page:Page,name:string)=>page.getByRole('button',{name,exact:true});
// PGlite (about 15 MB of wasm and data) loads in a worker on first use.
const ready=(page:Page)=>expect(button(page,'Run')).toBeEnabled({timeout:90000});

test('SQL section lists the seven topics in plan order and the seeded questions link to their pages',async({page})=>{
 await page.goto('/interview/sql/practice');
 await expect(page.getByRole('heading',{name:'SQL',exact:true,level:1})).toBeVisible();
 const topics=await page.getByRole('navigation',{name:'Topics'}).getByRole('link').allTextContents();
 expect(topics.map(t=>t.trim())).toEqual(['Select','Basic Joins','Basic Aggregate Functions','Sorting and Grouping','Advanced Select and Joins','Subqueries','Advanced String Functions / Regex / Clause']);
 const questions=page.locator('.iv-questions a');
 await expect(questions).toHaveText([/Recyclable and Low Fat Products/,/Replace Employee ID With The Unique Identifier/,/Not Boring Movies/]);
 await expect(page.getByText('SQL 50',{exact:true}).first()).toBeVisible();
 await fits(page);
 await page.goto('/interview/sql/practice/sql-basic-joins');await expect(questions).toHaveCount(1);
 await page.goto('/interview/sql/practice/sql-subqueries');await expect(page.getByText('No practice questions yet.')).toBeVisible();
 expect((await page.request.get('/interview/sql/notes')).ok()).toBe(true);
 await page.goto('/interview/sql');await expect(page).toHaveURL(/\/interview\/sql\/practice$/);
 expect((await page.request.get('/interview/sql/problems/217')).status()).toBe(404);
 expect((await page.request.get('/interview/problems/1757')).status()).toBe(404);
});

test('open a question, Run, Submit wrong then right: diff shown, Postgres errors verbatim, previous/next',async({page})=>{
 test.setTimeout(240000);
 await page.goto('/interview/sql/problems/1757');
 await expect(page.getByRole('heading',{name:'Recyclable and Low Fat Products',level:2})).toBeVisible();
 await expect(page.locator('[data-table-schema="catalogue_items"]')).toBeVisible();
 await expect(page.getByRole('region',{name:'Example 1'}).getByRole('table').first()).toBeVisible();
 await expect(page.getByRole('link',{name:'Previous question'})).toHaveCount(0);
 await expect(page.getByRole('link',{name:'Next question'})).toHaveAttribute('href','/interview/sql/problems/1378');
 await ready(page);
 // Wrong first: Run checks the first case only, with expected vs yours and the extra row highlighted.
 await editorOf(page).fill(WRONG);
 await button(page,'Run').click();
 await expect(results(page)).toContainText('Run results · 0/1 passed');
 await expect(results(page).locator('.sql-diff figure')).toHaveCount(2);
 await expect(results(page).locator('tr[data-mismatch]').first()).toBeVisible();
 await expect(results(page).getByRole('status')).toContainText(/unexpected|missing/);
 await button(page,'Submit').click();
 await expect(results(page)).toContainText('Wrong answer — first failing case');
 // A Postgres error and a rejected statement are shown as written.
 await editorOf(page).fill('SELECT nope FROM catalogue_items');await button(page,'Run').click();
 await expect(results(page).getByRole('alert')).toHaveText('column "nope" does not exist');
 await editorOf(page).fill('SELECT 1; SELECT 2');await button(page,'Run').click();
 await expect(results(page).getByRole('alert')).toContainText('Only one statement is allowed');
 await editorOf(page).fill('DELETE FROM catalogue_items');await button(page,'Run').click();
 await expect(results(page).getByRole('alert')).toContainText('Only SELECT queries');
 // Then right.
 await editorOf(page).fill(RIGHT);
 await button(page,'Run').click();await expect(results(page)).toContainText('Run results · 1/1 passed');
 await button(page,'Submit').click();
 await expect(results(page)).toContainText('Accepted 4/4');
 await fits(page);
 await page.getByRole('link',{name:'Next question'}).click();
 await expect(page).toHaveURL(/\/interview\/sql\/problems\/1378$/);
 await expect(page.getByRole('heading',{name:'Replace Employee ID With The Unique Identifier',level:2})).toBeVisible();
});

test('a query that never ends is stopped at the time limit and the next run recovers',async({page},info)=>{
 test.skip(info.project.name!=='desktop','Same engine at both viewport sizes');
 test.setTimeout(240000);
 await page.goto('/interview/sql/problems/1757');await ready(page);
 await editorOf(page).fill('SELECT pg_sleep(60), item_id FROM catalogue_items');
 await button(page,'Run').click();
 await expect(results(page)).toContainText('Time limit exceeded',{timeout:30000});
 await ready(page);
 await editorOf(page).fill(RIGHT);await button(page,'Run').click();
 await expect(results(page)).toContainText('Run results · 1/1 passed');
});

test('signed-in progress: Accepted ticks only the SQL question, saved SQL submission appears, DSA progress is untouched',async({page,baseURL})=>{
 test.skip(!api,'disposable local API required');test.setTimeout(240000);
 await local('/__app_seed',{});await signIn(page,baseURL!,'member');
 await page.goto('/interview/sql/practice');
 await expect(page.getByRole('img',{name:'Recyclable and Low Fat Products not completed',exact:true})).toBeVisible();
 await expect(page.getByTestId('sql-progress')).toHaveText('0 of 3 done');
 await page.goto('/interview/sql/problems/1757');await ready(page);
 await editorOf(page).fill(RIGHT);await expect(page.locator('.pw-save-status')).toHaveText('Saved');
 await button(page,'Submit').click();await expect(results(page)).toContainText('Accepted 4/4');await expect(page.getByText('Saving attempt…',{exact:true})).toHaveCount(0);
 await page.getByRole('tab',{name:'Submissions'}).click();await expect(page.getByText('Accepted',{exact:true}).first()).toBeVisible();await expect(page.getByText('SQL',{exact:true}).first()).toBeVisible();
 await page.reload();await expect(editorOf(page)).toContainText('catalogue_items');
 await page.goto('/interview/sql/practice');
 await expect(page.getByRole('img',{name:'Recyclable and Low Fat Products completed',exact:true})).toBeVisible();
 await expect(page.getByRole('img',{name:'Not Boring Movies not completed',exact:true})).toBeVisible();
 await expect(page.getByTestId('sql-progress')).toHaveText('1 of 3 done');
 await page.goto('/interview/dsa/practice/arrays-hashing');
 await expect(page.getByRole('img',{name:'Contains Duplicate not completed',exact:true})).toBeVisible();await expect(page.getByTestId('sql-progress')).toHaveCount(0);
 await fits(page);
});

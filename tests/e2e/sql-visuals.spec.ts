import {test,expect,type Page} from '@playwright/test';
// Q5: a notes draft that sets `visual` shows a "tables" visual in the owner preview; step through it at desktop and 390 px.
const api=process.env.CONTENT_PREVIEW_TEST_API;
async function local(path:string,body?:unknown){if(!api||!/^http:\/\/127\.0\.0\.1:\d+$/.test(api))throw Error('Disposable loopback API required');const response=await fetch(api+path,body?{method:'POST',body:JSON.stringify(body)}:undefined);if(!response.ok)throw Error(await response.text());return response.json();}
async function signIn(page:Page,baseURL:string){const {cookie}=await local('/__session?role=owner');await page.context().addCookies([{...cookie,url:baseURL}]);}
const leftJoin={kind:'tables',title:'LEFT JOIN keeps every customer',tables:[
 {id:'customers',name:'customers',columns:['id','name'],rows:[[1,'Asha'],[2,'Ben'],[3,'Chloe']]},
 {id:'orders',name:'orders',columns:['id','customer_id','total'],rows:[[10,1,40],[11,1,15],[12,3,22]]},
 {id:'result',name:'result',columns:['name','total'],result:true,rows:[['Asha',40],['Asha',15],['Ben',null],['Chloe',22]]}],
 frames:[{caption:'Start with every customer. The result is empty.'},
  {caption:'Asha matches two orders.',highlight:[{table:'customers',row:0},{table:'orders',row:0},{table:'orders',row:1}],show:{result:2}},
  {caption:'Ben has no order, so his total is NULL.',highlight:[{table:'customers',row:1}],show:{result:3}},
  {caption:'Chloe matches order 12.',highlight:[{table:'customers',row:2},{table:'orders',row:2,col:'total'}],done:[{table:'customers',row:0}],show:{result:4}}]};
async function enter(page:Page,baseURL:string){
 await local('/__app_seed',{});const summary='Visual proposal '+Math.random().toString(16).slice(2,10);
 const set=await local('/__seed',{summary,operations:[{table:'notes',op:'update',key:'fixture-note',fields:{visual:[leftJoin]}}]});
 await signIn(page,baseURL);await page.goto('/manage/review');const card=page.getByRole('article',{name:summary,exact:true});await expect(card).toContainText('notes.fixture-note.visual');
 await card.getByRole('button',{name:'Preview on page',exact:true}).click();await expect(page.getByRole('complementary',{name:'Content preview'})).toBeVisible();return {...set,summary};
}
const fits=async(page:Page)=>expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
test.describe('tables visual in a notes draft preview',()=>{
 test.skip(!api,'requires the disposable local API');test.describe.configure({mode:'serial'});
 test('steps through the LEFT JOIN visual, stacks at 390 px and respects reduced motion',async({page,baseURL},info)=>{
  const set=await enter(page,baseURL!);
  await expect(page).toHaveURL(/\/interview\/dsa\/notes\/fixture-note$/);
  const panel=page.locator('.notes-visuals');
  await expect(panel).toHaveAttribute('data-draft-changed','true');
  const next=panel.getByRole('button',{name:'Next frame',exact:true}),prev=panel.getByRole('button',{name:'Previous frame',exact:true});
  const result=panel.getByRole('table',{name:/result/});
  await expect(panel.getByText('Start with every customer. The result is empty.')).toBeVisible();
  await expect(panel.getByRole('table')).toHaveCount(3);
  await expect(result.locator('tbody tr:not([aria-hidden])')).toHaveCount(0);
  // Layout: columns follow the container width (up to 3 side by side, one column at phone width).
  const boxes=await panel.locator('figure.tv-sqlt').evaluateAll(f=>f.map(x=>{const r=x.getBoundingClientRect();return {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width)};}));
  const width=page.viewportSize()!.width;
  if(width<=430){expect(new Set(boxes.map(b=>b.x)).size).toBe(1);expect(boxes[1].y).toBeGreaterThan(boxes[0].y);expect(boxes[2].y).toBeGreaterThan(boxes[1].y);}
  else{const perRow=await panel.locator('.tv-tables').evaluate(e=>Math.max(1,Math.min(3,Math.floor((e.clientWidth+14)/(230+14)))));expect(new Set(boxes.map(b=>b.x)).size).toBe(perRow);}
  await fits(page);
  await next.click();
  await expect(panel.getByText('Asha matches two orders.')).toBeVisible();
  await expect(result.locator('tbody tr:not([aria-hidden])')).toHaveCount(2);
  await expect(panel.getByRole('table',{name:/customers/}).locator('tr[data-hl="true"]')).toHaveCount(1);
  await expect(panel.getByRole('table',{name:/orders/}).locator('tr[data-hl="true"] .tv-gutter')).toContainText(['▸','▸']);
  const cellOutline=await panel.getByRole('table',{name:/customers/}).locator('tr[data-hl="true"] td').first().evaluate(e=>getComputedStyle(e).outlineStyle);expect(cellOutline).toBe('solid');
  await expect(result.locator('tbody tr.tv-new')).toHaveCount(2);
  expect(await result.locator('tbody tr.tv-new').first().evaluate(e=>getComputedStyle(e).animationName)).not.toBe('none');
  await next.click();await expect(result.locator('tbody tr:not([aria-hidden])')).toHaveCount(3);
  const ben=result.locator('tbody tr',{hasText:'Ben'});await expect(ben.locator('td[data-null]')).toHaveCount(1);await expect(ben).toContainText('NULL');
  await fits(page);await page.screenshot({path:info.outputPath('tables-visual-'+info.project.name+'.png')});
  await next.click();await expect(next).toBeDisabled();await expect(panel.getByText('Chloe matches order 12.')).toBeVisible();
  await expect(panel.getByRole('table',{name:/orders/}).locator('td[data-hl="true"]')).toHaveCount(1);
  await expect(panel.getByRole('table',{name:/orders/}).locator('td[data-hl="true"]')).toContainText('◆');
  await expect(panel.getByRole('table',{name:/customers/}).locator('tr[data-done="true"]')).toHaveCount(1);
  await prev.click();await expect(result.locator('tbody tr:not([aria-hidden])')).toHaveCount(3);
  // Keyboard: the stepper is plain buttons.
  await next.focus();await page.keyboard.press('Enter');await expect(panel.getByText('Chloe matches order 12.')).toBeVisible();
  // Reduced motion: no animation on revealed rows.
  await page.emulateMedia({reducedMotion:'reduce'});await prev.click();await next.click();
  expect(await result.locator('tbody tr.tv-new').last().evaluate(e=>getComputedStyle(e).animationName)).toBe('none');
  await page.getByRole('button',{name:'Discard',exact:true}).click();await expect(page.getByRole('complementary',{name:'Content preview'})).toHaveCount(0);
  expect((await local('/__state')).sets.find((s:{id:string})=>s.id===set.id).status).toBe('discarded');
  await page.goto('/interview/dsa/notes/fixture-note');await expect(page.getByRole('table')).toHaveCount(0);
 });
 test('approving applies the visual through the SQL function and the live page renders it',async({page,baseURL})=>{
  const set=await enter(page,baseURL!);await page.getByRole('button',{name:'Approve',exact:true}).click();await expect(page.getByRole('complementary',{name:'Content preview'})).toHaveCount(0);
  const saved=(await local('/__state')).sets.find((s:{id:string})=>s.id===set.id);expect(saved.status).toBe('approved');
  await page.goto('/interview/dsa/notes/fixture-note');await expect(page.locator('.notes-visuals').getByRole('table',{name:/customers/})).toBeVisible();
  await fits(page);
 });
});

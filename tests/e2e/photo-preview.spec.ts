import {test,expect,type Page,type Locator} from '@playwright/test';
const api=process.env.CONTENT_PREVIEW_TEST_API;
const key='00000000-0000-4000-8000-000000000701';
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a7S8AAAAASUVORK5CYII=','base64');
async function local(path:string,body?:unknown){if(!api||!/^http:\/\/127\.0\.0\.1:\d+$/.test(api))throw Error('Loopback API required');const r=await fetch(api+path,body?{method:'POST',body:JSON.stringify(body)}:undefined);if(!r.ok)throw Error(await r.text());return r.json();}
async function signIn(page:Page,baseURL:string,role='owner'){const {cookie}=await local('/__session?role='+role);await page.context().addCookies([{...cookie,url:baseURL}]);}
async function seed(page:Page,baseURL:string){
 await local('/__publishing_seed',{});const summary='Photo proposal '+Math.random().toString(16).slice(2,10);
 const photo_slots=['screen','detail'].map(slot=>({slot,expected_filename:slot+'.png',bucket:'project-media',target:{table:'projects',key,field:'screenshots'},caption:slot==='screen'?'Project overview':'Project detail',path:null}));
 const set=await local('/__seed',{summary,operations:[],photo_slots});await signIn(page,baseURL);await page.goto('/manage/review');return {...set,summary};
}
async function drop(page:Page,slot:Locator,name:string){const files=await page.evaluateHandle(({name,data})=>{const transfer=new DataTransfer();transfer.items.add(new File([Uint8Array.from(atob(data),c=>c.charCodeAt(0))],name,{type:'image/png'}));return transfer;},{name,data:png.toString('base64')});await slot.dispatchEvent('drop',{dataTransfer:files});await files.dispose();}
test.describe('project photo slots',()=>{
 test.skip(!api,'requires disposable local Storage/API');test.describe.configure({mode:'serial'});
 test.beforeEach(async({context})=>{await context.route('https://lhacrrnwddvpawsreamk.supabase.co/storage/v1/object/public/project-media/**',r=>r.fulfill({contentType:'image/png',body:png}));});
 test('review rejects wrong files; drop fills slots in review and preview, then approval publishes them',async({page,baseURL},info)=>{
  const set=await seed(page,baseURL!);const card=page.getByRole('article',{name:set.summary,exact:true});const slot=card.getByRole('region',{name:'Photo slot screen',exact:true});
  await expect(card.getByRole('button',{name:'Approve',exact:true})).toBeDisabled();await expect(slot).toContainText('screen.png');await expect(slot).toContainText('Project overview');
  const uploads:string[]=[];page.on('request',request=>{if(request.method()==='POST'&&request.url().includes('/storage/v1/object/'))uploads.push(request.url());});
  const input=slot.getByLabel('Upload screen.png');await input.setInputFiles({name:'screen.svg',mimeType:'image/svg+xml',buffer:Buffer.from('<svg/>')});await expect(slot.getByRole('status')).toContainText('PNG');
  await input.setInputFiles({name:'screen.png',mimeType:'image/png',buffer:Buffer.alloc(5242881)});await expect(slot.getByRole('status')).toContainText('5 MB');
  await input.setInputFiles({name:'wrong.png',mimeType:'image/png',buffer:png});await expect(slot.getByRole('status')).toContainText('exactly screen.png');expect(uploads).toHaveLength(0);
  await drop(page,slot,'screen.png');await expect(slot.getByRole('img',{name:'Project overview',exact:true})).toBeVisible();await expect(card.getByRole('button',{name:'Approve',exact:true})).toBeDisabled();
  let state=await local('/__state');expect(state.projects.find((p:{id:string})=>p.id===key).screenshots).toEqual([]);expect(state.sets.find((s:{id:string})=>s.id===set.id).photo_slots[0].path).toContain(`/screen/screen.png`);
  await card.getByRole('button',{name:'Preview on page',exact:true}).click();const bar=page.getByRole('complementary',{name:'Content preview'});await expect(bar).toBeVisible();await expect(bar.getByRole('button',{name:'Approve',exact:true})).toBeDisabled();
  await drop(page,bar.getByRole('region',{name:'Photo slot detail',exact:true}),'detail.png');await expect(bar.getByRole('img',{name:'Project detail',exact:true})).toBeVisible();await expect(bar.getByRole('button',{name:'Approve',exact:true})).toBeEnabled();
  const project=page.locator('[data-draft-changed="true"]').filter({hasText:'Live fixture project'});await expect(project).toContainText('Live fixture project');await expect(project.locator('img')).toHaveAttribute('src',new RegExp(`/drafts/${set.id}/screen/screen.png`));
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:info.outputPath('photo-slots.png')});
  await bar.getByRole('button',{name:'Approve',exact:true}).click();await expect(bar).toHaveCount(0);state=await local('/__state');const saved=state.sets.find((s:{id:string})=>s.id===set.id);expect(saved.status).toBe('approved');expect(saved.previous[0].values.screenshots).toEqual([]);expect(state.projects.find((p:{id:string})=>p.id===key).screenshots).toHaveLength(2);await expect(page.locator(`img[src*="/drafts/${set.id}/screen/screen.png"]`)).toBeVisible();
 });
 test('copied preview cookies disclose no unapproved images to visitors or members; discard leaves public project unchanged',async({page,browser,baseURL})=>{
  const set=await seed(page,baseURL!);const card=page.getByRole('article',{name:set.summary,exact:true});await drop(page,card.getByRole('region',{name:'Photo slot screen',exact:true}),'screen.png');await expect(card.getByRole('img',{name:'Project overview',exact:true})).toBeVisible();await card.getByRole('button',{name:'Preview on page',exact:true}).click();await expect(page.getByRole('complementary',{name:'Content preview'})).toBeVisible();
  const cookies=(await page.context().cookies()).filter(c=>['jb.content-preview','__prerender_bypass'].includes(c.name));
  for(const role of ['anonymous','member']){const context=await browser.newContext({viewport:page.viewportSize()!});const other=await context.newPage();try{if(role==='member')await signIn(other,baseURL!,role);await context.addCookies(cookies);await other.goto(baseURL+'/projects');expect(await other.content()).not.toContain(`/drafts/${set.id}/`);await expect(other.getByRole('complementary',{name:'Content preview'})).toHaveCount(0);await expect(other.getByRole('button',{name:'Choose photo'})).toHaveCount(0);}finally{await context.close();}}
  await page.getByRole('button',{name:'Discard',exact:true}).click();await expect(page.getByRole('complementary',{name:'Content preview'})).toHaveCount(0);expect((await local('/__state')).projects.find((p:{id:string})=>p.id===key).screenshots).toEqual([]);expect(await page.content()).not.toContain(`/drafts/${set.id}/`);
 });
});

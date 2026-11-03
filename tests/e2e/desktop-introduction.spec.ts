import {test,expect} from '@playwright/test';

test('arrival stays on the introduction until About Me is opened, and all apps use the top bar',async({page})=>{
 await page.goto('/');
 await expect(page.getByRole('heading',{level:1,name:'Jamie Ho'})).toBeVisible();
 await expect(page.getByRole('region',{name:'About Me',exact:true})).toHaveCount(0);
 const apps=page.getByRole('navigation',{name:'Desktop apps'});
 await expect(apps.getByRole('link',{name:'About Me',exact:true})).toBeVisible();
 expect(await apps.evaluate(e=>!!e.closest('.desktop-menubar'))).toBe(true);
 expect(await page.locator('.desktop-workspace .desktop-launcher').count()).toBe(0);
 await page.evaluate(()=>{(window as unknown as {introMarker:string}).introMarker='same-document'});
 await page.getByRole('link',{name:'Check Here: open About Me'}).click();
 await expect(page).toHaveURL(/\/about$/);
 await expect(page.getByRole('region',{name:'About Me',exact:true})).toBeVisible();
 await expect(page.locator('.desktop-canvas canvas')).toHaveCount(0);
 expect(await page.evaluate(()=>(window as unknown as {introMarker:string}).introMarker)).toBe('same-document');
 await page.getByRole('link',{name:'Close window',exact:true}).click();
 await expect(page).toHaveURL(/\/$/);
 await expect(page.getByRole('link',{name:'Check Here: open About Me'})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.documentElement.scrollHeight<=innerHeight+1)).toBe(true);
});

test('reduced motion and JavaScript-free visitors keep the complete still and working About Me link',async({page,browser,baseURL})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
 await expect(page.locator('.desktop-canvas canvas')).toHaveCount(0);
 await expect(page.getByText('Still view',{exact:true})).toBeVisible();
 await page.getByRole('link',{name:'Check Here: open About Me'}).click();await expect(page).toHaveURL(/\/about$/);
 const context=await browser.newContext({javaScriptEnabled:false});const plain=await context.newPage();await plain.goto(baseURL!);
 await expect(plain.getByRole('heading',{name:'Jamie Ho',level:1})).toBeVisible();
 await expect(plain.locator('.desktop-poster')).toBeVisible();
 await plain.getByRole('link',{name:'Check Here: open About Me'}).click();
 await expect(plain.getByRole('heading',{name:'About',exact:true})).toBeVisible();
 await expect(plain.getByRole('region',{name:'Send a message'})).toBeAttached();
 await context.close();
});

test('desktop motion pauses, releases on navigation and loads night layers only when needed',async({page},info)=>{
 test.skip(info.project.name==='phone','Phone layout and reduced-motion paths run separately.');
 await page.emulateMedia({colorScheme:'light',reducedMotion:'no-preference'});
 const errors:string[]=[],nightFiles:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|Shader|WebGLProgram/.test(m.text()))errors.push(m.text())});
 page.on('request',r=>{if(/\/desktop-art\/[^/]*night/i.test(r.url()))nightFiles.push(r.url())});
 await page.goto('/');
 const gl=await page.evaluate(()=>{const gl=document.createElement('canvas').getContext('webgl2');gl?.getExtension('WEBGL_lose_context')?.loseContext();return !!gl});
 test.skip(!gl,'No WebGL2 on this runner; still/reduced-motion cases remain required.');
 const backdrop=page.locator('.desktop-backdrop'),canvas=page.locator('.desktop-canvas');
 await expect(backdrop).toHaveAttribute('data-scene','ready',{timeout:25000});
 const start=await canvas.getAttribute('data-scene-frame');await expect(canvas).not.toHaveAttribute('data-scene-frame',start!);
 expect(nightFiles).toEqual([]);
 await page.getByRole('button',{name:'Pause desktop motion',exact:true}).click();await expect(canvas.locator('canvas')).toHaveCount(0);
 await page.getByRole('button',{name:'Enable desktop motion',exact:true}).click();await expect(backdrop).toHaveAttribute('data-scene','ready',{timeout:25000});
 await page.getByRole('button',{name:'Switch to dark mode'}).click();
 await expect(backdrop).toHaveAttribute('data-night','true');await expect(backdrop).toHaveAttribute('data-scene','ready',{timeout:25000});
 await expect(canvas).toHaveAttribute('data-scene-theme','night',{timeout:25000});expect(nightFiles.length).toBeGreaterThan(0);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'))});
 const hidden=await canvas.getAttribute('data-scene-time');await page.waitForTimeout(400);expect(await canvas.getAttribute('data-scene-time')).toBe(hidden);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'))});
 await expect(canvas).not.toHaveAttribute('data-scene-time',hidden!);
 await page.getByRole('navigation',{name:'Desktop apps'}).getByRole('link',{name:'Projects',exact:true}).click();
 await expect(page).toHaveURL(/\/projects$/);await expect(page.locator('.desktop-canvas canvas')).toHaveCount(0);
 expect(errors).toEqual([]);
});

test('unavailable graphics leave the still, theme switch and navigation usable',async({page})=>{
 await page.addInitScript(`(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(kind,...args){return String(kind).includes('webgl')?null:original.call(this,kind,...args)}})()`);
 await page.goto('/');await expect(page.locator('.desktop-backdrop')).toHaveAttribute('data-scene','unavailable',{timeout:15000});await expect(page.getByText('Still view',{exact:true})).toBeVisible();
 await expect(page.locator('.desktop-canvas canvas')).toHaveCount(0);
 await page.getByRole('link',{name:'Check Here: open About Me'}).click();await expect(page).toHaveURL(/\/about$/);
 await expect(page.getByRole('heading',{level:1,name:'Jamie Ho'})).toBeVisible();
});

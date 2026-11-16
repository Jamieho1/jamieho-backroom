import {test,expect} from '@playwright/test';
test('My story starter is themed, readable and links to the existing Contact form',async({page})=>{
 await page.goto('/about');await expect(page).toHaveTitle('My story · Jamie Ho');
 const article=page.locator('.story-editorial');await expect(article).toBeVisible();await expect(article).toHaveAttribute('data-starter','true');await expect(article.getByRole('heading',{level:1})).toBeVisible();await expect(article).toContainText('More of the story is on its way.');
 await expect(page.getByRole('navigation',{name:'Site',exact:true})).toBeVisible();await expect(page.locator('.window-titlebar')).toHaveCount(0);
 const box=await article.boundingBox();expect(box!.width).toBeLessThanOrEqual(680);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 const themes:string[]=[];
 for(const theme of ['light','dark']){await page.evaluate(value=>{document.documentElement.dataset.theme=value},theme);themes.push(await article.evaluate(el=>getComputedStyle(el).color));expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)}expect(themes[0]).not.toBe(themes[1]);
 const contact=page.getByRole('link',{name:'Get in touch',exact:true});await contact.focus();await expect(contact).toBeFocused();await expect(contact).toHaveAttribute('href','/#home-contact');await contact.click();await expect(page).toHaveURL(/\/#home-contact$/);await expect(page.getByRole('region',{name:'Contact',exact:true}).getByLabel('Name',{exact:true})).toBeVisible();
});
test('My story starter remains usable without JavaScript',async({browser},info)=>{
 const context=await browser.newContext({javaScriptEnabled:false,viewport:info.project.use.viewport});try{const page=await context.newPage();await page.goto('/about');await expect(page).toHaveTitle('My story · Jamie Ho');await expect(page.locator('.story-editorial')).toBeVisible();await expect(page.getByText('More of the story is on its way.')).toBeVisible();await expect(page.getByRole('link',{name:'Get in touch',exact:true})).toHaveAttribute('href','/#home-contact');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}finally{await context.close();}
});

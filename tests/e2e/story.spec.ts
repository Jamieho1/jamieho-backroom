import {test,expect} from '@playwright/test';
const fits=(page:import('@playwright/test').Page)=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth);
test('My story starter shows the hero, About text and the ending band, never placeholder boxes',async({page})=>{
 await page.goto('/about');await expect(page).toHaveTitle('My story · Jamie Ho');
 const article=page.locator('.story-editorial');await expect(article).toBeVisible();await expect(article).toHaveAttribute('data-starter','true');await expect(article.getByRole('heading',{level:1})).toBeVisible();await expect(article.getByText('MY STORY',{exact:true})).toBeVisible();await expect(article).toContainText('More of the story is on its way.');
 await expect(page.getByRole('navigation',{name:'Site',exact:true})).toBeVisible();await expect(page.locator('.window-titlebar')).toHaveCount(0);
 await expect(page.locator('.sty-idx')).toHaveCount(0);await expect(page.locator('.sty-ch')).toHaveCount(0);expect(await page.content()).not.toMatch(/YOUR WORDS/i);
 expect(await fits(page)).toBe(true);
 await expect(article.getByRole('heading',{level:2,name:'Have a project in mind?'})).toBeVisible();await expect(article.getByRole('link',{name:'Back to the homepage'})).toHaveAttribute('href','/');
 const contact=page.getByRole('link',{name:'Get in touch',exact:true});await contact.focus();await expect(contact).toBeFocused();await expect(contact).toHaveAttribute('href','/#contact');await contact.click();await expect(page).toHaveURL(/\/#contact$/);await expect(page.getByRole('region',{name:'Contact',exact:true}).getByLabel('Name',{exact:true})).toBeVisible();
});
test('My story starter remains usable without JavaScript',async({browser},info)=>{
 const context=await browser.newContext({javaScriptEnabled:false,viewport:info.project.use.viewport});try{const page=await context.newPage();await page.goto('/about');await expect(page).toHaveTitle('My story · Jamie Ho');await expect(page.locator('.story-editorial')).toBeVisible();await expect(page.getByText('More of the story is on its way.')).toBeVisible();await expect(page.getByRole('link',{name:'Get in touch',exact:true})).toHaveAttribute('href','/#contact');expect(await fits(page)).toBe(true);}finally{await context.close();}
});
test('My story starter keeps content visible under reduced motion',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/about');
 await expect(page.locator('.story-editorial')).not.toHaveClass(/sty-js/);await expect(page.getByRole('link',{name:'Get in touch',exact:true})).toBeVisible();expect(await fits(page)).toBe(true);
});

import {test,expect} from '@playwright/test';
import {problemByNumber,PRACTICE_LIST} from '../../lib/practice/catalog';
import {relatedQuestions} from '../../lib/interview/practice-navigation';
import {topicById} from '../../lib/notes/topics';
for(const id of [217,146])test(`P4 ${id} examples, follow-ups, approach code and related links fit the workspace`,async({page},info)=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/interview/problems/'+id);const problem=problemByNumber(id)!,meta=PRACTICE_LIST.find(p=>p.lc===id)!;
 await expect(page.getByRole('heading',{name:'Examples',exact:true})).toHaveCount(0);
 const example=page.getByRole('region',{name:'Example 1',exact:true});await expect(example).toBeVisible();await expect(example).toContainText('Input:');await expect(example).toContainText('Output:');
 const decoration=await example.evaluate(el=>({width:getComputedStyle(el).borderLeftWidth,color:getComputedStyle(el).borderLeftColor,font:getComputedStyle(el.querySelector('pre')!).fontFamily}));expect(decoration.width).toBe('3px');expect(decoration.font.toLowerCase()).toContain('mono');const hex=topicById(meta.topic)!.dot;expect(decoration.color).toBe(`rgb(${parseInt(hex.slice(1,3),16)}, ${parseInt(hex.slice(3,5),16)}, ${parseInt(hex.slice(5,7),16)})`);
 const follow=page.getByRole('region',{name:'Follow-up',exact:true});await expect(follow).toContainText(problem.followUps[0]);await follow.scrollIntoViewIfNeeded();await expect(follow).toBeVisible();
 const related=page.getByRole('region',{name:'Related questions',exact:true});const suggestions=relatedQuestions(id);await expect(related.getByRole('link')).toHaveCount(suggestions.length);for(const p of suggestions){const link=related.getByRole('link',{name:new RegExp(p.title.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'))});await expect(link).toHaveAttribute('href','/interview/problems/'+p.lc);await expect(link).toContainText(p.difficulty);}
 await page.getByRole('tab',{name:'Solution',exact:true}).click();await expect(page.locator('.practice-approach')).toHaveCount(problem.approaches.length);
 for(const approach of problem.approaches){const panel=page.locator(`.practice-approach[data-optimal="${approach.optimal}"]`);await expect(panel.locator('summary')).toContainText(approach.title);await expect(panel.locator('summary')).toContainText('Time: '+approach.time);await expect(panel.locator('summary')).toContainText('Space: '+approach.space);if(!await panel.evaluate(el=>(el as HTMLDetailsElement).open))await panel.locator('summary').click();await expect(panel.locator('pre.code')).toBeVisible();await expect(panel.locator('pre.code')).toContainText('class ');}
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:info.outputPath(`p4-${id}.png`)});
 if(suggestions.length){await page.getByRole('tab',{name:'Problem',exact:true}).click();await related.getByRole('link').first().click();await expect(page).toHaveURL(new RegExp('/interview/problems/'+suggestions[0].lc+'$'));}
});

// @vitest-environment jsdom
import {render,cleanup,fireEvent} from '@testing-library/react';
import {it,expect,afterEach,beforeEach,vi} from 'vitest';
import {Story} from '@/components/story';
const about={key:'about' as const,title:'From Research to Production',body:'First synthetic paragraph.\n\nSecond synthetic paragraph.'};
const story={key:'story' as const,title:'A synthetic story',body:''};
const body=`Why I changed course.

## The spark
A synthetic chapter.

![Alt words](https://example.test/photo.png "Synthetic photo caption")

## Lessons
Learned things.

> A synthetic pull quote.
>
> — Credit line

## How I work
### Principles
- **Ship small.** Reviewable changes.
- **Own it.** Run what you build.
- **Write it down.** Decisions outlive memory.
- **Measure first.** No guessing.

<script>bad()</script>`;
beforeEach(()=>{Element.prototype.scrollIntoView=vi.fn();});
afterEach(cleanup);
it('starter shows the hero, About title and both paragraphs, the starter line, the band and no placeholders',()=>{
 const view=render(<Story about={about} story={story}/>);
 expect(view.getByRole('heading',{level:1}).textContent?.trim()).toBe(about.title);expect(view.container.querySelector('h1 em')?.textContent?.trim()).toBe('to');
 expect(view.getByText('MY STORY')).toBeTruthy();
 for(const text of ['First synthetic paragraph.','Second synthetic paragraph.','More of the story is on its way.'])expect(view.getByText(text)).toBeTruthy();
 expect(view.container.querySelector('article')?.getAttribute('data-starter')).toBe('true');
 expect(view.container.querySelector('.sty-hmeta')).toBeNull();expect(view.container.querySelector('.sty-idx')).toBeNull();expect(view.container.querySelectorAll('.sty-ch')).toHaveLength(0);
 expect(view.container.textContent).not.toMatch(/YOUR WORDS|placeholder/i);
 expect(view.getByRole('heading',{level:2,name:'Have a project in mind?'})).toBeTruthy();
 const pill=view.getByRole('link',{name:'Get in touch'});expect(pill.getAttribute('href')).toBe('/#contact');expect(pill.className).toContain('primary-pill');expect(pill.className).toContain('primary-strong');
 expect(view.getByRole('link',{name:'Back to the homepage'}).getAttribute('href')).toBe('/');
});
it('whitespace-only Story remains the starter and non-HTTPS images are refused',()=>{
 const view=render(<Story about={{...about,body:'![No local image](http://example.test/photo.png)'}} story={{...story,body:'   '}}/>);
 expect(view.getByText('More of the story is on its way.')).toBeTruthy();expect(view.queryByRole('img')).toBeNull();
});
it('with no About title the story title is the headline, then My story',()=>{
 expect(render(<Story about={{...about,title:' '}} story={story}/>).getByRole('heading',{level:1}).textContent?.trim()).toBe('A synthetic story');cleanup();
 expect(render(<Story about={{...about,title:''}} story={{...story,title:''}}/>).getByRole('heading',{level:1}).textContent?.trim()).toBe('My story');
});
it('a story renders the hero meta, intro, numbered chapters, rail and no starter text',()=>{
 const view=render(<Story about={about} story={{...story,body}} changed/>);
 expect(view.getByRole('heading',{level:1}).textContent?.trim()).toBe(about.title);
 expect(view.container.querySelector('.sty-hmeta')?.textContent).toBe('3 chapters · ~1 min read');
 expect(view.getByText('Why I changed course.')).toBeTruthy();
 expect([...view.container.querySelectorAll('.sty-ch-h')].map(h=>h.textContent)).toEqual(['01The spark','02Lessons','03How I work']);
 expect([...view.container.querySelectorAll('.sty-rail a')].map(a=>a.getAttribute('href'))).toEqual(['#the-spark','#lessons','#how-i-work']);
 expect(view.container.querySelector('.sty-mbar')?.textContent).toMatch(/Chapter 0\d \/ 03/);
 expect(view.queryByText('More of the story is on its way.')).toBeNull();expect(view.container.querySelector('script')).toBeNull();
 expect(view.container.querySelector('article')?.getAttribute('data-draft-changed')).toBe('true');expect(view.container.querySelector('article')?.getAttribute('data-starter')).toBe('false');
 expect(view.container.textContent).not.toMatch(/YOUR WORDS/i);
});
it('photos become tilted prints captioned from the title (else alt); non-https images are dropped',()=>{
 const view=render(<Story about={about} story={{...story,body:`## A\n![Only alt](https://example.test/b.png)\n\n![Insecure](http://example.test/c.png)\n\n![x](https://example.test/a.png "Title wins")`}}/>);
 const figs=[...view.container.querySelectorAll('figure.sty-brk')];
 expect(figs.map(f=>f.querySelector('figcaption')?.textContent)).toEqual(['Only alt','Title wins']);
 expect(figs[0].querySelector('img')?.getAttribute('src')).toBe('https://example.test/b.png');expect(figs[0].querySelector('.sty-print .sty-ph img')).toBeTruthy();
 expect(view.container.querySelector('p figure')).toBeNull();
});
it('blockquotes are pull quotes with an optional credit; the Principles list becomes four cards',()=>{
 const view=render(<Story about={about} story={{...story,body}}/>);
 const pq=view.container.querySelector('figure.sty-pq')!;expect(pq.querySelector('blockquote')?.textContent).toContain('A synthetic pull quote.');expect(pq.querySelector('blockquote')?.textContent).not.toContain('Credit');expect(pq.querySelector('figcaption')?.textContent).toBe('Credit line');
 const cards=[...view.container.querySelectorAll('.sty-pr .sty-pc')];
 expect(cards.map(c=>[c.querySelector('.k')?.textContent,c.querySelector('h3')?.textContent,c.textContent?.includes('Reviewable changes.')])).toEqual([['PRINCIPLE 01','Ship small',true],['PRINCIPLE 02','Own it',false],['PRINCIPLE 03','Write it down',false],['PRINCIPLE 04','Measure first',false]]);
 expect(view.container.querySelectorAll('.sty-md ul')).toHaveLength(0);
});
it('a story with no ## headings keeps its text without a rail or chapters',()=>{
 const view=render(<Story about={about} story={{...story,body:'Only an intro paragraph.'}}/>);
 expect(view.getByText('Only an intro paragraph.')).toBeTruthy();expect(view.container.querySelector('.sty-idx')).toBeNull();expect(view.container.querySelector('.sty-hmeta')?.textContent).toBe('~1 min read');
 expect(view.queryByText('More of the story is on its way.')).toBeNull();
});
it('the phone bar toggles the chapter list and a rail link scrolls to its chapter',()=>{
 const view=render(<Story about={about} story={{...story,body}}/>);
 const bar=view.container.querySelector('.sty-mbar') as HTMLButtonElement;expect(bar.getAttribute('aria-expanded')).toBe('false');
 fireEvent.click(bar);expect(bar.getAttribute('aria-expanded')).toBe('true');expect(view.container.querySelector('.sty-idx')?.classList.contains('open')).toBe(true);
 fireEvent.click(view.getByRole('link',{name:/Lessons/}));expect(Element.prototype.scrollIntoView).toHaveBeenCalled();expect(bar.getAttribute('aria-expanded')).toBe('false');expect(window.location.hash).toBe('#lessons');
});

// @vitest-environment jsdom
import {render,cleanup} from '@testing-library/react';
import {it,expect,afterEach} from 'vitest';
import {Story} from '@/components/story';
const about={key:'about' as const,title:'From Research to Production',body:'First synthetic paragraph.\n\nSecond synthetic paragraph.'};
const story={key:'story' as const,title:'A synthetic story',body:''};
afterEach(cleanup);
it('starter uses About title and both full paragraphs, with the shared contact destination',()=>{
 const view=render(<Story about={about} story={story}/>);
 expect(view.getByRole('heading',{level:1}).textContent?.trim()).toBe(about.title);expect(view.container.querySelector('h1 em')?.textContent?.trim()).toBe('to');
 for(const text of ['First synthetic paragraph.','Second synthetic paragraph.','More of the story is on its way.'])expect(view.getByText(text)).toBeTruthy();
 expect(view.getByRole('link',{name:'Get in touch'}).getAttribute('href')).toBe('/#home-contact');
});
it('story reuses safe chapter headings, captioned HTTPS images and pull quotes',()=>{
 const view=render(<Story about={about} story={{...story,body:'## Learning\nA synthetic chapter.\n\n![Synthetic photo caption](https://example.test/photo.png)\n\n> A synthetic pull quote.\n\n<script>bad()</script>'}} changed/>);
 expect(view.getByRole('heading',{level:1}).textContent?.trim()).toBe(story.title);expect(view.getByRole('heading',{level:2,name:'Learning'}).id).toBe('learning');
 expect(view.getByRole('img',{name:'Synthetic photo caption'}).getAttribute('src')).toBe('https://example.test/photo.png');expect(view.container.querySelector('.article-caption')?.textContent).toBe('Synthetic photo caption');expect(view.container.querySelector('blockquote')?.textContent).toContain('synthetic pull quote');
 expect(view.queryByText('More of the story is on its way.')).toBeNull();expect(view.container.querySelector('script')).toBeNull();expect(view.container.querySelector('article')?.getAttribute('data-draft-changed')).toBe('true');
});
it('whitespace-only Story remains the starter and non-HTTPS images are refused',()=>{
 const view=render(<Story about={{...about,body:'![No local image](http://example.test/photo.png)'}} story={{...story,body:'   '}}/>);
 expect(view.getByText('More of the story is on its way.')).toBeTruthy();expect(view.queryByRole('img')).toBeNull();
});

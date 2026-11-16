// @vitest-environment jsdom
import {render,cleanup} from '@testing-library/react';
import {afterEach,it,expect} from 'vitest';
import {AboutConstellation} from '@/components/journey/about-constellation';
import type {AboutPhoto} from '@/lib/home-content-schema';
const photos:AboutPhoto[]=Array.from({length:13},(_,i)=>({id:String(i),path:'synthetic.png',caption:`Caption ${i}`,alt:`Photo ${i}`,sort:i,centre:i===4,public:true}));
afterEach(cleanup);
it('renders the centre first, caps twelve, uses alt/captions and keeps every photo plus story keyboard reachable',()=>{
 const view=render(<AboutConstellation panel={{id:'about',from:0,to:1,title:'From Research to Production',body:'A **synthetic** paragraph.'}} photos={photos} base='/home-media' still/>);
 expect(view.getByRole('link',{name:'Read my story'}).getAttribute('href')).toBe('/about');expect(view.container.querySelector('h2 em')?.textContent).toBe('to');
 expect(view.getAllByRole('img')).toHaveLength(12);expect(view.getAllByRole('img')[0].getAttribute('alt')).toBe('Photo 4');expect(view.container.querySelectorAll('figure[tabindex="0"]')).toHaveLength(12);expect(view.container.querySelectorAll('figcaption')).toHaveLength(12);expect(view.container.querySelectorAll('svg path')).toHaveLength(11);
});
it('honours photo/version and section/entry draft markers without changing the no-photo reading state',()=>{
 const view=render(<AboutConstellation panel={{id:'about',from:0,to:1,title:'About',body:'Fixture'}} photos={[{...photos[0],path:'about-imperial-graduation.jpg',draftChanged:true}]} base='/home-media' changed still/>);
 expect(view.getByRole('img').getAttribute('src')).toMatch(/about-imperial-graduation.jpg\?v=/);expect(view.container.querySelector('figure')?.getAttribute('data-draft-changed')).toBe('true');expect(view.getByRole('region',{name:'About'}).getAttribute('data-draft-changed')).toBe('true');
 view.rerender(<AboutConstellation panel={{id:'about',from:0,to:1,title:'About',body:'Fixture'}} photos={[]} base='/home-media' still/>);expect(view.queryAllByRole('img')).toHaveLength(0);expect(view.getByRole('link',{name:'Read my story'})).toBeTruthy();
});

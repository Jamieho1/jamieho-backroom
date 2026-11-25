// @vitest-environment jsdom
import {beforeEach,afterEach,describe,it,expect,vi} from 'vitest';
import {render,screen,cleanup,within} from '@testing-library/react';
vi.mock('next/link',()=>({default:({prefetch:_p,children,...props}:React.ComponentProps<'a'>&{prefetch?:boolean})=><a {...props}>{children}</a>}));
import {SeriesCards,SeriesDetail} from '@/components/content/series-views';
import {seriesViews} from '@/lib/content-series-view';
import {READ_KEY} from '@/lib/content-read-state';
import type {HubGuide,HubPost,HubSeries} from '@/lib/content-hub';
const series:HubSeries={id:'s1',slug:'mcp-101',title:'MCP 101',goal:'Ship a server',topic:'ai',planned_parts:6,sort:1};
const post=(id:string,part:number,over:Partial<HubPost>={}):HubPost=>({id,slug:id,title:`Post ${id}`,summary:'',platform:'instagram',category:'ai',cover_url:'',firstSlide:'',created_at:'2026-11-11T00:00:00Z',series_id:'s1',series_part:part,code:null,takeaway:'Learn '+id,minutes:5,...over});
const guide:HubGuide={id:'g2',slug:'g2',title:'Guide g2',summary:'The summary',cover_url:'',notion_url:'',doc_url:'',created_at:'2026-11-12T00:00:00Z',updated_at:'2026-11-12T00:00:00Z',series_id:'s1',series_part:2,audience:'',highlights:[],exercises:null,minutes:25,chapters:5};
const view=seriesViews([series],[post('p1',1),post('p3',3,{platform:'youtube'})],[guide])[0];
beforeEach(()=>localStorage.clear());afterEach(cleanup);
describe('series cards',()=>{
 it('shows ring, goal, four parts with Next/Soon, "+ 2 more", footer and Start',()=>{
  render(<SeriesCards items={[view]}/>);
  expect(screen.getByRole('img',{name:'You have read 0 of 6'})).toBeTruthy();
  expect(screen.getByText('After this:').parentElement?.textContent).toContain('Ship a server');
  const rows=screen.getAllByRole('listitem');expect(rows).toHaveLength(5);
  expect(within(rows[0]).getByText('Next')).toBeTruthy();expect(within(rows[3]).getByText('Soon')).toBeTruthy();expect(rows[4].textContent).toContain('+ 2 more');
  expect(screen.getByText('3 of 6 out · ~35 min')).toBeTruthy();
  expect(screen.getByRole('link',{name:'Start →'}).getAttribute('href')).toBe('/articles/p1');
  expect(rows[3].textContent).not.toMatch(/Part 4.*[A-Za-z]{6,} [A-Za-z]/);
 });
 it('after reading part 1 (this browser) it ticks it and offers Continue at the next part',async()=>{
  localStorage.setItem(READ_KEY,JSON.stringify(['p1']));
  render(<SeriesCards items={[view]}/>);
  expect(await screen.findByRole('img',{name:'You have read 1 of 6'})).toBeTruthy();
  const link=screen.getByRole('link',{name:'Continue →'});expect(link.getAttribute('href')).toBe('/guides/g2');
  expect(within(screen.getAllByRole('listitem')[1]).getByText('Next')).toBeTruthy();
 });
 it('survives blocked storage',()=>{
  const spy=vi.spyOn(Storage.prototype,'getItem').mockImplementation(()=>{throw new Error('blocked');});
  render(<SeriesCards items={[view]}/>);expect(screen.getByRole('link',{name:'Start →'})).toBeTruthy();spy.mockRestore();
 });
});
describe('series page',()=>{
 it('lists parts in order with coming slots and no invented titles',()=>{
  render(<SeriesDetail s={view}/>);
  expect(screen.getByRole('heading',{level:1,name:'MCP 101'})).toBeTruthy();
  expect(screen.getByText('3 of 6 parts out')).toBeTruthy();
  const items=screen.getAllByRole('listitem');expect(items).toHaveLength(6);
  expect(items[0].textContent).toContain('Part 1 · Instagram');expect(items[1].textContent).toContain('Part 2 · Free guide');expect(items[2].textContent).toContain('Part 3 · YouTube');
  for(const i of [3,4,5]){expect(items[i].textContent).toContain(`Part ${i+1} · coming`);expect(items[i].textContent).toContain('Follow on Instagram to get it first');expect(within(items[i]).queryByRole('link')).toBeNull();}
  expect(screen.getByRole('link',{name:'Start at part 1 →'}).getAttribute('href')).toBe('/articles/p1');
 });
 it('Continue and a Read chip once parts are read',async()=>{
  localStorage.setItem(READ_KEY,JSON.stringify(['p1','g2']));
  render(<SeriesDetail s={view}/>);
  expect(await screen.findByRole('link',{name:'Continue at part 3 →'})).toBeTruthy();
  expect(within(screen.getAllByRole('listitem')[0]).getByText('Read')).toBeTruthy();
 });
 it('all read: Read again',async()=>{
  localStorage.setItem(READ_KEY,JSON.stringify(['p1','g2','p3']));render(<SeriesDetail s={view}/>);
  expect(await screen.findByRole('link',{name:'Read again from part 1 →'})).toBeTruthy();
 });
});

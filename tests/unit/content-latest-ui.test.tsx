// @vitest-environment jsdom
import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import {cleanup,fireEvent,render,screen,within,act} from '@testing-library/react';
const m=vi.hoisted(()=>({push:vi.fn(),path:'/content',role:'anonymous'}));
vi.mock('next/link',()=>({default:({prefetch:_p,children,...props}:React.ComponentProps<'a'>&{prefetch?:boolean})=><a {...props}>{children}</a>}));
vi.mock('next/navigation',()=>({useRouter:()=>({push:m.push}),usePathname:()=>m.path}));
vi.mock('@/components/viewer-provider',()=>({useViewer:()=>({viewer:{status:m.role}})}));
import {LatestView} from '@/components/content/latest';
import {HubSearch} from '@/components/content/hub-search';
import {HubTabs} from '@/components/content/hub-tabs';
import {ContentFooterBand} from '@/components/content/footer-band';
import {MarkRead} from '@/components/content/mark-read';
import {buildSearchIndex,type HubPost,type HubSeries} from '@/lib/content-hub';
import {READ_KEY,VIEW_KEY} from '@/lib/content-read-state';

const sid='00000000-0000-4000-8000-000000000a01';
const series:HubSeries[]=[{id:sid,slug:'mcp-101',title:'MCP 101',goal:'Ship',topic:'ai',planned_parts:5,sort:1}];
const mk=(i:number,o:Partial<HubPost>={}):HubPost=>({id:'id'+i,slug:'post-'+i,title:'Post '+i,summary:'',platform:i%2?'youtube':'instagram',category:i%3?'ai':'career',cover_url:'',firstSlide:'',created_at:new Date(Date.UTC(2026,10,28)-i*86400000*3).toISOString(),series_id:null,series_part:null,code:null,takeaway:'',minutes:4,...o});
const posts=[mk(0,{takeaway:'Wire up a tool',series_id:sid,series_part:1,code:'MCP101',cover_url:'https://example.com/c.png'}),...Array.from({length:29},(_,i)=>mk(i+1))];
const guide={id:'g',slug:'mcp',title:'The MCP Guide',summary:'From first connection to production.',cover_url:'',notion_url:'',doc_url:'',created_at:'a',updated_at:'b',series_id:null,series_part:null,audience:'',highlights:[],exercises:null,minutes:25,chapters:5};
const setUrl=(q:string)=>window.history.replaceState(null,'','/content'+q);
const cardLink=(slug:string)=>screen.getAllByRole('link').find(a=>a.getAttribute('href')==='/articles/'+slug)!;
beforeEach(()=>{localStorage.clear();setUrl('');m.push.mockReset();m.path='/content';m.role='anonymous';vi.useFakeTimers({toFake:['Date']});vi.setSystemTime(new Date('2026-11-29T12:00:00Z'));});
afterEach(()=>{cleanup();vi.useRealTimers();});

describe('Latest',()=>{
 it('shows 12 posts, grouped by month, then 12 more with a count',()=>{
  render(<LatestView posts={posts} series={series} guide={guide}/>);
  expect(document.querySelectorAll('.hub-card')).toHaveLength(12);
  expect(screen.getByText('Showing 12 of 30')).toBeTruthy();expect(screen.getByText('30 posts')).toBeTruthy();
  expect(screen.getAllByRole('heading',{level:2}).map(h=>h.textContent).join('|')).toMatch(/November 2026 · \d+ posts?/);
  fireEvent.click(screen.getByRole('button',{name:'Show 12 more'}));expect(document.querySelectorAll('.hub-card')).toHaveLength(24);
  fireEvent.click(screen.getByRole('button',{name:'Show 6 more'}));expect(document.querySelectorAll('.hub-card')).toHaveLength(30);expect(screen.queryByRole('button',{name:/Show/})).toBeNull();expect(screen.getByText('Showing 30 of 30')).toBeTruthy();
 });
 it('cards lead with what you get: takeaway, read time, series chip, NEW badge',()=>{
  render(<LatestView posts={posts} series={series} guide={null}/>);
  const card=cardLink('post-0');
  expect(within(card).getByText(/You'll learn:/).parentElement!.textContent).toContain('Wire up a tool');expect(within(card).getByText('4 min read')).toBeTruthy();expect(within(card).getByText('MCP 101 · 1/5')).toBeTruthy();expect(within(card).getByText('New')).toBeTruthy();
  const plain=cardLink('post-1');expect(within(plain).queryByText(/You'll learn/)).toBeNull();expect(within(plain).getByText('4 min video')).toBeTruthy();
  const old=cardLink('post-11');expect(within(old).queryByText('New')).toBeNull();
 });
 it('uses the first slide, else a typographic cover',()=>{
  render(<LatestView posts={[mk(1,{firstSlide:'https://example.com/s1.png'}),mk(2)]} series={[]} guide={null}/>);
  expect(document.querySelector('img[src="https://example.com/s1.png"]')).toBeTruthy();expect(document.querySelectorAll('.hub-cover-fallback')).toHaveLength(1);
 });
 it('marks posts opened in this browser as Read',()=>{
  localStorage.setItem(READ_KEY,JSON.stringify(['id1']));render(<LatestView posts={posts} series={series} guide={null}/>);
  expect(within(cardLink('post-1')).getByText('Read')).toBeTruthy();expect(within(cardLink('post-2')).queryByText('Read')).toBeNull();
 });
 it('switches Cards and List and remembers it',()=>{
  const first=render(<LatestView posts={posts} series={series} guide={null}/>);
  fireEvent.click(screen.getByRole('button',{name:/List/}));expect(document.querySelectorAll('.hub-row')).toHaveLength(12);expect(document.querySelectorAll('.hub-card')).toHaveLength(0);expect(localStorage.getItem(VIEW_KEY)).toBe('list');
  first.unmount();render(<LatestView posts={posts} series={series} guide={null}/>);expect(document.querySelectorAll('.hub-row')).toHaveLength(12);expect(screen.getByRole('button',{name:/List/}).getAttribute('aria-pressed')).toBe('true');
 });
 it('filters with the dropdowns, keeps state in the URL and clears it',()=>{
  render(<LatestView posts={posts} series={series} guide={null}/>);
  expect(screen.queryByRole('button',{name:'Clear filters'})).toBeNull();
  fireEvent.click(screen.getByRole('button',{name:/Topic:/}));const menu=screen.getByRole('menu',{name:'Topic'});
  expect(within(menu).getAllByRole('menuitemradio').map(i=>i.textContent)).toEqual(['All topics30','AI20','Career10']);
  fireEvent.click(within(menu).getByRole('menuitemradio',{name:/Career/}));
  expect(window.location.search).toBe('?topic=career');expect(screen.getByText('10 posts')).toBeTruthy();expect(screen.getByRole('button',{name:/Topic:/}).textContent).toContain('Career');
  fireEvent.click(screen.getByRole('button',{name:/Platform:/}));fireEvent.click(within(screen.getByRole('menu',{name:'Platform'})).getByRole('menuitemradio',{name:/YouTube/}));
  expect(window.location.search).toBe('?topic=career&platform=youtube');
  fireEvent.click(screen.getAllByRole('button',{name:'Clear filters'})[0]);expect(window.location.search).toBe('');expect(screen.getByText('30 posts')).toBeTruthy();
 });
 it('reads filters from the URL on load, ignores bad values and shows an empty state',()=>{
  setUrl('?topic=building');render(<LatestView posts={posts} series={series} guide={null}/>);
  expect(screen.getByText('0 posts')).toBeTruthy();expect(screen.getByText(/No posts match these filters/)).toBeTruthy();
  act(()=>{setUrl('?topic=ai&platform=bogus');window.dispatchEvent(new PopStateEvent('popstate'));});expect(screen.getByText('20 posts')).toBeTruthy();
 });
 it('says so when a short link had an unknown code',()=>{
  setUrl('?code=NOPE1');render(<LatestView posts={posts} series={series} guide={null}/>);expect(screen.getByText('No post with that code yet.')).toBeTruthy();
  cleanup();setUrl('?code=mcp101');render(<LatestView posts={posts} series={series} guide={null}/>);expect(screen.queryByText('No post with that code yet.')).toBeNull();
 });
 it('shows the latest guide band and handles no posts',()=>{
  const {unmount}=render(<LatestView posts={posts} series={series} guide={guide}/>);expect(screen.getByText(/Free: The MCP Guide\./)).toBeTruthy();expect(screen.getByRole('link',{name:'All free guides →'}).getAttribute('href')).toBe('/content/guides');unmount();
  render(<LatestView posts={[]} series={[]} guide={null}/>);expect(screen.getByText('No posts have been published yet.')).toBeTruthy();expect(screen.queryByText(/Show/)).toBeNull();
 });
});

describe('filter dropdown keyboard',()=>{
 it('opens with the arrow keys, moves with arrows/Home/End, selects with Enter and closes on Escape returning focus',()=>{
  render(<LatestView posts={posts} series={series} guide={null}/>);
  const btn=screen.getByRole('button',{name:/Topic:/});btn.focus();fireEvent.keyDown(btn,{key:'ArrowDown'});
  const items=()=>within(screen.getByRole('menu')).getAllByRole('menuitemradio');
  expect(document.activeElement).toBe(items()[0]);expect(items()[0].getAttribute('aria-checked')).toBe('true');
  fireEvent.keyDown(document.activeElement!,{key:'ArrowDown'});expect(document.activeElement).toBe(items()[1]);
  fireEvent.keyDown(document.activeElement!,{key:'End'});expect(document.activeElement).toBe(items()[2]);
  fireEvent.keyDown(document.activeElement!,{key:'ArrowDown'});expect(document.activeElement).toBe(items()[0]);
  fireEvent.keyDown(document.activeElement!,{key:'ArrowUp'});expect(document.activeElement).toBe(items()[2]);
  fireEvent.keyDown(document.activeElement!,{key:'Home'});expect(document.activeElement).toBe(items()[0]);
  fireEvent.keyDown(document.activeElement!,{key:'Escape'});expect(screen.queryByRole('menu')).toBeNull();expect(document.activeElement).toBe(btn);expect(window.location.search).toBe('');
  fireEvent.keyDown(btn,{key:'ArrowDown'});fireEvent.keyDown(document.activeElement!,{key:'ArrowDown'});fireEvent.click(document.activeElement!);
  expect(window.location.search).toBe('?topic=ai');expect(screen.queryByRole('menu')).toBeNull();expect(document.activeElement).toBe(btn);
 });
 it('closes on an outside press and on Tab',()=>{
  render(<LatestView posts={posts} series={series} guide={null}/>);fireEvent.click(screen.getByRole('button',{name:/Platform:/}));expect(screen.getByRole('menu')).toBeTruthy();
  fireEvent.pointerDown(document.body);expect(screen.queryByRole('menu')).toBeNull();
  fireEvent.click(screen.getByRole('button',{name:/Platform:/}));fireEvent.keyDown(document.activeElement!,{key:'Tab'});expect(screen.queryByRole('menu')).toBeNull();
 });
});

describe('search box',()=>{
 const index=buildSearchIndex({posts,guides:[guide],series});
 it('an exact code shows one row that opens the post',()=>{
  render(<HubSearch index={index}/>);const box=screen.getByRole('searchbox',{name:'Search posts or enter a post code'});
  fireEvent.change(box,{target:{value:'mcp101'}});const row=within(screen.getByRole('region',{name:'Search results'})).getByRole('link');
  expect(row.getAttribute('href')).toBe('/articles/post-0');expect(row.textContent).toContain('Code MCP101');expect(screen.getAllByRole('link')).toHaveLength(1);
  fireEvent.keyDown(box,{key:'Enter'});expect(m.push).toHaveBeenCalledWith('/articles/post-0');
 });
 it('otherwise searches titles and summaries and clears on Escape',()=>{
  render(<HubSearch index={index}/>);const box=screen.getByRole('searchbox');
  fireEvent.change(box,{target:{value:'mcp guide'}});expect(within(screen.getByRole('region',{name:'Search results'})).getAllByRole('link').map(a=>a.getAttribute('href'))).toEqual(['/guides/mcp']);
  fireEvent.change(box,{target:{value:'zzz'}});expect(screen.getByText(/Nothing matches/)).toBeTruthy();
  fireEvent.keyDown(box,{key:'Escape'});expect((box as HTMLInputElement).value).toBe('');expect(screen.queryByRole('region',{name:'Search results'})).toBeNull();
  expect(screen.getByText('MCP101')).toBeTruthy();
 });
});

describe('frame',()=>{
 it('tabs show counts and mark the current one',()=>{
  m.path='/content/series';render(<HubTabs counts={{latest:40,series:6,guides:3}}/>);
  const nav=screen.getByRole('navigation',{name:'Content sections'});expect(within(nav).getAllByRole('link').map(a=>[a.textContent,a.getAttribute('aria-current')])).toEqual([['Latest 40',null],['Series 6','page'],['Free guides 3',null]]);
  expect(within(nav).queryByText('Manage posts')).toBeNull();
 });
 it('Latest is current only on /content; owners see manage links',()=>{
  m.role='owner';m.path='/content';render(<HubTabs counts={{latest:1,series:0,guides:0}}/>);
  expect(screen.getByRole('link',{name:'Latest 1'}).getAttribute('aria-current')).toBe('page');expect(screen.getByRole('link',{name:'Manage series'}).getAttribute('href')).toBe('/content/series/manage');
 });
 it('footer band links to Instagram and YouTube when the Contact section has them',()=>{
  const {unmount}=render(<ContentFooterBand socials={[{kind:'instagram',href:'https://instagram.com/x'},{kind:'youtube',href:'https://youtube.com/@x'},{kind:'linkedin',href:'https://linkedin.com/in/x'}]}/>);
  expect(screen.getByText(/New posts every week\./)).toBeTruthy();expect(screen.getByRole('link',{name:'Instagram ↗'}).getAttribute('href')).toBe('https://instagram.com/x');expect(screen.getByRole('link',{name:'YouTube ↗'}).getAttribute('href')).toBe('https://youtube.com/@x');expect(screen.queryByRole('link',{name:/LinkedIn/})).toBeNull();unmount();
  render(<ContentFooterBand socials={[]}/>);expect(screen.queryAllByRole('link')).toHaveLength(0);
 });
 it('opening a post remembers it in this browser only',()=>{render(<MarkRead id="abc"/>);expect(JSON.parse(localStorage.getItem(READ_KEY)!)).toEqual(['abc']);});
});

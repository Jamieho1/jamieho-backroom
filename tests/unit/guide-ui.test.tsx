// @vitest-environment jsdom
import {afterEach,describe,it,expect,vi} from 'vitest';
import {render,screen,cleanup,within} from '@testing-library/react';
vi.mock('next/link',()=>({default:({prefetch:_p,children,...props}:React.ComponentProps<'a'>&{prefetch?:boolean})=><a {...props}>{children}</a>}));
import {GuideCards} from '@/components/content/guide-cards';
import {GuideDetail} from '@/components/content/guide-detail';
import {seriesParts} from '@/lib/content-series-view';
import type {HubGuide,HubPost} from '@/lib/content-hub';
import type {Guide} from '@/lib/guides';
afterEach(cleanup);
const hub:HubGuide={id:'g1',slug:'mcp',title:'The MCP guide',summary:'From first connection to production.',cover_url:'',notion_url:'https://example.com/n',doc_url:'https://example.com/d',created_at:'2026-11-01T00:00:00Z',updated_at:'2026-11-12T00:00:00Z',series_id:null,series_part:null,audience:'Anyone who uses Claude daily.',highlights:['One','Two','Three'],exercises:12,minutes:25,chapters:5};
describe('guide cards',()=>{
 it('shows topic, updated date, facts, audience, ticks and all three buttons',()=>{
  render(<GuideCards guides={[hub]} series={[]}/>);
  expect(screen.getByText('AI Engineering')).toBeTruthy();expect(screen.getByText(/Updated 12 Nov 2026/)).toBeTruthy();
  expect(screen.getByRole('heading',{level:3,name:'The MCP guide'})).toBeTruthy();
  expect(screen.getByText('chapters')).toBeTruthy();expect(screen.getByText('25m')).toBeTruthy();expect(screen.getByText('exercises')).toBeTruthy();
  expect(screen.getByText(/Anyone who uses Claude daily/).textContent).toMatch(/^For:/);
  expect(screen.getAllByRole('listitem')).toHaveLength(3);
  expect(screen.getByRole('link',{name:'Read the guide →'}).getAttribute('href')).toBe('/guides/mcp');
  expect(screen.getByRole('link',{name:'Notion toolkit ↗'}).getAttribute('href')).toBe('https://example.com/n');
  expect(screen.getByRole('link',{name:'Google Doc ↗'}).getAttribute('href')).toBe('https://example.com/d');
 });
 it('hides empty parts gracefully',()=>{
  render(<GuideCards guides={[{...hub,summary:'',audience:'',highlights:[],exercises:null,notion_url:'',doc_url:''}]} series={[]}/>);
  expect(screen.queryByText(/^For:/)).toBeNull();expect(screen.queryByRole('list')).toBeNull();expect(screen.queryByText('exercises')).toBeNull();
  expect(screen.queryByRole('link',{name:/Notion|Google/})).toBeNull();expect(screen.getByRole('link',{name:'Read the guide →'})).toBeTruthy();
 });
 it('marks a draft change and says so when there are no guides',()=>{
  const {container}=render(<GuideCards guides={[{...hub,draftChanged:true}]} series={[]}/>);
  expect(container.querySelector('.guide-card')?.getAttribute('data-draft-changed')).toBe('true');
  cleanup();render(<GuideCards guides={[]} series={[]}/>);expect(screen.getByText('No guides published yet.')).toBeTruthy();
 });
});
const guide:Guide={id:'g1',slug:'mcp',title:'The MCP guide',summary:'Summary here.',body:'Intro text.\n\n## First chapter\nHello world.\n\n## Second chapter\nMore.',notion_url:'https://example.com/n',doc_url:'',cover_url:'',series_id:'s1',series_part:2,audience:'',highlights:[],exercises:null,published:true,created_at:'2026-11-01T00:00:00Z',updated_at:'2026-11-12T00:00:00Z'};
const post=(id:string,part:number|null):HubPost=>({id,slug:id,title:`Post ${id}`,summary:'',platform:'instagram',category:'ai',cover_url:'',firstSlide:'',created_at:'2026-11-11T00:00:00Z',series_id:'s1',series_part:part,code:null,takeaway:'',minutes:5});
describe('guide page',()=>{
 it('renders hero, take-it-with-you, chapter cards and the body with the rail',()=>{
  const posts=seriesParts({id:'s1'},[post('b',3),post('a',1)],[]).filter(p=>p.kind==='post');
  const {container}=render(<GuideDetail guide={guide} topic="AI Engineering" posts={posts}/>);
  expect(screen.getByText('FREE GUIDE · AI ENGINEERING')).toBeTruthy();
  expect(screen.getByRole('heading',{level:1,name:'The MCP guide'})).toBeTruthy();
  expect(container.querySelector('.sty-hmeta')?.textContent).toBe('2 chapters · ~1 min read · Updated 12 Nov 2026');
  expect(screen.getByRole('link',{name:'Start chapter 1 →'}).getAttribute('href')).toBe('#first-chapter');
  const take=screen.getByRole('region',{name:'Take it with you'});
  expect(within(take).getByRole('link',{name:'Open the Notion toolkit ↗'})).toBeTruthy();
  expect(within(take).queryByText(/Google Doc/)).toBeNull();
  const links=within(take).getAllByRole('link').slice(1);expect(links.map(l=>l.getAttribute('href'))).toEqual(['/articles/a','/articles/b']);
  const chapters=screen.getByRole('region',{name:'Chapters'});
  expect(within(chapters).getAllByRole('link').map(l=>l.textContent)).toEqual(['01First chapter1 min','02Second chapter1 min']);
  expect(screen.getByRole('complementary',{name:'Chapter index'})).toBeTruthy();
  expect(container.querySelector('h2#first-chapter')).toBeTruthy();expect(container.querySelector('#story-cols')).toBeTruthy();
  expect(container.querySelector('.guide-page .article-read')).toBeTruthy();
 });
 it('hides the card when there is no toolkit and no posts, and the rail and chapters when there are no headings',()=>{
  render(<GuideDetail guide={{...guide,notion_url:'',body:'Only text.'}} topic="General" posts={[]}/>);
  expect(screen.queryByRole('region',{name:'Take it with you'})).toBeNull();expect(screen.queryByRole('region',{name:'Chapters'})).toBeNull();
  expect(screen.queryByRole('complementary',{name:'Chapter index'})).toBeNull();expect(screen.queryByRole('link',{name:/Start chapter/})).toBeNull();
  expect(screen.getByText('Only text.')).toBeTruthy();
 });
 it('keeps the toolkit and preview marker, and omits Pin',()=>{
  const {container}=render(<GuideDetail guide={{...guide,doc_url:'https://example.com/d',draftChanged:true,published:false}} topic="General" posts={[]} unpublished/>);
  expect(screen.getByRole('link',{name:'Copy the Google Doc ↗'})).toBeTruthy();expect(screen.getByRole('status').textContent).toBe('Unpublished in this preview');
  expect(container.querySelector('.article-read')?.getAttribute('data-draft-changed')).toBe('true');expect(screen.queryByRole('button',{name:/pin/i})).toBeNull();
 });
});

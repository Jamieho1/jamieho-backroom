// @vitest-environment jsdom
import {afterEach,beforeEach,describe,it,expect,vi} from 'vitest';
import {render,screen,cleanup,fireEvent,within,waitFor} from '@testing-library/react';
const m=vi.hoisted(()=>({role:'anonymous' as string,configured:true,load:vi.fn(),save:vi.fn()}));
vi.mock('next/link',()=>({default:({prefetch:_p,children,...props}:React.ComponentProps<'a'>&{prefetch?:boolean})=><a {...props}>{children}</a>}));
vi.mock('@/components/viewer-provider',()=>({useViewer:()=>({viewer:{status:m.role,id:m.role==='anonymous'?undefined:'u1'},configured:m.configured})}));
vi.mock('@/components/sign-in-button',()=>({SignInButton:({label}:{label?:string})=><button type="button">{label}</button>}));
vi.mock('@/app/actions/article-pins',()=>({loadArticlePins:m.load,saveArticlePin:m.save}));
import {PostDetail} from '@/components/content/post-detail';
import {PostSlides} from '@/components/content/post-slides';
import {seriesParts} from '@/lib/content-series-view';
import {READ_KEY} from '@/lib/content-read-state';
import {ARTICLE_NEW_DEFAULTS,type Article} from '@/lib/articles';
import type {HubPost,HubSeries} from '@/lib/content-hub';

const body='Intro.\n\n## The loop\nText.\n\n```text title="A prompt"\nCopy me\n```\n\n## Plug it in once\nMore.\n\n## Links and sources\n- [A](https://a.example)';
const article:Article={id:'a1',slug:'stop-copy-pasting',title:'Stop copy-pasting into Claude',summary:'What MCP changes.',body,platform:'instagram',category:'ai',source_url:'https://www.instagram.com/p/x/',cover_url:'',project_id:null,...ARTICLE_NEW_DEFAULTS,series_id:'s1',series_part:1,code:'MCP101',takeaway:'',slides:['https://img.example/1.jpg','https://img.example/2.jpg','https://img.example/3.jpg'],published:true,created_at:'2026-11-11T09:00:00Z',updated_at:'2026-11-11T09:00:00Z'};
const series:HubSeries={id:'s1',slug:'mcp-101',title:'MCP 101',goal:'Use MCP',topic:'ai',planned_parts:5,sort:0};
const hubPost=(id:string,o:Partial<HubPost>={}):HubPost=>({id,slug:id,title:`Related ${id}`,summary:'',platform:'instagram',category:'ai',cover_url:'',firstSlide:'',created_at:'2026-11-01T00:00:00Z',series_id:null,series_part:null,code:null,takeaway:'',minutes:5,...o});
const next=seriesParts({id:'s1'},[hubPost('p2',{series_id:'s1',series_part:2,title:'The second part'})],[])[0];
beforeEach(()=>{m.role='anonymous';m.configured=true;m.load.mockReset().mockResolvedValue({ok:true,ids:[]});m.save.mockReset().mockResolvedValue({ok:true});try{localStorage.clear();}catch{/* */}});
afterEach(cleanup);
const props=(o:Partial<Parameters<typeof PostDetail>[0]>={})=>({article,series,allSeries:[series],next,related:[hubPost('r1'),hubPost('r2'),hubPost('r3')],...o});
const view=(o:Partial<Parameters<typeof PostDetail>[0]>={})=>render(<PostDetail {...props(o)}/>);

describe('post page',()=>{
 it('header: breadcrumb with series part, title, summary, meta with code, origin banner with View post',()=>{
  const {container}=view();
  const crumb=screen.getByRole('navigation',{name:'Breadcrumb'});
  expect(within(crumb).getByRole('link',{name:'Content'}).getAttribute('href')).toBe('/content');
  expect(within(crumb).getByRole('link',{name:'MCP 101 · part 1 of 5'}).getAttribute('href')).toBe('/content/series/mcp-101');
  expect(screen.getByRole('heading',{level:1,name:'Stop copy-pasting into Claude'})).toBeTruthy();
  expect(screen.getByText('What MCP changes.')).toBeTruthy();
  expect(container.querySelector('.sty-hmeta')?.textContent).toBe('11 Nov 2026 · 1 min read · AI · Code MCP101');
  expect(container.querySelector('.post-origin')?.textContent).toContain('The long version of my Instagram carousel.');
  const link=screen.getByRole('link',{name:'View post ↗'});expect(link.getAttribute('href')).toBe('https://www.instagram.com/p/x/');expect(link.getAttribute('rel')).toContain('noopener');
 });
 it('has the left chapter rail from ## headings and no old sidebar or On this page column',()=>{
  const {container}=view();
  const rail=screen.getByRole('complementary',{name:'Chapter index'});
  expect(within(rail).getAllByRole('link').map(a=>a.textContent)).toEqual(['01The loop','02Plug it in once','03Links and sources']);
  expect(container.querySelector('h2#the-loop')).toBeTruthy();expect(container.querySelector('h2.article-endmatter')?.textContent).toBe('Links and sources');
  expect(screen.queryByText('Latest posts')).toBeNull();expect(screen.queryByRole('navigation',{name:'On this page'})).toBeNull();
  expect(screen.getByRole('button',{name:'Copy A prompt'})).toBeTruthy();
 });
 it('no headings: no rail; no source_url: no origin banner; no series: one crumb link and no series bar',()=>{
  const {container}=view({article:{...article,body:'Just text.',source_url:'',series_id:null,series_part:null},series:null,next:null});
  expect(screen.queryByRole('complementary',{name:'Chapter index'})).toBeNull();expect(container.querySelector('.post-origin')).toBeNull();
  expect(within(screen.getByRole('navigation',{name:'Breadcrumb'})).getAllByRole('link')).toHaveLength(1);expect(screen.queryByRole('navigation',{name:'Series'})).toBeNull();
  expect(screen.getByRole('region',{name:'More like this'})).toBeTruthy();
 });
 it('YouTube posts keep the embedded player (click to play) and the origin line says video',()=>{
  const {container}=view({article:{...article,platform:'youtube',source_url:'https://youtu.be/dQw4w9WgXcQ',slides:[]}});
  expect(container.querySelector('.post-origin')?.textContent).toContain('YouTube video');
  fireEvent.click(screen.getByRole('button',{name:/Play video/}));expect(container.querySelector('iframe')?.getAttribute('src')).toContain('youtube-nocookie.com/embed/dQw4w9WgXcQ');
 });
 it('series bar: all N parts, and Next · part n with the title; only the series cell when there is no next part',()=>{
  const {rerender}=view();
  const links=within(screen.getByRole('navigation',{name:'Series'})).getAllByRole('link');
  expect(links).toHaveLength(2);expect(links[0].getAttribute('href')).toBe('/content/series/mcp-101');expect(links[0].textContent).toContain('All 5 parts of MCP 101');
  expect(links[1].getAttribute('href')).toBe('/articles/p2');expect(links[1].textContent).toContain('Next · part 2');expect(links[1].textContent).toContain('The second part →');
  rerender(<PostDetail {...props({next:null,related:[]})}/>);
  expect(within(screen.getByRole('navigation',{name:'Series'})).getAllByRole('link')).toHaveLength(1);
  expect(screen.queryByRole('region',{name:'More like this'})).toBeNull();
 });
 it('next part can be a guide',()=>{
  view({next:{...next,kind:'guide',title:'The MCP Guide',href:'/guides/mcp',part:2}});
  expect(screen.getByRole('link',{name:/The MCP Guide →/}).getAttribute('href')).toBe('/guides/mcp');
 });
 it('More like this shows the post cards, with the Read badge from this browser',async()=>{
  try{localStorage.setItem(READ_KEY,JSON.stringify(['r2']));}catch{/* */}
  view();
  const region=screen.getByRole('region',{name:'More like this'});
  expect(within(region).getAllByRole('link').map(a=>a.getAttribute('href'))).toEqual(['/articles/r1','/articles/r2','/articles/r3']);
  await waitFor(()=>expect(within(region).getByText('Read')).toBeTruthy());
 });
 it('marks the post read in this browser and shows the preview marker',()=>{
  const {container}=view({article:{...article,draftChanged:true,published:false},unpublished:true});
  expect(screen.getByRole('status').textContent).toBe('Unpublished in this preview');
  expect(container.querySelector('.article-read')?.getAttribute('data-draft-changed')).toBe('true');
  expect(JSON.parse(localStorage.getItem(READ_KEY)??'[]')).toContain('a1');
 });
});
describe('pin',()=>{
 it('signed-out visitors get a sign-in button, not a pin; hidden when sign-in is not configured',()=>{
  view();expect(screen.getByRole('button',{name:'☆ Pin'})).toBeTruthy();expect(screen.queryByRole('link',{name:'Manage'})).toBeNull();
  cleanup();m.configured=false;view();expect(screen.queryByRole('button',{name:'☆ Pin'})).toBeNull();
 });
 it('members pin and unpin, and a failed save keeps the state and offers a retry',async()=>{
  m.role='member';view();
  const pin=await screen.findByRole('button',{name:'Pin Stop copy-pasting into Claude'});await waitFor(()=>expect((pin as HTMLButtonElement).disabled).toBe(false));
  m.save.mockResolvedValueOnce({ok:false,message:'Pin save failed'});fireEvent.click(pin);
  expect((await screen.findByRole('alert')).textContent).toContain('Pin save failed');expect(pin.getAttribute('aria-pressed')).toBe('false');
  fireEvent.click(screen.getByRole('button',{name:'Retry pin change'}));
  await waitFor(()=>expect(screen.getByRole('button',{name:'Unpin Stop copy-pasting into Claude'}).getAttribute('aria-pressed')).toBe('true'));
  expect(m.save).toHaveBeenLastCalledWith('a1',true);
  fireEvent.click(screen.getByRole('button',{name:'Unpin Stop copy-pasting into Claude'}));await waitFor(()=>expect(m.save).toHaveBeenLastCalledWith('a1',false));
 });
 it('the owner also sees Manage',()=>{m.role='owner';view();expect(screen.getByRole('link',{name:'Manage'}).getAttribute('href')).toBe('/articles/manage');});
});
describe('slides strip and viewer',()=>{
 const slides=['https://img.example/1.jpg','https://img.example/2.jpg','https://img.example/3.jpg'];
 it('shows nothing without slides, else one button per slide',()=>{
  const {container}=render(<PostSlides slides={[]} title="T"/>);expect(container.innerHTML).toBe('');cleanup();
  render(<PostSlides slides={slides} title="T"/>);expect(screen.getAllByRole('button',{name:/Open slide/})).toHaveLength(3);expect(screen.queryByRole('dialog')).toBeNull();
 });
 it('opens a modal dialog focused on Close, arrow keys move (wrapping), Escape closes and returns focus to the slide',()=>{
  render(<PostSlides slides={slides} title="Carousel post"/>);
  const second=screen.getByRole('button',{name:'Open slide 2 of 3'});second.focus();fireEvent.click(second);
  const dialog=screen.getByRole('dialog',{name:'Carousel post: carousel slides'});expect(dialog.getAttribute('aria-modal')).toBe('true');
  expect(document.activeElement).toBe(screen.getByRole('button',{name:'Close slide viewer'}));
  expect(within(dialog).getByRole('img').getAttribute('alt')).toBe('Slide 2 of 3');expect(within(dialog).getByText('2 / 3')).toBeTruthy();
  fireEvent.keyDown(document,{key:'ArrowRight'});expect(within(dialog).getByRole('img').getAttribute('alt')).toBe('Slide 3 of 3');
  fireEvent.keyDown(document,{key:'ArrowRight'});expect(within(dialog).getByRole('img').getAttribute('alt')).toBe('Slide 1 of 3');
  fireEvent.keyDown(document,{key:'ArrowLeft'});expect(within(dialog).getByRole('img').getAttribute('alt')).toBe('Slide 3 of 3');
  fireEvent.keyDown(document,{key:'Escape'});expect(screen.queryByRole('dialog')).toBeNull();expect(document.activeElement).toBe(second);
 });
 it('traps Tab inside the dialog and the buttons also step and close',()=>{
  render(<PostSlides slides={slides} title="T"/>);fireEvent.click(screen.getByRole('button',{name:'Open slide 1 of 3'}));
  const close=screen.getByRole('button',{name:'Close slide viewer'}),prev=screen.getByRole('button',{name:'Previous slide'}),nextB=screen.getByRole('button',{name:'Next slide'});
  nextB.focus();fireEvent.keyDown(document,{key:'Tab'});expect(document.activeElement).toBe(close);
  close.focus();fireEvent.keyDown(document,{key:'Tab',shiftKey:true});expect(document.activeElement).toBe(nextB);
  fireEvent.click(prev);expect(screen.getByRole('img',{name:'Slide 3 of 3'})).toBeTruthy();
  fireEvent.click(close);expect(screen.queryByRole('dialog')).toBeNull();
 });
});

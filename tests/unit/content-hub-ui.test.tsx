// @vitest-environment jsdom
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {render,screen,fireEvent,cleanup,waitFor} from '@testing-library/react';
const m=vi.hoisted(()=>({article:vi.fn(),guide:vi.fn(),series:vi.fn()}));
vi.mock('@/app/actions/articles',()=>({saveArticle:m.article}));vi.mock('@/app/actions/guides',()=>({saveGuide:m.guide}));vi.mock('@/app/actions/content-series',()=>({saveSeries:m.series}));
vi.mock('next/link',()=>({default:({prefetch:_p,children,...props}:React.ComponentProps<'a'>&{prefetch?:boolean})=><a {...props}>{children}</a>}));
import {ArticleEditor} from '@/components/articles/editor';
import {GuideEditor} from '@/components/guides/editor';
import {SeriesEditor} from '@/components/content/series-editor';
import {emptyArticle,type Article} from '@/lib/articles';
import {emptyGuide,type Guide} from '@/lib/guides';
import type {SeriesRow} from '@/lib/content-series-data';
const sid='00000000-0000-4000-8000-000000000e01';
const series=[{id:sid,slug:'mcp-101',title:'MCP 101'}];
const article:Article={...emptyArticle(),id:'00000000-0000-4000-8000-000000000e02',slug:'post',title:'A post',created_at:'now',updated_at:'now'};
const guide:Guide={...emptyGuide(),id:'00000000-0000-4000-8000-000000000e03',slug:'guide',title:'A guide',created_at:'now',updated_at:'now'};
const row:SeriesRow={id:sid,slug:'mcp-101',title:'MCP 101',goal:'Build a server',topic:'ai',planned_parts:5,sort:10,published:false,created_at:'now',updated_at:'now'};
beforeEach(()=>{vi.clearAllMocks();m.article.mockImplementation(async i=>({ok:true,article:{...i,created_at:'now',updated_at:'now'}}));m.guide.mockImplementation(async i=>({ok:true,guide:{...i,created_at:'now',updated_at:'now'}}));m.series.mockImplementation(async i=>({ok:true,series:{...i,created_at:'now',updated_at:'now'}}));});afterEach(cleanup);
const open=(name:string)=>fireEvent.click(screen.getByRole('button',{name}));
const type=(label:string|RegExp,value:string)=>fireEvent.change(screen.getByLabelText(label),{target:{value}});

it('post editor: takeaway, series + part, uppercase code and slide URLs are saved',async()=>{
 render(<ArticleEditor initial={[article]} series={series} />);open('Edit A post');
 expect(screen.queryByLabelText(/Part number in the series/)).toBeNull();
 type(/You'll learn/,'Wire up one tool');type(/Series \(optional\)/,sid);type(/Part number in the series/,'3');type(/Post code from the last slide/,'mcp101 !');
 type(/Carousel slide image URLs/,'https://example.com/1.png\n\n  https://example.com/2.png  \n');
 fireEvent.click(screen.getByRole('button',{name:'Save article'}));await waitFor(()=>expect(m.article).toHaveBeenCalled());
 expect(m.article.mock.calls[0][0]).toMatchObject({takeaway:'Wire up one tool',series_id:sid,series_part:3,code:'MCP101',slides:['https://example.com/1.png','https://example.com/2.png']});
});
it('post editor: a series without a part is stopped before saving; clearing the series clears the part; an empty code saves as null',async()=>{
 render(<ArticleEditor initial={[article]} series={series} />);open('Edit A post');
 type(/Series \(optional\)/,sid);fireEvent.click(screen.getByRole('button',{name:'Save article'}));
 expect((await screen.findByRole('alert')).textContent).toMatch(/series and a part number together/);expect(m.article).not.toHaveBeenCalled();
 type(/Part number in the series/,'2');type(/Series \(optional\)/,'');expect(screen.queryByLabelText(/Part number in the series/)).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:/^(Save article|Retry)$/}));await waitFor(()=>expect(m.article).toHaveBeenCalled());
 expect(m.article.mock.calls[0][0]).toMatchObject({series_id:null,series_part:null,code:null,slides:[]});
});
it('post editor: existing slides and series are shown when editing',()=>{
 render(<ArticleEditor initial={[{...article,series_id:sid,series_part:4,code:'ABC1',slides:['https://example.com/a.png','https://example.com/b.png']}]} series={series} />);open('Edit A post');
 expect((screen.getByLabelText(/Carousel slide image URLs/) as HTMLTextAreaElement).value).toBe('https://example.com/a.png\nhttps://example.com/b.png');
 expect((screen.getByLabelText(/Part number in the series/) as HTMLInputElement).value).toBe('4');expect((screen.getByLabelText(/Post code from the last slide/) as HTMLInputElement).value).toBe('ABC1');
});
it('guide editor: audience, up to three highlights, exercises and series are saved; blank ticks are dropped',async()=>{
 render(<GuideEditor initial={[guide]} series={series} />);open('Edit A guide');
 expect(screen.getAllByLabelText(/^Highlight \d$/)).toHaveLength(3);
 type(/For \(who it's for/,'Engineers new to MCP');fireEvent.change(screen.getByLabelText('Highlight 1'),{target:{value:'Setup'}});fireEvent.change(screen.getByLabelText('Highlight 3'),{target:{value:'  Deploy  '}});
 type(/Exercises/,'6');type(/Series \(optional\)/,sid);type(/Part number in the series/,'1');
 fireEvent.click(screen.getByRole('button',{name:'Save guide'}));await waitFor(()=>expect(m.guide).toHaveBeenCalled());
 expect(m.guide.mock.calls[0][0]).toMatchObject({audience:'Engineers new to MCP',highlights:['Setup','Deploy'],exercises:6,series_id:sid,series_part:1});
});
it('guide editor: a series without a part is stopped; exercises can be cleared to null',async()=>{
 render(<GuideEditor initial={[{...guide,exercises:4}]} series={series} />);open('Edit A guide');
 type(/Series \(optional\)/,sid);fireEvent.click(screen.getByRole('button',{name:'Save guide'}));expect((await screen.findByRole('alert')).textContent).toMatch(/together/);expect(m.guide).not.toHaveBeenCalled();
 type(/Series \(optional\)/,'');type(/Exercises/,'');fireEvent.click(screen.getByRole('button',{name:/^(Save guide|Retry)$/}));await waitFor(()=>expect(m.guide).toHaveBeenCalled());
 expect(m.guide.mock.calls[0][0]).toMatchObject({exercises:null,series_id:null,series_part:null});
});
it('series editor: lists series, creates one, edits, publishes and shows save failures',async()=>{
 render(<SeriesEditor initial={[row]} />);
 expect(screen.getByText('MCP 101')).toBeTruthy();expect(screen.getByText('Draft')).toBeTruthy();expect(screen.queryByRole('link',{name:'Open series'})).toBeNull();
 open('New series');type('Title','Career ladder');type('URL slug','career-ladder');type(/After this/,'Know your next promotion');type(/Planned parts/,'4');fireEvent.click(screen.getByRole('button',{name:'Career'}));fireEvent.click(screen.getByLabelText(/Publish publicly/));
 fireEvent.click(screen.getByRole('button',{name:'Save series'}));await waitFor(()=>expect(m.series).toHaveBeenCalled());
 expect(m.series.mock.calls[0][0]).toMatchObject({slug:'career-ladder',title:'Career ladder',goal:'Know your next promotion',topic:'career',planned_parts:4,published:true});
 expect(await screen.findByText('Career ladder')).toBeTruthy();expect(screen.getByRole('link',{name:'Open series'}).getAttribute('href')).toBe('/content/series/career-ladder');
 open('Edit MCP 101');expect((screen.getByLabelText('Title') as HTMLInputElement).value).toBe('MCP 101');m.series.mockResolvedValueOnce({ok:false,message:'That slug is already in use. Choose another one.'});
 fireEvent.click(screen.getByRole('button',{name:'Save series'}));expect((await screen.findByRole('alert')).textContent).toMatch(/slug is already in use/);expect(screen.getByRole('button',{name:'Retry'})).toBeTruthy();
 open('Cancel');expect(screen.queryByRole('form')).toBeNull();
});
it('series editor: an offline failure keeps the draft and says to retry',async()=>{
 m.series.mockRejectedValueOnce(new Error('offline'));render(<SeriesEditor initial={[]} />);expect(screen.getByText(/No series yet/)).toBeTruthy();
 open('New series');type('Title','Draft');type('URL slug','draft');fireEvent.click(screen.getByRole('button',{name:'Save series'}));expect((await screen.findByRole('alert')).textContent).toMatch(/Couldn't save/);
 expect((screen.getByLabelText('Title') as HTMLInputElement).value).toBe('Draft');
});

// @vitest-environment jsdom
import {beforeEach,describe,expect,it,vi} from 'vitest';
const m=vi.hoisted(()=>({slug:vi.fn(),codes:vi.fn()}));
vi.mock('@/lib/articles-public',()=>({getSlugByCode:m.slug,getPublishedCodes:m.codes}));
import {PAGE_STEP,applyFilters,buildSearchIndex,cleanCode,filtersActive,filtersQuery,findPostByCode,groupByMonth,isNew,monthHeading,monthKey,parseFilters,platformOptions,runSearch,seriesChip,timeLabel,toHubGuide,toHubPost,topicOptions,visibleSeries,type HubPost,type HubSeries} from '@/lib/content-hub';
import {MAX_READ,READ_KEY,VIEW_KEY,markRead,readIds,readView,saveView} from '@/lib/content-read-state';
import {GET,generateStaticParams} from '@/app/p/[code]/route';
import nextConfig from '@/next.config';

const sid='00000000-0000-4000-8000-000000000a01';
const post=(o:Partial<HubPost>={}):HubPost=>({id:'p'+Math.random(),slug:'a',title:'A post',summary:'',platform:'instagram',category:'ai',cover_url:'',firstSlide:'',created_at:'2026-11-11T10:00:00Z',series_id:null,series_part:null,code:null,takeaway:'',minutes:5,...o});
const series:HubSeries={id:sid,slug:'mcp-101',title:'MCP 101',goal:'Ship a server',topic:'ai',planned_parts:5,sort:10};
const guideRow={id:'g',slug:'mcp',title:'The MCP Guide',summary:'From first connection to production',body:'',cover_url:'',notion_url:'',doc_url:'',created_at:'a',updated_at:'b',series_id:null,series_part:null,audience:'',highlights:[] as string[],exercises:null};

describe('code lookup',()=>{
 const posts=[post({slug:'one',code:'MCP101'}),post({slug:'two',code:null}),post({slug:'three',code:'AB12'})];
 it('matches exactly and case-insensitively',()=>{
  expect(findPostByCode(posts,'MCP101')?.slug).toBe('one');expect(findPostByCode(posts,' mcp101 ')?.slug).toBe('one');expect(findPostByCode(posts,'ab12')?.slug).toBe('three');
  expect(findPostByCode(posts,'MCP10')).toBeNull();expect(findPostByCode(posts,'')).toBeNull();expect(findPostByCode(posts,'  ')).toBeNull();
 });
 it('cleans codes from URLs',()=>{expect(cleanCode('mcp101')).toBe('MCP101');expect(cleanCode('bad code!')).toBeNull();expect(cleanCode('A'.repeat(17))).toBeNull();expect(cleanCode(null)).toBeNull();});
});

describe('filters and URL params',()=>{
 it('parses only known topics and platforms',()=>{
  expect(parseFilters(new URLSearchParams('topic=ai&platform=instagram'))).toEqual({topic:'ai',platform:'instagram'});
  expect(parseFilters(new URLSearchParams('topic=nope&platform=%3Cscript%3E'))).toEqual({topic:'',platform:''});
  expect(parseFilters(new URLSearchParams(''))).toEqual({topic:'',platform:''});
  expect(parseFilters(new URLSearchParams('topic=toString'))).toEqual({topic:'',platform:''});
 });
 it('builds the query string, empty when nothing is chosen',()=>{
  expect(filtersQuery({topic:'',platform:''})).toBe('');expect(filtersQuery({topic:'ai',platform:''})).toBe('?topic=ai');expect(filtersQuery({topic:'career',platform:'youtube'})).toBe('?topic=career&platform=youtube');
  expect(filtersActive({topic:'',platform:''})).toBe(false);expect(filtersActive({topic:'ai',platform:''})).toBe(true);
 });
 const posts=[post({category:'ai',platform:'instagram'}),post({category:'ai',platform:'youtube'}),post({category:'career',platform:'instagram'})];
 it('filters by topic and platform together',()=>{
  expect(applyFilters(posts,{topic:'ai',platform:''})).toHaveLength(2);expect(applyFilters(posts,{topic:'ai',platform:'youtube'})).toHaveLength(1);expect(applyFilters(posts,{topic:'',platform:''})).toHaveLength(3);expect(applyFilters(posts,{topic:'building',platform:''})).toHaveLength(0);
 });
 it('counts menu options against the other filter and hides empty ones',()=>{
  expect(topicOptions(posts,{topic:'',platform:''}).map(o=>[o.label,o.count])).toEqual([['All topics',3],['AI',2],['Career',1]]);
  expect(topicOptions(posts,{topic:'',platform:'youtube'}).map(o=>[o.label,o.count])).toEqual([['All topics',1],['AI',1]]);
  expect(platformOptions(posts,{topic:'career',platform:''}).map(o=>[o.label,o.count])).toEqual([['All platforms',1],['Instagram',1]]);
  expect(topicOptions(posts,{topic:'building',platform:''}).map(o=>o.label)).toContain('Building in Public');
 });
});

describe('month grouping, badges and labels',()=>{
 const rows=[post({created_at:'2026-11-20T09:00:00Z'}),post({created_at:'2026-11-02T09:00:00Z'}),post({created_at:'2026-10-30T09:00:00Z'})];
 it('groups newest-first posts by month with the full count',()=>{
  const g=groupByMonth(rows.slice(0,2),rows);
  expect(g).toHaveLength(1);expect(g[0]).toMatchObject({key:'2026-11',label:'November 2026',total:2});
  expect(groupByMonth(rows).map(x=>monthHeading(x))).toEqual(['November 2026 · 2 posts','October 2026 · 1 post']);
  expect(groupByMonth([],[])).toEqual([]);
 });
 it('uses London months, so a late-night UTC post stays in its London month',()=>{expect(monthKey('2026-06-30T23:30:00Z')).toBe('2026-07');expect(monthKey('nope')).toBe('unknown');});
 it('marks posts from the last 14 days as NEW',()=>{
  const now=Date.parse('2026-11-25T12:00:00Z');
  expect(isNew('2026-11-25T08:00:00Z',now)).toBe(true);expect(isNew('2026-11-11T12:00:00Z',now)).toBe(true);expect(isNew('2026-11-11T11:59:00Z',now)).toBe(false);expect(isNew('garbage',now)).toBe(false);
 });
 it('labels read time, with "min video" for YouTube',()=>{expect(timeLabel({platform:'instagram',minutes:5})).toBe('5 min read');expect(timeLabel({platform:'youtube',minutes:10})).toBe('10 min video');});
 it('pages 12 at a time',()=>{expect(PAGE_STEP).toBe(12);});
});

describe('series chips and data mapping',()=>{
 it('shows "MCP 101 · 1/5" only for posts in a published series',()=>{
  expect(seriesChip({series_id:sid,series_part:1},[series])).toBe('MCP 101 · 1/5');expect(seriesChip({series_id:sid,series_part:7},[series])).toBe('MCP 101 · 7/7');
  expect(seriesChip({series_id:null,series_part:null},[series])).toBe('');expect(seriesChip({series_id:sid,series_part:1},[])).toBe('');
 });
 it('lists a series only when it has a published part',()=>{
  expect(visibleSeries([series],[],[])).toEqual([]);expect(visibleSeries([series],[post({series_id:sid,series_part:1})],[])).toEqual([series]);
 });
 it('computes read time on the server and keeps only the first slide',()=>{
  const row={id:'1',slug:'s',title:'T',summary:'',body:'word '.repeat(450),platform:'instagram' as const,category:'ai' as const,cover_url:'',created_at:'2026-11-11T10:00:00Z',series_id:null,series_part:null,code:null,takeaway:'',slides:['https://e.com/1.png','https://e.com/2.png']};
  const p=toHubPost(row);expect(p.minutes).toBe(3);expect(p.firstSlide).toBe('https://e.com/1.png');expect('body' in p).toBe(false);
  const g=toHubGuide({...guideRow,body:'## One\ntext\n## Two\ntext',highlights:null});expect(g).toMatchObject({chapters:2,minutes:1,highlights:[]});expect('body' in g).toBe(false);
 });
});

describe('search',()=>{
 const index=buildSearchIndex({posts:[post({title:'Stop copy-pasting into Claude',slug:'stop',code:'MCP101',summary:'Why MCP exists'}),post({title:'Other thing',slug:'other',summary:'mentions claude too'})],guides:[toHubGuide(guideRow)],series:[series]});
 it('an exact code gives a single post result',()=>{
  const r=runSearch(index,'mcp101');expect(r.mode).toBe('code');if(r.mode==='code'){expect(r.hit.href).toBe('/articles/stop');expect(r.hit.code).toBe('MCP101');}
  expect(runSearch(index,' MCP101 ').mode).toBe('code');
 });
 it('otherwise searches titles and summaries across posts, series and guides, title matches first',()=>{
  const r=runSearch(index,'claude');expect(r.mode).toBe('results');if(r.mode==='results')expect(r.items.map(i=>i.href)).toEqual(['/articles/stop','/articles/other']);
  const mcp=runSearch(index,'mcp');if(mcp.mode==='results')expect(mcp.items.map(i=>i.kind).sort()).toEqual(['guide','post','series']);
  const both=runSearch(index,'first production');if(both.mode==='results')expect(both.items.map(i=>i.title)).toEqual(['The MCP Guide']);
 });
 it('is idle when empty and returns an empty list when nothing matches',()=>{expect(runSearch(index,'  ')).toEqual({mode:'idle'});expect(runSearch(index,'zzzz')).toEqual({mode:'results',items:[]});expect(runSearch(index,'MCP999').mode).toBe('results');});
});

describe('read-state storage',()=>{
 beforeEach(()=>{localStorage.clear();vi.restoreAllMocks();});
 it('remembers opened ids and the view',()=>{expect(markRead('a')).toBe(true);markRead('b');markRead('a');expect([...readIds()]).toEqual(['b','a']);saveView('list');expect(readView()).toBe('list');saveView('grid');expect(readView()).toBe('grid');});
 it('ignores malformed storage',()=>{for(const bad of ['not json','{"a":1}','[1,2,{}]','null']){localStorage.setItem(READ_KEY,bad);expect(readIds().size).toBe(0);}localStorage.setItem(READ_KEY,'["ok",3,"also"]');expect([...readIds()]).toEqual(['ok','also']);localStorage.setItem(VIEW_KEY,'weird');expect(readView()).toBe('grid');});
 it('keeps only the newest ids and rejects absurd ids',()=>{for(let i=0;i<MAX_READ+5;i++)markRead('id'+i);const ids=[...readIds()];expect(ids).toHaveLength(MAX_READ);expect(ids.at(-1)).toBe('id'+(MAX_READ+4));expect(ids).not.toContain('id0');expect(markRead('')).toBe(false);expect(markRead('x'.repeat(65))).toBe(false);});
 it('never throws when storage is blocked or full',()=>{
  vi.spyOn(Storage.prototype,'getItem').mockImplementation(()=>{throw new Error('blocked');});vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw new Error('full');});
  expect(readIds().size).toBe(0);expect(markRead('a')).toBe(false);expect(readView()).toBe('grid');expect(()=>saveView('list')).not.toThrow();
 });
});

describe('short links /p/<code>',()=>{
 beforeEach(()=>{m.slug.mockReset();m.codes.mockReset();});
 const call=(code:string)=>GET(new Request('https://x.test/p/'+code),{params:Promise.resolve({code})});
 it('permanently redirects a known code, in any case, to the post',async()=>{m.slug.mockResolvedValue('stop-copy-pasting');const r=await call('mcp101');expect(r.status).toBe(308);expect(r.headers.get('location')).toBe('/articles/stop-copy-pasting');expect(m.slug).toHaveBeenCalledWith('MCP101');});
 it('sends unknown codes to the hub with a friendly note',async()=>{m.slug.mockResolvedValue(null);const r=await call('nope1');expect(r.status).toBe(307);expect(r.headers.get('location')).toBe('/content?code=NOPE1');});
 it('does not look up invalid codes',async()=>{const r=await call('bad%20code');expect(r.status).toBe(307);expect(r.headers.get('location')).toMatch(/^\/content\?code=/);expect(m.slug).not.toHaveBeenCalled();});
 it('pre-renders the known codes',async()=>{m.codes.mockResolvedValue(['MCP101','AB12']);expect(await generateStaticParams()).toEqual([{code:'MCP101'},{code:'AB12'}]);m.codes.mockRejectedValue(new Error('down'));expect(await generateStaticParams()).toEqual([]);});
});

describe('redirects',()=>{
 it('308s /articles, /resources and /guides to the hub and leaves post and guide pages alone',async()=>{
  const rules=await nextConfig.redirects!();const to=(s:string)=>rules.find(r=>r.source===s);
  expect(to('/articles')).toMatchObject({destination:'/content',permanent:true});expect(to('/resources')).toMatchObject({destination:'/content/guides',permanent:true});expect(to('/guides')).toMatchObject({destination:'/content/guides',permanent:true});
  expect(rules.some(r=>r.source.startsWith('/articles/')||r.source.startsWith('/guides/'))).toBe(false);
 });
});

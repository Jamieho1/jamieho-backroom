import {describe,it,expect} from 'vitest';
import {crumbSeries,nextPart,originLine,partOfLabel,postChapters,postMeta,relatedPosts,stepSlide} from '@/lib/post-view';
import type {HubGuide,HubPost,HubSeries} from '@/lib/content-hub';

const series:HubSeries={id:'s1',slug:'mcp-101',title:'MCP 101',goal:'Use MCP',topic:'ai',planned_parts:5,sort:0};
const post=(id:string,o:Partial<HubPost>={}):HubPost=>({id,slug:id,title:`Post ${id}`,summary:'',platform:'instagram',category:'ai',cover_url:'',firstSlide:'',created_at:'2026-11-01T00:00:00Z',series_id:null,series_part:null,code:null,takeaway:'',minutes:5,...o});
const guide=(id:string,o:Partial<HubGuide>={}):HubGuide=>({id,slug:id,title:`Guide ${id}`,summary:'',cover_url:'',notion_url:'',doc_url:'',created_at:'2026-11-02T00:00:00Z',updated_at:'2026-11-02T00:00:00Z',series_id:null,series_part:null,audience:'',highlights:[],exercises:null,minutes:20,chapters:3,...o});

describe('chapter rail',()=>{
 it('lists ## headings in order, skips code fences and gives each an id and number',()=>{
  const body='Intro\n\n## The loop\ntext\n```md\n## not a heading\n```\n## Plug it in once\n### sub\n## Links and sources\n- a';
  expect(postChapters(body).map(c=>[c.n,c.id,c.title])).toEqual([['01','the-loop','The loop'],['02','plug-it-in-once','Plug it in once'],['03','links-and-sources','Links and sources']]);
  expect(postChapters('No headings here')).toEqual([]);
 });
});
describe('header lines',()=>{
 it('breadcrumb says part n of N, using the larger of planned and the part',()=>{
  expect(crumbSeries({series_id:'s1',series_part:1},[series])?.label).toBe('MCP 101 · part 1 of 5');
  expect(partOfLabel(7,series)).toBe('part 7 of 7');
  expect(crumbSeries({series_id:null,series_part:null},[series])).toBeNull();
  expect(crumbSeries({series_id:'other',series_part:1},[series])).toBeNull();
 });
 it('meta is date, read time, topic and the code when there is one',()=>{
  const a={created_at:'2026-11-11T09:00:00Z',category:'ai' as const,platform:'instagram' as const,code:'MCP101'};
  expect(postMeta(a,5)).toBe('11 Nov 2026 · 5 min read · AI · Code MCP101');
  expect(postMeta({...a,code:null,platform:'youtube'},3)).toBe('11 Nov 2026 · 3 min video · AI');
 });
 it('origin line names the platform',()=>{
  expect(originLine('instagram')).toBe('The complete content of my Instagram carousel.');
  expect(originLine('youtube')).toBe('The complete content of my YouTube video.');
 });
});
describe('next part',()=>{
 const posts=[post('p1',{series_id:'s1',series_part:1}),post('p2',{series_id:'s1',series_part:2}),post('p4',{series_id:'s1',series_part:4}),post('x',{series_id:'s2',series_part:2})];
 const guides=[guide('g3',{series_id:'s1',series_part:3})];
 it('is the next part by number, an article or a guide',()=>{
  expect(nextPart({series_id:'s1',series_part:1},posts,guides)?.id).toBe('p2');
  const n=nextPart({series_id:'s1',series_part:2},posts,guides);expect([n?.id,n?.kind,n?.part,n?.href]).toEqual(['g3','guide',3,'/guides/g3']);
 });
 it('skips a part that is not out yet and is null after the last released part',()=>{
  expect(nextPart({series_id:'s1',series_part:4},posts,guides)).toBeNull();
  expect(nextPart({series_id:'s1',series_part:2},posts.filter(p=>p.id!=='x'),[])?.id).toBe('p4');
 });
 it('is null without a series or a part number',()=>{
  expect(nextPart({series_id:null,series_part:null},posts,guides)).toBeNull();
  expect(nextPart({series_id:'s1',series_part:null},posts,guides)).toBeNull();
 });
});
describe('more like this',()=>{
 const cur={id:'cur',series_id:'s1',category:'ai' as const};
 it('puts the same series first (part order), then the same topic newest first, never the post itself or other topics',()=>{
  const all=[
   post('cur',{series_id:'s1',series_part:2,created_at:'2026-11-05T00:00:00Z'}),
   post('s-late',{series_id:'s1',series_part:3,created_at:'2026-11-06T00:00:00Z'}),
   post('s-first',{series_id:'s1',series_part:1,created_at:'2026-11-04T00:00:00Z'}),
   post('t-old',{created_at:'2026-10-01T00:00:00Z'}),
   post('t-new',{created_at:'2026-11-10T00:00:00Z'}),
   post('career',{category:'career',created_at:'2026-11-11T00:00:00Z'}),
  ];
  expect(relatedPosts(all,cur).map(p=>p.id)).toEqual(['s-first','s-late','t-new']);
  expect(relatedPosts(all,cur,5).map(p=>p.id)).toEqual(['s-first','s-late','t-new','t-old']);
 });
 it('without a series it is the same topic; with nothing similar it is empty',()=>{
  const all=[post('a'),post('b',{created_at:'2026-11-03T00:00:00Z'}),post('c',{category:'career'})];
  expect(relatedPosts(all,{id:'a',series_id:null,category:'ai'}).map(p=>p.id)).toEqual(['b']);
  expect(relatedPosts([post('a')],{id:'a',series_id:null,category:'ai'})).toEqual([]);
 });
});
describe('slide viewer stepping',()=>{
 it('wraps around both ways and tolerates an empty strip',()=>{
  expect(stepSlide(0,1,6)).toBe(1);expect(stepSlide(5,1,6)).toBe(0);expect(stepSlide(0,-1,6)).toBe(5);expect(stepSlide(0,1,0)).toBe(0);
 });
});

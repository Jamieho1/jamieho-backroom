import {beforeEach,describe,it,expect,vi} from 'vitest';
const m=vi.hoisted(()=>({viewer:vi.fn(),server:vi.fn(),previous:vi.fn(),upsert:vi.fn(),saved:vi.fn(),revalidate:vi.fn(),client:vi.fn(),select:vi.fn(),eq:vi.fn(),order:vi.fn(),single:vi.fn()}));
vi.mock('@/lib/viewer',()=>({getViewer:m.viewer}));vi.mock('@/lib/supabase/server',()=>({supabaseServer:m.server}));vi.mock('next/cache',()=>({revalidatePath:m.revalidate}));
vi.mock('@/lib/env',()=>({readSupabaseEnv:()=>({url:'https://example.supabase.co',anonKey:'public-test-placeholder'})}));vi.mock('@supabase/supabase-js',()=>({createClient:m.client}));
import {articleSchema,emptyArticle,readMinutes,wordCount,normalizeCode,ARTICLE_SELECT} from '@/lib/articles';
import {guideSchema,emptyGuide,chapterCount,GUIDE_SELECT} from '@/lib/guides';
import {seriesSchema,emptySeries,seriesHref,SERIES_SELECT} from '@/lib/content-series-data';
import {saveSeries} from '@/app/actions/content-series';
import {saveArticle} from '@/app/actions/articles';
import {saveGuide} from '@/app/actions/guides';
import {getPublicArticle} from '@/lib/articles-public';
import {getPublicGuide} from '@/lib/guides-public';
import {validateOperations,affectedRoutes,publishingSchemas} from '@/lib/content-drafts/allowlist';
import {overlayPublishing,publishingTargets} from '@/lib/content-drafts/publishing-overlay';
const id='00000000-0000-4000-8000-000000000c01',other='00000000-0000-4000-8000-000000000c02',sid='00000000-0000-4000-8000-000000000c03';
const article={...emptyArticle(),id,slug:'mcp-101',title:'MCP 101'};
const guide={...emptyGuide(),id,slug:'mcp',title:'The MCP guide'};
const series={...emptySeries(),id:sid,slug:'mcp-101',title:'MCP 101',goal:'Build your first MCP server',planned_parts:5};
const op=(table:string,action='update',fields:unknown={},key=id)=>({op:action,table,key,fields});
const bad=(r:{success:boolean})=>expect(r.success).toBe(false);
beforeEach(()=>{vi.clearAllMocks();m.viewer.mockResolvedValue({role:'owner'});m.previous.mockResolvedValue({data:{slug:'old-series'},error:null});m.saved.mockResolvedValue({data:{...series,created_at:'now',updated_at:'now'},error:null});m.upsert.mockReturnValue({select:()=>({single:m.saved})});
 m.server.mockResolvedValue({from:()=>({select:()=>({eq:()=>({maybeSingle:m.previous})}),upsert:m.upsert})});
 m.order.mockResolvedValue({data:[],error:null});m.single.mockResolvedValue({data:null,error:null});m.eq.mockReturnValue({eq:m.eq,order:m.order,maybeSingle:m.single});m.select.mockReturnValue({eq:m.eq});m.client.mockReturnValue({from:()=>({select:m.select})});});

describe('schemas',()=>{
 it('articles default to no series, no code, an empty takeaway and no slides',()=>{
  expect(articleSchema.safeParse(article).success).toBe(true);expect(emptyArticle()).toMatchObject({series_id:null,series_part:null,code:null,takeaway:'',slides:[]});
 });
 it('article codes are uppercase letters and digits up to 16 characters, or null',()=>{
  for(const code of ['MCP101','A','X'.repeat(16)])expect(articleSchema.safeParse({...article,code}).success,code).toBe(true);
  for(const code of ['mcp101','MCP 101','MCP-101','','X'.repeat(17),'ÄB1'])bad(articleSchema.safeParse({...article,code}));
  expect(normalizeCode(' mcp101 ')).toBe('MCP101');expect(normalizeCode('  ')).toBeNull();
 });
 it('takeaway allows 160 characters; slides must be at most 20 non-empty HTTPS URLs',()=>{
  expect(articleSchema.safeParse({...article,takeaway:'x'.repeat(160)}).success).toBe(true);bad(articleSchema.safeParse({...article,takeaway:'x'.repeat(161)}));
  const url=(i:number)=>`https://example.com/s${i}.png`;
  expect(articleSchema.safeParse({...article,slides:Array.from({length:20},(_,i)=>url(i))}).success).toBe(true);
  for(const slides of [Array.from({length:21},(_,i)=>url(i)),['http://example.com/a.png'],['javascript:alert(1)'],[''],['https://example.com/'+'x'.repeat(2049)]])bad(articleSchema.safeParse({...article,slides}));
 });
 it('series membership is both-or-neither and the part is 1 to 50, for articles and guides',()=>{
  for(const base of [article,guide]){const schema=base===article?articleSchema:guideSchema;
   expect(schema.safeParse({...base,series_id:sid,series_part:3}).success).toBe(true);
   bad(schema.safeParse({...base,series_id:sid,series_part:null}));bad(schema.safeParse({...base,series_id:null,series_part:3}));
   for(const part of [0,51,1.5,-1])bad(schema.safeParse({...base,series_id:sid,series_part:part}));
   bad(schema.safeParse({...base,series_id:'not-a-uuid',series_part:1}));
  }
 });
 it('guides: audience up to 200, at most three highlights of 80 characters, exercises a nullable whole number',()=>{
  expect(guideSchema.safeParse({...guide,audience:'x'.repeat(200),highlights:['a','b','c'],exercises:0}).success).toBe(true);
  bad(guideSchema.safeParse({...guide,audience:'x'.repeat(201)}));bad(guideSchema.safeParse({...guide,highlights:['a','b','c','d']}));bad(guideSchema.safeParse({...guide,highlights:['x'.repeat(81)]}));bad(guideSchema.safeParse({...guide,highlights:[' ']}));
  for(const exercises of [-1,1.5,1000,'3'])bad(guideSchema.safeParse({...guide,exercises}));
  expect(guideSchema.parse({...guide,highlights:['  trimmed  ']}).highlights).toEqual(['trimmed']);
 });
 it('series: title 80, goal 200, topic from the article categories, 1 to 50 planned parts, same slug rules',()=>{
  expect(seriesSchema.safeParse(series).success).toBe(true);
  for(const topic of ['ai','career','productivity','building'])expect(seriesSchema.safeParse({...series,topic}).success).toBe(true);
  for(const v of [{title:'x'.repeat(81)},{title:' '},{goal:'x'.repeat(201)},{topic:'other'},{planned_parts:0},{planned_parts:51},{planned_parts:2.5},{slug:'manage'},{slug:'New'},{slug:'a'.repeat(81)},{sort:1001},{published:'yes'}])bad(seriesSchema.safeParse({...series,...v}));
  expect(seriesHref('mcp-101')).toBe('/content/series/mcp-101');
 });
});

describe('computed values',()=>{
 it('read time is words / 220 rounded up, at least one minute',()=>{
  expect(readMinutes('')).toBe(1);expect(readMinutes('one two three')).toBe(1);
  const words=(n:number)=>Array.from({length:n},()=>'word').join(' ');
  expect(wordCount(words(220))).toBe(220);expect(readMinutes(words(220))).toBe(1);expect(readMinutes(words(221))).toBe(2);expect(readMinutes(words(1100))).toBe(5);
 });
 it('chapter count is the number of ## headings, ignoring code blocks, ### and # headings',()=>{
  expect(chapterCount('')).toBe(0);
  expect(chapterCount('# Title\n\n## One\ntext\n### Sub\n## Two ##\n```md\n## not a chapter\n```\n## Three')).toBe(3);
 });
});

describe('save actions',()=>{
 it('saveSeries is owner-only, validates, revalidates the hub and the old and new series URLs',async()=>{
  for(const role of ['anonymous','member']){m.viewer.mockResolvedValue({role});expect((await saveSeries(series)).ok).toBe(false);}
  m.viewer.mockResolvedValue({role:'owner'});for(const v of [{slug:'manage'},{planned_parts:51},{title:''}])expect((await saveSeries({...series,...v})).ok).toBe(false);
  expect(m.upsert).not.toHaveBeenCalled();
  expect((await saveSeries({...series,created_at:'spoof'})).ok).toBe(true);expect(m.upsert).toHaveBeenCalledWith(series,{onConflict:'id'});
  for(const p of ['/content','/content/series','/content/guides','/content/series/mcp-101','/content/series/old-series'])expect(m.revalidate).toHaveBeenCalledWith(p);
 });
 it('saveSeries reports a duplicate slug and failures without claiming success',async()=>{
  m.saved.mockResolvedValue({data:null,error:{code:'23505'}});expect(await saveSeries(series)).toMatchObject({ok:false,message:expect.stringContaining('slug')});
  m.previous.mockRejectedValue(new Error('offline'));expect((await saveSeries(series)).ok).toBe(false);
 });
 it('post and guide saves explain a taken code or part number',async()=>{
  m.saved.mockResolvedValue({data:null,error:{code:'23505',message:'duplicate key value violates unique constraint "articles_code_key"'}});
  expect(await saveArticle({...article,code:'MCP101'})).toMatchObject({ok:false,message:expect.stringContaining('code')});
  m.saved.mockResolvedValue({data:null,error:{code:'23505',message:'Part 2 of this series is already used by another article or guide.'}});
  expect(await saveArticle({...article,series_id:sid,series_part:2})).toMatchObject({ok:false,message:expect.stringContaining('part number')});
  expect(await saveGuide({...guide,series_id:sid,series_part:2})).toMatchObject({ok:false,message:expect.stringContaining('part number')});
  m.saved.mockResolvedValue({data:null,error:{code:'23505',message:'duplicate key value violates unique constraint "articles_slug_key"'}});
  expect(await saveArticle(article)).toMatchObject({ok:false,message:expect.stringContaining('slug')});
 });
 it('post and guide saves refuse a series without a part (and a part without a series) before touching the database',async()=>{
  expect((await saveArticle({...article,series_id:sid,series_part:null})).ok).toBe(false);expect((await saveGuide({...guide,series_id:null,series_part:4})).ok).toBe(false);
  expect(m.upsert).not.toHaveBeenCalled();
 });
 it('post saves refresh the Content hub pages',async()=>{
  m.server.mockResolvedValue({from:()=>({select:()=>({eq:()=>({maybeSingle:m.previous})}),upsert:m.upsert})});m.saved.mockResolvedValue({data:{...article,created_at:'now',updated_at:'now'},error:null});
  expect((await saveArticle(article)).ok).toBe(true);for(const p of ['/content','/content/series'])expect(m.revalidate).toHaveBeenCalledWith(p);
 });
});

describe('public reads (the migration is applied live)',()=>{
 it('detail reads select every column, including the series, code, takeaway and slide fields',async()=>{
  m.single.mockResolvedValue({data:{id,slug:'x',title:'X',body:'b',series_id:sid,series_part:2,code:'MCP101',takeaway:'T',slides:['https://example.com/1.png']},error:null});
  expect(await getPublicArticle('x')).toMatchObject({series_id:sid,series_part:2,code:'MCP101',takeaway:'T',slides:['https://example.com/1.png']});expect(m.select).toHaveBeenCalledWith(ARTICLE_SELECT);
  m.single.mockResolvedValue({data:{id,slug:'x',title:'X',body:'b',audience:'Engineers',highlights:['Setup'],exercises:3},error:null});
  expect(await getPublicGuide('x')).toMatchObject({audience:'Engineers',highlights:['Setup'],exercises:3});expect(m.select).toHaveBeenCalledWith(GUIDE_SELECT);
 });
 it('the owner editors and public pages read every new column',()=>{
  for(const c of ['series_id','series_part','code','takeaway','slides'])expect(ARTICLE_SELECT.split(',')).toContain(c);
  for(const c of ['series_id','series_part','audience','highlights','exercises'])expect(GUIDE_SELECT.split(',')).toContain(c);
  expect(SERIES_SELECT.split(',')).toEqual(['id','slug','title','goal','topic','planned_parts','sort','published','created_at','updated_at']);
 });
});

describe('Content Drafts',()=>{
 const parse=(input:unknown)=>{const r=validateOperations(input);if(!r.ok)throw Error(r.message);return r.operations;};
 it('accepts the new article, guide and series fields',()=>{
  expect(validateOperations([op('articles','update',{series_id:sid,series_part:2,code:'MCP101',takeaway:'Wire up a tool',slides:['https://example.com/1.png']})]).ok).toBe(true);
  expect(validateOperations([op('articles','update',{series_id:null,series_part:null,code:null})]).ok).toBe(true);
  expect(validateOperations([op('guides','update',{series_id:sid,series_part:1,audience:'Engineers new to MCP',highlights:['Setup','Tools'],exercises:6})]).ok).toBe(true);
  expect(validateOperations([op('content_series','insert',{slug:'mcp-101',title:'MCP 101',goal:'Ship a server',topic:'ai',planned_parts:5,sort:10,published:false})]).ok).toBe(true);
 });
 it('rejects invalid new fields and unknown series fields',()=>{
  for(const f of [{code:'mcp101'},{code:''},{takeaway:'x'.repeat(161)},{slides:['http://example.com/1.png']},{slides:Array(21).fill('https://example.com/1.png')},{series_part:51},{series_id:'x'}])expect(validateOperations([op('articles','update',f)]).ok,JSON.stringify(f)).toBe(false);
  for(const f of [{audience:'x'.repeat(201)},{highlights:['a','b','c','d']},{highlights:['x'.repeat(81)]},{exercises:-1},{exercises:1.5}])expect(validateOperations([op('guides','update',f)]).ok,JSON.stringify(f)).toBe(false);
  for(const f of [{title:'x'.repeat(81)},{goal:'x'.repeat(201)},{topic:'x'},{planned_parts:0},{planned_parts:51},{sort:1001},{slug:'manage'},{created_at:'now'},{id:other},{published:'true'}])expect(validateOperations([op('content_series','update',f)]).ok,JSON.stringify(f)).toBe(false);
  expect(validateOperations([op('content_series','insert',{slug:'x'})]).ok).toBe(false);expect(validateOperations([op('content_series','delete',{title:'x'})]).ok).toBe(false);
 });
 it('overlay checks merged rows: series pair, series defaults, duplicate codes and slugs',()=>{
  const live=[{...article,created_at:'2025-01-01',updated_at:'2025-01-01',code:'AAA1'}];
  expect(()=>overlayPublishing('articles',live as never,parse([op('articles','update',{series_id:sid})]))).toThrow(/series/i);
  const ok=overlayPublishing('articles',live as never,parse([op('articles','update',{series_id:sid,series_part:2,takeaway:'Learn it'})]));expect(ok[0]).toMatchObject({series_id:sid,series_part:2,takeaway:'Learn it',draftChanged:true});
  expect(()=>overlayPublishing('articles',live as never,parse([op('articles','insert',{slug:'second',title:'Second',code:'AAA1'},other)]))).toThrow(/code/);
  const made=overlayPublishing('content_series',[],parse([op('content_series','insert',{slug:'mcp-101',title:'MCP 101'},other)]));expect(made[0]).toMatchObject({id:other,topic:'ai',planned_parts:1,published:false,goal:'',sort:100});
  const seriesLive=[{...series,created_at:'2025-01-01',updated_at:'2025-01-01',published:true}];
  expect(overlayPublishing('content_series',seriesLive,parse([op('content_series','delete',{},sid)]))[0]).toMatchObject({published:false,slug:'mcp-101',draftChanged:true});
  expect(()=>overlayPublishing('content_series',seriesLive,parse([op('content_series','insert',{slug:'mcp-101',title:'Again'},other)]))).toThrow(/slug is already/);
  expect(()=>overlayPublishing('content_series',seriesLive,parse([op('content_series','update',{planned_parts:99},sid)]))).toThrow();
  expect(publishingSchemas.content_series.safeParse(series).success).toBe(true);
 });
 it('previews revalidate /content, /content/series, the series page and /content/guides',()=>{
  const routes=affectedRoutes(parse([op('content_series','update',{slug:'new-series'})]),[{table:'content_series',key:id,values:{slug:'old-series'}}]);
  for(const r of ['/content','/content/series','/content/guides','/content/series/new-series','/content/series/old-series'])expect(routes).toContain(r);
  expect(routes.some(r=>r.startsWith('/content_series'))).toBe(false);
  for(const table of ['articles','guides'])for(const r of ['/content','/content/series','/content/guides'])expect(affectedRoutes(parse([op(table,'update',{series_part:null,series_id:null})]))).toContain(r);
  expect(publishingTargets(parse([op('content_series','update',{goal:'x'})]))).toEqual([{href:'/content/series',label:'Preview Series'}]);
  expect(publishingTargets(parse([op('articles','update',{title:'x'}),op('guides','update',{title:'y'},other)])).map(t=>t.href)).toEqual(['/content','/content/guides']);
 });
});

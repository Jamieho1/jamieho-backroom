import {describe,it,expect} from 'vitest';
import {seriesParts,seriesSlots,seriesProgress,cardRows,partKind,seriesViews} from '@/lib/content-series-view';
import {buildSearchIndex,type HubGuide,type HubPost,type HubSeries} from '@/lib/content-hub';
const sid='s1',other='s2';
const series:HubSeries={id:sid,slug:'mcp-101',title:'MCP 101',goal:'Ship a server',topic:'ai',planned_parts:6,sort:1};
const post=(id:string,part:number|null,at:string,over:Partial<HubPost>={}):HubPost=>({id,slug:id,title:`Post ${id}`,summary:'sum '+id,platform:'instagram',category:'ai',cover_url:'',firstSlide:'',created_at:at,series_id:sid,series_part:part,code:null,takeaway:'',minutes:5,...over});
const guide=(id:string,part:number|null,at:string,over:Partial<HubGuide>={}):HubGuide=>({id,slug:id,title:`Guide ${id}`,summary:'',cover_url:'',notion_url:'',doc_url:'',created_at:at,updated_at:at,series_id:sid,series_part:part,audience:'',highlights:[],exercises:null,minutes:25,chapters:5,...over});
const posts=[post('p3',3,'2026-11-24T00:00:00Z',{platform:'youtube',takeaway:'Learn X'}),post('p1',1,'2026-11-11T00:00:00Z'),post('x',1,'2026-11-01T00:00:00Z',{series_id:other}),post('free',null,'2026-11-02T00:00:00Z',{series_id:null})];
const guides=[guide('g2',2,'2026-11-12T00:00:00Z')];
describe('part ordering across posts and guides',()=>{
 it('orders by part number regardless of kind or publish date and ignores other series',()=>{
  const parts=seriesParts(series,posts,guides);
  expect(parts.map(p=>[p.part,p.id,p.kind])).toEqual([[1,'p1','post'],[2,'g2','guide'],[3,'p3','post']]);
  expect(parts[0].href).toBe('/articles/p1');expect(parts[1].href).toBe('/guides/g2');
 });
 it('uses the takeaway, else the summary, as the blurb',()=>{const p=seriesParts(series,posts,guides);expect(p[2].blurb).toBe('Learn X');expect(p[0].blurb).toBe('sum p1');});
 it('puts an unnumbered part after the numbered ones, numbered after the highest',()=>{
  const parts=seriesParts(series,[post('n',null,'2026-11-30T00:00:00Z'),post('p5',5,'2026-11-01T00:00:00Z')],[]);
  expect(parts.map(p=>[p.part,p.id])).toEqual([[5,'p5'],[6,'n']]);
 });
 it('labels the kind',()=>{const p=seriesParts(series,posts,guides);expect(p.map(partKind)).toEqual(['Instagram','Free guide','YouTube']);});
});
describe('coming slots',()=>{
 const parts=seriesParts(series,posts,guides);
 it('fills the gaps up to the planned count with coming slots (no invented titles)',()=>{
  const slots=seriesSlots(parts,6);
  expect(slots.map(s=>[s.n,s.part?.id??null])).toEqual([[1,'p1'],[2,'g2'],[3,'p3'],[4,null],[5,null],[6,null]]);
 });
 it('a gap in the middle is a coming slot',()=>{expect(seriesSlots(parts.filter(p=>p.part!==2),3).map(s=>s.part?.id??null)).toEqual(['p1',null,'p3']);});
 it('never drops a published part beyond the planned count',()=>{expect(seriesSlots(parts,2).map(s=>s.n)).toEqual([1,2,3]);});
 it('no parts yet gives only coming slots',()=>{expect(seriesSlots([],2).every(s=>s.part===null)).toBe(true);});
});
describe('next-part logic and progress',()=>{
 const slots=seriesSlots(seriesParts(series,posts,guides),6);
 it('starts at part 1 when nothing is read',()=>{
  const p=seriesProgress(slots,new Set());
  expect(p).toMatchObject({planned:6,out:3,read:0,minutes:35,percent:0,label:'Start'});expect(p.next?.id).toBe('p1');expect(p.target?.id).toBe('p1');
 });
 it('continues at the first unread released part',()=>{
  const p=seriesProgress(slots,new Set(['p1']));expect(p).toMatchObject({read:1,percent:17,label:'Continue'});expect(p.next?.id).toBe('g2');expect(p.target?.id).toBe('g2');
 });
 it('skips to an earlier unread part even if a later one was read',()=>{expect(seriesProgress(slots,new Set(['g2'])).next?.id).toBe('p1');});
 it('everything out is read: Read again from part 1, never a coming slot',()=>{
  const p=seriesProgress(slots,new Set(['p1','g2','p3']));expect(p).toMatchObject({read:3,label:'Read again',next:null});expect(p.target?.id).toBe('p1');
 });
 it('ignores ids that are not parts of this series',()=>{expect(seriesProgress(slots,new Set(['zzz'])).read).toBe(0);});
 it('a series with nothing out has no target',()=>{expect(seriesProgress(seriesSlots([],3),new Set()).target).toBeNull();});
});
describe('series card rows',()=>{
 const slots=seriesSlots(seriesParts(series,posts,guides),6);
 it('shows four rows: read, Next, open and Soon, with "+ N more"',()=>{
  const {rows,more}=cardRows(slots,new Set(['p1']));
  expect(rows.map(r=>r.state)).toEqual(['done','next','open','soon']);expect(more).toBe(2);expect(rows[3]).toMatchObject({n:4,title:'Part 4',href:''});
 });
 it('no "more" for a short series',()=>{expect(cardRows(slots.slice(0,3),new Set()).more).toBe(0);});
 it('Next is on the first unread part',()=>{expect(cardRows(slots,new Set()).rows[0].state).toBe('next');});
});
describe('views and search',()=>{
 it('builds a card view with the topic label and href',()=>{
  const v=seriesViews([series],posts,guides)[0];expect(v).toMatchObject({slug:'mcp-101',href:'/content/series/mcp-101',topicLabel:'AI',category:'ai'});expect(v.slots).toHaveLength(6);
 });
 it('series search results open the series page',()=>{
  const hit=buildSearchIndex({posts:[],guides:[],series:[series]})[0];expect(hit).toMatchObject({kind:'series',href:'/content/series/mcp-101'});
 });
});

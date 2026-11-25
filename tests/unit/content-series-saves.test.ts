import {beforeEach,describe,it,expect,vi} from 'vitest';
const m=vi.hoisted(()=>({viewer:vi.fn(),server:vi.fn(),previous:vi.fn(),upsert:vi.fn(),saved:vi.fn(),revalidate:vi.fn(),inSlugs:vi.fn()}));
vi.mock('@/lib/viewer',()=>({getViewer:m.viewer}));vi.mock('@/lib/supabase/server',()=>({supabaseServer:m.server}));vi.mock('next/cache',()=>({revalidatePath:m.revalidate}));
import {emptyArticle} from '@/lib/articles';
import {emptyGuide} from '@/lib/guides';
import {saveArticle} from '@/app/actions/articles';
import {saveGuide} from '@/app/actions/guides';
import {publishingTargets} from '@/lib/content-drafts/publishing-overlay';
import {validateOperations} from '@/lib/content-drafts/allowlist';
const id='00000000-0000-4000-8000-000000000d01',oldS='00000000-0000-4000-8000-000000000d02',newS='00000000-0000-4000-8000-000000000d03';
const paths=()=>m.revalidate.mock.calls.map(([p])=>p);
function setup(table:'articles'|'guides'){
 const row=table==='articles'?{...emptyArticle(),id,slug:'a-post',title:'A',series_id:newS,series_part:2}:{...emptyGuide(),id,slug:'a-guide',title:'G',series_id:newS,series_part:2};
 m.viewer.mockResolvedValue({role:'owner'});m.previous.mockResolvedValue({data:{slug:row.slug,series_id:oldS},error:null});m.saved.mockResolvedValue({data:row,error:null});m.upsert.mockReturnValue({select:()=>({single:m.saved})});
 m.inSlugs.mockResolvedValue({data:[{slug:'new-series'},{slug:'old-series'}],error:null});
 m.server.mockResolvedValue({from:(t:string)=>t==='content_series'?{select:()=>({in:m.inSlugs})}:{select:()=>({eq:()=>({maybeSingle:m.previous})}),upsert:m.upsert}});
 return row;
}
beforeEach(()=>vi.clearAllMocks());
describe('saving a post or guide revalidates its series pages',()=>{
 it('article: the new and the previous series page',async()=>{const row=setup('articles');const r=await saveArticle(row);expect(r.ok).toBe(true);
  expect(m.inSlugs).toHaveBeenCalledWith('id',[newS,oldS]);expect(paths()).toEqual(expect.arrayContaining(['/content/series/new-series','/content/series/old-series']));});
 it('guide: the new and the previous series page',async()=>{const row=setup('guides');const r=await saveGuide(row);expect(r.ok).toBe(true);
  expect(paths()).toEqual(expect.arrayContaining(['/content/series/new-series','/content/series/old-series']));});
 it('no series involved: no lookup',async()=>{const row=setup('articles');m.previous.mockResolvedValue({data:{slug:row.slug,series_id:null},error:null});m.saved.mockResolvedValue({data:{...row,series_id:null,series_part:null},error:null});
  await saveArticle({...row,series_id:null,series_part:null});expect(m.inSlugs).not.toHaveBeenCalled();});
 it('a failed slug lookup never fails the save',async()=>{const row=setup('articles');m.inSlugs.mockRejectedValue(new Error('down'));expect((await saveArticle(row)).ok).toBe(true);});
});
describe('Content Drafts preview targets',()=>{
 const ops=(fields:object)=>{const v=validateOperations([{op:'update',table:'content_series',key:id,fields}]);if(!v.ok)throw new Error(v.message);return v.operations;};
 it('a series draft previews the Series tab and, when it names its slug, the series page',()=>{
  expect(publishingTargets(ops({slug:'mcp-101',title:'MCP 101'}))).toEqual([{href:'/content/series',label:'Preview Series'},{href:'/content/series/mcp-101',label:'Preview series page'}]);
  expect(publishingTargets(ops({title:'MCP 101'}))).toEqual([{href:'/content/series',label:'Preview Series'}]);
 });
});

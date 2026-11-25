import { beforeEach, it, expect, vi } from 'vitest';
const m=vi.hoisted(()=>({viewer:vi.fn(),server:vi.fn(),from:vi.fn(),order:vi.fn(),live:vi.fn(),notFound:vi.fn()}));
vi.mock('@/lib/viewer',()=>({getViewer:m.viewer}));vi.mock('@/lib/supabase/server',()=>({supabaseServer:m.server}));
vi.mock('next/navigation',()=>({notFound:m.notFound}));
import {loadContentReview} from '@/lib/content-drafts/review';
beforeEach(()=>{vi.resetAllMocks();m.notFound.mockImplementation(()=>{throw Error('404')});m.viewer.mockResolvedValue({role:'owner',id:'owner'});m.server.mockResolvedValue({from:m.from});
 m.from.mockImplementation((table:string)=>({select:()=>table!=='content_changes'?m.live():({eq:()=>({eq:()=>({order:m.order})})})}));
 m.live.mockResolvedValue({data:[{key:'hero',title:'Current live title',body:'Current body'}],error:null});
 m.order.mockResolvedValue({data:[{id:'draft',summary:'Proposed edit',status:'draft',operations:[{op:'update',table:'site_sections',key:'hero',fields:{title:'Proposed title'}}],photo_slots:[],created_at:'2026-11-14'}],error:null});
});
it('returns 404 for anonymous and non-owner sessions before reading drafts',async()=>{
 for(const role of ['anonymous','member']){m.viewer.mockResolvedValue({role,id:'member'});await expect(loadContentReview()).rejects.toThrow('404');}
 expect(m.from).not.toHaveBeenCalled();
});
it('loads newest-first pending sets and compares proposals to current database rows',async()=>{
 const result=await loadContentReview();expect(m.order).toHaveBeenCalledWith('created_at',{ascending:false});
 expect(result.drafts[0].fields).toEqual([{field:'site_sections.hero.title',current:'Current live title',proposed:'Proposed title'}]);
});
it('invalid sets remain reviewable/discardable with an explanation; read failures are explicit',async()=>{
 m.order.mockResolvedValueOnce({data:[{id:'bad',operations:[{table:'profiles'}],photo_slots:[]}],error:null});
 expect((await loadContentReview()).drafts[0].validationError).toContain('Invalid draft');
 m.live.mockResolvedValueOnce({data:null,error:{message:'offline'}});expect(await loadContentReview()).toMatchObject({drafts:[],error:expect.stringContaining('Could not load')});
});
it('shows the current series row next to a content_series proposal, with no preview link until the series pages exist',async()=>{
 const sid='00000000-0000-4000-8000-000000000f01';
 m.from.mockImplementation((table:string)=>({select:()=>table==='content_changes'?{eq:()=>({eq:()=>({order:m.order})})}:table==='content_series'?Promise.resolve({data:[{id:sid,goal:'Old goal'}],error:null}):m.live()}));
 m.order.mockResolvedValue({data:[{id:'series-draft',summary:'Series goal',status:'draft',operations:[{op:'update',table:'content_series',key:sid,fields:{goal:'New goal'}}],photo_slots:[],created_at:'2026-11-25'}],error:null});
 const [draft]=(await loadContentReview()).drafts;
 expect(draft.fields).toEqual([{field:`content_series.${sid}.goal`,current:'Old goal',proposed:'New goal'}]);expect(draft.previewTargets).toEqual([{href:'/content/series',label:'Preview Series'}]);
});

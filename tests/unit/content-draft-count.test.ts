import {beforeEach,it,expect,vi} from 'vitest';
const m=vi.hoisted(()=>({viewer:vi.fn(),server:vi.fn(),from:vi.fn(),select:vi.fn(),eq:vi.fn()}));
vi.mock('@/lib/viewer',()=>({getViewer:m.viewer}));vi.mock('@/lib/supabase/server',()=>({supabaseServer:m.server}));
import {getContentDraftCount} from '@/app/actions/content-draft-count';
beforeEach(()=>{vi.resetAllMocks();m.viewer.mockResolvedValue({role:'owner',id:'owner'});m.server.mockResolvedValue({from:m.from});m.from.mockReturnValue({select:m.select});m.select.mockReturnValue({eq:m.eq});m.eq.mockResolvedValue({count:2,error:null});});
it('visitors and non-owners cannot query the count',async()=>{
 for(const role of ['anonymous','member']){m.viewer.mockResolvedValue({role,id:'other'});expect(await getContentDraftCount()).toBeNull();}
 expect(m.server).not.toHaveBeenCalled();expect(m.from).not.toHaveBeenCalled();
});
it('owner gets an exact draft-only count without loading rows',async()=>{
 expect(await getContentDraftCount()).toBe(2);expect(m.from).toHaveBeenCalledWith('content_changes');expect(m.select).toHaveBeenCalledWith('id',{count:'exact',head:true});expect(m.eq).toHaveBeenCalledWith('status','draft');
 m.eq.mockResolvedValueOnce({count:0,error:null});expect(await getContentDraftCount()).toBe(0);
});
it('missing identity, query failure and unexpected counts fail closed',async()=>{
 m.viewer.mockResolvedValueOnce({role:'owner'});expect(await getContentDraftCount()).toBeNull();expect(m.from).not.toHaveBeenCalled();
 for(const value of [{count:null,error:null},{count:2,error:{message:'denied'}},{count:-1,error:null}]){m.eq.mockResolvedValueOnce(value);expect(await getContentDraftCount()).toBeNull();}
 m.eq.mockRejectedValueOnce(Error('offline'));expect(await getContentDraftCount()).toBeNull();
});

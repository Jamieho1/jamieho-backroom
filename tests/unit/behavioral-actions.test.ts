import { beforeEach,it,expect,vi } from 'vitest';
const m=vi.hoisted(()=>({viewer:vi.fn(),server:vi.fn(),upsert:vi.fn(),single:vi.fn(),revalidate:vi.fn()}));
vi.mock('@/lib/viewer',()=>({getViewer:m.viewer}));vi.mock('@/lib/supabase/server',()=>({supabaseServer:m.server}));vi.mock('next/cache',()=>({revalidatePath:m.revalidate}));
import { saveStory } from '@/app/actions/behavioral';
const story={id:'00000000-0000-4000-8000-000000000001',bullet_id:null,title:'Example',situation:'',task:'',action:'',result:'',skills:'',numbers:''};
beforeEach(()=>{vi.clearAllMocks();m.viewer.mockResolvedValue({role:'owner'});m.upsert.mockReturnValue({select:()=>({single:m.single})});m.server.mockResolvedValue({from:()=>({upsert:m.upsert})});m.single.mockResolvedValue({data:{...story,updated_at:'now'},error:null});});
it('denies member/anonymous writes before using the database',async()=>{for(const role of ['member','anonymous']){m.viewer.mockResolvedValue({role});expect((await saveStory(story)).ok).toBe(false);}expect(m.upsert).not.toHaveBeenCalled();});
it('upserts the validated fields only, using stable ID for retries',async()=>{
 expect((await saveStory({...story,updated_at:'spoof',extra:'ignored'})).ok).toBe(true);expect(m.upsert).toHaveBeenCalledWith(story,{onConflict:'id'});expect(m.revalidate).toHaveBeenCalledWith('/desktop');
});
it('rejects missing title, invalid IDs, and oversized fields before writing',async()=>{
 for(const value of [null,{...story,title:' '},{...story,id:'bad'},{...story,bullet_id:'bad'},{...story,action:'x'.repeat(20001)}])expect((await saveStory(value)).ok).toBe(false);expect(m.upsert).not.toHaveBeenCalled();
});
it('returns retryable failure for RLS, invalid links or connection failures',async()=>{
 for(const result of [{data:null,error:null},{data:null,error:{message:'foreign key'}}]){m.single.mockResolvedValue(result);expect((await saveStory(story)).ok).toBe(false);}
 m.single.mockRejectedValue(new Error('offline'));expect((await saveStory(story)).ok).toBe(false);
});

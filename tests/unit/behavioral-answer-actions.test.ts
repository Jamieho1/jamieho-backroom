import { beforeEach,it,expect,vi } from 'vitest';
const m=vi.hoisted(()=>({viewer:vi.fn(),server:vi.fn(),upsert:vi.fn(),single:vi.fn(),revalidate:vi.fn()}));
vi.mock('@/lib/viewer',()=>({getViewer:m.viewer}));vi.mock('@/lib/supabase/server',()=>({supabaseServer:m.server}));vi.mock('next/cache',()=>({revalidatePath:m.revalidate}));
import { saveAnswer } from '@/app/actions/behavioral';
import { emptyAnswer } from '@/lib/behavioral/answers';
const answer=emptyAnswer('g-disagree');
beforeEach(()=>{vi.clearAllMocks();m.viewer.mockResolvedValue({role:'owner'});m.upsert.mockReturnValue({select:()=>({single:m.single})});m.server.mockResolvedValue({from:()=>({upsert:m.upsert})});m.single.mockResolvedValue({data:{...answer,updated_at:'now'},error:null});});
it('refuses member and anonymous saves without writing',async()=>{for(const role of ['member','anonymous']){m.viewer.mockResolvedValue({role});expect((await saveAnswer(answer)).ok).toBe(false);}expect(m.upsert).not.toHaveBeenCalled();});
it('upserts only validated fields using question ID, allowing mappings to be cleared',async()=>{
 expect((await saveAnswer({...answer,extra:'ignored',updated_at:'spoof'})).ok).toBe(true);expect(m.upsert).toHaveBeenCalledWith(answer,{onConflict:'question_id'});expect(m.revalidate).toHaveBeenCalledWith('/desktop');
});
it('rejects bad questions and duplicate mappings before writing',async()=>{
 for(const a of [null,{...answer,question_id:'unknown'},{...answer,primary_story_id:'00000000-0000-4000-8000-000000000001',secondary_story_id:'00000000-0000-4000-8000-000000000001'}])expect((await saveAnswer(a)).ok).toBe(false);expect(m.upsert).not.toHaveBeenCalled();
});
it('returns a retryable failure for missing/deleted stories, denied writes and network errors',async()=>{
 for(const result of [{data:null,error:null},{data:null,error:{message:'foreign key'}}]){m.single.mockResolvedValue(result);expect((await saveAnswer(answer)).ok).toBe(false);}
 m.single.mockRejectedValue(new Error('offline'));expect((await saveAnswer(answer)).ok).toBe(false);
});

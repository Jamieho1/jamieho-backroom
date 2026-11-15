import {beforeEach,it,expect,vi} from 'vitest';
const m=vi.hoisted(()=>({viewer:vi.fn(),server:vi.fn(),from:vi.fn(),order:vi.fn(),upsert:vi.fn(),del:vi.fn(),saved:vi.fn()}));
vi.mock('@/lib/viewer',()=>({getViewer:m.viewer}));vi.mock('@/lib/supabase/server',()=>({supabaseServer:m.server}));
import {loadPracticeStars,savePracticeStar} from '@/app/actions/practice-stars';
beforeEach(()=>{vi.clearAllMocks();m.viewer.mockResolvedValue({role:'owner',id:'owner-id'});m.order.mockResolvedValue({data:[{problem:217}],error:null});m.saved.mockResolvedValue({data:[{problem:217}],error:null});m.upsert.mockReturnValue({select:m.saved});const q={eq:()=>q,select:m.saved};m.del.mockReturnValue(q);const read={eq:()=>read,order:m.order};m.from.mockReturnValue({select:()=>read,upsert:m.upsert,delete:m.del});m.server.mockResolvedValue({from:m.from});});
it('visitors cannot read or change flags',async()=>{for(const role of ['anonymous']){m.viewer.mockResolvedValue({role});expect((await loadPracticeStars()).ok).toBe(false);expect((await savePracticeStar(217,true)).ok).toBe(false);}expect(m.from).not.toHaveBeenCalled();});
it('reads saved stars and filters unknown catalog IDs',async()=>{m.order.mockResolvedValue({data:[{problem:217},{problem:9999}],error:null});expect(await loadPracticeStars()).toEqual({ok:true,problems:[217]});});
it('uses problem-keyed upsert to star and delete to unstar; both can be retried',async()=>{
 expect(await savePracticeStar(217,true)).toEqual({ok:true});expect(m.upsert).toHaveBeenCalledWith({user_id:'owner-id',problem:217},{onConflict:'user_id,problem'});expect(await savePracticeStar(217,false)).toEqual({ok:true});expect(m.del).toHaveBeenCalledTimes(1);
 m.saved.mockResolvedValue({data:[],error:null});expect(await savePracticeStar(217,false)).toEqual({ok:true});expect((await savePracticeStar(217,true)).ok).toBe(false);
});
it('rejects invalid requests and reports network/database failures',async()=>{
 expect((await savePracticeStar(9999,true)).ok).toBe(false);expect((await savePracticeStar(217,'true' as unknown as boolean)).ok).toBe(false);expect(m.from).not.toHaveBeenCalled();m.order.mockRejectedValue(new Error('offline'));expect((await loadPracticeStars()).ok).toBe(false);m.saved.mockResolvedValue({data:null,error:{message:'denied'}});expect((await savePracticeStar(217,true)).ok).toBe(false);
});

it('a member flags their own question with a server-derived user ID',async()=>{m.viewer.mockResolvedValue({role:'member',id:'member-id'});expect((await savePracticeStar(217,true)).ok).toBe(true);expect(m.upsert).toHaveBeenCalledWith({user_id:'member-id',problem:217},{onConflict:'user_id,problem'});});

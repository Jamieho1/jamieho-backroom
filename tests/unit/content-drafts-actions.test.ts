import { beforeEach, it, expect, vi } from "vitest";
const mocks = vi.hoisted(() => ({ viewer:vi.fn(),server:vi.fn(),from:vi.fn(),update:vi.fn(),select:vi.fn(),single:vi.fn(),saveSelect:vi.fn(),revalidate:vi.fn() }));
vi.mock('@/lib/viewer',()=>({getViewer:mocks.viewer}));
vi.mock('@/lib/supabase/server',()=>({supabaseServer:mocks.server}));
vi.mock('next/cache',()=>({revalidatePath:mocks.revalidate}));
import { approveContentChange, discardContentChange } from '@/app/actions/content-drafts';
const id='00000000-0000-4000-8000-0000000000e1';
const owner={role:'owner',id:'00000000-0000-4000-8000-0000000000e2'};
const operations=[{op:'update',table:'site_sections',key:'hero',fields:{title:'Proposed'}}];
const set={id,status:'draft',operations,photo_slots:[],summary:'Draft',created_at:'2026-11-14'};
let saved: {eq:ReturnType<typeof vi.fn>;filter:ReturnType<typeof vi.fn>;select:typeof mocks.saveSelect};
beforeEach(()=>{
 vi.resetAllMocks(); mocks.viewer.mockResolvedValue(owner); mocks.server.mockResolvedValue({from:mocks.from});
 const loaded={eq:vi.fn().mockReturnThis(),maybeSingle:mocks.single};
 saved={eq:vi.fn().mockReturnThis(),filter:vi.fn().mockReturnThis(),select:mocks.saveSelect};
 mocks.from.mockReturnValue({select:mocks.select,update:mocks.update}); mocks.select.mockReturnValue(loaded); mocks.single.mockResolvedValue({data:set,error:null});
 mocks.update.mockReturnValue(saved);mocks.saveSelect.mockResolvedValue({data:[{id}],error:null});
});
it('refuses visitors, non-owners and invalid ids without reading or changing content',async()=>{
 for(const role of ['anonymous','member']) {mocks.viewer.mockResolvedValue({role});expect((await approveContentChange(id)).ok).toBe(false);expect((await discardContentChange(id)).ok).toBe(false);}
 expect((await approveContentChange('invalid')).ok).toBe(false);expect(mocks.from).not.toHaveBeenCalled();expect(mocks.revalidate).not.toHaveBeenCalled();
});
it('approves via exactly one owner-authenticated status update and revalidates affected routes',async()=>{
 expect(await approveContentChange(id)).toMatchObject({ok:true,applied:true});
 expect(mocks.viewer).toHaveBeenCalledTimes(2);expect(mocks.update).toHaveBeenCalledExactlyOnceWith({status:'approved'});
 expect(saved.filter).toHaveBeenCalledWith('operations','eq',JSON.stringify(operations));
 expect(saved.eq).toHaveBeenCalledWith('status','draft');expect(saved.eq).toHaveBeenCalledWith('id',id);
 expect(mocks.revalidate.mock.calls.map(([path])=>path)).toEqual(['/','/journey','/about','/manage/review']);
});
it('session ownership is checked again just before mutation',async()=>{
 mocks.viewer.mockResolvedValueOnce(owner).mockResolvedValueOnce({role:'member',id:owner.id});
 expect((await approveContentChange(id)).ok).toBe(false);expect(mocks.update).not.toHaveBeenCalled();
});
it('invalid table, field and long value fail before the transaction is requested',async()=>{
 for(const bad of [{...operations[0],table:'profiles'},{...operations[0],fields:{role:'owner'}},{...operations[0],fields:{title:'x'.repeat(121)}}]) {
 mocks.single.mockResolvedValue({data:{...set,operations:[bad]},error:null});const r=await approveContentChange(id);expect(r.ok).toBe(false);expect(r.message).toContain('Invalid draft');}
 expect(mocks.update).not.toHaveBeenCalled();
});
it('missing/finished drafts and unsupported photos cannot be approved',async()=>{
 for(const data of [null,{...set,status:'approved'},{...set,photo_slots:[{}]}]){mocks.single.mockResolvedValue({data,error:null});expect((await approveContentChange(id)).ok).toBe(false);}
 expect(mocks.update).not.toHaveBeenCalled();
});
it('SQL validation failure is clear and never revalidates; stale updates return a reload message',async()=>{
 mocks.saveSelect.mockResolvedValueOnce({data:null,error:{code:'22023',message:'Section hero no longer exists.'}});
 expect(await approveContentChange(id)).toEqual({ok:false,message:'Section hero no longer exists.'});expect(mocks.revalidate).not.toHaveBeenCalled();
 mocks.saveSelect.mockResolvedValueOnce({data:[],error:null});expect((await approveContentChange(id)).message).toMatch(/Reload/);
});
it('distinguishes a committed approval from a cache refresh failure',async()=>{
 mocks.revalidate.mockImplementation(()=>{throw Error('cache down')});expect(await approveContentChange(id)).toMatchObject({ok:true,applied:true,message:expect.stringContaining('page refresh failed')});
});
it('discards even an invalid proposal with a status-only write and no public-route revalidation',async()=>{
 expect(await discardContentChange(id)).toMatchObject({ok:true,message:expect.stringContaining('not changed')});
 expect(mocks.select).not.toHaveBeenCalled();expect(mocks.update).toHaveBeenCalledExactlyOnceWith({status:'discarded'});
 expect(mocks.revalidate).toHaveBeenCalledExactlyOnceWith('/manage/review');
});
it('handles load and connection failures without claiming success',async()=>{
 mocks.single.mockResolvedValueOnce({data:null,error:{message:'offline'}});expect((await approveContentChange(id)).ok).toBe(false);
 mocks.server.mockRejectedValueOnce(Error('offline'));expect((await discardContentChange(id)).ok).toBe(false);expect(mocks.update).not.toHaveBeenCalled();
});

it('experience approval refreshes every CV consumer through the same atomic status action',async()=>{
 mocks.single.mockResolvedValue({data:{...set,operations:[{op:'update',table:'experience_items',key:id,fields:{title:'Draft role'}}]},error:null});
 expect((await approveContentChange(id)).ok).toBe(true);expect(mocks.update).toHaveBeenCalledExactlyOnceWith({status:'approved'});
 expect(mocks.revalidate.mock.calls.map(([path])=>path)).toEqual(['/','/journey','/about','/behavioral','/manage/review']);
});
it('publishing approval refreshes both slugs from committed audit history',async()=>{
 const key='00000000-0000-4000-8000-000000000601';const publishingOps=[{table:'projects',op:'update',key,fields:{slug:'new-project'}}];
 const project={id:key,slug:'old-project',name:'Example',tagline:'',body:'',tags:[],screenshots:[],url:'',featured:true,public:true,sort:1,created_at:'2025-01-01'};
 const normal=mocks.from.getMockImplementation()!;mocks.from.mockImplementation((table:string)=>table==='projects'?{select:async()=>({data:[project],error:null})}:normal(table));
 mocks.single.mockResolvedValue({data:{...set,operations:publishingOps},error:null});mocks.saveSelect.mockResolvedValue({data:[{id,previous:[{table:'projects',key,values:project}]}],error:null});
 expect((await approveContentChange(id)).ok).toBe(true);expect(mocks.update).toHaveBeenCalledExactlyOnceWith({status:'approved'});
 expect(mocks.revalidate.mock.calls.map(([path])=>path)).toEqual(expect.arrayContaining(['/projects','/projects/old-project','/projects/new-project','/','/manage/review']));
});
it('publishing row validation errors happen before the approval transaction',async()=>{
 const key='00000000-0000-4000-8000-000000000601';const normal=mocks.from.getMockImplementation()!;mocks.from.mockImplementation((table:string)=>table==='guides'?{select:async()=>({data:[],error:null})}:normal(table));
 mocks.single.mockResolvedValue({data:{...set,operations:[{table:'guides',op:'update',key,fields:{title:'Valid title'}}]},error:null});
 expect(await approveContentChange(id)).toMatchObject({ok:false,message:expect.stringContaining('no longer exists')});expect(mocks.update).not.toHaveBeenCalled();
});

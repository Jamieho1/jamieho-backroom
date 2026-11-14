import {beforeEach,it,expect,vi} from 'vitest';
const m=vi.hoisted(()=>({viewer:vi.fn(),server:vi.fn(),single:vi.fn(),save:vi.fn(),info:vi.fn(),update:vi.fn(),revalidate:vi.fn(),filter:vi.fn()}));
vi.mock('@/lib/viewer',()=>({getViewer:m.viewer}));vi.mock('@/lib/supabase/server',()=>({supabaseServer:m.server}));vi.mock('next/cache',()=>({revalidatePath:m.revalidate}));
import {saveContentPhoto} from '@/app/actions/content-photo';
import {photoPath} from '@/lib/content-drafts/photo-slots';
const id='00000000-0000-4000-8000-000000001071',key='00000000-0000-4000-8000-000000001072';
const slot={slot:'screen',expected_filename:'screen.png',bucket:'project-media' as const,target:{table:'projects' as const,key,field:'screenshots' as const},caption:'Screenshot',path:null};
const set={id,status:'draft',operations:[],photo_slots:[slot]};
beforeEach(()=>{vi.resetAllMocks();m.viewer.mockResolvedValue({role:'owner',id:'owner'});m.single.mockResolvedValue({data:set,error:null});m.info.mockResolvedValue({data:{contentType:'image/png',size:100},error:null});m.save.mockResolvedValue({data:[{id}],error:null});const chain={eq:vi.fn().mockReturnThis(),filter:m.filter,select:m.save};m.filter.mockReturnValue(chain);m.update.mockReturnValue(chain);m.server.mockResolvedValue({from:()=>({select:()=>({eq:()=>({eq:()=>({maybeSingle:m.single})})}),update:m.update}),storage:{from:()=>({info:m.info})}});});
it('only the owner may attach a verified object and the photo change uses a compare-and-set',async()=>{
 expect(await saveContentPhoto(id,'screen',photoPath(id,slot))).toMatchObject({ok:true});expect(m.info).toHaveBeenCalledWith(photoPath(id,slot));expect(m.update).toHaveBeenCalledWith({photo_slots:[{...slot,path:photoPath(id,slot)}]});expect(m.filter).toHaveBeenCalledWith('photo_slots','eq',JSON.stringify([slot]));expect(m.revalidate).toHaveBeenCalledWith('/manage/review');
});
it('visitors and members cause no database or Storage reads',async()=>{
 for(const role of ['anonymous','member']){m.viewer.mockResolvedValue({role,id:'other'});expect((await saveContentPhoto(id,'screen',photoPath(id,slot))).ok).toBe(false);}expect(m.server).not.toHaveBeenCalled();expect(m.info).not.toHaveBeenCalled();
});
it('forged paths, missing uploads and changed sessions cannot mutate the pending set',async()=>{
 expect((await saveContentPhoto(id,'screen','elsewhere.png')).ok).toBe(false);expect(m.info).not.toHaveBeenCalled();m.info.mockResolvedValueOnce({data:null,error:{message:'missing'}});expect((await saveContentPhoto(id,'screen',photoPath(id,slot))).ok).toBe(false);
 m.viewer.mockResolvedValueOnce({role:'owner',id:'owner'}).mockResolvedValueOnce({role:'member',id:'other'});expect((await saveContentPhoto(id,'screen',photoPath(id,slot))).ok).toBe(false);expect(m.update).not.toHaveBeenCalled();
});
it('failed or concurrent slot saves keep a clear retry message and do not refresh',async()=>{
 m.save.mockResolvedValue({data:[],error:null});const result=await saveContentPhoto(id,'screen',photoPath(id,slot));expect(result.ok).toBe(false);expect(result.message).toMatch(/changed/);expect(m.revalidate).not.toHaveBeenCalled();
});

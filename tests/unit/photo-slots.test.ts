import {it,expect,vi} from 'vitest';
import type {SupabaseClient} from '@supabase/supabase-js';
import {parsePhotoSlots,photoPath,photoUrl,slotsComplete,validatePhotoFile} from '@/lib/content-drafts/photo-slots';
import {parsePhotoSet,withPhotoOperations,checkSlotObject} from '@/lib/content-drafts/photo-server';
const id='00000000-0000-4000-8000-000000001071',key='00000000-0000-4000-8000-000000001072';
const slot={slot:'screen',expected_filename:'project.png',bucket:'project-media' as const,target:{table:'projects' as const,key,field:'screenshots' as const},caption:'Project screenshot',path:null as string|null};
it('validates strict target/bucket/filename/path/caption and unique slot names',()=>{
 expect(parsePhotoSlots([slot],id)).toEqual([slot]);expect(slotsComplete([slot])).toBe(false);
 const ready={...slot,path:photoPath(id,slot)};expect(slotsComplete(parsePhotoSlots([ready],id))).toBe(true);
 for(const value of [{...slot,bucket:'other'},{...slot,target:{...slot.target,table:'profiles'}},{...slot,target:{...slot.target,field:'body'}},{...slot,expected_filename:'../project.png'},{...slot,expected_filename:'trailing-.png'},{...slot,expected_filename:'two--dashes.png'},{...slot,expected_filename:'x'.repeat(61)+'.png'},{...slot,caption:''},{...slot,path:'https://example.test/other.png'},{...slot,extra:true}])expect(()=>parsePhotoSlots([value],id)).toThrow();
 expect(()=>parsePhotoSlots([slot,slot],id)).toThrow(/unique/);expect(()=>parsePhotoSlots([slot],'invalid')).toThrow();expect(()=>parsePhotoSet([],[],id)).toThrow();expect(parsePhotoSet([],[slot],id).operations).toEqual([]);
});
it('reuses uploader type/5 MB rules and requires the exact expected filename',()=>{
 const file={name:'project.png',type:'image/png',size:5242880};expect(validatePhotoFile(file,slot)).toBeNull();
 expect(validatePhotoFile({...file,size:5242881},slot)).toContain('5 MB');expect(validatePhotoFile({...file,type:'image/svg+xml'},slot)).toContain('PNG');expect(validatePhotoFile({...file,name:'wrong.png'},slot)).toContain('exactly project.png');expect(validatePhotoFile({...file,type:'image/gif'},slot)).toContain('Pictures');
});
it('appends resolved URLs to post-operation screenshots and never mutates live objects',async()=>{
 const row={id:key,slug:'example',name:'Example',tagline:'',body:'',tags:[],screenshots:['https://example.test/old.png'],url:'',public:true,featured:false,sort:100};const before=structuredClone(row);
 const sb={from:()=>({select:async()=>({data:[row],error:null})})} as unknown as SupabaseClient;
 const result=await withPhotoOperations(sb,[],[{...slot,path:photoPath(id,slot)}]);expect(result).toEqual([{table:'projects',op:'update',key,fields:{screenshots:['https://example.test/old.png',photoUrl(photoPath(id,slot))]}}]);expect(row).toEqual(before);
 const missing={from:()=>({select:async()=>({data:[],error:null})})} as unknown as SupabaseClient;await expect(withPhotoOperations(missing,[],[slot])).rejects.toThrow(/no longer exists/);
 const from=vi.fn();expect(await withPhotoOperations({from} as unknown as SupabaseClient,[],[])).toEqual([]);expect(from).not.toHaveBeenCalled();
});
it('checks Storage object metadata before accepting an uploaded path',async()=>{
 const info=vi.fn().mockResolvedValue({data:{contentType:'image/png',size:100},error:null});const sb={storage:{from:()=>({info})}} as unknown as SupabaseClient;
 await expect(checkSlotObject(sb,slot)).rejects.toThrow(/Upload/);await checkSlotObject(sb,{...slot,path:photoPath(id,slot)});expect(info).toHaveBeenCalledWith(photoPath(id,slot));
 for(const data of [null,{contentType:'image/svg+xml',size:2},{contentType:'image/png',size:5242881},{contentType:'image/png'}]){info.mockResolvedValueOnce({data,error:null});await expect(checkSlotObject(sb,{...slot,path:photoPath(id,slot)})).rejects.toThrow();}
});

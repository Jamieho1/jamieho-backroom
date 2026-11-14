import type {SupabaseClient} from '@supabase/supabase-js';
import {IMAGE_MAX_BYTES} from '@/lib/article-images';
import {parsePhotoSlots,photoUrl,PHOTO_TYPES,type PhotoSlot} from './photo-slots';
import {validateOperations,type ContentOperation} from './allowlist';
import {loadPublishingPreview} from './publishing-overlay';
export function parsePhotoSet(operations:unknown,raw:unknown,id:string){
 const slots=parsePhotoSlots(raw,id);
 if(Array.isArray(operations)&&operations.length===0&&slots.length)return {operations:[] as ContentOperation[],slots};
 const parsed=validateOperations(operations);if(!parsed.ok)throw Error(parsed.message);
 return {operations:parsed.operations,slots};
}
/** Owner-gated callers only. Resolve append semantics against the post-operation project snapshot. */
export async function withPhotoOperations(sb:SupabaseClient,operations:ContentOperation[],slots:PhotoSlot[]):Promise<ContentOperation[]>{
 if(!slots.length)return operations;
 let rows=(await loadPublishingPreview(sb,operations)).projects;
 if(!rows){const result=await sb.from('projects').select('*');if(result.error)throw Error('Could not load screenshot targets.');rows=result.data??[];}
 const extra:ContentOperation[]=[];
 for(const key of new Set(slots.map(s=>s.target.key))){
  const row=rows?.find(r=>r.id===key);if(!row)throw Error('Screenshot target project no longer exists.');
  const targetSlots=slots.filter(s=>s.target.key===key);
  const screenshots=[...new Set([...row.screenshots,...targetSlots.flatMap(s=>s.path?[photoUrl(s.path)]:[])])];
  if(screenshots.length+targetSlots.filter(s=>s.path===null).length>6)throw Error('A project can have at most 6 screenshots.');
  const parsed=validateOperations([{table:'projects',op:'update',key,fields:{screenshots}}]);if(!parsed.ok)throw Error(parsed.message);extra.push(...parsed.operations);
 }
 return [...operations,...extra];
}
export async function checkSlotObject(sb:SupabaseClient,slot:PhotoSlot){
 if(!slot.path)throw Error(`Upload ${slot.expected_filename} before approving.`);
 const {data,error}=await sb.storage.from(slot.bucket).info(slot.path);
 if(error||!data)throw Error(`Could not verify ${slot.expected_filename}. Upload it again.`);
 if(typeof data.contentType!=='string'||!PHOTO_TYPES.includes(data.contentType)||typeof data.size!=='number'||!Number.isFinite(data.size)||data.size>IMAGE_MAX_BYTES||data.size<0)throw Error('Uploaded picture must be PNG, JPG or WebP and at most 5 MB.');
}

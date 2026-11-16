import type {SupabaseClient} from '@supabase/supabase-js';
import {aboutPhotoSchema,type AboutPhoto} from '@/lib/home-content-schema';
import type {ContentOperation} from './allowlist';
/** Only owner-verified callers may supply snapshots/operations to this overlay. */
export function overlayAboutPhotos(live:AboutPhoto[],operations:ContentOperation[]):AboutPhoto[]{
 const rows=new Map(live.map(r=>[r.id,{...r}]));
 for(const op of operations){
  if(op.table!=='about_photos')continue;
  const before=rows.get(op.key);
  if(op.op==='insert'&&before)throw Error('About photo key already exists.');
  if(op.op!=='insert'&&!before)throw Error('About photo target no longer exists.');
  if(op.op==='delete'){rows.delete(op.key);continue;}
  const row=aboutPhotoSchema.parse({...(before?{id:before.id,path:before.path,caption:before.caption,alt:before.alt,sort:before.sort,centre:before.centre,public:before.public}:{id:op.key,caption:'',sort:100,centre:false,public:false}),...op.fields});
  rows.set(op.key,{...row,draftChanged:true});
  if([...rows.values()].filter(r=>r.centre).length>1)throw Error('Only one About photo can be the centre.');
 }
 return [...rows.values()];
}
export async function loadAboutPhotosPreview(sb:SupabaseClient,operations:ContentOperation[]):Promise<AboutPhoto[]|undefined>{
 if(!operations.some(op=>op.table==='about_photos'))return undefined;
 const {data,error}=await sb.from('about_photos').select('id,path,caption,alt,sort,centre,public');
 if(error)throw Error('Could not load About photo targets.');
 return overlayAboutPhotos(data??[],operations);
}

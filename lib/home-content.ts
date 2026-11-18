import {createClient} from '@supabase/supabase-js';
import {readSupabaseEnv} from '@/lib/env';
import {SELECT,type ExperienceRow} from '@/lib/experience';
import type {AboutPhoto} from '@/lib/home-content-schema';
import type {HomePreview} from '@/lib/content-drafts/types';
export function publicAboutPhotos(rows:AboutPhoto[]):AboutPhoto[]{
 return rows.filter(r=>r.public).map(r=>({...r})).sort((a,b)=>Number(b.centre)-Number(a.centre)||a.sort-b.sort||a.id.localeCompare(b.id));
}
/** Stops follow the owner-editable experience_items.sort (ascending, then UUID); freeform CV dates never decide the order. */
export function publicJourneyStops(rows:ExperienceRow[]):ExperienceRow[]{
 return rows.filter(r=>r.public&&r.show_on_journey).map(r=>({...r,experience_bullets:(r.experience_bullets??[]).filter(b=>b.public&&b.text.trim()).sort((a,b)=>a.sort-b.sort||a.id.localeCompare(b.id)).slice(0,3)}))
 .sort((a,b)=>a.sort-b.sort||a.id.localeCompare(b.id));
}
/** Cookie-free public reads; explicit snapshots are provided only by the owner preview gate. */
export async function getAboutPhotos(preview?:HomePreview|null):Promise<AboutPhoto[]>{
 if(preview?.aboutPhotos)return publicAboutPhotos(preview.aboutPhotos);
 const env=readSupabaseEnv();if(!env)return [];
 const sb=createClient(env.url,env.anonKey,{auth:{persistSession:false}});
 const {data,error}=await sb.from('about_photos').select('id,path,caption,alt,sort,centre,public').eq('public',true);
 if(error)throw Error('Could not load About photos.');return publicAboutPhotos(data??[]);
}
export async function getJourneyStops(preview?:HomePreview|null):Promise<ExperienceRow[]>{
 if(preview?.experience)return publicJourneyStops(preview.experience);
 const env=readSupabaseEnv();if(!env)return [];
 const sb=createClient(env.url,env.anonKey,{auth:{persistSession:false}});
 const {data,error}=await sb.from('experience_items').select(SELECT+', show_on_journey, journey_icon').eq('public',true).eq('show_on_journey',true);
 if(error)throw Error('Could not load journey stops.');return publicJourneyStops((data??[]) as unknown as ExperienceRow[]);
}

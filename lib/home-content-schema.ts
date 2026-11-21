import {z} from 'zod';
/** Public deployment URL, shared with private.draft_media_url and checked in DB tests. */
export const MEDIA_PUBLIC_BASE='https://lhacrrnwddvpawsreamk.supabase.co/storage/v1/object/public/';
export const JOURNEY_ICONS=['graduation-cap','microscope','neural-network','streams-plug','code','heart-hands','rocket','briefcase'] as const;
const text=(max:number)=>z.string().refine(s=>!s.includes('\0')&&Array.from(s).length<=max);
export const photoFields={
 path:z.string().max(240).regex(/^[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*\.(?:png|jpg|webp)$/),
 caption:text(240),alt:text(240).refine(s=>!!s.trim(),'Describe the photo.'),
 sort:z.number().int().min(-2147483648).max(2147483647),centre:z.boolean(),public:z.boolean(),
};
/** Optional journey-stop photo: empty clears it; otherwise the same home-media path rule as About photos. */
export const journeyPhotoPath=z.union([z.literal(''),photoFields.path]);
export const aboutPhotoSchema=z.object({id:z.uuid(),...photoFields}).strict();
export type AboutPhoto=z.infer<typeof aboutPhotoSchema>&{draftChanged?:boolean};
export const homePhotoUrl=(path:string)=>MEDIA_PUBLIC_BASE+'home-media/'+path;

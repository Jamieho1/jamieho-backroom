import {z} from 'zod';
import {imageProblem,imageName} from '@/lib/article-images';
// Public deployment endpoint, not a credential. SQL uses the same canonical media URL.
export const PHOTO_PUBLIC_BASE='https://lhacrrnwddvpawsreamk.supabase.co/storage/v1/object/public/project-media/';
export const PHOTO_TYPES=['image/png','image/jpeg','image/webp'];
export const photoSlotSchema=z.object({
 slot:z.string().regex(/^[a-z0-9][a-z0-9-]{0,59}$/),
 expected_filename:z.string().max(65).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*\.(png|jpg|webp)$/).refine(name=>imageName(name)===name),
 bucket:z.literal('project-media'),
 target:z.object({table:z.literal('projects'),key:z.uuid().transform(s=>s.toLowerCase()),field:z.literal('screenshots')}).strict(),
 caption:z.string().trim().min(1).max(240).refine(s=>!s.includes('\0')),
 path:z.string().max(240).nullable(),
}).strict();
export type PhotoSlot=z.infer<typeof photoSlotSchema>;
export const photoPath=(id:string,slot:Pick<PhotoSlot,'slot'|'expected_filename'>)=>`drafts/${id.toLowerCase()}/${slot.slot}/${slot.expected_filename}`;
export const photoUrl=(path:string)=>PHOTO_PUBLIC_BASE+path;
export const slotsComplete=(slots:PhotoSlot[])=>slots.every(s=>s.path!==null);
export function parsePhotoSlots(raw:unknown,id:string):PhotoSlot[]{
 const parsed=z.array(photoSlotSchema).max(6).safeParse(raw);
 if(!parsed.success)throw Error('Invalid photo slots: use project-media screenshot slots, a caption and a lowercase PNG/JPG/WebP filename.');
 if(parsed.data.length&&!z.uuid().safeParse(id).success)throw Error('Invalid photo change-set ID.');
 const names=new Set<string>();
 for(const slot of parsed.data){if(names.has(slot.slot))throw Error('Photo slot names must be unique.');names.add(slot.slot);if(slot.path!==null&&slot.path!==photoPath(id,slot))throw Error('Photo path must match this change set, slot and expected filename.');}
 return parsed.data;
}
export function validatePhotoFile(file:{name:string;type:string;size:number},slot:PhotoSlot):string|null{
 const problem=imageProblem(file);if(problem)return problem;
 if(!PHOTO_TYPES.includes(file.type))return 'Project screenshots use PNG, JPG or WebP.';
 if(file.name!==slot.expected_filename)return `Choose exactly ${slot.expected_filename}.`;
 return null;
}

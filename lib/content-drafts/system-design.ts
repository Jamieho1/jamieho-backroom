import {z} from 'zod';
import {questionFields,SD_TABLE,SD_RESERVED_SLUGS,SD_LIST_HREF} from '@/lib/interview/system-design';

/** S1 Content Drafts entry for system-design questions. Mirrors private.apply_system_design_draft; delete only unpublishes. */
const fields={...questionFields,slug:questionFields.slug.refine(s=>!SD_RESERVED_SLUGS.some(r=>r===s),'That slug is reserved for the section lists.')};
export const SD_ALLOWLIST={
 system_design_questions:{key:z.uuid(),fields,operations:['insert','update','delete'] as const,routes:[SD_LIST_HREF] as const},
};
export const isSystemDesignTable=(table:string):table is typeof SD_TABLE=>table===SD_TABLE;
export const systemDesignOperation=z.object({table:z.literal(SD_TABLE),op:z.enum(SD_ALLOWLIST.system_design_questions.operations),key:z.uuid(),fields:z.object(fields).partial().strict().default({})}).strict().superRefine((v,ctx)=>{
 if(v.op==='delete'){if(Object.keys(v.fields).length)ctx.addIssue({code:'custom',message:'Delete accepts no fields; it unpublishes.'});return;}
 if(!Object.keys(v.fields).length)ctx.addIssue({code:'custom',message:'Choose at least one editable field.'});
 if(v.op==='insert')for(const key of ['slug','title'])if(!(key in v.fields))ctx.addIssue({code:'custom',message:`Insert requires ${key}.`});
});

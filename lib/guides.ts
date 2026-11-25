import {z} from 'zod';
import {slugSchema,seriesPartSchema,sameSeriesPair,SERIES_PAIR_MESSAGE,articleSections} from './articles';
const https=(s:string)=>{if(!s)return true;try{return new URL(s).protocol==='https:';}catch{return false;}};
const link=z.string().max(2048).refine(https);
/** Guides (2026-11-11): evergreen resource pages under Resources, separate from post articles. */
export const MAX_HIGHLIGHTS=3;
export const guideObject=z.object({id:z.uuid(),slug:slugSchema,title:z.string().trim().min(1).max(160),summary:z.string().max(600),body:z.string().max(200000),notion_url:link,doc_url:link,cover_url:link,series_id:z.uuid().nullable(),series_part:seriesPartSchema.nullable(),audience:z.string().max(200),highlights:z.array(z.string().trim().min(1).max(80)).max(MAX_HIGHLIGHTS),exercises:z.number().int().min(0).max(999).nullable(),published:z.boolean()});
export const guideSchema=guideObject.refine(sameSeriesPair,{message:SERIES_PAIR_MESSAGE,path:['series_part']});
export type GuideEdit=z.infer<typeof guideSchema>;
export type Guide=GuideEdit&{draftChanged?:boolean;created_at:string;updated_at:string};
export type GuideCard=Pick<Guide,'id'|'slug'|'title'|'summary'|'cover_url'|'notion_url'|'doc_url'|'updated_at'|'draftChanged'>;
/** Every column: the owner editor, saves and the public guide page. */
export const GUIDE_SELECT='id,slug,title,summary,body,notion_url,doc_url,cover_url,series_id,series_part,audience,highlights,exercises,published,created_at,updated_at';
export const GUIDE_NEW_DEFAULTS={series_id:null,series_part:null,audience:'',highlights:[] as string[],exercises:null};
export const GUIDE_CARD_SELECT='id,slug,title,summary,cover_url,notion_url,doc_url,updated_at';
export const guideHref=(slug:string)=>`/guides/${encodeURIComponent(slug)}`;
export const emptyGuide=():GuideEdit=>({id:crypto.randomUUID(),slug:'',title:'',summary:'',body:'',notion_url:'',doc_url:'',cover_url:'',series_id:null,series_part:null,audience:'',highlights:[],exercises:null,published:false});
export type GuideSave={ok:true;guide:Guide}|{ok:false;message:string};

/** Chapters are the body's "## " headings (code blocks skipped). Not stored. */
export const chapterCount=(body:string)=>articleSections(body).length;

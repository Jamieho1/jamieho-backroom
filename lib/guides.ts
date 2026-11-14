import {z} from 'zod';
const https=(s:string)=>{if(!s)return true;try{return new URL(s).protocol==='https:';}catch{return false;}};
const link=z.string().max(2048).refine(https);
/** Guides (2026-11-11): evergreen resource pages under Resources, separate from post articles. */
export const guideSchema=z.object({id:z.uuid(),slug:z.string().max(80).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).refine(s=>!['manage','new','edit'].includes(s)),title:z.string().trim().min(1).max(160),summary:z.string().max(600),body:z.string().max(200000),notion_url:link,doc_url:link,cover_url:link,published:z.boolean()});
export type GuideEdit=z.infer<typeof guideSchema>;
export type Guide=GuideEdit&{draftChanged?:boolean;created_at:string;updated_at:string};
export type GuideCard=Pick<Guide,'id'|'slug'|'title'|'summary'|'cover_url'|'notion_url'|'doc_url'|'updated_at'|'draftChanged'>;
export const GUIDE_SELECT='id,slug,title,summary,body,notion_url,doc_url,cover_url,published,created_at,updated_at';
export const GUIDE_CARD_SELECT='id,slug,title,summary,cover_url,notion_url,doc_url,updated_at';
export const guideHref=(slug:string)=>`/guides/${encodeURIComponent(slug)}`;
export const emptyGuide=():GuideEdit=>({id:crypto.randomUUID(),slug:'',title:'',summary:'',body:'',notion_url:'',doc_url:'',cover_url:'',published:false});
export type GuideSave={ok:true;guide:Guide}|{ok:false;message:string};

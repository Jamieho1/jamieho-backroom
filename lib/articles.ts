import {z} from 'zod';
export const PLATFORM_LABEL={youtube:'YouTube',instagram:'Instagram',xiaohongshu:'RedNote',other:'Other'} as const;
export const CATEGORY_LABEL={ai:'AI',career:'Career',productivity:'Productivity & Tools',building:'Building in Public'} as const;
export type Category=keyof typeof CATEGORY_LABEL;
export type Platform=keyof typeof PLATFORM_LABEL;
const https=(s:string)=>{if(!s)return true;try{return new URL(s).protocol==='https:';}catch{return false;}};
/** Slug rules shared by articles, guides and series (reserved words are the owner-editor routes). */
export const slugSchema=z.string().max(80).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).refine(s=>!['manage','new','edit'].includes(s));
/** A series part number: 1-50. Series membership is both-or-neither (series_id and series_part together). */
export const seriesPartSchema=z.number().int().min(1).max(50);
export const sameSeriesPair=(r:{series_id:string|null;series_part:number|null})=>(r.series_id===null)===(r.series_part===null);
export const SERIES_PAIR_MESSAGE='Choose a series and a part number together, or neither.';
/** Post code from the last slide: uppercase letters and digits (e.g. MCP101); stored uppercase, null when unset. */
export const codeSchema=z.string().regex(/^[A-Z0-9]{1,16}$/);
export const normalizeCode=(raw:string):string|null=>{const c=raw.trim().toUpperCase();return c?c:null;};
export const MAX_SLIDES=20;
const slideUrl=z.string().max(2048).refine(s=>s!==''&&https(s),'Slides must be HTTPS image URLs.');
export const articleObject=z.object({id:z.uuid(),slug:slugSchema,title:z.string().trim().min(1).max(160),summary:z.string().max(600),body:z.string().max(200000),platform:z.enum(['youtube','instagram','xiaohongshu','other']),category:z.enum(['ai','career','productivity','building']),source_url:z.string().max(2048).refine(https),cover_url:z.string().max(2048).refine(https),project_id:z.string().max(80).nullable(),series_id:z.uuid().nullable(),series_part:seriesPartSchema.nullable(),code:codeSchema.nullable(),takeaway:z.string().max(160),slides:z.array(slideUrl).max(MAX_SLIDES),published:z.boolean()});
export const articleSchema=articleObject.refine(sameSeriesPair,{message:SERIES_PAIR_MESSAGE,path:['series_part']});
export type ArticleEdit=z.infer<typeof articleSchema>;
export type Article=ArticleEdit&{draftChanged?:boolean;created_at:string;updated_at:string};
export type ArticleCard=Pick<Article,'id'|'slug'|'title'|'summary'|'platform'|'category'|'cover_url'|'project_id'|'created_at'|'draftChanged'>;
/** Every column: the owner editor, saves and the public post page. (The content-hub migration is applied live.) */
export const ARTICLE_SELECT='id,slug,title,summary,body,platform,category,source_url,cover_url,project_id,series_id,series_part,code,takeaway,slides,published,created_at,updated_at';
/** Defaults for the content-hub fields, for fixtures and rows built before they existed. */
export const ARTICLE_NEW_DEFAULTS={series_id:null,series_part:null,code:null,takeaway:'',slides:[] as string[]};
export const CARD_SELECT='id,slug,title,summary,platform,category,cover_url,project_id,created_at';
export const articleHref=(slug:string)=>`/articles/${encodeURIComponent(slug)}`;
export const emptyArticle=():ArticleEdit=>({id:crypto.randomUUID(),slug:'',title:'',summary:'',body:'',platform:'youtube',category:'ai',source_url:'',cover_url:'',project_id:null,series_id:null,series_part:null,code:null,takeaway:'',slides:[],published:false});
export type ArticleSave={ok:true;article:Article}|{ok:false;message:string};
export const articleDate=(iso:string)=>{const d=new Date(iso);return Number.isNaN(d.getTime())?'':new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'Europe/London'}).format(d);};

/** A YouTube video id from a watch / youtu.be / shorts / embed link, or null. */
export function youtubeId(url:string):string|null{
 try{const u=new URL(url);const host=u.hostname.replace(/^www\.|^m\./,'');
  let id:string|null=null;
  if(host==='youtu.be')id=u.pathname.slice(1).split('/')[0];
  else if(host==='youtube.com'||host==='youtube-nocookie.com'){id=u.searchParams.get('v')??(u.pathname.match(/^\/(?:shorts|embed|live)\/([^/?]+)/)?.[1]??null);}
  return id&&/^[\w-]{6,20}$/.test(id)?id:null;
 }catch{return null;}
}

/** Heading text → anchor id (shared by the renderer and the "On this page" list). */
export const sectionId=(text:string)=>text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu,'-').replace(/^-|-$/g,'').slice(0,80);
/** Markdown inline → the plain text a reader sees (links, emphasis and code marks removed). */
export const plainText=(md:string)=>md.replace(/!\[[^\]]*\]\([^)]*\)/g,'').replace(/\[([^\]]*)\]\([^)]*\)/g,'$1').replace(/[*_`~]/g,'').trim();
/** The article's ## sections, in order, skipping code blocks. */
export function articleSections(md:string):{id:string;text:string}[]{
 const out:{id:string;text:string}[]=[];let fence=false;
 for(const line of md.split('\n')){
  if(/^\s*(```|~~~)/.test(line)){fence=!fence;continue;}
  const m=!fence&&/^##\s+(.+?)\s*#*\s*$/.exec(line);
  if(m){const text=plainText(m[1]);if(text)out.push({id:sectionId(text),text});}
 }
 return out;
}
/** Headings that close an article (links, sources, further reading) are styled as end matter. */
export const isEndMatter=(text:string)=>/^(links|sources|references|resources|additional resources|further reading|links (and|&) sources)\b/i.test(text.trim());
/** Fenced-code options: ```text title="My prompt" collapsed */
export function codeMeta(meta:string|undefined):{title:string;collapsed:boolean}{
 const m=meta??'';
 return {title:/title="([^"]{1,120})"/.exec(m)?.[1]??'',collapsed:/(^|\s)collapsed(\s|$)/.test(m)};
}

/** Read time from the body: words / 220, rounded up, at least one minute. Not stored. */
export const wordCount=(md:string)=>md.trim().split(/\s+/).filter(Boolean).length;
export const readMinutes=(md:string)=>Math.max(1,Math.ceil(wordCount(md)/220));

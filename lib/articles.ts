import {z} from 'zod';
export const PLATFORM_LABEL={youtube:'YouTube',instagram:'Instagram',xiaohongshu:'RedNote',other:'Other'} as const;
export const CATEGORY_LABEL={ai:'AI',career:'Career',productivity:'Productivity & Tools',building:'Building in Public'} as const;
export type Category=keyof typeof CATEGORY_LABEL;
export type Platform=keyof typeof PLATFORM_LABEL;
const https=(s:string)=>{if(!s)return true;try{return new URL(s).protocol==='https:';}catch{return false;}};
export const articleSchema=z.object({id:z.uuid(),slug:z.string().max(80).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).refine(s=>!['manage','new','edit'].includes(s)),title:z.string().trim().min(1).max(160),summary:z.string().max(600),body:z.string().max(200000),platform:z.enum(['youtube','instagram','xiaohongshu','other']),category:z.enum(['ai','career','productivity','building']),source_url:z.string().max(2048).refine(https),cover_url:z.string().max(2048).refine(https),project_id:z.string().max(80).nullable(),published:z.boolean()});
export type ArticleEdit=z.infer<typeof articleSchema>;
export type Article=ArticleEdit&{created_at:string;updated_at:string};
export type ArticleCard=Pick<Article,'id'|'slug'|'title'|'summary'|'platform'|'category'|'cover_url'|'project_id'|'created_at'>;
export const ARTICLE_SELECT='id,slug,title,summary,body,platform,category,source_url,cover_url,project_id,published,created_at,updated_at';
export const CARD_SELECT='id,slug,title,summary,platform,category,cover_url,project_id,created_at';
export const articleHref=(slug:string)=>`/articles/${encodeURIComponent(slug)}`;
export const emptyArticle=():ArticleEdit=>({id:crypto.randomUUID(),slug:'',title:'',summary:'',body:'',platform:'youtube',category:'ai',source_url:'',cover_url:'',project_id:null,published:false});
export type ArticleSave={ok:true;article:Article}|{ok:false;message:string};
export const articleDate=(iso:string)=>{const d=new Date(iso);return Number.isNaN(d.getTime())?'':new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'Europe/London'}).format(d);};

/** "If you liked this": same category first, then the newest others. */
export function relatedArticles(all:ArticleCard[],current:Pick<ArticleCard,'id'|'category'>,n=3):ArticleCard[]{
 const others=all.filter(a=>a.id!==current.id);
 return [...others.filter(a=>a.category===current.category),...others.filter(a=>a.category!==current.category)].slice(0,n);
}

/** A YouTube video id from a watch / youtu.be / shorts / embed link, or null. */
export function youtubeId(url:string):string|null{
 try{const u=new URL(url);const host=u.hostname.replace(/^www\.|^m\./,'');
  let id:string|null=null;
  if(host==='youtu.be')id=u.pathname.slice(1).split('/')[0];
  else if(host==='youtube.com'||host==='youtube-nocookie.com'){id=u.searchParams.get('v')??(u.pathname.match(/^\/(?:shorts|embed|live)\/([^/?]+)/)?.[1]??null);}
  return id&&/^[\w-]{6,20}$/.test(id)?id:null;
 }catch{return null;}
}

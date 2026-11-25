import {cleanCode} from '@/lib/content-hub';
import {articleHref} from '@/lib/articles';
import {getPublishedCodes,getSlugByCode} from '@/lib/articles-public';

/** Short links for the code on a post's last slide: /p/MCP101 (any case) opens the post. Known codes are pre-rendered. */
export const revalidate=300;
export async function generateStaticParams(){
 try{return (await getPublishedCodes()).map(code=>({code}));}catch{return [];}
}
const go=(status:number,location:string)=>new Response(null,{status,headers:{Location:location}});
export async function GET(_request:Request,{params}:{params:Promise<{code:string}>}){
 const raw=(await params).code;
 const code=cleanCode(raw);
 if(!code)return go(307,`/content?code=${encodeURIComponent(raw.slice(0,32))}`);
 const slug=await getSlugByCode(code);
 // A known code is permanent (308). An unknown one is temporary: the post may be published later.
 return slug?go(308,articleHref(slug)):go(307,`/content?code=${code}`);
}

import {getHomePreview} from "@/lib/content-drafts/preview";
import {PagePreview} from "@/components/content-drafts/page-preview";
import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {HubFrame} from '@/components/content/hub-frame';
import {PostDetail} from '@/components/content/post-detail';
import {getPublicArticle} from '@/lib/articles-public';
import {getHubData} from '@/lib/content-hub-data';
import {getSections} from '@/lib/sections';
import {getProjectApps} from '@/lib/projects';
import {socialLinks} from '@/lib/social';
import {articleHref} from '@/lib/articles';
import {nextPart,relatedPosts} from '@/lib/post-view';
import '../../articles.css';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 try{const article=await getPublicArticle((await params).slug,await getHomePreview());return article?{title:`${article.title} · Jamie Ho`,description:article.summary,openGraph:{title:article.title,description:article.summary,type:'article',...(article.cover_url?{images:[article.cover_url]}:{})}}:{title:'Article not found · Jamie Ho',robots:{index:false}};}catch{return {title:'Articles · Jamie Ho'};}
}
export default async function ArticlePage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 const preview=await getHomePreview();
 let article;
 try{article=await getPublicArticle(slug,preview);}catch{return <main className="page"><p role="alert">Can&apos;t load this article right now.</p><a href={articleHref(slug)}>Try again</a></main>;}
 if(!article)notFound();
 /* The series, the next part and More like this are optional: if they cannot be read the post still renders. */
 const [data,sections,apps]=await Promise.all([getHubData(preview).catch(()=>null),getSections(preview),article.project_id?getProjectApps().catch(()=>[]):Promise.resolve([])]);
 const project=article.project_id?apps.find(p=>p.id===article.project_id):undefined;
 const series=data?.series.find(s=>s.id===article.series_id)??null;
 return <><PagePreview preview={preview} page={article.published?`/articles/${article.slug}`:"/content"}/>
  <HubFrame socials={socialLinks(sections.contact.body)}><PostDetail article={article} series={series} allSeries={data?.series??[]} next={series&&data?nextPart(article,data.posts,data.guides):null} related={data?relatedPosts(data.posts,article):[]} project={project} unpublished={!!article.draftChanged&&!article.published}/></HubFrame></>;
}
